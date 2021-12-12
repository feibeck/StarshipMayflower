import { Accelerate } from '../../../src/action/accelerate';
import { Turn } from '../../../src/action/turn';
import { getShipRegistry } from '../../../src/game';
import { addAction } from '../../../src/timer';

export default function (app) {
  return new Handler(app);
}

class Handler {
  constructor(private app) {}

  setImpulseSpeed(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(player.getShip().getId());

    ship.setTargetImpulse(msg.targetSpeed);

    const targetSpeed = msg.targetSpeed;

    const action = new Accelerate({
      ship: ship,
      targetSpeed: targetSpeed,
    });

    addAction(action);
  }

  setSlowImpulse(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(player.getShip().getId());

    ship.setSlowImpulse(msg.slowImpulse);

    const action = new Accelerate({
      ship: ship,
      targetSpeed: ship.getTargetImpulse(),
    });

    addAction(action);
  }

  setWarp(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(player.getShip().getId());

    ship.setWarp(msg.warp);
  }

  setWarpLevel(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(player.getShip().getId());

    ship.setWarpLevel(msg.targetSpeed);
    ship.setWarpSpeed(1 + 3 * (msg.targetSpeed / 100));
  }

  turn(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(player.getShip().getId());

    const arc = msg.arc;

    const action = new Turn({ ship: ship, arc: arc, axis: msg.axis });
    addAction(action);
  }
}
