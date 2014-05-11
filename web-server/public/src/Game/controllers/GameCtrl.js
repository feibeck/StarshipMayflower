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
                    content: 'src/Game/view/stations/helm.html'
                },
                science: {
                    title: 'Science',
                    content: 'src/Game/view/stations/science.html'
                },
                weapons: {
                    title: 'Weapons',
                    content: 'src/Game/view/stations/weapons.html'
                },
                engineering: {
                    title: 'Engineering',
                    content: 'src/Game/view/stations/engineering.html'
                },
                comm: {
                    title: 'Comm',
                    content: 'src/Game/view/stations/comm.html'
                },
                mainscreen: {
                    title: 'Mainscreen',
                    content: 'src/Game/view/stations/mainscreen.html'
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
                    content: 'src/Game/view/stations/map.html'
                });
                $scope.panes.push({
                    title: 'Debug',
                    content: 'src/Game/view/stations/debug.html'
                });
            });

        }
    ]);

});
