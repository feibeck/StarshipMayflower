define(['../module'], function (MapService) {
    'use strict';

    /**
     * Base class to represent an object on the map
     */
    MapService.factory('MapObjectBase', ['THREE',
        function(THREE)
        {
            function MapObjectBase(color, options)
            {
                this.options = options || {};

                this.mesh = null;
            }

            MapObjectBase.prototype.setPosition = function(x, y, z)
            {
                this.mesh.position.set(x, y, z);
            };

            MapObjectBase.prototype.scale = function(size)
            {
                this.mesh.scale.x = size;
                this.mesh.scale.y = size;
                this.mesh.scale.z = size;
            };

            MapObjectBase.prototype.setScene = function(scene)
            {
                scene.add(this.mesh);
            };

            return MapObjectBase;
        }
    ]);

});