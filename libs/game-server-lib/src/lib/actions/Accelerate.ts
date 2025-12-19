import { Action, ActionOptions } from './Action';
import { SLOW_IMPULSE, IMPULSE } from '../world/World';

/**
 * Accelerates a ship
 */
export class Accelerate extends Action {
  /**
   * Accelerate speed
   */
  protected _accelerateSpeed: number;
  protected time: number;
  protected targetSpeed: number;

  constructor(opts: ActionOptions) {
    opts.type = 'accelerate';
    opts.id = opts.ship.getId();
    opts.singleton = true;

    super(opts);

    this._accelerateSpeed = 750000;
    this.time = Date.now();
    this.ship = opts.ship;
    this.targetSpeed = opts.targetSpeed || 0;

    this._burnRate = 3;
  }

  /**
   * Accelerate a ship. Updates the length of the Velocity vector until
   * the desired speed is reached.
   */
  update() {
    const seconds = (Date.now() - this.time) / 1000;

    if (!this.ship.getWarp()) {
      this.burnFuel(seconds);

      if (this.ship.getEnergy() > 0) {
        this.accelerate(seconds);
      }
    }

    this.time = Date.now();
  }

  /**
   * Accelerate the ship
   */
  accelerate(seconds: number) {
    let maxVelocity;
    if (this.ship.getSlowImpulse()) {
      maxVelocity = SLOW_IMPULSE;
    } else {
      maxVelocity = IMPULSE;
    }

    const targetVelocity = (this.targetSpeed / 100) * maxVelocity;
    let currentVelocity = this.ship.getVelocity();

    if (targetVelocity > currentVelocity) {
      currentVelocity += this._accelerateSpeed * seconds;
      if (currentVelocity > targetVelocity) {
        currentVelocity = targetVelocity;
        this.finished = true;
      }
    } else if (targetVelocity < currentVelocity) {
      currentVelocity -= this._accelerateSpeed * seconds;
      if (currentVelocity < targetVelocity) {
        currentVelocity = targetVelocity;
        this.finished = true;
      }
    } else {
      this.finished = true;
    }

    const currentImpulse = (currentVelocity / maxVelocity) * 100;

    this.ship.setVelocity(currentVelocity);
    this.ship.setCurrentImpulse(currentImpulse);
  }
}
