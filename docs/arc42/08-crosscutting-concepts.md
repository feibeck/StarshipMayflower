# 8. Crosscutting Concepts

This section documents **8 key crosscutting patterns** that affect multiple building blocks and form the basis for conceptual integrity of the Starship Mayflower architecture. These concepts are documented centrally to avoid repetition across building block descriptions.

**Selection Criteria**: The patterns documented here were selected based on:
- **Crosscutting Nature**: Each pattern is used by at least 3 building blocks (section 5), ensuring system-wide consistency
- **Quality Goal Support**: All patterns directly support quality goals from section 1.2 (real-time responsiveness, maintainability, developer experience)
- **Architectural Significance**: Patterns are critical to achieving conceptual integrity and maintaining system coherence
- **Implementation Consistency**: Patterns require uniform implementation across modules to prevent architectural erosion

**Pattern Organization**: Patterns are organized from domain layer (models, registries) through business logic (actions, state management) to infrastructure (communication, rendering, build system).

**Additional Patterns**: Other important patterns specific to individual building blocks are documented in section 5 (Building Block View). Examples include:
- Pinus framework handlers pattern (section 5.2)
- React Router navigation pattern (section 5.3)
- Storybook component isolation pattern (section 5.5)

## 8.1 Isomorphic Domain Model with Dual Serialization

The system uses **shared domain models** defined once in TypeScript and used by both frontend and backend, providing type safety across the network boundary and enabling **dual serialization contexts** for different use cases[^domain1].

[^domain1]: Domain models in libs/util/src/lib/model/; imported by both apps/game-server and apps/starship-mayflower-frontend

**Core Domain Model Hierarchy**:

```
ObjectInSpace (base class)
├── Ship
├── Station (space station)
└── Planet
```

**Key Pattern**: Each domain model provides **multiple serialization methods** for different contexts:
- `serialize()` - Full state serialization for game server replication
- `serializeMapData()` - Visualization-focused data for 3D map rendering
- `fromJson()` - Deserialization from network format

**Code Example**[^domain2]:

[^domain2]: libs/util/src/lib/model/ObjectInSpace.ts lines 45-90 define base serialization; Ship.ts lines 120-150 override for ship-specific data

```typescript
// Base class: ObjectInSpace
export class ObjectInSpace {
  protected position = new Vector([0, 0, 0]);
  protected velocity = 0;
  protected heading = 0;
  protected orientation = Matrix.I(3);
  protected id = '';

  // Serialization for 3D map visualization
  serializeMapData(): MapData {
    return {
      id: this.id,
      position: this.position.elements,
      speed: this.velocity,
      heading: this.heading,
      orientation: this.orientation.elements,
    };
  }

  // Deserialization from network format
  fromJson(json: MapData) {
    this.setOrientation(new Matrix(json.orientation));
    this.setPosition(new Vector(json.position));
    this.setHeading(json.heading);
  }

  // Fluent builder pattern for configuration
  setPosition(vector: Vector): ObjectInSpace {
    this.position = vector;
    return this;  // Method chaining
  }
}

// Specialized model: Ship
export class Ship extends ObjectInSpace {
  private name = '';
  private creator: Player | null = null;
  private stations: Record<Station, Player> = {};
  private energy = 1000;
  private warpLevel = 0;

  // Full state serialization for replication
  serialize(): SerializedShip {
    return {
      name: this.name,
      creator: this.creator?.serialize(),
      stations: this.serializeStations(),
      energy: this.energy,
      warpLevel: this.warpLevel,
      position: this.position.elements,
      velocity: this.velocity,
      heading: this.heading,
      orientation: this.orientation.elements,
    };
  }

  // Visualization-focused serialization (less data)
  serializeMapData(): MapData {
    return {
      ...super.serializeMapData(),
      name: this.name,
      type: 'ship',
    };
  }
}
```

**Ubiquitous Language** (Domain Terms):

| Term | Definition | File Reference |
|------|------------|----------------|
| **ObjectInSpace** | Base class for all spatial entities with 3D position, velocity, heading, and orientation matrix | libs/util/src/lib/model/ObjectInSpace.ts[^domain3] |
| **Ship** | Player-controlled vessel with 5 bridge stations (helm, weapons, comm, science, engineering), energy, and warp capability | libs/util/src/lib/model/Ship.ts[^domain4] |
| **Station** | Enum of bridge station types: helm, weapons, comm, science, engineering | libs/util/src/lib/model/Ship.ts[^domain5] |
| **Player** | User assigned to ship with specific station role | apps/game-server/src/app/src/models/Player.ts[^domain6] |
| **MapData** | Lightweight serialization format for 3D map visualization | libs/util/src/lib/model/ObjectInSpace.ts[^domain7] |

[^domain3]: libs/util/src/lib/model/ObjectInSpace.ts lines 10-45 define base class with position, velocity, heading, orientation
[^domain4]: libs/util/src/lib/model/Ship.ts lines 15-40 define Ship class with stations, energy, warp
[^domain5]: libs/util/src/lib/model/Ship.ts lines 5-10 define Station enum: 'helm', 'weapons', 'comm', 'science', 'engineering'
[^domain6]: apps/game-server/src/app/src/models/Player.ts lines 10-30 define Player wrapping session with ship/station assignment
[^domain7]: libs/util/src/lib/model/ObjectInSpace.ts lines 60-70 define MapData interface for visualization

**Building Blocks Using This Pattern**:
- **Frontend SPA** (section 5.3): Imports domain models via `@starship-mayflower/util` for type-safe state management
- **Game Server** (section 5.2): Uses same models for server-side game logic and state management
- **Map Library** (section 5.5): Consumes `MapData` serialization format for Three.js visualization
- **Compass Library** (section 5.5): Uses orientation data from domain models

**Why This Matters**:
- **Type Safety Across Network Boundary**: TypeScript compiler catches type mismatches between client and server (supports developer experience quality goal from section 1.2)
- **Single Source of Truth**: Domain models defined once, eliminating client-server deserialization bugs
- **Multiple Views of Same Data**: Dual serialization enables efficient map rendering (lightweight) vs full state sync (complete)
- **Fluent Builder Pattern**: Method chaining enables clean object configuration code

**Anti-Patterns to Avoid**:
- ❌ **Separate Client/Server Models**: Duplicating domain models leads to deserialization bugs and type mismatches
- ❌ **Single Serialization Method**: Forces unnecessary data transfer (sending full state for map rendering wastes bandwidth)
- ❌ **Direct Property Access**: Bypassing setters breaks fluent interface and prevents validation

