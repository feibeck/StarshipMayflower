(function() {
    'use strict';

    var StarshipMayflowerLobbyControllers = angular.module('StarshipMayflowerLobbyControllers', []);

    StarshipMayflowerLobbyControllers.controller('ShipListCtrl', ['$scope', '$location', 'Pomelo',
        function ($scope, $location, Pomelo) {

            $scope.list = [];

            var promise = Pomelo.request("world.lobby.listAvailableShips", "");
            promise.then(function(shiplist) {
                $scope.list = shiplist;
            }, function(reason) {
                $location.path('/login');
            });

            Pomelo.on('PlayerAdded', function(player) {
                console.log("Player joined: " + player.name);
            });

            Pomelo.on('PlayerLeft', function(player) {
                console.log("Player left: " + player.name);
            });

            Pomelo.on('ShipAdded', function(ship) {
                console.log("Ship added: " + ship.name);
                $scope.list.push(ship);
                $scope.$apply();
            });

            $scope.create = function () {

                var promise = Pomelo.request(
                    "world.lobby.addNewShip",
                    $scope.shipName
                );
                promise.then(function (ship) {
                    $('#createShipModal').modal('hide');
                    $scope.shipName = "";
                });

            };

        }]);

    StarshipMayflowerLobbyControllers.controller('LoginCtrl', ['$scope', '$location', 'Pomelo', 'Player',
        function ($scope, $location, Pomelo, Player) {
            $scope.login = function() {
                Pomelo.request(
                    "connector.entry.entry",
                    {
                        username: $scope.username
                    }
                ).then(function(playerId) {

                    Player.setId(playerId);
                    Player.setName($scope.username);

                    Pomelo.request(
                        "world.lobby.addPlayer",
                        {name: $scope.username, playerId: playerId}
                    ).then(function(data) {
                        $location.path('/shipList');
                    });

                });
            };
        }]);

    StarshipMayflowerLobbyControllers.controller('ShipCtrl', ['$scope', '$location', 'Pomelo', 'Player', 'shipId',
        function ($scope, $location, Pomelo, Player, shipId) {
            Pomelo.request(
                'world.lobby.joinShip',
                {shipId: shipId}
            ).then(function(ship) {

                console.debug(ship);
                $scope.ship = ship;

            }, function(reason) {
                $location.path('/shipList');
            });

            Pomelo.on('StationTaken', function(ship) {
                $scope.ship = ship;
                console.debug(ship);
                $scope.$apply();
            });

            Pomelo.on('StationReleased', function(ship) {
                $scope.ship = ship;
                console.debug(ship);
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

            $scope.ready = function()
            {
                Pomelo.notify('world.game.start');
                $location.path('/game');
            }

        }]);

})();