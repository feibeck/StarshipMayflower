import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';

export type StationStatus = 'available' | 'taken-by-me' | 'taken-by-other';

interface StationCardProps {
  name: string;
  displayName: string;
  status: StationStatus;
  playerName?: string;
  isLoading?: boolean;
  onTake: () => void;
  onRelease: () => void;
}

const Card = styled.div<{ status: StationStatus; isLoading: boolean }>`
  background: ${({ status, isLoading }) => {
    if (isLoading) return theme.colors.background;
    if (status === 'available') return theme.colors.success + '10';
    if (status === 'taken-by-me') return theme.colors.warning + '15';
    return theme.colors.danger + '10';
  }};
  border: 2px solid
    ${({ status, isLoading }) => {
      if (isLoading) return theme.colors.textMuted;
      if (status === 'available') return theme.colors.success;
      if (status === 'taken-by-me') return theme.colors.warning;
      return theme.colors.danger;
    }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  cursor: ${({ status, isLoading }) =>
    isLoading || status === 'taken-by-other' ? 'not-allowed' : 'pointer'};
  transition: all ${theme.transitions.normal};
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  position: relative;
  overflow: hidden;

  &:hover {
    ${({ status, isLoading }) =>
      !isLoading &&
      status !== 'taken-by-other' &&
      `
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
      border-color: ${
        status === 'available'
          ? theme.colors.success
          : status === 'taken-by-me'
            ? theme.colors.warning
            : theme.colors.danger
      }dd;
    `}
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ status, isLoading }) => {
      if (isLoading) return theme.colors.textMuted;
      if (status === 'available') return theme.colors.success;
      if (status === 'taken-by-me') return theme.colors.warning;
      return theme.colors.danger;
    }};
  }
`;

const StationName = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  text-transform: capitalize;
`;

const StatusBadge = styled.div<{ status: StationStatus }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${({ status }) => {
    if (status === 'available') return theme.colors.success + '20';
    if (status === 'taken-by-me') return theme.colors.warning + '20';
    return theme.colors.danger + '20';
  }};
  color: ${({ status }) => {
    if (status === 'available') return theme.colors.success;
    if (status === 'taken-by-me') return theme.colors.warning;
    return theme.colors.danger;
  }};
`;

const StatusIndicator = styled.div<{ status: StationStatus }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ status }) => {
    if (status === 'available') return theme.colors.success;
    if (status === 'taken-by-me') return theme.colors.warning;
    return theme.colors.danger;
  }};
`;

const PlayerName = styled.div`
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textMuted};
`;

const ActionText = styled.div`
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
`;

const LoadingText = styled(ActionText)`
  color: ${theme.colors.textMuted};
`;

export const StationCard: React.FC<StationCardProps> = ({
  name,
  displayName,
  status,
  playerName,
  isLoading = false,
  onTake,
  onRelease,
}) => {
  const getStatusText = () => {
    if (status === 'available') return 'Available';
    if (status === 'taken-by-me') return 'Assigned to You';
    return 'Taken';
  };

  const getActionText = () => {
    if (status === 'available') return 'Click to take this station';
    if (status === 'taken-by-me') return 'Click to release this station';
    return '';
  };

  const handleClick = () => {
    if (isLoading || status === 'taken-by-other') return;
    if (status === 'available') {
      onTake();
    } else if (status === 'taken-by-me') {
      onRelease();
    }
  };

  return (
    <Card status={status} isLoading={isLoading} onClick={handleClick}>
      <StationName>{displayName}</StationName>

      <StatusBadge status={status}>
        <StatusIndicator status={status} />
        {getStatusText()}
      </StatusBadge>

      {playerName && status !== 'available' && <PlayerName>{playerName}</PlayerName>}

      {isLoading ? (
        <LoadingText>Processing...</LoadingText>
      ) : (
        status !== 'taken-by-other' && <ActionText>{getActionText()}</ActionText>
      )}
    </Card>
  );
};
