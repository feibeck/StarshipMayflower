# 4. Solution Strategy

This section summarizes the key architectural decisions and solution approaches that shape the Starship Mayflower system. These decisions form the cornerstones of the architecture and provide the foundation for detailed implementation choices documented in later sections.

The technology stack and architectural patterns were selected to achieve the five quality goals from section 1.2 while respecting the constraints documented in section 2. The strategy prioritizes real-time responsiveness, maintainability through modularity, and rapid prototyping over production-hardened deployment infrastructure.

## 4.1 Technology Decisions

The following technology decisions establish the technical foundation for the system, addressing specific quality goals and constraints from sections 1.2 and 2.

**Nx Monorepo with TypeScript**

The system uses Nx workspace v13.2.3 to organize code as a monorepo containing multiple applications (frontend, game servers) and shared libraries (compass, map, utility models). TypeScript 4.4.3 serves as the primary programming language across the entire codebase, enabling type-safe code sharing between client and server. This decision directly addresses the **maintainability quality goal (priority 2 in section 1.2)** by enforcing consistent types across 80+ source files and catching integration errors at compile time rather than runtime. The monorepo structure with enforced module boundaries (via ESLint rules) prevents unintended dependencies and maintains architectural discipline through tooling. This choice satisfies the TypeScript and Nx monorepo constraints documented in section 2[^1].

**React 17 Single-Page Application**

The frontend is built as a React 17.0.2 single-page application (SPA) using functional components with hooks, React Router for navigation, and Redux Toolkit for state management. This technology stack provides a mature ecosystem for building interactive user interfaces while enabling real-time updates through Redux middleware that integrates with the WebSocket connection. The SPA architecture means the entire application loads once and updates dynamically, avoiding page reloads that would disrupt the continuous real-time gameplay experience required by the **real-time responsiveness quality goal (priority 1 in section 1.2)**. This decision satisfies the browser-based deployment constraint from section 2[^2].

**Pinus Multiplayer Game Server Framework**

The backend uses Pinus v1.4.14 (successor to Pomelo) as the game server framework, which provides distributed server architecture (connector servers for client connections, world servers for game logic), binary WebSocket protocol with protobuf encoding and dictionary compression, and built-in RPC for inter-server communication. This framework choice directly addresses the **real-time responsiveness (priority 1)** and **network efficiency (priority 4)** quality goals from section 1.2 by providing optimized protocols (~1KB per world update vs ~5KB with plain JSON) and enabling horizontal scaling of connection capacity independently from game logic processing. The WebSocket protocol and distributed architecture satisfy the Pinus framework and WebSocket protocol constraints from section 2[^3].

**In-Memory State Architecture**

The system maintains all game state (ship registry, player sessions, world objects) in memory using JavaScript data structures (objects, Maps, arrays) without any external database. This architectural decision eliminates database infrastructure complexity (no connection pooling, schema migrations, query optimization, backup/recovery) and enables rapid prototyping with simpler deployment. The trade-off is ephemeral state—all game data is lost on server restart. This decision is documented as a constraint in section 2, but evidence suggests it reflects an **architectural choice prioritizing simplicity and development velocity over persistence**. The in-memory approach supports the **maintainability quality goal** by removing database configuration complexity, though it limits production scalability[^4].

**Three.js and Paper.js for Graphics**

3D visualization uses Three.js v0.135.0 for WebGL-based star map rendering, while 2D navigation displays use Paper.js v0.12.15 for canvas-based compass rendering. Three.js provides GPU-accelerated 3D graphics essential for rendering space objects at astronomical scale, while Paper.js offers a simpler API for 2D geometric drawing of ship orientation indicators. Both libraries are encapsulated in separate Nx workspace libraries (@starship-mayflower/map and @starship-mayflower/compass) enabling independent development and reuse. This encapsulation supports the **maintainability quality goal** by isolating graphics concerns from game logic. The browser-based WebGL requirement satisfies the browser deployment constraint from section 2[^5].

**Isomorphic TypeScript Models**

