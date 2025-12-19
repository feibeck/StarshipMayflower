import { Channel } from '../Channel';
import { Message, ResponseMessage } from '../Message';
import { Session } from '../Session';
import { RouteHandler } from './RouteHandler';
import { Game } from '../game/Game';
import { Accelerate } from '../actions/Accelerate';
import { Turn } from '../actions/Turn';

export class NavigationHandler extends RouteHandler {
  public name = 'navigation';

  constructor(private game: Game) {
    super();
  }

  handle(session: Session, msg: Message, channel: Channel): ResponseMessage {
    const method = msg.method as string;

    switch (method) {
      case 'setImpulseSpeed':
        return this.setImpulseSpeed(session, msg);
      case 'setSlowImpulse':
        return this.setSlowImpulse(session, msg);
      case 'setWarp':
        return this.setWarp(session, msg);
      case 'setWarpLevel':
        return this.setWarpLevel(session, msg);
      case 'turn':
        return this.turn(session, msg);
      default:
        return {
          status: 'error',
          error: 'Unknown method: ' + method,
        };
    }
  }

  private setImpulseSpeed(session: Session, msg: Message): ResponseMessage {
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

    const targetSpeed = msg.payload['targetSpeed'] as number;

    ship.setTargetImpulse(targetSpeed);

    const action = new Accelerate({
      ship: ship,
      targetSpeed: targetSpeed,
    });

    this.game.getActionManager().addAction(action);

    return {
      status: 'ok',
    };
  }

  private setSlowImpulse(session: Session, msg: Message): ResponseMessage {
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

    ship.setSlowImpulse(msg.payload['slowImpulse'] as boolean);

    const action = new Accelerate({
      ship: ship,
      targetSpeed: ship.getTargetImpulse(),
    });

    this.game.getActionManager().addAction(action);

    return {
      status: 'ok',
    };
  }

  private setWarp(session: Session, msg: Message): ResponseMessage {
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

    ship.setWarp(msg.payload['warp'] as boolean);

    return {
      status: 'ok',
    };
  }

  private setWarpLevel(session: Session, msg: Message): ResponseMessage {
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

    const targetSpeed = msg.payload['targetSpeed'] as number;

    ship.setWarpLevel(targetSpeed);
    ship.setWarpSpeed(1 + 3 * (targetSpeed / 100));

    return {
      status: 'ok',
    };
  }

  private turn(session: Session, msg: Message): ResponseMessage {
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

    const arc = msg.payload['arc'] as number;
    const axis = msg.payload['axis'] as string;

    const action = new Turn({ ship: ship, arc: arc, axis: axis });
    this.game.getActionManager().addAction(action);

    return {
      status: 'ok',
    };
  }
}
