define(['../module'], function (module) {
    'use strict';

    module.controller('HelmCtrl', ['$scope', '$location', 'Pomelo', 'GameUtils', '$window',
        function ($scope, $location, Pomelo, GameUtils, $window) {

            Pomelo.on('WorldUpdate', function(world) {
                $scope.otherships = world.ships;
                $scope.$apply();
            });

            Pomelo.on('ShipUpdate', function(ship) {

                $scope.angleZX = GameUtils.getAngle(-ship.heading.z, ship.heading.x);

                var angle = GameUtils.getAngle(ship.heading.z, ship.heading.y);
                if (angle > 90 && angle <= 180) {
                    angle = 180 - angle;
                }
                if (angle > 270 && angle <= 360) {
                    angle = (360 - angle) * -1;
                }
                if (angle > 180 && angle <= 270) {
                    angle = 180 - angle;
                }
                $scope.angleYZ = angle;

                $scope.$apply();

            });

            $scope.impuls = 0;
            $scope.warpEngine = 0;

            var turning = false;
            $scope.rotate = function(axis, arc) {
                if ((arc != 0 && !turning) || arc == 0) {
                    Pomelo.notify('world.navigation.turn', {arc: arc, axis: axis});
                    turning = arc != 0;
                }
            };

            $scope.$watch('warpEngine', function() {
                if ($scope.warpEngine == null) {
                    return;
                }
                Pomelo.notify('world.navigation.setWarp', {warp: $scope.warpEngine})
            });

            angular.element($window).on('keydown', function(e) {

                switch (e.keyCode) {

                    case 87: // w
                        $scope.rotate('pitch', 10);
                        break;
                    case 83: // s
                        $scope.rotate('pitch', -10);
                        break;

                    case 81: // q
                        $scope.rotate('roll', -10);
                        break;
                    case 69: // e
                        $scope.rotate('roll', 10);
                        break;

                    case 65: // a
                        $scope.rotate('yaw', 10);
                        break;
                    case 68: // d
                        $scope.rotate('yaw', -10);
                        break;

                }
            });

            angular.element($window).on('keyup', function(e) {

                switch (e.keyCode) {

                    case 81: // q
                    case 69: // e
                        $scope.rotate('roll', 0);
                        break;

                    case 87: // w
                    case 83: // s
                        $scope.rotate('pitch', 0);
                        break;

                    case 65: // a
                    case 68: // d
                        $scope.rotate('yaw', 0);
                        break;

                }

            });

        }
    ]);

});
