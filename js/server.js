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
    res.set("Content-Type", "application/json");
    FB.setAccessToken('CAACEdEose0cBADs0iHmjWGVcNBsZCmG1EFhZBYQ3AZBYKm0pDKUhyzAbHjaUu3ug5vGlXmNaMc3WEyyAArZCfhTLR2RAiJZCUfS6FlIdKbZB6Ysen5EZBXHTVOdcnrEKDPMEDzoAhl2oruNzZAkxP2MubwAjnqJ7cMIx5pvrxfSs9jcNE4dAC6IKsigaYvd8NDQZD');

    FB.api('587145823', { fields : ['id','name', 'photos.limit(1000)']}, function (fbRes) {
        if(!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
            return;
        }

        var mapData = {
             type : "FeatureCollection"
        };




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

        res.send(mapData);
    });
});





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
