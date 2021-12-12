import { getShipRegistry } from '../../../src/game';

export function playerLeave(args) {
  const playerId = args.playerId;
  const shipRegistry = getShipRegistry();
  shipRegistry.removePlayer(playerId);
}
