define([
    '../module',
    'angular',
    'StarMap'
], function (module, angular, StarMap) {
    'use strict';

    module.directive('ssmMap', ['THREE', '$window',
        function(THREE, $window) {

            var map = new StarMap();

            function attachMouseListeners(elt) {
                elt.addEventListener('mousemove', function(e) {
                    var rect = elt.getBoundingClientRect();
                    var mouseX = e.clientX - rect.left;
                    var mouseY = e.clientY - rect.top;
                    var selectedObject = map.getObjectAt(mouseX, mouseY);

                    if (selectedObject) {
                        console.log('mouseover ship');// + objectToShip[selectedObject.getId()].name);
                    }
                });
            }

            var width;
            var height;

            return {

                templateUrl: '/src/Map/view/map.html',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                link: function($scope, element, attrs) {

                    $scope.camera = map.getCamera();

                    element.append(map.getDomElement());
                    attachMouseListeners(map.getDomElement());

                    map.setSize(element.width(), element.height());

                    var w = angular.element($window);
                    w.bind('resize', function() {
                        map.setSize(element.width(), element.height());
                    });

                    map.scaleModels();

                    $scope.$parent.$on('selected', function() {
                        map.setSize(element.width(), element.height());
                    });

                    $scope.$watch('ship', function() {
                        map.updateShip($scope.ship)
                        map.scaleModels();
                        map.render();
                    });

                    $scope.$watch('otherships', function() {
                        map.updateOtherships($scope.otherships)
                        map.scaleModels();
                        map.render();
                    });

                }

            };

        }
    ]);

});