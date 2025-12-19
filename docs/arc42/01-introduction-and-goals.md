# 1. Introduction and Goals

Starship Mayflower is a browser-based multiplayer starship bridge simulator where players collaboratively operate a virtual spacecraft in real-time. Multiple players can join a ship and take on different bridge station roles (helm, weapons, communications, science, engineering) to navigate space, interact with space objects, and manage ship systems together[^1].

## 1.1 Requirements Overview

The system addresses the challenge of creating immersive cooperative gameplay experiences inspired by spaceship bridge simulators like "Artemis Spaceship Bridge Simulator." It enables small groups of players to experience the collaborative operation of a starship, where success depends on coordination between specialized bridge stations rather than individual player actions.

Players connect via web browsers to a central game server that manages physics simulation, world state, and multiplayer coordination. The architecture separates concerns between presentation (React SPA), game logic (Pinus server), and shared domain models (isomorphic TypeScript libraries), enabling both code reuse and clear architectural boundaries[^1].

**Core Capabilities:**

**Multiplayer Ship Operations** – The system supports multiple players crewing the same ship, with each player assigned to a specific bridge station (helm, weapons, communications, science, or engineering). Station assignments are managed through the ship model and enforced by the game server[^2]. Players join ships through a lobby system before gameplay begins, allowing crew assembly and role selection.

**Real-Time Physics Simulation** – Ships move through 3D space at astronomical scale using realistic physics. The game server runs a 10 Hz tick cycle that updates ship positions based on velocity, orientation, and acceleration[^3]. Ships navigate in space measured in Astronomical Units (AU) with impulse engines capable of 0.25c velocity, and physics calculations use vector mathematics to maintain accuracy despite floating-point operations[^4].

**3D Visualization and Station Interfaces** – Players interact with specialized interfaces for their bridge stations. The compass component displays ship orientation (pitch and yaw) using Paper.js canvas rendering, while the map component provides tactical views of nearby ships and space objects using Three.js 3D rendering[^7]. These components are packaged as reusable React libraries with Storybook documentation for independent development and testing[^12].

**Distributed Server Architecture** – The game server uses a distributed architecture separating connector servers (handling client connections and authentication) from world servers (managing game state and physics). This topology allows scaling connection capacity independently from game logic processing[^13]. Communication uses a binary WebSocket protocol with dictionary compression and protobuf encoding for network efficiency[^5].

**Action Queue System** – Player commands (turn, accelerate) are not executed instantly but queued and resolved over time, simulating realistic ship operations where maneuvers take time to complete. The action manager coordinates queued actions across all ships and ensures time-based execution[^8].

| ID  | Requirement                 | Explanation                                                                                               |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| R-1 | Multi-user ship control     | Multiple players simultaneously control different stations on the same ship[^2]                           |
| R-2 | Real-time physics           | Game server simulates ship movement, rotation (pitch/yaw/roll), acceleration at 10 Hz tick rate[^3]       |
| R-3 | 3D space navigation         | Ships navigate in 3D space measured in AU with velocities up to 0.25c (impulse)[^4]                       |
| R-4 | WebSocket communication     | Client-server communication via binary WebSocket protocol with 3-second heartbeat[^5]                     |
| R-5 | World state synchronization | Server broadcasts ship positions, space objects (stations, planets) to all connected clients[^6]          |
| R-6 | Bridge station UI           | Provide specialized interfaces for each station type (compass for orientation, map for tactical view)[^7] |
| R-7 | Action queue system         | Commands (turn, accelerate) are queued and executed over time[^8]                                         |
| R-8 | Session management          | Players authenticate and maintain sessions across connector and world servers[^9]                         |
| T-1 | Monorepo structure          | Organize code as Nx workspace with shared libraries between frontend and backend[^10]                     |
| T-2 | Isomorphic models           | Ship and space object models shared between client and server for consistency[^11]                        |
| T-3 | Component reusability       | UI components (compass, map) packaged as standalone libraries with Storybook[^12]                         |
| T-4 | Distributed game server     | Separate connector servers (client connections) from world servers (game logic)[^13]                      |

