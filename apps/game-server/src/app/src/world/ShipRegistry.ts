import { Ship, Station } from '@starship-mayflower/util';
import { CustomError } from '../customError';
import { Player } from '../models/Player';
import { Channel } from '../channel';

const channel = new Channel();

/**
 * Registry of all ships
 *
 * @constructor
 */
export class ShipRegistry {
  protected ships: Record<string, Ship> = {};
  protected players: Record<number, Player> = {};
  protected game: any;

  constructor() {
    this.game = require('../game');
  }

  /**
   * Returns a list of all ships
   */
  getAllShips(): Ship[] {
    return Object.values(this.ships);
  }

  /**
   * Returns a ship by id
   */
  getShip(shipId: string): Ship | undefined {
    return this.ships[shipId];
  }

  /**
   * Adds a ship
   */
  addShip(ship: Ship, player: Player): Ship {
    const index = this.game.getObjectRegistry().createId();

    if (!ship) {
      throw new CustomError('Ship must not be empty');
    } else if (this.getShipByName(ship.getName())) {
      throw new CustomError('Ship already exists');
    }

    ship.setId(index);
    ship.setCreator(player);
    ship.setPosition(this.game.getWorld().getRandomPosition());

    this.ships[index] = ship;

    channel.pushToLobby('ShipAdded', ship.serialize());

    return ship;
  }

  /**
   * Gets a ship by its name.
   */
  getShipByName(shipName: string): Ship | undefined {
    return this.getAllShips().find((ship) => {
      return ship.getName() === shipName;
    });
  }

  /**
   * Adds a player
   */
  addPlayer(player: Player): Player {
    if (!player) {
      throw new CustomError('Player must not be empty');
    } else if (this.getPlayerByName(player.getName())) {
      throw new CustomError('Player already exists');
    }

    this.players[player.getId()] = player;
    channel.addPlayerToLobby(player);

    return player;
  }

  /**
   * Returns a player by its id property
   */
  getPlayer(playerId: number): Player | undefined {
    return this.players[playerId];
  }

  /**
   * Gets a player by its name.
   *
   * @param {String} playerName
   * @returns {(Player|null)}
   */
  getPlayerByName(playerName: string): Player | undefined {
    return this.getAllPlayers().find((player) => {
      return player.getName() === playerName;
    });
  }

  /**
   * Returns all players
   *
   * @returns {Array}
   */
  getAllPlayers(): Player[] {
    return Object.values(this.players);
  }

  /**
   * Removes a player
   */
  removePlayer(playerId: number) {
    const player = this.players[playerId];
    if (!player) {
      return;
    }
    const ship = player.getShip();

    if (ship) {
      player.setShip(null);
      ship.removePlayer(player);
      channel.pushToShip(ship, 'StationReleased', ship.serialize());
    }

    channel.removePlayerFromLobby(player);

    delete this.players[playerId];
  }

  /**
   * Registers a player with a ship
   */
  addPlayerToShip(ship: Ship, player: Player) {
    ship.addPlayer(player);
    player.setShip(ship);
    channel.addPlayerToShip(ship, player);
  }

  /**
   * Register a player to a station of a ship
   */
  takeStation(ship: Ship, player: Player, position: Station): boolean {
    const success = ship.takeStation(position, player);
    if (success) {
      channel.pushToShip(ship, 'StationTaken', ship.serialize());
    }
    return success;
  }

  /**
   * Releases a player from a station of a ship
   */
  releaseStation(ship: Ship, player: Player, position: Station): boolean {
    const success = ship.releaseStation(position, player);
    if (success) {
      channel.pushToShip(ship, 'StationReleased', ship.serialize());
    }
    return success;
  }
}
