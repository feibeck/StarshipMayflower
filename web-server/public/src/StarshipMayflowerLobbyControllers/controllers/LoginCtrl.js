define(['../module'], function (StarshipMayflowerLobbyControllers) {
    'use strict';

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
        }
    ]);

});