define(['../module', 'Util/angle', 'lodash'], function (module, Angle, _) {
    'use strict';

    module.controller('MainScreenCtrl', ['$scope', '$location', 'Pomelo', '$window', '$stateParams',
        function ($scope, $location, Pomelo, $window, $stateParams) {

            Pomelo.request(
                "connector.entry.view",
                {}
            ).then(function(id) {
                    Pomelo.request("world.lobby.registerViewer", {});
                });

            var shipId = $stateParams.shipId;

            var worldUpdateListener = function(world) {
                $scope.otherships = world.ships;
                _.forIn(world.ships, function(ship) {
                    if (ship.id == shipId) {
                        $scope.ship = ship;
                    }
                });
                $scope.$apply();
            };

            Pomelo.on('GlobalUpdate', worldUpdateListener);

            $scope.$on('$destroy', function() {
                Pomelo.off('WorldUpdate', worldUpdateListener);
            });

        }
    ]);

});
