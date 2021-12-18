import { Session } from './Session';

export type ChannelName = 'ALL' | 'LOBBY';
export const CHANNEL_ALL = 'ALL';

export class Channel {
  sessions: Session[] = [];
  send(channel: ChannelName, message: Record<string, unknown>) {
    this.sessionsForChannel(channel).forEach((session) => {
      session.socket.send(JSON.stringify(message));
    });
  }
  sendToAll(message: Record<string, unknown>) {
    this.send(CHANNEL_ALL, message);
  }
  sessionsForChannel(channel: ChannelName): Session[] {
    return this.sessions.filter((session: Session) => {
      return session.channels.includes(channel);
    });
  }
  addSession(session: Session) {
    this.sessions.push(session);
  }
  removeSession(session: Session) {
    this.sessions = this.sessions.filter((s) => s !== session);
  }
}
