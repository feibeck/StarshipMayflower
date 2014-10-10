/* global define */

define([
    '../module',
    'angular'
], function (module, angular) {
    'use strict';

    module.directive('spaceView', ['THREE', '$window', 'Scenes',
        function(THREE, $window, Scenes) {

            return {

                template: '',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                controller: function($scope) {},

                link: function($scope, element, attrs) {

                    var spaceViewer = Scenes.getSpaceview();

                    element.append(spaceViewer.getDomElement());
                    spaceViewer.setSize(element.width(), element.height());

                    var w = angular.element($window);
                    w.bind('resize', function() {
                        spaceViewer.setSize(element.width(), element.height());
                    });

                    var resizeFunc = function() {
                        spaceViewer.setSize(element.width(), element.height());
                    };

                    angular.element($window).on('resize', resizeFunc);

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

                    $scope.$on('$destroy', function() {
                        angular.element($window).off('resize', resizeFunc);
                    });

                }

            };

        }
    ]);

});
