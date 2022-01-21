import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

export const GAME_FEATURE_KEY = 'game';

export interface GameState {
  connected: boolean;
  connectionError: boolean;
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error: string | null | undefined;
}

export const initialGameState: GameState = {
  connected: false,
  connectionError: false,
  loadingStatus: 'not loaded',
  error: null,
};

export const gameSlice = createSlice({
  name: GAME_FEATURE_KEY,
  initialState: initialGameState,
  reducers: {
    connected: (state) => {
      state.connected = true;
    },
    connectionError: (state) => {
      state.connectionError = true;
    },
  },
});

export const gameReducer = gameSlice.reducer;

export const { connected, connectionError } = gameSlice.actions;

export const getGameState = (rootState: Record<string, unknown>): GameState =>
  rootState[GAME_FEATURE_KEY] as GameState;

export const selectConnected = createSelector(
  (state: RootState) => getGameState(state).connected,
  (connected) => connected
);

export const selectConnectionError = createSelector(
  (state: RootState) => getGameState(state).connectionError,
  (connectionError) => connectionError
);
