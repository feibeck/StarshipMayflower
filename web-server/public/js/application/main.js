require.config({

  baseUrl : '/js',

    paths: {
        'socket.io': '../components/socket.io-client/dist/socket.io',
        'pomelo': 'lib/pomeloclient',
        'jquery': '../components/jquery/jquery',
        'lodash': '../components/lodash/lodash',
        'domReady': '../components/requirejs-domready/domReady',
        'angular': '../components/angular/angular',
        'uiRouter': '../components/angular-ui-router/release/angular-ui-router',
        'uiBootstrap': '../components/angular-bootstrap/ui-bootstrap-tpls',
        'three': '../components/threejs/build/three.min',
        'orbit-controls': '../components/threejs/examples/js/controls/OrbitControls',
        'stereoEffect': '../components/threejs/examples/js/effects/StereoEffect',
        'mtlloader': '../components/threejs/examples/js/loaders/MTLLoader',
        'objloader': '../components/threejs/examples/js/loaders/OBJLoader',
        'objmtlloader': '../components/threejs/examples/js/loaders/OBJMTLLoader',
        'threexspaceships': '../components/threex.spaceships/threex.spaceships',
        'paper': '../components/paper/dist/paper-core',
        'ModelLoader': 'lib/ModelLoader',
        'SpaceObjectsRenderer': 'lib/SpaceObjectsRenderer',
        'shared': 'Util/shared'
    },

    shim: {
        'pomelo': {
            exports: 'pomelo',
            deps: ['socket.io']
        },
        'angular': {
            exports: 'angular',
            deps: ['jquery']
        },
        'uiRouter': {
            deps: ['angular']
        },
        'uiBootstrap': {
            deps: ['angular']
        },
        'three': {
            exports: 'THREE'
        },
        'orbit-controls': {
            deps: ['three']
        },
        'mtlloader': ['three'],
        'objloader': ['three'],
        'objmtlloader': ['three'],
        'stereoEffect': ['three'],
        'threexspaceships': {
            deps: ['three', 'mtlloader', 'objloader', 'objmtlloader'],
            exports: 'THREEx',
            init: function() {
                this.THREEx.SpaceShips.baseUrl = '/components/threex.spaceships/';
            }
        },
        'shared': {
            exports: 'ssmfShared'
        }
    }
});

require(['application/bootstrap']);
