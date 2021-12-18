import { Channel } from './Channel';
import { Message, ResponseMessage } from './Message';
import { Session } from './Session';

export abstract class Handler {
  public abstract name;
  public abstract handle(
    session: Session,
    msg: Message,
    channel: Channel
  ): ResponseMessage;
}
