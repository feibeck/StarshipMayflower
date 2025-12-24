# Lobby System Documentation

## Overview

The Lobby System is the pre-game staging area where players create or join ships, select stations (roles), and coordinate game start.

## Core Concepts

### Game Instance

- There is **ONE global game** that includes all ships and players
- When the game starts, ALL ships enter the game world together
- Ships can interact with each other in the shared game world
- The game starts when ALL players across ALL ships are ready

### Ships

- **Ships** are the primary game entities that players join
- Each ship has a unique ID and name
- Ships can have 1-N players
- Ships have 5 available stations
- Any player can create ships - ownership is not tracked or relevant
- Ships persist indefinitely and cannot be deleted
- Ships without crew (no players) will NOT spawn in the game world
- Multiple ships exist in the same game world and can interact

### Stations

Players can take one or more of the following stations:

- **helm** - Navigation and piloting
- **weapons** - Combat systems control
- **science** - Sensors and analysis
- **comm** - Communications management
- **engineering** - Power distribution and repairs

### Players

- Players have unique IDs and names
- Players are only considered "on a ship" when they have taken at least one station
- Each player can only be on ONE ship at a time (can only have stations on one ship)
- Players can hold multiple stations on their ship
- Players must have at least one station to mark themselves ready

### Ready Status

- Players signal readiness to start the game
- Ready status persists until manually changed
- Game starts when ALL players (across all ships) are ready (after countdown)

### Late Joining

- Players can join the game AFTER it has started
- Late-joining players access the lobby normally
- They can join existing ships or create new ships
- Once they select a station and mark ready, they immediately join the running game
- Their ship spawns in the game world (if it has crew)
- No countdown needed for late joins

## Business Rules

### Rule 1: One Ship Per Player

**Players can only have stations on one ship at a time**

- A player is only considered "on a ship" when they have taken at least one station
- A player may select a different ship if they have NO stations
- Before switching ships, players must release all stations
- Attempting to take a station on a different ship while holding stations returns an error
- **Error message:** "Please release all stations before switching ships"

**Rationale:** Ensures proper team coordination within each ship

---

### Rule 2: Station Requirements

**Players must have at least one station to ready up**

- The "Ready to Play" button is disabled until the player takes a station
- Players can hold multiple stations simultaneously
- Stations cannot be shared - one player per station
- Players can release stations at any time (unreadies them if they have no stations left)

**Rationale:** Ensures every player has a role before game starts

---

### Rule 3: 15-Second Countdown

**Game start is delayed by 15 seconds after all players ready**

When the LAST player (across ALL ships) marks themselves ready:

1. Server starts a 15-second countdown
2. Countdown broadcasts to ALL players in the lobby every second (15, 14, 13... 1, 0)
3. At 0, the global game starts with all ships
4. All ships and players enter the shared game world together

**Rationale:** Gives all players time to prepare and ensures synchronized game start

---

### Rule 4: Countdown Interruption

**New players or unready players cancel the countdown**

The countdown is cancelled if:

- A new player joins ANY ship
- Any player (on any ship) toggles their ready status to false
- Any player creates a new ship
- Any player leaves their ship (optional - see edge cases)

After cancellation:

- Ready players REMAIN ready (ready status persists)
- Countdown only restarts when ALL players (across all ships) are ready again

**Rationale:** Ensures all players across all ships are actually ready before the global game starts

---

### Rule 5: Game Start Transition

**When countdown completes, all players navigate to their station views**

After the 15-second countdown reaches 0:

1. Server starts the global game loop
2. Server broadcasts game start event to ALL players in the lobby
3. ALL ships are added to the game world
4. Each player's client navigates to their station interface
5. If player has multiple stations, they navigate to their first station alphabetically
6. Ships can now see and interact with each other

**Rationale:** Seamless synchronized transition from lobby to active multiplayer gameplay

---

### Rule 6: Late Joining

**Players can join the game after it has started**

