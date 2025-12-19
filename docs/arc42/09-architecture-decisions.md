# Section 9: Architecture Decisions

## Introduction

> **Note:** This section documents significant architectural decisions made during the development of StarshipMayflower that are **not already covered in Section 4 (Solution Strategy)**.
>
> **Relationship to Section 4**: Section 4 documents high-level strategic decisions (Pinus framework adoption, React frontend, Nx monorepo structure) with rationale focused on quality goals. This section provides **implementation-level ADRs** with detailed consequences, trade-offs, and technical debt assessment for decisions that significantly impact system structure, performance, or maintainability.
>
> See Section 4 for the primary solution strategy context that drives these implementation decisions.

Each decision is documented using the Architecture Decision Record (ADR) format:

- **Status**: Current state of the decision (Accepted, Proposed, Deprecated, Inferred)
- **Context**: The problem or requirement that necessitated the decision
- **Decision**: What was decided and why
- **Consequences**: Positive outcomes, negative trade-offs, and risks
- **Evidence**: Code examples and file references supporting this decision

**Selection Criteria**: Decisions included here meet at least one of these criteria:

1. **Structural Impact**: Affects multiple building blocks or crosscutting concerns
2. **Performance Critical**: Directly impacts real-time game performance (10 Hz tick cycle)
3. **Technical Debt**: Creates known limitations requiring future work
4. **Quality Goal Trade-off**: Makes explicit trade-offs between quality goals (Section 1.2)

**Evidence Status Note**: These ADRs are **inferred from codebase analysis** - no formal ADR documents exist in the repository. "Alternatives Considered" sections represent retrospective analysis of reasonable alternatives, not documented contemporaneous evaluation. Performance metrics marked as **estimated** are based on industry benchmarks or theoretical analysis, not project-specific measurements.

---

## ADR-001: Distributed Connector/World Server Architecture

**Status**: ✅ Accepted

**Context**:
The game server must handle both I/O-bound operations (WebSocket connections, protocol encoding) and CPU-bound operations (physics simulation, collision detection, AI). Running both on single-threaded Node.js creates performance bottlenecks. Need to scale horizontally while maintaining real-time responsiveness.

**Decision**:
Adopt Pinus framework's **distributed server topology** with separate Connector and World server types[^1]:

- **Connector Servers**: Handle WebSocket connections, protocol serialization, session management
- **World Servers**: Execute game logic, physics simulation, entity management
- **Master Server**: Coordinates topology and monitors server health
- **RPC Layer**: Enables transparent inter-server communication (Connector ↔ World)

```json
// apps/game-server/src/config/servers.json
{
  "development": {
    "connector": [{ "id": "connector-server-1", "host": "127.0.0.1", "port": 3150, "clientPort": 3010 }],
    "world": [{ "id": "world-server-1", "host": "127.0.0.1", "port": 3250 }]
  }
}
```

**Consequences**:

**Positive**:

- ✅ **Horizontal Scalability**: Can add more Connector servers for more concurrent players[^2]
- ✅ **Separation of Concerns**: I/O and CPU workloads isolated (Quality Goal: Scalability)
- ✅ **Fault Isolation**: Connector crash doesn't affect World simulation state
- ✅ **Resource Optimization**: Connector servers need network bandwidth; World servers need CPU cycles

**Negative**:

- ❌ **Complexity**: Requires RPC layer and state synchronization between server types[^3]
- ❌ **Network Latency**: Inter-server RPC adds ~1-5ms latency vs co-located processes (**estimated**, not measured)
- ❌ **Deployment Overhead**: Must deploy and monitor multiple server types with different resource profiles
- ❌ **Development Overhead**: Testing distributed topology requires running multiple server processes locally

**Risks**:

- ⚠️ **Split-Brain Scenario**: If World server crashes, Connector servers may hold stale session state
- ⚠️ **RPC Bottleneck**: High RPC volume between Connector/World could saturate network (Quality Goal: Performance)

**Related Quality Goals**: Scalability (1.2), Performance (1.2)
**Related Building Blocks**: Connector Server (5.1.1), World Server (5.1.2), RPC Layer (5.1.6)
**Related Crosscutting Concepts**: Pinus RPC Pattern (8.6)

---

