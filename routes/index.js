var _ = require('lodash'),
    FB = require('fb'),
    MongoDBClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    routes = {},
    config;

routes.home = function (req, res) {
    res.render('home',
        {
            title: 'myJourney',
            pageId: 'Home',
            facebookUrl: 'https://www.facebook.com/dialog/oauth?scope=' + config.facebookScope.join(',') +
                '&client_id=' + config.appFacebookId + '&redirect_uri=http://' + req.headers.host + '/api/storeAccessToken/'
        }
    );
};

routes.create = function (req, res) {
    res.render('create',
        {
            title: 'Create myJourney',
            pageId: 'Create'
        }
    );
};

routes.map = function (req, res) {
    res.render('map',
        {
            journeyTitle: '',
            title: 'myJourney',
            pageId: 'Map',
            shareId: req.params.id
        }
    );
};

routes.storeAccessToken = function (req, res) {
    var code = req.query.code;
    if (code) {
        FB.api('oauth/access_token', {
            client_id: '648327631897525',
            client_secret: '72736a58eb7bdb18d44f6cd325f651d3',
            redirect_uri: 'http://' + req.headers.host + '/api/storeAccessToken/',
            code: code
        }, function (fbRes) {
            if (!fbRes || fbRes.error) {
                console.log(!fbRes ? 'error occurred' : fbRes.error);
                return res.send(500, "Failed to obtain access token: " + JSON.stringify(fbRes.error));
            }
            req.session.fbAccessToken = fbRes.access_token;
            console.log("Got access token");
            res.redirect("/create");
        });
    }
};

function fetchUserPhotos(uid, res, startTime, endTime, tripname) {
    FB.api(uid + '', { fields: ['id', 'name', 'photos.since(' + startTime + ').until(' + endTime + ').limit(1000)', 'posts.since(' + startTime + ').until(' + endTime + ').limit(1000)']}, function (fbRes) {
        if (!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
            return res.send(500, "Failed to request photos");
        }

        var mapData = {
            type: "FeatureCollection",
            tripname: tripname,
            features: []
        };

        // Photos
        if (fbRes.photos) {
            mapData.features = extractResources(fbRes.photos.data);
        }

        if (fbRes.posts) {
            mapData.features = mapData.features.concat(extractResources(fbRes.posts.data));
        }

        // Posts
        mapData.features = _.sortBy(mapData.features, function (data) {
            return data.properties.created_time;
        });

        storeMapData(mapData, function () {
            // TODO Remove this is just during migration from api/images -> api/createJourney once migrated we only require the redirect route
            if (startTime) {
                res.redirect("map/" + mapData._id);
            }
            else {
                res.send(mapData);
            }
        });
    });
}

function extractResources(resources) {
    return _.filter(_.map(resources, function (resource) {
        if (resource.place && resource.place.location && resource.place.location.longitude) {

            var firstImage = _.first(resource.images);

            // Only include the first image if it actually has the required values
            if (firstImage && (!firstImage.width || !firstImage.height || !firstImage.source)) {
                firstImage = null;
            }

            return  {
                type: "Feature",
                properties: {
                    title: resource.message || resource.story || resource.name,
                    image: firstImage,
                    created_time: resource.created_time
                },

                geometry: {
                    type: "Point",
                    coordinates: [
                        resource.place.location.longitude,
                        resource.place.location.latitude
                    ]
                }
            };
        }
    }));
}

function storeMapData(mapData, callback) {
    MongoDBClient.connect(config.mongoDBUrl, function (err, db) {
        if (err) throw err;
        var collection = db.collection('journeys');
        collection.insert(mapData, function (err, docs) {
            if (err) throw err;
            console.log(JSON.stringify(docs[0]._id));
        });
        callback();
    });
}

routes.createJourney = function (req, res) {
    var accessToken = req.session.fbAccessToken;

    var startTimeStr = req.query.starttime;
    var endTimeStr = req.query.endtime;
    var tripname = req.query.tripname;

    // Remove once urls updated
    if (!startTimeStr) startTimeStr = "1 Jan 2014";
    if (!endTimeStr) endTimeStr = "1 Jan 2015";
    if (!tripname) tripname = "My journey";


    if (!startTimeStr || !endTimeStr || !tripname) {
        return res.send(500, "No starttime, endtime or tripname defined");
    }

    var startTime = new Date(startTimeStr).getTime();
    var endTime = new Date(endTimeStr).getTime();

    if (startTime == NaN || endTime == NaN) {
        return res.send(500, "starttime or endtime is not valid");
    }

    // Convert to unix TS
    startTime /= 1000;
    endTime /= 1000;

    if (!accessToken) {
        return res.send(500, "Access token not set in session, please login first");
    }

    res.set("Content-Type", "application/json");
    FB.setAccessToken(accessToken);

    FB.api('fql', { q: 'select uid from user where uid = me()' }, function (fbRes) {
        if (!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : res.error);
            return res.send(500, "Failed to get uid");
        }
        console.log(JSON.stringify(fbRes.data[0].uid));
        fetchUserPhotos(fbRes.data[0].uid, res, startTime, endTime, tripname);
    });
};

routes.journey = function (req, res) {
    res.set("Content-Type", "application/json");
    MongoDBClient.connect(config.mongoDBUrl, function (err, db) {
        if (err) return res.send(500, err.toString());
        var journeys = db.collection('journeys');
        var journeyId = req.params.id;
        journeys.find({'_id': new ObjectID(journeyId)}).toArray(function (err, results) {
            if (err || results.length !== 1) res.send(404, 'Error while getting journey with id ' + journeyId + ' results size is ' + results.length + (err || ''));
            db.close();
            res.send(results[0]);
        });
    });
};

exports.createRoutes = function (configuration) {
    config = configuration;
    return routes;
};