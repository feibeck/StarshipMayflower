define(['../module'], function (module) {
    'use strict';

    module.controller('DebugCtrl', ['$scope', '$location', 'Pomelo', 'GameUtils',
        function ($scope, $location, Pomelo, GameUtils) {
            Pomelo.on('ShipUpdate', function(ship) {
                $scope.angleZX = GameUtils.getAngle(-ship.heading.z, ship.heading.x);
                $scope.angleYZ = GameUtils.getAngle(-ship.heading.z, ship.heading.y);
                $scope.$apply();
            });
        }
    ]);

});
