/* global define */

define([
    'lodash',
    'three',
    'objmtlloader'
], function(_, THREE) {
    "use strict";

    var models = ['Starbase', 'station'],
        result = {};

    function loader (objUrl, mtlUrl) {
        return function (onLoad) {
            var loader = new THREE.OBJMTLLoader();

            loader.addEventListener('load', function(event) {
                var object3d = event.content;
                object3d.scale.multiplyScalar(1/300);
                // change emissive color of all object3d material - they are too dark
                object3d.traverse(function(object3d){
                    if( object3d.material ){
                        object3d.material.emissive.set('white');
                    }
                });

                // notify the callback
                if (_.isFunction(onLoad)) {
                    onLoad(object3d);
                }
            });

            loader.load(objUrl, mtlUrl);
        };
    }

    _.forIn(models, function(model) {
        var url = 'models/{model}/{model}'.replace(/\{[^}]+\}/g, function(match) {
            return model;
        });

        result[model] = loader(url + '.obj', url + '.mtl');
    });

    return result;
});
