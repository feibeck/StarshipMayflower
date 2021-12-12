import { Vector } from 'sylvester-es6';

// Speed of light in km/s
export const C = 299792.458;

// Normal impulse speed (0.25c) at 100%, in km/s
export const IMPULSE = 74948.1145;
export const SLOW_IMPULSE = 100;

// Astronomical unit in km
export const AU = 149597870.7;

// playing field length in au
export const PlayingFieldLength = 2 * AU;

export const TURN_YAW = 'yaw';

export const TURN_PITCH = 'pitch';

export const TURN_ROLL = 'roll';

export function getRandomPosition() {
  return new Vector([
    getRandomArbitrary(0, this.PlayingFieldLength),
    getRandomArbitrary(0, this.PlayingFieldLength),
    getRandomArbitrary(0, this.PlayingFieldLength),
  ]);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
