/* global define */

define([
    'lodash',
    'three',
    'lib/FpsMeter'
], function(_, THREE, FpsMeter) {
    "use strict";

    var rendererId = 0;

    function SpaceObjectsRenderer(instrument) {
        var me = this;

        if (typeof(instrument) === 'undefined') {
            instrument = true;
        }

        this.width = 0;
        this.height = 0;

        this.scene = new THREE.Scene();

        this.loading = false;

        this.initLights();
        this.initCamera();

        this.initRenderer();

        this.ship = null;
        this.worldObjects = [];

        this.initialize();

        if (instrument) {
            var fpsMeter = new FpsMeter(),
                id = rendererId++;

            this._fpsMeter = fpsMeter;

            setInterval(function() {
                var fps = fpsMeter.getFps();
                if (fps > 0) {
                    console.log('renderer ' + id + ' rendering at ' + fps.toFixed(2) + ' FPS');
                }
            }, 1000);
        }
    }

    _.extend(SpaceObjectsRenderer.prototype, {
        initRenderer: function() {
            this.renderer = new THREE.WebGLRenderer({antialias: true});
            this.renderer.gammaInput = true;
            this.renderer.gammaOutput = true;
            this.renderer.setSize(this.width, this.height);
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

            this.renderer.setSize(width, height);

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.render();
        },
        render: function() {
            this.renderer.render(this.scene, this.camera);
        },
        updateShip: function(ship) {
            this.ship = ship;
            this.drawObjects();
        },
        updateObjects: function(objects) {
            this.worldObjects = objects;
            this.drawObjects();
        },
        animate: function() {
            var me = this;
            window.requestAnimationFrame(function() {
                me.animate();
            });

            this.render();

            if (me._fpsMeter) {
                me._fpsMeter.tick();
            }
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
