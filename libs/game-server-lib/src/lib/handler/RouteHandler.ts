import { Channel } from '../Channel';
import { Message, ResponseMessage } from '../Message';
import { Session } from '../Session';

export abstract class RouteHandler {
  public abstract name: string;
  public abstract handle(
    session: Session,
    msg: Message,
    channel: Channel
  ): ResponseMessage;
}
