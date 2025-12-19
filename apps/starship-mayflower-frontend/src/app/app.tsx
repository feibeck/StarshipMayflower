import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './lobby/Lobby';
import { RequireAuth } from './auth/auth';
import { LoginPage } from './Login';
import { IntegrationTest } from './pages/IntegrationTest';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectConnected, selectConnectionError } from './store/game.slice';
import { restoreSession, getAuthState } from './store/auth.slice';
import { GlobalStyles } from './theme';

export function App() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(selectConnected);
  const isConnectionError = useAppSelector(selectConnectionError);
  const authState = useAppSelector((state) => getAuthState(state));

  useEffect(() => {
    dispatch({ type: 'WS_CONNECT' });
  }, [dispatch]);

  // Restore session on mount if user was previously authenticated
  useEffect(() => {
    console.log('Checking session restore:', authState);
    if (authState.authenticated && authState.name && authState.sessionId) {
      console.log('Restoring session for:', authState.name);
      dispatch(
        restoreSession({
          username: authState.name,
          sessionId: authState.sessionId,
        }),
      );
    }
  }, [authState.authenticated, authState.name, authState.sessionId, dispatch]);

  return (
    <>
      <GlobalStyles />
      {isConnected ? (
        <Routes>
          <Route path="/" element={<Navigate replace to="/lobby" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<IntegrationTest />} />
          <Route
            path="/lobby"
            element={
              <RequireAuth>
                <Lobby />
              </RequireAuth>
            }
          />
        </Routes>
      ) : isConnectionError ? (
        <div>Connection Error - Unable to connect to game server</div>
      ) : (
        <div>Connecting to game server</div>
      )}
    </>
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}
