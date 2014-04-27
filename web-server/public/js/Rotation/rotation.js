define([
    'three'
], function(THREE) {
    'use strict';

    function Rotation() {

        this.width = 0;
        this.height = 0;

        this.scene = new THREE.Scene();

        // LIGHTS
        var ambientLight = new THREE.AmbientLight( 0x222222 );

        var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light.position.set( 200, 400, 500 );

        var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light2.position.set( -500, 250, -200 );

        this.scene.add(ambientLight);
        this.scene.add(light);
        this.scene.add(light2);

        var material = new THREE.MeshBasicMaterial({
            color: 'lime',
            transparent: true,
            opacity: 0.5
        });

        var radius = 200;
        var segments = 32;

        var circleGeometry = new THREE.CircleGeometry( radius, segments );
        var circle = new THREE.Mesh( circleGeometry, material );

        circle.rotation.x = - Math.PI / 2;

        this.scene.add( circle );

        this.createAirplane();

        this.renderer = new THREE.WebGLRenderer({antialias: false});
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setSize(this.width, this.height);

        this.camera = new THREE.PerspectiveCamera( 30, this.width / this.height, 1, 10000 );
        this.camera.position.set(0, 240, -600);

        var center = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(center);
    }

    Rotation.prototype.createAirplane = function() {
        var planeMaterial = new THREE.MeshPhongMaterial({
            color: 0x95E4FB,
            specular: 0x505050,
            shininess: 100
        });

        this.airplane = new THREE.Object3D();

        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry( 15, 32, 16 ), planeMaterial );
        // nose
        sphere.rotation.x = 90 * Math.PI/180;
        sphere.scale.y = 3.0;
        sphere.position.y = 0;
        sphere.position.z = 70;
        this.airplane.add( sphere );

        var cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry( 15, 15, 180, 32 ), planeMaterial );
        // body
        cylinder.rotation.x = 90 * Math.PI/180;
        cylinder.position.y = 0;
        cylinder.position.z = -20;
        this.airplane.add( cylinder );

        cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry( 20, 20, 250, 32 ), planeMaterial );
        // wing
        cylinder.scale.x = 0.2;
        cylinder.rotation.z = 90 * Math.PI/180;
        cylinder.position.y = 5;
        this.airplane.add( cylinder );

        cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry( 15, 15, 100, 32 ), planeMaterial );
        // tail wing
        cylinder.scale.x = 0.2;
        cylinder.rotation.z = 90 * Math.PI/180;
        cylinder.position.y = 5;
        cylinder.position.z = -90;
        this.airplane.add( cylinder );

        cylinder = new THREE.Mesh(
            new THREE.CylinderGeometry( 10, 15, 40, 32 ), planeMaterial );
        // tail
        cylinder.scale.x = 0.15;
        cylinder.rotation.x = -10 * Math.PI/180;
        cylinder.position.y = 20;
        cylinder.position.z = -96;
        this.airplane.add( cylinder );

        this.scene.add(this.airplane);
    };

    Rotation.prototype.animate = function() {
        var me = this;
        window.requestAnimationFrame(function() {
            me.animate();
        });
        this.render();
    };

    Rotation.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    Rotation.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;

        this.renderer.setSize(width, height);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.render();
    };

    Rotation.prototype.getDomElement = function() {
        return this.renderer.domElement;
    };

    Rotation.prototype.updateShip = function(ship) {

        var rotationMatrix = new THREE.Matrix4(
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

        this.airplane.rotation.setFromRotationMatrix(rotationMatrix);
    };

    return Rotation;

});