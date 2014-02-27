var express = require('express'),
    app = express(),
    mu = require('mu2'),
    util = require('util');

mu.root = __dirname;

app.get('/', function(req, res) {
    console.log('get request to /');
    var homePage = mu.compileAndRender('../templates/home.html', {});
    console.log('homePage is', homePage);
    util.pump(homePage, res);
});

app.listen(process.env.PORT || 5000);