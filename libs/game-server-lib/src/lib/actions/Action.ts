let id = 1;

export interface ActionOptions {
  type?: string;
  id?: number;
  singleton?: boolean;
  data?: any;
  ship?: any;
  arc?: number;
  axis?: string;
  targetSpeed?: number;
}

/**
 * Action class, used to execute actions in the server
 */
export abstract class Action {
  protected data: any;
  public id: number;
  public type: string;
  public finished = false;
  public aborted = false;
  public singleton = false;
  protected _burnRate = 0;
  protected ship: any;

  constructor(opts: ActionOptions) {
    this.data = opts.data;
    this.id = opts.id || id++;
    this.type = opts.type || 'defaultAction';
    this.singleton = opts.singleton || false;
  }

  /**
   * Update interface, default update will do nothing, every tick the update will be invoked
   */
  abstract update(): void;

  /**
   * Updates the ship's energy
   */
  burnFuel(seconds: number) {
    let energy = this.ship.getEnergy();
    energy = energy - seconds * this._burnRate;
    if (energy < 0) {
      energy = 0;
    }

    this.ship.setEnergy(energy);
  }
}
