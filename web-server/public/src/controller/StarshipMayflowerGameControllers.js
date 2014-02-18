(function() {
    'use strict';

    var StarshipMayflowerGameControllers = angular.module('StarshipMayflowerGameControllers', []);

    StarshipMayflowerGameControllers.controller('GameCtrl', ['$scope', '$location', 'Pomelo',

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
            };

            Pomelo.on('ShipUpdate', function(ship) {
                $scope.ship = ship;
                $scope.angleZX = getAngle(-ship.heading.z, ship.heading.x);
                $scope.angleYZ = getAngle(-ship.heading.z, ship.heading.y);
                $scope.$apply();

                sliderImpulse.slider('setCurrentValue', ship.speed);
                sliderImpulse.slider('setValue', ship.targetSpeed);
            });

            $scope.impuls = 0;

            $scope.yaw = function(arc) {
                Pomelo.notify('world.navigation.turn', {arc: arc, axis: 'Y'});
            };

            $scope.pitch = function(arc) {
                Pomelo.notify('world.navigation.turn', {arc: arc, axis: 'X'});
            };

        }]);

    StarshipMayflowerGameControllers.controller('HelmCtrl', ['$scope', '$location', 'Pomelo',
        function ($scope, $location, Pomelo) {

        }]);

})();