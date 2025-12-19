import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';
import { Ship } from '../../store/slices/lobby.slice';

interface ShipCardProps {
  ship: Ship;
  isSelected: boolean;
  onSelect: (shipId: string) => void;
}

const Card = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected ? theme.colors.surfaceHover : theme.colors.background};
  border: 2px solid
    ${({ isSelected }) =>
      isSelected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  box-shadow: ${({ isSelected }) =>
    isSelected ? theme.shadows.glow : theme.shadows.sm};

  &:hover {
    background: ${theme.colors.surfaceHover};
    border-color: ${({ isSelected }) =>
      isSelected ? theme.colors.primary : theme.colors.textMuted};
    box-shadow: ${theme.shadows.md};
  }
`;

const ShipName = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const ShipInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};
`;

const CreatorName = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
`;

const PlayerCount = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StationList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
`;

const StationBadge = styled.span<{ isTaken: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
  border-radius: ${theme.borderRadius.sm};
  background: ${({ isTaken }) =>
    isTaken ? theme.colors.warning + '20' : theme.colors.success + '20'};
  color: ${({ isTaken }) =>
    isTaken ? theme.colors.warning : theme.colors.success};
  border: 1px solid
    ${({ isTaken }) => (isTaken ? theme.colors.warning : theme.colors.success)};
`;

export const ShipCard: React.FC<ShipCardProps> = ({
  ship,
  isSelected,
  onSelect,
}) => {
  const stations = ship.stations || {};
  const stationNames = ['helm', 'weapons', 'science', 'comm', 'engineering'];
  const takenStations = stationNames.filter((name) => stations[name] !== null);
  const playerCount = ship.players?.length || 0;

  return (
    <Card isSelected={isSelected} onClick={() => onSelect(ship.id)}>
      <ShipName>{ship.name}</ShipName>

      <CreatorName>Created by {ship.creator?.name || 'Unknown'}</CreatorName>

      <ShipInfo>
        <PlayerCount>
          {playerCount} {playerCount === 1 ? 'player' : 'players'}
        </PlayerCount>
        <span
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.fontSize.xs,
          }}
        >
          {takenStations.length}/{stationNames.length} stations
        </span>
      </ShipInfo>

      <StationList>
        {stationNames.map((stationName) => (
          <StationBadge
            key={stationName}
            isTaken={stations[stationName] !== null}
          >
            {stationName}
          </StationBadge>
        ))}
      </StationList>
    </Card>
  );
};
