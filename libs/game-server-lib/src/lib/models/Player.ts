import { Ship } from '@starship-mayflower/util';

/**
 * Player model
 */
export class Player {
  protected _ship: Ship | null = null;
  protected _readyToPlay = false;
  public sessionId: string;

  constructor(
    protected _id: number,
    protected _name: string,
    sessionId: string,
  ) {
    this.sessionId = sessionId;
  }

  /**
   * Returns the player's id
   */
  get id(): number {
    return this._id;
  }

  /**
   * Returns the player's id (legacy method)
   */
  getId(): number {
    return this._id;
  }

  /**
   * Returns the player's name
   */
  getName(): string {
    return this._name;
  }

  /**
   * Returns the server id the player is registered with (legacy)
   * @deprecated Use sessionId property instead
   */
  getServerId(): string {
    return this.sessionId;
  }

  /**
   * Set the ship the player is playing
   */
  setShip(ship: Ship | null) {
    this._ship = ship;
  }

  /**
   * Returns the ship the player is registered with
   */
  getShip(): Ship | null {
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
   */
  serialize(): { id: number; name: string; ready: boolean } {
    return {
      id: this.getId(),
      name: this.getName(),
      ready: this.getReadyToPlay(),
    };
  }
}
