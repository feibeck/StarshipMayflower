define(['../module'], function (module) {
    'use strict';

    module.controller('MapCtrl', ['$scope', 'Pomelo', 'Target',
        function ($scope, Pomelo, Target) {
            Pomelo.on('WorldUpdate', function(world) {
                $scope.ship = world.ship;
                $scope.otherships = world.ships;
                $scope.$apply();
            });

            Target.addListener(function(event) {
                $scope.selectedObject = event.currentTarget;
                $scope.course = event.course;
            });
        }
    ]);

});
