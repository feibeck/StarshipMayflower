/* global define */

define([
    'lodash',
    'three',
    'lib/FpsMeter',
    'stereoEffect'
], function(_, THREE, FpsMeter) {
    "use strict";

    var instanceId = 0;
    
    function SpaceObjectsRenderer(view3d) {
        var me = this;
        
        this.width = 0;
        this.height = 0;

        this.scene = new THREE.Scene();

        this.loading = false;

        this.initLights();
        this.initCamera();

        this.initRenderer(view3d);

        this.ship = null;
        this.worldObjects = [];

        this.initialize();

        this._renderThrottled = _.throttle(this.render.bind(this), 1000 / 30);

        this._fpsMeter = (new FpsMeter()).startLogging('SpaceObjectsRenderer ' + (instanceId++));
    }

    _.extend(SpaceObjectsRenderer.prototype, {
        initRenderer: function(view3d) {
            this.renderer = new THREE.WebGLRenderer({antialias: true});
            this.renderer.gammaInput = true;
            this.renderer.gammaOutput = true;

            if (view3d) {
                this.effect = new THREE.StereoEffect(this.renderer);
                this.effect.separation = 0.001;

                this.renderable = this.effect;
            } else {
                this.renderable = this.renderer;
            }

            this.renderable.setSize(this.width, this.height);
        },
        initLights: function() {
            // LIGHTS
            var ambientLight = new THREE.AmbientLight( 0x222222 );

            var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
            light.position.set( 200, 400, 500 );

            var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
            light2.position.set( -500, 250, -200 );

            this.scene.add(ambientLight);
            this.scene.add(light);
            this.scene.add(light2);
        },
        initCamera: function() {
            this.camera = new THREE.PerspectiveCamera(
                30,
                this.width / this.height,
                1,
                10000
            );

            this.camera.position.set(0, 240, -600);

            var center = new THREE.Vector3(0, 0, 0);
            this.camera.lookAt(center);
        },
        getDomElement: function() {
            return this.renderer.domElement;
        },
        setSize: function(width, height) {
            this.width = width;
            this.height = height;

            this.renderable.setSize(width, height);

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.render();
        },
        render: function() {
            this.renderable.render(this.scene, this.camera);
            this._fpsMeter.tick();
        },
        updateShip: function(ship) {
            this.ship = ship;
            this.drawObjects();
        },
        updateObjects: function(objects) {
            this.worldObjects = objects;
            this.drawObjects();

            this.scheduleRender();
        },
        animate: function() {
            this.scheduleRender();
        },
        scheduleRender: function() {
            this._renderThrottled();
        },
        drawObjects: function() {},
        initialize: function() {}
    });

    SpaceObjectsRenderer.extend = function(properties) {
        var child = function() {
            SpaceObjectsRenderer.apply(this, arguments);
        };

        child.prototype = _.create(SpaceObjectsRenderer.prototype);
        if (properties) {
            _.assign(child.prototype, properties);
        }

        return child;
    };

    return SpaceObjectsRenderer;
});
