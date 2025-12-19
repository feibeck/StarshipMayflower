import { Session } from './Session';

export type ChannelName = 'ALL' | 'LOBBY' | string; // Allow ship-specific channels like "SHIP:123"
export const CHANNEL_ALL = 'ALL';
export const CHANNEL_LOBBY = 'LOBBY';

export class Channel {
  sessions: Session[] = [];

  /**
   * Send a message to a specific channel
   */
  send(channel: ChannelName, message: Record<string, unknown>) {
    this.sessionsForChannel(channel).forEach((session) => {
      session.socket.send(JSON.stringify(message));
    });
  }

  /**
   * Send a message to all connected sessions
   */
  sendToAll(message: Record<string, unknown>) {
    this.send(CHANNEL_ALL, message);
  }

  /**
   * Push a message with event name to all sessions
   */
  pushToAll(event: string, payload: unknown) {
    this.sendToAll({
      event,
      payload,
    });
  }

  /**
   * Push a message with event name to a specific ship's channel
   */
  pushToShip(shipId: string, event: string, payload: unknown) {
    const shipChannel = `SHIP:${shipId}`;
    this.send(shipChannel, {
      event,
      payload,
    });
  }

  /**
   * Push a message to the lobby channel
   */
  pushToLobby(event: string, payload: unknown) {
    this.send(CHANNEL_LOBBY, {
      event,
      payload,
    });
  }

  /**
   * Get all sessions for a specific channel
   */
  sessionsForChannel(channel: ChannelName): Session[] {
    return this.sessions.filter((session: Session) => {
      return session.channels.includes(channel);
    });
  }

  /**
   * Add a session to a specific channel
   */
  addSessionToChannel(session: Session, channel: ChannelName) {
    if (!session.channels.includes(channel)) {
      session.channels.push(channel);
    }
  }

  /**
   * Remove a session from a specific channel
   */
  removeSessionFromChannel(session: Session, channel: ChannelName) {
    session.channels = session.channels.filter((c) => c !== channel);
  }

  /**
   * Add a session to the ship's channel
   */
  addSessionToShip(session: Session, shipId: string) {
    const shipChannel = `SHIP:${shipId}`;
    this.addSessionToChannel(session, shipChannel);
  }

  /**
   * Remove a session from the ship's channel
   */
  removeSessionFromShip(session: Session, shipId: string) {
    const shipChannel = `SHIP:${shipId}`;
    this.removeSessionFromChannel(session, shipChannel);
  }

  /**
   * Add a session to the lobby channel
   */
  addSessionToLobby(session: Session) {
    this.addSessionToChannel(session, CHANNEL_LOBBY);
  }

  /**
   * Remove a session from the lobby channel
   */
  removeSessionFromLobby(session: Session) {
    this.removeSessionFromChannel(session, CHANNEL_LOBBY);
  }

  /**
   * Add a session to the system
   */
  addSession(session: Session) {
    this.sessions.push(session);
  }

  /**
   * Remove a session from the system
   */
  removeSession(session: Session) {
    this.sessions = this.sessions.filter((s) => s !== session);
  }
}
