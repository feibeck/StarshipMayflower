define([
    '../module',
    'angular'
], function (module, angular) {
    'use strict';

    module.directive('rotation', ['THREE', '$window', '$interval', 'Scenes',
        function(THREE, $window, $interval, Scenes) {

            return {

                template: '<div></div>',

                scope: {
                    ship: '=ship'
                },

                link: function($scope, element, attrs) {

                    var map = Scenes.getRotation();

                    element.append(map.getDomElement());
                    map.setSize(element.width(), element.height());

                    $scope.$watch('ship', function() {
                        if ($scope.ship == null) {
                            return;
                        }
                        map.updateShip($scope.ship);
                    });

                    map.animate();

                }

            };

        }
    ]);

});