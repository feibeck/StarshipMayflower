var standalone = !module.parent;

if (standalone) {
    testRotationInShipFOR(false);
}

function chat(msg) {
    if (standalone) console.log(msg);
}

function testRotationInShipFOR(failIsFatal) {
    /**
     * This is a brute-force test for rotations in the ships frame of reference.
     * Specifically, we do random rotations and assert that the rotational axis
     * remains unchanged after each rotation.
     */

    if (typeof(failIsFatal) === 'undefined') {
        failIsFatal = true;
    }

    var physics = require('../src/physics'),
        Ship = require('../src/models/Ship'),
        sylvester = require('sylvester'),
        util = require('util');

    var ITERATIONS = 1,
        THRESHOLD = 1E-30;

    var ship = new Ship();

    function iterate() {
        var angle = 360. * Math.random(),
            direction = chooseDirection(),
            oldOrientation = sylvester.Matrix.I(3).multiply(ship.getOrientation());

        physics.turn(ship, angle, direction);

        assert(oldOrientation, ship.getOrientation(), direction);
    }

    function chooseDirection() {
        switch (Math.floor(Math.random() * 3)) {
            case 0:
                return('yaw');
            case 1:
                return('pitch');
            case 2:
                return('roll');
            default:
                throw('KMA');
        }
    }

    function getUnitVector(direction) {
        switch (direction) {
            case 'yaw':
                return sylvester.Vector.create([0., 1., 0.]);
            case 'pitch':
                return sylvester.Vector.create([1., 0., 0.]);
            case 'roll':
                return sylvester.Vector.create([0., 0., 1.]);
            default:
                throw('KMA');
        }
    }

    function assert(oldOrientation, newOrientation, direction) {
        var e = getUnitVector(direction),
            oldAxis = oldOrientation.multiply(e),
            newAxis = newOrientation.multiply(e),
            difference = oldAxis.subtract(newAxis),
            differenceSquare = difference.dot(difference);

        if (differenceSquare > THRESHOLD) {
            chat(util.format(
                'WARNING! Difference %s exceeds threshold', differenceSquare
            ));
            chat(oldAxis);
            chat(newAxis);
            chat();

            if (failIsFatal) throw(new Error('failed'));
        }

        console.log(newOrientation);
        console.log(newOrientation.multiply(sylvester.Vector.create([1, 0 ,0])));
    }

    for (var i = 0; i < ITERATIONS; i++) iterate();

    chat(util.format('%s iterations done', ITERATIONS));
}

module.exports = {
    testRotationInShipFOR: testRotationInShipFOR
};
