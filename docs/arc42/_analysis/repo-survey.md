# Repository Survey: StarshipMayflower

**Date:** 2025-12-19
**Repository:** https://github.com/feibeck/StarshipMayflower.git
**Version:** 0.0.1

---

## Overview

**Starship Mayflower** is a **browser-based starship bridge simulator** that allows multiple users to collaboratively operate a virtual spacecraft. Players can take on different bridge roles (navigation, helm, etc.) and work together in real-time to explore space, interact with space stations, and manage ship systems.

The application consists of:

- A **real-time multiplayer game server** managing game state and physics
- A **React-based web frontend** providing the user interface
- **Reusable component libraries** for UI elements (compass, map, utilities)

### Target Users

- Game enthusiasts interested in cooperative multiplayer experiences
- Fans of spaceship bridge simulators (similar to "Artemis Spaceship Bridge Simulator")
- Groups looking for collaborative gaming experiences

---

## Tech Stack

### Primary Languages & Frameworks

| Technology     | Version | Purpose                                     |
| -------------- | ------- | ------------------------------------------- |
| **TypeScript** | ~4.4.3  | Primary language for all components         |
| **React**      | 17.0.2  | Frontend UI framework                       |
| **Pinus**      | 1.4.14  | Game server framework (successor to Pomelo) |
| **Node.js**    | N/A     | Runtime environment                         |
| **Nx**         | 13.2.3  | Monorepo management and build system        |

### Key Dependencies

**Frontend:**

- React Router DOM 6.1.1 (routing)
- Redux Toolkit 1.6.2 (state management)
- Emotion (styling)
- Three.js 0.135.0 (3D rendering)
- Paper.js 0.12.15 (2D canvas graphics)
- WebSockets (ws 8.3.0, isomorphic-ws 4.0.1)

**Backend:**

- Pinus 1.4.14 (real-time game server framework)
- Sylvester-ES6 (vector math for physics)
- Express (legacy web server)

**Development:**

- Jest 27.2.3 (testing)
- Cypress 8.3.0 (E2E testing)
- Storybook 6.4.5 (component development)
- ESLint, Prettier (code quality)

### Build System

- **Nx Workspace** (monorepo orchestration)
- **Webpack 5** (bundling)
- **TypeScript compiler** (transpilation)
- Legacy: Grunt (older build system, still present in web-server/)

---

## Architecture

### Monorepo Structure

The project uses **Nx monorepo** with the following organization:

```
StarshipMayflower/
├── apps/                           # Executable applications
│   ├── game-server/                # Pinus-based game server (active)
│   ├── game-server-next/           # Next-gen game server (in development)
│   ├── starship-mayflower-frontend/ # React SPA frontend
│   ├── compass-e2e/                # E2E tests for compass component
│   ├── map-e2e/                    # E2E tests for map component
│   └── starship-mayflower-frontend-e2e/ # E2E tests for frontend
├── libs/                           # Shared libraries
│   ├── compass/                    # Compass React component
│   ├── map/                        # Star map React component
│   ├── game-server-lib/            # Game server abstraction library
│   └── util/                       # Shared utilities and models
├── web-server/                     # Legacy Express web server (deprecated)
├── docs/                           # Documentation
│   └── arc42/                      # Architecture documentation
├── scripts/                        # Build and utility scripts
└── tools/                          # Custom Nx generators
```

---

## Main Entrypoints

### 1. Game Server (`apps/game-server`)

- **Type:** Real-time multiplayer game server
- **Framework:** Pinus (Node.js game server framework)
- **Entrypoint:** `apps/game-server/src/main.ts`
- **Ports:**
  - 3010 (client WebSocket connections)
  - 3150 (internal connector server)
  - 3151 (world server)
- **Architecture:** Distributed server architecture with:
  - **Connector server**: Handles client connections, authentication
  - **World server**: Manages game state, physics, player actions

**Key responsibilities:**

- Real-time physics simulation (ship movement, acceleration, rotation)
- Game state management (ships, players, space objects)
- WebSocket communication with clients
- Action queue processing (navigation commands, game events)
- World updates broadcast to clients

**Configuration:** `apps/game-server/src/config/`

