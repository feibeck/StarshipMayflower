import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const SHIP_FEATURE_KEY = 'ship';

/**
 * Ship State
 * Manages the player's current ship state (own ship)
 */

export interface ShipState {
  id: string | null;
  name: string | null;

  // Position & Orientation
  position: [number, number, number];
  orientation: number[][];
  velocity: [number, number, number];

  // Navigation
  azimuth: number;
  polar: number;
  currentImpulse: number;
  targetImpulse: number;
  warpLevel: number;
  warp: boolean;
  slowImpulse: boolean;

  // Energy & Systems
  energy: number;
  maxEnergy: number;
  shields: number;
  maxShields: number;
  hull: number;
  maxHull: number;

  // Systems Power Distribution
  systemsPower: {
    shields: number;
    weapons: number;
    engines: number;
    lifeSupport: number;
    sensors: number;
  };

  // System Health
  systemsHealth: {
    shields: number;
    weapons: number;
    engines: number;
    lifeSupport: number;
    sensors: number;
  };

  // Stations
  stations: Record<string, unknown>;

  // Update tracking
  lastUpdate: number;
}

export const initialShipState: ShipState = {
  id: null,
  name: null,

  position: [0, 0, 0],
  orientation: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  velocity: [0, 0, 0],

  azimuth: 0,
  polar: 0,
  currentImpulse: 0,
  targetImpulse: 0,
  warpLevel: 0,
  warp: false,
  slowImpulse: false,

  energy: 1000,
  maxEnergy: 1000,
  shields: 100,
  maxShields: 100,
  hull: 100,
  maxHull: 100,

  systemsPower: {
    shields: 100,
    weapons: 100,
    engines: 100,
    lifeSupport: 100,
    sensors: 100,
  },

  systemsHealth: {
    shields: 100,
    weapons: 100,
    engines: 100,
    lifeSupport: 100,
    sensors: 100,
  },

  stations: {},

  lastUpdate: 0,
};

export const shipSlice = createSlice({
  name: SHIP_FEATURE_KEY,
  initialState: initialShipState,
  reducers: {
    // Full ship state update
    setShip: (state, action: PayloadAction<Partial<ShipState>>) => {
      Object.assign(state, action.payload);
      state.lastUpdate = Date.now();
    },

    // Position & Movement
    updatePosition: (
      state,
      action: PayloadAction<{
        position: [number, number, number];
        orientation: number[][];
        velocity?: [number, number, number];
      }>
    ) => {
      state.position = action.payload.position;
      state.orientation = action.payload.orientation;
      if (action.payload.velocity) {
        state.velocity = action.payload.velocity;
      }
      state.lastUpdate = Date.now();
    },

    // Navigation
    updateNavigation: (
      state,
      action: PayloadAction<{
        azimuth?: number;
        polar?: number;
        currentImpulse?: number;
        targetImpulse?: number;
        warpLevel?: number;
        warp?: boolean;
        slowImpulse?: boolean;
      }>
    ) => {
      Object.assign(state, action.payload);
      state.lastUpdate = Date.now();
    },

    setImpulse: (state, action: PayloadAction<number>) => {
      state.targetImpulse = action.payload;
    },

    setWarp: (state, action: PayloadAction<boolean>) => {
      state.warp = action.payload;
    },

    setWarpLevel: (state, action: PayloadAction<number>) => {
      state.warpLevel = action.payload;
    },

    setSlowImpulse: (state, action: PayloadAction<boolean>) => {
      state.slowImpulse = action.payload;
    },

    // Rotation (for optimistic updates)
    rotate: (
      state,
      action: PayloadAction<{ axis: 'yaw' | 'pitch' | 'roll'; arc: number }>
    ) => {
      // This is for optimistic UI updates
      // Actual rotation is calculated by server
      state.lastUpdate = Date.now();
    },

    // Energy
    updateEnergy: (state, action: PayloadAction<number>) => {
      state.energy = Math.max(0, Math.min(action.payload, state.maxEnergy));
      state.lastUpdate = Date.now();
    },

    // Damage
    takeDamage: (
      state,
      action: PayloadAction<{ shields?: number; hull?: number }>
    ) => {
      if (action.payload.shields !== undefined) {
        state.shields = Math.max(0, state.shields - action.payload.shields);
      }
      if (action.payload.hull !== undefined) {
        state.hull = Math.max(0, state.hull - action.payload.hull);
      }
      state.lastUpdate = Date.now();
    },

    // Systems
    updateSystemPower: (
      state,
      action: PayloadAction<{ system: keyof ShipState['systemsPower']; power: number }>
    ) => {
      state.systemsPower[action.payload.system] = Math.max(
        0,
        Math.min(100, action.payload.power)
      );
      state.lastUpdate = Date.now();
    },

    updateSystemHealth: (
      state,
      action: PayloadAction<{ system: keyof ShipState['systemsHealth']; health: number }>
    ) => {
      state.systemsHealth[action.payload.system] = Math.max(
        0,
        Math.min(100, action.payload.health)
      );
      state.lastUpdate = Date.now();
    },

    // Repair
    repairSystem: (
      state,
      action: PayloadAction<{ system: keyof ShipState['systemsHealth']; amount: number }>
    ) => {
      const current = state.systemsHealth[action.payload.system];
      state.systemsHealth[action.payload.system] = Math.min(
        100,
        current + action.payload.amount
      );
      state.lastUpdate = Date.now();
    },

    // Reset
    resetShip: () => initialShipState,
  },
});

