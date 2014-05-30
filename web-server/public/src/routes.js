define(['./app'], function (app) {
    'use strict';

    app.config(['$stateProvider', '$urlRouterProvider',

        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/lobby/login');

            $stateProvider

            .state('lobby', {
                url: '/lobby',
                templateUrl: 'src/Lobby/view/lobby.html',
                abstract: true
            })

                .state('lobby.login', {
                    url: '/login',
                    templateUrl: 'src/Lobby/view/login.html',
                    controller: 'LoginCtrl'
                })

                .state('lobby.shiplist', {
                    url: '/ships',
                    templateUrl: 'src/Lobby/view/shipList.html',
                    controller: 'ShipListCtrl'
                })

                .state('lobby.ship', {
                    url: '/ship/:shipId',
                    templateUrl: 'src/Lobby/view/ship.html',
                    controller: 'ShipCtrl'
                })

            .state('play', {
                url: '/play',
                templateUrl: 'src/Game/view/play.html',
                controller: 'PlayCtrl',
                abstract: true,
                data: {
                    rule: function(Player) {
                        return (Player.getStations() != null);
                    }
                }
            })

                .state('play.comm', {
                    url: '/comm',
                    templateUrl: 'src/Game/view/stations/comm.html',
                    controller: 'CommCtrl'
                })

                .state('play.debug', {
                    url: '/debug',
                    templateUrl: 'src/Game/view/stations/debug.html',
                    controller: 'DebugCtrl'
                })

                .state('play.engineering', {
                    url: '/engineering',
                    templateUrl: 'src/Game/view/stations/engineering.html',
                    controller: 'EngineeringCtrl'
                })

                .state('play.helm', {
                    url: '/helm',
                    templateUrl: 'src/Game/view/stations/helm.html',
                    controller: 'HelmCtrl'
                })

                .state('play.mainscreen', {
                    url: '/mainscreen',
                    templateUrl: 'src/Game/view/stations/mainscreen.html',
                    controller: 'MainScreenCtrl'
                })

                .state('play.map', {
                    url: '/map',
                    templateUrl: 'src/Game/view/stations/map.html',
                    controller: 'MapCtrl'
                })

                .state('play.science', {
                    url: '/science',
                    templateUrl: 'src/Game/view/stations/science.html',
                    controller: 'ScienceCtrl'
                })

                .state('play.weapons', {
                    url: '/weapons',
                    templateUrl: 'src/Game/view/stations/weapons.html',
                    controller: 'WeaponsCtrl'
                });

        }

    ]);

    app.run(['$rootScope', '$state', 'Player', function($rootScope, $state, Player) {
        $rootScope.$on('$stateChangeStart', function(e, to) {
            if (!to.data || !angular.isFunction(to.data.rule)) return;
            var result = to.data.rule(Player);
            if (!result) {
                e.preventDefault();
                $state.go('lobby.login');
            }
        });
    }]);

});