- `servers.json` - Server topology
- `clientProtos.json` / `serverProtos.json` - Protocol definitions
- `dictionary.json` - Message compression dictionary

### 2. Frontend Application (`apps/starship-mayflower-frontend`)

- **Type:** Single-Page Application (SPA)
- **Framework:** React 17 + Redux Toolkit
- **Entrypoint:** `apps/starship-mayflower-frontend/src/main.tsx`
- **Build target:** Static files served to browsers
- **Dev server:** Port 4200 (default Nx dev server)

**Key features:**

- WebSocket connection to game server
- Redux state management with WebSocket middleware
- Authentication flow
- Lobby system for game/ship selection
- Bridge station interfaces (via reusable component libs)

**Main routes:**

- `/login` - Authentication
- `/lobby` - Ship selection and game lobby

### 3. Legacy Web Server (`web-server/`)

- **Type:** Express.js static file server
- **Status:** DEPRECATED (superseded by Nx dev server)
- **Framework:** Express, Bower, Grunt
- **Note:** Contains old AngularJS code, being migrated to React

---

## Top-Level Modules & Responsibilities

### Applications

#### `apps/game-server` (Primary Game Server)

Core game logic and real-time server using Pinus framework.

**Key modules:**

- `app/servers/connector/` - Client connection handling
  - `handler/entry.ts` - Authentication and connection
- `app/servers/world/` - Game world management
  - `handler/lobby.ts` - Ship creation and joining
  - `handler/navigation.ts` - Ship movement commands
  - `handler/game.ts` - Game state queries
  - `remote/player.ts` - Remote player procedures
- `app/src/` - Core game logic
  - `game.ts` - Main game loop and state
  - `world.ts` - World constants and utilities
  - `physics.ts` - Physics simulation
  - `models/` - Game entities (Ship, Player, Planet, Station)
  - `action/` - Action queue system (turn, accelerate)
  - `world/ShipRegistry.ts` - Ship management

#### `apps/game-server-next`

Next-generation game server (under development). Minimal implementation currently.

#### `apps/starship-mayflower-frontend` (React Frontend)

Main user interface application.

**Key modules:**

- `app/App.tsx` - Main app with routing
- `app/Login.tsx` - Authentication UI
- `app/lobby/Lobby.tsx` - Lobby interface
- `app/auth/` - Authentication logic
- `app/store/` - Redux store setup
  - `store.ts` - Redux store configuration
  - `game.slice.ts` - Game state slice
  - `auth.slice.ts` - Auth state slice
  - `websocketMiddleware.ts` - WS communication middleware
  - `client.ts` - Game server client

### Shared Libraries

#### `libs/compass`

React component for displaying ship orientation (pitch/yaw).

**Type:** UI Component Library
**Tech:** React, Paper.js (canvas rendering)
**Export:** `<Compass />` component
**Storybook:** Yes

#### `libs/map`

React component for displaying tactical star map with ships and space objects.

**Type:** UI Component Library
**Tech:** React, Three.js (3D rendering)
**Key classes:**

- `StarMap.ts` - Main 3D map renderer
- `MapObjectActor.ts` - Interactive map objects
- `Grid.ts` - Map grid rendering
  **Export:** `<Map />` component
  **Storybook:** Yes

#### `libs/game-server-lib`

Abstraction layer for building game servers with common patterns.

**Type:** Backend Library
**Key exports:**

- `Router` - Request routing
- `SocketHandler` - WebSocket handling
- `Session` - Session management
- `Channel` - Pub/sub channels
- `Message` - Message handling
- Handler utilities (auth, route handling)

**Note:** Appears to be a custom framework layer, possibly to abstract Pinus or support migration.

#### `libs/util`

Shared domain models and utilities used by both frontend and backend.

**Type:** Shared Library (Isomorphic)
**Key exports:**

- `Ship` - Ship model with physics properties
- `ObjectInSpaceRegistry` - Registry for space objects
- Volume primitives (Sphere, Box, Point, Volume)

**Critical:** This library enables code sharing between client and server for consistent game logic.

---

## External Systems & Services

### Direct Dependencies

| System      | Type    | Purpose            | Connection            |
| ----------- | ------- | ------------------ | --------------------- |
| **Browser** | Runtime | Frontend execution | HTTP/HTTPS, WebSocket |
| **Node.js** | Runtime | Backend execution  | N/A                   |

