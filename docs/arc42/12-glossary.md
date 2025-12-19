# Section 12: Glossary

This glossary defines domain and technical terms used throughout the StarshipMayflower documentation and codebase. Terms are organized alphabetically and include code evidence citations.

## Domain Terms

| Term | Definition |
|------|------------|
| **Action** | Command object queued for deferred execution over multiple game ticks, with lifecycle hooks (`update()`, `burnFuel()`) and singleton pattern support to prevent conflicting operations[^1] |
| **Accelerate** | Action command for gradual ship speed change that burns 3 energy/second; supports both impulse and warp modes; singleton action preventing multiple simultaneous speed changes[^2] |
| **Action Queue** | FIFO queue managing pending actions with 1000-command capacity limit; decouples command request from execution in the 10 Hz tick cycle[^3] |
| **AU (Astronomical Unit)** | Distance unit representing approximately 1.5 billion kilometers; used as scale factor for positioning celestial bodies like the Sun[^4] |
| **Channel** | Hierarchical broadcasting abstraction with scope-based message delivery (global, lobby, ship-specific); provides automatic subscription management[^5] |
| **Comm** | Communications bridge station responsible for inter-ship communication channels; one of five crew positions on a ship[^6] |
| **Connector Server** | Frontend server handling client WebSocket connections on port 3010; routes game commands to World Server via RPC on port 3150[^7] |
| **Creator** | Player who created and owns a ship; distinguished from crew players assigned to stations[^8] |
| **Energy** | Ship resource pool consumed by propulsion and weapons; default value 10,000; decremented by action burn rates (3 energy/second for acceleration)[^9] |
| **Engineering** | Engineering bridge station managing power distribution and systems integrity; one of five crew positions on a ship[^10] |
| **Entry Handler** | Connector handler authenticating players and binding sessions to unique player IDs; manages player login and disconnect RPC[^11] |
| **Game Handler** | World handler managing game lifecycle including start command (begins tick timer) and readyToPlay synchronization[^12] |
| **Global Channel** | Broadcast channel reaching all connected clients; used for world state updates visible to everyone (all ship positions as MapData)[^13] |
| **Handler** | Pinus request handler implementing game command processing; receives `msg`, `session`, `next` callback; maps to client RPC calls[^14] |
| **Heading** | 3D direction vector indicating ship's forward direction; calculated by applying orientation matrix to initial heading [0, 0, 1][^15] |
| **Helm** | Bridge station responsible for ship navigation and course control (steering, throttle, speed commands); one of five crew positions[^16] |
| **Impulse** | Standard sublight propulsion system operating at normal velocities with energy consumption; gradual acceleration over time via Accelerate action[^17] |
| **Isomorphic TypeScript** | Shared domain models defined once in `libs/util` and used identically in both frontend and backend via TypeScript path mappings (`@starship-mayflower/util`)[^18] |
| **Lobby Channel** | Broadcast channel for players not yet assigned to ships; shares ship list and player list during pre-game phase[^19] |
| **Lobby Handler** | World handler managing pre-game lobby operations: ship creation, player assignment to ships, station assignment[^20] |
| **MapData** | Lightweight serialization format for 3D map visualization containing only position, heading, and orientation (excludes ship-specific properties like energy, stations)[^21] |
| **Navigation Handler** | World handler processing ship movement commands including setImpulseSpeed, setWarp, setWarpLevel, turn[^22] |
| **ObjectInSpace** | Base class for all spatial entities (ships, stations, planets) with position, velocity, heading, orientation in 3D space; provides dual serialization (full vs MapData)[^23] |
| **Orientation** | 3D rotation matrix (Matrix.I(3)) defining ship's pitch, yaw, roll angles; requires periodic orthonormalization to maintain numerical stability[^24] |
| **Orthonormalization** | Matrix correction ensuring 3D rotation matrices remain orthonormal despite floating-point accumulation errors; critical for long-running simulations[^25] |
| **Physics Simulation** | Real-time movement calculation via velocity integration and rotation matrix application; runs every tick (100ms) in World Server[^26] |
| **Planet** | Celestial body (stars, planets) serving as map reference points; examples include "Sun" at AU coordinates; immobile world objects with large mass affecting visualization[^27] |
| **Player** | Server-side model wrapping session with ship assignment, station assignment, player ID, name, and ready status[^28] |
| **Position** | 3D coordinate vector in game world space where 1 unit ≈ 1 AU (astronomical unit); updated by physics simulation each tick[^29] |
| **Registry** | Centralized collection manager with O(1) hash-based lookup using `Record<string, T>` and lazy-loaded array iteration; uses dirty flag to optimize list rebuilding[^30] |
| **RPC (Remote Procedure Call)** | Transparent inter-server communication between Connector and World servers; looks like local function calls but executes remotely via Pinus framework[^31] |
| **Science** | Science bridge station managing sensor systems and scientific analysis; one of five crew positions; not yet implemented in MVP[^32] |
| **Serialize** | Full state conversion to JSON for network transmission; returns complete object state including all properties (contrast with MapData lightweight format)[^33] |
| **Ship** | Player-controlled vessel with 5 bridge stations, energy reserves, impulse/warp propulsion systems, position, velocity, and orientation in 3D space[^34] |
| **Ship Channel** | Ship-specific broadcast channel reaching only crew of that ship; used for private ship state updates, station assignments, navigation feedback[^35] |
| **ShipRegistry** | Specialized registry managing ships and player-to-ship assignments; coordinates with ObjectInSpaceRegistry and broadcasts changes via Channel[^36] |
| **Singleton Action** | Action type preventing duplicate execution by aborting previous action of same type before queuing new one; used by Accelerate to prevent conflicting speed changes[^37] |
| **Slow Impulse** | Reduced-velocity impulse mode for precise maneuvering; boolean flag enabling fine-grained control at lower speeds[^38] |
| **Space Station** | Stationary space facility serving as landmark or rendezvous point; inherits from ObjectInSpace; examples include "Space Station One", "Space Station Two"[^39] |
| **Station** | One of 5 crew positions on a ship requiring player assignment: Helm (navigation), Weapons (combat), Comm (communications), Science (sensors), Engineering (power)[^40] |
| **Tick** | Single 100ms game loop iteration running at 10 Hz frequency; executes action updates, physics simulation, and state broadcasts[^41] |
| **Turn** | Action command for ship rotation; modifies orientation matrix toward target heading over multiple ticks via rotation matrices[^42] |
| **Velocity** | Current speed of ship in units per second; scalar value directly translating to position change rate; modified by Accelerate action[^43] |
| **Warp** | Faster-than-light travel mode enabling speed multipliers (Warp 1-9+); consumes more energy than impulse; boolean flag with associated warp level (0-100)[^44] |
| **Warp Level** | Numeric scale (0-100) controlling FTL speed multiplier; affects energy consumption and maximum velocity; set via setWarpLevel handler[^45] |
| **Warp Speed** | Speed multiplier for FTL travel calculated as 1 + 3 × (warpLevel/100); expressed as multiple of light speed (C = 299,792.458 km/s)[^46] |
| **Weapons** | Bridge station responsible for ship combat systems and offensive capabilities; one of five crew positions; not yet implemented in MVP[^47] |
| **World Server** | Backend game logic server managing state, physics simulation, and action queue; handles RPC calls from Connector on port 3151[^48] |

