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
    channel: Channel,
  ): ResponseMessage {
    const method = message.method || 'login';

    if (method === 'login') {
      return this.login(session, message, channel);
    } else if (method === 'restore') {
      return this.restoreSession(session, message);
    } else if (method === 'logout') {
      return this.logout(session, channel);
    }

    return {
      status: 'error',
      error: 'Unknown auth method',
    };
  }

  private login(
    session: Session,
    message: Message,
    channel: Channel,
  ): ResponseMessage {
    const username = (message.payload['username'] ||
      message.payload['playerName']) as string;

    if (!username) {
      return {
        status: 'error',
        error: 'Username is required',
      };
    }

    // Check if username is already taken
    const shipRegistry = this.game.getShipRegistry();
    const existingPlayer = shipRegistry.getPlayerByName(username);

    if (existingPlayer && existingPlayer.sessionId !== session.id) {
      return {
        status: 'error',
        error: 'Username already taken',
      };
    }

    // Set player name in session
    session.setPlayerName(username);

    // Register player in ship registry
    if (!existingPlayer) {
      const player = new Player(Date.now(), username, session.id);
      shipRegistry.addPlayer(player);
    } else {
      // Update existing player's session ID
      existingPlayer.sessionId = session.id;
    }

    channel.sendToAll({ event: 'playerJoined' });

    return {
      status: 'ok',
      sessionId: session.id,
      username: username,
    };
  }

  private restoreSession(session: Session, message: Message): ResponseMessage {
    const sessionId = message.payload['sessionId'] as string;
    const username = message.payload['username'] as string;

    if (!sessionId || !username) {
      return {
        status: 'error',
        error: 'Session ID and username are required',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const existingPlayer = shipRegistry.getPlayerByName(username);

    if (!existingPlayer) {
      return {
        status: 'error',
        error: 'Session not found',
      };
    }

    if (existingPlayer.sessionId !== sessionId) {
      return {
        status: 'error',
        error: 'Invalid session',
      };
    }

    // Update session with stored player name
    session.setPlayerName(username);

    // Update player's session ID to new WebSocket session
    existingPlayer.sessionId = session.id;

    return {
      status: 'ok',
      sessionId: session.id,
      username: username,
    };
  }

  private logout(session: Session, channel: Channel): ResponseMessage {
    if (!session.playerName) {
      return {
        status: 'error',
        error: 'Not logged in',
      };
    }

    const shipRegistry = this.game.getShipRegistry();
    const player = shipRegistry.getPlayerByName(session.playerName);

    if (player) {
      shipRegistry.removePlayer(player.id);
      channel.sendToAll({
        event: 'playerLeft',
        payload: { playerId: player.id },
      });
    }

    session.setPlayerName('');

    return {
      status: 'ok',
    };
  }
}
