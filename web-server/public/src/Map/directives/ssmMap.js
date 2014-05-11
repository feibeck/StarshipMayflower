define([
    '../module',
    'angular',
    'StarMap'
], function (module, angular, StarMap) {
    'use strict';

    module.directive('ssmMap', ['$window', '$interval',
        function($window, $interval) {

            var map = new StarMap();

            return {

                templateUrl: '/src/Map/view/map.html',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                link: function($scope, element, attrs) {

                    $scope.camera = map.getCamera();

                    element.append(map.getDomElement());

                    map.setSize(element.width(), element.height());

                    var w = angular.element($window);
                    w.bind('resize', function() {
                        map.setSize(element.width(), element.height());
                    });

                    $scope.$parent.$on('selected', function() {
                        map.setSize(element.width(), element.height());
                    });

                    map.addEventListener('select', function(event) {
                        $scope.$parent.selectedObject = event.mapObject;
                        $interval(function() {
                            $scope.$parent.course = map.courseToSeletedObject();
                        }, 100);

                    });

                    $scope.$watch('ship', function() {
                        map.updateShip($scope.ship);
                        map.scaleModels();
                        map.render();
                    });

                    $scope.$watch('otherships', function() {
                        map.updateOtherships($scope.otherships);
                        map.scaleModels();
                        map.render();
                    });

                }

            };

        }
    ]);

});