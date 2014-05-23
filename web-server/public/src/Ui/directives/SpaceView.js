/* global define */

define([
    '../module',
    'angular',
    'SpaceViewer'
], function (module, angular, SpaceViewer) {
    'use strict';

    module.directive('spaceView', ['THREE', '$window', '$interval',
        function(THREE, $window, $interval) {

            var spaceViewer = new SpaceViewer();

            return {

                template: '<div class="space-view"></div>',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                controller: function($scope) {},

                link: function($scope, element, attrs) {
                    var w = angular.element($window);
                    w.bind('resize', function() {
                        spaceViewer.setSize(element.width(), element.height());
                    });

                    $scope.$parent.$on('selected', function() {
                        spaceViewer.setSize(element.width(), element.height());
                    });

                    element.find('div').append(spaceViewer.getDomElement());
                    spaceViewer.setSize(element.width(), element.height());

                    $scope.$watch('ship', function() {
                        if ($scope.ship === null) {
                            return;
                        }
                        spaceViewer.updateShip($scope.ship);
                    });

                    $scope.$watch('otherships', function() {
                        if ($scope.otherships === null) {
                            return;
                        }
                        spaceViewer.updateObjects($scope.otherships);
                    });

                    spaceViewer.animate();

                }

            };

        }
    ]);

});
