import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const LOBBY_FEATURE_KEY = 'lobby';

/**
 * Lobby State
 * Manages available ships, players, and ship selection
 */

export interface Player {
  id: number;
  name: string;
  ready?: boolean;
}

export interface Ship {
  id: string;
  name: string;
  creator?: {
    id?: number;
    name?: string;
  };
  players: Player[];
  stations: Record<string, Player | null>;
}

export interface LobbyState {
  ships: Ship[];
  currentShip: Ship | null;
  currentShipId: string | null;
  players: Player[];
  myStations: string[];
  isReady: boolean;
  loadingStatus: 'idle' | 'loading' | 'loaded' | 'error';
  error: string | null;
}

export const initialLobbyState: LobbyState = {
  ships: [],
  currentShip: null,
  currentShipId: null,
  players: [],
  myStations: [],
  isReady: false,
  loadingStatus: 'idle',
  error: null,
};

export const lobbySlice = createSlice({
  name: LOBBY_FEATURE_KEY,
  initialState: initialLobbyState,
  reducers: {
    // Ship list management
    setShips: (state, action: PayloadAction<Ship[]>) => {
      state.ships = action.payload;
      state.loadingStatus = 'loaded';
    },

    shipAdded: (state, action: PayloadAction<Ship>) => {
      state.ships.push(action.payload);
    },

    shipRemoved: (state, action: PayloadAction<string>) => {
      state.ships = state.ships.filter((ship) => ship.id !== action.payload);
      if (state.currentShipId === action.payload) {
        state.currentShip = null;
        state.currentShipId = null;
      }
    },

    shipUpdated: (state, action: PayloadAction<Ship>) => {
      const index = state.ships.findIndex(
        (ship) => ship.id === action.payload.id,
      );
      if (index !== -1) {
        state.ships[index] = action.payload;
      }
      // Also update current ship if it's the same one
      if (state.currentShipId === action.payload.id) {
        state.currentShip = action.payload;
      }
    },

    // Current ship management
    setCurrentShip: (state, action: PayloadAction<Ship>) => {
      state.currentShip = action.payload;
      state.currentShipId = action.payload.id;
    },

    updateCurrentShip: (state, action: PayloadAction<Partial<Ship>>) => {
      if (state.currentShip) {
        state.currentShip = { ...state.currentShip, ...action.payload };
      }
    },

    leaveShip: (state) => {
      state.currentShip = null;
      state.currentShipId = null;
      state.myStations = [];
      state.isReady = false;
    },

    // Player management
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
    },

    playerAdded: (state, action: PayloadAction<Player>) => {
      const exists = state.players.find((p) => p.id === action.payload.id);
      if (!exists) {
        state.players.push(action.payload);
      }
    },

    playerRemoved: (state, action: PayloadAction<number>) => {
      state.players = state.players.filter((p) => p.id !== action.payload);
    },

    // Station management
    stationTaken: (
      state,
      action: PayloadAction<{ position: string; player: Player }>,
    ) => {
      if (state.currentShip) {
        state.currentShip.stations[action.payload.position] =
          action.payload.player;
      }
    },

    stationReleased: (state, action: PayloadAction<string>) => {
      if (state.currentShip) {
        state.currentShip.stations[action.payload] = null;
      }
    },

    takeStation: (state, action: PayloadAction<string>) => {
      if (!state.myStations.includes(action.payload)) {
        state.myStations.push(action.payload);
      }
    },

    releaseStation: (state, action: PayloadAction<string>) => {
      state.myStations = state.myStations.filter((s) => s !== action.payload);
    },

    // Ready state
    setReady: (state, action: PayloadAction<boolean>) => {
      state.isReady = action.payload;
    },

    // Loading states
    setLoading: (state) => {
      state.loadingStatus = 'loading';
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.loadingStatus = 'error';
      state.error = action.payload;
    },

    // Reset
    resetLobby: () => initialLobbyState,
  },
});

export const lobbyReducer = lobbySlice.reducer;

export const {
  setShips,
  shipAdded,
  shipRemoved,
  shipUpdated,
  setCurrentShip,
  updateCurrentShip,
  leaveShip,
  setPlayers,
  playerAdded,
  playerRemoved,
  stationTaken,
  stationReleased,
  takeStation,
  releaseStation,
  setReady,
  setLoading,
  setError,
  resetLobby,
} = lobbySlice.actions;

// Selectors
export const getLobbyState = (rootState: RootState): LobbyState =>
  rootState[LOBBY_FEATURE_KEY];

export const selectLobbyShips = createSelector(
  getLobbyState,
  (state) => state.ships,
);

export const selectCurrentShip = createSelector(
  getLobbyState,
  (state) => state.currentShip,
);

export const selectPlayers = createSelector(
  getLobbyState,
  (state) => state.players,
);

export const selectMyStations = createSelector(
  getLobbyState,
  (state) => state.myStations,
);

export const selectIsReady = createSelector(
  getLobbyState,
  (state) => state.isReady,
);

export const selectAvailableStations = createSelector(
  selectCurrentShip,
  (ship) => {
    if (!ship) return [];
    return Object.entries(ship.stations)
      .filter(([, player]) => player === null)
      .map(([station]) => station);
  },
);

export const selectTakenStations = createSelector(selectCurrentShip, (ship) => {
  if (!ship) return [];
  return Object.entries(ship.stations)
    .filter(([, player]) => player !== null)
    .map(([station, player]) => ({ station, player }));
});

export const selectLoadingStatus = createSelector(
  getLobbyState,
  (state) => state.loadingStatus,
);

export const selectError = createSelector(
  getLobbyState,
  (state) => state.error,
);
