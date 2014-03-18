(function() {
    'use strict';

var StarshipMayflowerGameControllers = angular.module('StarshipMayflowerGameControllers', []);

StarshipMayflowerGameControllers.controller('GameCtrl', ['$scope', '$location', 'Pomelo',

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

StarshipMayflowerGameControllers.controller('HelmCtrl', ['$scope', '$location', 'Pomelo',

    function ($scope, $location, Pomelo) {

        var sliderImpulse = $('#impulseSlider').slider({
            min: 0,
            max: 100,
            value: 0,
            handle: 'triangle',
            tooltip: false,
            orientation: 'vertical',
            selection: 'after'
        });

        var sliderWarp = $('#warpSlider').slider({
            min: 0,
            max: 4,
            value: 0,
            handle: 'triangle',
            tooltip: false,
            orientation: 'vertical',
            selection: 'after'
        });

        sliderImpulse.on('slide', function(ev) {
            Pomelo.notify(
                'world.navigation.setImpulseSpeed',
                {targetSpeed: ev.value}
            );
        });

        sliderImpulse.on('slideStop', function(ev) {
            Pomelo.notify(
                'world.navigation.setImpulseSpeed',
                {targetSpeed: ev.value}
            );
        });

        sliderWarp.on('slideStop', function(ev) {
            Pomelo.notify(
                'world.navigation.setWarpLevel',
                {warpLevel: ev.value}
            );
        });

        function getAngle(x, y) {
            var theta;

            if (Math.abs(y) > Math.abs(x)) {
                theta = Math.asin(y / Math.sqrt(x*x + y*y));

                if (x < 0) {
                    theta = Math.PI - theta;
                }
            } else {
                theta = Math.acos(x / Math.sqrt(x*x + y*y));

                if (y < 0) {
                    theta *= -1;
                }
            }

            if (theta < 0) {
                theta = 2 * Math.PI + theta;
            }

            return theta / Math.PI * 180;
        }

        Pomelo.on('ShipUpdate', function(ship) {
            $scope.angleZX = getAngle(-ship.heading.z, ship.heading.x);
            $scope.angleYZ = getAngle(-ship.heading.z, ship.heading.y);
            $scope.$apply();

            sliderImpulse.slider('setCurrentValue', ship.currentImpulse);
            sliderImpulse.slider('setValue', ship.targetImpulse);
            sliderWarp.slider('setCurrentValue', ship.warpLevel);
            sliderWarp.slider('setValue', ship.warpLevel);
        });

        $scope.impuls = 0;

        $scope.rotate = function(axis, arc) {
            Pomelo.notify('world.navigation.turn', {arc: arc, axis: axis});
        };

    }

]);

StarshipMayflowerGameControllers.controller('WeaponsCtrl', ['$scope', '$location', 'Pomelo',

    function ($scope, $location, Pomelo) {
    }

]);

StarshipMayflowerGameControllers.controller('MapCtrl', ['$scope', 'Pomelo',

    function ($scope, Pomelo) {
        Pomelo.on('WorldUpdate', function(world) {
            $scope.ship = world.ship;
            $scope.otherships = world.ships;
        });
    }

]);

StarshipMayflowerGameControllers.controller('DebugCtrl', ['$scope', '$location', 'Pomelo',
    function ($scope, $location, Pomelo ) {

        function getAngle(x, y) {
            var theta;

            if (Math.abs(y) > Math.abs(x)) {
                theta = Math.asin(y / Math.sqrt(x*x + y*y));

                if (x < 0) {
                theta = Math.PI - theta;
                }
            } else {
                theta = Math.acos(x / Math.sqrt(x*x + y*y));

                if (y < 0) {
                theta *= -1;
                }
            }

            if (theta < 0) {
                theta = 2 * Math.PI + theta;
            }

            return theta / Math.PI * 180;
        }

        Pomelo.on('ShipUpdate', function(ship) {
            $scope.angleZX = getAngle(-ship.heading.z, ship.heading.x);
            $scope.angleYZ = getAngle(-ship.heading.z, ship.heading.y);
            $scope.$apply();
        });

    }
]);

})();