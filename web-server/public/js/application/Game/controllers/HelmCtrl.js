define(['../module', 'Util/angle'], function (module, Angle) {
    'use strict';

    module.controller('HelmCtrl', ['$scope', '$location', 'Pomelo', '$window', 'Target',
        function ($scope, $location, Pomelo, $window, Target) {

            var worldUpdateListener = function(world) {
                $scope.otherships = world.ships;
                $scope.$apply();
            };

            var shipUpdateListener = function(ship) {
                $scope.ship = ship;
                var angle = new Angle(ship);

                $scope.impuls = ship.targetImpulse;
                $scope.warpEngine = ship.warp;
                $scope.slowImpulse = ship.slowImpulse;

                $scope.azimuth = angle.getAzimuth();
                $scope.polar = angle.getPolar();
                $scope.$apply();
            };

            Pomelo.on('WorldUpdate', worldUpdateListener);
            Pomelo.on('ShipUpdate', shipUpdateListener);

            var targetListener = function(event) {
                $scope.selectedObject = event.currentTarget;
                $scope.course = event.course;
            };

            Target.addListener(targetListener);

            $scope.impuls = 0;
            $scope.warpEngine = null;
            $scope.slowImpulse = null;

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

            var keydown = function(e) {

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
            }

            var keyup = function(e) {

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

            }

            angular.element($window).on('keydown', keydown);
            angular.element($window).on('keyup', keyup);

            $scope.$on('$destroy', function() {
                angular.element($window).off();
                angular.element($window).off();
                Pomelo.off('WorldUpdate', worldUpdateListener);
                Pomelo.off('ShipUpdate', shipUpdateListener);
                Target.removeListener(targetListener);
            });

        }
    ]);

});
