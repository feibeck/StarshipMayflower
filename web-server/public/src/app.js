angular.module('StarshipMayflower', ['ngRoute'])
    .config(function ($routeProvider) {
        "use strict";

        $routeProvider
            .when('/shipList', {
                templateUrl: 'src/view/shipList.html',
                controller: 'ShipListCtrl'
            })
            .otherwise({
                redirectTo: '/shipList'
            });
    });
