/**
 * Message Types for WebSocket Communication
 * Format: { handler, method, payload, requestId }
 */

export interface Message {
  handler: string;
  method: string;
  payload: Record<string, unknown>;
  requestId?: string;
}

export interface ResponseMessage {
  status: 'ok' | 'error';
  error?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Auth Handler Messages
 */
export interface LoginPayload {
  username: string;
}

export interface LoginResponse extends ResponseMessage {
  username?: string;
}

/**
 * Lobby Handler Messages
 */
export interface ListAvailableShipsResponse extends ResponseMessage {
  ships?: Array<{
    id: string;
    name: string;
    creator: unknown;
    players: unknown[];
    stations: Record<string, unknown>;
  }>;
}

export interface AddNewShipPayload {
  name: string;
}

export interface JoinShipPayload {
  shipId: string;
}

export interface AddPlayerPayload {
  name: string;
}

export interface TakeStationPayload {
  position: string; // Station type
}

export interface ReleaseStationPayload {
  position: string;
}

export interface ReadyToPlayPayload {
  ready: boolean;
}

export interface ReadyToPlayResponse extends ResponseMessage {
  running?: boolean;
}

/**
 * Navigation Handler Messages
 */
export interface SetImpulseSpeedPayload {
  targetSpeed: number;
}

export interface SetSlowImpulsePayload {
  slowImpulse: boolean;
}

export interface SetWarpPayload {
  warp: boolean;
}

export interface SetWarpLevelPayload {
  targetSpeed: number;
}

export interface TurnPayload {
  arc: number;
  axis: 'yaw' | 'pitch' | 'roll';
}

/**
 * Game Handler Messages
 */
export interface GetCurrentStateResponse extends ResponseMessage {
  ship?: unknown;
  running?: boolean;
}

export interface StartResponse extends ResponseMessage {
  stations?: string[];
}
