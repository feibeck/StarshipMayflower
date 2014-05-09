define([
    '../module',
    '../lib/slider'
], function (module) {
    'use strict';

    module.directive('speedslider', ['Pomelo',
        function(Pomelo) {

            return {
                restrict: 'E',
                replace: true,
                template: '<input type="text" />',
                scope: {
                    ship: '=ship'
                },
                link: function ($scope, element, attrs) {

                    var engine = attrs.engine;

                    var slider = $(element[0]).slider({
                        min: 0,
                        max: 100,
                        value: 0,
                        handle: 'triangle',
                        tooltip: false,
                        orientation: 'vertical',
                        selection: 'after'
                    });

                    var route = "";
                    if (engine == 'warp') {
                        route = 'world.navigation.setWarpLevel';
                    } else if (engine == 'impulse') {
                        route = 'world.navigation.setImpulseSpeed';
                    }

                    var notify = function(ev) {
                        console.log(ev.value);
                        Pomelo.notify(
                            route,
                            {targetSpeed: ev.value}
                        );
                    }

                    slider.on('slide', notify);
                    slider.on('slideStop', notify);

                    $scope.$watch('ship', function() {

                        if ($scope.ship == null) {
                            return;
                        }

                        if (engine == 'warp') {
                            slider.slider('setCurrentValue', $scope.ship.warpLevel);
                            slider.slider('setValue', $scope.ship.warpLevel);
                        } else if (engine == 'impulse') {
                            slider.slider('setCurrentValue', $scope.ship.currentImpulse);
                            slider.slider('setValue', $scope.ship.targetImpulse);
                        }

                    });
                }
            }
    }]);

});