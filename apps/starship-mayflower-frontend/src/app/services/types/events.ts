/**
 * Server Event Types
 * Server broadcasts these events to clients via channels
 */

export interface ServerEvent {
  event: string;
  payload: unknown;
}

/**
 * World Update Events
 */
export interface GlobalUpdateEvent extends ServerEvent {
  event: 'GlobalUpdate';
  payload: {
    ships: Array<{
      id: string;
      position: [number, number, number];
      orientation: number[][];
      [key: string]: unknown;
    }>;
  };
}

export interface WorldUpdateEvent extends ServerEvent {
  event: 'WorldUpdate';
  payload: {
    objects: Array<{
      id: string;
      type: string;
      position: [number, number, number];
      [key: string]: unknown;
    }>;
  };
}

/**
 * Ship Update Events
 */
export interface ShipUpdateEvent extends ServerEvent {
  event: 'ShipUpdate';
  payload: {
    id: string;
    position: [number, number, number];
    orientation: number[][];
    energy: number;
    currentImpulse: number;
    targetImpulse: number;
    warpLevel: number;
    warp: boolean;
    slowImpulse: boolean;
    azimuth: number;
    polar: number;
    [key: string]: unknown;
  };
}

/**
 * Lobby Events
 */
export interface ShipAddedEvent extends ServerEvent {
  event: 'ShipAdded';
  payload: {
    id: string;
    name: string;
    creator: unknown;
    players: unknown[];
    stations: Record<string, unknown>;
  };
}

export interface PlayerAddedEvent extends ServerEvent {
  event: 'PlayerAdded';
  payload: {
    id: number;
    name: string;
  };
}

export interface StationTakenEvent extends ServerEvent {
  event: 'StationTaken';
  payload: {
    ship: {
      id: string;
      stations: Record<string, unknown>;
      [key: string]: unknown;
    };
  };
}

export interface StationReleasedEvent extends ServerEvent {
  event: 'StationReleased';
  payload: {
    ship: {
      id: string;
      stations: Record<string, unknown>;
      [key: string]: unknown;
    };
  };
}

export interface GameStartedEvent extends ServerEvent {
  event: 'GameStarted';
  payload: Record<string, never>;
}

/**
 * Combat Events (for future phases)
 */
export interface WeaponFiredEvent extends ServerEvent {
  event: 'WeaponFired';
  payload: {
    shipId: string;
    weaponId: string;
    targetId?: string;
  };
}

export interface ShipDamagedEvent extends ServerEvent {
  event: 'ShipDamaged';
  payload: {
    shipId: string;
    damage: number;
    system?: string;
  };
}

export interface ShipDestroyedEvent extends ServerEvent {
  event: 'ShipDestroyed';
  payload: {
    shipId: string;
  };
}

/**
 * System Events (for future phases)
 */
export interface SystemDamagedEvent extends ServerEvent {
  event: 'SystemDamaged';
  payload: {
    shipId: string;
    system: string;
    health: number;
  };
}

export interface SystemRepairedEvent extends ServerEvent {
  event: 'SystemRepaired';
  payload: {
    shipId: string;
    system: string;
    health: number;
  };
}

export interface PowerChangedEvent extends ServerEvent {
  event: 'PowerChanged';
  payload: {
    shipId: string;
    system: string;
    powerLevel: number;
  };
}

/**
 * Communication Events (for future phases)
 */
export interface MessageReceivedEvent extends ServerEvent {
  event: 'MessageReceived';
  payload: {
    from: string;
    message: string;
    timestamp: number;
  };
}

/**
 * Type Guard for Server Events
 */
export function isServerEvent(msg: unknown): msg is ServerEvent {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    'event' in msg &&
    'payload' in msg
  );
}
