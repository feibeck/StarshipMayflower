# Section 11: Risks and Technical Debt

## Introduction

This section documents identified technical risks and technical debt in the StarshipMayflower system, ordered by priority and impact. All items are supported by concrete code evidence.

**Risk vs Technical Debt**:
- **Risk**: Future problem that might occur (probability × impact)
- **Technical Debt**: Existing suboptimal solution (cost to fix vs cost of living with it)

**Relationship to Other Sections**:
- **Section 1.2**: Quality goals that risks/debt threaten
- **Section 9**: Architecture decisions documenting known trade-offs (ADR-003, ADR-004, ADR-006)
- **Section 10**: Quality requirements gaps (SEC-2, REL-1, TEST-3, MAINT-3)

**Evidence Sources**: All findings verified through codebase analysis, including file paths, line numbers, and code examples. No speculative risks included.

---

## 11.1 Technical Risks

Risks ordered by priority (probability × impact), with mitigation strategies.

### R-1: Server Crash from Unhandled Tick Cycle Exceptions [CRITICAL]

**Priority**: 🔴 **CRITICAL** (High Probability × Critical Impact)

**Description**: The 10 Hz game tick cycle has no error handling. Any unhandled exception in physics simulation, action processing, or networking crashes the entire World server, disconnecting all players and losing in-memory game state[^1].

**Probability**: High - Complex physics and player actions execute every 100ms, creating many exception opportunities

**Impact**: Critical - Complete service outage, all players disconnected, all game state lost (in-memory only per ADR-004)

**Evidence**: No try/catch blocks in tick cycle[^1]:
```typescript
// apps/game-server/src/app/src/timer.ts lines 11-15
function tick() {
  gameActionManager.update();  // No error handling
  moveShips();                  // Exception crashes server
  sendUpdates();
}
```

**Affected Building Blocks**: World Server (5.1.2), Physics System (5.1.5), Action Queue (8.3)

**Mitigation Strategies**:
1. **Immediate (Week 1)**: Wrap tick cycle in try/catch with error logging
   ```typescript
   function tick() {
     try {
       gameActionManager.update();
       moveShips();
       sendUpdates();
     } catch (error) {
       logger.error('Tick cycle error:', error);
       // Continue to next tick rather than crashing
     }
   }
   ```
2. **Short-term (Month 1)**: Add tick duration monitoring and alerting for >100ms ticks
3. **Medium-term (Quarter 1)**: Implement graceful degradation (skip failing entity, continue others)
4. **Long-term (Quarter 2)**: Add comprehensive error handling throughout physics and action systems

**Cross-Reference**: REL-1 in Section 10.2.3 (Reliability Scenarios)

---

### R-2: Hardcoded Admin Credentials in Source Control [CRITICAL]

**Priority**: 🔴 **CRITICAL** (High Probability × High Impact)

**Description**: Admin console credentials are hardcoded as plaintext in JSON files committed to version control. Anyone with repository access can authenticate as admin using default credentials (admin/admin, monitor/monitor, test/test)[^2].

**Probability**: High - Credentials visible to all repository contributors and in git history

**Impact**: High - Full administrative access to game server, ability to manipulate game state, access player data, execute admin commands

**Evidence**: Plaintext credentials in configuration[^2]:
```json
// apps/game-server/src/config/adminUser.json lines 1-22
{
  "username": "admin",
  "password": "admin"
},
{
  "username": "monitor",
  "password": "monitor"
},
{
  "username": "test",
  "password": "test"
}
```

**Affected Building Blocks**: Admin Console (5.1.4), Connector Server (5.1.2)

**Mitigation Strategies**:
1. **Immediate (Week 1)**:
   - Remove adminUser.json from repository (add to .gitignore)
   - Rotate all admin credentials immediately
   - Move credentials to environment variables
2. **Short-term (Month 1)**:
   - Implement password hashing (bcrypt, argon2)
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault, or Kubernetes Secrets)
   - Add credential validation on startup
3. **Medium-term (Quarter 1)**:
   - Implement role-based access control (RBAC)
   - Add audit logging for all admin actions
   - Enforce strong password policy (minimum length, complexity)

**Additional Finding**: Admin server token also hardcoded in adminServer.json[^3]

**Cross-Reference**: SEC-2 in Section 10.2.2 (Security Scenarios)

---

### R-3: No Transport Layer Security (Plaintext WebSocket) [HIGH]

**Priority**: 🔴 **HIGH** (Medium Probability × High Impact)

**Description**: WebSocket connections use unencrypted `ws://` protocol instead of `wss://`. All game traffic (authentication, player commands, game state) transmitted in plaintext, vulnerable to eavesdropping and man-in-the-middle attacks[^4].

**Probability**: Medium - Only affects deployments on untrusted networks (public internet)

**Impact**: High - Credential theft, session hijacking, game state manipulation, privacy violation

**Evidence**: Hardcoded plaintext WebSocket URL[^4]:
```typescript
// apps/starship-mayflower-frontend/src/app/store/client.ts line 15
this.client = new WebSocket('ws://localhost:10000');  // Unencrypted!
```

**Affected Building Blocks**: WebSocket Client (5.1.7), Connector Server (5.1.2)

