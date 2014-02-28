var _ = require('lodash'),
    FB = require('fb'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    routes = {},
    config;

routes.home = function (req, res) {
    console.log('home baby');
    res.render('home',
        {
            title: 'myJourney',
            pageId: 'Home',
            facebookUrl: 'https://www.facebook.com/dialog/oauth?scope=user_photos,user_status&client_id=648327631897525&redirect_uri=http://' + req.headers.host + '/storeAccessToken/'
        }
    );
};

routes.create = function (req, res) {
    res.render('create',
        {
            title: 'myJourney',
            pageId: 'Create'
        }
    );
};

routes.map = function (req, res) {
    res.render('map',
        {
            journeyTitle: '',
            title: 'myJourney : ',
            pageId: 'Map'
        }
    );
};


routes.storeAccessToken = function (req, res) {
    var code = req.query.code;

    if (code) {
        FB.api('oauth/access_token', {
            client_id: '648327631897525',
            client_secret: '72736a58eb7bdb18d44f6cd325f651d3',
            redirect_uri: 'http://' + req.headers.host + '/storeAccessToken/',
            code: code
        }, function (fbRes) {
            if (!fbRes || fbRes.error) {
                console.log(!fbRes ? 'error occurred' : fbRes.error);

                return res.send(500, "Failed to obtain access token: " + JSON.stringify(fbRes.error));
            }

            var accessToken = fbRes.access_token;


            req.session.fbAccessToken = accessToken;

            //var expires = fbRes.expires ? fbRes.expires : 0;
            console.log("Got access token");
            res.redirect("/create");
        });

    }
};

function fetchUserPhotos(uid, res, startTime, endTime, tripname) {

    //until(' + toTimestamp + ').since(' + fromTimestamp + ')
    FB.api(uid + '', { fields: ['id', 'name', 'photos.since(' + startTime + ').until(' + endTime + ').limit(1000)', 'statuses.since(' + startTime + ').until(' + endTime + ').limit(1000)']}, function (fbRes) {
        if (!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
            return res.send(500, "Failed to request photos");
        }

        var mapData = {
            type: "FeatureCollection",
            tripname: tripname,
            features: []
        };


        if (fbRes.photos) {
            mapData.features = _.filter(_.map(fbRes.photos.data, function (photo) {

                if (photo.place && photo.place.location && photo.place.location.longitude) {
                    return  {
                        type: "Feature",
                        properties: {
                            title: photo.name || photo.message,
                            image: _.first(photo.images),
                            created_time: photo.created_time || photo.updated_time
                        },

                        geometry: {
                            type: "Point",
                            coordinates: [
                                photo.place.location.longitude,
                                photo.place.location.latitude
                            ]
                        }
                    };
                }
            }));


            mapData.features = _.sortBy(mapData.features, function(data) {
                return data.properties.created_time;
            });
        }

        storeMapData(mapData, function() {
            // TODO Remove this is just during migration from api/images -> api/createJourney once migrated we only require the redirect route
            if(startTime) {

                res.redirect("map/" + mapData._id);
            }
            else {
                res.send(mapData);
            }


        });
    });
}


function storeMapData(mapData, callback) {

    MongoClient.connect(config.mongoDBUrl, function (err, db) {
        if (err) throw err;

        var collection = db.collection('journeys');
        collection.insert(mapData, function(err, docs) {
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
    if(!startTimeStr) startTimeStr = "1 Jan 1970";
    if(!endTimeStr) endTimeStr = "1 Jan 2020";
    if(!tripname) tripname = "My journey";


    if(!startTimeStr || !endTimeStr || !tripname) {
        return res.send(500, "No starttime, endtime or tripname defined");
    }

    var startTime = new Date(startTimeStr).getTime();
    var endTime = new Date(endTimeStr).getTime();

    if(startTime == NaN || endTime == NaN) {
        return res.send(500, "starttime or endtime is not valid");
    }

    // Convert to unix TS
    startTime /= 1000;
    endTime /= 1000;


    if (!accessToken) {
        return res.send(500, "Access token not set in session, please login first");
    }

    res.set("Content-Type", "application/json");
    //FB.setAccessToken('CAACEdEose0cBAA2g1RwGq004OFraoxZCXwy7XEskZAgKkQZBVmFkJml7R6hnZB0rKcutW6vplDfPbdRzM3fS8PZC4oEdujc8V6io6xYOECCZC1yLYWcdQd2OBXtgZBVVbJxkaZAhKZCGwD2GR5uPwxvZAlC7CnUmBctZAZBS46KSq6ewNKFpD6hj6fjmj07EkLjGAaL9uC7aQYPFdAZDZD');
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
    MongoClient.connect(config.mongoDBUrl, function (err, db) {
        if (err) return res.send(500, err.toString());
        var journeys = db.collection('journeys');
        var journeyId = req.params.id;
        journeys.find({'_id': new ObjectID(journeyId)}).toArray(function (err, results) {
            if (err) res.send(404, err);
            db.close();
            res.send(results);
        });
    });
};

exports.createRoutes = function (configuration) {
    config = configuration;
    return routes;
};