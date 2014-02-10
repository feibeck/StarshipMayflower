(function() {
    'use strict';

    var StarshipMayflowerApp = angular.module('StarshipMayflowerApp', [
        'ngRoute',
        'StarshipMayflowerLobbyControllers',
        'StarshipMayflowerGameControllers',
        'StarshipMayflowerServices'
    ]);

    StarshipMayflowerApp.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/login', {
                    templateUrl: 'src/view/login.html',
                    controller: 'LoginCtrl'
                })
                .when('/shipList', {
                    templateUrl: 'src/view/shipList.html',
                    controller: 'ShipListCtrl'
                })
                .when('/ship/:id', {
                    templateUrl: 'src/view/ship.html',
                    controller: 'ShipCtrl',
                    resolve: {
                        shipId: function($route) {
                            return $route.current.params.id;
                        }
                    }
                })
                .when('/game', {
                    templateUrl: 'src/view/game.html',
                    controller: 'GameCtrl'
                })
                .otherwise({
                    redirectTo: '/login'
                });
        }]);

})();