Domain models (Ship, ObjectInSpace, Station types) are defined once in the @starship-mayflower/util library and shared between frontend and backend. This isomorphic approach ensures consistency—when the server serializes ship state and the client deserializes it, both use identical type definitions. Changes to domain models are automatically checked by the TypeScript compiler across all dependent applications, preventing runtime deserialization errors. This decision directly supports the **developer experience quality goal (priority 5 in section 1.2)** by catching type mismatches at compile time and enabling confident refactoring of shared models[^6].

## 4.2 Architectural Patterns and Design Decisions

The system employs proven architectural patterns to achieve separation of concerns, testability, and the quality goals defined in section 1.2.

| Pattern/Decision                 | Application                                                                                                                      | Rationale                                                                                                                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Component-Based Architecture** | React components organized as apps and libs in Nx workspace                                                                      | Enables reusable UI components (Compass, Map) packaged as standalone libraries with Storybook documentation. Supports independent development and testing. **Supports maintainability quality goal** by enabling isolated component evolution[^7]                        |
| **Layered Architecture**         | Separation: Presentation (React SPA) → Communication (WebSocket) → Business Logic (Pinus handlers) → Domain Models (shared libs) | Clear separation of concerns with defined boundaries. Frontend knows nothing of server internals; shared libraries contain only domain logic. **Inferred rationale:** Layering enables independent testing and evolution of each concern, supporting maintainability[^8] |
| **Registry Pattern**             | ShipRegistry and ObjectInSpaceRegistry manage collections                                                                        | Centralized lookup and lifecycle management for ships and space objects. Provides single source of truth for entity existence and relationships. **Inferred rationale:** Simplifies state management in absence of database[^9]                                          |
| **Action Queue Pattern**         | ActionManager with ActionQueue for time-based command execution                                                                  | Player commands (turn, accelerate) queued and resolved over time simulating realistic ship operations. Prevents instant maneuvers and adds gameplay depth. **Inferred rationale:** Provides game design flexibility while ensuring ordered execution[^10]                |
| **Distributed Server Pattern**   | Pinus connector servers (client connections) + world servers (game logic)                                                        | Scales I/O-bound connection handling independently from CPU-bound physics simulation. RPC layer enables transparent inter-server communication. **Supports real-time responsiveness quality goal** by separating concerns[^11]                                           |
| **Middleware Pattern**           | Redux middleware for WebSocket integration                                                                                       | Decouples Redux actions from WebSocket communication. GameMiddleware intercepts specific action types (WS_CONNECT, NEW_MESSAGE) and manages connection lifecycle. **Inferred rationale:** Separates communication concerns from UI state management[^12]                 |
| **Tick-Based Simulation**        | 10 Hz game loop (100ms intervals)                                                                                                | Fixed-rate physics simulation ensures consistent game state progression. Each tick updates actions, moves ships, and broadcasts state to all clients. **Directly addresses real-time responsiveness quality goal** with deterministic 100ms update cycle[^13]            |
| **Push-Based Updates**           | Server pushes state changes to clients via WebSocket                                                                             | Eliminates polling overhead. Clients receive updates only when state changes, reducing unnecessary network traffic. **Supports network efficiency quality goal** by minimizing bandwidth usage[^14]                                                                      |

> **Note:** Patterns work together synergistically—layered architecture enables Registry and Action Queue patterns; Distributed Server pattern enables horizontal scaling; Tick-Based Simulation drives Push-Based Updates. See section 5 for building block details and section 8 for implementation patterns.

## 4.3 Quality Goal Achievement

This table shows how architectural decisions and patterns address the top five quality goals from section 1.2, providing explicit traceability from goals to solutions.

