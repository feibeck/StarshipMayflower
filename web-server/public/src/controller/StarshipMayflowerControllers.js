'use strict';

var StarshipMayflowerControllers = angular.module('StarshipMayflowerControllers', []);

StarshipMayflowerControllers.controller('ShipListCtrl', ['$scope', 'Pomelo',
    function ($scope, Pomelo) {

        console.log("Controller called");

        var promise = Pomelo.request("world.rosterHandler.listAvailableShips", "");
        promise.then(function(shiplist) {
            $scope.list = shiplist;
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
            $scope.$apply()
        });

        $scope.create = function () {

            var promise = Pomelo.request(
                "world.rosterHandler.addNewShip",
                $scope.shipName
            );
            promise.then(function (ship) {
                $('#createShipModal').modal('hide');
                $scope.shipName = "";
            });

        }

    }]);

StarshipMayflowerControllers.controller('LoginCtrl', ['$scope', '$location', 'Pomelo',
    function ($scope, $location, Pomelo) {
        $scope.login = function() {
            Pomelo.request(
                "connector.entryHandler.entry",
                {
                    username: $scope.username
                }
            ).then(function(playerId) {
                Pomelo.request(
                    "world.rosterHandler.addPlayer",
                    {name: $scope.username, playerId: playerId}
                ).then(function(data) {
                    $location.path('/shipList')
                });
            });
        }
    }]);
