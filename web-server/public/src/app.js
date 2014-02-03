'use strict';

var StarshipMayflowerApp = angular.module('StarshipMayflowerApp', [
    'ngRoute',
    'StarshipMayflowerControllers',
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
            .otherwise({
                redirectTo: '/login'
            });
    }]);
