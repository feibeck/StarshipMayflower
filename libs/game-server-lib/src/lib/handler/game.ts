import { Channel } from '../Channel';
import { Message, ResponseMessage } from '../Message';
import { Session } from '../Session';
import { RouteHandler } from './RouteHandler';
import { Game } from '../game/Game';

export class GameHandler extends RouteHandler {
  public name = 'game';

  constructor(private game: Game) {
    super();
  }

  handle(session: Session, msg: Message, channel: Channel): ResponseMessage {
    const method = msg.method as string;

    switch (method) {
      case 'start':
        return this.start(session);
      case 'getCurrentState':
        return this.getCurrentState(session);
      default:
        return {
          status: 'error',
          error: 'Unknown method: ' + method,
        };
    }
  }

  private start(session: Session): ResponseMessage {
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
    if (!ship) {
      return {
        status: 'error',
        error: 'Player not on a ship',
      };
    }

    const stations = ship.stationsForPlayer(player);

    return {
      status: 'ok',
      stations: stations,
    };
  }

  private getCurrentState(session: Session): ResponseMessage {
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
    // TypeScript needs explicit null assertion after the check above
    return {
      status: 'ok',
      ship: ship!.serialize(),
      running: this.game.isRunning(),
    };
  }
}
