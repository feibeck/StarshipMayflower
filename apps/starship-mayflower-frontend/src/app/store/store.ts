import { configureStore } from '@reduxjs/toolkit';
import { authReducer, AUTH_FEATURE_KEY } from './auth.slice';
import { GAME_FEATURE_KEY, gameReducer } from './game.slice';
import { lobbyReducer, LOBBY_FEATURE_KEY } from './slices/lobby.slice';
import { worldReducer, WORLD_FEATURE_KEY } from './slices/world.slice';
import { shipReducer, SHIP_FEATURE_KEY } from './slices/ship.slice';
import { GameMiddleware } from './websocketMiddleware';

export const store = configureStore({
  reducer: {
    [GAME_FEATURE_KEY]: gameReducer,
    [AUTH_FEATURE_KEY]: authReducer,
    [LOBBY_FEATURE_KEY]: lobbyReducer,
    [WORLD_FEATURE_KEY]: worldReducer,
    [SHIP_FEATURE_KEY]: shipReducer,
  },
  // Additional middleware can be passed to this array
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware();
    middleware.push(GameMiddleware);
    return middleware;
  },
  devTools: process.env['NODE_ENV'] !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
