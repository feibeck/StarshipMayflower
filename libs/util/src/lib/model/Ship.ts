import { MapData, ObjectInSpace, Size } from './ObjectInSpace';
import { Vector } from 'sylvester-es6';

export type Station = 'helm' | 'weapons' | 'comm' | 'science' | 'engineering';

interface SerializedPlayer {
  id: number;
  name: string;
}

interface Player {
  getId: () => number;
  getName: () => string;
  serialize: () => SerializedPlayer;
}

interface SerializedShip {
  name: string;
  id: number;
  creator: SerializedPlayer | undefined;
  players: SerializedPlayer[];
  stations: Record<Station, SerializedPlayer | null>;
  position: Size;
  speed: number;
  heading: Size;
  targetImpulse: number;
  currentImpulse: number;
  slowImpulse: boolean;
  shipX: Size;
  shipY: Size;
  energy: number;
  warpLevel: number;
  warpSpeed: number;
  warp: boolean;
  orientation: any;
  size: Size;
  model: string;
}

/**
 * Ship model
 */
export class Ship extends ObjectInSpace {
  protected name: string;
  protected creator: Player | null = null;
  protected players: Record<number, Player> = {};

  protected stations: Record<Station, Player | null> = {
    helm: null,
    weapons: null,
    comm: null,
    science: null,
    engineering: null,
  };

  protected size: Size = {
    x: 0.027,
    y: 0.007,
    z: 0.02,
  };

  protected model = 'SpaceFighter02';

  protected targetImpulse = 0;
  protected currentImpulse = 0;

  protected lastMove = 0;

  protected energy = 10000;
  protected slowImpulse = false;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /**
   * Returns the ships name
   */
  getName() {
    return this.name;
  }

  /**
   * Registeres a player with the ship
   */
  addPlayer(player: Player) {
    this.players[player.getId()] = player;
  }

  /**
   * Removes a player from the ship
   */
  removePlayer(player: Player) {
    delete this.players[player.getId()];

    this.releaseStation('helm', player);
    this.releaseStation('weapons', player);
    this.releaseStation('engineering', player);
    this.releaseStation('science', player);
    this.releaseStation('comm', player);
  }

  /**
   * Sets the creator of the ship
   */
  setCreator(player: Player): Ship {
    this.creator = player;
    return this;
  }

  /**
   * Returns the creator of the ship
   */
  getCreator() {
    return this.creator;
  }

  /**
   * Returns the current warp level of a ship
   */
  getWarpLevel() {
    return this.warpLevel;
  }

  /**
   * Set the current warp level
   */
  setWarpLevel(warpLevel: number): Ship {
    this.warpLevel = warpLevel;
    return this;
  }

  /**
   * Returns the current warp speed (multiple of C) of a ship
   */
  getWarpSpeed() {
    return this.warpSpeed;
  }

  /**
   * Set the current warp speed (multiple of C)
   */
  setWarpSpeed(warpSpeed: number): ObjectInSpace {
    this.warpSpeed = warpSpeed;
    return this;
  }

  /**
   * En- or disable warp engine
   */
  setWarp(warp: boolean): Ship {
    this.warp = warp;
    return this;
  }

  /**
   * Retuns wether the ship is going at warp speed
   */
  getWarp() {
    return this.warp;
  }

  /**
   * En- or disable slow impulse mode
   */
  setSlowImpulse(slowImpulse: boolean) {
    this.slowImpulse = slowImpulse;
    return this;
  }

  /**
   * Retuns wether the ship is going at slow impulse speed
   */
  getSlowImpulse() {
    return this.slowImpulse;
  }

  /**
   * Register a player with a station
   */
  takeStation(station: Station, player: Player) {
    if (this.stations[station]) {
      return false;
    }
    this.stations[station] = player;
    return true;
  }

  /**
   * Releases a station from a player
   */
  releaseStation(station: Station, player: Player) {
    if (this.stations[station] != player) {
      return false;
    }
    this.stations[station] = null;
    return true;
  }

  /**
   * Returns all stations a player is stationed on
   */
  stationsForPlayer(player: Player) {
    const stations: Station[] = [];
    Object.keys(this.stations).forEach((key: string) => {
      const stationPlayer = this.stations[key as Station];
      if (stationPlayer && stationPlayer.getId() === player.getId()) {
        stations.push(key as Station);
      }
    });
    return stations;
  }

