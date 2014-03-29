define(['../module', 'angular'], function (MapService, angular) {
    'use strict';

    MapService.directive('ssmMapLabel', ['THREE',
        function(THREE) {

            function toScreenXY(position, element, camera)
            {
                var pos = position.clone();
                var projScreenMat = new THREE.Matrix4();
                projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                pos.applyProjection(projScreenMat);

                return {
                    x: (pos.x + 1) * element.width() / 2,
                    y: (-pos.y + 1) * element.height() / 2
                };
            }

            return {

                template: '<div class="map-ship-label">{{mapobject.name}}</div>',

                replace: true,

                scope: {
                    mapobject: '=mapobject',
                    camera: '=camera'
                },

                link: function($scope, element, attrs) {

                    var map = angular.element(element).parent().parent();

                    $scope.$watch('mapobject', function() {

                        var mapobject = $scope.mapobject;

                        if (!mapobject) {
                            return;
                        }

                        var pos = toScreenXY(
                            new THREE.Vector3(
                                mapobject.position.x,
                                mapobject.position.y,
                                mapobject.position.z
                            ),
                            map,
                            $scope.camera
                        );

                        var label = element;

                        label.css('top', pos.y - (label.height() / 2));
                        label.css('left', pos.x + 3);

                    });

                }

            };

        }
    ]);

});