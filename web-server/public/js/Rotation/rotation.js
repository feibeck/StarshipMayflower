define([
    'three'
], function(THREE) {
    'use strict';

    function Rotation() {

        this.width = 0;
        this.height = 0;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

        // LIGHTS
        var ambientLight = new THREE.AmbientLight( 0x222222 );

        var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light.position.set( 200, 400, 500 );

        var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light2.position.set( -500, 250, -200 );

        this.scene.add(ambientLight);
        this.scene.add(light);
        this.scene.add(light2);

        this.drawGrid({size:10000,scale:0.01});

        this.createAllRings();

        this.createAirplane();

        this.renderer = new THREE.WebGLRenderer({antialias: false});
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColorHex( 0xAAAAAA, 1.0 );

        this.camera = new THREE.PerspectiveCamera( 30, this.width / this.height, 1, 10000 );
        this.camera.position.set( -668, 474, 210 );

        var center = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(center);
    }

    Rotation.prototype.createAirplane = function() {
        var planeMaterial = new THREE.MeshPhongMaterial( { color: 0x95E4FB, specular: 0x505050, shininess: 100 } );

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

    Rotation.prototype.createAllRings = function() {
        //create Rings
        this.ringx = this.createRing(200,0xFF0000,'x');
        this.ringy = this.createRing(175,0x00FF00,'y');
        this.ringz = this.createRing(150,0x0000FF,'z');

        //set up rotation hierarchy - assuming x -> y -> z intrinsic
        this.ringy.add(this.ringz);
        this.ringx.add(this.ringy);

        this.scene.add(this.ringx);
    };

    Rotation.prototype.createRing = function(radius,color,axis) {
        var sphere_radius = 12;

        var ringMaterial = new THREE.MeshLambertMaterial({color: color});

        //create ring shape
        var circleMesh = new THREE.Mesh(
            new THREE.TorusGeometry(radius,5,6,50),
            ringMaterial
        );

        var sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(sphere_radius,12,10),
            ringMaterial
        );
        sphereMesh.position.x = radius;

        var composite = new THREE.Object3D();
        composite.add(circleMesh);
        composite.add(sphereMesh);
        // composite.add(coneMesh);

        if (axis === 'x') {
            composite.rotation.y = Math.PI/2;
        } else if (axis === 'y') {
            composite.rotation.x = Math.PI/2;
        }

        var ringObj = new THREE.Object3D();
        ringObj.add(composite);

        return ringObj;

    }

    Rotation.prototype.drawGrid = function(params) {
        params = params || {};
        var size = params.size !== undefined ? params.size:100;
        var scale = params.scale !== undefined ? params.scale:0.1;
        var orientation = params.orientation !== undefined ? params.orientation:"x";
        var grid = new THREE.Mesh(
            new THREE.PlaneGeometry(size, size, size * scale, size * scale),
            new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true })
        );
        // Yes, these are poorly labeled! It would be a mess to fix.
        // What's really going on here:
        // "x" means "rotate 90 degrees around x", etc.
        // So "x" really means "show a grid with a normal of Y"
        //    "y" means "show a grid with a normal of X"
        //    "z" means (logically enough) "show a grid with a normal of Z"
        if (orientation === "x") {
            grid.rotation.x = - Math.PI / 2;
        } else if (orientation === "y") {
            grid.rotation.y = - Math.PI / 2;
        } else if (orientation === "z") {
            grid.rotation.z = - Math.PI / 2;
        }

        this.scene.add(grid);
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
            ship.orientation[1][0],
            ship.orientation[2][0],
            0,
            ship.orientation[0][1],
            ship.orientation[1][1],
            ship.orientation[2][1],
            0,
            ship.orientation[0][2],
            ship.orientation[1][2],
            ship.orientation[2][2],
            0,
            0,
            0,
            0,
            0
        );

        var euler = new THREE.Euler(0, 0, 0, 'XYZ');
        euler.setFromRotationMatrix(rotationMatrix, 'XYZ');

        this.airplane.rotation.x = - euler.x;
        this.airplane.rotation.y = - euler.y;
        this.airplane.rotation.z = - euler.z;

        this.ringx.rotation.x = this.airplane.rotation.x;
        this.ringy.rotation.y = this.airplane.rotation.y;
        this.ringz.rotation.z = this.airplane.rotation.z;
    };

    return Rotation;

});