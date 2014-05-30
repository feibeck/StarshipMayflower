define([
    '../module',
    'angular'
], function (module, angular) {
    'use strict';

    module.filter('ucfirst', function() {
        return function(input) {
            return input.charAt(0).toUpperCase() + input.slice(1);
        };
    });

});