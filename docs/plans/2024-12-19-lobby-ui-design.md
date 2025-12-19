# Lobby UI Design

**Date:** 2024-12-19
**Feature:** Modern Lobby UI with Ship Management and Station Selection

## Overview

Single-page lobby interface with side-by-side layout for ship browsing and station management. Card-based modern UI with realtime multiplayer updates via WebSocket.

## User Flow

**Layout: Option B - Single Page with Side-Panel**
- Left Panel (40%): Ship List
- Right Panel (60%): Ship Detail with Station Selection
- All on one page, no routing

## Component Architecture

```
Lobby (Container)
├── LobbyHeader
│   └── Username display + Logout button
├── ShipList (Left Panel, 40%)
│   ├── ShipListHeader
│   │   └── "New Ship" Button
│   └── ShipCard[] (List)
│       ├── Ship Name
│       ├── Creator Name
│       ├── Player Count Badge
│       └── "Select" Button
└── ShipDetail (Right Panel, 60%)
    ├── ShipInfo
    │   ├── Ship Name
    │   └── Creator Name
    ├── StationGrid (Card-based)
    │   └── StationCard[] (Helm, Weapons, Science, Engineering, Comm)
    │       ├── Station Icon
    │       ├── Station Name
    │       ├── Player Name (if occupied)
    │       ├── Status Indicator
    │       └── Action Button (Take/Release)
    └── ReadyButton (When stations selected)
```

**Additional Components:**
- `CreateShipModal` - Dialog for creating new ship (name input)
- `LoadingSpinner` - During server requests

## Data Flow

### Initial Load
1. Component mounts → `useEffect` calls `gameClient.listAvailableShips()`
2. Response → `dispatch(setShips(ships))`
3. Ships rendered in ShipList

### Create Ship
1. User clicks "New Ship" → Modal opens
2. User enters name → `gameClient.addNewShip(name)`
3. Server broadcasts `ShipAdded` event to ALL clients
4. Middleware receives → `dispatch(shipAdded(ship))`
5. New ship appears for all players automatically

### Select Ship
1. User clicks ship in list → `dispatch(setCurrentShip(ship))`
2. ShipDetail renders with ship data
3. `gameClient.joinShip(shipId)` called
4. Server confirms join

### Take/Release Station
1. User clicks Station Card → Set local loading state
2. Call `gameClient.takeStation(position)` OR `gameClient.releaseStation(position)`
3. Server broadcasts `StationTaken`/`StationReleased` event to all players on ship
4. Middleware → `dispatch(stationTaken/Released)` → `updateCurrentShip`
5. All players see update simultaneously, loading state clears

### Ready to Play
1. User clicks "Ready" → `gameClient.readyToPlay(true)`
2. Server checks: All ready? → Broadcasts `GameStarted` event
3. Middleware receives → Navigate to game

## State Management

**Redux (Lobby Slice):**
- `ships`: Array of all available ships
- `currentShip`: Selected ship details
- `currentShipId`: ID of selected ship
- `myStations`: Array of stations taken by current player
- `isReady`: Ready-to-play state

**Local Component State:**
- Loading states per station (Map<stationId, boolean>)
- Modal open/close state
- Form inputs

**WebSocket Events:**
- `ShipAdded` → Auto-updates ship list
- `StationTaken` → Updates ship stations for all players
- `StationReleased` → Updates ship stations
- `GameStarted` → Triggers navigation

## Update Strategy: Hybrid (Option C)

**Approach:**
- User clicks → Immediate UI feedback (button disabled + loading)
- Send WebSocket request
- Wait for `StationTaken`/`StationReleased` event
- Middleware updates Redux → UI updates for all players
- No optimistic updates, no rollbacks needed
- Perfect for multiplayer: All clients see same state

## Styling (Emotion)

### Theme - Sci-Fi Gaming Look

```typescript
const theme = {
  colors: {
    background: '#0a0e1a',      // Dark space
    surface: '#1a1f2e',         // Cards/panels
    surfaceHover: '#242936',    // Hover state
    primary: '#00d9ff',         // Cyan (buttons, highlights)
    secondary: '#7b2cbf',       // Purple (accents)
    success: '#00ff88',         // Green (available)
    warning: '#ffaa00',         // Orange (taken by you)
    danger: '#ff3366',          // Red (errors)
    text: '#e0e6ed',           // Main text
    textMuted: '#8891a0',      // Secondary text
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
}
```

### StationCard Visual States

**Available (free):**
- Green border
- White icon
- "Take Station" button

**Taken by You:**
- Orange border
- Orange icon
- Your name displayed
- "Release" button

**Taken by Other:**
- Gray border
- Disabled appearance
- Other player's name
- No button

**Loading:**
- Spinner overlay
- Button disabled
- Semi-transparent

### Animations

- Ship Card hover: Lift effect + shadow
- Station Card click: Ripple effect
- Loading states: Spinner animation
- Ship added: Fade-in animation
- Smooth transitions (200ms ease)

### Responsive Layout

**Desktop (>1024px):**
- Side-by-side 40% / 60%

**Tablet (768px - 1024px):**
- Stacked layout
- ShipList above ShipDetail

**Mobile (<768px):**
- Tab interface
- Switch between "Ships" and "Detail" tabs

## Stations

**Available Stations:**
1. Helm - Navigation
2. Weapons - Tactical
3. Science - Sensors & Analysis
4. Engineering - Power & Repair
5. Comm - Communications

## Error Handling

- Ship creation fails → Show error in modal
- Station take fails → Clear loading, show error toast
- Connection lost → Show reconnecting indicator
- Timeout on requests (30s) → Show error, allow retry

## Testing Considerations

- Multiple players joining same ship
- Simultaneous station selection
- Network latency scenarios
- Ship list updates during browsing
- Modal interactions
- Keyboard navigation
- Screen reader support

## Implementation Notes

- Use `@emotion/react` for styling
- All components should be presentational where possible
- Container components handle Redux/WebSocket logic
- Station cards should be reusable components
- Icons: Use simple SVG or unicode symbols initially
- TypeScript strict mode

## Future Enhancements (Not in MVP)

- Ship deletion
- Kick players from ship
- Private/password-protected ships
- Ship templates/presets
- Player avatars
- Chat in lobby
- Sound effects
