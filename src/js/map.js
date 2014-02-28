(function () {
    'use strict';

    var id = window.location.pathname.split( '/' )[2];

    var map, featureLayer, data, coords, markers;

    var itemMap = require('../templates/itemMap.jade');
    var itemImage = require('../templates/itemImage.jade');

    var MAP_MODE = 'map-mode';
    var PICTURE_MODE = 'picture-mode';

    var mode = MAP_MODE;

    var $body = $('body');

    $body.addClass(mode);


    function switchMode(newMode) {
        if (newMode != mode) {
            $body.removeClass(mode);
            mode = newMode;
            $body.addClass(newMode);    
        }    
    }

    function createMap() {
        var items = [];
        var images = [];
        markers = [];

        map = L.mapbox.map('map', 'fetz.hcpe8ip9')
                .setView([38, -102.0], 9);

        $.each(data.features, function (index, item) {
            item.properties.title = item.properties.title || '***';
            items.push(itemMap({
                index: index,
                title: item.properties.title,
                image: item.properties.image.source,
                timestamp: item.properties.created_time
            }));
            images.push(itemImage({image: item.properties.image.source}));
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
        window.document.title += (' : ' + data.tripname );
        $('.history-content h2').html(data.tripname);
        $('.history-content ul').html(items.join(''));
        $('#pictureViewer ul').html(images.join(''));
    }

    module.exports = function () {

        if ($('#map').length > 0) {

            $.get( '/journey/' + id, function(json) {
                data = json[0];
                createMap();
            });

            $('.history-content ul').on('click', 'li', function (e) {
                var i = Number($(this).data('index'));
                map.panTo(markers[i].getLatLng());
                markers[i].openPopup();
                $('#pictureViewer ul').animate({top: -100 * i + '%'});
            });

            $('.showpictures').on('click', function () {
                switchMode(PICTURE_MODE);
            });

            $('.showmap').on('click', function () {
                switchMode(MAP_MODE);
            });
        }

        return map;
    };

})();