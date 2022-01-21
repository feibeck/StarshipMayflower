import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './lobby/Lobby';
import { RequireAuth } from './auth/auth';
import { LoginPage } from './Login';
import { useDispatch, useSelector } from 'react-redux';
import { selectConnected, selectConnectionError } from './store/game.slice';

export function App() {
  const dispatch = useDispatch();
  const isConnected = useSelector(selectConnected);
  const isConnectionError = useSelector(selectConnectionError);

  useEffect(() => {
    dispatch({ type: 'WS_CONNECT' });
  });

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
    <div>Mööp</div>
  ) : (
    <div>Connecting to game server</div>
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}