## 8.2 Registry Pattern for Entity Management

The system uses **centralized registries** to manage collections of domain objects with O(1) hash-based lookup, lazy caching, and event-driven updates[^registry1].

[^registry1]: Registry pattern implemented in libs/util/src/lib/model/ObjectInSpaceRegistry.ts and apps/game-server/src/app/src/world/ShipRegistry.ts

**Key Pattern**: Registries maintain both a **hash map for fast lookup** and a **lazy-loaded array for iteration**, with dirty flag to track when cache needs rebuilding.

**Code Example**[^registry2]:

[^registry2]: libs/util/src/lib/model/ObjectInSpaceRegistry.ts lines 10-80 implement base registry; ShipRegistry.ts lines 15-100 specialize for game domain

```typescript
// Base registry with dual data structure (hash + list)
export class ObjectInSpaceRegistry extends EventEmitter {
  protected _hashtable: Record<string, ObjectInSpace> = {};
  protected _list: ObjectInSpace[] = [];
  protected _dirty = true;
  private idCounter = 0;

  // O(1) insertion with automatic ID assignment
  push(object: ObjectInSpace): ObjectInSpaceRegistry {
    object.setId(this.createId());
    this._hashtable[object.getId()] = object;
    this._dirty = true;  // Mark cache as stale
    this.emit('update');  // Broadcast changes to observers
    return this;
  }

  // O(1) hash-based lookup
  getObject(id: string): ObjectInSpace | null {
    return this._hashtable[id] || null;
  }

  // Lazy-loaded list for iteration (only rebuilds when dirty)
  protected _getList(): ObjectInSpace[] {
    if (this._dirty) {
      this._list = Object.keys(this._hashtable).map((key) => {
        return this._hashtable[key];
      });
      this._dirty = false;
    }
    return this._list;
  }

  // Spatial query using lazy list
  getSurroundings(origin: Vector, radius: number): ObjectInSpace[] {
    const list = this._getList();
    return list.filter((obj) => {
      const distance = origin.distanceFrom(obj.getPosition());
      return distance <= radius;
    });
  }

  // Auto-increment ID generator
  createId(): string {
    return `${this.idCounter++}`;
  }
}

// Specialized registry for game domain with ship/player management
export class ShipRegistry {
  protected ships: Record<string, Ship> = {};
  protected players: Record<number, Player> = {};
  protected game: Game;

  addShip(ship: Ship, player: Player): Ship {
    // Coordinate with object registry for ID assignment
    const id = this.game.getObjectRegistry().createId();
    ship.setId(id);
    ship.setCreator(player);

    // Initialize ship at random position in world
    const position = this.game.getWorld().getRandomPosition();
    ship.setPosition(position);

    // Register in multiple indexes
    const index = this.getNewIndex();
    this.ships[index] = ship;
    this.game.getObjectRegistry().push(ship);

    // Broadcast to all lobby clients
    channel.pushToLobby('ShipAdded', ship.serialize());
    return ship;
  }

  addPlayer(player: Player, ship: Ship, station: Station) {
    this.players[player.getId()] = player;
    ship.setPlayer(station, player);

    // Broadcast to ship-specific channel
    channel.pushToShip(ship, 'PlayerJoined', {
      playerId: player.getId(),
      station: station,
    });
  }

  getAllShips(): Ship[] {
    return Object.keys(this.ships).map((key) => this.ships[key]);
  }

  getShip(id: string): Ship | null {
    return this.ships[id] || null;
  }
}
```

**Registry Hierarchy**:
- **ObjectInSpaceRegistry** (base): Manages all spatial entities (ships, stations, planets)
- **ShipRegistry** (specialized): Manages ships and player-to-ship assignments with broadcasting

**Building Blocks Using This Pattern**:
- **Game Server - World Server** (section 5.2): Uses `ShipRegistry` and `ObjectInSpaceRegistry` for all entity management
- **Game Server - Lobby Handler** (section 5.2): Creates ships via `ShipRegistry.addShip()`
- **Game Server - Navigation Handler** (section 5.2): Looks up ships via `ShipRegistry.getShip(id)`
- **Game Server - Physics Engine** (section 5.2): Iterates all ships via `ShipRegistry.getAllShips()`

**Why This Matters**:
- **Performance Optimization**: O(1) hash lookup vs O(n) array search; critical for 10 Hz tick cycle (section 1.2 real-time responsiveness goal)
- **Lazy Caching**: Only rebuilds array when dirty flag set; avoids repeated conversions
- **Event-Driven Updates**: Registry emits events enabling observers to react to entity changes
- **Centralized Entity Lifecycle**: Single point for entity creation, lookup, and destruction

**Anti-Patterns to Avoid**:
- ❌ **Array-Only Storage**: Using only arrays forces O(n) lookup; unacceptable for real-time 10 Hz tick cycle
- ❌ **Eager List Rebuilding**: Rebuilding list on every insertion destroys performance; lazy caching essential
- ❌ **Distributed Entity Management**: Multiple entity storage locations creates synchronization bugs and inconsistent state

## 8.3 Action Queue with State Machine Pattern

The system uses **command objects queued for deferred execution** with state tracking, lifecycle management, and support for singleton actions (aborting previous of same type)[^action1].

[^action1]: Action pattern implemented in apps/game-server/src/app/src/action/ directory; ActionQueue, ActionManager, Accelerate, Turn

**Key Pattern**: Actions are **command objects** with lifecycle hooks (`update()`, `burnFuel()`) that execute over multiple game ticks (10 Hz), supporting long-running operations like ship acceleration and turning.

**Code Example**[^action2]:

[^action2]: apps/game-server/src/app/src/action/action.ts lines 10-50 define base Action; accelerate.ts and turn.ts implement concrete actions; actionManager.ts orchestrates

