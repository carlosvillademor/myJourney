var express = require('express'),
    app = express(),
    mu = require('mu2'),
    util = require('util'),
    path = require( 'path' );

var MongoClient = require('mongodb').MongoClient, format = util.format;

mu.root = __dirname;

app.configure(function () {
    var staticPath = path.resolve ( __dirname + '/../static' );
    app.use( express.static( staticPath ) );

    app.use( express.logger() );
});

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
    console.log('get request to /');
    var homePage = mu.compileAndRender('../templates/home.html', {});
    console.log('homePage is', homePage);
    util.pump(homePage, res);
});


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
  })

app.listen(process.env.PORT || 5000);