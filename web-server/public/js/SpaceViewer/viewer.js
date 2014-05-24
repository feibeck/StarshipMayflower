/* global define */

define([
    'SpaceObjectsRenderer',
    'lodash',
    'three',
    'ModelLoader'
], function(SpaceObjectsRenderer, _, THREE, ModelLoader) {
    "use strict";

    var Viewer = SpaceObjectsRenderer.extend({
        initCamera: function() {
            this.camera = new THREE.PerspectiveCamera(
                45,
                this.width / this.height,
                0.001,
                10000
            );

            this.camera.position.set(0, 0.03, -0.075);

            var center = new THREE.Vector3(0, 0.02, 0);
            this.camera.lookAt(center);
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
                        model.position.x = 0;
                        model.position.y = 0;
                        model.position.z = 0;

                        me.scene.add(model);
                        me.shipModel = model;
                        me.loading = false;
                    });
                }

            }

            if (this.loading || !this.ship || !this.shipModel) {
                return;
            }

            var shipPosition = new THREE.Vector3(
                this.ship.position.x,
                this.ship.position.y,
                this.ship.position.z
            );

            _.forIn(this.worldObjects, function(object) {

                if (me.renderObjects[object.id]) {
                    me.renderObjects[object.id].position = me.calculateLocalPosition(shipPosition, object);
                    if (me.renderObjects[object.id].centeroid) {
                        me.renderObjects[object.id].position.x -= me.renderObjects[object.id].centeroid.x;
                        me.renderObjects[object.id].position.y -= me.renderObjects[object.id].centeroid.y;
                        me.renderObjects[object.id].position.z -= me.renderObjects[object.id].centeroid.z;
                    }
                } else {
                    me.loadObjectSpaceStation(object, object.id);
                }

            });
        },

        loadObjectSpaceStation: function(object, objectId)
        {
            var me = this;
            me.loading = true;
            ModelLoader.loadModel(object, function(object3d){
                me.scene.add(object3d);
                me.renderObjects[objectId] = object3d;
                me.loading = false;
                me.drawObjects();
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
