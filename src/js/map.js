(function () {
    'use strict';

    module.exports = function () {

        if ($('#map').length > 0) {
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
        }

        return map;
    };

})();