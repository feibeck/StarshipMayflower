import { Ship } from '@starship-mayflower/util';
import { Matrix, Vector } from 'sylvester-es6';
import { turn } from './physics';

describe('Physics engine', () => {
  it('Rotations in the ship FOR should not change the axis of rotation', function () {
    expect(() => {
      testRotationInShipFOR();
    }).not.toThrow();
  });
});

/**
 * This is a brute-force test for rotations in the ships frame of reference.
 * Specifically, we do random rotations and assert that the rotational axis
 * remains unchanged after each rotation.
 */
function testRotationInShipFOR() {
  const ITERATIONS = 10000,
    THRESHOLD = 1e-30;

  const ship = new Ship('foo');

  const iterate = () => {
    const angle = 360 * Math.random(),
      direction = chooseDirection(),
      oldOrientation = Matrix.I(3).multiply(ship.getOrientation());

    turn(ship, angle, direction);

    assert(oldOrientation, ship.getOrientation(), direction);
  };

  function chooseDirection() {
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        return 'yaw';
      case 1:
        return 'pitch';
      case 2:
        return 'roll';
      default:
        throw 'KMA';
    }
  }

  function getUnitVector(direction) {
    switch (direction) {
      case 'yaw':
        return new Vector([0, 1, 0]);
      case 'pitch':
        return new Vector([1, 0, 0]);
      case 'roll':
        return new Vector([0, 0, 1]);
      default:
        throw 'KMA';
    }
  }

  const assert = (oldOrientation, newOrientation, direction) => {
    const e = getUnitVector(direction),
      oldAxis = oldOrientation.multiply(e),
      newAxis = newOrientation.multiply(e),
      difference = oldAxis.subtract(newAxis),
      differenceSquare = difference.dot(difference);

    if (differenceSquare > THRESHOLD) {
      throw new Error(
        `'WARNING! Difference ${differenceSquare} exceeds threshold'`
      );
    }
  };

  for (let i = 0; i < ITERATIONS; i++) {
    iterate();
  }
}
