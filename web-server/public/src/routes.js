define(['./app'], function (app) {
    'use strict';

    return app.config(['$stateProvider', '$urlRouterProvider',

        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/lobby/login');

            $stateProvider.state('lobby', {
                url: '/lobby',
                templateUrl: 'src/Lobby/view/lobby.html'
            }).state('lobby.login', {
                url: '/login',
                templateUrl: 'src/Lobby/view/login.html',
                controller: 'LoginCtrl'
            }).state('lobby.shiplist', {
                url: '/ships',
                templateUrl: 'src/Lobby/view/shipList.html',
                controller: 'ShipListCtrl'
            }).state('lobby.ship', {
                url: '/ship/:shipId',
                templateUrl: 'src/Lobby/view/ship.html',
                controller: 'ShipCtrl'
            }).state('game', {
                url: '/play',
                templateUrl: 'src/Game/view/game.html',
                controller: 'GameCtrl'
            });
        }

    ]);

});