## Technical Terms

| Term | Definition |
|------|------------|
| **ActionManager** | Orchestrates action lifecycle including queueing, singleton deduplication, execution, and completion tracking; maintains action map by type and ID[^49] |
| **Channel-Based Broadcasting** | Pattern for efficient multi-client message broadcasting using hierarchical channel abstraction (global, lobby, ship scopes); documented in Section 8.5[^50] |
| **Dirty Flag** | Optimization flag in Registry pattern indicating lazy-loaded list requires rebuilding from hash map; cleared after array reconstruction[^51] |
| **Fluent Builder Pattern** | Method chaining for object configuration where setters return `this` for chainable configuration (e.g., `setPosition().setVelocity().setOrientation()`)[^52] |
| **Frontend SPA** | Browser-based React Single Page Application for player UI; uses Redux state management and WebSocket client for game server communication[^53] |
| **Module Boundaries** | ESLint rules enforced at compile-time preventing unauthorized imports to maintain architectural discipline; apps can't import from apps, libs can't import from apps[^54] |
| **Nx Monorepo** | Workspace organization with module boundary enforcement and build caching; apps in `apps/`, libraries in `libs/`; ESLint enforces dependencies[^55] |
| **ObjectInSpaceRegistry** | Registry managing all spatial entities (ships, stations, planets) with ID assignment and spatial queries like `getSurroundings(radius)`[^56] |
| **Paper.js** | 2D canvas rendering library used by Compass component for pitch/yaw visualization; provides vector graphics API for 2D instrumentation[^57] |
| **Pinus** | Multiplayer game server framework (v1.4.14) providing distributed architecture, RPC, and binary protocol; successor to Pomelo framework[^58] |
| **Redux Middleware** | Custom middleware handling WebSocket connection lifecycle and translating async messages into Redux actions; provides request/response correlation via UUID[^59] |
| **Redux Store** | Centralized state management for frontend using Redux Toolkit; maintains auth and game state with DevTools enabled[^60] |
| **Three.js** | WebGL 3D rendering library (v0.135.0) used by Map component for star map visualization; manages scene, camera, renderer, and ship meshes[^61] |
| **TypeScript Path Mappings** | Clean import aliases (`@starship-mayflower/util`) mapped to physical directories in `tsconfig.base.json`; supports isomorphic development and refactoring safety[^62] |
| **WebSocket Middleware** | Redux middleware managing WebSocket lifecycle (WS_CONNECT/WS_DISCONNECT) and correlating async request/response pairs[^63] |

