import { Session } from './Session';
import * as WebSocket from 'ws';
import { Router } from './Router';
import { AuthHandler } from './handler/auth';
import { Channel, CHANNEL_ALL } from './Channel';

export class SocketHandler {
  private server: WebSocket.WebSocketServer | undefined;
  private router: Router;
  private channel: Channel = new Channel();

  constructor() {
    this.router = new Router();
    this.router.addHandler(new AuthHandler());
  }

  start(port: number) {
    this.server = new WebSocket.WebSocketServer({
      port,
    });

    this.server.on('connection', (socket: WebSocket) => {
      console.log('Server got client connection');
      const session = new Session(socket);
      session.addChannel(CHANNEL_ALL);
      this.channel.addSession(session);

      socket.on('message', (event: Buffer) => {
        console.log('Server got message');
        this.onMessage(session, event.toString());
      });

      socket.on('close', () => {
        this.channel.removeSession(session);
      });
    });
  }

  onMessage(session: Session, msg: string) {
    const message = JSON.parse(msg);
    const answer = this.router.routeMessage(session, message, this.channel);
    console.log('Server sending response', answer);
    answer.requestId = message.requestId;
    session.socket.send(JSON.stringify(answer));
  }
}
