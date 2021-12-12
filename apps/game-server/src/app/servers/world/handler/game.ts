import { getShipRegistry } from '../../../src/game';

export default function (app) {
  return new Handler(app);
}

class Handler {
  constructor(private app) {}

  start(_msg, session, next) {
    const playerId = session.get('playerId');
    if (!playerId) {
      next(new Error('User not logged in'), { code: 'ERR', payload: {} });
      return;
    }

    const shipRegistry = getShipRegistry();
    const player = shipRegistry.getPlayer(playerId);
    const ship = player.getShip();

    const stations = ship.stationsForPlayer(player);

    next(null, { code: 'OK', payload: stations });
  }
}