| Quality Goal                                        | Scenario                                                                                                     | Solution Approach                                                                                                                                                                                                                                                                                                                                                                                                    | Link to Details                                                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real-time responsiveness (Priority 1)**           | Ship orientation updates broadcast to all clients within 100ms (one tick cycle)                              | • **10 Hz tick rate** (100ms intervals) ensures deterministic update cycles<br>• **WebSocket push notifications** eliminate polling latency<br>• **Binary protocol with protobuf** reduces serialization overhead (~1KB vs ~5KB JSON)<br>• **Direct broadcast via Channel.pushToShip()** minimizes forwarding delays                                                                                                 | Section 6 (Runtime View) for complete message flow<br>Section 8 (Concepts) for tick cycle and broadcasting details[^15]                                       |
| **Maintainability through modularity (Priority 2)** | New bridge station can be added as standalone library without modifying core game logic                      | • **Nx enforced module boundaries** prevent unauthorized imports via ESLint rules<br>• **Station UI components packaged as standalone libraries** (@starship-mayflower/compass, @starship-mayflower/map)<br>• **Storybook enables isolated development** and visual testing without game server<br>• **TypeScript path mappings** enable clean imports across modules                                                | Section 5 (Building Blocks) for complete module structure and dependencies<br>Section 8 (Concepts) for development workflow[^16]                              |
| **Physics accuracy (Priority 3)**                   | Position calculations maintain accuracy within 0.1% over extended gameplay despite floating-point operations | • **Sylvester library** provides robust vector math (Vector, Matrix types)<br>• **Orthonormalization function** corrects accumulated rounding errors in rotation matrices using Gram-Schmidt process<br>• **clipPosition() boundary function** constrains ships to valid playing field coordinates<br>• **Velocity integration over time delta** (seconds since last move) ensures frame-rate independent physics    | Section 8 (Concepts) for complete physics algorithms and accuracy analysis<br>apps/game-server/src/app/src/physics.ts for implementation[^17]                 |
| **Network efficiency (Priority 4)**                 | Message size remains under 1KB per world update even with 40 concurrent players                              | • **Pinus binary protocol with protobuf encoding** provides compact serialization<br>• **Dictionary compression** maps common field names ("shipPosition", "orientation") to small integers (config/dictionary.json)<br>• **Selective state broadcasting** sends only changed entities, not full world state<br>• **3-second heartbeat interval** reduces keep-alive overhead while detecting disconnections quickly | Section 3.2 (Technical Context) for protocol details and port configuration<br>Section 8 (Concepts) for serialization strategy and compression rationale[^18] |
| **Developer experience (Priority 5)**               | TypeScript compiler catches type inconsistencies across frontend and backend before runtime                  | • **Shared @starship-mayflower/util library** provides single source of truth for domain models<br>• **TypeScript strict mode** enabled (tsconfig.base.json) catches common errors<br>• **Nx build orchestration** (nx affected:build) runs incremental compilation only on changed modules<br>• **ESLint with Nx plugin** catches common errors and enforces module boundary rules                                  | Section 5 (Building Blocks) for library dependencies and import graph<br>Section 8 (Concepts) for build process and type checking workflow[^19]               |

**Evidence for solution approaches:**

- Real-time: timer.ts implements 10 Hz tick[^15]; channel.ts implements broadcasting[^15]; main.ts configures binary protocol[^15]
- Maintainability: .eslintrc.json enforces boundaries[^16]; Storybook configs in libs/[^16]; tsconfig path mappings[^16]
- Physics: physics.ts orthonormalization lines 14-31[^17]; sylvester-es6 for vector math[^17]; clipPosition() implementation[^17]
- Network: main.ts useDict/useProtobuf config[^18]; dictionary.json and clientProtos.json schemas[^18]; game.ts serialize()[^18]
- Developer: libs/util exports models[^19]; tsconfig strict mode[^19]; nx.json caching[^19]; package.json nx scripts[^19]

> **Note:** See section 10 (Quality Requirements) for complete quality tree with detailed scenarios and acceptance criteria. See section 11 (Risks and Technical Debt) for known limitations affecting quality goals.

## 4.4 Organizational and Process Decisions

The following organizational decisions shape development workflow and tooling choices. **Note:** Comprehensive organizational process documentation is limited in the repository—most decisions below are inferred from tooling configurations.