## ADR-002: 10 Hz Tick Rate for Game Loop

**Status**: ✅ Accepted

**Context**:
Real-time multiplayer games require regular physics updates and state broadcasts. Tick rate determines how frequently the server processes game logic and sends updates to clients. Must balance responsiveness vs server CPU load and network bandwidth.

**Decision**:
Use **100ms tick interval (10 Hz)** for the World server game loop[^4]:

```typescript
// apps/game-server/src/app/src/timer.ts
export class Timer {
  private intervalID: any;

  start(callback: () => void) {
    this.intervalID = setInterval(callback, 100); // 10 Hz = 100ms
  }
}

// apps/game-server/src/app/servers/world/lifecycle.ts
export const afterStart = (app: Application, callback: () => void) => {
  const timer = new Timer();
  timer.start(() => {
    physics.simulate(0.1); // 100ms time step
    // ... broadcast state updates
  });
};
```

**Alternatives Considered** (retrospective analysis - no formal evaluation documented):

- **20 Hz (50ms)**: Used by games like Counter-Strike; better responsiveness but 2x CPU/bandwidth cost
- **60 Hz (16.67ms)**: Console game standard; excellent for fast-paced shooters but 6x resource cost
- **Variable Frame Rate**: Adaptive tick based on server load; complex to implement and test correctly

**Trade-Off Analysis**: The decision prioritizes **resource efficiency and scalability** (Section 1.2 priority) over **real-time responsiveness**. For bridge simulation gameplay (strategic command issuing), 100ms latency is acceptable, whereas FPS games require 16-50ms. This allows supporting more concurrent players per server instance.

**Consequences**:

**Positive**:

- ✅ **Acceptable Latency**: 100ms perceived latency sufficient for bridge simulation (not twitch shooter)
- ✅ **Resource Efficient**: Lower CPU usage allows more players per World server (Quality Goal: Scalability)
- ✅ **Network Friendly**: ~10 broadcasts/sec per player reduces bandwidth costs
- ✅ **Deterministic**: Fixed time step simplifies physics simulation and debugging

**Negative**:

- ❌ **Input Lag**: 100ms delay between player action and server response noticeable for rapid commands
- ❌ **Jitter Visible**: Client interpolation required to smooth 10 Hz updates to 60 FPS rendering
- ❌ **Competitive Disadvantage**: Cannot compete with FPS games requiring <50ms responsiveness

**Risks**:

- ⚠️ **Tick Budget Exceeded**: If physics simulation takes >100ms, game loop falls behind (Quality Goal: Performance)
- ⚠️ **Client Prediction Needed**: Low tick rate requires client-side prediction to hide latency (not yet implemented)

**Related Quality Goals**: Performance (1.2), Scalability (1.2)
**Related Building Blocks**: World Server (5.1.2), Physics System (5.1.5)
**Related Crosscutting Concepts**: Action Queue Pattern (8.3)

---

## ADR-003: Binary Protocol with Dictionary Compression (Incomplete Implementation)

**Status**: ⚠️ Partially Deprecated

**Context**:
WebSocket connections transmit large volumes of game state updates. JSON encoding is human-readable but inefficient (verbose field names, no type safety). Need compact wire format to reduce bandwidth while maintaining developer productivity.

**Decision**:
Implement **binary protocol with dictionary compression**[^5]:

- **Protobuf-like Encoding**: Numeric field IDs instead of string keys
- **Dictionary Mapping**: Shared dictionary maps IDs to field names
- **Route Compression**: Route strings replaced with numeric codes

```typescript
// apps/game-server/src/app/src/protocols/protobuf.ts
export const encode = (route: string, msg: any): Buffer => {
  const dict = protobufConfig[route];
  if (!dict) return JSON.stringify(msg); // Fallback to JSON

  // Convert {x: 10, y: 20} → Buffer [1, 10, 2, 20] using dictionary
  return encodeWithDictionary(msg, dict);
};
```

**Implementation Status**:

- ⚠️ Configuration enabled in `main.ts` (`useDict: true, useProtobuf: true`)
- ❌ **EMPTY DICTIONARIES**: `dictionary.json`, `clientProtos.json`, `serverProtos.json` are all empty (0 bytes)
- ❌ **NOT IMPLEMENTED**: Encoder/decoder scaffold exists but has no dictionary definitions
- ❌ **NOT ACTIVELY USED**: All routes use JSON encoding (fallback path)
- ❌ Dictionary never populated as message formats evolved

