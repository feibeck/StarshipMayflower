/**
 * bootstraps angular onto the window.document node
 */
define([
    'angular',
    'application/app',
    'application/routes',
    'domReady!'
], function (angular) {
    'use strict';

    angular.bootstrap(document, ['StarshipMayflowerApp']);
});
