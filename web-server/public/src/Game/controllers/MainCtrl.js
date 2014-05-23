/* global define */

define([
    '../module'
], function (module) {
    'use strict';

    module.controller('MainCtrl', ['$scope', 'Pomelo',
        function($scope, Pomelo) {
            Pomelo.on('WorldUpdate', function(world) {
                $scope.ship = world.ship;
                $scope.otherships = world.ships;
            });

            $scope.pane.select = function() {
                $scope.$emit('selected');
            };
        }
    ]);
});
