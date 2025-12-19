import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { Message, ResponseMessage } from './types/messages';
import { ServerEvent, isServerEvent } from './types/events';

interface Callbacks {
  resolve: (message: ResponseMessage) => void;
  reject: (reason: string) => void;
}

/**
 * Enhanced WebSocket Game Client
 *
 * Features:
 * - call(): Request-Response pattern with Promises
 * - notify(): One-way messages (no response expected)
 * - on()/off(): Subscribe to server events
 *
 * Message Format: { handler, method, payload, requestId }
 * Event Format: { event, payload }
 */
export class GameClient extends EventEmitter {
  private client: WebSocket | null = null;
  private connected = false;
  private connecting: Promise<void> | null = null;
  private calls: Record<string, Callbacks> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Connect to WebSocket server
   */
  connect(url = 'ws://localhost:10000'): Promise<void> {
    // Return existing connection if already connected
    if (this.connected) {
      return Promise.resolve();
    }

    // Return pending connection promise if already connecting
    if (this.connecting) {
      return this.connecting;
    }

    // Create new connection
    this.connecting = new Promise((resolve, reject) => {
      this.client = new WebSocket(url);

      this.client.addEventListener('open', () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.connecting = null;
        this.emit('open');
        this.emit('connected');
        resolve();
      });

      this.client.addEventListener('message', (msg: MessageEvent) => {
        this.handleMessage(JSON.parse(msg.data.toString()));
      });

      this.client.addEventListener('error', (event) => {
        this.emit('connectionError', event);
        if (!this.connected) {
          this.connecting = null;
          reject(new Error('Connection failed'));
        }
      });

      this.client.addEventListener('close', () => {
        this.connected = false;
        this.connecting = null;
        this.emit('close');
        this.emit('disconnected');
        this.handleReconnect(url);
      });
    });

