(function() {
    'use strict';

    var StarshipMayflowerApp = angular.module('StarshipMayflowerApp', [
        'ui.router',
        'StarshipMayflowerLobbyControllers',
        'StarshipMayflowerGameControllers',
        'StarshipMayflowerServices'
    ]);

    StarshipMayflowerApp.config(['$stateProvider', '$urlRouterProvider',

        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/lobby/login');

            $stateProvider.state('lobby', {
                url: '/lobby',
                templateUrl: 'src/view/lobby.html'
            }).state('lobby.login', {
                url: '/login',
                templateUrl: 'src/view/login.html',
                controller: 'LoginCtrl'
            }).state('lobby.shiplist', {
                url: '/ships',
                templateUrl: 'src/view/shipList.html',
                controller: 'ShipListCtrl'
            }).state('lobby.ship', {
                url: '/ship/:shipId',
                templateUrl: 'src/view/ship.html',
                controller: 'ShipCtrl'
            }).state('game', {
                url: '/play',
                templateUrl: 'src/view/game.html',
                controller: 'GameCtrl'
            });
        }
    ]);

})();