define([
    '../module',
    'angular',
    'compass'
], function (module, angular, Compass) {
    'use strict';

    module.directive('compass', ['GameUtils',
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

                        compass.jaw(
                            GameUtils.getAngle(
                                -$scope.ship.heading.z,
                                $scope.ship.heading.x
                            )
                        );

                        var angle = GameUtils.getAngle(
                            $scope.ship.shipY.x,
                            $scope.ship.shipY.y
                        );

                        if (angle > 90) {
                            angle = angle - 90;
                        } else {
                            angle = 270 + angle;
                        }

                        compass.roll(angle);

                        var anglePitch = GameUtils.getAngle(
                            $scope.ship.heading.z,
                            $scope.ship.heading.y
                        );

                        if (anglePitch > 90 && anglePitch <= 180) {
                            anglePitch = 180 - anglePitch;
                        }
                        if (anglePitch > 270 && anglePitch <= 360) {
                            anglePitch = (360 - anglePitch) * -1;
                        }
                        if (anglePitch > 180 && anglePitch <= 270) {
                            anglePitch = 180 - anglePitch;
                        }
                        compass.pitch(anglePitch);

                        compass.draw();

                    });

                }

            };

        }
    ]);

});