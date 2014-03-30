define(['../module'], function (module) {
    'use strict';

    module.factory('GameUtils', [
        function() {
            return {
                getAngle: function(x, y)
                {
                    var theta;

                    if (Math.abs(y) > Math.abs(x)) {
                        theta = Math.asin(y / Math.sqrt(x*x + y*y));

                        if (x < 0) {
                            theta = Math.PI - theta;
                        }
                    } else {
                        theta = Math.acos(x / Math.sqrt(x*x + y*y));

                        if (y < 0) {
                            theta *= -1;
                        }
                    }

                    if (theta < 0) {
                        theta = 2 * Math.PI + theta;
                    }

                    return theta / Math.PI * 180;
                }
            };
        }
    ]);

});