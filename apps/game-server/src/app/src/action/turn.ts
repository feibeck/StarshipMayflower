import { Action, ActionOptions } from './action';
import { turn } from '../physics';

/**
 * Action to turn a ship around an axis
 */
export class Turn extends Action {
  protected arc: number;
  protected time: number;
  protected axis: string;

  constructor(opts: ActionOptions) {
    opts.type = 'turn';
    opts.id = opts.ship.getId();
    opts.singleton = true;

    super(opts);
    this.time = Date.now();
    this.ship = opts.ship;
    this.arc = opts.arc;
    this.axis = opts.axis;

    this._burnRate = 2;
  }

  /**
   * Turns a ship around an axis. Updates ship velocity and heading
   * vectors to the new direction.
   */
  update() {
    if (this.arc === 0) {
      this.finished = true;
      return;
    }

    const seconds = (Date.now() - this.time) / 1000;
    const turnDegrees = this.arc * seconds * 3;

    this.burnFuel(seconds);

    if (this.ship.getEnergy() > 0) {
      turn(this.ship, turnDegrees, this.axis);
    }

    this.time = Date.now();
  }

  /**
   * Converts an arc from degrees to radians
   */
  toRadians(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
