import { Matrix, Vector } from 'sylvester-es6';
import { PlayingFieldLength, TURN_YAW, TURN_PITCH, TURN_ROLL } from './world';

/**
 * Convert radians to degrees.
 */
export function deg2rad(angle: number): number {
  return (angle / 180) * Math.PI;
}

/**
 * Ensure that a matrix remains orthonormal in the face of rounding errors.
 */
export function orthonormalizeMatrix(matrix: Matrix): Matrix {
  let c1 = matrix.col(1),
    c2 = matrix.col(2),
    c3 = matrix.col(3);

  c1 = c1.toUnitVector();
  c2 = c2.subtract(c1.multiply(c2.dot(c1))).toUnitVector();
  c3 = c3
    .subtract(c2.multiply(c3.dot(c2)))
    .subtract(c1.multiply(c3.dot(c1)))
    .toUnitVector();

  return new Matrix([
    [c1.e(1), c2.e(1), c3.e(1)],
    [c1.e(2), c2.e(2), c3.e(2)],
    [c1.e(3), c2.e(3), c3.e(3)],
  ]);
}

/**
 * Constrain a value to an interval.
 */
export function clipValue(value: number, min: number, max: number): number {
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
 */
export function clipPosition(position: Vector): Vector {
  const components = [];

  for (let i = 1; i <= 3; i++) {
    components[i - 1] = clipValue(position.e(i), 0, PlayingFieldLength);
  }

  position.setElements(components);

  return position;
}

/**
 * Roll.
 */
export function turnRoll(ship: any, angle: number) {
  const orientation = ship.getOrientation();
  const rotation = Matrix.RotationZ(deg2rad(angle));

  return ship.setOrientation(
    orthonormalizeMatrix(orientation.multiply(rotation))
  );
}

/**
 * Yaw.
 */
export function turnYaw(ship: any, angle: number) {
  const orientation = ship.getOrientation();
  const rotation = Matrix.RotationY(deg2rad(angle));

  return ship.setOrientation(
    orthonormalizeMatrix(orientation.multiply(rotation))
  );
}

/**
 * Pitch.
 */
export function turnPitch(ship: any, angle: number) {
  const orientation = ship.getOrientation();
  const rotation = Matrix.RotationX(deg2rad(angle));

  return ship.setOrientation(
    orthonormalizeMatrix(orientation.multiply(rotation))
  );
}

/**
 * Roll, pitch or yaw :)
 */
export function turn(ship: any, angle: number, direction: string) {
  switch (direction) {
    case TURN_YAW:
      return turnYaw(ship, angle);

    case TURN_PITCH:
      return turnPitch(ship, angle);

    case TURN_ROLL:
      return turnRoll(ship, angle);

    default:
      throw new Error('invalid direction specified: ' + direction);
  }
}

/**
 * Calculate the movement during a timeslice and move the ship accordingly.
 */
export function moveShip(ship: any, timeslice: number) {
  const position = ship.getPosition();
  const heading = ship.getHeading();
  const velocity = ship.getRealVelocity();
  const warp = ship.getWarp();
  const warpSpeed = ship.getWarpSpeed();

  if (warp) {
    let energy = ship.getEnergy();
    const burnRate = 3 * warpSpeed;
    const burnedEnergy = timeslice * burnRate;
    if (energy - burnedEnergy < 0) {
      timeslice = energy / burnRate;
      energy = 0;
    } else {
      energy = energy - burnedEnergy;
    }
    ship.setEnergy(energy);
  }

  const newPosition = position.add(heading.multiply(velocity * timeslice));

  return ship.setPosition(clipPosition(newPosition));
}
