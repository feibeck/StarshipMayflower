define([
    'angular',
    'uiRouter',
    'uiBootstrap',
    './Lobby/index',
    './Game/index',
    './Utils/index',
    './Map/index',
    './SpeedSlider/index'
], function (angular) {
    'use strict';

    return angular.module('StarshipMayflowerApp', [
        'ui.router',
        'Lobby',
        'Game',
        'Utils',
        'MapService',
        'SpeedSlider'
    ]);
});