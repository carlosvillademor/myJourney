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
            console.log(format('count = %s', count));
        });

        collection.find().toArray(function (err, results) {
            console.dir(results);
            db.close();
        });
//    });
});


app.get('/', routes.home);
app.get('/create', routes.create);
app.get('/map/:id', routes.map);
app.get('/map', routes.map);


app.get('/storeAccessToken', function(req, res) {
    var code = req.query.code;

    if (code) {
        FB.api('oauth/access_token', {
            client_id: '648327631897525',
            client_secret: '72736a58eb7bdb18d44f6cd325f651d3',
            redirect_uri: 'http://localhost:5000/storeAccessToken/',
            code: code
        }, function (fbRes) {
            if (!fbRes || fbRes.error) {
                console.log(!fbRes ? 'error occurred' : fbRes.error);

                return res.send(500, 'Failed to obtain access token: ' + JSON.stringify(fbRes.error));
            }

            var accessToken = fbRes.access_token;

            console.log(req.session);
            req.session.fbAccessToken = accessToken;

            //var expires = fbRes.expires ? fbRes.expires : 0;
            console.log('Got access token');
            res.redirect('/create');
        });

    }
});

app.get('/api/images', function(req, res) {

    var accessToken = req.session.fbAccessToken;
    if (!accessToken) {
        return res.send(500, 'Access token not set in session, please login first');
    }

    res.set('Content-Type', 'application/json');
    //FB.setAccessToken('CAACEdEose0cBAA2g1RwGq004OFraoxZCXwy7XEskZAgKkQZBVmFkJml7R6hnZB0rKcutW6vplDfPbdRzM3fS8PZC4oEdujc8V6io6xYOECCZC1yLYWcdQd2OBXtgZBVVbJxkaZAhKZCGwD2GR5uPwxvZAlC7CnUmBctZAZBS46KSq6ewNKFpD6hj6fjmj07EkLjGAaL9uC7aQYPFdAZDZD');
    FB.setAccessToken(accessToken);


    FB.api('fql', { q: 'select uid from user where uid = me()' }, function (fbRes) {
      if (!fbRes || fbRes.error) {
        console.log(!fbRes ? 'error occurred' : res.error);
        return res.send(500, 'Failed to get uid');
      }

        console.log(JSON.stringify(fbRes.data[0].uid));
        fetchUserPhotos(fbRes.data[0].uid, res);

    });
});

function fetchUserPhotos(uid, res) {

    FB.api( uid + '', { fields : ['id', 'name', 'photos.since(139353477).limit(1000)']}, function (fbRes) {
        if (!fbRes || fbRes.error) {
            console.log(!fbRes ? 'error occurred' : fbRes.error);
            return res.send(500, 'Failed to request photos');
        }

        var mapData = {
            type : 'FeatureCollection',
            features: []
        };



        if (fbRes.photos) {
            mapData.features = _.filter(_.map(fbRes.photos.data, function(photo) {


                if (photo.place && photo.place.location && photo.place.location.longitude) {
                    return  {
                        type: 'Feature',
                        properties : {
                            title : photo.name,
                            image : _.first(photo.images)
                        },
                        geometry : {
                            type : 'Point',
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
}





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
