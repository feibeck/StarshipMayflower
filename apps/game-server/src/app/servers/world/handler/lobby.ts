import { Ship } from '@starship-mayflower/util';
import { Channel } from '../../../src/channel';
import { getShipRegistry, isRunning, start } from '../../../src/game';
import { Player } from '../../../src/models/Player';

const channel = new Channel();

export default function (app) {
  return new Handler(app);
}

class Handler {
  constructor(private app) {}

  listAvailableShips(_msg, session, next) {
    if (!session.get('playerId')) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry(),
      shipList = shipRegistry.getAllShips().map((ship) => {
        return ship.serialize();
      });

    next(null, { code: 'OK', payload: shipList });
  }

  joinShip(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();

    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(msg.shipId);

    if (!ship) {
      next(new Error('Unknown ship'), { code: 'ERR', payload: {} });
      return;
    }

    shipRegistry.addPlayerToShip(ship, player);

    next(null, { code: 'OK', payload: ship.serialize() });
  }

  addNewShip(msg, session, next) {
    const shipRegistry = getShipRegistry(),
      playerId = session.get('playerId');

    if (!playerId) {
      const error = new Error('User not logged in');
      next(error, {
        code: 'ERR',
        payload: {
          error: error.message,
        },
      });
      return;
    }

    const player = shipRegistry.getPlayer(playerId);
    try {
      const ship = shipRegistry.addShip(new Ship(msg), player);
      next(null, {
        code: 'OK',
        payload: ship.serialize(),
      });
    } catch (e) {
      next(e, {
        code: 'ERR',
        payload: {
          error: e.message,
        },
      });
    }
  }

  addPlayer(msg, session, next) {
    const shipRegistry = getShipRegistry();
    const player = new Player(msg.playerId, msg.name, session.frontendId);

    try {
      shipRegistry.addPlayer(player);
    } catch (e) {
      next(e, {
        code: 'ERR',
        payload: {
          error: e.message,
        },
      });
      return;
    }

    next(null, {
      code: 'OK',
      payload: {},
    });
  }

  registerViewer(_msg, session, next) {
    channel.addToGlobalChannel(session.get('viewerId'), session.frontendId);

    next(null, {
      code: 'OK',
      payload: {},
    });
  }

  takeStation(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(player.getShip().getId());

    const success = shipRegistry.takeStation(ship, player, msg.position);

    if (success) {
      next(null, { code: 'OK', payload: ship.serialize() });
    } else {
      next(new Error('Position already taken'), { code: 'ERR', payload: {} });
    }
  }

  releaseStation(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = shipRegistry.getShip(player.getShip().getId());

    const success = shipRegistry.releaseStation(ship, player, msg.position);

    if (success) {
      next(null, { code: 'OK', payload: ship.serialize() });
    } else {
      next(new Error('Position not taken by player'), {
        code: 'ERR',
        payload: {},
      });
    }
  }

  readyToPlay(msg, session, next) {
    const playerId = session.get('playerId');

    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);

    player.setReadyToPlay(msg);

    let allReady = true;
    shipRegistry.getAllPlayers().forEach((player) => {
      if (!player.getReadyToPlay()) {
        allReady = false;
      }
    });

    if (allReady && !isRunning()) {
      start();
      channel.pushToLobby('GameStarted', {});
    }

    next(null, { code: 'OK', payload: isRunning() });
  }
}
