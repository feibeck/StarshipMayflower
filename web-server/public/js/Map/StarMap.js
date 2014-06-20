define([
    'three',
    'Map/Constants',
    'Map/MapObjectTable',
    'Map/Grid',
    'Map/MapObject',
    'lodash',
    'Util/angle',
    'orbit-controls'
], function(THREE, Constants, MapObjectTable, Grid, MapObject, _, Angle) {
    'use strict';

    function Map() {

        this.width = 0;
        this.height = 0;

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: false});

        this.pickingScene = new THREE.Scene();
        this.pickingTexture = new THREE.WebGLRenderTarget(
            this.width,
            this.height
        );
        this.pickingTexture.generateMipmaps = false;

        this.attachMouseListeners(this.getDomElement());

        this.objectTable = new MapObjectTable();

        this.camera = new THREE.PerspectiveCamera(
            60,
            1,
            1,
            1000000000
        );
        this.camera.position.z = Constants.AU * 2;
        this.camera.position.x = Constants.AU * 2;
        this.camera.position.y = Constants.AU * 2;

        var center = new THREE.Vector3(
            Constants.AU,
            Constants.AU,
            Constants.AU
        );

        this.camera.lookAt(center);

        var controls = new THREE.OrbitControls(
            this.camera,
            this.getDomElement()
        );
        controls.target = center;

        var me = this;

        controls.addEventListener('change', function() {
            me.scaleModels();
            me.render();
        });

        this.scene.add(new Grid());

        this.shipMapObject = null;
        this.otherShipMapObjects = [];
        this.objectToShip = {};

        this.objectUnderMouse = null;
        this.selectedObject = null;

        this.selectionSphere = this.createSphere(0x00ff00);
        this.scene.add(this.selectionSphere);

        this.hoverSphere = this.createSphere(0xffff00);
        this.scene.add(this.hoverSphere);
    }

    Map.prototype = Object.create(THREE.EventDispatcher.prototype);

    Map.prototype.createSphere = function(color) {
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(8, 100, 100),
            new THREE.MeshBasicMaterial({
                color: color,
                opacity: 0.4,
                transparent: true
            })
        );
        sphere.position.x = 149597870;
        sphere.position.y = 149597870;
        sphere.position.z = 149597870;

        sphere.visible = false;

        return sphere;
    }

    Map.prototype.attachMouseListeners = function(element) {

        var scope = this;

        element.addEventListener('mousemove', function(e) {
            var rect = element.getBoundingClientRect();
            var mouseX = e.clientX - rect.left;
            var mouseY = e.clientY - rect.top;
            var selectedObject = scope.getObjectAt(mouseX, mouseY);

            if (selectedObject) {
                scope.hoverObject(scope.objectToShip[selectedObject.getId()]);
            } else {
                scope.hoverSphere.visible = false;
            }

            scope.objectUnderMouse = selectedObject;
        });

        element.addEventListener('click', function(e) {
            if (scope.objectUnderMouse) {
                scope.selectObject(scope.objectToShip[scope.objectUnderMouse.getId()]);
            } else {
                // TODO: Prevent collision with click for map control
                //scope.unselectObject();
            }
        });

    };

    Map.prototype.hoverObject = function(hoveredObject) {
        this.hoverSphere.position.x = hoveredObject.position.x;
        this.hoverSphere.position.y = hoveredObject.position.y;
        this.hoverSphere.position.z = hoveredObject.position.z;

        this.hoverSphere.visible = true;

        this.dispatchEvent(this.getHoverEvent(hoveredObject));
    };

    Map.prototype.unselectObject = function() {
        if (!this.selectedObject) {
            return;
        }
        this.selectedObject = null;
        this.selectionSphere.visible = false;
        this.dispatchEvent(this.getUnselectEvent());
    };

    Map.prototype.selectObject = function(selectedObject) {

        this.selectedObject = selectedObject;

        this.selectionSphere.position.x = selectedObject.position.x;
        this.selectionSphere.position.y = selectedObject.position.y;
        this.selectionSphere.position.z = selectedObject.position.z;

        this.selectionSphere.visible = true;

        var course = this.courseToSeletedObject();

        this.dispatchEvent(this.getSelectEvent(selectedObject, course));
    };

    Map.prototype.courseToSeletedObject = function() {

        if (!this.selectedObject) {
            return null;
        }

        var myShip = this.objectToShip[this.shipMapObject.getId()];

        var point1 = new THREE.Vector3(
            myShip.position.x,
            myShip.position.y,
            myShip.position.z
        );

        var point2 = new THREE.Vector3(
            this.selectedObject.position.x,
            this.selectedObject.position.y,
            this.selectedObject.position.z
        );

        var distance = point1.distanceTo(point2);

        var heading = point2.sub(point1);

        var angle = new Angle({
            heading: heading
        });

        var course = {
            distance: distance,
            heading: heading,
            angleZX: angle.getAzimuth(),
            angleYZ: angle.getPolar()
        };

        return course;
    };

    Map.prototype.getHoverEvent = function(mapObject) {
        return {
            type: 'hover',
            mapObject: mapObject
        };
    };

    Map.prototype.getSelectEvent = function(mapObject, course) {
        return {
            type: 'select',
            mapObject: mapObject,
            course: course
        };
    };

    Map.prototype.getUnselectEvent = function() {
        return {
            type: 'unselect'
        };
    };

    Map.prototype.getCamera = function() {
        return this.camera;
    };

    Map.prototype.getDomElement = function() {
        return this.renderer.domElement;
    };

    Map.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    Map.prototype.scaleModels = function() {
        var point1 = this.camera.position;
        var point2 = new THREE.Vector3(0, 0, 0);
        var distance = point1.distanceTo(point2);
        var shipSize = distance * 0.004;

        if (this.shipMapObject) {
            this.shipMapObject.scale(shipSize);
        }

        this.scaleSphere(this.selectionSphere, shipSize);
        this.scaleSphere(this.hoverSphere, shipSize);

        _.forIn(this.otherShipMapObjects, function(ship) {
            ship.scale(shipSize);
        });
    };

    Map.prototype.scaleSphere = function(sphere, shipSize) {

        var shipOriginalSize = 5;
        var factor = shipSize / shipOriginalSize;

        sphere.scale.x = factor * 3;
        sphere.scale.y = factor * 3;
        sphere.scale.z = factor * 3;
    };

    Map.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;

        this.renderer.setSize(width, height);

        this.pickingTexture.height = height;
        this.pickingTexture.width = width;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.render();
    };

    Map.prototype.getObjectAt = function(x, y) {

        this.renderer.render(this.pickingScene, this.camera, this.pickingTexture);

        var gl = this.renderer.getContext();
        var pixelBuffer = new Uint8Array(4);

        gl.readPixels(
            x,
            this.pickingTexture.height - y,
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixelBuffer
        );

        var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

        if (id == 0) {
            return null;
        } else {
            return this.objectTable.get(id);
        }
    };

    Map.prototype.updateShip = function(ship) {
        if (!ship) {
            return;
        }

        if (!this.shipMapObject) {
            var objectId = this.objectTable.getId();

            this.shipMapObject = new MapObject('lime', objectId, {orientation: true});
            this.shipMapObject.setRenderScene(this.scene);
            this.shipMapObject.setPickingScene(this.pickingScene);

            this.objectTable.set(objectId, this.shipMapObject);
            this.objectToShip[objectId] = ship;
        } else {
            this.objectToShip[this.shipMapObject.getId()] = ship;
        }

        this.shipMapObject.setPosition(ship.position.x, ship.position.y, ship.position.z);
        this.shipMapObject.setHeading(ship.heading.x, ship.heading.y, ship.heading.z);
        this.shipMapObject.setShipX(ship.shipX.x, ship.shipX.y, ship.shipX.z);
        this.shipMapObject.setShipY(ship.shipY.x, ship.shipY.y, ship.shipY.z);
    };

    Map.prototype.updateOtherships = function(ships) {

        var me = this;

        _.forIn(ships, function(ship) {

            if (!me.otherShipMapObjects[ship.id]) {
                var objectId = me.objectTable.getId();

                me.otherShipMapObjects[ship.id] = new MapObject('grey', objectId);
                me.otherShipMapObjects[ship.id].setRenderScene(me.scene);
                me.otherShipMapObjects[ship.id].setPickingScene(me.pickingScene);

                me.objectTable.set(objectId, me.otherShipMapObjects[ship.id]);
                me.objectToShip[objectId] = ship;
            } else {
                me.objectToShip[me.otherShipMapObjects[ship.id].getId()] = ship;
            }

            me.otherShipMapObjects[ship.id].setPosition(
                ship.position.x,
                ship.position.y,
                ship.position.z
            );
            me.otherShipMapObjects[ship.id].setHeading(
                ship.heading.x,
                ship.heading.y,
                ship.heading.z
            );

        });
    };

    return Map;

});