| Decision                         | Application                                                                   | Rationale                                                                                                                                                                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Open-source MIT license**      | Project hosted on GitHub with MIT license declaration                         | Maximizes accessibility for contributors and allows commercial use/modification. Constrains dependency selection to compatible permissive licenses (excludes GPL). Documented in package.json and repository[^20]                                                        |
| **Component-driven development** | Storybook v6.4.5 configured for compass and map libraries                     | Enables UI development and testing in isolation from game server dependencies. Provides living documentation of component APIs and supports visual regression testing. **Inferred rationale:** Supports maintainability goal through isolated component development[^21] |
| **Nx workspace commands**        | Standardized npm scripts delegate to Nx: `npm start`, `npm build`, `npm test` | Provides consistent developer interface across all apps and libraries. Nx handles dependency graph computation and incremental builds automatically. **Inferred rationale:** Reduces cognitive load for developers working across multiple modules[^22]                  |
| **Code style automation**        | ESLint 7.32 + Prettier 2.3.1 with single-quote convention enforced            | Eliminates style debates through automated formatting. Configured for editor integration. **Technical debt:** CI pipeline (.travis.yml) currently outdated and targets legacy Node.js 0.10[^23]                                                                          |
| **Module boundary enforcement**  | Nx ESLint rules prevent cross-boundary imports with error severity            | Architectural discipline enforced by tooling rather than manual code review. Prevents apps from importing each other's internals; ensures libraries explicitly declare dependencies. **Directly supports maintainability quality goal**[^24]                             |

> **Note on architecture evolution:** The codebase shows evidence of ongoing migration from legacy Pomelo framework to Pinus (game-server-next directory exists but appears incomplete). README.md contains both legacy instructions (grunt commands, port 3001) and modern Nx instructions (nx commands, port 4200), indicating transition phase. Current strategy prioritizes **working prototype over production-ready deployment**—acceptable for development phase but requires productionization work before public deployment.

> **Cross-references:**
>
> - **Section 1.2** (Quality Goals) defines the five quality priorities that drive these decisions
> - **Section 2** (Constraints) documents imposed technology requirements that limit solution options (browser, TypeScript, Pinus, Nx, WebSocket, in-memory state)
> - **Section 3** (Context and Scope) shows external interfaces and communication protocols that influence technology choices
> - **Section 5** (Building Blocks) details internal structure: apps, libraries, component hierarchy, and dependency graph
> - **Section 6** (Runtime View) illustrates key scenarios that demonstrate how patterns work together: authentication flow, ship command processing, physics simulation broadcasting
> - **Section 8** (Cross-cutting Concepts) explains implementation patterns in detail: physics calculations, action queue mechanics, serialization strategies, session management, error handling
> - **Section 10** (Quality Requirements) provides detailed quality tree with measurable acceptance criteria (TBD)
> - **Section 11** (Risks and Technical Debt) documents known issues affecting strategy: port mismatch bug, outdated CI configuration, incomplete Pomelo→Pinus migration (TBD)

[^1]: nx.json configures workspace; .eslintrc.json lines 9-21 enforce "@nrwl/nx/enforce-module-boundaries"; tsconfig.base.json lines 17-24 define @starship-mayflower/\* path mappings; package.json line 86 typescript ~4.4.3

[^2]: apps/starship-mayflower-frontend/src/main.tsx bootstraps React app; App.tsx uses react-router-dom v6.1.1 for routing; store/store.ts configures Redux Toolkit v1.6.2; package.json line 31 react 17.0.2

[^3]: package.json line 30 pinus 1.4.14; apps/game-server/src/main.ts lines 12-17 configure Pinus with useDict, useProtobuf; apps/game-server/src/config/servers.json defines connector/world topology

[^4]: apps/game-server/src/app/src/game.ts lines 16-18 instantiate ShipRegistry, ObjectInSpaceRegistry, ActionManager as in-memory objects; no database imports or connection configs anywhere in codebase

[^5]: package.json line 38 three 0.135.0, line 29 paper 0.12.15; libs/map/src/lib/StarMap.ts imports Three.js; libs/compass/src/lib/Compass.ts imports Paper.js; both packaged as Nx libraries

