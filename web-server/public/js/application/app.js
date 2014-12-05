define([
    'angular',
    'uiRouter',
    'uiBootstrap',
    'application/Lobby/index',
    'application/Game/index',
    'application/Utils/index',
    'application/Ui/index'
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
