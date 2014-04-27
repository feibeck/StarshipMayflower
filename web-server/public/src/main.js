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
        'slider': '../js/slider',
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
        'paper': '../components/paper/dist/paper-core'
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
        'slider': {
            deps: ['jquery']
        }
    },

    deps: ['./bootstrap']
});