/* global define */

define([
    'SpaceObjectsRenderer',
    'lodash',
    'three',
    'ModelLoader',
    'stereoEffect'
], function(SpaceObjectsRenderer, _, THREE, ModelLoader) {
    "use strict";

    var Viewer = SpaceObjectsRenderer.extend({

        initCamera: function() {
            this.camera = new THREE.PerspectiveCamera(
                45,
                this.width / this.height,
                0.001,
                1500000
            );
        },

        initialize: function() {
            var me = this;
            this.shipModel = null;
            this.renderObjects = {};
        },

        drawObjects: function() {

            var me = this;

            if (this.ship && !this.shipModel) {

                if (!this.loading) {
                    this.loading = true;
                    ModelLoader.loadModel(this.ship, function (model) {

                        model.position.set(
                            0 - model.centeroid.x,
                            0 - model.centeroid.y,
                            0 - model.centeroid.z
                        );

                        me.scene.add(model);
                        me.shipModel = model;
                        me.loading = false;
                    });
                }

            }

            if (this.loading || !this.ship || !this.shipModel) {
                return;
            }

            this.placeShip();
            this.placeCamera();

            _.forIn(this.worldObjects, function(object) {
                if (me.renderObjects[object.id]) {
                    me.placeObject(object);
                } else {
                    me.loadModel(object);
                }
            });
        },

        placeObject: function(object)
        {
            var me = this;

            me.renderObjects[object.id].rotation.setFromRotationMatrix(me.getShipRotationMatrix(object))

            var position = new THREE.Vector3(
                object.position.x,
                object.position.y,
                object.position.z
            );

            var shipPosition = new THREE.Vector3(
                this.ship.position.x,
                this.ship.position.y,
                this.ship.position.z
            );

            position.sub(shipPosition);

            if (me.renderObjects[object.id].centeroid) {
                position.x -= me.renderObjects[object.id].centeroid.x;
                position.y -= me.renderObjects[object.id].centeroid.y;
                position.z -= me.renderObjects[object.id].centeroid.z;
            }

            me.renderObjects[object.id].position.set(position.x, position.y, position.z);
        },

        placeShip: function()
        {
            var matrix = this.getShipRotationMatrix(this.ship);
            this.shipModel.rotation.setFromRotationMatrix(matrix);
        },

        placeCamera: function()
        {
            var matrix = this.getShipRotationMatrix(this.ship);

            var position = new THREE.Vector3(
                0,
                0,
                0
            );

            var direction = new THREE.Vector3(0, 0, 1);
            direction.applyMatrix4(matrix);
            direction.setLength(0.03);
            position.sub(direction);

            var direction = new THREE.Vector3(0, 1, 0);
            direction.applyMatrix4(matrix);
            direction.setLength(0.015);
            position.add(direction);

            this.camera.position.set(position.x, position.y, position.z);

            var cameraMatrix = new THREE.Matrix4();
            cameraMatrix.set(
                -1, 0, 0,
                0,
                0, 1, 0,
                0,
                0, 0, -1,
                0,
                0,
                0,
                0,
                1
            );

            matrix.multiply(cameraMatrix);

            this.camera.rotation.setFromRotationMatrix(matrix);

            this.scheduleRender();
        },

        loadModel: function(object)
        {
            var me = this;
            me.loading = true;
            ModelLoader.loadModel(object, function(object3d){
                me.scene.add(object3d);
                me.renderObjects[object.id] = object3d;
                me.loading = false;

                me.drawObjects();
            });
        },

        getShipRotationMatrix: function(ship) {
            var rotationMatrix = new THREE.Matrix4();
            rotationMatrix.set(
                ship.orientation[0][0],
                ship.orientation[0][1],
                ship.orientation[0][2],
                0,
                ship.orientation[1][0],
                ship.orientation[1][1],
                ship.orientation[1][2],
                0,
                ship.orientation[2][0],
                ship.orientation[2][1],
                ship.orientation[2][2],
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
