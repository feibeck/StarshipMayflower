import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './lobby/Lobby';
import { RequireAuth } from './auth/auth';
import { LoginPage } from './Login';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectConnected, selectConnectionError } from './store/game.slice';

export function App() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(selectConnected);
  const isConnectionError = useAppSelector(selectConnectionError);

  useEffect(() => {
    dispatch({ type: 'WS_CONNECT' });
  }, [dispatch]); // Fix: Added dependency array to prevent infinite loop

  return isConnected ? (
    <Routes>
      <Route path="/" element={<Navigate replace to="/lobby" />} />
      <Route path="/login" element={<LoginPage />} />
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
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}