export const shipReducer = shipSlice.reducer;

export const {
  setShip,
  updatePosition,
  updateNavigation,
  setImpulse,
  setWarp,
  setWarpLevel,
  setSlowImpulse,
  rotate,
  updateEnergy,
  takeDamage,
  updateSystemPower,
  updateSystemHealth,
  repairSystem,
  resetShip,
} = shipSlice.actions;

// Selectors
export const getShipState = (rootState: RootState): ShipState =>
  rootState[SHIP_FEATURE_KEY];

export const selectShipId = createSelector(
  getShipState,
  (state) => state.id
);

export const selectShipName = createSelector(
  getShipState,
  (state) => state.name
);

export const selectPosition = createSelector(
  getShipState,
  (state) => state.position
);

export const selectOrientation = createSelector(
  getShipState,
  (state) => state.orientation
);

export const selectVelocity = createSelector(
  getShipState,
  (state) => state.velocity
);

export const selectNavigationState = createSelector(getShipState, (state) => ({
  azimuth: state.azimuth,
  polar: state.polar,
  currentImpulse: state.currentImpulse,
  targetImpulse: state.targetImpulse,
  warpLevel: state.warpLevel,
  warp: state.warp,
  slowImpulse: state.slowImpulse,
}));

export const selectEnergy = createSelector(
  getShipState,
  (state) => state.energy
);

export const selectEnergyPercent = createSelector(
  getShipState,
  (state) => (state.energy / state.maxEnergy) * 100
);

export const selectShields = createSelector(
  getShipState,
  (state) => state.shields
);

export const selectShieldsPercent = createSelector(
  getShipState,
  (state) => (state.shields / state.maxShields) * 100
);

export const selectHull = createSelector(
  getShipState,
  (state) => state.hull
);

export const selectHullPercent = createSelector(
  getShipState,
  (state) => (state.hull / state.maxHull) * 100
);

export const selectSystemsPower = createSelector(
  getShipState,
  (state) => state.systemsPower
);

export const selectSystemsHealth = createSelector(
  getShipState,
  (state) => state.systemsHealth
);

export const selectSystemPower = (system: keyof ShipState['systemsPower']) =>
  createSelector(getShipState, (state) => state.systemsPower[system]);

export const selectSystemHealth = (system: keyof ShipState['systemsHealth']) =>
  createSelector(getShipState, (state) => state.systemsHealth[system]);

export const selectIsDestroyed = createSelector(
  getShipState,
  (state) => state.hull <= 0
);

export const selectIsCritical = createSelector(
  getShipState,
  (state) => state.hull < 20 || state.energy < 100
);

export const selectSpeed = createSelector(getShipState, (state) => {
  if (state.warp) {
    return state.warpLevel;
  }
  return state.currentImpulse;
});

export const selectShipLastUpdate = createSelector(
  getShipState,
  (state) => state.lastUpdate
);
