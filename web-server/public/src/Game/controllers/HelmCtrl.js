define(['../module', 'angle'], function (module, Angle) {
    'use strict';

    module.controller('HelmCtrl', ['$scope', '$location', 'Pomelo', '$window',
        function ($scope, $location, Pomelo, $window) {

            Pomelo.on('WorldUpdate', function(world) {
                $scope.otherships = world.ships;
                $scope.$apply();
            });

            Pomelo.on('ShipUpdate', function(ship) {
                var angle = new Angle(ship);
                $scope.azimuth = angle.getAzimuth();
                $scope.polar = angle.getPolar();
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

            $scope.$watch('slowImpulse', function() {
                if ($scope.slowImpulse == null) {
                    return;
                }
                Pomelo.notify('world.navigation.setSlowImpulse', {slowImpulse: $scope.slowImpulse})
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
