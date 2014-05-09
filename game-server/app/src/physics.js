var _ = require('lodash'),
    sylvester = require('sylvester'),
    world = require('./world');

/**
 *
 * Convert radians to degrees.
 *
 * @param {float} angle
 * @returns {number}
 */
function deg2rad(angle) {
    return angle / 180 * Math.PI;
}

/**
 * Ensure that a matrix remains orthonormal in the face of rounding errors.
 *
 * @param {sylvester.Matrix} matrix
 * @returns {sylvester.Matrix}
 */
function orthonormalizeMatrix(matrix) {
    var c1 = matrix.col(1), c2 = matrix.col(2), c3 = matrix.col(3);

    c1 = c1.toUnitVector();
    c2 = c2
        .subtract(c1.multiply(c2.dot(c1)))
        .toUnitVector();
    c3 = c3
        .subtract(c2.multiply(c3.dot(c2)))
        .subtract(c1.multiply(c3.dot(c1)))
        .toUnitVector();

    return sylvester.Matrix.create([
        [c1.e(1), c2.e(1), c3.e(1)],
        [c1.e(2), c2.e(2), c3.e(2)],
        [c1.e(3), c2.e(3), c3.e(3)]
    ]);
}

/**
 * Constrain a value to an interval.
 *
 * @param {float} value
 * @param {float} min
 * @param {float} max
 * @returns {*}
 */
function clipValue(value, min, max) {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }

    return value;
}

/**
 * Clip the ship position into the world cube. Mutates the argument.
 *
 * @param {sylvester.Vector} position
 * @returns {sylvester.Vector}
 */
function clipPosition(position) {
    var components = [];

    for (var i = 1; i <= 3; i++) {
        components[i-1] = clipValue(position.e(i), 0, world.PlayingFieldLength);
    }

    position.setElements(components);

    return position;
}

/**
 * Roll.
 *
 * @param {Ship} ship
 * @param {float} angle
 * @returns {Ship}
 */
function turnRoll(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.Matrix.RotationZ(deg2rad(angle));

    return ship.setOrientation(orthonormalizeMatrix(orientation.multiply(rotation)));
}

/**
 * Yaw.
 *
 * @param {Ship} ship
 * @param {float} angle
 * @returns {Ship}
 */function turnYaw(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.Matrix.RotationY(deg2rad(angle));

    return ship.setOrientation(orthonormalizeMatrix(orientation.multiply(rotation)));
}

/**
 * Pitch.
 *
 * @param {Ship} ship
 * @param {float} angle
 * @returns {Ship}
 */function turnPitch(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.Matrix.RotationX(deg2rad(angle));

    return ship.setOrientation(orthonormalizeMatrix(orientation.multiply(rotation)));
}

/**
 * Roll, pitch or yaw :)
 *
 * @param {Ship} ship
 * @param {float} angle
 * @param {string} direction
 * @returns {Ship}
 */
function turn(ship, angle, direction) {
    switch (direction) {
        case world.TURN_YAW:
            return turnYaw(ship, angle);

        case world.TURN_PITCH:
            return turnPitch(ship, angle);

        case world.TURN_ROLL:
            return turnRoll(ship, angle);

        default:
            throw new Error('invalid direction specified: ' + direction);
    }
}

/**
 * Calculate the movement during a timeslice and move the ship accordingly.
 *
 * @param {Ship} ship
 * @param {float} timeslice
 * @returns {Ship|*}
 */
function moveShip(ship, timeslice) {
    var position = ship.getPosition();
    var heading = ship.getHeading();
    var velocity = ship.getRealVelocity();
    var warp = ship.getWarp();
    var warpSpeed = ship.getWarpSpeed();


    if (warp) {
        var energy = ship.getEnergy();
        var burnRate = 3 * warpSpeed;
        var burnedEnergy = timeslice * burnRate;
        if (energy - burnedEnergy < 0) {
            timeslice = energy / burnRate;
            energy = 0;
        } else {
            energy = energy - burnedEnergy;
        }
        ship.setEnergy(energy);
    }

    var newPosition = position.add(heading.multiply(velocity * timeslice));

    return ship.setPosition(clipPosition(newPosition));
}

module.exports = {
    turnRoll: turnRoll,
    turnYaw: turnYaw,
    turnPitch: turnPitch,
    turn: turn,
    moveShip: moveShip,
    orthonormalizeMatrix: orthonormalizeMatrix
};