When a player joins after the game is running:

1. Player accesses the lobby normally
2. Player can see all ships (in-game and lobby)
3. Player joins a ship and selects station(s)
4. Player marks themselves ready
5. Player immediately joins the running game (no countdown)
6. If ship has crew, it spawns in the game world
7. Player navigates to their station view

**Ship spawning:**

- Only ships WITH players spawn in the game world
- Empty ships remain in lobby but don't spawn
- When first player joins an empty ship and readies, ship spawns

**Rationale:** Allows flexible multiplayer sessions where players can join mid-game without disrupting ongoing gameplay

---

## User Flows

### Flow 1: Multi-Ship Game Start

1. Player "Alice" creates ship "USS Enterprise"
2. Player "Bob" creates ship "Voyager"
3. Alice joins USS Enterprise and takes helm station
4. Alice marks ready
5. Bob joins Voyager and takes weapons station
6. Bob marks ready
7. ALL players are now ready → countdown starts (15 seconds)
8. Countdown broadcasts to all players in lobby
9. At countdown 0 → global game starts
10. Both ships appear in the game world together
11. Alice navigates to helm view, Bob to weapons view
12. Ships can now see and interact with each other

### Flow 2: Join Existing Ship

1. Player enters lobby
2. Player sees list of available ships
3. Player clicks on a ship to join
4. Ship details are displayed
5. Player selects available station(s)
6. Player clicks "Ready to Play"
7. When ALL players (on all ships) are ready, countdown begins
8. Countdown completes → global game starts with all ships
9. Player navigates to station interface

### Flow 3: Switch Ships Before Game Start

1. Player is on Ship A with stations taken
2. Player releases all stations (helm, weapons, etc.)
3. Player clicks on Ship B to join
4. Player is removed from Ship A
5. Player joins Ship B
6. Player selects stations on Ship B
7. Player marks ready (if all other players ready, countdown starts)

### Flow 4: Countdown Interruption Across Ships

1. USS Enterprise has 2 players, both ready
2. Voyager has 2 players, both ready
3. ALL players ready → countdown starts (15 seconds)
4. At 7 seconds remaining, new player "Charlie" joins lobby
5. Charlie creates a new ship "Defiant"
6. Countdown is CANCELLED (broadcast to all players)
7. All 4 original players REMAIN ready
8. Charlie takes a station and marks ready
9. When Charlie ready, countdown starts again (15 seconds)
10. Countdown completes → global game starts with all 3 ships

---

## Edge Cases

### 1. Player Disconnects During Countdown

**Decision:** Countdown continues

- Assume player will reconnect
- If game starts before reconnection, player misses game start

### 2. Player with Multiple Stations

**Decision:** Navigate to first station alphabetically

- Order: comm → engineering → helm → science → weapons

### 3. Single Player or Single Ship Game

**Decision:** Allow game start with any number of ready players

- Useful for testing
- Single player on one ship can start the game
- Multiple ships with one player each can start the game
- Countdown still applies (15 seconds) regardless of player count

### 4. Countdown Reaches 0 but Game Already Running

**Decision:** Don't start duplicate game

- Validate game is not already running before starting

### 5. Player Releases Last Station During Countdown

**Decision:** Cancel countdown and set player to not ready

- Player with no stations cannot be ready
- Global countdown cancels automatically
- ALL other players remain ready
- Countdown restarts when all players ready again

### 6. Empty Ship Handling

**Decision:** Empty ships persist but don't spawn in game

- Ships without players remain in the lobby
- Ships are never deleted
- Empty ships don't spawn in the game world
- When a player joins and readies, ship spawns (if game is running)
- When all players leave a ship during game, ship despawns but remains in lobby

---

## Testing

See [features/lobby.feature](features/lobby.feature) for comprehensive BDD test scenarios (~90 scenarios).

---

**Document Version:** 1.0
**Last Updated:** 2024-12-22
**Maintained By:** Development Team
