define(['MapObjectBase', 'three'], function(MapObjectBase, THREE) {
    'use strict';

    var parent = MapObjectBase.prototype;

    function MapObjectPicker(id, options)
    {
        parent.constructor.apply(this, arguments);

        if (!this.options.orientation) {
            this.options.orientation = false;
        }

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5),
            new THREE.MeshBasicMaterial({color: new THREE.Color(id)})
        );
    }

    MapObjectPicker.prototype = Object.create(parent);
    MapObjectPicker.prototype.constructor = MapObjectPicker;

    return MapObjectPicker;

});