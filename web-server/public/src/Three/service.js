define([
    './module',
    'three',
    'orbit-controls'
], function (ThreeService, THREE) {
    'use strict';

    ThreeService.factory('THREE', [
        function()
        {
            return THREE;
        }
    ]);

});