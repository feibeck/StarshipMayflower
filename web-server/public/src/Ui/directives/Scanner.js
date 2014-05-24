define([
    '../module',
    'angular',
    'scanner'
], function (module, angular, Scanner) {
    'use strict';

    module.directive('scanner', ['THREE', '$window', '$interval',
        function(THREE, $window, $interval) {

            var scanner = new Scanner();

            return {

                template: '<div><div class="scanner"></div><pagination class="pagination-sm" direction-links="true" boundary-links="false" previous-text="&lsaquo;" next-text="&rsaquo;" max-size="5" items-per-page="1" total-Items="9" ng-model="zoomFactor"></pagination></div>',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                controller: function($scope) {
                    $scope.zoomFactor = 9;
                },

                link: function($scope, element, attrs) {

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