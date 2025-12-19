import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

interface Callbacks {
  resolve: (message: Record<string, unknown>) => void;
  reject: VoidFunction;
}

export class GameServerClient extends EventEmitter {
  private client: WebSocket | null = null;
  private connected = false;
  private calls: Record<string, Callbacks> = {};

  connect() {
    this.client = new WebSocket('ws://localhost:10000');
    this.client.addEventListener('open', () => {
      this.connected = true;
      this.emit('open');
    });
    this.client.addEventListener('message', (msg: MessageEvent) => {
      this.handleMessage(JSON.parse(msg.data.toString()));
    });
    this.client.addEventListener('error', (event) => {
      this.emit('connectionError');
    });
    this.client.addEventListener('close', () => {
      console.log('CLOSED');
    });
  }

  handleMessage(msg: Record<string, unknown>) {
    if (msg['requestId'] && this.calls[msg['requestId'] as string]) {
      const funcs = this.calls[msg['requestId'] as string];
      funcs.resolve(msg);
      delete this.calls[msg['requestId'] as string];
    } else if (msg['requestId'] && !this.calls[msg['requestId'] as string]) {
      // answer to an unknown call? throw something?
    } else {
      this.handleChannelMessage(msg);
    }
  }

  handleChannelMessage(msg: Record<string, unknown>) {
    this.emit('message', msg);
  }

  call(message: Record<string, unknown>): Promise<Record<string, unknown>> {
    const promise = new Promise<Record<string, unknown>>((resolve, reject) => {
      message['requestId'] = uuidv4();
      if (!this.connected || !this.client) {
        reject('Not Connected');
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.client!.send(JSON.stringify(message));
      this.calls[message['requestId'] as string] = {
        resolve: resolve,
        reject: reject,
      };
    });
    return promise;
  }
}
