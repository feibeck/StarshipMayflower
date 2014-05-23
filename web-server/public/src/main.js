require.config({

    paths: {
        'socketIo': '../js/lib/socket.io',
        'pomelo': '../js/lib/pomeloclient',
        'jquery': '../components/jquery/dist/jquery',
        'lodash': '../components/lodash/dist/lodash',
        'domReady': '../components/requirejs-domready/domReady',
        'angular': '../components/angular/angular',
        'uiRouter': '../components/angular-ui-router/release/angular-ui-router',
        'uiBootstrap': '../components/angular-bootstrap/ui-bootstrap-tpls',
        'three': '../components/three.js/three.min',
        'orbit-controls': '../js/lib/OrbitControls',
        'mtlloader': '../js/ThreeJsAddons/MTLLoader',
        'objloader': '../js/ThreeJsAddons/OBJLoader',
        'objmtlloader': '../js/ThreeJsAddons/OBJMTLLoader',
        'threexspaceships': '../components/threex.spaceships/threex.spaceships',
        'Grid': '../js/Map/Grid',
        'Constants': '../js/Map/Constants',
        'StarMap': '../js/Map/StarMap',
        'MapObject': '../js/Map/MapObject',
        'MapObjectBase': '../js/Map/MapObjectBase',
        'MapObjectPicker': '../js/Map/MapObjectPicker',
        'MapObjectActor': '../js/Map/MapObjectActor',
        'MapObjectTable': '../js/Map/MapObjectTable',
        'compass': '../js/Compass/compass',
        'rotation': '../js/Rotation/rotation',
        'scanner': '../js/Scanner/scanner',
        'ScannerObject': '../js/Scanner/ScannerObject',
        'paper': '../components/paper/dist/paper-core',
        'angle': '../js/Util/angle',
        'SpaceViewer': '../js/SpaceViewer/viewer',
        'SpaceObjectsRenderer': '../js/lib/SpaceObjectsRenderer'
    },

    shim: {
        'socketIo': {
            exports: 'socketIo'
        },
        'pomelo': {
            exports: 'pomelo',
            deps: ['socketIo']
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
    },

    deps: ['./bootstrap']
});
