import * as WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

interface Callbacks {
  resolve: (message: Record<string, unknown>) => void;
  reject: VoidFunction;
}

export class GameServerClient extends EventEmitter {
  private client: WebSocket;
  private connected: Promise<WebSocket>;

  private calls: Record<string, Callbacks> = {};

  constructor() {
    super();

    this.connected = new Promise((resolve) => {
      console.log('Client connecting to server');
      this.client = new WebSocket('ws://localhost:10000');
      this.client.on('open', () => {
        console.log('Client connected');
        resolve(this.client);
      });
    });

    this.client.on('message', (msg: Buffer) => {
      console.log(msg);
      console.log(msg.toString());
      this.handleMessage(JSON.parse(msg.toString()));
    });
  }

  handleMessage(msg: Record<string, unknown>) {
    if (msg.requestId && this.calls[msg.requestId as string]) {
      this.calls[msg.requestId as string].resolve(msg);
      delete this.calls[msg.requestId as string];
    } else if (msg.requestId && !this.calls[msg.requestId as string]) {
      // answer to an unknown call? throw something?
    } else {
      this.handleChannelMessage(msg);
    }
  }

  handleChannelMessage(msg: Record<string, unknown>) {
    this.emit('channel', msg);
  }

  call(message: Record<string, unknown>): Promise<Record<string, unknown>> {
    const promise = new Promise<Record<string, unknown>>((resolve, reject) => {
      message.requestId = uuidv4();
      this.connected.then(() => {
        this.client.send(JSON.stringify(message));
        this.calls[message.requestId as string] = { resolve, reject };
      });
    });
    return promise;
  }
}
