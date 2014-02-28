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

    position.setElements(elements);

    return position;
}

function turnRoll(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.rotationZ(deg2rad(angle))

    return ship.setOrientation(project2Orthonormal(orientation.multiply(rotation)));
}

function turnYaw(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.rotationY(deg2rad(angle))

    return ship.setOrientation(project2Orthonormal(orientation.multiply(rotation)));
}

function turnPitch(ship, angle) {
    var orientation = ship.getOrientation();
    var rotation = sylvester.rotationX(deg2rad(angle))

    return ship.setOrientation(project2Orthonormal(orientation.multiply(rotation)));
}

function moveShip(ship, timeslice) {
    var position = ship.getPosition();
    var heading = ship.getHeader();
    var velocity = ship.getVelocity();
    var newPosition = position.add(heading.multiply(velocity * timeslice));

    return ship.setPosition(clipPosition(newPosition));
}

module.exports = {
    accelerate: accelerate,
    turnRoll: turnRoll,
    turnYaw: turnYaw,
    turnPitch: turnPitch,
    moveShip: moveShip
};