**Consequences**:

**Positive** (If Fully Implemented - **estimated benefits**, not measured):

- ✅ **Bandwidth Reduction**: ~40-60% smaller message size vs JSON for typical game state (protobuf standard claims)
- ✅ **Type Safety**: Dictionary acts as schema, catching encoding/decoding mismatches at build time
- ✅ **CPU Efficient**: Binary encoding faster than JSON.stringify() in hot paths (protobuf benchmarks)

**Negative**:

- ❌ **Maintenance Burden**: Dictionary must be updated when message formats change
- ❌ **Debugging Difficulty**: Cannot inspect binary messages in browser dev tools (Quality Goal: Maintainability)
- ❌ **Client Complexity**: Frontend must mirror dictionary and decoding logic
- ❌ **Incomplete Implementation**: Current state provides no benefit while adding complexity

**Risks**:

- ⚠️ **Version Skew**: Mismatched dictionaries between client/server cause decoding failures
- ⚠️ **Technical Debt**: Unused code increases maintenance burden without delivering value (Quality Goal: Maintainability)

**Recommendation**:
Either **fully implement** binary protocol (populate dictionaries, implement client-side decoder, add comprehensive message schemas) or **remove scaffolding** and commit to JSON encoding. Current state has empty configuration files providing zero value while adding maintenance burden - this is a clear anti-pattern requiring immediate resolution.

**Related Quality Goals**: Performance (1.2), Maintainability (1.2)
**Related Building Blocks**: Connector Server (5.1.1), Protocol Layer (5.1.7)
**Related Crosscutting Concepts**: Channel Broadcasting (8.5)

---

## ADR-004: In-Memory Ephemeral State (No Database Persistence)

**Status**: ✅ Accepted (with known limitations)

**Context**:
Game state (ship positions, player sessions, world entities) changes at 10 Hz. Database writes at this frequency would overwhelm traditional RDBMS. Need to decide: persist everything, persist nothing, or hybrid approach?

**Decision**:
Store **all runtime game state in memory only**[^6]:

- **No Database**: World server uses in-memory data structures (ObjectInSpaceRegistry)
- **Session-Only Persistence**: Player authentication and account data in external DB (not shown in codebase)
- **Ephemeral Simulation**: World state resets on server restart

```typescript
// apps/game-server/src/app/src/world/ShipRegistry.ts
export class ShipRegistry extends ObjectInSpaceRegistry<Ship> {
  private shipsByPlayerId = new Map<string, Ship>(); // In-memory index

  registerShip(ship: Ship): void {
    this.add(ship); // Stored in parent Map, no DB write
    this.shipsByPlayerId.set(ship.getPlayerId(), ship);
  }
}
```

**Alternatives Considered** (retrospective analysis - no formal evaluation documented):

- **Full Persistence**: Write every state change to PostgreSQL/MongoDB (~40-100ms write latency **estimated** - incompatible with 10 Hz tick cycle)
- **Write-Through Cache**: Redis for hot data, DB for cold data (adds operational complexity and cost)
- **Event Sourcing**: Persist action log, replay on startup (complex to implement correctly, recovery time unclear)

**Trade-Off Analysis**: This decision prioritizes **maximum performance** (Section 1.2) by eliminating all I/O from the hot path, at the cost of **reliability** (crash recovery). For a game prototype/demo, this trade-off is acceptable; for production with paying users, hybrid persistence would be required.

**Consequences**:

**Positive**:

- ✅ **Maximum Performance**: O(1) hash lookups, no I/O blocking (Quality Goal: Performance)
- ✅ **Simplified Architecture**: No ORM, schema migrations, or connection pooling
- ✅ **Deterministic Restart**: Fresh simulation state on deploy (easier testing)

**Negative**:

- ❌ **Data Loss on Crash**: All in-flight game state lost if World server crashes (Quality Goal: Reliability)
- ❌ **No Game Saves**: Players cannot resume exact game state across sessions
- ❌ **Limited Analytics**: Cannot query historical game state for analysis
- ❌ **Stateful Servers**: Cannot easily migrate players between World servers (anti-pattern for cloud deployment)

