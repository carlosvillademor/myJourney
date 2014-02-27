var express = require('express'),
    app = express(),
    mu = require('mu2'),
    util = require('util'),
    path = require( 'path'),
    FB = require('fb'),
    MongoClient = require('mongodb').MongoClient,
    format = util.format,
    _ = require('lodash');

mu.root = __dirname;

app.configure(function () {
    var staticPath = path.resolve ( __dirname + '/../static' );
    app.use( express.static( staticPath ) );

    app.use( express.logger() );
});

app.use(express.static(__dirname + '/static'));

// app.get('/', function(req, res) {
//     console.log('get request to /');
//     var homePage = mu.compileAndRender('../templates/home.html', {});
//     console.log('homePage is', homePage);
//     util.pump(homePage, res);
// });


MongoClient.connect(process.env.MONGOHQ_URL || 'mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');
    collection.insert({a:2}, function(err, docs) {

      collection.count(function(err, count) {
        console.log(format("count = %s", count));
      });

      // Locate all the entries using find
      collection.find().toArray(function(err, results) {
        console.dir(results);
        // Let's close the db
        db.close();
      });
    });
});



app.get('/api/images', function(req, res) {
    res.set("Content-Type", "application/json");
    FB.setAccessToken('CAACEdEose0cBAGUi5EYZCfom1FR1XJj1yv3cZAlpTj7xYp486LtmBVLzUJO08jEsZANSDJxHoHkB21CgLSc88BZAwKo4cHAV2yPbV2Hiy8sg5i74ZCMvCR5gJIzIMzhyClF2C6QFnaZAwnoQiFSbZBN4hOgixiyeNeyjjZC5F2bg4fBbHwDJLY2hvll71Ldg4VT3fOZAQ4u1XfwZDZD');

    FB.api('100001237688606', { fields : ['id','name', 'photos']}, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }

        var photos = _.map(res.photos.data, function(photo) {
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

app.listen(process.env.PORT || 5000);