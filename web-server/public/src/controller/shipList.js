'use strict';

var StarshipMayflowerControllers = angular.module('StarshipMayflowerControllers', []);

StarshipMayflowerControllers.controller('ShipListCtrl', ['$scope', 'Pomelo',
    function ($scope, Pomelo) {

        var promise = Pomelo.request("world.rosterHandler.listAvailableShips", "");
        promise.then(function(data) {
            $scope.list = data;
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
