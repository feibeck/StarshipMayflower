(function() {
    'use strict';

    var StarshipMayflowerApp = angular.module('StarshipMayflowerApp', [
        'ui.router',
        'StarshipMayflowerLobbyControllers',
        'StarshipMayflowerGameControllers',
	'StarshipMayflowerServices',
	'MapService'
    ]);

    StarshipMayflowerApp.config(['$stateProvider', '$urlRouterProvider',

        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/lobby/login');

            $stateProvider.state('lobby', {
                url: '/lobby',
                templateUrl: 'src/StarshipMayflowerLobbyControllers/view/lobby.html'
            }).state('lobby.login', {
                url: '/login',
                templateUrl: 'src/StarshipMayflowerLobbyControllers/view/login.html',
                controller: 'LoginCtrl'
            }).state('lobby.shiplist', {
                url: '/ships',
                templateUrl: 'src/StarshipMayflowerLobbyControllers/view/shipList.html',
                controller: 'ShipListCtrl'
            }).state('lobby.ship', {
                url: '/ship/:shipId',
                templateUrl: 'src/StarshipMayflowerLobbyControllers/view/ship.html',
                controller: 'ShipCtrl'
            }).state('game', {
                url: '/play',
                templateUrl: 'src/StarshipMayflowerGameControllers/view/game.html',
                controller: 'GameCtrl'
            });
        }
    ]);

})();