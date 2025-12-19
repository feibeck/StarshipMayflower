import { Ship, Station } from '@starship-mayflower/util';
import { Vector } from 'sylvester-es6';
import { ActionManager } from '../actions/ActionManager';
import { Channel } from '../Channel';
import { moveShip as moveShipPhysics } from '../physics/Physics';
import { Timer } from './Timer';
import { ShipRegistry } from '../world/ShipRegistry';
import { ObjectRegistry } from '../world/ObjectRegistry';
import { getRandomPosition, AU } from '../world/World';
import { Player } from '../models/Player';

// Import Planet and Station models
// These would need to be created in libs/game-server-lib/src/lib/models/
// or imported from @starship-mayflower/util if moved there

/**
 * Main game instance
 */
export class Game {
  private shipRegistry: ShipRegistry;
  private objectRegistry: ObjectRegistry;
  private actionManager: ActionManager;
  private timer: Timer;
  private channel: Channel;
  private running = false;

  constructor(channel: Channel) {
    this.channel = channel;
    this.shipRegistry = new ShipRegistry();
    this.objectRegistry = new ObjectRegistry();
    this.actionManager = new ActionManager();

    this.timer = new Timer(
      this.actionManager,
      () => this.moveShips(),
      () => this.sendUpdates()
    );

    this.initializeWorld();
  }

  /**
   * Initialize the game world with stations and celestial objects
   */
  private initializeWorld() {
    // TODO: Create Space Stations and Sun
    // This requires porting Station and Planet classes or creating them in models/
    // For now, leaving placeholder comments

    // const spaceStationOne = new Station('Space Station One');
    // spaceStationOne.setPosition(getRandomPosition());
    // this.objectRegistry.addObject(spaceStationOne);

    // const sun = new Planet('Sun', { x: 1392684, y: 1392684, z: 1392684 }, 'Sun');
    // sun.setPosition(new Vector([AU, AU, AU]));
    // this.objectRegistry.addObject(sun);
  }

  /**
   * Start the game loop
   */
  start() {
    if (!this.running) {
      this.timer.start();
      this.running = true;
    }
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.timer.stop();
    this.running = false;
  }

  /**
   * Check if game is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get the ship registry
   */
  getShipRegistry(): ShipRegistry {
    return this.shipRegistry;
  }

  /**
   * Get the object registry
   */
  getObjectRegistry(): ObjectRegistry {
    return this.objectRegistry;
  }

  /**
   * Get the action manager
   */
  getActionManager(): ActionManager {
    return this.actionManager;
  }

  /**
   * Move all ships
   */
  private moveShips() {
    this.shipRegistry.getAllShips().forEach((ship) => {
      this.moveShip(ship);
    });
  }

  /**
   * Move a single ship
   */
  private moveShip(ship: Ship) {
    const lastMove = ship.getLastMove();
    const seconds = (Date.now() - lastMove) / 1000;

    moveShipPhysics(ship, seconds);
    ship.setLastMove(Date.now());

    // Broadcast ship update to all players on the ship
    this.channel.pushToShip(ship.getId(), 'ShipUpdate', ship.serialize());
  }

  /**
   * Send world updates to all ships
   */
  private sendUpdates() {
    this.shipRegistry.getAllShips().forEach((ship) => {
      this.sendKnownWorld(ship);
    });

    const ships: any[] = [];
    this.shipRegistry.getAllShips().forEach((othership) => {
      ships.push(othership.serializeMapData());
    });

    this.objectRegistry.getAllObjects().forEach((spaceObject) => {
      ships.push(spaceObject.serializeMapData());
    });

    this.channel.pushToAll('GlobalUpdate', { ships: ships });
  }

  /**
   * Send the known world to a specific ship
   */
  private sendKnownWorld(ship: Ship) {
    const ships: any[] = [];
    this.shipRegistry.getAllShips().forEach((othership) => {
      if (ship !== othership) {
        ships.push(othership.serializeMapData());
      }
    });

    this.objectRegistry.getAllObjects().forEach((spaceObject) => {
      ships.push(spaceObject.serializeMapData());
    });

    this.channel.pushToShip(ship.getId(), 'WorldUpdate', {
      ship: ship.serialize(),
      ships: ships,
    });
  }
}
