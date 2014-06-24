define(['../module'], function (module) {
    'use strict';

    module.controller('MapCtrl', ['$scope', 'Pomelo', 'Target',
        function ($scope, Pomelo, Target) {

            var worldUpdateListener = function(world) {
                $scope.ship = world.ship;
                $scope.otherships = world.ships;
                $scope.$apply();
            };

            var targetListener = function(event) {
                $scope.selectedObject = event.currentTarget;
                $scope.course = event.course;
            };

            Pomelo.on('WorldUpdate', worldUpdateListener);
            Target.addListener(targetListener);

            $scope.$on('$destroy', function() {
                Pomelo.off('WorldUpdate', worldUpdateListener);
                Target.removeListener(targetListener);
            });

        }
    ]);

});
