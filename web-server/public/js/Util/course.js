define([
    'lodash',
    './angle',
    'three'
], function(_, Angle, THREE) {
    "use strict";

    function Course() {
    }

    _.extend(Course.prototype, {

        courseTo: function(source, target) {

            var sourceVector = new THREE.Vector3(
                source.position.x,
                source.position.y,
                source.position.z
            );

            var targetVector = new THREE.Vector3(
                target.position.x,
                target.position.y,
                target.position.z
            );

            var heading = targetVector.clone().sub(sourceVector);

            var angle = new Angle({
                heading: heading
            });

            return {
                distance: sourceVector.distanceTo(targetVector),
                heading:  heading,
                azimuth:  angle.getAzimuth(),
                polar:  angle.getPolar()
            };

        }

    });

    return Course;
});