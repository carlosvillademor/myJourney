var _ = require('lodash'),
    FB = require('fb'),
    MongoClient = require('mongodb').MongoClient,
    routes = {},
    config,
    mongoDBUrl;

routes.home = function (req, res) {
    res.render('home',
        {
            title: 'myJourney',
            pageId: 'Home',
            facebookUrl: 'https://www.facebook.com/dialog/oauth?scope=user_photos&client_id=648327631897525&redirect_uri=http://' + req.headers.host + '/storeAccessToken/'
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
            journeyTitle: req.query.tripname,
            title: 'myJourney : ' + req.query.tripname,
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
            res.redirect("/create.html");
        });

    }
};

function fetchUserPhotos(uid, res) {

    //until(' + toTimestamp + ').since(' + fromTimestamp + ')
    FB.api(uid + '', { fields: ['id', 'name', 'photos.limit(1000)']}, function (fbRes) {
        if (!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
            return res.send(500, "Failed to request photos");
        }

        var mapData = {
            type: "FeatureCollection",
            features: []
        };


        if (fbRes.photos) {
            mapData.features = _.filter(_.map(fbRes.photos.data, function (photo) {

                if (photo.place && photo.place.location && photo.place.location.longitude) {
                    return  {
                        type: "Feature",
                        properties: {
                            title: photo.name,
                            image: _.first(photo.images),
                            created_time: photo.created_time
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
        }

        storeMapData(mapData, function() {
            res.send(mapData);
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

routes.images = function (req, res) {
    var accessToken = req.session.fbAccessToken;



    /*var fromTimestamp = req.query.fromTimestamp;
     var toTimestamp = req.query.toTimestamp;

     if(!fromTimetamp || !toTimestamp) {
     return res.send(500, "Please specify fromTimestamp and toTimestamp")
     }*/


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
        fetchUserPhotos(fbRes.data[0].uid, res);

    });
};

function connectToMongo () {
    MongoClient.connect(mongoDBUrl, function (err, db) {
        if (err) throw err;

        var collection = db.collection('test_insert');
//    collection.insert({a: 2}, function (err, docs) {

        collection.count(function (err, count) {
            console.log(format('count = %s', count));
        });

        collection.find().toArray(function (err, results) {
            console.dir(results);
            db.close();
        });
//    });
    });
}

(function () {
    function getJourney(id) {
    }

    routes.journey = function (req, res) {
    };
})();

exports.createRoutes = function (configuration) {
    config = configuration;
   return routes;
};