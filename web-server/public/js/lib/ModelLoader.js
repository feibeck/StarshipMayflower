/* global define */

define([
    'lodash',
    'three',
    'mtlloader',
    'objloader',
    'objmtlloader'
], function(_, THREE) {
    "use strict";

        var getCentroid = function ( boundingBox, object ) {

            var x0 = boundingBox.min.x;
            var x1 = boundingBox.max.x;
            var y0 = boundingBox.min.y;
            var y1 = boundingBox.max.y;
            var z0 = boundingBox.min.z;
            var z1 = boundingBox.max.z;

            var bWidth = ( x0 > x1 ) ? x0 - x1 : x1 - x0;
            var bHeight = ( y0 > y1 ) ? y0 - y1 : y1 - y0;
            var bDepth = ( z0 > z1 ) ? z0 - z1 : z1 - z0;

            var centroidX = x0 + ( bWidth / 2 ) + object.position.x;
            var centroidY = y0 + ( bHeight / 2 )+ object.position.y;
            var centroidZ = z0 + ( bDepth / 2 ) + object.position.z;

            return { x : centroidX, y : centroidY, z : centroidZ };

        }

        return {

            loadSpaceFighter02: function(onLoad){
                var loader	= new THREE.OBJMTLLoader();

                var baseUrl	= '/components/threex.spaceships/';
                var objUrl	= baseUrl + 'models/SpaceFighter02/SpaceFighter02.obj';
                var mtlUrl	= baseUrl + 'models/SpaceFighter02/SpaceFighter02.mtl';

                loader.load(objUrl, mtlUrl, function ( object3d ) {

                    object3d.scale.multiplyScalar(1/200);

                    // change emissive color of all object3d material - they are too dark
                    object3d.traverse(function(object3d){
                        if( object3d.material ){
                            object3d.material.emissive.set('white')
                        }
                    });

                    // notify the callback
                    onLoad	&& onLoad(object3d)

                } );
            },

            loadSpaceStation1: function(onLoad){
                var loader	= new THREE.OBJMTLLoader();

                var baseUrl	= '/models/SpaceStation01/'
                var objUrl	= baseUrl + 'SpaceStation01.obj';
                var mtlUrl	= baseUrl + 'SpaceStation01.mtl';

                loader.load(objUrl, mtlUrl, function ( object3d ) {

                    var box = new THREE.Box3().setFromObject(object3d);
                    var spaceStationHeight = 3;

                    var scale = spaceStationHeight / (box.max.y - box.min.y);
                    object3d.scale.multiplyScalar(scale);

                    var box = new THREE.Box3().setFromObject(object3d);

                    object3d.centeroid = getCentroid(box, object3d);

                    // change emissive color of all object3d material - they are too dark
                    object3d.traverse(function(object3d){
                        if( object3d.material ){
                            object3d.material.emissive.set('white')
                        }
                    })
                    // notify the callback
                    onLoad	&& onLoad(object3d)

                } );
            }

        };

});
