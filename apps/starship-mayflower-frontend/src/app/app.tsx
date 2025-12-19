import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './lobby/Lobby';
import { RequireAuth } from './auth/auth';
import { LoginPage } from './Login';
import { IntegrationTest } from './pages/IntegrationTest';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectConnected, selectConnectionError } from './store/game.slice';
import { selectAuthenticated, selectUsername, restoreSession } from './store/auth.slice';
import { GlobalStyles } from './theme';

export function App() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(selectConnected);
  const isConnectionError = useAppSelector(selectConnectionError);
  const isAuthenticated = useAppSelector(selectAuthenticated);
  const username = useAppSelector(selectUsername);

  useEffect(() => {
    dispatch({ type: 'WS_CONNECT' });
  }, [dispatch]);

  // Restore session on mount if user was previously authenticated
  useEffect(() => {
    console.log('Checking session restore:', { isAuthenticated, username });
    if (isAuthenticated && username) {
      console.log('Restoring session for:', username);
      dispatch(restoreSession(username));
    }
  }, [isAuthenticated, username, dispatch]); // Run when auth state changes

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
