define([
    '../module',
    'angular'
], function (module, angular) {
    'use strict';

    module.directive('scanner', ['THREE', '$window', '$interval', 'Scenes',
        function(THREE, $window, $interval, Scenes) {

            return {

                template: '<div class="scanner flex"></div><pagination class="pagination-sm scanner-pagination" direction-links="true" boundary-links="false" previous-text="&lsaquo;" next-text="&rsaquo;" max-size="5" items-per-page="1" total-Items="9" ng-model="zoomFactor"></pagination>',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                controller: function($scope) {
                    $scope.zoomFactor = 9;
                },

                link: function($scope, element, attrs) {

                    var scanner = Scenes.getScanner();

                    element.find('div').append(scanner.getDomElement());
                    scanner.setSize(element.width(), element.height());

                    $scope.$watch('zoomFactor', function() {
                        scanner.setRangeFactor($scope.zoomFactor);
                    });

                    $scope.$watch('ship', function() {
                        if ($scope.ship == null) {
                            return;
                        }
                        scanner.updateShip($scope.ship);
                    });

                    $scope.$watch('otherships', function() {
                        if ($scope.otherships == null) {
                            return;
                        }
                        scanner.updateObjects($scope.otherships);
                    });

                    scanner.animate();

                }

            };

        }
    ]);

});