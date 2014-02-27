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
    FB.setAccessToken('CAACEdEose0cBAGUi5EYZCfom1FR1XJj1yv3cZAlpTj7xYp486LtmBVLzUJO08jEsZANSDJxHoHkB21CgLSc88BZAwKo4cHAV2yPbV2Hiy8sg5i74ZCMvCR5gJIzIMzhyClF2C6QFnaZAwnoQiFSbZBN4hOgixiyeNeyjjZC5F2bg4fBbHwDJLY2hvll71Ldg4VT3fOZAQ4u1XfwZDZD');

    FB.api('100001237688606', { fields : ['id','name', 'photos']}, function (fbRes) {
        if(!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
            return;
        }

        var photos = _.map(fbRes.photos.data, function(photo) {
            return {
                id : photo.id,
                place: photo.place,
                image : _.first(photo.images)
            };
        });

        res.send(photos);
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
