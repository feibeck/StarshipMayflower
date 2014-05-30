define(['../module'], function (module) {
    'use strict';

    module.controller('PlayCtrl', ['$scope', 'Player', '$state',
        function ($scope, Player, $state) {
            $scope.$state = $state;
            var stations = Player.getStations();
            stations.push('map');
            stations.push('debug');
            $scope.stations = stations;
        }
    ]);

});