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

export const initialAuthState: AuthState = {
  authenticated: false,
  name: '',
};

export const register = createAsyncThunk(
  'users/fetchByIdStatus',
  async (username: string) => {
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
    },
    logout: (state) => {
      state.authenticated = false;
      state.name = '';
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
