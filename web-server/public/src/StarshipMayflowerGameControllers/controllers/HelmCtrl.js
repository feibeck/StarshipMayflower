define(['../module', 'jquery', 'slider'], function (module, jquery) {
    'use strict';

    module.controller('HelmCtrl', ['$scope', '$location', 'Pomelo', 'GameUtils',
        function ($scope, $location, Pomelo, GameUtils) {

            var sliderImpulse = jquery('#impulseSlider').slider({
                min: 0,
                max: 100,
                value: 0,
                handle: 'triangle',
                tooltip: false,
                orientation: 'vertical',
                selection: 'after'
            });

            var sliderWarp = jquery('#warpSlider').slider({
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

            Pomelo.on('ShipUpdate', function(ship) {

                $scope.angleZX = GameUtils.getAngle(-ship.heading.z, ship.heading.x);

                var angle = GameUtils.getAngle(ship.heading.z, ship.heading.y);
                if (angle > 90 && angle <= 180) {
                    angle = 180 - angle;
                }
                if (angle > 270 && angle <= 360) {
                    angle = (360 - angle) * -1;
                }
                if (angle > 180 && angle <= 270) {
                    angle = 180 - angle;
                }
                $scope.angleYZ = angle;

                $scope.$apply();

                sliderImpulse.slider('setCurrentValue', ship.currentImpulse);
                sliderImpulse.slider('setValue', ship.targetImpulse);
                sliderWarp.slider('setCurrentValue', ship.warpLevel);
                sliderWarp.slider('setValue', ship.warpLevel);

                var rotationMatrix = new THREE.Matrix4(
                    ship.orientation[0][0],
                    ship.orientation[1][0],
                    ship.orientation[2][0],
                    0,
                    ship.orientation[0][1],
                    ship.orientation[1][1],
                    ship.orientation[2][1],
                    0,
                    ship.orientation[0][2],
                    ship.orientation[1][2],
                    ship.orientation[2][2],
                    0,
                    0,
                    0,
                    0,
                    0
                );

                var euler = new THREE.Euler(0, 0, 0, 'XYZ');
                euler.setFromRotationMatrix(rotationMatrix, 'XYZ');

                /*console.log(
                    euler.x * (180 / Math.PI),
                    euler.y * (180 / Math.PI),
                    euler.z * (180 / Math.PI)
                );*/

            });

            $scope.impuls = 0;

            $scope.rotate = function(axis, arc) {
                Pomelo.notify('world.navigation.turn', {arc: arc, axis: axis});
            };

        }
    ]);

});