```typescript
// Base action with lifecycle hooks
export abstract class Action {
  public id: number;
  public type: string;
  public finished = false;
  public aborted = false;
  public singleton = false;  // Prevents duplicate actions
  protected ship: Ship;
  protected _burnRate = 0;

  constructor(opts: ActionOptions) {
    this.ship = opts.ship;
    this.id = opts.id;
    this.type = opts.type;
    this.singleton = opts.singleton || false;
  }

  // State machine tick: called every 100ms
  abstract update(): void;

  // Resource management: burn fuel based on elapsed time
  burnFuel(seconds: number) {
    let energy = this.ship.getEnergy();
    energy = energy - seconds * this._burnRate;
    if (energy < 0) energy = 0;
    this.ship.setEnergy(energy);
  }
}

// Concrete action: Accelerate ship to target speed
export class Accelerate extends Action {
  protected targetSpeed: number;
  protected time: number;

  constructor(opts: ActionOptions) {
    opts.type = 'accelerate';
    opts.singleton = true;  // Only one accelerate per ship
    super(opts);
    this.targetSpeed = opts.targetSpeed;
    this._burnRate = 3;  // Energy per second
    this.time = Date.now();
  }

  update() {
    const seconds = (Date.now() - this.time) / 1000;

    if (!this.ship.getWarp()) {
      this.burnFuel(seconds);

      if (this.ship.getEnergy() > 0) {
        this.accelerate(seconds);
      } else {
        this.finished = true;  // Out of energy
      }
    }

    this.time = Date.now();
  }

  accelerate(seconds: number) {
    const currentSpeed = this.ship.getVelocity();
    const diff = this.targetSpeed - currentSpeed;

    if (Math.abs(diff) < 0.1) {
      this.ship.setVelocity(this.targetSpeed);
      this.finished = true;
    } else {
      const newSpeed = currentSpeed + (diff * 0.1 * seconds);
      this.ship.setVelocity(newSpeed);
    }
  }
}

// Action queue: FIFO with capacity limit
export class ActionQueue {
  _store: Action[] = [];
  limit = 1000;

  push(val: Action): boolean {
    if (this._store.length <= this.limit) {
      this._store.push(val);
      return true;
    }
    return false;  // Queue full
  }

  pop(): Action | undefined {
    return this._store.shift();
  }

  length(): number {
    return this._store.length;
  }
}

// Action manager: Orchestrates action execution
export class ActionManager {
  protected actionMap: Record<string, Record<number, Action>> = {};
  protected actionQueue: ActionQueue = new ActionQueue();

  addAction(action: Action): boolean {
    // Singleton pattern: abort previous action of same type
    if (action.singleton) {
      this.abortAction(action.type, action.id);
    }

    // Register action for lookup
    if (!this.actionMap[action.type]) {
      this.actionMap[action.type] = {};
    }
    this.actionMap[action.type][action.id] = action;

    // Queue for execution
    return this.actionQueue.push(action);
  }

  abortAction(type: string, id: number) {
    if (this.actionMap[type] && this.actionMap[type][id]) {
      this.actionMap[type][id].aborted = true;
      delete this.actionMap[type][id];
    }
  }

  // Called every game tick (100ms)
  update() {
    const queueLength = this.actionQueue.length();

    for (let i = 0; i < queueLength; i++) {
      const action = this.actionQueue.pop();

      if (!action || action.aborted) {
        continue;
      }

      action.update();  // Execute one tick

      if (!action.finished) {
        this.actionQueue.push(action);  // Re-queue for next tick
      } else {
        // Clean up completed action
        delete this.actionMap[action.type][action.id];
      }
    }
  }
}

// Game loop integration
export function run() {
  const gameActionManager = new ActionManager();

  setInterval(() => {
    gameActionManager.update();  // Process all pending actions
    moveShips();  // Apply physics simulation
    sendUpdates();  // Broadcast state to clients
  }, 100);  // 10 Hz tick rate
}
```

**Action Types**[^action3]:
- **Accelerate**: Gradually change ship velocity to target speed over time
- **Turn**: Rotate ship orientation matrix toward target heading
- **SetWarp**: Enable/disable faster-than-light travel mode

[^action3]: Concrete action implementations in apps/game-server/src/app/src/action/accelerate.ts, turn.ts; warp handling in Ship model

**Building Blocks Using This Pattern**:
- **Game Server - World Server** (section 5.2): Manages action queue and executes actions every tick
- **Game Server - Navigation Handler** (section 5.2): Queues navigation actions (turn, accelerate)
- **Game Server - Timer/Tick** (section 5.2): Calls `actionManager.update()` every 100ms
- **Game Server - Action System** (section 5.2): Coordinates action lifecycle

