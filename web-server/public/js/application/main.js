require.config({

  baseUrl : '/js',

    paths: {
        'socket.io': '../components/socket.io-client/dist/socket.io',
        'pomelo': 'lib/pomeloclient',
        'jquery': '../components/jquery/dist/jquery',
        'lodash': '../components/lodash/dist/lodash',
        'domReady': '../components/requirejs-domready/domReady',
        'angular': '../components/angular/angular',
        'uiRouter': '../components/angular-ui-router/release/angular-ui-router',
        'uiBootstrap': '../components/angular-bootstrap/ui-bootstrap-tpls',
        'three': '../components/threejs-build/build/three.min',
        'orbit-controls': '../components/threejs-controls/controls/OrbitControls',
        'mtlloader': '../components/threejs-examples/examples/js/loaders/MTLLoader',
        'objloader': '../components/threejs-examples/examples/js/loaders/OBJLoader',
        'objmtlloader': '../components/threejs-examples/examples/js/loaders/OBJMTLLoader',
        'threexspaceships': '../components/threex.spaceships/threex.spaceships',
        'Grid': 'Map/Grid',
        'Constants': 'Map/Constants',
        'StarMap': 'Map/StarMap',
        'MapObject': 'Map/MapObject',
        'MapObjectBase': 'Map/MapObjectBase',
        'MapObjectPicker': 'Map/MapObjectPicker',
        'MapObjectActor': 'Map/MapObjectActor',
        'MapObjectTable': 'Map/MapObjectTable',
        'compass': 'Compass/compass',
        'rotation': 'Rotation/rotation',
        'scanner': 'Scanner/scanner',
        'ScannerObject': 'Scanner/ScannerObject',
        'paper': '../components/paper/dist/paper-core',
        'angle': 'Util/angle',
        'SpaceViewer': 'SpaceViewer/viewer',
        'SpaceObjectsRenderer': 'lib/SpaceObjectsRenderer',
        'ModelLoader': 'lib/ModelLoader'
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
        'threexspaceships': {
            deps: ['three', 'mtlloader', 'objloader', 'objmtlloader'],
            exports: 'THREEx',
            init: function() {
                this.THREEx.SpaceShips.baseUrl = '/components/threex.spaceships/';
            }
        }
    }
});

require(['application/bootstrap']);
