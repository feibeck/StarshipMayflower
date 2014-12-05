define([
    'lodash'
], function(_) {
    "use strict";

    function Angle(ship) {
        this.ship = ship;
    }

    _.extend(Angle.prototype, {

        getAzimuth: function()
        {
            var heading = this.ship.heading;
            return this.getAngle(heading.z, heading.x);
        },

        getPolar: function()
        {
            var heading = this.ship.heading;
            return Math.asin(heading.y / this.norm(heading)) / Math.PI * 180;
        },

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
        },

        norm: function(vec)
        {
            return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
        }

    });

    return Angle;
});