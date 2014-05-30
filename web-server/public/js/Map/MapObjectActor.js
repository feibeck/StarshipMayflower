define(['MapObjectBase', 'three'], function (MapObjectBase, THREE) {
    'use strict';

    var parent = MapObjectBase.prototype;

    function MapObjectActor(color, options)
    {
        parent.constructor.apply(this, arguments);

        if (!this.options.orientation) {
            this.options.orientation = false;
        }

        if (!color) {
            color = 'lime';
        }

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5),
            new THREE.MeshBasicMaterial({color: color})
        );

        if (this.options.orientation) {

            this.headingArrow = new THREE.ArrowHelper(
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(0, 0, 0),
                10,
                'blue'
            );

            this.shipArrowX = new THREE.ArrowHelper(
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, 0, 0),
                10,
                'red'
            );

            this.shipArrowY = new THREE.ArrowHelper(
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(0, 0, 0),
                10,
                'green'
            );

        }

        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        this.objectProjectionLine = new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
                color: color
            })
        );
        this.objectProjectionLine.geometry.dynamic = true;
    }

    MapObjectActor.prototype = Object.create(parent);
    MapObjectActor.prototype.constructor = MapObjectActor;

    MapObjectActor.prototype.setPosition = function(x, y, z)
    {
        parent.setPosition.apply(this, arguments);

        if (this.options.orientation) {
            this.headingArrow.position.set(x, y, z);
            this.shipArrowX.position.set(x, y, z);
            this.shipArrowY.position.set(x, y, z);
        }

        this.objectProjectionLine.geometry.vertices[0].x = x;
        this.objectProjectionLine.geometry.vertices[0].y = 0;
        this.objectProjectionLine.geometry.vertices[0].z = z;

        this.objectProjectionLine.geometry.vertices[1].x = x;
        this.objectProjectionLine.geometry.vertices[1].y = y;
        this.objectProjectionLine.geometry.vertices[1].z = z;

        this.objectProjectionLine.geometry.verticesNeedUpdate = true;
    };

    MapObjectActor.prototype.setHeading = function(x, y, z)
    {
        if (this.options.orientation) {
            this.headingArrow.setDirection(new THREE.Vector3(x, y, z));
        }
    };

    MapObjectActor.prototype.setShipX= function(x, y, z)
    {
        if (this.options.orientation) {
            this.shipArrowX.setDirection(new THREE.Vector3(x, y, z));
        }
    };

    MapObjectActor.prototype.setShipY= function(x, y, z)
    {
        if (this.options.orientation) {
            this.shipArrowY.setDirection(new THREE.Vector3(x, y, z));
        }
    };

    MapObjectActor.prototype.scale = function(size)
    {
        parent.scale.apply(this, arguments);

        if (this.options.orientation) {
            this.headingArrow.scale.x = this.shipArrowX.scale.x = this.shipArrowY.scale.x = size;
            this.headingArrow.scale.y = this.shipArrowX.scale.y = this.shipArrowY.scale.y = size;
            this.headingArrow.scale.z = this.shipArrowX.scale.y = this.shipArrowY.scale.y = size;
        }
    };

    MapObjectActor.prototype.setScene = function(scene)
    {
        parent.setScene.apply(this, arguments);

        scene.add(this.objectProjectionLine);
        if (this.options.orientation) {
            scene.add(this.headingArrow);
            scene.add(this.shipArrowX);
            scene.add(this.shipArrowY);
        }
    };

    return MapObjectActor;

});