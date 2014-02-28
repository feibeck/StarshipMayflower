var _ = require('lodash'),
    sylvester = require('sylvester'),
    world = require('./world');

function deg2rad(angle) {
    return angle / 180 * Math.PI;
}

function project2Orthonormal(matrix) {
    return matrix;
}

function clipValue(value, min, max) {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }

    return value;
}

function clipPosition(position) {
    var components = [];

    for (var i = 1; i <= 3; i++) {
        components[i-1] = clipValue(position.e(i), 0, world.PlayingFieldLength);
    }

    position.setElements(components);

    return position;
}

function turnRoll(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.Matrix.RotationZ(deg2rad(angle))

    return ship.setOrientation(project2Orthonormal(orientation.multiply(rotation)));
}

function turnYaw(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.Matrix.RotationY(deg2rad(angle))

    return ship.setOrientation(project2Orthonormal(orientation.multiply(rotation)));
}

function turnPitch(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.Matrix.RotationX(deg2rad(angle))

    return ship.setOrientation(project2Orthonormal(orientation.multiply(rotation)));
}

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

function moveShip(ship, timeslice) {
    var position = ship.getPosition();
    var heading = ship.getHeading();
    var velocity = ship.getVelocity();
    var newPosition = position.add(heading.multiply(velocity * timeslice));

    return ship.setPosition(clipPosition(newPosition));
}

module.exports = {
    turnRoll: turnRoll,
    turnYaw: turnYaw,
    turnPitch: turnPitch,
    turn: turn,
    moveShip: moveShip
};