**Risks**:

- ⚠️ **Memory Leaks**: Unbounded entity growth exhausts RAM (no garbage collection visible in codebase)
- ⚠️ **Cold Start Penalty**: Players must wait for full simulation initialization on server restart

**Future Work**:

- Implement periodic snapshots to S3 for disaster recovery
- Add entity lifecycle management (TTL for inactive ships)
- Consider hybrid model: ephemeral positions, persistent player progression

**Related Quality Goals**: Performance (1.2), Reliability (1.2), Scalability (1.2)
**Related Building Blocks**: World Server (5.1.2), Entity Registry (5.1.4)
**Related Crosscutting Concepts**: Registry Pattern (8.2)

---

## ADR-005: Isomorphic TypeScript Models

**Status**: ✅ Accepted

**Context**:
Game state must be represented consistently between server (authoritative simulation) and client (visualization). Duplicating class definitions leads to subtle bugs when schemas diverge. Need single source of truth for domain models.

**Decision**:
Define **shared domain models in `libs/util`** accessible to both frontend and backend[^7]:

```typescript
// libs/util/src/lib/model/Ship.ts
export class Ship extends ObjectInSpace {
  private name = '';
  private maxSpeed = 10;

  // Used by server physics simulation
  accelerate(delta: number): void {
    this.velocity = Math.min(this.velocity + delta, this.maxSpeed);
  }

  // Used by client for 3D rendering
  serializeMapData(): MapData {
    return {
      id: this.id,
      position: this.position.elements,
      heading: this.heading,
      // ... 15+ fields
    };
  }
}
```

**TypeScript Path Mapping** enables imports in both contexts:

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "paths": {
      "@starship-mayflower/util": ["libs/util/src/index.ts"]
    }
  }
}
```

**Consequences**:

**Positive**:

- ✅ **Type Safety**: Compiler prevents client/server schema mismatches (Quality Goal: Maintainability)
- ✅ **Single Source of Truth**: Domain logic changes propagate automatically to both contexts
- ✅ **Code Reuse**: Validation, serialization, and business logic shared (DRY principle)
- ✅ **Refactoring Confidence**: Renaming fields breaks compilation in both frontend and backend

**Negative**:

- ❌ **Coupled Deployments**: Changing shared model requires deploying both frontend and backend
- ❌ **Bundle Size**: Frontend imports server-specific code paths (tree-shaking mitigates this)
- ❌ **Circular Dependencies**: Risk of libs/util depending on backend-specific utilities

**Risks**:

- ⚠️ **Backend Leakage**: Accidentally exposing server-side secrets through shared classes
- ⚠️ **Version Skew**: Deployed frontend using old model version with new backend (Quality Goal: Compatibility)

**Best Practices Observed** (verified in codebase):

- ✅ Shared models are **mostly pure data classes** (note: Ship.ts imports sylvester-es6 for Vector/Matrix - acceptable domain dependency)
- ✅ Server-specific logic lives in `apps/game-server`, not `libs/util` (boundary maintained)
- ✅ Serialization methods support both contexts: `serializeMapData()` for client rendering, `serialize()` for full state sync

**Related Quality Goals**: Maintainability (1.2), Modifiability (1.2)
**Related Building Blocks**: Domain Models (5.1.8), Frontend (5.1.3), Backend (5.1.2)
**Related Crosscutting Concepts**: Isomorphic Domain Model (8.1)

---

## ADR-006: Sylvester.js for Vector Mathematics

**Status**: ✅ Accepted (with known limitations)

**Context**:
3D space simulation requires vector and matrix operations (position updates, heading calculations, coordinate transformations). Must choose between third-party libraries or manual implementations.

**Decision**:
Use **Sylvester-ES6** library for vector/matrix math[^8]:

```typescript
// libs/util/src/lib/model/ObjectInSpace.ts
import { Vector, Matrix } from 'sylvester-es6';

export class ObjectInSpace {
  protected position = new Vector([0, 0, 0]);
  protected orientation = Matrix.I(3); // 3x3 identity matrix

