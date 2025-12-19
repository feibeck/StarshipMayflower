import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { GameServerClient } from './client';
import { RootState } from './store';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  authenticated: boolean;
  name: string;
}

const gameServerClient = new GameServerClient();
gameServerClient.connect();

export const initialAuthState: AuthState = {
  authenticated: false,
  name: '',
};

export const register = createAsyncThunk(
  'users/fetchByIdStatus',
  async (username: string) => {
    await gameServerClient.call({
      handler: 'auth',
      method: 'login',
      payload: {
        playerName: username,
      },
    });
    return { username };
  }
);

export const authSlice = createSlice({
  name: AUTH_FEATURE_KEY,
  initialState: initialAuthState,
  reducers: {
    authenticated: (state) => {
      state.authenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(register.fulfilled, (state, action) => {
      state.authenticated = true;
      state.name = action.payload.username;
    });
  },
});

export const authReducer = authSlice.reducer;

export const { authenticated } = authSlice.actions;

export const getAuthState = (rootState: Record<string, unknown>): AuthState =>
  rootState[AUTH_FEATURE_KEY] as AuthState;

export const selectAuthenticated = createSelector(
  (state: RootState) => getAuthState(state).authenticated,
  (authenticated) => authenticated
);

export const selectUsername = (state: RootState) => {
  return state.auth.name;
};