### Communication Protocols

- **WebSocket (Binary Protocol)**: Client ↔ Game Server
  - Uses Pinus binary protocol with protobuf
  - Dictionary-based message compression
  - Heartbeat: 3 seconds
- **HTTP/HTTPS**: Static asset serving (dev)

### Notable Absences (Assumptions)

The following are **NOT** currently used:

- ❌ No external databases (state is in-memory only)
- ❌ No message brokers (Redis, RabbitMQ, etc.)
- ❌ No external APIs
- ❌ No cloud services (AWS, Azure, GCP)
- ❌ No authentication providers (OAuth, LDAP)
- ❌ No persistent storage (no PostgreSQL, MongoDB, etc.)

**Implication:** All game state is ephemeral and resets when server restarts. Auth is likely in-memory session-based.

---

## Important Files & Directories

### Configuration Files

| Path                 | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `package.json`       | Root npm dependencies and scripts              |
| `nx.json`            | Nx workspace configuration                     |
| `workspace.json`     | Project definitions (legacy, being phased out) |
| `tsconfig.base.json` | TypeScript path mappings for monorepo          |
| `.eslintrc.json`     | Linting rules                                  |
| `babel.config.json`  | Babel transpilation config                     |
| `jest.config.js`     | Jest test runner config                        |

### Build & Scripts

| Path                      | Purpose                             |
| ------------------------- | ----------------------------------- |
| `npm-install.sh` / `.bat` | Dependency installation scripts     |
| `scripts/`                | Additional build and setup scripts  |
| `Gruntfile.js`            | Legacy Grunt build (for web-server) |

### Documentation

| Path               | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `README.md`        | Project overview and getting started        |
| `docs/arc42/`      | Architecture documentation (arc42 template) |
| `libs/*/README.md` | Library-specific docs (minimal)             |

### Source Code

| Path                                               | Purpose                  |
| -------------------------------------------------- | ------------------------ |
| `apps/game-server/src/main.ts`                     | Game server entrypoint   |
| `apps/game-server/src/app/src/game.ts`             | Core game loop and state |
| `apps/starship-mayflower-frontend/src/main.tsx`    | Frontend entrypoint      |
| `apps/starship-mayflower-frontend/src/app/App.tsx` | Main React app component |
| `libs/util/src/lib/model/Ship.ts`                  | Shared ship model        |

---

## Major Functional Areas

### 1. Authentication & Lobby

- **Location:** `apps/starship-mayflower-frontend/src/app/auth/`, `apps/game-server/.../connector/handler/entry.ts`
- **Functionality:** User login, session management, ship selection/creation

### 2. Real-Time Physics Simulation

- **Location:** `apps/game-server/src/app/src/physics.ts`, `game.ts`, `action/`
- **Functionality:**
  - Ship movement (impulse engines at 0.25c)
  - Rotation (yaw, pitch, roll)
  - Acceleration and deceleration
  - Position tracking in 3D space (AU scale)

### 3. World State Management

- **Location:** `apps/game-server/src/app/src/world.ts`, `game.ts`, `models/`
- **Functionality:**
  - Ship registry (all active ships)
  - Space objects (stations, planets, sun)
  - World updates broadcast to clients
  - Astronomical unit (AU) based coordinate system

### 4. Action Queue System

- **Location:** `apps/game-server/src/app/src/action/`
- **Functionality:**
  - Queued command execution (turn, accelerate)
  - Time-based action resolution
  - Action manager coordinating multiple actions

### 5. Client-Server Communication

- **Location:**
  - Frontend: `apps/starship-mayflower-frontend/src/app/store/websocketMiddleware.ts`
  - Backend: `apps/game-server/.../servers/`, `libs/game-server-lib/`
- **Functionality:**
  - Binary WebSocket protocol (Pinus)
  - Redux middleware for WS actions
  - Channel-based pub/sub
  - Real-time state synchronization

### 6. UI Components (Bridge Stations)

- **Location:** `libs/compass/`, `libs/map/`
- **Functionality:**
  - Compass: Ship orientation display (pitch/yaw)
  - Map: Tactical star map (3D visualization)
  - Extensible for additional stations (weapons, engineering, comms)

