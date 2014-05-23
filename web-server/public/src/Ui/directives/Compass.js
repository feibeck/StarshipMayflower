define([
    '../module',
    'angular',
    'compass'
], function (module, angular, Compass) {
    'use strict';

    module.directive('compass', ['GameUtils',
        function(GameUtils) {

            var compass = new Compass();

            return {

                template: '<div></div>',

                scope: {
                    ship: '=ship'
                },

                link: function($scope, element, attrs) {

                    element.append(compass.getDomElement());

                    $scope.$watch('ship', function() {

                        if (!$scope.ship) {
                            return;
                        }

                        compass.jaw(GameUtils.getAzimuth($scope.ship));
                        compass.pitch(GameUtils.getPolar($scope.ship));

                        compass.draw();

                    });

                }

            };

        }
    ]);

});