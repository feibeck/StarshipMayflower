'use strict';

var StarshipMayflowerControllers = angular.module('StarshipMayflowerControllers', []);

StarshipMayflowerControllers.controller('ShipListCtrl', ['$scope', 'Pomelo',
    function ($scope, Pomelo) {

        console.log("Controller called");

        var promise = Pomelo.request("world.rosterHandler.listAvailableShips", "");
        promise.then(function(data) {
            $scope.list = data;
        });

        Pomelo.on('PlayerAdded', function(data) {
            console.log("Player added: " + data.name);
        });

        $scope.create = function () {

            var promise = Pomelo.request(
                "world.rosterHandler.addNewShip",
                $scope.shipName
            );
            promise.then(function (ship) {
                $scope.list.push(ship);
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
            ).then(function(data) {
                Pomelo.request(
                    "world.rosterHandler.addPlayer",
                    {name: $scope.username, playerId: data.playerId}
                ).then(function(data) {
                    if (data.code == "OK") {
                        $location.path('/shipList')
                    }
                });
            });
        }
    }]);