[^6]: libs/util/src/lib/model/Ship.ts defines Ship class; exported via libs/util/src/index.ts; imported in apps/game-server/src/app/src/game.ts line 1 and apps/game-server/src/app/src/world/ShipRegistry.ts line 1; TypeScript compiler validates consistency

[^7]: libs/compass/.storybook and libs/map/.storybook contain Storybook configurations; libs/compass/src/compass.tsx exports reusable React component; package.json line 61 @storybook/react ~6.4.5

[^8]: Directory structure shows clear separation: apps/starship-mayflower-frontend (presentation), apps/game-server/src/app/servers/ (handlers), apps/game-server/src/app/src/ (business logic), libs/util (domain models)

[^9]: apps/game-server/src/app/src/world/ShipRegistry.ts implements ShipRegistry class with ships Record and methods getAllShips(), getShip(), addShip(); apps/game-server/src/app/src/game.ts line 17 instantiates objectRegistry

[^10]: apps/game-server/src/app/src/action/actionManager.ts implements ActionManager with actionQueue (ActionQueue instance); update() method processes queued actions; addAction() queues new actions; apps/game-server/src/app/src/timer.ts line 12 calls actionManager.update() every tick

[^11]: apps/game-server/src/config/servers.json defines connector servers (clientPort 3010, internal port 3150) and world servers (port 3151); Pinus RPC enables cross-server calls; separation scales connection handling vs game logic independently

[^12]: apps/starship-mayflower-frontend/src/app/store/websocketMiddleware.ts implements GameMiddleware that intercepts WS_CONNECT, WS_DISCONNECT, NEW_MESSAGE actions; instantiates GameServerClient; store/store.ts line 14 adds middleware to Redux store

[^13]: apps/game-server/src/app/src/timer.ts line 8 setInterval(tick, 100) runs game loop at 100ms intervals (10 Hz); tick() calls actionManager.update(), moveShips(), sendUpdates() in sequence

[^14]: apps/game-server/src/app/src/game.ts line 76 ship.serialize() and channel.pushToShip() sends updates via WebSocket; no client polling—server pushes state changes proactively

[^15]: apps/game-server/src/app/src/timer.ts implements 10 Hz tick; apps/game-server/src/app/src/channel.ts implements Channel.pushToShip() for broadcasting; apps/game-server/src/main.ts configures binary protocol

[^16]: .eslintrc.json enforces module boundaries; libs/compass and libs/map are standalone packages; tsconfig.base.json path mappings enable clean imports; .storybook configs enable isolated development

[^17]: apps/game-server/src/app/src/physics.ts lines 14-31 implement orthonormalizeMatrix() using Gram-Schmidt process; package.json line 37 sylvester-es6 0.0.2 for vector math; physics.ts clipPosition() constrains values

[^18]: apps/game-server/src/main.ts configures useDict and useProtobuf; config/dictionary.json maps strings to integers; config/clientProtos.json defines protobuf schemas; apps/game-server/src/app/src/game.ts serialize() methods prepare messages

[^19]: libs/util exports shared models; tsconfig.base.json enables TypeScript strict checks; nx.json enables build caching; package.json scripts use nx commands

[^20]: package.json line 10 license MIT; README.md describes open-source project; GitHub repository in package.json line 8

[^21]: libs/compass/.storybook/main.js and libs/map/.storybook/main.js configure Storybook; package.json lines 58-61 include @storybook/\* dependencies v6.4.5

[^22]: package.json lines 11-14 define npm scripts using nx: "start": "nx serve", "build": "nx build", "test": "nx test"; README.md describes nx serve and nx build commands

[^23]: .eslintrc.json configures ESLint rules; .prettierrc line 2 singleQuote: true; package.json line 75 eslint 7.32.0, line 83 prettier 2.3.1; .travis.yml targets node_js 0.10 (outdated)

[^24]: .eslintrc.json lines 9-21 configure @nrwl/nx/enforce-module-boundaries rule with error severity; prevents unauthorized cross-library imports; Nx build fails if boundaries violated
