import { Middleware, MiddlewareAPI, Dispatch, UnknownAction } from 'redux';
import { RootState } from './store';
import { gameClient } from '../services/GameClient';
import { connected, connectionError } from './game.slice';
import {
  shipAdded,
  stationTaken,
  stationReleased,
  updateCurrentShip,
  takeStation,
  releaseStation,
} from './slices/lobby.slice';
import { selectUsername } from './auth.slice';
import { globalUpdate, shipUpdate, worldUpdate } from './slices/world.slice';
import { setShip, updatePosition, updateNavigation } from './slices/ship.slice';

/**
 * WebSocket Middleware
 * Handles WebSocket connection and routes server events to Redux actions
 */

interface WsConnectAction extends UnknownAction {
  type: 'WS_CONNECT';
}

interface WsDisconnectAction extends UnknownAction {
  type: 'WS_DISCONNECT';
}

type WebSocketAction = WsConnectAction | WsDisconnectAction | UnknownAction;

// Setup server event listeners
const setupEventListeners = (storeApi: MiddlewareAPI<Dispatch, RootState>) => {
  // Connection events
  gameClient.on('connected', () => {
    storeApi.dispatch(connected());
  });

  gameClient.on('connectionError', () => {
    storeApi.dispatch(connectionError());
  });

  // Lobby events
  gameClient.on('ShipAdded', (payload: unknown) => {
    storeApi.dispatch(shipAdded(payload as Parameters<typeof shipAdded>[0]));
  });

  gameClient.on('StationTaken', (payload: unknown) => {
    const state = storeApi.getState() as RootState;
    const username = selectUsername(state);
    const shipData = payload as unknown;

    storeApi.dispatch(
      updateCurrentShip(shipData as Parameters<typeof updateCurrentShip>[0]),
    );

    // Track which station the current user took
    if (
      username &&
      shipData &&
      typeof shipData === 'object' &&
      'stations' in shipData
    ) {
      const stations = (shipData as { stations: Record<string, unknown> })
        .stations;
      const takenStations = Object.entries(stations)
        .filter(([_, playerName]) => playerName === username)
        .map(([stationName]) => stationName);

      // Update local myStations for each one the user has
      takenStations.forEach((stationName) => {
        storeApi.dispatch(takeStation(stationName));
      });
    }
  });

  gameClient.on('StationReleased', (payload: unknown) => {
    const state = storeApi.getState() as RootState;
    const username = selectUsername(state);
    const currentMyStations = state.lobby.myStations;
    const shipData = payload as unknown;

    storeApi.dispatch(
      updateCurrentShip(shipData as Parameters<typeof updateCurrentShip>[0]),
    );

    // Track which station was released by checking what the user had before
    if (
      username &&
      shipData &&
      typeof shipData === 'object' &&
      'stations' in shipData
    ) {
      const stations = (shipData as { stations: Record<string, unknown> })
        .stations;
      const takenStations = Object.entries(stations)
        .filter(([_, playerName]) => playerName === username)
        .map(([stationName]) => stationName);

      // Find stations the user released (were in myStations but not anymore)
      const releasedStations = currentMyStations.filter(
        (station) => !takenStations.includes(station),
      );

      releasedStations.forEach((stationName) => {
        storeApi.dispatch(releaseStation(stationName));
      });
    }
  });

  gameClient.on('GameStarted', () => {
    console.log('Game started!');
    // Could dispatch a game started action here
  });

  // World events
  gameClient.on('GlobalUpdate', (payload: unknown) => {
    storeApi.dispatch(
      globalUpdate(payload as Parameters<typeof globalUpdate>[0]),
    );
  });

  gameClient.on('WorldUpdate', (payload: unknown) => {
    storeApi.dispatch(
      worldUpdate(payload as Parameters<typeof worldUpdate>[0]),
    );
  });

  // Ship events
  gameClient.on('ShipUpdate', (payload: unknown) => {
    const shipData = payload as Parameters<typeof shipUpdate>[0];

    // Update world state (for other ships)
    storeApi.dispatch(shipUpdate(shipData));

    // Also update own ship state if it's the player's ship
    const state = storeApi.getState() as RootState;
    if (state.ship.id === shipData.id && shipData.orientation) {
      storeApi.dispatch(
        updatePosition({
          position: shipData.position,
          orientation: shipData.orientation,
          velocity: shipData.velocity,
        }),
      );
      storeApi.dispatch(
        updateNavigation({
          azimuth: shipData.azimuth,
          polar: shipData.polar,
          currentImpulse: shipData.currentImpulse,
          targetImpulse: shipData.targetImpulse,
          warpLevel: shipData.warpLevel,
          warp: shipData.warp,
          slowImpulse: shipData.slowImpulse,
        }),
      );
    }
  });

  // Combat events (for future phases)
  gameClient.on('WeaponFired', (payload: unknown) => {
    console.log('Weapon fired:', payload);
  });

  gameClient.on('ShipDamaged', (payload: unknown) => {
    console.log('Ship damaged:', payload);
  });

  gameClient.on('ShipDestroyed', (payload: unknown) => {
    console.log('Ship destroyed:', payload);
  });

  // System events (for future phases)
  gameClient.on('SystemDamaged', (payload: unknown) => {
    console.log('System damaged:', payload);
  });

  gameClient.on('SystemRepaired', (payload: unknown) => {
    console.log('System repaired:', payload);
  });

  gameClient.on('PowerChanged', (payload: unknown) => {
    console.log('Power changed:', payload);
  });

  // Communication events (for future phases)
  gameClient.on('MessageReceived', (payload: unknown) => {
    console.log('Message received:', payload);
  });
};

export const GameMiddleware: Middleware<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  RootState
> =
  (storeApi) =>
  (next) =>
  (action: unknown): unknown => {
    if (typeof action === 'object' && action !== null && 'type' in action) {
      const typedAction = action as WebSocketAction;

      switch (typedAction.type) {
        case 'WS_CONNECT':
          if (!gameClient.isConnected()) {
            // Setup listeners BEFORE connecting so they catch the 'connected' event
            setupEventListeners(storeApi);

            gameClient
              .connect()
              .then(() => {
                console.log('WebSocket connected successfully');
              })
              .catch((error) => {
                console.error('WebSocket connection failed:', error);
                storeApi.dispatch(connectionError());
              });
          }
          return;

        case 'WS_DISCONNECT':
          gameClient.disconnect();
          console.log('WebSocket disconnected');
          return;
      }
    }

    return next(action);
  };