  setHeading(heading: number): ObjectInSpace {
    const radian = (heading / 180) * Math.PI;
    const x = Math.cos(radian);
    const z = Math.sin(radian);
    this.direction = new Vector([x, 0, z]);
    return this;
  }
}
```

**Alternatives Considered** (retrospective analysis - no formal evaluation documented):

- **gl-matrix**: Industry standard (Three.js uses it internally), better performance (~10-20% faster **estimated**), larger API surface, steeper learning curve
- **Manual Implementation**: Full control, no dependencies, high risk of math bugs (quaternion operations notoriously error-prone)
- **Three.js Vectors**: Would create tight coupling between domain models (libs/util) and rendering library (violation of dependency boundaries)

**Trade-Off Analysis**: This decision prioritizes **developer experience and code readability** (Section 1.2) over raw performance. Sylvester's chainable API (`vector.add(other).multiply(3)`) is more maintainable than gl-matrix's mutable operations (`vec3.add(out, a, b)`). Performance is acceptable for current scale (~100 entities at 10 Hz).

**Consequences**:

**Positive**:

- ✅ **Readable API**: Chainable methods and clear naming (Vector.add, Matrix.multiply)
- ✅ **Battle-Tested**: Sylvester used since 2007, math correctness well-validated
- ✅ **Small Footprint**: Minimal bundle size impact (~15KB minified)

**Negative**:

- ❌ **Performance**: Not SIMD-optimized like gl-matrix (~10-20% slower for matrix ops **estimated**)
- ❌ **Immutable API**: Creates new Vector/Matrix objects on every operation (GC pressure at scale)
- ❌ **Limited Maintenance**: Sylvester-ES6 is community fork of abandoned 2007 library, minimal updates
- ❌ **Duplicate Vectors**: Three.js uses Vector3, backend uses Sylvester Vector (requires conversion in MapObjectActor: `new THREE.Vector3(...sylvesterVec.elements)`)

**Risks**:

- ⚠️ **Library Abandonment**: If Sylvester-ES6 breaks on future Node.js/TypeScript versions, migration costly
- ⚠️ **Performance Bottleneck**: If 10 Hz tick rate proves insufficient, Sylvester could become limiting factor

**Performance Evidence**:
Current 10 Hz simulation with ~100 entities shows no Sylvester bottleneck (no profiling data available, observation based on smooth gameplay). If scaling to 1000+ entities, benchmark Sylvester vs gl-matrix in actual game loop before migration.

**Related Quality Goals**: Performance (1.2), Maintainability (1.2)
**Related Building Blocks**: Physics System (5.1.5), Domain Models (5.1.8)
**Related Crosscutting Concepts**: Isomorphic Domain Model (8.1)

---

## ADR-007: Separate Compass and Map Visualization Libraries

**Status**: ✅ Accepted

**Context**:
Bridge interface requires two distinct visualizations:

1. **Compass**: 2D top-down view showing heading and nearby objects (tactical display)
2. **3D Map**: Full 3D space visualization with camera controls (strategic view)

These have different rendering requirements (2D canvas vs WebGL), update frequencies, and interaction models.

**Decision**:
Use **separate specialized libraries** for each visualization[^9][^10]:

- **Compass (2D)**: Paper.js for vector graphics rendering
- **Map (3D)**: Three.js for WebGL 3D scene

```typescript
// libs/compass/src/compass.tsx (Paper.js)
export const Compass: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    paper.setup(canvasRef.current);
    const circle = new paper.Path.Circle({
      center: [150, 150],
      radius: 100,
      fillColor: 'blue'
    });
    paper.view.draw(); // 2D canvas rendering
  }, []);

  return <canvas ref={canvasRef} />;
};

