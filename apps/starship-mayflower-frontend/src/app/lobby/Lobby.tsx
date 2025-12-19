import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectUsername,
  selectAuthenticated,
  logout,
} from '../store/auth.slice';
import {
  selectLobbyShips,
  selectCurrentShip,
  selectMyStations,
  selectIsReady,
  setCurrentShip,
  setShips,
  Ship,
} from '../store/slices/lobby.slice';
import { gameClient } from '../services/GameClient';
import { theme } from '../theme';
import { ShipList } from './components/ShipList';
import { ShipDetail } from './components/ShipDetail';

const LobbyContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${theme.colors.surface};
  border-bottom: 2px solid ${theme.colors.primary};
  box-shadow: ${theme.shadows.md};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  text-shadow: ${theme.shadows.glow};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const Username = styled.span`
  color: ${theme.colors.text};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const LogoutButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: transparent;
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.sm};

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.text};
    border-color: ${theme.colors.textMuted};
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: 40% 60%;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  overflow: auto;
  box-shadow: ${theme.shadows.md};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
    border-radius: ${theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.sm};

    &:hover {
      background: ${theme.colors.textMuted};
    }
  }
`;

const PanelHeader = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.border};
  padding-bottom: ${theme.spacing.md};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${theme.colors.textMuted};
  text-align: center;
  gap: ${theme.spacing.md};
`;

const LoadingState = styled(EmptyState)`
  color: ${theme.colors.primary};
`;

export const Lobby = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const username = useAppSelector(selectUsername);
  const isAuthenticated = useAppSelector(selectAuthenticated);
  const ships = useAppSelector(selectLobbyShips);
  const currentShip = useAppSelector(selectCurrentShip);
  const myStations = useAppSelector(selectMyStations);
  const isReady = useAppSelector(selectIsReady);

  const [isLoadingShips, setIsLoadingShips] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load ships if user is authenticated
    console.log('Lobby useEffect triggered:', { isAuthenticated, username });
    if (isAuthenticated && username) {
      console.log('Loading ships after authentication');
      loadShips();
    }
  }, [isAuthenticated, username]);

  const loadShips = async () => {
    setIsLoadingShips(true);
    setError(null);
    try {
      // Ensure connection is established
      if (!gameClient.isConnected()) {
        await gameClient.connect();
      }

      const response = await gameClient.listAvailableShips();
      if (response.status === 'ok') {
        // Update ships in Redux store
        if (response['ships']) {
          dispatch(setShips(response['ships'] as Ship[]));
        }
        console.log('Ships loaded successfully');
      } else {
        setError(response.error || 'Failed to load ships');
      }
    } catch (err) {
      console.error('Error loading ships:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoadingShips(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSelectShip = async (shipId: string) => {
    try {
      const response = await gameClient.joinShip(shipId);
      if (response.status === 'ok') {
        // Set current ship from response
        if (response['ship']) {
          dispatch(setCurrentShip(response['ship'] as Ship));
        }
        console.log('Joined ship successfully');
      } else {
        setError(response.error || 'Failed to join ship');
      }
    } catch (err) {
      console.error('Error joining ship:', err);
      setError('Failed to join ship');
    }
  };

  const handleCreateShip = async (shipName: string) => {
    try {
      const response = await gameClient.addNewShip(shipName);
      if (response.status === 'ok') {
        console.log('Ship created successfully');
        // Reload ships to show the newly created ship
        await loadShips();
      } else {
        setError(response.error || 'Failed to create ship');
      }
    } catch (err) {
      console.error('Error creating ship:', err);
      setError('Failed to create ship');
    }
  };

  const handleTakeStation = async (station: string) => {
    try {
      const response = await gameClient.takeStation(station);
      if (response.status === 'ok') {
        // Station will be updated via WebSocket event, but also track locally
        console.log('Station taken successfully');
      } else {
        setError(response.error || 'Failed to take station');
      }
    } catch (err) {
      console.error('Error taking station:', err);
      setError('Failed to take station');
    }
  };

  const handleReleaseStation = async (station: string) => {
    try {
      const response = await gameClient.releaseStation(station);
      if (response.status === 'ok') {
        // Station will be released via WebSocket event, but also track locally
        console.log('Station released successfully');
      } else {
        setError(response.error || 'Failed to release station');
      }
    } catch (err) {
      console.error('Error releasing station:', err);
      setError('Failed to release station');
    }
  };

  const handleToggleReady = async () => {
    try {
      const response = await gameClient.readyToPlay(!isReady);
      if (response.status === 'ok') {
        // Ready status should be tracked in Redux
        console.log('Ready status updated');
      } else {
        setError(response.error || 'Failed to update ready status');
      }
    } catch (err) {
      console.error('Error toggling ready:', err);
      setError('Failed to update ready status');
    }
  };

  return (
    <LobbyContainer>
      <Header>
        <Title>Starship Mayflower</Title>
        <UserInfo>
          <Username>{username}</Username>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        <Panel>
          <PanelHeader>Available Ships</PanelHeader>

          {isLoadingShips && (
            <LoadingState>
              <div>Loading ships...</div>
            </LoadingState>
          )}

          {error && (
            <EmptyState>
              <div style={{ color: theme.colors.danger }}>{error}</div>
            </EmptyState>
          )}

          {!isLoadingShips && !error && (
            <ShipList
              ships={ships}
              selectedShipId={currentShip?.id || null}
              onSelectShip={handleSelectShip}
              onCreateShip={handleCreateShip}
            />
          )}
        </Panel>

        <Panel>
          <PanelHeader>
            {currentShip ? currentShip.name : 'Ship Details'}
          </PanelHeader>

          {!currentShip && (
            <EmptyState>
              <div>No ship selected</div>
              <div style={{ fontSize: theme.typography.fontSize.sm }}>
                Select a ship from the list to view details
              </div>
            </EmptyState>
          )}

          {currentShip && username && (
            <ShipDetail
              ship={currentShip}
              myStations={myStations}
              username={username}
              isReady={isReady}
              onTakeStation={handleTakeStation}
              onReleaseStation={handleReleaseStation}
              onToggleReady={handleToggleReady}
            />
          )}
        </Panel>
      </MainContent>
    </LobbyContainer>
  );
};
