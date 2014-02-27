var express = require('express'),
    app = express(),
    util = require('util'),
    path = require('path'),
    FB = require('fb'),
    MongoClient = require('mongodb').MongoClient,
    format = util.format,
    _ = require('lodash'),
    conf = require('./config');

var config = conf.load(app.settings.env || 'development');

app.configure(function () {
    app.use(express.static(path.resolve(config.staticPath)));
    app.use(express.logger());
});

MongoClient.connect(config.mongoDBUrl, function (err, db) {
    if (err) throw err;

    var collection = db.collection('test_insert');
    collection.insert({a: 2}, function (err, docs) {

        collection.count(function (err, count) {
            console.log(format("count = %s", count));
        });

        collection.find().toArray(function (err, results) {
            console.dir(results);
            db.close();
        });
    });
});

app.get('/api/images', function(req, res) {

    var accessToken = req.query.code;

    if(!accessToken) {
        return res.send(500, "No code/accessToken in request");
    }

    res.set("Content-Type", "application/json");
    //FB.setAccessToken('CAACEdEose0cBAA2g1RwGq004OFraoxZCXwy7XEskZAgKkQZBVmFkJml7R6hnZB0rKcutW6vplDfPbdRzM3fS8PZC4oEdujc8V6io6xYOECCZC1yLYWcdQd2OBXtgZBVVbJxkaZAhKZCGwD2GR5uPwxvZAlC7CnUmBctZAZBS46KSq6ewNKFpD6hj6fjmj07EkLjGAaL9uC7aQYPFdAZDZD');
    FB.setAccessToken(accessToken);


    FB.api('fql', { q: 'select uid from user where uid = me()' }, function (fbRes) {
      if(!fbRes || fbRes.error) {
        console.log(!fbRes ? 'error occurred' : res.error);
        return res.send(500, "Failed to get uid");
      }

        console.log(JSON.stringify(fbRes.data[0].uid));
        fetchUserPhotos(fbRes.data[0].uid, res);

    });
});

function fetchUserPhotos(uid, res) {

    FB.api(uid +'', { fields : ['id','name', 'photos.since(1393534770).limit(1000)']}, function (fbRes) {
        if(!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
            return res.send(500, "Failed to request photos");
        }

        var mapData = {
            type : "FeatureCollection",
            features: []
        };



        if(fbRes.photos) {
            mapData.features = _.filter(_.map(fbRes.photos.data, function(photo) {


                if(photo.place && photo.place.location && photo.place.location.longitude) {
                    return  {
                        type: "Feature",
                        properties : {
                            title : photo.name,
                            image : _.first(photo.images)
                        },
                        geometry : {
                            type : "Point",
                            coordinates : [
                                photo.place.location.longitude,
                                photo.place.location.latitude
                            ]
                        }
                    };
                }
            }));
        }

        res.send(mapData);
    });
};





/*var start = new Date(2000, 1,1);
var end = new Date(2014,1,1);

console.log(start);

FB.api('fql', { q: 'SELECT place_id, caption, src, created FROM photo WHERE owner=100001237688606 AND created > ' + (start.getTime() / 1000)  }, function (res) {
  if(!res || res.error) {
    console.log(!res ? 'error occurred' : res.error);
    return;
  }
  console.log(res.data);
});*/

app.listen(config.port);
