define(['../module'], function (module) {
    'use strict';

    module.controller('ShipListCtrl', ['$scope', '$location', '$modal', 'Pomelo',
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

        }
    ]);

});