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
                $scope.angleYZ = GameUtils.getAngle(-ship.heading.z, ship.heading.y);
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

});
