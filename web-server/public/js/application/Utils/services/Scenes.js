define([
    '../module',
    'Map/StarMap',
    'Scanner/scanner',
    'Compass/compass',
    'Rotation/rotation',
    'SpaceViewer/viewer'
], function (module, StarMap, Scanner, Compass, Rotation, SpaceViewer) {
    'use strict';

    module.factory('Scenes', [
        function()
        {

            var map         = null;
            var scanner     = null;
            var spaceview   = null;
            var rotation    = null;
            var compass     = null;
            var spaceview   = null;
            var spaceview3d = null;

            return {

                getMap: function()
                {
                    if (map == null) {
                        map = new StarMap();
                    }
                    return map;
                },

                getScanner: function()
                {
                    if (scanner == null) {
                        scanner = new Scanner();
                    }
                    return scanner;
                },

                getCompass: function()
                {
                    if (compass == null) {
                        compass = new Compass();
                    }
                    return compass;
                },

                getRotation: function()
                {
                    if (rotation == null) {
                        rotation = new Rotation();
                    }
                    return rotation;
                },

                getSpaceview: function()
                {
                    if (spaceview == null) {
                        spaceview = new SpaceViewer();
                    }
                    return spaceview;
                },

                getSpaceview3d: function()
                {
                    if (spaceview3d == null) {
                        spaceview3d = new SpaceViewer(true);
                    }
                    return spaceview3d;
                }

            };
        }
    ]);

});
