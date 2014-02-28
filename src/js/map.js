(function () {
    'use strict';

    var map, featureLayer, data, coords, markers;

    var itemMap = require('../templates/itemMap.jade');
    

    function createMap() {
        var items = [];
        markers = [];

        map = L.mapbox.map('map', 'fetz.hcpe8ip9')
                .setView([38, -102.0], 9);

        $.each(data.features, function (index, item) {
            item.properties.title = item.properties.title || "***";
            items.push(itemMap({
                index: index,
                title: item.properties.title,
                image: item.properties.image.source,
                timestamp: item.properties.created_time
            }));
        });

        featureLayer = L.mapbox.featureLayer()
            .addTo(map)
            .setGeoJSON(data);

        var polyline = L.polyline([]).addTo(map);

        featureLayer.eachLayer(function(marker) {
            markers.push(marker);
            polyline.addLatLng(marker.getLatLng());
        });

        featureLayer.on('click', function(e) {
            map.panTo(e.layer.getLatLng());
        });

        map.fitBounds(featureLayer.getBounds());
        
        $('.history-content ul').html(items.join(''));
    }

    module.exports = function () {

        if ($('#map').length > 0) {
            

            $.get( 'api/images', function(json) {
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