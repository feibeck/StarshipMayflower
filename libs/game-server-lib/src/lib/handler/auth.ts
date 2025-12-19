import { RouteHandler } from './RouteHandler';
import { Message, ResponseMessage } from '../Message';
import { Session } from '../Session';
import { Channel } from '../Channel';
import { Game } from '../game/Game';
import { Player } from '../models/Player';

export class AuthHandler extends RouteHandler {
  public name = 'auth';

  constructor(private game: Game) {
    super();
  }

  handle(
    session: Session,
    message: Message,
    channel: Channel
  ): ResponseMessage {
    const username = (message.payload['username'] || message.payload['playerName']) as string;

    if (!username) {
      return {
        status: 'error',
        error: 'Username is required',
      };
    }

    // Set player name in session
    session.setPlayerName(username);

    // Register player in ship registry
    const shipRegistry = this.game.getShipRegistry();
    const existingPlayer = shipRegistry.getPlayerByName(username);

    if (!existingPlayer) {
      const player = new Player(Date.now(), username, session.id);
      shipRegistry.addPlayer(player);
    }

    channel.sendToAll({ event: 'playerJoined' });

    return {
      status: 'ok',
    };
  }
}
