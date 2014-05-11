define([
    '../module',
    'angular',
    'rotation'
], function (module, angular, Rotation) {
    'use strict';

    module.directive('rotation', ['THREE', '$window', '$interval',
        function(THREE, $window, $interval) {

            var map = new Rotation();

            return {

                template: '<div></div>',

                scope: {
                    ship: '=ship'
                },

                link: function($scope, element, attrs) {

                    element.append(map.getDomElement());
                    map.setSize(element.width(), element.height());

                    $scope.$watch('ship', function() {
                        if ($scope.ship == null) {
                            return;
                        }
                        map.updateShip($scope.ship);
                    });

                    map.animate();

                }

            };

        }
    ]);

});