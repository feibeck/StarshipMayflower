define(['../module', 'Util/angle'], function (module, Angle) {
    'use strict';

    module.controller('DebugCtrl', ['$scope', '$location', 'Pomelo',

        function ($scope, $location, Pomelo) {

            var shipUpdateListener = function(ship) {
                $scope.ship = ship;
                var angle = new Angle(ship);
                $scope.azimuth = angle.getAzimuth();
                $scope.polar = angle.getPolar();
                $scope.$apply();
            };

            Pomelo.on('ShipUpdate', shipUpdateListener);

            $scope.$on('$destroy', function() {
                Pomelo.off('ShipUpdate', shipUpdateListener);
            });
        }

    ]);

});
