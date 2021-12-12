import { Ship } from '@starship-mayflower/util';

/**
 * Player model
 */
export class Player {
  protected _ship: Ship | null = null;
  protected _readyToPlay = false;

  constructor(
    protected _id: number,
    protected _name: string,
    protected _serverId: string
  ) {}

  /**
   * Returns the players id
   */
  getId(): number {
    return this._id;
  }

  /**
   * Returns the players name
   */
  getName(): string {
    return this._name;
  }

  /**
   * Returns the server id the player is registered with
   */
  getServerId(): string {
    return this._serverId;
  }

  /**
   * Set the ship the player is playing
   */
  setShip(ship: Ship) {
    this._ship = ship;
  }

  /**
   * Returns the ship the player is registered with
   */
  getShip(): Ship {
    return this._ship;
  }

  /**
   * Sets the readyToPlay property
   */
  setReadyToPlay(readyToPlay: boolean) {
    this._readyToPlay = readyToPlay;
  }

  /**
   * Returns the readyToPlay property
   */
  getReadyToPlay(): boolean {
    return this._readyToPlay;
  }

  /**
   * Returns a JSON representation of the player
   *
   * @returns {{id: Integer, name: String}}
   */
  serialize(): { id: number; name: string } {
    return {
      id: this.getId(),
      name: this.getName(),
    };
  }
}
