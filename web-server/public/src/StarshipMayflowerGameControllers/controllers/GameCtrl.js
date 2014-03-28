define(['../module'], function (module) {
    'use strict';

    module.controller('GameCtrl', ['$scope', '$location', 'Pomelo',
        function ($scope, $location, Pomelo) {

            Pomelo.on('ShipUpdate', function(ship) {
                $scope.ship = ship;
                $scope.$apply();
            });

            var stationPanes = {
                helm: {
                    title: 'Helm',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/helm.html'
                },
                science: {
                    title: 'Science',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/science.html'
                },
                weapons: {
                    title: 'Weapons',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/weapons.html'
                },
                engineering: {
                    title: 'Engineering',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/engineering.html'
                },
                comm: {
                    title: 'Comm',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/comm.html'
                },
                mainscreen: {
                    title: 'Mainscreen',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/mainscreen.html'
                }
            };

            $scope.select = function() {
                if (angular.isFunction(this.pane.select)) {
                    this.pane.select();
                }
            };

            $scope.panes = [];

            Pomelo.request(
                'world.game.start',
                {}
            ).then(function(stations) {
                var first = true;
                angular.forEach(stations, function(station){
                    var pane = stationPanes[station];
                    if (first) {
                        pane.active = true;
                        first = false;
                    }
                    $scope.panes.push(pane);
                });
                $scope.panes.push({
                    title: 'Map',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/map.html'
                });
                $scope.panes.push({
                    title: 'Debug',
                    content: 'src/StarshipMayflowerGameControllers/view/stations/debug.html'
                });
            });

        }
    ]);

});
