import { configureStore } from '@reduxjs/toolkit';
import { authReducer, AUTH_FEATURE_KEY } from './auth.slice';
import { GAME_FEATURE_KEY, gameReducer } from './game.slice';
import { GameMiddleware } from './websocketMiddleware';

export const store = configureStore({
  reducer: {
    [GAME_FEATURE_KEY]: gameReducer,
    [AUTH_FEATURE_KEY]: authReducer,
  },
  // Additional middleware can be passed to this array
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware();
    middleware.push(GameMiddleware);
    return middleware;
  },
  devTools: process.env.NODE_ENV !== 'production',
  // Optional Redux store enhancers
  enhancers: [],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
