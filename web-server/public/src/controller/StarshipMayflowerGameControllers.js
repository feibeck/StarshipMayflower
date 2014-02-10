(function() {
    'use strict';

    var StarshipMayflowerGameControllers = angular.module('StarshipMayflowerGameControllers', []);

    StarshipMayflowerGameControllers.controller('GameCtrl', ['$scope', '$location', 'Pomelo',

        function ($scope, $location, Pomelo) {
            Pomelo.on('ShipUpdate', function(ship) {
                $scope.ship = ship;
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
        }

        $scope.decelerate = function() {
            var impuls = $scope.impuls - 1;
            if (impuls < 0) {
                impuls = 0;
            }
            $scope.impuls = impuls;
            Pomelo.notify('world.rosterHandler.setImpulseSpeed', {targetSpeed: impuls});
        }

        }]);

    StarshipMayflowerGameControllers.controller('HelmCtrl', ['$scope', '$location', 'Pomelo',
        function ($scope, $location, Pomelo) {

        }]);

})();