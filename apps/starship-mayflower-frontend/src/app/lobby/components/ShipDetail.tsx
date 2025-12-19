import React, { useState } from 'react';
import styled from '@emotion/styled';
import { StationCard, StationStatus } from './StationCard';
import { theme } from '../../theme';
import { Ship } from '../../store/slices/lobby.slice';

interface ShipDetailProps {
  ship: Ship;
  myStations: string[];
  username: string;
  isReady: boolean;
  onTakeStation: (station: string) => Promise<void>;
  onReleaseStation: (station: string) => Promise<void>;
  onToggleReady: () => Promise<void>;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const ShipInfo = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${theme.colors.primary};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
`;

const InfoValue = styled.span`
  color: ${theme.colors.text};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const StationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${theme.spacing.md};
`;

const ReadySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const ReadyButton = styled.button<{ isReady: boolean; isDisabled: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${({ isReady, isDisabled }) => {
    if (isDisabled) return theme.colors.textMuted;
    return isReady ? theme.colors.danger : theme.colors.success;
  }};
  color: ${theme.colors.background};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  transition: all ${theme.transitions.fast};
  box-shadow: ${theme.shadows.md};
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ReadyInfo = styled.div`
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.fontSize.sm};
`;

const STATIONS = [
  { name: 'helm', displayName: 'Helm' },
  { name: 'weapons', displayName: 'Weapons' },
  { name: 'science', displayName: 'Science' },
  { name: 'comm', displayName: 'Communications' },
  { name: 'engineering', displayName: 'Engineering' },
];

export const ShipDetail: React.FC<ShipDetailProps> = ({
  ship,
  myStations,
  username,
  isReady,
  onTakeStation,
  onReleaseStation,
  onToggleReady,
}) => {
  const [loadingStations, setLoadingStations] = useState<Set<string>>(new Set());
  const [isTogglingReady, setIsTogglingReady] = useState(false);

  const getStationStatus = (stationName: string): StationStatus => {
    const assignedPlayer = ship.stations?.[stationName];
    if (!assignedPlayer) return 'available';
    if (assignedPlayer.name === username) return 'taken-by-me';
    return 'taken-by-other';
  };

  const getStationPlayerName = (stationName: string): string | undefined => {
    const assignedPlayer = ship.stations?.[stationName];
    return assignedPlayer?.name || undefined;
  };

  const handleTakeStation = async (stationName: string) => {
    setLoadingStations((prev) => new Set(prev).add(stationName));
    try {
      await onTakeStation(stationName);
    } finally {
      setLoadingStations((prev) => {
        const next = new Set(prev);
        next.delete(stationName);
        return next;
      });
    }
  };

  const handleReleaseStation = async (stationName: string) => {
    setLoadingStations((prev) => new Set(prev).add(stationName));
    try {
      await onReleaseStation(stationName);
    } finally {
      setLoadingStations((prev) => {
        const next = new Set(prev);
        next.delete(stationName);
        return next;
      });
    }
  };

  const handleToggleReady = async () => {
    setIsTogglingReady(true);
    try {
      await onToggleReady();
    } finally {
      setIsTogglingReady(false);
    }
  };

  const playerCount = ship.players?.length || 0;
  const takenStationsCount = STATIONS.filter(
    (s) => ship.stations?.[s.name] !== null
  ).length;
  const canBeReady = myStations.length > 0;

  return (
    <Container>
      <ShipInfo>
        <InfoRow>
          <InfoLabel>Created by</InfoLabel>
          <InfoValue>{ship.creator?.name || 'Unknown'}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Players</InfoLabel>
          <InfoValue>{playerCount}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Stations</InfoLabel>
          <InfoValue>
            {takenStationsCount}/{STATIONS.length} assigned
          </InfoValue>
        </InfoRow>
      </ShipInfo>

      <div>
        <SectionTitle>Select Your Station</SectionTitle>
        <StationGrid>
          {STATIONS.map((station) => (
            <StationCard
              key={station.name}
              name={station.name}
              displayName={station.displayName}
              status={getStationStatus(station.name)}
              playerName={getStationPlayerName(station.name)}
              isLoading={loadingStations.has(station.name)}
              onTake={() => handleTakeStation(station.name)}
              onRelease={() => handleReleaseStation(station.name)}
            />
          ))}
        </StationGrid>
      </div>

      <ReadySection>
        <ReadyButton
          isReady={isReady}
          isDisabled={!canBeReady || isTogglingReady}
          onClick={handleToggleReady}
          disabled={!canBeReady || isTogglingReady}
        >
          {isTogglingReady
            ? 'Processing...'
            : isReady
              ? 'Not Ready'
              : 'Ready to Play'}
        </ReadyButton>
        {!canBeReady && (
          <ReadyInfo>You must select at least one station to be ready</ReadyInfo>
        )}
        {canBeReady && !isReady && (
          <ReadyInfo>Click when you're ready to start the game</ReadyInfo>
        )}
        {isReady && (
          <ReadyInfo style={{ color: theme.colors.success }}>
            Waiting for other players...
          </ReadyInfo>
        )}
      </ReadySection>
    </Container>
  );
};
