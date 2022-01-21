import { RouteHandler } from './handler/RouteHandler';
import { Session } from './Session';
import { Channel } from './Channel';
import { Message } from './Message';

export class Router {
  private handler: Record<string, RouteHandler> = {};

  routeMessage(session: Session, message: Message, channel: Channel) {
    if (!this.handler[message.handler as string]) {
      throw new Error('No Router for message: ' + JSON.stringify(message));
    }
    return this.handler[message.handler as string].handle(
      session,
      message,
      channel
    );
  }

  addHandler(handler: RouteHandler) {
    this.handler[handler.name] = handler;
  }
}
