import { Ship, Station } from '@starship-mayflower/util';
import { Channel } from '../Channel';
import { Message, ResponseMessage } from '../Message';
import { Session } from '../Session';
import { RouteHandler } from './RouteHandler';
import { Game } from '../game/Game';
import { Player } from '../models/Player';

export class LobbyHandler extends RouteHandler {
  public name = 'lobby';

  constructor(private game: Game) {
    super();
  }

  handle(session: Session, msg: Message, channel: Channel): ResponseMessage {
    const method = msg.method as string;

    switch (method) {
      case 'listAvailableShips':
        return this.listAvailableShips(session);
      case 'joinShip':
        return this.joinShip(session, msg, channel);
      case 'addNewShip':
        return this.addNewShip(session, msg, channel);
      case 'addPlayer':
        return this.addPlayer(session, msg);
      case 'takeStation':
        return this.takeStation(session, msg, channel);
      case 'releaseStation':
        return this.releaseStation(session, msg, channel);
      case 'readyToPlay':
        return this.readyToPlay(session, msg, channel);
      default:
        return {
          status: 'error',
          error: 'Unknown method: ' + method,
        };
    }
  }

  private listAvailableShips(session: Session): ResponseMessage {
    if (!session.playerName) {
      return {
        status: 'error',
        error: 'User not logged in',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const shipList = shipRegistry.getAllShips().map((ship) => ship.serialize());

    return {
      status: 'ok',
      ships: shipList,
    };
  }

  private joinShip(
    session: Session,
    msg: Message,
    channel: Channel
  ): ResponseMessage {
    if (!session.playerName) {
      return {
        status: 'error',
        error: 'User not logged in',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const player = shipRegistry.getPlayerByName(session.playerName);
    const ship = shipRegistry.getShip(msg.payload.shipId);

    if (!player) {
      return {
        status: 'error',
        error: 'Player not found',
      };
    }

    if (!ship) {
      return {
        status: 'error',
        error: 'Unknown ship',
      };
    }

    shipRegistry.addPlayerToShip(ship, player);
    channel.addSessionToShip(session, ship.getId());

    return {
      status: 'ok',
      ship: ship.serialize(),
    };
  }

  private addNewShip(
    session: Session,
    msg: Message,
    channel: Channel
  ): ResponseMessage {
    if (!session.playerName) {
      return {
        status: 'error',
        error: 'User not logged in',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const objectRegistry = this.game.getObjectRegistry();
    const player = shipRegistry.getPlayerByName(session.playerName);

    if (!player) {
      return {
        status: 'error',
        error: 'Player not found',
      };
    }

    try {
      const ship = new Ship(msg.payload.name || msg.payload);
      const id = objectRegistry.createId();
      ship.setId(id);
      ship.setCreator(player);

      // Set random position (World.getRandomPosition() equivalent)
      const World = require('../world/World');
      ship.setPosition(World.getRandomPosition());

      shipRegistry.addShip(ship);
      channel.pushToLobby('ShipAdded', ship.serialize());

      return {
        status: 'ok',
        ship: ship.serialize(),
      };
    } catch (e: any) {
      return {
        status: 'error',
        error: e.message,
      };
    }
  }

  private addPlayer(session: Session, msg: Message): ResponseMessage {
    const shipRegistry = this.game.getShipRegistry();
    const player = new Player(
      Date.now(), // Simple ID generation
      msg.payload.name,
      session.id
    );

    try {
      shipRegistry.addPlayer(player);
      session.setPlayerName(player.getName());

      return {
        status: 'ok',
      };
    } catch (e: any) {
      return {
        status: 'error',
        error: e.message,
      };
    }
  }

  private takeStation(
    session: Session,
    msg: Message,
    channel: Channel
  ): ResponseMessage {
    if (!session.playerName) {
      return {
        status: 'error',
        error: 'User not logged in',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const player = shipRegistry.getPlayerByName(session.playerName);

    if (!player || !player.getShip()) {
      return {
        status: 'error',
        error: 'Player not on a ship',
      };
    }

    const ship = player.getShip();
    const success = shipRegistry.takeStation(
      ship,
      player,
      msg.payload.position as Station
    );

    if (success) {
      channel.pushToShip(ship.getId(), 'StationTaken', ship.serialize());
      return {
        status: 'ok',
        ship: ship.serialize(),
      };
    } else {
      return {
        status: 'error',
        error: 'Position already taken',
      };
    }
  }

  private releaseStation(
    session: Session,
    msg: Message,
    channel: Channel
  ): ResponseMessage {
    if (!session.playerName) {
      return {
        status: 'error',
        error: 'User not logged in',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const player = shipRegistry.getPlayerByName(session.playerName);

    if (!player || !player.getShip()) {
      return {
        status: 'error',
        error: 'Player not on a ship',
      };
    }

    const ship = player.getShip();
    const success = shipRegistry.releaseStation(
      ship,
      player,
      msg.payload.position as Station
    );

    if (success) {
      channel.pushToShip(ship.getId(), 'StationReleased', ship.serialize());
      return {
        status: 'ok',
        ship: ship.serialize(),
      };
    } else {
      return {
        status: 'error',
        error: 'Position not taken by player',
      };
    }
  }

  private readyToPlay(
    session: Session,
    msg: Message,
    channel: Channel
  ): ResponseMessage {
    if (!session.playerName) {
      return {
        status: 'error',
        error: 'User not logged in',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const player = shipRegistry.getPlayerByName(session.playerName);

    if (!player) {
      return {
        status: 'error',
        error: 'Player not found',
      };
    }

    player.setReadyToPlay(msg.payload.ready || msg.payload);

    // Check if all players are ready
    let allReady = true;
    shipRegistry.getAllPlayers().forEach((p) => {
      if (!p.getReadyToPlay()) {
        allReady = false;
      }
    });

    // Start game if all ready and not already running
    if (allReady && !this.game.isRunning()) {
      this.game.start();
      channel.pushToLobby('GameStarted', {});
    }

    return {
      status: 'ok',
      running: this.game.isRunning(),
    };
  }
}