// libs/map/src/lib/map.tsx (Three.js)
export const Map: React.FC = () => {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer(); // WebGL context

  const ship = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  scene.add(ship);
  renderer.render(scene, camera); // 3D rendering
};
```

**Alternatives Considered** (retrospective analysis - no formal evaluation documented):

- **Three.js for Both**: Use orthographic camera for compass; unified library but overkill for 2D (Three.js ~500KB vs Paper.js ~200KB)
- **Canvas API for Both**: Manual WebGL and Canvas2D; full control but high complexity and development time
- **SVG for Compass**: Declarative 2D with good browser dev tools support, but poor performance for real-time 10 Hz updates (DOM manipulation overhead)

**Trade-Off Analysis**: This decision prioritizes **optimal performance per visualization type** (Quality Goal: Performance 1.2) at the cost of **increased complexity** (two rendering systems). Paper.js excels at 2D vector graphics (compass rose, heading lines), while Three.js handles 3D space (star fields, ship models). The bundle size cost (+200KB Paper.js) is acceptable for improved 2D rendering performance.

**Consequences**:

**Positive**:

- ✅ **Optimized Rendering**: Paper.js optimized for 2D, Three.js for 3D (Quality Goal: Performance)
- ✅ **Separation of Concerns**: Compass changes don't affect Map and vice versa (Quality Goal: Modifiability)
- ✅ **Independent Evolution**: Can upgrade/replace one library without touching the other
- ✅ **Smaller Bundle**: Paper.js lighter than Three.js for 2D-only use case

**Negative**:

- ❌ **Duplicate Concepts**: Two rendering pipelines, two coordinate systems, two update loops
- ❌ **Learning Curve**: Developers must understand both Paper.js and Three.js APIs
- ❌ **Bundle Size**: Shipping two graphics libraries increases total JavaScript payload
- ❌ **Conversion Overhead**: Must transform shared domain models to both Paper.js and Three.js primitives

**Risks**:

- ⚠️ **Coordinate System Confusion**: Paper.js Y-axis down, Three.js Y-axis up (source of bugs)
- ⚠️ **Inconsistent Rendering**: Compass and Map may show slightly different positions due to timing

**Related Quality Goals**: Performance (1.2), Modifiability (1.2)
**Related Building Blocks**: Compass (5.1.9), 3D Map (5.1.10), Frontend (5.1.3)
**Related Crosscutting Concepts**: Component Composition (8.7)

---

## ADR-008: Redux Toolkit for Frontend State Management

**Status**: ✅ Accepted

**Context**:
React frontend must manage complex state: WebSocket connection status, game world updates, UI component state, user preferences. Need predictable state management with good developer ergonomics.

**Decision**:
Use **Redux Toolkit (RTK)** with custom WebSocket middleware[^11][^12]:

```typescript
// apps/starship-mayflower-frontend/src/app/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { websocketMiddleware } from './websocketMiddleware';
import { shipReducer } from './slices/shipSlice';

export const store = configureStore({
  reducer: {
    ships: shipReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(websocketMiddleware),
});
```

**Custom Middleware** integrates Redux with Pinus WebSocket client:

```typescript
// apps/starship-mayflower-frontend/src/app/store/websocketMiddleware.ts
export const websocketMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'WEBSOCKET_SEND') {
    pinus.request(action.payload.route, action.payload.data, (response) => {
      store.dispatch({ type: 'WEBSOCKET_RESPONSE', payload: response });
    });
  }
  return next(action);
};
```

**Alternatives Considered** (retrospective analysis - no formal evaluation documented):

- **React Context API**: Built-in (no bundle cost), but poor performance for frequent updates (10 Hz game state causes full tree re-renders)
- **Zustand**: Simpler API (~3KB vs Redux Toolkit ~15KB), but less mature middleware ecosystem for WebSocket integration
- **MobX**: Reactive paradigm with automatic dependency tracking, but team already familiar with Redux patterns (learning curve)
- **Manual useState**: No global state, passing props through many layers (prop drilling makes refactoring difficult)

**Trade-Off Analysis**: This decision prioritizes **predictable state management and middleware composition** (Quality Goal: Maintainability 1.2) over **bundle size** and **simplicity**. Redux Toolkit's middleware system is ideal for WebSocket integration, and the Redux DevTools provide excellent debugging. The 15KB bundle cost is acceptable for these benefits.

**Consequences**:

**Positive**:

- ✅ **Predictable State**: Single source of truth, time-travel debugging with Redux DevTools (Quality Goal: Maintainability)
- ✅ **Middleware Composition**: WebSocket, logging, error handling as composable middleware
- ✅ **Type Safety**: RTK generates TypeScript types for actions and selectors automatically
- ✅ **Performance**: Normalized state shape prevents unnecessary re-renders (Quality Goal: Performance)

**Negative**:

- ❌ **Boilerplate**: Slices, actions, reducers more verbose than Context API or Zustand
- ❌ **Bundle Size**: Redux Toolkit + dependencies ~15KB (larger than alternatives)
- ❌ **Learning Curve**: New developers must understand Redux concepts (actions, reducers, middleware)

**Risks**:

- ⚠️ **State Bloat**: Storing all game state in Redux could exhaust browser memory with large worlds
- ⚠️ **Re-render Cascades**: Poor selector design triggers unnecessary component updates (Quality Goal: Performance)

**Best Practices Observed** (claimed - **verification needed**):

- ⚠️ Normalized state using `createEntityAdapter` for ships (**not verified** in store.ts - may be future work)
- ✅ Middleware handles side effects (WebSocket lifecycle in websocketMiddleware.ts), keeping reducers pure
- ✅ Selective subscriptions using `useSelector` in components prevent global re-renders (React best practice)

**Related Quality Goals**: Maintainability (1.2), Performance (1.2), Modifiability (1.2)
**Related Building Blocks**: Frontend (5.1.3), WebSocket Client (5.1.7)
**Related Crosscutting Concepts**: Redux Middleware Pattern (8.4)

---

## ADR-009: Nx Monorepo with Module Boundary Enforcement

**Status**: ✅ Accepted

**Context**:
Project contains multiple applications (frontend, game-server, game-server-next) and shared libraries (util, map, compass). Need to enforce architectural boundaries preventing unauthorized dependencies (e.g., frontend importing backend code).

**Decision**:
Use **Nx monorepo** with TypeScript path mappings and build caching[^13][^14]:

```json
// nx.json - Workspace configuration
{
  "affected": {
    "defaultBase": "master"
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runner/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test"]
      }
    }
  }
}

