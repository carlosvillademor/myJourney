var express = require('express'),
    app = express(),
    util = require('util'),
    path = require('path'),
    FB = require('fb'),
    MongoClient = require('mongodb').MongoClient,
    format = util.format,
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

FB.setAccessToken('CAACEdEose0cBAAzozsRWD94OmCU4fPOsZB0giNexYxuOe5WY082LAYoEZBDsedj8mmZBAdRV79BAjczrMKDO2T3j7vUvLX3mQE7dqxkC6CFY6LGxehuG3ETPc2IvxKt8ni1onwVcIs4gWAQgfkBovpBSz0hcSQKGmdaOK5MFOAr2qIIdjfGEqtyEZBrvZCM1DQJ5Rypsl7gZDZD');

FB.api('fql', { q: 'SELECT src FROM photo WHERE owner=100001237688606' }, function (res) {
    if (!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    console.log(res.data);
});

app.listen(config.port);