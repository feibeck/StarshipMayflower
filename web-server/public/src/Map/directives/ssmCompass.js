define([
    '../module',
    'angular',
    'compass'
], function (module, angular, Compass) {
    'use strict';

    module.directive('ssmCompass', ['GameUtils',
        function(GameUtils) {

            var compass = new Compass();

            return {

                template: '<div></div>',

                scope: {
                    ship: '=ship'
                },

                link: function($scope, element, attrs) {

                    element.append(compass.getDomElement());

                    $scope.$watch('ship', function() {

                        if (!$scope.ship) {
                            return;
                        }
                        compass.jaw(GameUtils.getAngle(-$scope.ship.heading.z, $scope.ship.heading.x));

                        compass.roll(GameUtils.getAngle($scope.ship.shipX.x, $scope.ship.shipX.y));

                        compass.pitch(GameUtils.getAngle(-$scope.ship.heading.z, $scope.ship.heading.y));

                        compass.draw();

                    });

                }

            };

        }
    ]);

});