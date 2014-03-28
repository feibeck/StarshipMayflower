define(['../module'], function (StarshipMayflowerLobbyControllers) {
    'use strict';

    StarshipMayflowerLobbyControllers.controller('ShipCtrl', ['$scope', '$location', 'Pomelo', 'Player', '$stateParams',
        function ($scope, $location, Pomelo, Player, $stateParams) {

            var shipId = $stateParams.shipId;

            Pomelo.request(
                'world.lobby.joinShip',
                {shipId: shipId}
            ).then(function(ship) {
                $scope.ship = ship;
            }, function(reason) {
                $location.path('/lobby/ships');
            });

            Pomelo.on('StationTaken', function(ship) {
                $scope.ship = ship;
                $scope.$apply();
            });

            Pomelo.on('StationReleased', function(ship) {
                $scope.ship = ship;
                $scope.$apply();
            });

            Pomelo.on('GameStarted', function() {
                $location.path('/play');
                $scope.$apply();
            });

            $scope.isTaken = function(station) {
                if (!$scope.ship) {
                    return false;
                }
                if ($scope.ship.stations[station] && $scope.ship.stations[station] != Player.getName()) {
                    return true;
                }
                return false;
            };

            $scope.takeStation = function (station, value) {

                var route = 'world.lobby.';
                if (value === true) {
                    route = route + 'takeStation';
                } else {
                    route = route + 'releaseStation';
                }

                Pomelo.request(
                    route,
                    {position: station}
                ).then(function(ship) {

                    $scope.ship = ship;

                });

            };

            $scope.$watch('readyToPlay', function(newValue) {

                if (newValue) {
                    $scope.buttonText = 'Waiting for game to start';
                } else {
                    $scope.buttonText = 'Ready to play';
                }

                if (newValue === undefined) {
                    return;
                }

                Pomelo.request(
                    'world.lobby.readyToPlay',
                    newValue
                ).then(function(started) {
                    if (started) {
                        $location.path('/play');
                    }
                });

            });
        }
    ]);

});