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
            .setView([37.9, -77], 6);

        map.featureLayer.on('click', function(e) {
            console.log(e.layer.getLatLng());
            map.panTo(e.layer.getLatLng());
        });

        L.mapbox.featureLayer({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [-77, 37.9]
            },
            properties: {
                title: 'A Single Marker',
                description: 'Just one of me',
                // one can customize markers by adding simplestyle properties
                // http://mapbox.com/developers/simplestyle/
                'marker-size': 'large',
                'marker-color': '#c0fc0c'
            }
        }).addTo(map);


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