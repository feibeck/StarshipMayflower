import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const WORLD_FEATURE_KEY = 'world';

/**
 * World State
 * Manages all space objects in the game world
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  w: number;
  x: number;
  y: number;
  z: number;
}

export interface SpaceObjectData {
  id: string;
  type: 'ship' | 'planet' | 'star' | 'station' | 'asteroid';
  name?: string;
  position: [number, number, number];
  orientation?: number[][];
  radius?: number;
  mass?: number;
}

export interface ShipData extends SpaceObjectData {
  type: 'ship';
  name: string;
  energy: number;
  currentImpulse: number;
  targetImpulse: number;
  warpLevel: number;
  warp: boolean;
  slowImpulse: boolean;
  azimuth: number;
  polar: number;
  velocity?: [number, number, number];
  shields?: number;
  hull?: number;
}

export interface WorldState {
  ships: Record<string, ShipData>;
  objects: SpaceObjectData[];
  lastUpdate: number;
  targetId: string | null;
}

export const initialWorldState: WorldState = {
  ships: {},
  objects: [],
  lastUpdate: 0,
  targetId: null,
};

export const worldSlice = createSlice({
  name: WORLD_FEATURE_KEY,
  initialState: initialWorldState,
  reducers: {
    // Global update from server (all ships)
    globalUpdate: (state, action: PayloadAction<{ ships: ShipData[] }>) => {
      const newShips: Record<string, ShipData> = {};
      action.payload.ships.forEach((ship) => {
        newShips[ship.id] = ship;
      });
      state.ships = newShips;
      state.lastUpdate = Date.now();
    },

    // Single ship update
    shipUpdate: (state, action: PayloadAction<ShipData>) => {
      state.ships[action.payload.id] = action.payload;
      state.lastUpdate = Date.now();
    },

    // Remove ship
    removeShip: (state, action: PayloadAction<string>) => {
      delete state.ships[action.payload];
    },

    // World update (planets, stars, stations)
    worldUpdate: (
      state,
      action: PayloadAction<{ objects: SpaceObjectData[] }>,
    ) => {
      state.objects = action.payload.objects;
      state.lastUpdate = Date.now();
    },

    // Add single object
    addObject: (state, action: PayloadAction<SpaceObjectData>) => {
      const exists = state.objects.find((obj) => obj.id === action.payload.id);
      if (!exists) {
        state.objects.push(action.payload);
      }
    },

    // Remove object
    removeObject: (state, action: PayloadAction<string>) => {
      state.objects = state.objects.filter((obj) => obj.id !== action.payload);
    },

    // Target selection
    setTarget: (state, action: PayloadAction<string | null>) => {
      state.targetId = action.payload;
    },

    // Reset
    resetWorld: () => initialWorldState,
  },
});

export const worldReducer = worldSlice.reducer;

export const {
  globalUpdate,
  shipUpdate,
  removeShip,
  worldUpdate,
  addObject,
  removeObject,
  setTarget,
  resetWorld,
} = worldSlice.actions;

// Selectors
export const getWorldState = (rootState: RootState): WorldState =>
  rootState[WORLD_FEATURE_KEY];

export const selectWorldShips = createSelector(getWorldState, (state) =>
  Object.values(state.ships),
);

export const selectShipById = (shipId: string) =>
  createSelector(getWorldState, (state) => state.ships[shipId]);

export const selectObjects = createSelector(
  getWorldState,
  (state) => state.objects,
);

export const selectObjectById = (objectId: string) =>
  createSelector(getWorldState, (state) =>
    state.objects.find((obj) => obj.id === objectId),
  );

export const selectAllSpaceObjects = createSelector(
  [selectWorldShips, selectObjects],
  (ships, objects) => [...ships, ...objects],
);

export const selectTarget = createSelector(getWorldState, (state) => {
  if (!state.targetId) return null;

  // Check ships first
  const ship = state.ships[state.targetId];
  if (ship) return ship;

  // Check objects
  return state.objects.find((obj) => obj.id === state.targetId) || null;
});

export const selectTargetId = createSelector(
  getWorldState,
  (state) => state.targetId,
);

export const selectWorldLastUpdate = createSelector(
  getWorldState,
  (state) => state.lastUpdate,
);

// Helper selectors for specific object types
export const selectPlanets = createSelector(selectObjects, (objects) =>
  objects.filter((obj) => obj.type === 'planet'),
);

export const selectStars = createSelector(selectObjects, (objects) =>
  objects.filter((obj) => obj.type === 'star'),
);

export const selectStations = createSelector(selectObjects, (objects) =>
  objects.filter((obj) => obj.type === 'station'),
);

export const selectAsteroids = createSelector(selectObjects, (objects) =>
  objects.filter((obj) => obj.type === 'asteroid'),
);

// Distance calculations
export function calculateDistance(
  pos1: [number, number, number],
  pos2: [number, number, number],
): number {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Selector for nearest objects to a position
export const selectNearestObjects = (
  position: [number, number, number],
  limit = 10,
) =>
  createSelector(selectAllSpaceObjects, (objects) => {
    return objects
      .map((obj) => ({
        ...obj,
        distance: calculateDistance(position, obj.position),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  });
