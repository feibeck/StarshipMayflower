import { RouteHandler } from './RouteHandler';
import { Message, ResponseMessage } from '../Message';
import { Session } from '../Session';
import { Channel } from '../Channel';

export class AuthHandler extends RouteHandler {
  public name = 'auth';
  handle(
    session: Session,
    message: Message,
    channel: Channel
  ): ResponseMessage {
    session.setPlayerName(message.payload['playerName'] as string);
    channel.sendToAll({ event: 'playerJoined' });
    return {
      status: 'ok',
    };
  }
}
