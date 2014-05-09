define([
    'angular',
    'uiRouter',
    'uiBootstrap',
    'pomelo',
    './StarshipMayflowerLobbyControllers/index',
    './StarshipMayflowerGameControllers/index',
    './StarshipMayflowerServices/index',
    './Map/index',
    './Three/index',
    './SpeedSlider/index'
], function (angular) {
    'use strict';

    return angular.module('StarshipMayflowerApp', [
        'ui.router',
        'StarshipMayflowerLobbyControllers',
        'StarshipMayflowerGameControllers',
        'StarshipMayflowerServices',
        'MapService',
        'SpeedSlider'
    ]);
});