> **See also:** Section 3 (System Context) describes external interfaces and system boundaries. Section 8 (Concepts) details the physics simulation and action queue mechanisms.

## 1.2 Quality Goals

The following quality goals have the highest priority for the architecture. **Assumption:** Priority order inferred from implementation emphasis and architectural patterns, as no explicit quality requirements documentation was found in the repository.

| Priority | Quality Goal                           | Scenario                                                                                                                                                                    |
| -------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | **Real-time responsiveness**           | When a player issues a navigation command, ship orientation updates are broadcast to all clients within 100ms (one tick cycle)[^14]                                         |
| 2        | **Maintainability through modularity** | When adding a new bridge station (e.g., tactical), developers can implement it as a standalone library in `libs/` without modifying game server core logic[^15]             |
| 3        | **Physics accuracy**                   | When a ship accelerates for 10 seconds at full impulse (0.25c), position calculations using vector math remain accurate within 0.1% despite floating-point operations[^16]  |
| 4        | **Network efficiency**                 | When 5 ships with 8 players each (40 concurrent users) are active, binary WebSocket protocol with dictionary compression keeps message size under 1KB per world update[^17] |
| 5        | **Developer experience**               | When a developer modifies a shared model in `libs/util`, TypeScript compiler catches type inconsistencies across all dependent apps before runtime[^18]                     |

> **Note:** See section 10 (Quality Requirements) for complete quality requirements tree and detailed quality scenarios. See section 4 (Solution Strategy) for architectural approaches addressing these quality goals.

## 1.3 Stakeholders

| Role                         | Contact                  | Expectations                                                                                                                                                                                                 |
| ---------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Game Developer**           | Florian Eibeck (feibeck) | Understand system architecture to add new features (bridge stations, game mechanics); clear separation between game logic and infrastructure[^19]                                                            |
| **Frontend Developer**       | TBD                      | Reusable UI component libraries (compass, map) with Storybook documentation; React/TypeScript patterns; WebSocket integration via Redux middleware[^20]                                                      |
| **Backend Developer**        | TBD                      | Game server architecture using Pinus framework; physics simulation algorithms; action queue system; distributed server topology (connector/world)[^21]                                                       |
| **Players (End Users)**      | TBD                      | Responsive multiplayer experience with smooth ship controls and collaborative gameplay; **Assumption:** No direct architecture documentation needs, but system must support 5-10 concurrent players per ship |
| **DevOps Engineer**          | TBD                      | **TBD:** Deployment architecture not yet defined; no containerization or CI/CD present; system currently targets development/local hosting[^22]                                                              |
| **QA/Test Engineer**         | TBD                      | Test structure with Jest (unit), Cypress (E2E), and Storybook (visual); Nx commands for running tests (`nx test`, `nx e2e`); **Note:** Limited test coverage (10 test files vs 80+ source files)[^23]        |
| **Open Source Contributors** | GitHub community         | **TBD:** Contributing guidelines not present; architecture documentation needed for onboarding; clear monorepo structure but migration from legacy code in progress[^24]                                     |

**Questions for Stakeholder Validation** – Several aspects require validation from stakeholders that cannot be inferred from code alone: What is the target deployment environment (cloud, on-premise, local development only)? What level of concurrent player load should the system support? Which quality attributes (responsiveness, maintainability, physics accuracy) are most critical to the user experience? What architectural documentation depth do different stakeholder groups need? Are there specific compliance, security, or audit requirements? These questions need stakeholder interviews to answer definitively.

[^1]: README.md describes "A starship bridge simulator running in your browser"; codebase structure shows apps/starship-mayflower-frontend (React SPA), apps/game-server (Pinus multiplayer server), and libs/ with shared game logic

