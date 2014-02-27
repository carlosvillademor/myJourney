(function () {
    'use strict';

    var map, featureLayer, items, data, coords, markers;

    var itemMap = require('../templates/itemMap.jade');

    function createMap() {
        items = [];
        coords = [];
        markers = [];
        $.each(data.features, function (index, item) {
            items.push(itemMap({index: index, title: item.properties.title}));
            coords.push([item.geometry.coordinates[1], item.geometry.coordinates[0]]);
        });

        featureLayer.setGeoJSON(data);

        featureLayer.eachLayer(function(marker) {
            markers.push(marker);
        });
        
        map.fitBounds(featureLayer.getBounds());
        $('.history-content ul').html(items.join(''));
    }

    module.exports = function () {

        if ($('#map').length > 0) {
            map = L.mapbox.map('map', 'fetz.hcpe8ip9')
                .setView([38, -102.0], 9);

            featureLayer = map.featureLayer;

            featureLayer.on('click', function(e) {
                map.panTo(e.layer.getLatLng());
            });

            $.get( 'temp/map.json', function(json) {
                data = json;
                createMap();
            });

            $('.history-content ul').on('click', 'li', function (e) {
                var i = Number($(this).data('index'));
                map.panTo(markers[i].getLatLng());
                markers[i].openPopup();
            });

        }

        return map;
    };

})();