import { Vector } from 'sylvester-es6';

// Speed of light in km/s
export const C = 299792.458;

// Normal impulse speed (0.25c) at 100%, in km/s
export const IMPULSE = 74948.1145;
export const SLOW_IMPULSE = 100;

// Astronomical unit in km
export const AU = 149597870.7;

// Playing field length in AU
export const PlayingFieldLength = 2 * AU;

// Turn direction constants
export const TURN_YAW = 'yaw';
export const TURN_PITCH = 'pitch';
export const TURN_ROLL = 'roll';

/**
 * Generate a random position within the playing field
 */
export function getRandomPosition(): Vector {
  return new Vector([
    getRandomArbitrary(0, PlayingFieldLength),
    getRandomArbitrary(0, PlayingFieldLength),
    getRandomArbitrary(0, PlayingFieldLength),
  ]);
}

/**
 * Get a random number between min and max
 */
function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
