import { Handler } from './Handler';
import { Session } from './Session';
import { Channel } from './Channel';
import { Message } from './Message';

export class Router {
  private handler: Record<string, Handler> = {};

  routeMessage(session: Session, message: Message, channel: Channel) {
    if (this.handler[message.handler as string]) {
      return this.handler[message.handler as string].handle(
        session,
        message,
        channel
      );
    }
  }

  addHandler(handler: Handler) {
    this.handler[handler.name] = handler;
  }
}