---

## Technology Evolution

### Migration Path (Observed)

1. **Original Stack** (Legacy):
   - AngularJS frontend
   - Pomelo game server
   - Grunt build system
   - Express static server

2. **Current Stack** (Active):
   - React frontend
   - Pinus game server (Pomelo successor)
   - Nx monorepo
   - TypeScript throughout

3. **Future Direction** (In Progress):
   - `game-server-next` app suggests server rewrite
   - `game-server-lib` abstracts framework (enables swapping Pinus?)
   - Storybook for component-driven development

### Evidence of Modernization

- Nx monorepo structure (added in 2021+)
- TypeScript adoption across all code
- Modern React (hooks, functional components)
- Redux Toolkit (modern Redux patterns)
- Storybook integration for UI development
- E2E testing with Cypress

---

## Unknowns & Assumptions

### Unknowns

1. **Persistence Strategy**:
   - No database found. Is all state ephemeral?
   - How are users/accounts managed long-term?
   - Are there plans for persistence?

2. **Deployment Model**:
   - No Docker, Kubernetes, or cloud configs found
   - How is this deployed in production?
   - Single server or distributed?

3. **Authentication Mechanism**:
   - Basic auth or session-based?
   - No OAuth/JWT integration visible
   - In-memory session store?

4. **Game Content**:
   - How is game content (missions, scenarios) defined?
   - Are there configuration files for world setup?
   - Procedural generation or static content?

5. **Scalability**:
   - How many concurrent players/ships supported?
   - Can world servers be scaled horizontally?
   - What are the performance limits?

6. **Legacy Web Server Status**:
   - Is `web-server/` still used or fully deprecated?
   - Should it be removed?

### Assumptions Made

1. **Target Environment**: Development/local hosting (not production-ready based on missing ops tooling)

2. **Player Count**: Small groups (< 10 players per ship, < 5 ships per server)

3. **Game State**: Ephemeral, in-memory only (no persistence layer found)

4. **Authentication**: Simple, in-memory session management (no external auth)

5. **Deployment**: Manual deployment (no CI/CD, containers, or IaC found)

6. **Network Topology**: Single game server (no load balancing or clustering)

---

## Development Workflow

### Getting Started

```bash
# Install dependencies
./npm-install.sh

# Start game server
nx serve game-server

# Start frontend (separate terminal)
nx serve starship-mayflower-frontend

# Access application
# Frontend: http://localhost:4200
# Game Server: ws://localhost:3010
```

### Testing

```bash
# Unit tests
nx test <project-name>

# E2E tests
nx e2e starship-mayflower-frontend-e2e

# All tests
nx affected:test
```

### Component Development

```bash
# Launch Storybook for compass
nx storybook compass

# Launch Storybook for map
nx storybook map
```

---

## Next Steps for Analysis

### Recommended Follow-Up Investigations

1. **Review `game-server-next`**: Understand new architecture direction
2. **Examine action queue details**: Understand command processing pipeline
3. **Map client-server protocol**: Document message types and flows
4. **Identify missing bridge stations**: What UI components are planned?
5. **Review test coverage**: Assess current testing maturity
6. **Evaluate persistence options**: If needed, what's the migration path?
7. **Security audit**: Authentication, authorization, input validation
8. **Performance profiling**: Physics simulation bottlenecks
9. **Deployment planning**: Containerization, CI/CD, monitoring

---

## Summary

**Starship Mayflower** is a moderately complex, browser-based multiplayer space simulator built with modern TypeScript/React on the frontend and a real-time Pinus game server on the backend. The project is organized as an Nx monorepo with clear separation between apps and reusable libraries. The codebase shows evidence of active modernization from legacy AngularJS/Grunt to React/Nx.

**Strengths:**

- Clean monorepo architecture
- Type-safe codebase (TypeScript)
- Reusable UI component libraries
- Real-time multiplayer foundation (Pinus)
- Active development (migration in progress)

**Gaps:**

- No persistence layer (ephemeral state)
- Limited deployment tooling
- Authentication appears basic
- Documentation sparse (libraries have boilerplate READMEs)
- Legacy web-server code not yet removed

**Primary Use Case:** Cooperative multiplayer bridge simulation for small groups in local/development environments.
