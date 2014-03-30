define(['../module'], function (MapService) {
    'use strict';

    /**
     * Proxy for combining Picker and Actor into a single class.
     */
    MapService.factory('MapObject', ['THREE', 'MapObjectActor', 'MapObjectPicker',
        function(THREE, MapObjectActor, MapObjectPicker)
        {
            function MapObject(color, id, options)
            {
                this.options = options;
                this._id = id;
                this.actor = new MapObjectActor(color, options);
                this.picker = new MapObjectPicker(id, options);
            }

            ['setPosition', 'scale'].forEach(function(method) {
                MapObject.prototype[method] = function() {
                    this.actor[method].apply(this.actor, arguments);
                    this.picker[method].apply(this.picker, arguments);
                };
            });

            ['setHeading', 'setShipX', 'setShipY'].forEach(function(method) {
                MapObject.prototype[method] = function() {
                    this.actor[method].apply(this.actor, arguments);
                };
            });

            MapObject.prototype.setRenderScene = function(scene) {
                this.actor.setScene(scene);
            };

            MapObject.prototype.setPickingScene = function(scene) {
                this.picker.setScene(scene);
            };

            MapObject.prototype.getId = function(id) {
                return this._id;
            };

            return MapObject;
        }
    ]);

});