**Mitigation Strategies**:
1. **Immediate (Week 1)**:
   - Document that current system is **prototype only** - not production-ready
   - Add warning in README about security limitations
2. **Short-term (Month 1)**:
   - Implement TLS/SSL with certificates (Let's Encrypt for free certificates)
   - Change protocol to `wss://` in client configuration
   - Add certificate validation
3. **Medium-term (Quarter 1)**:
   - Make WebSocket URL environment-configurable (dev: ws://, prod: wss://)
   - Implement certificate pinning for mobile clients
   - Add connection security indicators in UI

**Deployment Constraint**: Section 7 Deployment View lines 380, 462 document this as prototype-only limitation

**Cross-Reference**: SEC-3 in Section 10.2.2 (Security Scenarios)

---

### R-4: Missing Input Validation on Navigation Commands [HIGH]

**Priority**: 🔴 **HIGH** (High Probability × Medium Impact)

**Description**: Navigation handlers accept player commands (speed, heading, warp level) without validation. Malicious client can send extreme values (negative speeds, infinite acceleration, invalid headings) causing physics bugs, server crashes, or unfair advantages[^5].

**Probability**: High - WebSocket protocol allows any client to send arbitrary JSON

**Impact**: Medium - Gameplay exploits, physics simulation errors, potential denial-of-service

**Evidence**: No bounds checking on user input[^5]:
```typescript
// apps/game-server/src/app/servers/world/handler/navigation.ts

setImpulseSpeed(msg, session, next) {
  ship.setTargetImpulse(msg.targetSpeed);  // No validation!
  // Missing: type check, min/max bounds, sanitization
}

setWarpLevel(msg, session, next) {
  ship.setWarpLevel(msg.targetSpeed);  // Can client send -1000? Infinity?
  ship.setWarpSpeed(1 + 3 * (msg.targetSpeed / 100));
}

setHeading(msg, session, next) {
  ship.setTargetHeading(msg.radian);  // No validation of radian range
}
```

**Affected Building Blocks**: Navigation Handler (5.2), Ship Domain Model (5.1.8)

**Mitigation Strategies**:
1. **Immediate (Week 1)**: Add validation to all navigation handlers:
   ```typescript
   setImpulseSpeed(msg, session, next) {
     const speed = parseFloat(msg.targetSpeed);
     if (isNaN(speed) || speed < 0 || speed > MAX_IMPULSE_SPEED) {
       next(new Error('Invalid speed'), { code: 'ERR', payload: { error: 'Invalid speed' } });
       return;
     }
     ship.setTargetImpulse(speed);
   }
   ```
2. **Short-term (Month 1)**:
   - Define constants for all limits (MAX_IMPULSE_SPEED, MAX_WARP_LEVEL, etc.)
   - Add schema validation library (Joi, Yup, Zod) for message validation
   - Add rate limiting on command frequency (max 10 commands/second per player)
3. **Medium-term (Quarter 1)**:
   - Implement server-side command validation middleware
   - Add automated fuzzing tests to find validation gaps

**Related Issues**: 13 instances of missing null checks across navigation.ts, lobby.ts, game.ts[^6]

---

### R-5: Split-Brain Scenario in Distributed Architecture [MEDIUM]

**Priority**: 🟡 **MEDIUM** (Low Probability × High Impact)

**Description**: If World server crashes while Connector servers remain running, Connector servers hold stale session state. Players appear connected but cannot send commands, creating inconsistent distributed state[^7].

**Probability**: Low - Requires specific failure scenario (World crash without Connector crash)

**Impact**: High - Service appears operational but is non-functional, confusing users

**Evidence**: No health check communication between Connector and World servers. Documented in ADR-001[^7].

**Affected Building Blocks**: Connector Server (5.1.2), World Server (5.1.2), RPC Layer (5.1.6)

**Mitigation Strategies**:
1. **Short-term (Month 1)**:
   - Add health check RPC calls between Connector and World (every 5 seconds)
   - Disconnect clients if World server unreachable
2. **Medium-term (Quarter 1)**:
   - Implement automatic World server restart with health monitoring
   - Add circuit breaker pattern for RPC calls
   - Display server status to users ("World server reconnecting...")
3. **Long-term (Quarter 2)**:
   - Implement stateless Connector servers (move session state to Redis)
   - Add World server hot standby for failover

**Cross-Reference**: ADR-001 in Section 9 (Architecture Decisions)

---

### R-6: Memory Exhaustion from Unbounded Entity Growth [MEDIUM]

**Priority**: 🟡 **MEDIUM** (Medium Probability × High Impact)

**Description**: Ships and entities are added to in-memory registries but never automatically removed. Abandoned ships (disconnected players, crashed clients) remain in memory forever, eventually causing out-of-memory (OOM) crashes[^8].

**Probability**: Medium - Depends on player churn rate and uptime

**Impact**: High - Server crash, service interruption, requires manual restart

**Evidence**: No automatic entity cleanup[^8]:
```typescript
// apps/game-server/src/app/src/world/ShipRegistry.ts
registerShip(ship: Ship): void {
  this.add(ship);  // Added to Map
  this.shipsByPlayerId.set(ship.getPlayerId(), ship);
  // No TTL, no automatic removal, no memory limits
}

// Only manual removal when player explicitly calls removePlayer()
```

**Affected Building Blocks**: ShipRegistry (5.1.5), World Server (5.1.2)

**Mitigation Strategies**:
1. **Short-term (Month 1)**:
   - Add memory usage monitoring and alerting (Node.js heap size)
   - Implement manual cleanup command for admins
2. **Medium-term (Quarter 1)**:
   - Add TTL (time-to-live) for inactive entities (remove ships inactive >30 minutes)
   - Implement LRU (least-recently-used) eviction when approaching memory limits
   - Add periodic cleanup job (every 5 minutes, remove inactive entities)
3. **Long-term (Quarter 2)**:
   - Implement entity lifecycle state machine (active → idle → archived → removed)
   - Add database persistence for inactive entities (hybrid in-memory/DB approach)

**Cross-Reference**: SCALE-3 in Section 10.2.6 (Scalability Scenarios), ADR-004 in Section 9

---

### R-7: Action Queue Overflow Silently Drops Commands [MEDIUM]

**Priority**: 🟡 **MEDIUM** (Low Probability × Medium Impact)

**Description**: Action queue has 10,000 command limit. When full, new commands are silently rejected without logging or user notification. Callers in timer.ts don't check return value[^9].

**Probability**: Low - Requires sustained high command rate (>1000 commands/second)

**Impact**: Medium - Player commands ignored, poor user experience, difficult to debug

**Evidence**: Queue overflow not handled by callers[^9]:
```typescript
// apps/game-server/src/app/src/action/ActionQueue.ts lines 8-14
push(val: Action): boolean {
  if (this._store.length <= this.limit) {
    this._store.push(val);
    return true;
  }
  return false;  // Rejected but no logging!
}

// timer.ts lines 21, 34 ignore return value:
actionQueue.push(new AccelerateAction(ship, speed));  // Return value ignored
```

**Affected Building Blocks**: Action Queue (8.3), World Server (5.1.2)

**Mitigation Strategies**:
1. **Immediate (Week 1)**:
   - Log warnings when queue rejects actions
   - Add queue size monitoring and alerting
2. **Short-term (Month 1)**:
   - Check push() return value, send error response to client
   - Implement priority-based queuing (emergency actions first)
3. **Medium-term (Quarter 1)**:
   - Make queue size configurable
   - Add backpressure mechanism to slow down command processing

**Current Limit**: 10,000 actions (ActionQueue.ts line 11)

---

### R-8: Dependency on Unmaintained Sylvester.js Fork [LOW]

**Priority**: 🟢 **LOW** (Low Probability × Medium Impact)

**Description**: Vector mathematics uses Sylvester-ES6, a community fork of an abandoned 2007 library. If the fork breaks on future Node.js/TypeScript versions, migration will be costly[^10].

**Probability**: Low - Library is stable, breaking changes unlikely in near term

**Impact**: Medium - Would require rewriting all vector math if library becomes incompatible

**Evidence**: Documented in ADR-006[^10]. Sylvester-ES6 package.json shows minimal maintenance activity.

**Affected Building Blocks**: Physics System (5.1.5), Domain Models (5.1.8)

**Mitigation Strategies**:
1. **Short-term (Month 1)**: Monitor Sylvester-ES6 npm package for updates/deprecation notices
2. **Medium-term (Quarter 1)**: Evaluate migration to gl-matrix (industry standard, better maintained)
3. **Long-term (Quarter 2)**: If scaling to 1000+ entities, benchmark Sylvester vs gl-matrix performance

**Performance Impact**: Sylvester ~10-20% slower than gl-matrix (estimated), acceptable at current scale (100 entities)

**Cross-Reference**: ADR-006 in Section 9, PERF-1 (potential future bottleneck)

---

### R-9: No Disaster Recovery Plan [LOW]

**Priority**: 🟢 **LOW** (Very Low Probability × Critical Impact)

**Description**: No documented backup, restore, or disaster recovery procedures. In-memory state means no persistence, so crashes lose all game state[^11].

**Probability**: Very Low - Requires catastrophic infrastructure failure

**Impact**: Critical - Complete data loss (though acceptable for prototype per ADR-004)

**Evidence**: No backup configuration found in codebase[^11]. ADR-004 documents in-memory ephemeral state as intentional design decision.

**Affected Building Blocks**: World Server (5.1.2), All Registries (8.2)

**Mitigation Strategies**:
1. **If transitioning to production**:
   - Implement periodic state snapshots (save to S3/disk every 5 minutes)
   - Add event sourcing for game actions (replay from log)
   - Define RPO (Recovery Point Objective): 5 minutes
   - Define RTO (Recovery Time Objective): 2 minutes
2. **For prototype/demo**:
   - Document that game state is ephemeral (expected behavior)
   - Accept data loss on restart as trade-off for performance (per ADR-004)

**Design Trade-Off**: Performance over reliability (acceptable for prototype, not production)

**Cross-Reference**: ADR-004 in Section 9 (In-Memory Ephemeral State)

---

## 11.2 Technical Debt

Technical debts ordered by cost to fix vs cost of inaction.

### TD-1: Extremely Low Test Coverage (9.9%) [HIGH PRIORITY]

**Priority**: 🔴 **HIGH**

**Description**: Test coverage is only 9.9% (8 test files for 81 TypeScript source files). Critical paths completely untested: game loop, navigation handlers, lobby management, authentication[^12].

**Cost of Inaction**:
- **High regression risk**: Cannot refactor safely, changes may break production
- **Slow feature development**: Developers fear breaking existing functionality
- **Difficult debugging**: Bugs only discovered in production, not during development
- **Low confidence in releases**: No automated validation before deployment

**Cost to Fix**: Medium (3-4 weeks to reach 50% coverage, focusing on critical paths)

**Current State**:
- **Total files**: 81 TypeScript files
- **Files with tests**: 8 files (9.9% coverage)
- **Critical gaps**:
  - 0/8 game server handlers tested (navigation, lobby, game, entry)
  - 0/3 React components tested (Login, App, routes)
  - 0/1 game loop tested (timer.ts - most critical!)
  - Only 2 try/catch blocks in 23 game-server files

**Evidence**: Test files vs source files ratio analysis[^12]. Section 10.2.8 documents handler testing gap (TEST-3).

**Suggested Actions** (Prioritized by Risk):
1. **Week 1**: Add tests for tick cycle (timer.ts) - most critical path
2. **Week 2**: Add tests for navigation handlers (setImpulseSpeed, setWarpLevel, setHeading)
3. **Week 3**: Add tests for lobby handlers (joinShip, createShip, registerPlayer)
4. **Week 4**: Add tests for authentication (entry.ts, auth.ts)
5. **Month 2**: Add integration tests for full command flow (client → connector → world)
6. **Ongoing**: Enforce coverage gates in CI (require 50% minimum, block PRs below threshold)

**Testing Strategy**:
```typescript
// Example: timer.ts test
describe('Game Tick Cycle', () => {
  it('should handle physics exceptions gracefully', () => {
    const mockPhysics = jest.fn().mockImplementation(() => {
      throw new Error('Physics error');
    });
    expect(() => tick()).not.toThrow();
    expect(logger.error).toHaveBeenCalledWith('Tick cycle error:', expect.any(Error));
  });
});
```

**Affected Quality Goals**: Maintainability (1.2), Reliability (REL-1, REL-2)

**Cross-Reference**: MAINT-3, TEST-3 in Section 10 (Quality Requirements)

---

### TD-2: Abandoned Binary Protocol Implementation [MEDIUM PRIORITY]

**Priority**: 🟡 **MEDIUM**

**Description**: Binary protocol dictionaries enabled in configuration but all dictionary files are empty. System falls back to JSON encoding while maintaining scaffolding for unused binary protocol[^13].

**Cost of Inaction**:
- **Wasted bandwidth**: JSON ~40-60% larger than binary protobuf (estimated)
- **Maintenance overhead**: Must maintain empty dictionary files and unused configuration
- **Developer confusion**: Misleading configuration suggests feature is implemented
- **Missed performance opportunity**: Binary protocol would reduce network costs

**Cost to Fix**:
- **Option A (Remove)**: Low (1-2 days to remove scaffolding, set `useDict: false`)
- **Option B (Implement)**: High (2-3 weeks to populate dictionaries, test encoding/decoding)

**Current State**:
- `dictionary.json`: Empty `{}`
- `clientProtos.json`: Empty `{}`
- `serverProtos.json`: Empty `{}`
- Configuration claims binary protocol enabled:
  ```typescript
  // main.ts lines 15-16
  useDict: true,
  useProtobuf: true,
  ```

**Evidence**: Empty dictionaries documented in ADR-003[^13]

**Suggested Actions**:
1. **Decision Point**: Choose implementation strategy:
   - **If network bandwidth is NOT a concern**: Remove scaffolding, simplify to JSON-only
   - **If network bandwidth IS a concern**: Fully implement binary protocol
2. **If Removing** (Recommended for prototype):
   - Set `useDict: false, useProtobuf: false` in main.ts
   - Delete empty dictionary files
   - Remove protobuf dependencies from package.json
   - Document decision in ADR-003
3. **If Implementing**:
   - Define message schemas for all routes (lobby, navigation, game)
   - Populate dictionary.json with route/message mappings
   - Define protobuf schemas in clientProtos.json, serverProtos.json
   - Add encoding/decoding tests
   - Measure actual bandwidth savings (target: 40-60% reduction)

**Decision Criteria**: If current bandwidth costs are <$100/month, removal is more cost-effective than implementation.

**Affected Quality Goals**: Performance Efficiency (network bandwidth)

**Cross-Reference**: ADR-003 in Section 9, PE-3 in Section 10

---

### TD-3: Outdated Dependencies (35 Packages with Updates) [MEDIUM PRIORITY]

**Priority**: 🟡 **MEDIUM**

**Description**: 35 npm packages have available updates. Most critical: `three` library 47 versions behind (0.135.0 → 0.182.0), missing security patches and bug fixes[^14].

**Cost of Inaction**:
- **Security vulnerabilities**: Known CVEs remain unpatched
- **Missing bug fixes**: Stability issues already fixed in newer versions
- **Incompatibility**: Future dependencies may require newer versions
- **Technical debt accumulation**: Falling further behind makes eventual upgrade more costly

**Cost to Fix**: Medium (2-3 weeks for major updates, testing, fixing breaking changes)

**Critical Updates**:
| Package | Current | Latest | Gap | Risk |
|---------|---------|--------|-----|------|
| `three` | 0.135.0 | 0.182.0 | 47 versions | HIGH - 3D rendering library |
| `uuid` | 8.3.2 | 13.0.0 | 5 major versions | MEDIUM - Breaking API changes |
| `@types/three` | 0.135.0 | 0.182.0 | Out of sync | MEDIUM - Type safety |
| `express` | **"latest"** | - | Anti-pattern | HIGH - Non-reproducible builds |
| 31 others | Various | Various | - | LOW - Minor updates |

**Evidence**: npm outdated analysis[^14]. Special concern: `web-server/package.json` uses `"latest"` for all dependencies (anti-pattern).

**Suggested Actions**:
1. **Immediate (Week 1)**:
   - Fix anti-pattern: Replace `"latest"` with specific versions in web-server/package.json
   - Run `npm audit` to identify security vulnerabilities
   - Update low-risk packages (patch versions only)
2. **Short-term (Month 1)**:
   - Update `three` to 0.182.0 (test 3D rendering thoroughly)
   - Update `@types/three` to match
   - Update `uuid` to 13.0.0 (check for breaking changes in API)
3. **Medium-term (Quarter 1)**:
   - Establish dependency update policy (monthly reviews)
   - Add Dependabot or Renovate bot for automated PR creation
   - Set up automated testing for dependency updates

**Anti-Pattern Found**:
```json
// web-server/package.json (BAD)
"dependencies": {
  "express": "latest",
  "body-parser": "latest"
}
// Should be:
"dependencies": {
  "express": "^4.18.2",
  "body-parser": "^1.20.2"
}
```

**Affected Quality Goals**: Security, Maintainability

**Cross-Reference**: Section 2 (Technology Constraints)

---

### TD-4: No Environment-Based Configuration [HIGH PRIORITY]

**Priority**: 🔴 **HIGH**

**Description**: Server URLs, ports, credentials, and log levels are hardcoded in source files. Cannot deploy to staging/production without modifying code[^15].

**Cost of Inaction**:
- **Cannot deploy to cloud**: Requires code changes for each environment
- **Security risk**: Production credentials in source control
- **Slow deployments**: Must rebuild application for configuration changes
- **Error-prone**: Manual edits risk typos and inconsistency

**Cost to Fix**: Low (1 week to implement environment variables for all config)

**Missing Configuration**:
- WebSocket URL: `ws://localhost:10000` hardcoded in client.ts
- Admin credentials: Hardcoded in adminUser.json (see R-2)
- Server ports: Hardcoded in servers.json (3010, 3150, 3151)
- Admin server token: Hardcoded in adminServer.json
- Log levels: Hardcoded in log4js.json
- Database connection: Would be hardcoded if database added

**Evidence**: Search for `process.env` found only 2 usages (devTools in store.ts and one other)[^15].

**Suggested Actions**:
1. **Week 1**: Create environment variable schema
   ```typescript
   // config.ts
   export const config = {
     wsUrl: process.env.WS_URL || 'ws://localhost:10000',
     adminPort: parseInt(process.env.ADMIN_PORT || '3010'),
     logLevel: process.env.LOG_LEVEL || 'info',
   };
   ```
2. **Week 2**: Migrate all hardcoded config to environment variables
3. **Week 3**: Create .env.example documenting all required variables
4. **Week 4**: Add config validation on startup (fail fast if required vars missing)

**Environment Files Needed**:
- `.env.development` - Local development (ws://localhost)
- `.env.staging` - Staging environment (wss://staging.example.com)
- `.env.production` - Production environment (wss://game.example.com)

**Affected Quality Goals**: Deployability, Security

**Cross-Reference**: OPS-1 in risks section, Section 7 (Deployment View)

---

### TD-5: Missing Null/Undefined Checks (13 Locations) [HIGH PRIORITY]

**Priority**: 🔴 **HIGH**

**Description**: Navigation and lobby handlers assume all objects exist without null checks. Causes runtime crashes when players disconnect during command processing[^16].

**Cost of Inaction**:
- **Frequent crashes**: Null reference errors when players disconnect
- **Poor user experience**: Other players disconnected by crashes
- **Difficult debugging**: Stack traces don't indicate root cause

**Cost to Fix**: Low (2-3 days to add defensive checks to 13 locations)

**Locations**:
- `navigation.ts` lines 22-23, 46-47, 68-69, 83-84, 99-100 (5 handlers × 2 calls = 10 instances)
- `lobby.ts` lines 16-19, 32-34, 116-120 (3 instances)

**Evidence**: Missing null checks before dereferencing[^16]:
```typescript
// navigation.ts - 5 handlers with same pattern
const player = shipRegistry.getPlayer(playerId);
const ship = shipRegistry.getShip(player.getShip().getId());
// ☝️ Crashes if:
//   - player is undefined (player disconnected)
//   - player.getShip() is null (player not on ship)
//   - shipRegistry.getShip() returns undefined (ship removed)
```

**Suggested Actions**:
1. **Week 1**: Add defensive checks to all 13 locations:
   ```typescript
   const player = shipRegistry.getPlayer(playerId);
   if (!player) {
     next(new Error('Player not found'), { code: 'ERR', payload: { error: 'Player not found' } });
     return;
   }

   const playerShip = player.getShip();
   if (!playerShip) {
     next(new Error('Player not on ship'), { code: 'ERR', payload: { error: 'Player not on ship' } });
     return;
   }

   const ship = shipRegistry.getShip(playerShip.getId());
   if (!ship) {
     next(new Error('Ship not found'), { code: 'ERR', payload: { error: 'Ship not found' } });
     return;
   }
   ```
2. **Week 2**: Add tests for null/undefined scenarios
3. **Week 3**: Add TypeScript strict null checks (`strictNullChecks: true` in tsconfig)

**Affected Quality Goals**: Reliability (REL-2)

**Cross-Reference**: R-4 (input validation), Section 10 REL-2

---

### TD-6: No Health Checks or Metrics Endpoints [MEDIUM PRIORITY]

**Priority**: 🟡 **MEDIUM**

**Description**: No `/health`, `/readiness`, or `/metrics` endpoints for monitoring. Cannot detect server degradation before complete failure[^17].

**Cost of Inaction**:
- **No proactive monitoring**: Issues discovered only after user complaints
- **Long MTTR (Mean Time To Recovery)**: Cannot quickly identify root cause
- **No capacity planning**: Cannot forecast when to scale resources
- **Poor operational visibility**: No insight into server performance

**Cost to Fix**: Low (1-2 days to add basic endpoints)

**Missing Endpoints**:
- `/health` - Basic health check (200 OK if server responsive)
- `/readiness` - Ready to serve traffic (DB connected, dependencies available)
- `/metrics` - Prometheus-format metrics (request count, latency, error rate)

**Evidence**: Searched entire codebase, no health check routes found[^17].

**Suggested Actions**:
1. **Week 1**: Add basic health check endpoint
   ```typescript
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'ok', uptime: process.uptime() });
   });
   ```
2. **Week 2**: Add readiness check (verify World server connectivity)
   ```typescript
   app.get('/readiness', async (req, res) => {
     try {
       await worldServer.ping();  // RPC health check
       res.status(200).json({ status: 'ready' });
     } catch (error) {
       res.status(503).json({ status: 'not_ready', error: error.message });
     }
   });
   ```
3. **Week 3**: Add Prometheus metrics endpoint
   ```typescript
   const register = new promClient.Registry();
   const requestCount = new promClient.Counter({
     name: 'http_requests_total',
     help: 'Total HTTP requests',
     labelNames: ['method', 'route', 'status']
   });
   register.registerMetric(requestCount);

   app.get('/metrics', (req, res) => {
     res.set('Content-Type', register.contentType);
     res.end(register.metrics());
   });
   ```
4. **Week 4**: Integrate with monitoring platform (Prometheus, Grafana, Datadog)

**Key Metrics to Track**:
- Request rate (requests/second)
- Request latency (95th percentile)
- Error rate (errors/total requests)
- Active players (gauge)
- Tick duration (histogram, target <100ms)
- Memory usage (heap size, RSS)
- Event loop lag (detect blocking operations)

**Affected Quality Goals**: Observability (OBS-3)

**Cross-Reference**: Section 10.2.5 OBS-3 (Metrics Collection Gap), REL-3

---

### TD-7: No Graceful Shutdown Handling [MEDIUM PRIORITY]

**Priority**: 🟡 **MEDIUM**

**Description**: Server has no SIGTERM/SIGINT handlers. Kubernetes/Docker stop commands immediately kill process, dumping in-flight game state and disconnecting players abruptly[^18].

**Cost of Inaction**:
- **Poor user experience**: Players lose in-flight commands during deployments
- **Data loss**: In-memory state lost without cleanup opportunity
- **Connection leaks**: WebSocket connections not properly closed
- **Difficult deployments**: Cannot deploy during active gameplay

**Cost to Fix**: Low (1 day to implement graceful shutdown)

**Evidence**: No `process.on('SIGTERM')` or `process.on('SIGINT')` handlers found[^18].

**Suggested Actions**:
1. **Week 1**: Implement graceful shutdown
   ```typescript
   // main.ts
   process.on('SIGTERM', async () => {
     console.log('SIGTERM received, shutting down gracefully...');

     // Stop accepting new connections
     server.close();

     // Notify all connected players
     channel.pushToGlobal({
       event: 'serverShutdown',
       message: 'Server restarting, please reconnect in 30 seconds'
     });

     // Allow time for in-flight requests to complete
     await new Promise(resolve => setTimeout(resolve, 5000));

     // Optional: Save game state snapshot
     if (process.env.SAVE_STATE_ON_SHUTDOWN === 'true') {
       await saveGameState();
     }

     // Exit cleanly
     process.exit(0);
   });

   process.on('SIGINT', () => {
     console.log('SIGINT received, shutting down...');
     process.exit(0);
   });
   ```
2. **Week 2**: Add shutdown timeout (force kill after 30 seconds)
3. **Week 3**: Test graceful shutdown in Kubernetes (terminationGracePeriodSeconds: 30)

**Kubernetes Configuration**:
```yaml
# deployment.yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 30  # Give server time to shut down
      containers:
      - name: game-server
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 5"]  # Allow load balancer to deregister
```

**Affected Quality Goals**: Reliability, User Experience

**Cross-Reference**: OPS-2 in risks section

---

### TD-8: Deprecated Travis CI Configuration [LOW PRIORITY]

**Priority**: 🟢 **LOW**

**Description**: Repository contains `.travis.yml` configured for Node.js 0.10 (EOL 2016). CI builds cannot run, no automated testing[^19].

**Cost of Inaction**:
- **No automated testing**: Changes not validated before merge
- **High regression risk**: Manual testing insufficient
- **Slow code review**: Reviewers must manually verify tests pass

**Cost to Fix**: Low (1 day to migrate to GitHub Actions or update Travis config)

**Evidence**: Outdated Travis configuration[^19]:
```yaml
# .travis.yml lines 1-7
language: node_js
node_js:
- '0.10'  # Node.js 0.10 EOL'd in October 2016
```

**Suggested Actions**:
1. **Option A**: Migrate to GitHub Actions (recommended if using GitHub)
   ```yaml
   # .github/workflows/ci.yml
   name: CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm test
         - run: npm run lint
   ```
2. **Option B**: Update Travis CI to modern Node.js
   ```yaml
   language: node_js
   node_js:
     - '18'  # LTS version
   script:
     - npm test
     - npm run lint
   ```
3. **Week 2**: Add coverage reporting to CI (Codecov, Coveralls)
4. **Week 3**: Add build status badge to README

**Affected Quality Goals**: Maintainability, Developer Experience

---

### TD-9: Missing API Documentation [LOW PRIORITY]

**Priority**: 🟢 **LOW**

**Description**: Navigation and lobby handlers have no JSDoc comments. New developers cannot understand API contracts without reading implementation[^20].

**Cost of Inaction**:
- **Slow onboarding**: New developers must reverse-engineer API from code
- **Misuse of APIs**: Incorrect parameter types or missing required fields
- **Difficult maintenance**: Cannot understand intent without reading implementation

**Cost to Fix**: Low (1 week to document all public APIs)

**Evidence**: 0 JSDoc comments in navigation.ts (107 lines)[^20].

**Suggested Actions**:
1. **Week 1**: Document handler interfaces
   ```typescript
   /**
    * Sets the ship's impulse speed (sublight propulsion).
    *
    * @param msg - Message payload
    * @param msg.targetSpeed - Target impulse speed (0-100, integer)
    * @param session - Player session
    * @param next - Callback function (error, response)
    *
    * @example
    * // Set impulse to 50%
    * { route: 'world.navigation.setImpulseSpeed', data: { targetSpeed: 50 } }
    *
    * @throws {Error} If player not found or not on ship
    * @returns Response with code 'OK' on success, 'ERR' on failure
    */
   setImpulseSpeed(msg, session, next) { ... }
   ```
2. **Week 2**: Generate API documentation with TypeDoc
3. **Week 3**: Add API documentation to README or docs/ folder

**Affected Quality Goals**: Maintainability, Developer Experience

---

## 11.3 Risk and Debt Summary

### Immediate Action Required (Week 1)
1. **R-1**: Add try/catch to tick cycle (prevent crashes)
2. **R-2**: Move admin credentials to environment variables (security)
3. **TD-1**: Add tests for critical paths (tick cycle, navigation, lobby)
4. **TD-4**: Implement environment-based configuration
5. **TD-5**: Add null checks to all handlers (13 locations)

### High Priority (Month 1)
6. **R-3**: Implement TLS/SSL (wss://)
7. **R-4**: Add input validation to navigation commands
8. **TD-6**: Add health check and metrics endpoints
9. **TD-7**: Implement graceful shutdown

### Medium Priority (Quarter 1)
10. **R-5**: Add Connector/World health checks (split-brain prevention)
11. **R-6**: Implement entity TTL/eviction policy
12. **TD-2**: Decide fate of binary protocol (implement or remove)
13. **TD-3**: Update outdated dependencies (35 packages)

### Low Priority (Technical Improvements)
14. **R-7**: Handle action queue overflow gracefully
15. **R-8**: Monitor Sylvester.js for maintenance issues
16. **R-9**: Document disaster recovery plan (if transitioning to production)
17. **TD-8**: Migrate CI to GitHub Actions or update Travis
18. **TD-9**: Add JSDoc API documentation

### Positive Findings (What's Working Well)
- ✅ **Clean codebase**: Only 2 TODO comments found (minimal technical debt markers)
- ✅ **Modern stack**: React 19, TypeScript 5.7, Redux Toolkit (recent versions)
- ✅ **Good architecture**: Nx monorepo with clear separation of concerns
- ✅ **Physics testing**: Collision detection has comprehensive tests (10,000 iterations)
- ✅ **Excellent documentation**: Comprehensive arc42 documentation in docs/ directory

---

## 11.4 Risk Matrix

Visual prioritization of risks by probability and impact:

```
Impact
  ↑
Critical │                    R-1 (Tick Crash)
         │                    R-2 (Credentials)
         │
High     │    R-5 (Split-Brain)     R-3 (No TLS)
         │    R-6 (Memory Leak)     R-4 (No Validation)
         │    R-7 (Queue Overflow)
         │
Medium   │    R-8 (Sylvester.js)
         │
Low      │    R-9 (No DR Plan)
         │
         └────────────────────────────────────→
           Low      Medium      High      Probability
```

---

## 11.5 Technical Debt Prioritization

Prioritization based on cost to fix vs cost of inaction:

| Item | Cost to Fix | Cost of Inaction | Priority | Timeframe |
|------|-------------|------------------|----------|-----------|
| TD-1 | Medium | Very High | 🔴 HIGH | Week 1-4 |
| TD-4 | Low | High | 🔴 HIGH | Week 1 |
| TD-5 | Low | High | 🔴 HIGH | Week 1 |
| TD-6 | Low | Medium | 🟡 MEDIUM | Month 1 |
| TD-7 | Low | Medium | 🟡 MEDIUM | Month 1 |
| TD-2 | Low (remove) / High (implement) | Medium | 🟡 MEDIUM | Quarter 1 |
| TD-3 | Medium | Medium | 🟡 MEDIUM | Quarter 1 |
| TD-8 | Low | Low | 🟢 LOW | Quarter 2 |
| TD-9 | Low | Low | 🟢 LOW | Quarter 2 |

---

## 11.6 Cross-References

- **Section 1.2**: Quality goals threatened by risks (Real-time responsiveness, Maintainability, Security)
- **Section 2**: Technology constraints (Node.js, TypeScript, Pinus framework versions)
- **Section 5**: Building blocks affected by technical debt (World Server, Navigation Handler, Registries)
- **Section 8**: Crosscutting concepts impacted by debt (Action Queue, Registry Pattern)
- **Section 9**: Architecture decisions with documented trade-offs (ADR-003, ADR-004, ADR-006)
- **Section 10**: Quality requirements gaps mapped to risks/debt (SEC-2, REL-1, TEST-3, MAINT-3, OBS-3)

[^1]: apps/game-server/src/app/src/timer.ts lines 11-15 - No try/catch blocks in tick cycle; Section 6 Runtime View line 262 documents crash risk
[^2]: apps/game-server/src/config/adminUser.json contains plaintext credentials (admin/admin, monitor/monitor, test/test)
[^3]: apps/game-server/src/config/adminServer.json line 4 contains hardcoded token: "agarxhqb98rpajloaxn34ga8xrunpagkjwlaw3ruxnpaagl29w4rxn"
[^4]: apps/starship-mayflower-frontend/src/app/store/client.ts line 15 - WebSocket uses ws:// (plaintext) not wss:// (TLS)
[^5]: apps/game-server/src/app/servers/world/handler/navigation.ts lines 25, 49, 71, 86, 102 - No input validation on targetSpeed, radian parameters
[^6]: Missing null checks at navigation.ts lines 22-23, 46-47, 68-69, 83-84, 99-100; lobby.ts lines 16-19, 32-34, 116-120
[^7]: Section 9 ADR-001 documents split-brain scenario in Consequences section; no health checks between Connector/World servers
[^8]: apps/game-server/src/app/src/world/ShipRegistry.ts - Ships added via registerShip() but only removed manually via removePlayer()
[^9]: apps/game-server/src/app/src/action/ActionQueue.ts lines 8-14 - push() returns false when full; timer.ts lines 21, 34 ignore return value
[^10]: Section 9 ADR-006 documents Sylvester.js dependency; libs/util/src/lib/model/ObjectInSpace.ts uses sylvester-es6 for Vector/Matrix operations
[^11]: Section 9 ADR-004 documents in-memory ephemeral state design decision; no backup configuration in codebase
[^12]: Codebase analysis found 8 test files (6 unit/spec tests + 2 E2E test files) vs 81 TypeScript source files = 9.9% coverage
[^13]: Section 9 ADR-003 documents empty dictionary files; apps/game-server/src/config/dictionary.json, clientProtos.json, serverProtos.json all contain empty {}
[^14]: npm outdated analysis showed 35 packages with updates available; package.json shows three@0.135.0 (latest: 0.182.0), uuid@8.3.2 (latest: 13.0.0)
[^15]: apps/starship-mayflower-frontend/src/app/store/client.ts line 15 hardcodes ws://localhost:10000; apps/game-server/src/config/servers.json hardcodes ports 3010, 3150, 3151
[^16]: apps/game-server/src/app/servers/world/handler/navigation.ts - All 5 handlers call shipRegistry.getPlayer(playerId) and player.getShip().getId() without null checks
[^17]: Searched entire codebase for /health, /readiness, /metrics endpoints - none found; no Prometheus or health check integration
[^18]: Searched for process.on('SIGTERM') and process.on('SIGINT') - no graceful shutdown handlers found in apps/game-server/src/main.ts
[^19]: .travis.yml lines 1-7 specify Node.js 0.10 (EOL October 2016); current Node.js LTS is 18.x/20.x
[^20]: apps/game-server/src/app/servers/world/handler/navigation.ts (107 lines) has 0 JSDoc comments; apps/game-server/src/app/servers/world/handler/lobby.ts (187 lines) has 0 JSDoc comments
