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