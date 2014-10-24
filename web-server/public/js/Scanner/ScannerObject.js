define([
    'three',
    'lodash'
], function(THREE, _) {
    'use strict';

    function ScannerObject(object, scene) {
        this.object = object;
        this.scene = scene;

        this.show = true;

        this.create('grey');
    }

    ScannerObject.prototype.updateObject = function(object) {
        this.object = object;
        this.setPosition();
    }

    ScannerObject.prototype.setPosition = function() {

        var x = this.object.localPosition.x;
        var y = this.object.localPosition.y;
        var z = this.object.localPosition.z;

        this.sphere.position.set(x, y, z);
        this.sphere2.position.set(x, 0, z);

        this.objectProjectionLine.geometry.vertices[0].x = x;
        this.objectProjectionLine.geometry.vertices[0].y = 0;
        this.objectProjectionLine.geometry.vertices[0].z = z;

        this.objectProjectionLine.geometry.vertices[1].x = x;
        this.objectProjectionLine.geometry.vertices[1].y = y;
        this.objectProjectionLine.geometry.vertices[1].z = z;

        this.objectProjectionLine.geometry.verticesNeedUpdate = true;

    }

    ScannerObject.prototype.showOnScanner = function(show) {

        if (show && !this.show) {
            this.scene.add(this.sphere);
            this.scene.add(this.sphere2);
            this.scene.add(this.objectProjectionLine);
            this.show = true;
        } else if (!show && this.show) {
            this.scene.remove(this.sphere);
            this.scene.remove(this.sphere2);
            this.scene.remove(this.objectProjectionLine);
            this.show = false;
        }

    }

    ScannerObject.prototype.create = function(color) {

        var SphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: color} );
        this.sphere = new THREE.Mesh( SphereGeometry, material );

        this.scene.add(this.sphere);

        var SphereGeometry2 = new THREE.SphereGeometry( 1.4, 32, 32 );
        var material2 = new THREE.MeshBasicMaterial( {color: color} );
        this.sphere2 = new THREE.Mesh( SphereGeometry2, material2 );

        this.scene.add(this.sphere2);

        var LineGeometry = new THREE.Geometry();
        LineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        LineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        this.objectProjectionLine = new THREE.Line(
            LineGeometry,
            new THREE.LineBasicMaterial({
                color: color,
                linewidth: 2
            })
        );

        this.objectProjectionLine.geometry.dynamic = true;
        this.scene.add(this.objectProjectionLine);

        this.setPosition();
    };

    return ScannerObject;

});
