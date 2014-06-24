define([
    'require',
    '../module',
    'angular'
], function (require, module, angular) {
    'use strict';

    var viewPath = require.toUrl('../view');

    module.directive('map', ['$window', '$interval', 'Scenes', 'Target',
        function($window, $interval, Scenes, Target) {

            return {

                templateUrl: viewPath + '/map.html',

                scope: {
                    ship: '=ship',
                    otherships: '=otherships'
                },

                link: function($scope, element, attrs) {

                    var map = Scenes.getMap();

                    $scope.camera = map.getCamera();

                    element.append(map.getDomElement());

                    map.setSize(element.width(), element.height());

                    var resizeFunc = function() {
                        map.setSize(element.width(), element.height());
                    };

                    angular.element($window).on('resize', resizeFunc);

                    map.addEventListener('select', function(event) {
                        Target.setCurrentTarget(event.mapObject.id);
                    });

                    $scope.$watch('ship', function() {
                        map.updateShip($scope.ship);
                        map.scaleModels();
                        map.render();
                    });

                    $scope.$watch('otherships', function() {
                        map.updateOtherships($scope.otherships);
                        map.scaleModels();
                        map.render();
                    });

                    $scope.$on('$destroy', function() {
                        angular.element($window).off('resize', resizeFunc);
                    });

                }

            };

        }
    ]);

});
