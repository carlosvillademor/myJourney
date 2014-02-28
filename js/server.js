var express = require('express'),
    routes = require('./../routes'),
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
    app.set('views', __dirname + '/../src/jade');
    app.set('view engine', 'jade');

    app.get('/', routes.home);
    app.get('/create', routes.create);
    app.get('/map/:id', routes.map);
    app.get('/map', routes.map);

    app.get('/api/images', routes.images);
    app.get('/api/storeAccessToken', routes.storeAccessToken);
    app.use(express.static(path.resolve(config.staticPath)));
    app.use(express.logger());
});

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.cookieSession({
    secret : 'i6JUAPaLsmFWCxjGgsQEDoAmHAPoVX'
}));

MongoClient.connect(config.mongoDBUrl, function (err, db) {
    if (err) throw err;

    var collection = db.collection('test_insert');
//    collection.insert({a: 2}, function (err, docs) {

        collection.count(function (err, count) {
            console.log(format("count = %s", count));
        });

        collection.find().toArray(function (err, results) {
            console.dir(results);
            db.close();
        });
//    });
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
