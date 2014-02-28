(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str =  str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])
(1)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"fs":1}],3:[function(require,module,exports){
(function () {
    'use strict';

    module.exports = function () {
        $('.starttime').pickadate();
        $('.endtime').pickadate();
    };
})();
},{}],4:[function(require,module,exports){
(function () {
    'use strict';
    $(function() {

        var create = require('./create');
        create();

        var map = require('./map');
        map();

        var spinner = require('./spinner');
        spinner();
    });

})();
},{"./create":3,"./map":5,"./spinner":6}],5:[function(require,module,exports){
(function () {
    'use strict';

    var id = window.location.pathname.split( '/' )[2];

    var map, miniMap, featureLayer, featureLayerMini, data, coords, markers, markersMini;

    var itemMap = require('../templates/itemMap.jade');
    var itemPost = require('../templates/itemPost.jade');
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
        markersMini = [];

        map = L.mapbox.map('map', 'fetz.hcpe8ip9')
                .setView([38, -102.0], 9);
        miniMap = L.mapbox.map('smallMap', 'fetz.hcpe8ip9')
                .setView([38, -102.0], 9);

        $.each(data.features, function (index, item) {
            item.properties.title = item.properties.title || '***';
            if (item.properties.image) {
                items.push(itemMap({
                    index: index,
                    imageIndex: images.length,
                    title: item.properties.title,
                    image: item.properties.image.source,
                    timestamp: item.properties.created_time.substring(0,10)
                }));
                images.push(itemImage({image: item.properties.image.source}));
            }else {
                items.push(itemPost({
                    index: index,
                    title: item.properties.title,
                    timestamp: item.properties.created_time.substring(0,10)
                }));
            }
        });

        if (images.length == 0) {
            $('.showpictures').hide();
        }

        featureLayerMini = L.mapbox.featureLayer()
            .addTo(miniMap)
            .setGeoJSON(data);


        featureLayer = L.mapbox.featureLayer()
            .addTo(map)
            .setGeoJSON(data);

        var polyline = L.polyline([]).addTo(map);

        featureLayer.eachLayer(function(marker) {
            markers.push(marker);
            polyline.addLatLng(marker.getLatLng());
        });

        featureLayerMini.eachLayer(function(marker) {
            markersMini.push(marker);
        });

        featureLayer.on('click', function(e) {
            var i = markers.indexOf(e.layer.dragging._marker);
            var elem = $('.history-content ul li').removeClass('selected').eq(i);
            elem.addClass('selected');
            $('.history-content').animate({
                scrollTop: $('.history-content').scrollTop() + elem.position().top - 73
            });
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
                data = json;
                createMap();
            });

            $(document).keydown(function(e) {
                if ( e.keyCode >= 37 && e.keyCode <= 40 ) {
                    e.preventDefault();
                }
                var prev, next, elIndex;
                var selected = $('.history-content ul .selected' );
                if ( mode == MAP_MODE ) {
                    elIndex = parseInt(selected.attr('data-index') );
                    prev = $( '[data-index="'+ ( elIndex - 1 ) +'"]' ) || null;
                    next = $( '[data-index="'+ ( elIndex + 1 ) +'"]' ) || null;
                } else {
                    elIndex = parseInt(selected.attr('data-image-index') );
                    prev = $( '[data-image-index="'+ ( elIndex - 1 ) +'"]' ) || null;
                    next = $( '[data-image-index="'+ ( elIndex + 1 ) +'"]' ) || null;
                }
                if ( e.keyCode == 37 || e.keyCode == 38 ) {
                    if ( prev ) {
                        prev.trigger( 'click' );
                    }
                } else if ( e.keyCode == 39 || e.keyCode == 40 ) {
                    if ( next ) {
                        next.trigger( 'click' );
                    }
                }
                $('.history-content').animate({
                        scrollTop: selected.offset().top
                }, 2000);
            });

            $('.history-content ul').on('click', 'li', function (e) {
                e.preventDefault();
                $(this).siblings().removeClass('selected');
                var i = Number($(this).data('index'));
                var iImg = Number($(this).data('image-index'));
                map.panTo(markers[i].getLatLng());
                miniMap.setView(markersMini[i].getLatLng(), 12);
                markers[i].openPopup();
                $(this).addClass('selected');
                if (iImg || iImg === 0) {
//                    $('#pictureViewer ul').animate({top: -100 * iImg + '%'});
                    var displaySize = $('#display').height();
                    $('#pictureViewer ul').animate({top: -1 * displaySize * iImg + 'px'});
                }
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
},{"../templates/itemImage.jade":7,"../templates/itemMap.jade":8,"../templates/itemPost.jade":9}],6:[function(require,module,exports){
(function () {
    'use strict';

    $('.createMap').on('click', function () {
        $('#SpinnerWrapper').show();
    });
})();
},{}],7:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),index = locals_.index,image = locals_.image;
buf.push("<li" + (jade.attr("data-index", '' + (index) + '', true, false)) + (jade.attr("title", '' + (index) + '', true, false)) + (jade.attr("style", "background-image: url(" + (image) + ");", true, false)) + "><image" + (jade.attr("src", "" + (image) + "", true, false)) + "></image></li>");;return buf.join("");
};
},{"jade/runtime":2}],8:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),index = locals_.index,imageIndex = locals_.imageIndex,image = locals_.image,title = locals_.title,timestamp = locals_.timestamp;
buf.push("<li" + (jade.attr("data-index", '' + (index) + '', true, false)) + (jade.attr("data-image-index", '' + (imageIndex) + '', true, false)) + (jade.attr("title", '' + (index) + '', true, false)) + " class=\"item-image\"><figure><div" + (jade.attr("style", "background-image: url(" + (image) + ")", true, false)) + " class=\"preview\"><image" + (jade.attr("src", "" + (image) + "", true, false)) + "></image></div><figcaption><h3 class=\"description\">" + (jade.escape((jade_interp = title) == null ? '' : jade_interp)) + "</h3><p class=\"timestamp\">" + (jade.escape((jade_interp = timestamp) == null ? '' : jade_interp)) + "</p></figcaption></figure></li>");;return buf.join("");
};
},{"jade/runtime":2}],9:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),index = locals_.index,title = locals_.title,timestamp = locals_.timestamp;
buf.push("<li" + (jade.attr("data-index", '' + (index) + '', true, false)) + (jade.attr("title", '' + (index) + '', true, false)) + " class=\"item-post\"><figure><div class=\"postPreview\"></div><figcaption><h3 class=\"description\">" + (jade.escape((jade_interp = title) == null ? '' : jade_interp)) + "</h3><p class=\"timestamp\">" + (jade.escape((jade_interp = timestamp) == null ? '' : jade_interp)) + "</p></figcaption></figure></li>");;return buf.join("");
};
},{"jade/runtime":2}]},{},[3,4,5,6])