    return this.connecting;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.client) {
      this.client.close();
      this.client = null;
      this.connected = false;
      this.connecting = null;
    }
  }

  /**
   * Handle automatic reconnection
   */
  private handleReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.emit('reconnecting', this.reconnectAttempts);
        this.connect(url).catch(() => {
          // Will retry again if needed
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.emit('reconnectFailed');
    }
  }

  /**
   * Handle incoming messages
   */
  handleMessage(msg: Record<string, unknown>) {
    // Check if it's a response to a call (has requestId and matching pending call)
    if (msg['requestId'] && this.calls[msg['requestId'] as string]) {
      const funcs = this.calls[msg['requestId'] as string];
      funcs.resolve(msg as ResponseMessage);
      delete this.calls[msg['requestId'] as string];
    }
    // Check if it's a server event (has event field)
    else if (isServerEvent(msg)) {
      this.handleServerEvent(msg);
    }
    // Generic channel message
    else {
      this.emit('message', msg);
    }
  }

  /**
   * Handle server events (broadcasts from channels)
   */
  handleServerEvent(event: ServerEvent) {
    // Emit the specific event type
    this.emit(event.event, event.payload);

    // Also emit a generic 'serverEvent' for debugging
    this.emit('serverEvent', event);
  }

  /**
   * Call a server method (Request-Response pattern)
   * Returns a Promise that resolves with the server response
   *
   * @example
   * const response = await client.call({
   *   handler: 'auth',
   *   method: 'login',
   *   payload: { username: 'player1' }
   * });
   */
  call(message: Message): Promise<ResponseMessage> {
    return new Promise<ResponseMessage>((resolve, reject) => {
      if (!this.connected || !this.client) {
        reject('Not Connected');
        return;
      }

      const requestId = uuidv4();
      const msgWithId = { ...message, requestId };

      this.client.send(JSON.stringify(msgWithId));
      this.calls[requestId] = {
        resolve: resolve,
        reject: reject,
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.calls[requestId]) {
          this.calls[requestId].reject('Request timeout');
          delete this.calls[requestId];
        }
      }, 30000);
    });
  }

  /**
   * Notify server (one-way message, no response expected)
   * Use for fire-and-forget actions
   *
   * @example
   * client.notify({
   *   handler: 'navigation',
   *   method: 'turn',
   *   payload: { axis: 'yaw', arc: 10 }
   * });
   */
  notify(message: Message): void {
    if (!this.connected || !this.client) {
      console.warn('Cannot notify: not connected');
      return;
    }

    this.client.send(JSON.stringify(message));
  }

  /**
   * Subscribe to server event
   *
   * @example
   * client.on('ShipUpdate', (payload) => {
   *   console.log('Ship updated:', payload);
   * });
   */
  override on(event: string, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Unsubscribe from server event
   */
  override off(event: string, listener: (...args: unknown[]) => void): this {
    return super.off(event, listener);
  }

  /**
   * Subscribe to event once
   */
  override once(event: string, listener: (...args: unknown[]) => void): this {
    return super.once(event, listener);
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Helper methods for common calls
   */

  // Auth
  async login(username: string): Promise<ResponseMessage> {
    return this.call({
      handler: 'auth',
      method: 'login',
      payload: { username },
    });
  }

  async restoreSession(
    username: string,
    sessionId: string,
  ): Promise<ResponseMessage> {
    return this.call({
      handler: 'auth',
      method: 'restore',
      payload: { username, sessionId },
    });
  }

  async logout(): Promise<ResponseMessage> {
    return this.call({
      handler: 'auth',
      method: 'logout',
      payload: {},
    });
  }

  // Lobby
  async listAvailableShips(): Promise<ResponseMessage> {
    return this.call({
      handler: 'lobby',
      method: 'listAvailableShips',
      payload: {},
    });
  }

  async addNewShip(name: string): Promise<ResponseMessage> {
    return this.call({
      handler: 'lobby',
      method: 'addNewShip',
      payload: { name },
    });
  }

  async joinShip(shipId: string): Promise<ResponseMessage> {
    return this.call({
      handler: 'lobby',
      method: 'joinShip',
      payload: { shipId },
    });
  }

  async addPlayer(name: string): Promise<ResponseMessage> {
    return this.call({
      handler: 'lobby',
      method: 'addPlayer',
      payload: { name },
    });
  }

  async takeStation(position: string): Promise<ResponseMessage> {
    return this.call({
      handler: 'lobby',
      method: 'takeStation',
      payload: { position },
    });
  }

  async releaseStation(position: string): Promise<ResponseMessage> {
    return this.call({
      handler: 'lobby',
      method: 'releaseStation',
      payload: { position },
    });
  }

  async readyToPlay(ready: boolean): Promise<ResponseMessage> {
    return this.call({
      handler: 'lobby',
      method: 'readyToPlay',
      payload: { ready },
    });
  }

  // Navigation
  async setImpulseSpeed(targetSpeed: number): Promise<ResponseMessage> {
    return this.call({
      handler: 'navigation',
      method: 'setImpulseSpeed',
      payload: { targetSpeed },
    });
  }

  async setSlowImpulse(slowImpulse: boolean): Promise<ResponseMessage> {
    return this.call({
      handler: 'navigation',
      method: 'setSlowImpulse',
      payload: { slowImpulse },
    });
  }

  async setWarp(warp: boolean): Promise<ResponseMessage> {
    return this.call({
      handler: 'navigation',
      method: 'setWarp',
      payload: { warp },
    });
  }

  async setWarpLevel(targetSpeed: number): Promise<ResponseMessage> {
    return this.call({
      handler: 'navigation',
      method: 'setWarpLevel',
      payload: { targetSpeed },
    });
  }

  async turn(
    axis: 'yaw' | 'pitch' | 'roll',
    arc: number,
  ): Promise<ResponseMessage> {
    return this.call({
      handler: 'navigation',
      method: 'turn',
      payload: { axis, arc },
    });
  }

  // Game
  async start(): Promise<ResponseMessage> {
    return this.call({
      handler: 'game',
      method: 'start',
      payload: {},
    });
  }

  async getCurrentState(): Promise<ResponseMessage> {
    return this.call({
      handler: 'game',
      method: 'getCurrentState',
      payload: {},
    });
  }
}

// Export singleton instance
export const gameClient = new GameClient();
