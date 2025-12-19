import { Ship, Station } from '@starship-mayflower/util';
import { Player } from '../models/Player';

/**
 * Registry of all ships and players
 */
export class ShipRegistry {
  protected ships: Record<string, Ship> = {};
  protected players: Record<number, Player> = {};

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
  addShip(ship: Ship): Ship {
    if (!ship) {
      throw new Error('Ship must not be empty');
    } else if (this.getShipByName(ship.getName())) {
      throw new Error('Ship already exists');
    }

    this.ships[ship.getId()] = ship;

    return ship;
  }

  /**
   * Gets a ship by its name
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
      throw new Error('Player must not be empty');
    } else if (this.getPlayerByName(player.getName())) {
      throw new Error('Player already exists');
    }

    this.players[player.getId()] = player;

    return player;
  }

  /**
   * Returns a player by its id property
   */
  getPlayer(playerId: number): Player | undefined {
    return this.players[playerId];
  }

  /**
   * Gets a player by its name
   */
  getPlayerByName(playerName: string): Player | undefined {
    return this.getAllPlayers().find((player) => {
      return player.getName() === playerName;
    });
  }

  /**
   * Returns all players
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
    }

    delete this.players[playerId];
  }

  /**
   * Registers a player with a ship
   */
  addPlayerToShip(ship: Ship, player: Player) {
    ship.addPlayer(player);
    player.setShip(ship);
  }

  /**
   * Register a player to a station of a ship
   */
  takeStation(ship: Ship, player: Player, position: Station): boolean {
    return ship.takeStation(position, player);
  }

  /**
   * Releases a player from a station of a ship
   */
  releaseStation(ship: Ship, player: Player, position: Station): boolean {
    return ship.releaseStation(position, player);
  }
}
