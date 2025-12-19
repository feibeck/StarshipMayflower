import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { gameClient } from '../services/GameClient';
import { RootState } from './store';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  authenticated: boolean;
  name: string;
}

// Load initial state from localStorage
const loadAuthFromStorage = (): AuthState => {
  try {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        authenticated: parsed.authenticated || false,
        name: parsed.name || '',
      };
    }
  } catch (error) {
    console.error('Failed to load auth from localStorage:', error);
  }
  return {
    authenticated: false,
    name: '',
  };
};

export const initialAuthState: AuthState = loadAuthFromStorage();

export const register = createAsyncThunk(
  'users/fetchByIdStatus',
  async (username: string) => {
    // Connect to WebSocket server if not already connected
    if (!gameClient.isConnected()) {
      await gameClient.connect();
    }
    await gameClient.login(username);
    return { username };
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (username: string) => {
    // Reconnect to WebSocket server
    if (!gameClient.isConnected()) {
      await gameClient.connect();
    }
    await gameClient.login(username);
    return { username };
  }
);

export const authSlice = createSlice({
  name: AUTH_FEATURE_KEY,
  initialState: initialAuthState,
  reducers: {
    authenticated: (state) => {
      state.authenticated = true;
      localStorage.setItem('auth', JSON.stringify(state));
    },
    logout: (state) => {
      state.authenticated = false;
      state.name = '';
      localStorage.removeItem('auth');
      gameClient.disconnect();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.authenticated = true;
        state.name = action.payload.username;
        localStorage.setItem('auth', JSON.stringify(state));
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.authenticated = true;
        state.name = action.payload.username;
        localStorage.setItem('auth', JSON.stringify(state));
      })
      .addCase(restoreSession.rejected, (state) => {
        // If restore fails, clear the session
        state.authenticated = false;
        state.name = '';
        localStorage.removeItem('auth');
      });
  },
});

export const authReducer = authSlice.reducer;

export const { authenticated, logout } = authSlice.actions;

export const getAuthState = (rootState: Record<string, unknown>): AuthState =>
  rootState[AUTH_FEATURE_KEY] as AuthState;

export const selectAuthenticated = createSelector(
  (state: RootState) => getAuthState(state).authenticated,
  (authenticated) => authenticated
);

export const selectUsername = (state: RootState) => {
  return state.auth.name;
};
