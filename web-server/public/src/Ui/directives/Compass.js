define([
    '../module',
    'angular',
    'compass',
    'angle'
], function (module, angular, Compass, Angle) {
    'use strict';

    module.directive('compass', [
        function() {

            return {

                template: '<div></div>',

                scope: {
                    ship: '=ship'
                },

                link: function($scope, element, attrs) {

                    var compass = new Compass();

                    element.append(compass.getDomElement());

                    $scope.$watch('ship', function() {

                        if (!$scope.ship) {
                            return;
                        }

                        var angle = new Angle($scope.ship);

                        compass.jaw(angle.getAzimuth());
                        compass.pitch(angle.getPolar());

                        compass.draw();

                    });

                }

            };

        }
    ]);

});