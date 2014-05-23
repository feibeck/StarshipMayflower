define(['../module'], function (module) {
    'use strict';

    module.controller('DebugCtrl', ['$scope', '$location', 'Pomelo', 'GameUtils',
        function ($scope, $location, Pomelo, GameUtils) {
            Pomelo.on('ShipUpdate', function(ship) {
                $scope.azimuth = GameUtils.getAzimuth(ship);
                $scope.polar = GameUtils.getPolar(ship);
                $scope.$apply();
            });
        }
    ]);

});