## Acronyms

| Term | Definition |
|------|------------|
| **AU** | Astronomical Unit - distance from Earth to Sun (~1.5 billion km); used as scale factor in game world coordinates[^64] |
| **FTL** | Faster Than Light - travel mode exceeding speed of light (C = 299,792.458 km/s); enabled via warp propulsion system[^65] |
| **Hz** | Hertz - frequency unit; game tick cycle runs at 10 Hz (10 iterations per second = 100ms per tick)[^66] |
| **MVP** | Minimum Viable Product - current prototype implementation; some features like Weapons and Science stations not yet implemented[^67] |
| **RPC** | Remote Procedure Call - inter-server communication pattern where remote calls appear as local function invocations[^68] |
| **SPA** | Single Page Application - browser-based app loading once and updating dynamically without full page reloads[^69] |
| **UUID** | Universally Unique Identifier - used for correlating WebSocket request/response pairs in Redux middleware[^70] |
| **WebSocket** | Bidirectional communication protocol over TCP; enables real-time client-server messaging on port 3010[^71] |

[^1]: Action pattern implemented in apps/game-server/src/app/src/action/action.ts lines 17-52; abstract base class with lifecycle hooks
[^2]: Accelerate action in apps/game-server/src/app/src/action/accelerate.ts; singleton=true, burn rate 3 energy/second
[^3]: ActionQueue in apps/game-server/src/app/src/action/ActionQueue.ts; capacity limit 1000 at line 11
[^4]: AU scale factor used in apps/game-server/src/app/src/world.ts for Sun positioning
[^5]: Channel pattern in apps/game-server/src/app/src/channel.ts lines 7-99; Pinus integration with automatic subscription management
[^6]: Station.Comm enum value in libs/util/src/lib/model/Ship.ts line 4; ship.comm property at line 93
[^7]: Connector server configuration in apps/game-server/src/config/servers.json; client port 3010, RPC port 3150
[^8]: Ship.creator property in libs/util/src/lib/model/Ship.ts line 37; set by setCreator() method at lines 99-109
[^9]: Ship.energy property in libs/util/src/lib/model/Ship.ts line 61; default value 10,000
[^10]: Station.Engineering enum value in libs/util/src/lib/model/Ship.ts line 4; ship.engineering property at line 91
[^11]: Entry handler in apps/game-server/src/app/servers/connector/handler/entry.ts; generates playerId and sets up session
[^12]: Game handler in apps/game-server/src/app/servers/world/handler/game.ts; start() and readyToPlay() methods
[^13]: Global channel usage in apps/game-server/src/app/src/channel.ts lines 96-98; pushToGlobal() broadcasts world state
[^14]: Handler pattern used throughout apps/game-server/src/app/servers/world/handler/ directory; Pinus request handlers
[^15]: Heading calculation in libs/util/src/lib/model/ObjectInSpace.ts lines 83-85; getHeading() returns orientation.multiply(INITIAL_HEADING)
[^16]: Station.Helm enum value in libs/util/src/lib/model/Ship.ts line 4; ship.helm property at line 89
[^17]: Impulse properties in libs/util/src/lib/model/Ship.ts lines 18-19, 56-62; targetImpulse, currentImpulse, slowImpulse
[^18]: Isomorphic models in libs/util/src/lib/model/ imported via @starship-mayflower/util path mapping; documented in Section 8.1
[^19]: Lobby channel in apps/game-server/src/app/src/channel.ts lines 89-90; pushToLobby() broadcasts to pre-game players
[^20]: Lobby handler in apps/game-server/src/app/servers/world/handler/lobby.ts; methods for ship/player management
[^21]: MapData serialization in libs/util/src/lib/model/ObjectInSpace.ts lines 6-27; serializeMapData() method at lines 120-128
[^22]: Navigation handler in apps/game-server/src/app/servers/world/handler/navigation.ts; movement command processing
[^23]: ObjectInSpace base class in libs/util/src/lib/model/ObjectInSpace.ts line 38; position, velocity, heading, orientation properties
[^24]: Orientation matrix in libs/util/src/lib/model/ObjectInSpace.ts line 42; Matrix.I(3) initialization at line 90-93
[^25]: Orthonormalization in apps/game-server/src/app/src/physics.ts; orthonormalizeMatrix() corrects floating-point drift
[^26]: Physics simulation in apps/game-server/src/app/src/physics.ts; moveShip() applies delta-time velocity integration
[^27]: Planet model in apps/game-server/src/app/src/models/Planet.ts; examples include Sun at AU scale
[^28]: Player model in apps/game-server/src/app/src/models/Player.ts lines 6-76; wraps session with ship/station assignment
[^29]: Position vector in libs/util/src/lib/model/ObjectInSpace.ts line 40; Sylvester Vector([x, y, z]) at lines 105-115
[^30]: Registry pattern in libs/util/src/lib/model/ObjectInSpaceRegistry.ts; Record<string, T> hash map with lazy list at lines 10-87
[^31]: Pinus RPC in apps/game-server/src/app/servers/connector/handler/entry.ts lines 21-25; app.rpc.world.player.playerLeave() example
[^32]: Station.Science enum value in libs/util/src/lib/model/Ship.ts line 4; ship.science property at line 92
[^33]: Ship.serialize() method in libs/util/src/lib/model/Ship.ts lines 269-325; returns SerializedShip with full state
[^34]: Ship domain model in libs/util/src/lib/model/Ship.ts line 35; extends ObjectInSpace with stations, energy, propulsion
[^35]: Ship channel in apps/game-server/src/app/src/channel.ts lines 80-83; pushToShip() sends private updates to crew
[^36]: ShipRegistry in apps/game-server/src/app/src/world/ShipRegistry.ts; manages ships and player-to-ship index
[^37]: Singleton action property in apps/game-server/src/app/src/action/action.ts line 23; prevents duplicate queuing
[^38]: Slow impulse mode in libs/util/src/lib/model/Ship.ts line 62; setSlowImpulse() at lines 159-169
[^39]: Station model in apps/game-server/src/app/src/models/Station.ts; inherits from ObjectInSpace with fixed position
[^40]: Station enum in libs/util/src/lib/model/Ship.ts line 4; defines Helm, Weapons, Engineering, Science, Comm
[^41]: Tick cycle in apps/game-server/src/app/src/timer.ts lines 11-14; 100ms interval via setInterval(), 10 Hz frequency
[^42]: Turn action in apps/game-server/src/app/src/action/turn.ts; modifies orientation matrix over multiple ticks
[^43]: Velocity property in libs/util/src/lib/model/ObjectInSpace.ts line 41; scalar value at lines 68-78
[^44]: Warp mode in libs/util/src/lib/model/Ship.ts lines 24-26; boolean flag with warpLevel and warpSpeed properties
[^45]: Warp level in libs/util/src/lib/model/Ship.ts line 24; setWarpLevel() at lines 121-124, range 0-100
[^46]: Warp speed calculation in libs/util/src/lib/model/Ship.ts line 25; setWarpSpeed() at lines 129-139, formula: 1 + 3*(warpLevel/100)
[^47]: Station.Weapons enum value in libs/util/src/lib/model/Ship.ts line 4; ship.weapons property at line 90
[^48]: World server configuration in apps/game-server/src/config/servers.json; RPC port 3151, manages game state and physics
[^49]: ActionManager in apps/game-server/src/app/src/action/actionManager.ts; coordinates action lifecycle and singleton pattern
[^50]: Channel-Based Broadcasting pattern documented in Section 8.5; implemented in apps/game-server/src/app/src/channel.ts
[^51]: Dirty flag in libs/util/src/lib/model/ObjectInSpaceRegistry.ts lines 11, 20, 76-82; optimizes lazy list rebuilding
[^52]: Fluent builder pattern in libs/util/src/lib/model/ObjectInSpace.ts lines 70-73; setters return this for chaining
[^53]: Frontend SPA in apps/starship-mayflower-frontend/; React + Redux + WebSocket client architecture
[^54]: Module boundaries enforced by eslint.config.mjs @nrwl/nx/enforce-module-boundaries rule; prevents circular dependencies
[^55]: Nx monorepo structure defined in nx.json and workspace.json; apps/ and libs/ directories with enforced boundaries
[^56]: ObjectInSpaceRegistry in libs/util/src/lib/model/ObjectInSpaceRegistry.ts; getSurroundings() method for spatial queries
[^57]: Paper.js integration in libs/compass/src/lib/Compass.ts; 2D canvas rendering for compass visualization
[^58]: Pinus framework v1.4.14 imported in apps/game-server/src/main.ts line 1; version specified in package.json line 32; distributed game server architecture
[^59]: Redux middleware in apps/starship-mayflower-frontend/src/app/store/websocketMiddleware.ts; WebSocket lifecycle management
[^60]: Redux store in apps/starship-mayflower-frontend/src/app/store/store.ts; Redux Toolkit configuration with DevTools
[^61]: Three.js v0.135.0 in package.json; 3D rendering in libs/map/src/lib/StarMap.ts for star map visualization
[^62]: TypeScript path mappings in tsconfig.base.json lines 17-24; @starship-mayflower/* aliases to libs/*
[^63]: WebSocket middleware in apps/starship-mayflower-frontend/src/app/store/websocketMiddleware.ts; WS_CONNECT/WS_DISCONNECT actions
[^64]: AU (Astronomical Unit) used as scale in apps/game-server/src/app/src/world.ts; ~1.5 billion km Earth-Sun distance
[^65]: FTL (Faster Than Light) travel via warp system in libs/util/src/lib/model/Ship.ts; exceeds C = 299,792.458 km/s
[^66]: Hz (Hertz) frequency in apps/game-server/src/app/src/timer.ts; 10 Hz = 100ms tick interval for game loop
[^67]: MVP (Minimum Viable Product) status documented in Section 11 technical debt; Weapons and Science stations not implemented
[^68]: RPC (Remote Procedure Call) pattern documented in Section 8.6; Pinus framework transparent inter-server communication
[^69]: SPA (Single Page Application) architecture in apps/starship-mayflower-frontend/; React-based browser application
[^70]: UUID (Universally Unique Identifier) for request/response correlation in apps/starship-mayflower-frontend/src/app/store/websocketMiddleware.ts
[^71]: WebSocket protocol on port 3010 in apps/game-server/src/config/servers.json; bidirectional real-time communication
