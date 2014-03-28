define(['../module'], function (StarshipMayflowerLobbyControllers) {

    'use strict';

    StarshipMayflowerLobbyControllers.controller('ShipListCtrl', ['$scope', '$location', '$modal', 'Pomelo',
        function ($scope, $location, $modal, Pomelo) {

            $scope.list = [];

            var promise = Pomelo.request("world.lobby.listAvailableShips", "");
            promise.then(function(shiplist) {
                $scope.list = shiplist;
            }, function(reason) {
                $location.path('/lobby/login');
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

            $scope.open = function()
            {
                $modal.open({
                    templateUrl: 'new-ship.html',
                    backdrop: true,
                    windowClass: 'modal',
                    controller: function ($scope, $modalInstance) {
                        $scope.alerts = [];
                        var ship = {name: ""};
                        $scope.ship = ship;
                        $scope.submit = function () {
                            Pomelo.request(
                                "world.lobby.addNewShip",
                                $scope.ship.name
                            ).then(
                                // success
                                function (ship) {
                                    $modalInstance.dismiss('cancel');
                                },
                                // failure
                                function(ship) {
                                    console.log(ship);
                                    $scope.alerts[0] = {
                                        type: 'danger',
                                        msg: ship.error
                                    };
                                }
                            );
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                });
            };

        }]);

    StarshipMayflowerLobbyControllers.controller('LoginCtrl', ['$scope', '$location', 'Pomelo', 'Player',
        function ($scope, $location, Pomelo, Player) {
            $scope.alerts = [];
            $scope.login = function() {
                var username = $scope.username;
                if (username !== undefined) {
                    Pomelo.request(
                        "connector.entry.entry",
                        {
                            username: username
                        }
                    ).then(function(playerId) {

                        Player.setId(playerId);
                        Player.setName(username);

                        Pomelo.request(
                            "world.lobby.addPlayer",
                            {name: username, playerId: playerId}
                        ).then(
                            // success
                            function(player) {
                                $location.path('/lobby/ships');
                            },
                            // failure
                            function(player) {
                                $scope.alerts[0] = {
                                    type: 'danger',
                                    msg: player.error
                                };
                            }
                        );

                    });
                }
            };
        }]);

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

        }]);

});