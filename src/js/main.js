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