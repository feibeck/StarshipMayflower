define([
    'three',
    'Constants',
    'MapObjectTable',
    'Grid',
    'MapObject',
    'angular',
    'orbit-controls'
], function(THREE, Constants, MapObjectTable, Grid, MapObject, angular) {
    'use strict';

    function Map() {

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: false});

        this.pickingScene = new THREE.Scene();
        this.pickingRenderer = new THREE.WebGLRenderer({antialias: false});
        this.pickingRenderTarget = null;

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
    };

    Map.prototype.getCamera = function() {
        return this.camera;
    };

    Map.prototype.getDomElement = function() {
        return this.renderer.domElement;
    }

    Map.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
        if (this.pickingRenderTarget) {
            this.pickingRenderer.render(this.pickingScene, this.camera);
        }
    };

    Map.prototype.scaleModels = function() {
        var point1 = this.camera.position;
        var point2 = new THREE.Vector3(0, 0, 0);
        var distance = point1.distanceTo(point2);
        var shipSize = distance * 0.004;

        if (this.shipMapObject) {
            this.shipMapObject.scale(shipSize);
        }

        angular.forEach(this.otherShipMapObjects, function(ship) {
            ship.scale(shipSize);
        });
    };

    Map.prototype.createPickingRenderTarget = function(width, height) {
        if (this.pickingRenderTarget) {
            this.pickingRenderTarget.dispose();
        }

        this.pickingRenderTarget = new THREE.WebGLRenderTarget(width, height, {
            depthBuffer: false,
            stencilBuffer: false,
            generateMipmaps: false,
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType
        });

        this.pickingRenderer.setRenderTarget(this.pickingRenderTarget);
    };

    Map.prototype.setSize = function(width, height) {
        this.renderer.setSize(width, height);
        this.pickingRenderer.setSize(width, height);

        this.createPickingRenderTarget(width, height);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.render();
    };

    Map.prototype.getObjectAt = function(x, y) {
        if (!this.pickingRenderTarget) {
            return undefined;
        }

        var gl = this.pickingRenderer.getContext();
        var pixelBuffer = new Uint8Array(4);
        gl.readPixels(
            x,
            this.pickingRenderTarget.height - y,
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixelBuffer
        );

        var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

        return this.objectTable.get(id);
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
        }

        this.shipMapObject.setPosition(ship.position.x, ship.position.y, ship.position.z);
        this.shipMapObject.setHeading(ship.heading.x, ship.heading.y, ship.heading.z);
        this.shipMapObject.setShipX(ship.shipX.x, ship.shipX.y, ship.shipX.z);
        this.shipMapObject.setShipY(ship.shipY.x, ship.shipY.y, ship.shipY.z);
    }

    Map.prototype.updateOtherships = function(ships) {

        var me = this;

        angular.forEach(ships, function(ship) {

            if (!me.otherShipMapObjects[ship.id]) {
                var objectId = me.objectTable.getId();

                me.otherShipMapObjects[ship.id] = new MapObject('grey', objectId);
                me.otherShipMapObjects[ship.id].setRenderScene(me.scene);
                me.otherShipMapObjects[ship.id].setPickingScene(me.pickingScene);

                me.objectTable.set(objectId, me.otherShipMapObjects[ship.id]);
                me.objectToShip[objectId] = ship;
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
    }

    return Map;

});