**Why This Matters**:
- **Deferred Execution**: Commands execute asynchronously over multiple ticks; decouples request from execution
- **Singleton Pattern**: Prevents conflicting actions (can't accelerate to two speeds simultaneously)
- **Cancelable Operations**: Actions can be aborted mid-execution (e.g., emergency stop)
- **Resource Management**: Built-in energy/fuel burn tracking for game balance
- **Time-Based Simulation**: Supports realistic physics (acceleration takes time, not instant)

**Anti-Patterns to Avoid**:
- ❌ **Immediate Execution**: Executing commands synchronously blocks game loop; must queue for deferred execution
- ❌ **Allowing Duplicate Actions**: Multiple conflicting accelerations create undefined behavior; singleton pattern required
- ❌ **No Abort Mechanism**: Actions must be cancelable for responsive gameplay (emergency stops, collisions)

## 8.4 Redux Middleware with WebSocket Integration

The frontend uses **Redux Toolkit state management** with **custom middleware** handling WebSocket connection lifecycle and async request/response messaging[^redux1].

[^redux1]: Redux implementation in apps/starship-mayflower-frontend/src/app/store/; store.ts, game.slice.ts, auth.slice.ts, websocketMiddleware.ts, client.ts

**Key Pattern**: Redux middleware intercepts actions to manage WebSocket lifecycle (connect, disconnect) and translates async WebSocket messages into Redux actions, enabling **promise-based client calls** with request/response correlation.

**Code Example**[^redux2]:

[^redux2]: apps/starship-mayflower-frontend/src/app/store/store.ts lines 15-35 configure store; websocketMiddleware.ts lines 20-80 implement middleware; client.ts lines 40-100 implement request tracking

```typescript
// Slice defines state shape and reducers
export const gameSlice = createSlice({
  name: GAME_FEATURE_KEY,
  initialState: {
    connected: false,
    connectionError: false,
    ships: [],
    currentShip: null,
  },
  reducers: {
    connected: (state) => {
      state.connected = true;
      state.connectionError = false;
    },
    connectionError: (state) => {
      state.connected = false;
      state.connectionError = true;
    },
    updateShips: (state, action) => {
      state.ships = action.payload;
    },
  },
});

// Selectors for component access
export const selectConnected = createSelector(
  (state: RootState) => getGameState(state).connected,
  (connected) => connected
);

export const selectShips = createSelector(
  (state: RootState) => getGameState(state).ships,
  (ships) => ships
);

// Store configuration with middleware
export const store = configureStore({
  reducer: {
    [GAME_FEATURE_KEY]: gameReducer,
    [AUTH_FEATURE_KEY]: authReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware();
    middleware.push(GameMiddleware);
    return middleware;
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Middleware manages WebSocket lifecycle
export const GameMiddleware: Middleware<{}, RootState> =
  (storeApi) => (next) => (action) => {

  switch (action.type) {
    case 'WS_CONNECT':
      client = new GameServerClient();
      client.connect();

      client.on('open', () => {
        storeApi.dispatch(gameSlice.actions.connected());
      });

      client.on('connectionError', () => {
        storeApi.dispatch(gameSlice.actions.connectionError());
      });

      client.on('message', (msg: Record<string, unknown>) => {
        // Dispatch incoming message as Redux action
        storeApi.dispatch({
          type: msg.event as string,
          payload: msg.data,
        });
      });
      break;

    case 'WS_DISCONNECT':
      client?.disconnect();
      break;

    case 'NEW_MESSAGE':
      // Send message and wait for response (promise-based)
      client?.call(action.msg).then((response) => {
        storeApi.dispatch({
          type: 'MESSAGE_RESPONSE',
          payload: response,
        });
      });
      break;

    default:
      return next(action);
  }
};

// Client handles WebSocket with request/response correlation
export class GameServerClient extends EventEmitter {
  private client: WebSocket | null = null;
  private calls: Record<string, Callbacks> = {};

  connect() {
    this.client = new WebSocket('ws://localhost:3010');

    this.client.onopen = () => {
      this.emit('open');
    };

    this.client.onerror = () => {
      this.emit('connectionError');
    };

    this.client.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this.handleMessage(msg);
    };
  }

  // Promise-based call with UUID correlation
  call(message: Record<string, unknown>): Promise<Record<string, unknown>> {
    const promise = new Promise<Record<string, unknown>>((resolve, reject) => {
      message.requestId = uuidv4();  // Generate correlation ID
      this.client!.send(JSON.stringify(message));

      // Store promise callbacks for later resolution
      this.calls[message.requestId as string] = { resolve, reject };
    });

    return promise;
  }

  handleMessage(msg: Record<string, unknown>) {
    // Check if this is a response to a pending call
    if (msg.requestId && this.calls[msg.requestId as string]) {
      const funcs = this.calls[msg.requestId as string];
      funcs.resolve(msg);  // Resolve promise
      delete this.calls[msg.requestId as string];
    } else {
      // Broadcast message (not a response)
      this.emit('message', msg);
    }
  }
}

// Component usage
export const App: FC = () => {
  const dispatch = useDispatch();
  const connected = useSelector(selectConnected);

  useEffect(() => {
    dispatch({ type: 'WS_CONNECT' });  // Middleware handles connection
  }, [dispatch]);

  const sendCommand = async () => {
    dispatch({
      type: 'NEW_MESSAGE',
      msg: { handler: 'navigation', method: 'setImpulse', payload: { speed: 0.5 } },
    });
  };

  return connected ? <Game /> : <Connecting />;
};
```

**Redux Store Structure**[^redux3]:
- **game.slice**: Connection state, ships, current ship, world state
- **auth.slice**: Authentication state, username, player ID

[^redux3]: apps/starship-mayflower-frontend/src/app/store/game.slice.ts defines game state; auth.slice.ts defines auth state

**Building Blocks Using This Pattern**:
- **Frontend SPA** (section 5.3): All React components access state via Redux selectors
- **Login Page** (section 5.3): Dispatches auth actions
- **Lobby Page** (section 5.3): Dispatches ship creation and station assignment actions
- **WebSocket Middleware** (section 5.3): Manages connection lifecycle

**Why This Matters**:
- **Predictable State Management**: Redux ensures single source of truth for application state (supports maintainability quality goal from section 1.2)
- **Async-Aware Middleware**: Handles WebSocket lifecycle as first-class citizen in Redux flow
- **Request/Response Correlation**: UUID-based tracking enables promise-based async calls
- **Decoupled from Transport**: Easy to swap WebSocket for other protocols without changing components
- **Time-Travel Debugging**: Redux DevTools provides visibility into all state changes

**Anti-Patterns to Avoid**:
- ❌ **Component-Level WebSocket**: Managing WebSocket in components creates inconsistent connection state; middleware centralizes lifecycle
- ❌ **Callback Hell**: Without promise-based correlation, async calls become nested callback chains
- ❌ **Direct State Mutation**: Mutating Redux state directly breaks time-travel debugging; use reducers

## 8.5 Channel-Based Broadcasting Pattern

The system uses **hierarchical channel abstraction** for efficient multi-client message broadcasting, with channels at global, lobby, and ship-specific scopes[^channel1].

[^channel1]: Channel pattern implemented in libs/game-server-lib/src/lib/Channel.ts (WebSocket channels) and apps/game-server/src/app/src/channel.ts (Pinus channels)

**Key Pattern**: Channels provide **scope-based broadcasting** (global, lobby, ship) where clients automatically subscribe to relevant channels, and state updates only broadcast to interested clients.

**Code Example**[^channel2]:

[^channel2]: libs/game-server-lib/src/lib/Channel.ts lines 20-60 implement WebSocket channels; apps/game-server/src/app/src/channel.ts lines 30-80 implement Pinus integration

```typescript
// Game-server-lib: WebSocket channel abstraction
export class Channel {
  sessions: Session[] = [];
  channels: Record<ChannelName, Session[]> = {
    [CHANNEL_ALL]: [],
    [CHANNEL_LOBBY]: [],
  };

  send(channel: ChannelName, message: Record<string, unknown>) {
    this.sessionsForChannel(channel).forEach((session) => {
      session.socket.send(JSON.stringify(message));
    });
  }

  sendToAll(message: Record<string, unknown>) {
    this.send(CHANNEL_ALL, message);
  }

  addSession(session: Session) {
    this.sessions.push(session);
    this.channels[CHANNEL_ALL].push(session);
  }

  addSessionToChannel(session: Session, channel: ChannelName) {
    if (!this.channels[channel]) {
      this.channels[channel] = [];
    }
    this.channels[channel].push(session);
  }

  sessionsForChannel(channel: ChannelName): Session[] {
    return this.channels[channel] || [];
  }
}

// Game server: Pinus channel integration with hierarchical scopes
export class Channel {
  pushToShip(ship: Ship, route: string, msg: any) {
    const channel = this.getShipChannel(ship);
    if (channel) {
      channel.pushMessage(route, msg);  // Async broadcast to ship crew
    }
  }

  pushToLobby(route: string, msg: any) {
    const channel = this.getLobbyChannel();
    if (channel) {
      channel.pushMessage(route, msg);  // Broadcast to all lobby players
    }
  }

  pushToGlobal(route: string, msg: any) {
    const channelService = pinus.app.get('channelService');
    const channel = channelService.getChannel('global', true);
    channel.pushMessage(route, msg);  // Broadcast to all connected clients
  }

  getShipChannel(ship: Ship): PinusChannel {
    const channelService = pinus.app.get('channelService');
    return channelService.getChannel('ship-' + ship.getId(), true);
  }

  getLobbyChannel(): PinusChannel {
    const channelService = pinus.app.get('channelService');
    return channelService.getChannel('lobby', true);
  }

  addPlayerToShip(player: Player, ship: Ship) {
    const channel = this.getShipChannel(ship);
    channel.add(`${player.getId()}`, player.getServerId());

    // Notify ship crew of new player
    channel.pushMessage('PlayerJoined', {
      playerId: player.getId(),
      playername: player.getName(),
      station: player.getStation(),
    });
  }

  addPlayerToLobby(player: Player) {
    const channel = this.getLobbyChannel();
    channel.add(`${player.getId()}`, player.getServerId());

    // Notify lobby of new player
    channel.pushMessage('PlayerAdded', player.serialize());
  }
}

// Usage in game initialization
export function sendUpdates() {
  // Send ship-specific updates
  shipRegistry.getAllShips().forEach((ship) => {
    channel.pushToShip(ship, 'ShipUpdate', ship.serialize());
  });

  // Send global updates (all ships for map view)
  const ships = shipRegistry.getAllShips().map((ship) => {
    return ship.serializeMapData();
  });
  channel.pushToGlobal('GlobalUpdate', { ships: ships });
}

export function moveShip(ship: Ship) {
  moveShipPhysics(ship, seconds);
  ship.setLastMove(Date.now());

  // Only broadcast to crew of this ship
  channel.pushToShip(ship, 'ShipMoved', {
    position: ship.getPosition().elements,
    velocity: ship.getVelocity(),
    heading: ship.getHeading(),
  });
}
```

**Channel Hierarchy**[^channel3]:
- **Global**: All connected clients (world state, all ships)
- **Lobby**: Players not yet assigned to ships (ship list, player list)
- **Ship-specific**: Crew of specific ship (ship state, station assignments)

[^channel3]: Channel scopes defined in game logic; pushToGlobal for world state, pushToLobby for lobby, pushToShip for ship-specific

**Building Blocks Using This Pattern**:
- **Game Server - Connector Server** (section 5.2): Routes channel messages to connected clients
- **Game Server - World Server** (section 5.2): Publishes state updates to appropriate channels
- **Game Server - Lobby Handler** (section 5.2): Broadcasts lobby changes via `pushToLobby()`
- **Game Server - Game Handler** (section 5.2): Broadcasts world updates via `pushToGlobal()`

**Why This Matters**:
- **Efficient Broadcast**: Only sends to relevant clients; ship updates don't spam entire server (supports network efficiency quality goal from section 1.2)
- **Hierarchical Scoping**: Global/lobby/ship channels match game domain model, preventing inappropriate information leakage
- **Automatic Subscription**: Channels auto-create and manage membership, simplifying client lifecycle
- **Decouples State Changes from Delivery**: Handlers don't need to know about connected clients, enabling independent evolution

**Anti-Patterns to Avoid**:
- ❌ **Broadcast Everything to Everyone**: Sending all updates to all clients wastes bandwidth and leaks game state (e.g., enemy positions)
- ❌ **Manual Client Tracking**: Tracking which clients need which updates creates complex, error-prone code; channels automate this
- ❌ **Tight Coupling to Clients**: Handlers knowing about specific clients prevents independent scaling of connector and world servers

## 8.6 Pinus RPC for Inter-Server Communication

The system uses **Pinus framework RPC** for transparent remote procedure calls between distributed game servers (connector and world), with session-based routing and binary protocol compression[^pinus1].

[^pinus1]: Pinus RPC implemented in apps/game-server/src/main.ts configuration and apps/game-server/src/app/servers/world/remote/ RPC handlers

**Key Pattern**: Connector servers handle client connections while world servers manage game state, communicating via **transparent RPC** that looks like local function calls but executes on remote servers.

**Code Example**[^pinus2]:

[^pinus2]: apps/game-server/src/main.ts lines 10-20 configure Pinus; servers/connector/handler/entry.ts lines 30-50 show RPC calls; servers/world/remote/player.ts defines remote functions

```typescript
// Pinus app initialization with binary protocol
const app = pinus.createApp({ base: __dirname });
app.set('name', 'Starship Mayflower');

app.configure('production|development', 'connector', function () {
  app.set('connectorConfig', {
    connector: pinus.connectors.hybridconnector,
    heartbeat: 3,  // 3-second heartbeat to detect dead connections
    useDict: true,  // Dictionary compression
    useProtobuf: true,  // Binary protocol (protobuf)
  });
});

app.start();

// Server topology configuration (servers.json)
{
  "development": {
    "connector": [{
      "id": "connector-server-1",
      "host": "127.0.0.1",
      "port": 3150,  // Internal RPC port
      "clientPort": 3010,  // Client WebSocket port
      "frontend": true
    }],
    "world": [{
      "id": "world-server-1",
      "host": "127.0.0.1",
      "port": 3151  // RPC port
    }]
  }
}

// Connector handler: Entry point for client connections
export default function (app) {
  return new Handler(app);
}

class Handler {
  entry(msg, session, next) {
    const playerId = parseInt(this.serverId + id, 10);

    // Bind session to player ID
    session.bind(playerId);
    session.set('playerId', playerId);
    session.set('playername', msg.username);

    // Register disconnect handler with RPC call
    session.on('closed', (app, session, reason) => {
      // Transparent RPC call to world server
      app.rpc.world.player.playerLeave(
        session,  // Session context for routing
        { playerId: session.get('playerId') },
        null  // Callback (null for fire-and-forget)
      );
    });

    next(null, { code: 'OK', payload: playerId });
  }
}

// World remote: RPC handler invoked by connector
export function playerLeave(args) {
  const playerId = args.playerId;
  const shipRegistry = getShipRegistry();

  // Remove player from ship and world state
  const ship = shipRegistry.getShipByPlayer(playerId);
  if (ship) {
    const station = ship.getStationByPlayer(playerId);
    ship.removePlayer(station);

    // Broadcast to ship crew
    channel.pushToShip(ship, 'PlayerLeft', {
      playerId: playerId,
      station: station,
    });
  }

  shipRegistry.removePlayer(playerId);
}

// RPC call from navigation handler
export function handleTurn(msg, session, next) {
  const playerId = session.get('playerId');
  const shipId = session.get('shipId');

  // RPC call to world server (looks like local function call)
  this.app.rpc.world.navigation.turn(
    session,
    { shipId: shipId, heading: msg.heading },
    (err, response) => {
      next(err, response);
    }
  );
}

// World remote: Navigation RPC handler
export function turn(args, callback) {
  const ship = getShipRegistry().getShip(args.shipId);
  const action = new Turn({
    ship: ship,
    heading: args.heading,
  });

  const success = getActionManager().addAction(action);
  callback(null, { success: success });
}
```

**RPC Communication Flow**[^pinus3]:
1. Client connects to **Connector Server** (port 3010)
2. Connector authenticates and binds session
3. Client sends game command to Connector
4. Connector makes **RPC call** to World Server (port 3151)
5. World Server executes game logic and returns response
6. Connector sends response back to client

[^pinus3]: RPC flow documented in section 6 (Runtime View); connector handles client I/O while world manages game state

**Building Blocks Using This Pattern**:
- **Game Server - Connector Server** (section 5.2): Handles client connections, routes to world via RPC
- **Game Server - World Server** (section 5.2): Executes game logic, responds to RPC calls
- **Game Server - Entry Handler** (section 5.2): Initiates RPC calls for authentication
- **Game Server - Navigation Handler** (section 5.2): RPC calls for ship commands

**Why This Matters**:
- **Transparent RPC**: Remote calls look like local function calls; framework handles serialization/transport, reducing distributed systems complexity
- **Session-Based Routing**: RPC calls automatically route through client's session, maintaining context across server boundaries
- **Binary Protocol**: Dictionary + protobuf compression reduces bandwidth by ~70% vs JSON (supports network efficiency quality goal from section 1.2)
- **Server Separation**: Connector handles I/O (horizontally scalable), world manages state (vertically scalable), enabling independent scaling strategies
- **Environment Configuration**: Easy switching between dev/prod server topologies via JSON configuration

**Anti-Patterns to Avoid**:
- ❌ **REST APIs Between Servers**: HTTP overhead unnecessary for internal RPC; binary protocol 70% more efficient
- ❌ **Monolithic Server**: Combining connector and world prevents independent scaling; I/O-bound and CPU-bound needs differ
- ❌ **Manual Serialization**: Hand-coding serialization creates bugs; Pinus handles protobuf automatically

## 8.7 Component Composition with Three.js Rendering

The frontend uses **React components wrapping Three.js rendering systems**, with imperative DOM manipulation inside React lifecycle hooks for 3D visualizations[^threejs1].

[^threejs1]: Three.js integration in libs/map/src/lib/map.tsx (Map component), libs/map/src/lib/StarMap.ts (Three.js scene), libs/map/src/lib/MapObjectActor.ts (ship rendering)

**Key Pattern**: React components manage lifecycle and props, while Three.js handles imperative 3D rendering via `useRef` and `useEffect` hooks.

**Code Example**[^threejs2]:

[^threejs2]: libs/map/src/lib/map.tsx lines 15-60 implement React wrapper; StarMap.ts lines 20-100 manage Three.js scene; MapObjectActor.ts lines 30-80 render ships

```typescript
// React component wraps Three.js scene lifecycle
export const Map: FC<MapProps> = ({ ship, mapObjects }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [starMap, setStarMap] = useState<StarMap>(new StarMap());

  // Initialize Three.js scene on mount
  useEffect(() => {
    if (!mountRef.current) return;

    // Create Three.js renderer
    starMap.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(starMap.getDomElement());

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      starMap.render();  // Three.js render call
    };
    animate();

    // Cleanup on unmount
    return () => {
      mountRef.current?.removeChild(starMap.getDomElement());
    };
  }, [starMap]);

  // Update Three.js objects when props change
  useEffect(() => {
    starMap.updateShip(ship);
    starMap.updateOtherships(mapObjects);
    starMap.scaleModels();
  }, [ship, mapObjects, starMap]);

  return <div ref={mountRef}></div>;
};

// StarMap: Three.js scene management
export class StarMap {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ship: MapObjectActor | null = null;
  private otherships: MapObjectActor[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000000);
    this.renderer = new THREE.WebGLRenderer();

    // Add grid for spatial reference
    const grid = new Grid(20000, 1000);
    grid.setScene(this.scene);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  updateShip(shipData: SerializedShip) {
    if (!this.ship) {
      this.ship = new MapObjectActor('#ff0000', { orientation: true });
      this.ship.setScene(this.scene);
    }

    // Update ship position from domain model
    const pos = shipData.position;
    this.ship.setPosition(pos[0], pos[1], pos[2]);

    // Update camera to follow ship
    this.camera.position.set(pos[0], pos[1] + 1000, pos[2] + 500);
    this.camera.lookAt(pos[0], pos[1], pos[2]);
  }

  updateOtherships(mapObjects: MapData[]) {
    // Remove old ships
    this.otherships.forEach((obj) => obj.removeFromScene(this.scene));
    this.otherships = [];

    // Add new ships
    mapObjects.forEach((data) => {
      const ship = new MapObjectActor('#00ff00', { orientation: false });
      ship.setPosition(data.position[0], data.position[1], data.position[2]);
      ship.setScene(this.scene);
      this.otherships.push(ship);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}

// MapObjectActor: Ship rendering with orientation arrows
export class MapObjectActor extends MapObjectBase {
  protected headingArrow: THREE.ArrowHelper | null = null;
  protected shipArrowX: THREE.ArrowHelper | null = null;
  protected shipArrowY: THREE.ArrowHelper | null = null;

  constructor(color: string, options: MapObjectOptions) {
    super(options);

    // Create ship mesh (cube)
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: color })
    );

    // Add orientation arrows if requested
    if (options.orientation) {
      this.headingArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),  // Forward direction
        new THREE.Vector3(0, 0, 0),  // Origin
        10,  // Length
        'blue'  // Color
      );

      this.shipArrowX = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),  // Right direction
        new THREE.Vector3(0, 0, 0),
        5,
        'red'
      );
    }
  }

  setScene(scene: THREE.Scene) {
    super.setScene(scene);

    if (this.options.orientation) {
      scene.add(this.headingArrow!);
      scene.add(this.shipArrowX!);
    }
  }

  setPosition(x: number, y: number, z: number) {
    super.setPosition(x, y, z);

    // Update arrow positions to match ship
    if (this.options.orientation) {
      this.headingArrow!.position.set(x, y, z);
      this.shipArrowX!.position.set(x, y, z);
    }
  }
}
```

**Similar Pattern: Compass Component**[^threejs3]:

[^threejs3]: libs/compass/src/compass.tsx implements same pattern with Paper.js for 2D canvas rendering

```typescript
// Compass component: React wrapper for Paper.js 2D rendering
export const Compass: FC<CompassProps> = ({ pitch, yaw }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [compass] = useState(new CompassLib());

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.appendChild(compass.getDomElement());
    compass.draw();
  }, [compass]);

  useEffect(() => {
    compass.pitch(pitch);
    compass.yaw(yaw);
    compass.draw();
  }, [compass, pitch, yaw]);

  return <div ref={mountRef}></div>;
};
```

**Building Blocks Using This Pattern**:
- **Map Library** (section 5.5): Three.js 3D rendering for star map visualization
- **Compass Library** (section 5.5): Paper.js 2D rendering for ship orientation display
- **Frontend SPA** (section 5.3): Consumes Map and Compass components

**Why This Matters**:
- **React/Three.js Boundary**: Clean separation between React declarative state and Three.js imperative rendering prevents framework conflicts
- **Imperative DOM from React**: Three.js scene imperatively managed inside React lifecycle hooks, enabling complex 3D without React DOM
- **Ref-Based Lifecycle**: `useRef` manages DOM mounting point, avoiding duplicate renders and memory leaks
- **Prop-Driven Updates**: Three.js objects updated when props change, enabling reactive visualization without Redux integration
- **Reusable Visualization Components**: Map and Compass are library-level abstractions (supports maintainability quality goal from section 1.2)

**Anti-Patterns to Avoid**:
- ❌ **React-Managed Three.js**: Trying to manage Three.js objects as React state causes performance issues; use refs
- ❌ **Missing Cleanup**: Not removing Three.js DOM elements on unmount creates memory leaks
- ❌ **Prop Changes Without Updates**: Ignoring prop changes leaves Three.js scene stale; useEffect ensures synchronization

## 8.8 Nx Monorepo with Module Boundary Enforcement

The system uses **Nx monorepo** structure with **ESLint-enforced module boundaries** to maintain architectural discipline and prevent unauthorized cross-module dependencies[^nx1].

[^nx1]: Nx configuration in nx.json, workspace.json; module boundaries enforced via .eslintrc.json @nrwl/nx/enforce-module-boundaries rule

**Key Pattern**: TypeScript path mappings provide clean imports (`@starship-mayflower/util`) while ESLint rules prevent architectural violations (libraries can't import from applications).

**Code Example**[^nx2]:

[^nx2]: nx.json lines 16-36 define target defaults; workspace.json lines 3-14 define projects; tsconfig.base.json lines 17-24 define path mappings

```typescript
// tsconfig.base.json: TypeScript path mappings for clean imports
{
  "compilerOptions": {
    "paths": {
      "@starship-mayflower/util": ["libs/util/src/index.ts"],
      "@starship-mayflower/compass": ["libs/compass/src/index.ts"],
      "@starship-mayflower/map": ["libs/map/src/index.ts"],
      "@starship-mayflower/game-server-lib": ["libs/game-server-lib/src/index.ts"]
    }
  }
}

// Clean import in game server
import { Ship, ObjectInSpace } from '@starship-mayflower/util';

// Clean import in frontend
import { Compass } from '@starship-mayflower/compass';
import { Map } from '@starship-mayflower/map';

// ESLint configuration: Module boundary enforcement
{
  "rules": {
    "@nrwl/nx/enforce-module-boundaries": [
      "error",
      {
        "allow": [],
        "depConstraints": [
          {
            "sourceTag": "type:app",
            "onlyDependOnLibsWithTags": ["type:lib"]
          },
          {
            "sourceTag": "type:lib",
            "onlyDependOnLibsWithTags": ["type:lib"]
          }
        ]
      }
    ]
  }
}

// nx.json: Build caching and target defaults
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production"],
      "cache": true
    }
  }
}

// workspace.json: Project definitions
{
  "projects": {
    "compass": "libs/compass",
    "game-server": "apps/game-server",
    "starship-mayflower-frontend": "apps/starship-mayflower-frontend",
    "util": "libs/util"
  }
}
```

**Monorepo Structure**[^nx3]:
```
/
├── apps/
│   ├── game-server/               # Pinus game server (Node.js)
│   ├── game-server-next/          # Alternative implementation
│   ├── starship-mayflower-frontend/  # React SPA
│   ├── compass-e2e/               # Compass E2E tests
│   ├── map-e2e/                   # Map E2E tests
│   └── starship-mayflower-frontend-e2e/  # Frontend E2E tests
├── libs/
│   ├── compass/                   # 2D compass component (Paper.js)
│   ├── map/                       # 3D star map component (Three.js)
│   ├── util/                      # Shared domain models (isomorphic)
│   └── game-server-lib/           # Server utilities (Pinus helpers)
├── nx.json                        # Nx configuration
├── workspace.json                 # Project definitions
└── tsconfig.base.json             # TypeScript path mappings
```

[^nx3]: Monorepo structure defined in workspace.json; apps/ contains deployable applications, libs/ contains reusable libraries

**Module Boundary Rules**[^nx4]:
- **Applications CANNOT import from other applications**: Prevents tight coupling
- **Libraries CANNOT import from applications**: Ensures library reusability
- **Libraries CAN import from other libraries**: Enables layered library architecture
- **Compass/Map libraries depend only on Util library**: Self-contained visualization components

[^nx4]: Module boundaries enforced by .eslintrc.json @nrwl/nx/enforce-module-boundaries rule; violations fail CI build

**Building Blocks Using This Pattern**:
- **All building blocks** (section 5): Organized as Nx projects with enforced boundaries
- **Frontend SPA** (section 5.3): Imports from compass, map, util libraries
- **Game Server** (section 5.2): Imports from util, game-server-lib libraries
- **Libraries** (section 5.4, 5.5): Self-contained with minimal dependencies

**Why This Matters**:
- **Architectural Discipline**: Compile-time enforcement prevents architectural erosion (addresses technical debt constraint from section 2); violations fail build
- **Clean Imports**: Path mappings eliminate brittle relative paths (`../../../libs/util`), making code relocatable
- **Build Caching**: Nx caches task results; rebuild only affected projects (supports developer experience quality goal from section 1.2), improving build time by 5-10x
- **Dependency Graph**: Nx visualizes project dependencies (`nx graph`); makes architecture visible to all developers
- **Refactoring Safety**: Path mappings enable safe refactoring without updating import paths across hundreds of files

**Anti-Patterns to Avoid**:
- ❌ **Application Importing Application**: Apps importing from other apps creates tight coupling; use shared libraries
- ❌ **Library Importing Application**: Makes libraries non-reusable; libraries must only depend on other libraries
- ❌ **Relative Path Imports**: `../../../libs/util` is brittle; use `@starship-mayflower/util` path mappings
- ❌ **Disabling Boundary Checks**: Bypassing ESLint rules defeats architectural enforcement; fix violations instead

**Pattern Alternatives Considered**:
- **Polyrepo**: Each library in separate repository would eliminate module boundary issues but create versioning and coordination overhead
- **No Enforcement**: Relying on code review alone allows architectural erosion; compile-time enforcement is superior

> **Cross-references:**
> - **Section 1.2** (Quality Goals) defines quality goals supported by these patterns (real-time responsiveness, maintainability, developer experience)
> - **Section 2** (Constraints) documents Nx monorepo and TypeScript constraints
> - **Section 4** (Solution Strategy) explains rationale for isomorphic models and monorepo structure
> - **Section 5** (Building Block View) describes the building blocks that use these crosscutting concepts
> - **Section 6** (Runtime View) illustrates runtime behavior of these patterns (RPC, action queue, channels)
> - **Section 7** (Deployment View) documents how these patterns are deployed (Nx build system, configuration management)

[^domain1]: Domain models in libs/util/src/lib/model/; imported by both apps/game-server and apps/starship-mayflower-frontend
[^domain2]: libs/util/src/lib/model/ObjectInSpace.ts lines 45-90 define base serialization; Ship.ts lines 120-150 override for ship-specific data
[^domain3]: libs/util/src/lib/model/ObjectInSpace.ts lines 10-45 define base class with position, velocity, heading, orientation
[^domain4]: libs/util/src/lib/model/Ship.ts lines 15-40 define Ship class with stations, energy, warp
[^domain5]: libs/util/src/lib/model/Ship.ts lines 5-10 define Station enum: 'helm', 'weapons', 'comm', 'science', 'engineering'
[^domain6]: apps/game-server/src/app/src/models/Player.ts lines 10-30 define Player wrapping session with ship/station assignment
[^domain7]: libs/util/src/lib/model/ObjectInSpace.ts lines 60-70 define MapData interface for visualization
[^registry1]: Registry pattern implemented in libs/util/src/lib/model/ObjectInSpaceRegistry.ts and apps/game-server/src/app/src/world/ShipRegistry.ts
[^registry2]: libs/util/src/lib/model/ObjectInSpaceRegistry.ts lines 10-80 implement base registry; ShipRegistry.ts lines 15-100 specialize for game domain
[^action1]: Action pattern implemented in apps/game-server/src/app/src/action/ directory; ActionQueue, ActionManager, Accelerate, Turn
[^action2]: apps/game-server/src/app/src/action/action.ts lines 10-50 define base Action; accelerate.ts and turn.ts implement concrete actions; actionManager.ts orchestrates
[^action3]: Concrete action implementations in apps/game-server/src/app/src/action/accelerate.ts, turn.ts; warp handling in Ship model
[^redux1]: Redux implementation in apps/starship-mayflower-frontend/src/app/store/; store.ts, game.slice.ts, auth.slice.ts, websocketMiddleware.ts, client.ts
[^redux2]: apps/starship-mayflower-frontend/src/app/store/store.ts lines 15-35 configure store; websocketMiddleware.ts lines 20-80 implement middleware; client.ts lines 40-100 implement request tracking
[^redux3]: apps/starship-mayflower-frontend/src/app/store/game.slice.ts defines game state; auth.slice.ts defines auth state
[^channel1]: Channel pattern implemented in libs/game-server-lib/src/lib/Channel.ts (WebSocket channels) and apps/game-server/src/app/src/channel.ts (Pinus channels)
[^channel2]: libs/game-server-lib/src/lib/Channel.ts lines 20-60 implement WebSocket channels; apps/game-server/src/app/src/channel.ts lines 30-80 implement Pinus integration
[^channel3]: Channel scopes defined in game logic; pushToGlobal for world state, pushToLobby for lobby, pushToShip for ship-specific
[^pinus1]: Pinus RPC implemented in apps/game-server/src/main.ts configuration and apps/game-server/src/app/servers/world/remote/ RPC handlers
[^pinus2]: apps/game-server/src/main.ts lines 10-20 configure Pinus; servers/connector/handler/entry.ts lines 30-50 show RPC calls; servers/world/remote/player.ts defines remote functions
[^pinus3]: RPC flow documented in section 6 (Runtime View); connector handles client I/O while world manages game state
[^threejs1]: Three.js integration in libs/map/src/lib/map.tsx (Map component), libs/map/src/lib/StarMap.ts (Three.js scene), libs/map/src/lib/MapObjectActor.ts (ship rendering)
[^threejs2]: libs/map/src/lib/map.tsx lines 15-60 implement React wrapper; StarMap.ts lines 20-100 manage Three.js scene; MapObjectActor.ts lines 30-80 render ships
[^threejs3]: libs/compass/src/compass.tsx implements same pattern with Paper.js for 2D canvas rendering
[^nx1]: Nx configuration in nx.json, workspace.json; module boundaries enforced via .eslintrc.json @nrwl/nx/enforce-module-boundaries rule
[^nx2]: nx.json lines 16-36 define target defaults; workspace.json lines 3-14 define projects; tsconfig.base.json lines 17-24 define path mappings
[^nx3]: Monorepo structure defined in workspace.json; apps/ contains deployable applications, libs/ contains reusable libraries
[^nx4]: Module boundaries enforced by .eslintrc.json @nrwl/nx/enforce-module-boundaries rule; violations fail CI build
