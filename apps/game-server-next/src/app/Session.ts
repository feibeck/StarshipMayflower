import { v4 as uuidv4 } from 'uuid';
import * as WebSocket from 'ws';
import { ChannelName } from './Channel';

export class Session {
  id: string;
  playerName?: string;
  socket: WebSocket;
  channels: ChannelName[] = [];
  constructor(socket: WebSocket) {
    this.id = uuidv4();
    this.socket = socket;
  }
  addChannel(channel: ChannelName) {
    this.channels.push(channel);
  }
  setPlayerName(playerName: string) {
    this.playerName = playerName;
  }
}
