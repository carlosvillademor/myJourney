var express = require('express'),
    app = express(),
    mu = require('mu2'),
    util = require('util'),
    path = require( 'path' );

mu.root = __dirname;

app.configure(function () {
    var staticPath = path.resolve ( __dirname + '/../static' );
    app.use( express.static( staticPath ) );

    app.use( express.logger() );
});

app.get('/', function(req, res) {
    console.log('get request to /');
    var homePage = mu.compileAndRender('../templates/home.html', {});
    console.log('homePage is', homePage);
    util.pump(homePage, res);
});

app.use(express.static(__dirname + '/static'));

app.listen(process.env.PORT || 5000);

console.log('PORT', process.env.PORT || 5000);