define([
    '../module',
    'angular',
    'Util/angle'
], function (module, angular, Angle) {
    'use strict';

    module.directive('compass', ['Scenes',
        function(Scenes) {

            return {

                template: '<div></div>',

                scope: {
                    ship: '=ship'
                },

                link: function($scope, element, attrs) {

                    var compass = Scenes.getCompass();

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