  /**
   * Sets the available energy of the ship
   */
  setEnergy(energy: number) {
    this.energy = energy;
    return this;
  }

  /**
   * Returns the energy of the ship
   */
  getEnergy() {
    return this.energy;
  }

  /**
   * Set the objects target speed
   */
  setTargetImpulse(targetImpulse: number) {
    this.targetImpulse = targetImpulse;
    return this;
  }

  /**
   * Get the objects target speed
   */
  getTargetImpulse() {
    return this.targetImpulse;
  }

  /**
   * Sets the current impulse speed
   */
  setCurrentImpulse(currentImpulse: number) {
    this.currentImpulse = currentImpulse;
    return this;
  }

  /**
   * Returns the current impulse speed
   */
  getCurrentImpulse() {
    return this.currentImpulse;
  }

  /**
   * Sets the timestamp of the last movement
   */
  setLastMove(lastMove: number) {
    this.lastMove = lastMove;
    return this;
  }

  /**
   * Returns the timestamp of the last movement
   */
  getLastMove() {
    return this.lastMove;
  }

  /**
   * Returns a JSON representation of the ship
   */
  serialize(): SerializedShip {
    const heading = this.getHeading();

    let creator: SerializedPlayer | undefined;
    if (this.creator) {
      creator = this.creator.serialize();
    }

    const players = Object.values(this.players).map((player) =>
      player.serialize(),
    );

    const shipX = this.orientation.multiply(new Vector([1, 0, 0]));
    const shipY = this.orientation.multiply(new Vector([0, 1, 0]));

    return {
      name: this.getName(),
      id: Number.parseInt(this.getId()),
      creator,
      players,
      stations: {
        helm: this.stations.helm
          ? {
              id: this.stations.helm.getId(),
              name: this.stations.helm.getName(),
            }
          : null,
        weapons: this.stations.weapons
          ? {
              id: this.stations.weapons.getId(),
              name: this.stations.weapons.getName(),
            }
          : null,
        science: this.stations.science
          ? {
              id: this.stations.science.getId(),
              name: this.stations.science.getName(),
            }
          : null,
        engineering: this.stations.engineering
          ? {
              id: this.stations.engineering.getId(),
              name: this.stations.engineering.getName(),
            }
          : null,
        comm: this.stations.comm
          ? {
              id: this.stations.comm.getId(),
              name: this.stations.comm.getName(),
            }
          : null,
      },
      position: {
        x: this.position.e(1),
        y: this.position.e(2),
        z: this.position.e(3),
      },
      speed: this.getRealVelocity(),
      targetImpulse: this.targetImpulse,
      currentImpulse: this.currentImpulse,
      slowImpulse: this.slowImpulse,
      heading: {
        x: heading.e(1),
        y: heading.e(2),
        z: heading.e(3),
      },
      shipX: {
        x: shipX.e(1),
        y: shipX.e(2),
        z: shipX.e(3),
      },
      shipY: {
        x: shipY.e(1),
        y: shipY.e(2),
        z: shipY.e(3),
      },
      energy: this.energy,
      warpLevel: this.warpLevel,
      warpSpeed: this.warpSpeed,
      warp: this.warp,
      orientation: this.orientation.elements,
      size: this.size,
      model: this.model,
    };
  }

  /**
   * Returns data neede for showing the ship on a map
   *
   * @returns {{
   *     name: String,
   *     id: Integer,
   *     position: {x: *, y: *, z: *},
   *     speed: *,
   *     heading: {x: *, y: *, z: *}
   * }}
   */
  override serializeMapData(): MapData {
    const heading = this.getHeading();

    return {
      name: this.getName(),
      id: this.getId(),
      position: {
        x: this.position.e(1),
        y: this.position.e(2),
        z: this.position.e(3),
      },
      heading: {
        x: heading.e(1),
        y: heading.e(2),
        z: heading.e(3),
      },
      speed: this.getRealVelocity(),
      warpLevel: this.warpLevel,
      warp: this.warp,
      warpSpeed: this.warpSpeed,
      orientation: this.orientation.elements,
      size: this.size,
      model: this.model,
    };
  }
}
