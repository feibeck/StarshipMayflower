/* global define */

define([
    'SpaceObjectsRenderer',
    'lodash',
    'three',
    'threexspaceships'
], function(SpaceObjectsRenderer, _, THREE, THREEx) {
    "use strict";

    var Viewer = SpaceObjectsRenderer.extend({
        initialize: function() {
            var me = this;

            this.shipModel = null;

            THREEx.SpaceShips.loadSpaceFighter02(function(object3d){
                object3d.position.x = 0;
                object3d.position.y = 0;
                object3d.position.z = 0;

                object3d.scale.x = 0.65;
                object3d.scale.y = 0.65;
                object3d.scale.z = 0.65;

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
                    var SphereGeometry = new THREE.SphereGeometry(32, 32, 32),
                        material = new THREE.MeshBasicMaterial({color: 'white'});

                    obj = me.renderObjects[object.id] = new THREE.Mesh(SphereGeometry, material);
                    me.scene.add(obj);
                }

                obj.position = me.calculateLocalPosition(shipPosition, object);
            });
        },
        calculateLocalPosition: function(shipPosition, object) {
            var globalPosition = new THREE.Vector3(
                object.position.x,
                object.position.y,
                object.position.z
            );

            return globalPosition.sub(shipPosition);
        }
    });

    return Viewer;
});
