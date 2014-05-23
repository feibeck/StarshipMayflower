/* global define */

define([
    'SpaceObjectsRenderer',
    'lodash',
    'three',
    'threexspaceships'
], function(SpaceObjectsRenderer, _, THREE, THREEx) {
    "use strict";

    var Viewer = SpaceObjectsRenderer.extend({
        initCamera: function() {
            this.camera = new THREE.PerspectiveCamera(
                45,
                this.width / this.height,
                0.001,
                1
            );

            this.camera.position.set(0, 0.03, -0.075);

            var center = new THREE.Vector3(0, 0, 0);
            this.camera.lookAt(center);
        },
        initialize: function() {
            var me = this;

            this.shipModel = null;

            THREEx.SpaceShips.loadSpaceFighter02(function(object3d){
                object3d.position.x = 0;
                object3d.position.y = 0;
                object3d.position.z = 0;

                object3d.scale.set(0.00012, 0.00012, 0.00012);

                me.scene.add(object3d);
                me.shipModel = object3d;
            });

            this.renderObjects = {};
        },
        drawObjects: function() {
            var me = this;

            if (!this.ship || !this.shipModel) {
                return;
            }

            var shipPosition = new THREE.Vector3(
                this.ship.position.x,
                this.ship.position.y,
                this.ship.position.z
            );

            _.forIn(this.worldObjects, function(object) {
                var obj;

                if (me.renderObjects[object.id]) {
                    obj = me.renderObjects[object.id];
                } else {
                    var SphereGeometry = new THREE.SphereGeometry(3, 3, 3),
                        material = new THREE.MeshBasicMaterial({color: 'white'});

                    obj = me.renderObjects[object.id] = new THREE.Mesh(SphereGeometry, material);
                    me.scene.add(obj);
                }

                obj.position = me.calculateLocalPosition(shipPosition, object);
            });
        },
        calculateLocalPosition: function(shipPosition, object) {
            var rotation = this.getShipRotationMatrix(),
                globalPosition = new THREE.Vector3(
                    object.position.x,
                    object.position.y,
                    object.position.z
                ),
                localPosition = globalPosition.sub(shipPosition),
                m1 = new THREE.Matrix4();

            localPosition.applyMatrix4(m1.getInverse(rotation));

            return localPosition;
        },
        getShipRotationMatrix: function() {
            var rotationMatrix = new THREE.Matrix4(
                this.ship.orientation[0][0],
                this.ship.orientation[0][1],
                this.ship.orientation[0][2],
                0,
                this.ship.orientation[1][0],
                this.ship.orientation[1][1],
                this.ship.orientation[1][2],
                0,
                this.ship.orientation[2][0],
                this.ship.orientation[2][1],
                this.ship.orientation[2][2],
                0,
                0,
                0,
                0,
                1
            );

            return rotationMatrix;
        }
    });

    return Viewer;
});
