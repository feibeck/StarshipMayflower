define([
    '../module',
    '../../../Util/course',
    'lodash'
], function (module, Course, _) {
    'use strict';

    module.factory('Target', ['Pomelo',
        function(Pomelo)
        {
            var currentTarget;

            var knownObjects;
            var shipData;
            var listeners = [];

            Pomelo.on('WorldUpdate', function(world) {
                knownObjects = world.ships;
                update();
            });

            Pomelo.on('ShipUpdate', function(ship) {
                shipData = ship;
                update();
            });

            var getTargetData = function()
            {
                var currentTargetData;

                _.forIn(knownObjects, function(knownObject) {
                    if (knownObject.id == currentTarget) {
                        currentTargetData = knownObject;
                    }
                });

                return currentTargetData;
            }

            var update = function()
            {
                if (!currentTarget) {
                    return;
                }

                var target = getTargetData();

                var course = new Course();

                var event = {
                    currentTargetId: currentTarget,
                    currentTarget: target,
                    course: course.courseTo(shipData, target)
                };

                var array = [];
                var length = listeners.length;

                for (var i = 0; i < length; i++) {
                    array[i] = listeners[i];
                }

                for (var i = 0; i < length; i++) {
                    array[i].call(this, event);
                }
            };

            return {

                setCurrentTarget: function(target)
                {
                    currentTarget = target;
                    update();
                },

                addListener: function (listener)
                {
                    if (listeners.indexOf(listener) === - 1) {
                        listeners.push(listener);
                    }
                }

            };
        }
    ]);

});