// tsconfig.base.json - Path mappings
{
  "compilerOptions": {
    "paths": {
      "@starship-mayflower/util": ["libs/util/src/index.ts"],
      "@starship-mayflower/map": ["libs/map/src/index.ts"],
      "@starship-mayflower/compass": ["libs/compass/src/index.ts"]
    }
  }
}
```

**Note on Module Boundaries**: Current `eslint.config.mjs` does **not enforce** module boundaries via `@nrwl/nx/enforce-module-boundaries` rule. Game-server directory is explicitly ignored in linting configuration. Boundary enforcement relies on TypeScript's import resolution and developer discipline rather than automated ESLint rules.

**Project Structure**:

```
apps/
  starship-mayflower-frontend/  (scope:frontend)
  game-server/                   (scope:backend)
  game-server-next/              (scope:backend)
libs/
  util/                          (scope:shared)
  map/                           (scope:shared)
  compass/                       (scope:shared)
```

**Consequences**:

**Positive**:

- ✅ **Incremental Builds**: Nx caches build outputs, only rebuilding affected projects (Quality Goal: Build Speed)
- ✅ **Dependency Graph**: `nx graph` visualizes module relationships, detecting circular dependencies
- ✅ **Shared Tooling**: Single `nx.json` configures TypeScript, Jest, ESLint for all projects
- ✅ **Clean Imports**: TypeScript path mappings eliminate brittle relative paths (`../../../libs/util`)

**Negative**:

- ❌ **Nx Learning Curve**: Developers must understand Nx CLI and project configuration (`project.json`)
- ❌ **Build Complexity**: Nx workspace abstraction hides underlying Webpack/TypeScript configuration
- ❌ **No Automated Boundary Enforcement**: ESLint rules not configured; relies on developer discipline to prevent architectural violations

**Risks**:

- ⚠️ **Cache Poisoning**: Incorrect cache keys could serve stale build artifacts
- ⚠️ **Monorepo Scaling**: As project count grows, dependency graph analysis slows down
- ⚠️ **Architectural Erosion**: Without ESLint boundary enforcement, unauthorized dependencies can creep in undetected

**Future Work**:

- Configure `@nrwl/nx/enforce-module-boundaries` ESLint rule with tags (`scope:frontend`, `scope:backend`, `scope:shared`)
- Remove game-server from ESLint ignore list to enable linting
- Add pre-commit hooks to enforce architectural boundaries

**Related Quality Goals**: Maintainability (1.2), Modifiability (1.2), Build Speed (implicit)
**Related Building Blocks**: All applications and libraries (Chapter 5)
**Related Crosscutting Concepts**: Nx Monorepo Pattern (8.8)

---

## Summary: Decision Impact Matrix

| Decision                         | Performance      | Scalability | Maintainability | Reliability | Technical Debt |
| -------------------------------- | ---------------- | ----------- | --------------- | ----------- | -------------- |
| **ADR-001**: Distributed Servers | ✅ High          | ✅ High     | ⚠️ Medium       | ✅ High     | 🟢 Low         |
| **ADR-002**: 10 Hz Tick Rate     | ✅ High          | ✅ High     | ✅ High         | ✅ High     | 🟢 Low         |
| **ADR-003**: Binary Protocol     | ⚠️ None (unused) | ➖ N/A      | ❌ Low          | ➖ N/A      | 🔴 High        |
| **ADR-004**: In-Memory State     | ✅ Highest       | ⚠️ Medium   | ✅ High         | ❌ Low      | 🟡 Medium      |
| **ADR-005**: Isomorphic Models   | ✅ High          | ➖ N/A      | ✅ Highest      | ✅ High     | 🟢 Low         |
| **ADR-006**: Sylvester.js        | ⚠️ Medium        | ⚠️ Medium   | ✅ High         | ✅ High     | 🟡 Medium      |
| **ADR-007**: Separate Rendering  | ✅ High          | ➖ N/A      | ✅ High         | ✅ High     | 🟢 Low         |
| **ADR-008**: Redux Toolkit       | ⚠️ Medium        | ➖ N/A      | ✅ High         | ✅ High     | 🟢 Low         |
| **ADR-009**: Nx Monorepo         | ➖ N/A           | ➖ N/A      | ✅ Highest      | ➖ N/A      | 🟢 Low         |

**Legend**:
✅ High Positive Impact | ⚠️ Medium/Mixed Impact | ❌ Negative Impact | ➖ Not Applicable
🟢 Low Debt | 🟡 Medium Debt | 🔴 High Debt

---

## Recommendations for Future Work

### Immediate Actions (High Technical Debt)

1. **ADR-003**: Decide binary protocol fate - either populate dictionaries and fully implement or remove empty config files and scaffolding
2. **ADR-009**: Configure ESLint module boundary enforcement rules or document reliance on TypeScript/discipline
3. **ADR-004**: Implement entity lifecycle management to prevent memory leaks (TTL for inactive ships)

### Medium-Term Improvements

4. **ADR-006**: Profile Sylvester.js performance at scale (1000+ entities); consider gl-matrix migration if needed
5. **ADR-002**: Implement client-side prediction to mask 100ms latency for responsive controls

### Long-Term Architecture Evolution

6. **ADR-004**: Design hybrid persistence (ephemeral positions, persistent progression) for player continuity
7. **ADR-001**: Add load balancing and dynamic World server provisioning for horizontal scaling

---

## Footnotes

[^1]: apps/game-server/src/config/servers.json - Pinus server topology configuration

[^2]: apps/game-server/src/config/servers.json - Connector server definitions with clientPort

[^3]: apps/game-server/src/app/src/rpc - RPC handler definitions for inter-server communication

[^4]: apps/game-server/src/app/src/timer.ts - Timer class with 100ms setInterval

[^5]: apps/game-server/src/app/src/protocols/protobuf.ts - Binary protocol encoder/decoder

[^6]: apps/game-server/src/app/src/world/ShipRegistry.ts - In-memory Map-based storage

[^7]: libs/util/src/lib/model/Ship.ts - Shared domain model used by frontend and backend

[^8]: libs/util/src/lib/model/ObjectInSpace.ts - Sylvester Vector and Matrix usage

[^9]: libs/compass/src/compass.tsx - Paper.js 2D rendering implementation

[^10]: libs/map/src/lib/map.tsx - Three.js 3D scene rendering

[^11]: apps/starship-mayflower-frontend/src/app/store/store.ts - Redux Toolkit store configuration

[^12]: apps/starship-mayflower-frontend/src/app/store/websocketMiddleware.ts - Custom WebSocket middleware

[^13]: nx.json - Nx workspace configuration with caching

[^14]: tsconfig.base.json - TypeScript path mappings for clean imports; Note: eslint.config.mjs currently ignores game-server directory
