define([
    'three',
    'ModelLoader'
], function(THREE, ModelLoader) {
    'use strict';

    function Rotation() {

        this.width = 0;
        this.height = 0;
        this.loading = false;

        this.scene = new THREE.Scene();

        // LIGHTS
        var ambientLight = new THREE.AmbientLight( 0x222222 );

        var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light.position.set(2, 4, 5);

        var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
        light2.position.set(-5, 2.5, -2);

        this.scene.add(ambientLight);
        this.scene.add(light);
        this.scene.add(light2);

        var material = new THREE.MeshBasicMaterial({
            color: 'lime',
            transparent: true,
            opacity: 0.3
        });

        var radius = 0.025;
        var segments = 32;

        var circleGeometry = new THREE.CircleGeometry( radius, segments );
        var circle = new THREE.Mesh( circleGeometry, material );

        circle.rotation.x = - Math.PI / 2;

        this.scene.add( circle );

        this.renderer = new THREE.WebGLRenderer({antialias: false});
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setSize(this.width, this.height);

        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.01, 1);
        this.camera.position.set(0, 0.01, -0.045);

        var center = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(center);

        var me = this;

        this.shipModel = null;
    }

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

    Rotation.prototype.loadShipModel = function(ship) {
        var me = this;

        ModelLoader.loadModel(ship, function(object3d) {
            object3d.position.x = 0;
            object3d.position.y = 0;
            object3d.position.z = 0;

            me.scene.add(object3d);
            me.shipModel = object3d;
            me.loading = false;
        });
    };

    Rotation.prototype.updateShip = function(ship) {

        if (this.shipModel == null) {
            if (!this.loading) {
                this.loading = true;
                this.loadShipModel(ship);
            }
            return;
        }

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

        this.shipModel.rotation.setFromRotationMatrix(rotationMatrix);
    };

    return Rotation;

});