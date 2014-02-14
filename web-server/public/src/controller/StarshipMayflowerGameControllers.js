(function() {
    'use strict';

    var StarshipMayflowerGameControllers = angular.module('StarshipMayflowerGameControllers', []);

    StarshipMayflowerGameControllers.controller('GameCtrl', ['$scope', '$location', 'Pomelo',

        function ($scope, $location, Pomelo) {

            function getAngle(x, y) {

                var theta = Math.asin(y / Math.sqrt(x*x + y*y));

                if (x < 0) {
                    theta = Math.PI - theta;
                }
                if (theta < 0) {
                    theta = 2 * Math.PI + theta;
                }

                return theta / Math.PI * 180;
            };

            Pomelo.on('ShipUpdate', function(ship) {
                $scope.ship = ship;


                $scope.angleZX = getAngle(-ship.heading.z, ship.heading.x);


                $scope.$apply();
            });

            $scope.impuls = 0;

            $scope.accelerate = function() {
                var impuls = $scope.impuls + 1;
                if (impuls > 100) {
                    impuls = 100;
                }
                $scope.impuls = impuls;
                Pomelo.notify('world.rosterHandler.setImpulseSpeed', {targetSpeed: impuls});
            };

            $scope.decelerate = function() {
                var impuls = $scope.impuls - 1;
                if (impuls < 0) {
                    impuls = 0;
                }
                $scope.impuls = impuls;
                Pomelo.notify('world.rosterHandler.setImpulseSpeed', {targetSpeed: impuls});
            };

            $scope.turn = function(arc) {
                console.log("Turn: ", arc);
                Pomelo.notify('world.rosterHandler.turn', {arc: arc});
            };

        }]);

    StarshipMayflowerGameControllers.controller('HelmCtrl', ['$scope', '$location', 'Pomelo',
        function ($scope, $location, Pomelo) {

        }]);

})();