[^2]: libs/util/src/lib/model/Ship.ts defines stations: helm, weapons, comm, science, engineering with player assignments

[^3]: apps/game-server/src/app/src/timer.ts runs tick() every 100ms calling moveShips() and sendUpdates()

[^4]: apps/game-server/src/app/src/world.ts defines IMPULSE = 74948.1145 km/s (0.25c), AU = 149597870.7 km; PlayingFieldLength = 2 \* AU

[^5]: apps/game-server/src/main.ts configures connectorConfig with heartbeat: 3, useDict: true, useProtobuf: true

[^6]: apps/game-server/src/app/src/game.ts sendUpdates() and sendKnownWorld() broadcast ship registry and object registry via channel.pushToGlobal()

[^7]: libs/compass/ and libs/map/ provide React components for station interfaces; compass.tsx takes pitch/yaw props

[^8]: apps/game-server/src/app/src/action/ directory with ActionQueue.ts, actionManager.ts, turn.ts, accelerate.ts

[^9]: apps/game-server/src/app/servers/connector/handler/entry.ts entry() method binds session with playerId and playername

[^10]: nx.json and workspace.json define Nx monorepo with apps/ and libs/ structure; tsconfig.base.json defines path mappings for @starship-mayflower/\* imports

[^11]: libs/util/src/lib/model/Ship.ts defines Ship class exported via libs/util/src/index.ts; imported in apps/game-server/src/app/src/game.ts and used by frontend via @starship-mayflower/util path mapping in tsconfig.base.json

[^12]: libs/compass/project.json and libs/map/project.json include storybook targets; .storybook/ directories present; compass.stories.tsx and map.stories.tsx files exist

[^13]: apps/game-server/src/config/servers.json defines separate connector and world server types; connector has frontend: true and clientPort

[^14]: timer.ts setInterval(tick, 100) ensures 10 Hz update rate; game.ts moveShip() calls channel.pushToShip() immediately after physics update

[^15]: Nx monorepo structure with libs/ containing independent packages (compass, map, util, game-server-lib); tsconfig.base.json paths enable clean imports

[^16]: physics.ts implements orthonormalizeMatrix() to "ensure that a matrix remains orthonormal in the face of rounding errors"; uses Sylvester-ES6 for precise vector/matrix operations

[^17]: main.ts configures useDict: true, useProtobuf: true; config/dictionary.json and clientProtos.json/serverProtos.json enable Pinus binary protocol compression

[^18]: TypeScript ~4.4.3 used throughout; tsconfig.base.json paths enforce module boundaries; package.json devDependencies include @typescript-eslint/parser and @typescript-eslint/eslint-plugin

[^19]: GitHub repository owned by feibeck; package.json author: "Florian Eibeck and others"; repo shows active migration from legacy stack to modern React/Nx architecture

[^20]: apps/starship-mayflower-frontend uses React 17.0.2, Redux Toolkit 1.6.2; websocketMiddleware.ts handles WS communication; libs/compass and libs/map have Storybook integration

[^21]: apps/game-server uses Pinus 1.4.14; physics.ts contains vector math algorithms; action/ directory implements queue system; servers.json defines distributed topology

[^22]: No Dockerfile, docker-compose.yml, Kubernetes configs, or CI/CD pipelines found in repository root; .travis.yml exists but targets legacy Node 0.10 with Grunt (outdated); no deployment scripts in scripts/ directory

[^23]: 10 test files (_.spec.ts, _.spec.tsx) found vs 80+ source files; jest.config.js and cypress.json present; apps/compass-e2e, apps/map-e2e, apps/starship-mayflower-frontend-e2e exist

[^24]: No CONTRIBUTING.md or DESIGN.md found; README.md minimal; web-server/ directory contains legacy AngularJS/Pomelo code marked deprecated; game-server-next/ app suggests ongoing rewrite
