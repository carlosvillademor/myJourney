(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
    'use strict';

    var temp = require('./temp');
    temp();

    var map = require('./map');
    map();
})();
},{"./map":2,"./temp":3}],2:[function(require,module,exports){
(function () {
    'use strict';

    module.exports = function () {
        var map = L.mapbox.map('map', 'fetz.hcpe8ip9')
            .setView([38, -102.0], 9);

        var featureLayer = L.mapbox.featureLayer()
            .loadURL('temp/map.json')
            .addTo(map);

        featureLayer.on('ready', function() {
            map.fitBounds(featureLayer.getBounds());
        });

        featureLayer.on('click', function(e) {
            map.panTo(e.layer.getLatLng());
        });


        return map;
    };

})();
},{}],3:[function(require,module,exports){
(function () {
    'use strict';

    module.exports = function () {
        console.log('hello');
    };

})();
},{}]},{},[1,2,3])