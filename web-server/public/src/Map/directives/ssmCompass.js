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

                        var ship = $scope.ship;

                        var rotationMatrix = new THREE.Matrix4(
                            ship.orientation[0][0],
                            ship.orientation[0][1],
                            ship.orientation[0][2],
                            0,
                            ship.orientation[1][0],
                            ship.orientation[1][1],
                            ship.orientation[1][2],
                            0,
                            ship.orientation[2][0],
                            ship.orientation[2][1],
                            ship.orientation[2][2],
                            0,
                            0,
                            0,
                            0,
                            1
                        );

                        var euler = new THREE.Euler(0, 0, 0, 'ZXY');
                        euler.setFromRotationMatrix(rotationMatrix, 'ZXY');

                        var angleZ = euler.z * (180 / Math.PI);
                        if (angleZ < 0) {
                            angleZ = 360 + angleZ;
                        };

                        angleZ = 360 - angleZ;

                        compass.roll(angleZ);

                        var anglePitch = GameUtils.getAngle($scope.ship.heading.z, $scope.ship.heading.y);
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