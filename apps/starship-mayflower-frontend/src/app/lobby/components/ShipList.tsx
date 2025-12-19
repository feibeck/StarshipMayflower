import React, { useState } from 'react';
import styled from '@emotion/styled';
import { ShipCard } from './ShipCard';
import { theme } from '../../theme';
import { Ship } from '../../store/slices/lobby.slice';

interface ShipListProps {
  ships: Ship[];
  selectedShipId: string | null;
  onSelectShip: (shipId: string) => void;
  onCreateShip: (shipName: string) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const CreateButton = styled.button`
  padding: ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: ${theme.colors.background};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: all ${theme.transitions.fast};
  box-shadow: ${theme.shadows.md};

  &:hover {
    background: ${theme.colors.primary}dd;
    box-shadow: ${theme.shadows.glow};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ShipGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  min-width: 400px;
  box-shadow: ${theme.shadows.lg};
`;

const ModalTitle = styled.h3`
  margin: 0 0 ${theme.spacing.lg} 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.fontSize.md};
  margin-bottom: ${theme.spacing.lg};
  transition: border-color ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${({ variant }) =>
    variant === 'primary' ? theme.colors.primary : 'transparent'};
  color: ${({ variant }) =>
    variant === 'primary' ? theme.colors.background : theme.colors.text};
  border: 1px solid
    ${({ variant }) => (variant === 'primary' ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${({ variant }) =>
      variant === 'primary' ? theme.colors.primary + 'dd' : theme.colors.surfaceHover};
    border-color: ${({ variant }) =>
      variant === 'primary' ? theme.colors.primary : theme.colors.textMuted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ShipList: React.FC<ShipListProps> = ({
  ships,
  selectedShipId,
  onSelectShip,
  onCreateShip,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShipName, setNewShipName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newShipName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateShip(newShipName.trim());
      setNewShipName('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create ship:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreate();
    }
  };

  return (
    <Container>
      <CreateButton onClick={() => setIsModalOpen(true)}>+ Create New Ship</CreateButton>

      <ShipGrid>
        {ships.map((ship) => (
          <ShipCard
            key={ship.id}
            ship={ship}
            isSelected={ship.id === selectedShipId}
            onSelect={onSelectShip}
          />
        ))}
      </ShipGrid>

      {isModalOpen && (
        <Modal onClick={() => !isCreating && setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create New Ship</ModalTitle>
            <Input
              type="text"
              placeholder="Enter ship name..."
              value={newShipName}
              onChange={(e) => setNewShipName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              disabled={isCreating}
            />
            <ModalButtons>
              <Button onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!newShipName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};
