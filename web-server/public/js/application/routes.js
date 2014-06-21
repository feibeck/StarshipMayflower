define(['require', './app'], function (require, app) {
    'use strict';
    var basePath = require.toUrl('.');

    app.config(['$stateProvider', '$urlRouterProvider',

        function($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/lobby/login');

            $stateProvider

            .state('lobby', {
                url: '/lobby',
                templateUrl: basePath + '/Lobby/view/lobby.html',
                abstract: true
            })

                .state('lobby.login', {
                    url: '/login',
                    templateUrl: basePath + '/Lobby/view/login.html',
                    controller: 'LoginCtrl'
                })

                .state('lobby.shiplist', {
                    url: '/ships',
                    templateUrl: basePath + '/Lobby/view/shipList.html',
                    controller: 'ShipListCtrl'
                })

                .state('lobby.ship', {
                    url: '/ship/:shipId',
                    templateUrl: basePath + '/Lobby/view/ship.html',
                    controller: 'ShipCtrl'
                })

            .state('play', {
                url: '/play',
                templateUrl: basePath + '/Game/view/play.html',
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
                    templateUrl: basePath + '/Game/view/stations/comm.html',
                    controller: 'CommCtrl'
                })

                .state('play.debug', {
                    url: '/debug',
                    templateUrl: basePath + '/Game/view/stations/debug.html',
                    controller: 'DebugCtrl'
                })

                .state('play.engineering', {
                    url: '/engineering',
                    templateUrl: basePath + '/Game/view/stations/engineering.html',
                    controller: 'EngineeringCtrl'
                })

                .state('play.helm', {
                    url: '/helm',
                    templateUrl: basePath + '/Game/view/stations/helm.html',
                    controller: 'HelmCtrl'
                })

                .state('play.mainscreen', {
                    url: '/mainscreen',
                    templateUrl: basePath + '/Game/view/stations/mainscreen.html',
                    controller: 'MainScreenCtrl'
                })

                .state('play.map', {
                    url: '/map',
                    templateUrl: basePath + '/Game/view/stations/map.html',
                    controller: 'MapCtrl'
                })

                .state('play.science', {
                    url: '/science',
                    templateUrl: basePath + '/Game/view/stations/science.html',
                    controller: 'ScienceCtrl'
                })

                .state('play.weapons', {
                    url: '/weapons',
                    templateUrl: basePath + '/Game/view/stations/weapons.html',
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
