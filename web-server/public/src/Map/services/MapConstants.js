define(['../module'], function (MapService) {
    'use strict';

    /**
     * Defines the length of an astronomical unit
     */
    MapService.factory('MapConstants', [
        function()
        {
            return {
                AU: 149597870.7
            };
        }
    ]);

});
