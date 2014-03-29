define(['../module'], function (MapService) {
    'use strict';

    /**
     * Picker object for the selection map.
     */
    MapService.factory('MapObjectPicker', ['THREE', 'MapObjectBase',
        function(THREE, MapObjectBase)
        {
            var parent = MapObjectBase.prototype;

            function MapObjectPicker(id, options)
            {
                parent.constructor.apply(this, arguments);

                if (!this.options.orientation) {
                    this.options.orientation = false;
                }

                this.mesh = new THREE.Mesh(
                    new THREE.CubeGeometry(5, 5, 5),
                    new THREE.MeshBasicMaterial({color: new THREE.Color(id)})
                );
            }

            MapObjectPicker.prototype = Object.create(parent);
            MapObjectPicker.prototype.constructor = MapObjectPicker;

            return MapObjectPicker;
        }
    ]);

});
