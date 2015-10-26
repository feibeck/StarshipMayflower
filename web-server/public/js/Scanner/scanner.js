define([
    'three',
    'lodash',
    './ScannerObject',
    'lib/FpsMeter'
], function(THREE, _, ScannerObject, FpsMeter) {
    'use strict';

    function Scanner() {

        this.width = 0;
        this.height = 0;

        this.scene = new THREE.Scene();

        this.initLights();
        this.initCamera();

        this.addScannerPlane();

        this.initRenderer();

        this.ship = null;
        this.worldObjects = [];
        this.scannerObjects = [];

        this._renderThrottled = _.throttle(this.render.bind(this), 1000 / 30);

        this.ranges = [
            40,
            200,
            1000,
            5000,
            25000,
            125000,
            625000,
            3125000,
            15625000,
            78125000
        ];

        this.factor = 0;

        this._fpsMeter = (new FpsMeter()).startLogging('Scanner');
    }

    Scanner.prototype.setRangeFactor = function(factor) {
        if (factor >= 1 && factor <= 10) {
            this.factor = factor - 1;
            this.drawObjects();
        }
    };

    Scanner.prototype.getRange = function() {
        return this.ranges[this.factor];
    }

    Scanner.prototype.updateObjects = function(objects) {
        this.worldObjects = objects;
        this.drawObjects();
        this.scheduleRender();
    };

    Scanner.prototype.drawObjects = function() {

        if (!this.ship) {
            return;
        }

        var shipPosition = new THREE.Vector3(
            this.ship.position.x,
            this.ship.position.y,
            this.ship.position.z
        );

        var me = this;

        _.forIn(this.worldObjects, function(object) {

            me.calculateLocalPosition(object);

            var objectPosition = new THREE.Vector3(
                object.position.x,
                object.position.y,
                object.position.z
            );

            if (!me.scannerObjects[object.id]) {
                me.scannerObjects[object.id] = new ScannerObject(
                    object,
                    me.scene
                );
            } else {
                me.scannerObjects[object.id].updateObject(
                    object
                );
            }

            me.scannerObjects[object.id].showOnScanner(
                shipPosition.distanceTo(objectPosition) <= me.getRange()
            );

        });

    };

    Scanner.prototype.calculateLocalPosition = function(object) {

        var rotation = this.getShipRotationMatrix();

        var move = new THREE.Vector3(
            this.ship.position.x,
            this.ship.position.y,
            this.ship.position.z
        );

        var obj = new THREE.Object3D();

        var globalPosition = new THREE.Vector3(
            object.position.x,
            object.position.y,
            object.position.z
        );

        var localPosition = globalPosition.sub(move);

        var m1 = new THREE.Matrix4();
        localPosition.applyMatrix4(m1.getInverse(rotation));

        object.localPosition = {
            x: (250 / this.getRange()) * localPosition.x,
            y: (250 / this.getRange()) * localPosition.y,
            z: (250 / this.getRange()) * localPosition.z
        };

    };

    Scanner.prototype.getShipRotationMatrix = function() {

        var ship = this.ship;

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
    };

    Scanner.prototype.updateShip = function(ship) {
        this.ship = ship;
        this.drawObjects();
    };

    Scanner.prototype.addScannerPlane = function() {

        this.addFilledCircle();
        this.addCircle(50);
        this.addCircle(100);
        this.addCircle(150);
        this.addCircle(200);
        this.addCircle(250);

        var LineMaterial = new THREE.LineBasicMaterial({
            color: 'lime',
            linewidth: 1.5
        });

        var LineGeometry1 = new THREE.Geometry();
        LineGeometry1.vertices.push(new THREE.Vector3(0, 0, -250));
        LineGeometry1.vertices.push(new THREE.Vector3(0, 0, 250));

        var line1 = new THREE.Line(
            LineGeometry1,
            LineMaterial
        );

        this.scene.add(line1);

        var LineGeometry2 = new THREE.Geometry();
        LineGeometry2.vertices.push(new THREE.Vector3(-250, 0, 0));
        LineGeometry2.vertices.push(new THREE.Vector3(250, 0, 0));

        var line2 = new THREE.Line(
            LineGeometry2,
            LineMaterial
        );

        this.scene.add(line2);


        var geometry = new THREE.SphereGeometry( 5, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 'lime'} );
        var sphere = new THREE.Mesh( geometry, material );
        this.scene.add(sphere);

    };

    Scanner.prototype.initRenderer = function() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setSize(this.width, this.height);
    };

    Scanner.prototype.addCircle = function(radius) {
        var geometry    = new THREE.TorusGeometry(radius, .5 , 50 ,50);
        var material    = new THREE.MeshBasicMaterial({color: 'lime'});
        var mesh    = new THREE.Mesh( geometry, material );
        mesh.rotation.x = - Math.PI / 2;
        this.scene.add(mesh);
    };

    Scanner.prototype.addFilledCircle = function() {
        var material = new THREE.MeshBasicMaterial({
            color: 'lime',
            transparent: true,
            opacity: 0.2
        });

        var radius = 250;
        var segments = 128;

        var circleGeometry = new THREE.CircleGeometry( radius, segments );
        var circle = new THREE.Mesh( circleGeometry, material );

        circle.rotation.x = - Math.PI / 2;

        this.scene.add( circle );
    };

    Scanner.prototype.initLights = function() {
        // LIGHTS
        var ambientLight = new THREE.AmbientLight( 0x222222 );

        var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light.position.set( 200, 400, 500 );

        var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light2.position.set( -500, 250, -200 );

        this.scene.add(ambientLight);
        this.scene.add(light);
        this.scene.add(light2);
    }

    Scanner.prototype.initCamera = function() {
        this.camera = new THREE.PerspectiveCamera(
            30,
            this.width / this.height,
            1,
            10000
        );

        this.camera.position.set(0, 240, -600);

        var center = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(center);
    };

    Scanner.prototype.animate = function() {
        this.scheduleRender();
    };

    Scanner.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
        this._fpsMeter.tick();
    };

    Scanner.prototype.scheduleRender = function() {
        this._renderThrottled();
    };

    Scanner.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;

        this.renderer.setSize(width, height);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.scheduleRender();
    };

    Scanner.prototype.getDomElement = function() {
        return this.renderer.domElement;
    };

    return Scanner;

});
