define([
    'angular',
    'uiRouter',
    'uiBootstrap',
    './Lobby/index',
    './Game/index',
    './Utils/index',
    './Ui/index'
], function (angular) {
    'use strict';

    return angular.module('StarshipMayflowerApp', [
        'ui.router',
        'Lobby',
        'Game',
        'Utils',
        'Ui'
    ]);
});
