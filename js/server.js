var express = require('express'),
    app = express(),
    conf = require('./config'),
    config = conf.load(app.settings.env || 'development'),
    path = require('path');

var routes = require('./../routes').createRoutes(config);

app.configure(function () {
    app.set('views', __dirname + '/../src/jade');
    app.set('view engine', 'jade');

    app.use(express.static(path.resolve(config.staticPath)));
    app.use(express.logger());
});

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.cookieSession({
    secret: 'i6JUAPaLsmFWCxjGgsQEDoAmHAPoVX'
}));

app.get('/', routes.home);
app.get('/create', routes.create);
app.get('/map/:id', routes.map);
app.get('/map', routes.map);
app.get('/api/images', routes.createJourney); // This should be the db lookup
app.get('/api/createJourney', routes.createJourney);
app.get('/storeAccessToken', routes.storeAccessToken);
app.get('/journey/:id', routes.journey);

app.listen(config.port);