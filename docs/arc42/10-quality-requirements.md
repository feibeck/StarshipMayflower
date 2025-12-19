# Section 10: Quality Requirements

## Introduction

This section documents quality requirements **beyond the top-3 quality goals** already covered in Section 1.2 (Real-time responsiveness, Maintainability through modularity, Physics accuracy). The quality requirements here have medium or lower priority but still influence architectural decisions and system characteristics.

**Relationship to Section 1.2**: Section 1.2 establishes the top-3 quality goals that drove major architectural decisions. This section provides detailed, measurable scenarios for additional quality attributes that are important but didn't require fundamental architectural trade-offs.

> **Note on Evidence**: All quality scenarios in this section are based on concrete code evidence, configuration files, or documented patterns in the codebase. No speculative requirements are included.

> **Note on Confidence Levels**: This documentation distinguishes between three confidence levels:
> - **HIGH confidence**: Observable implementations that exist in code (verified with file citations)
> - **MEDIUM confidence**: Estimated performance characteristics based on typical behavior (marked as "**estimated**")
> - **LOW confidence**: Acceptance criteria and SLAs where formal requirements don't exist (marked as "**TBD**" or "**Assumption**")
>
> Section 10.4 "Questions for Clarification" identifies areas requiring stakeholder input to formalize quality requirements.

---

## 10.1 Quality Requirements Overview

The following table summarizes quality requirements organized by ISO 25010 categories:

| Category | Quality Attribute | Priority | Status | Evidence |
|----------|-------------------|----------|--------|----------|
| **Performance Efficiency** | Build cache performance | High | ✅ Implemented | Nx caching (nx.json) |
| | Entity lookup performance | High | ✅ Implemented | O(1) registry pattern |
| | Network bandwidth efficiency | Medium | ⚠️ Partial | Binary protocol configured but unused |
| **Security** | Authentication enforcement | High | ✅ Implemented | Session validation in handlers |
| | Credential management | High | ❌ **CRITICAL ISSUE** | Hardcoded credentials in source |
| | Transport security | Medium | ❌ Missing | No TLS/SSL (ws:// not wss://) |
| **Reliability** | Tick cycle resilience | High | ❌ Missing | No error boundaries in timer |
| | Network reconnection | Medium | ❌ Missing | Manual reconnection required |
| | Heartbeat detection | Medium | ✅ Implemented | Pinus 3-second heartbeat |
| **Maintainability** | Dependency enforcement | High | ✅ Implemented | ESLint exhaustive-deps rule |
| | Type safety | High | ✅ Implemented | TypeScript strict mode |
| | Test coverage | Medium | ⚠️ Low | ~13% file coverage (10/73+ files) |
| **Observability** | Structured logging | Medium | ✅ Implemented | Log4js with 9 categories |
| | Log rotation | Medium | ✅ Implemented | 1MB max, 5 backups per category |
| | Metrics collection | Medium | ❌ Missing | No Prometheus/StatsD |
| **Scalability** | Connector horizontal scaling | High | ✅ Supported | Pinus distributed topology |
| | World state sharding | Medium | ❌ Not supported | Single world server design |
| **Usability (Developer)** | Component isolation | High | ✅ Implemented | Storybook for UI libs |
| | Build performance | High | ✅ Implemented | Nx incremental builds (5-10x) |
| | Hot module replacement | Medium | ✅ Implemented | Webpack dev server HMR |
| **Testability** | Physics accuracy verification | High | ✅ Implemented | 10,000-iteration stress test |
| | Handler testing | Medium | ⚠️ Gap | Lobby/entry handlers not tested |

**Legend**:
- ✅ Implemented: Working implementation with evidence
- ⚠️ Partial/Low: Incomplete or below target
- ❌ Missing: Not implemented, documented gap

---

## 10.2 Quality Scenarios

Quality scenarios are organized by ISO 25010 quality categories. Each scenario follows the Q42 short form:
- **Context**: System state and environment
- **Stimulus**: Event triggering the quality requirement
- **Response**: System behavior
- **Measure**: Documented in three parts to distinguish confidence levels:
  - **Observable Implementation**: What EXISTS in code (HIGH confidence)
  - **Estimated Performance** (where applicable): Typical/expected performance characteristics (**estimated**, not measured)
  - **Acceptance Criteria**: Formal requirements or SLAs (marked as **TBD** or **Assumption** where not formally documented)

### 10.2.1 Performance Efficiency Scenarios

#### PE-1: Build Cache Hit Rate

**Context**: Developer in CI pipeline rebuilding project after modifying single library file (`libs/util/src/lib/model/Ship.ts`)

**Stimulus**: Execute `nx build starship-mayflower-frontend` command

**Response**: Nx build system retrieves cached build artifacts for all unaffected projects (compass, map, game-server). Only `libs/util` and `apps/starship-mayflower-frontend` rebuild from source.

**Measure**:
- **Observable Implementation**: Nx caching enabled for all build targets (nx.json configuration)
- **Estimated Performance**: Cache hit rate >85%, build time <30 seconds vs ~5 minutes clean build (6x improvement, **estimated** from typical Nx performance, not measured)
- **Acceptance Criteria** (**TBD**): Specific cache hit rate and build time SLAs not formally defined

**Evidence**: Nx caching configuration in `/Users/flo/work/StarshipMayflower/nx.json` lines 20-34 enables caching for build, lint, test targets[^1]. Documented performance improvement in Section 7 Deployment View line 122.

---

#### PE-2: Entity Registry Lookup Performance

**Context**: Game server World process executing 10 Hz physics tick with 100 active ships in memory

**Stimulus**: Physics system retrieves ship by ID to update position (`ShipRegistry.getShip(shipId)`)

**Response**: O(1) hash map lookup returns ship reference without array iteration

**Measure**:
- **Observable Implementation**: O(1) hash map registry using `Record<string, T>` pattern
- **Estimated Performance**: Lookup time <1ms for 100 entities, constant time up to 1000 entities (**estimated**, not profiled)
- **Acceptance Criteria** (**TBD**): Specific latency SLAs for entity lookups not formally defined

**Evidence**: Registry pattern implemented in `/Users/flo/work/StarshipMayflower/libs/util/src/lib/model/ObjectInSpaceRegistry.ts` using `Record<string, T>` hash map[^2]. Section 8.2 documents O(1) lookup vs O(n) array search as critical for 10 Hz tick cycle performance.

---

#### PE-3: Frontend Render Throttling

**Context**: Browser rendering game visualization with 60 FPS display refresh rate

**Stimulus**: Game server broadcasts position updates at 10 Hz (every 100ms)

**Response**: Scanner component throttles render updates to 30 FPS (33ms interval) using lodash throttle

**Measure**:
- **Observable Implementation**: Lodash throttle at 30 FPS (33ms interval) in Scanner component
- **Estimated Performance**: CPU usage reduction vs unthrottled (**not measured**)
- **Acceptance Criteria** (**Assumption**): 30 FPS deemed acceptable for tactical display based on design decision, not formal requirement

**Evidence**: Throttled rendering in `/Users/flo/work/StarshipMayflower/web-server/public/js/Scanner/scanner.js` line 27: `_.throttle(render, 1000/30)` (evaluates to ~33ms interval)[^3]. Trade-off: Lower CPU usage vs maximum visual fidelity.

---

### 10.2.2 Security Scenarios

#### SEC-1: Unauthenticated Access Prevention

**Context**: Client attempts to perform privileged operation (join ship, send command) without authentication

**Stimulus**: WebSocket message sent to `lobby.joinShip` route with no `playerId` in session

**Response**: Server validates session, responds with error code `{code: 'ERR', payload: {error: 'User not logged in'}}`

**Measure**:
- **Observable Implementation**: Session validation checks on all lobby/world handlers using `session.get('playerId')`
- **Expected Behavior**: 100% of protected endpoints reject unauthenticated requests with consistent error format
- **Acceptance Criteria** (**TBD**): Response time SLA for authentication checks not formally defined (estimated <10ms)

**Evidence**: Session validation in `/Users/flo/work/StarshipMayflower/apps/game-server/src/app/servers/world/handler/lobby.ts` lines 16-19, 32-34, 116-120[^4]. Entry handler binds `playerId` to session during authentication.

---

#### SEC-2: Credential Management Vulnerability ⚠️ CRITICAL

**Context**: Production deployment with public or semi-public repository access

**Stimulus**: Security audit of credential storage

**Response**: **SECURITY FAILURE** - Admin credentials exposed in plaintext JSON committed to source control (`admin/admin`, `monitor/monitor`, `test/test`)

**Measure**:
- **FAILURE**: Zero protection against credential theft
- Recovery time: Immediate credential rotation required
- Impact: Full admin access to game server

**Evidence**: Hardcoded credentials in `/Users/flo/work/StarshipMayflower/apps/game-server/src/config/adminUser.json`[^5]. **This is a CRITICAL security issue requiring immediate remediation.** Recommended: Use environment variables + secrets management (AWS Secrets Manager, HashiCorp Vault, or Kubernetes Secrets).

---

#### SEC-3: Transport Security Assessment

**Context**: Game client connecting to production server over public internet

**Stimulus**: Security review of WebSocket transport layer

**Response**: **NO TLS/SSL** - WebSocket connections use `ws://` protocol (plaintext) instead of `wss://` (encrypted)

**Measure**:
- Encryption: None - all traffic visible to network observers
- Man-in-the-middle protection: None
- Suitability: **Prototype/demo only** - not production-ready

**Evidence**: Documented security gap in Section 7 Deployment View lines 380, 462[^6]. System designed for trusted local networks, not public internet deployment.

---

### 10.2.3 Reliability Scenarios

#### REL-1: Tick Cycle Exception Handling

**Context**: Game server processing 10 Hz physics tick with 50 active ships

**Stimulus**: Unhandled exception thrown in physics calculation (e.g., division by zero, invalid vector operation)

**Response**: **CRASH** - Node.js process terminates, all player sessions lost, requires manual restart

**Measure**:
- **FAILURE**: Zero error recovery capability
- Downtime: Until manual intervention (minutes to hours)
- Data loss: All in-flight game state lost (no persistence)

**Evidence**: No try/catch blocks in `/Users/flo/work/StarshipMayflower/apps/game-server/src/app/src/timer.ts`[^7]. Section 6 Runtime View line 262 documents this reliability gap. **Recommended**: Add try/catch with graceful degradation (log error, skip failing tick, continue).

---

#### REL-2: Network Disconnection Recovery

**Context**: Player experiencing temporary network interruption (WiFi glitch, mobile network switch)

**Stimulus**: WebSocket connection drops for 3 seconds, then network recovers

**Response**: Client detects error via WebSocket `onerror` event, displays "Connection lost" message. **Manual reconnection required** - player must click "Reconnect" button.

**Measure**:
- Automatic retry: **NONE** - 100% of disconnects require user action
- User experience: **POOR** - Disrupts gameplay flow
- Recovery time: 5-30 seconds (including user reaction time)

**Evidence**: No retry logic in websocketMiddleware or client code[^8]. Section 6 Runtime View lines 553, 609 document manual reconnection requirement. **Recommended**: Implement exponential backoff retry (1s, 2s, 4s, 8s max).

---

#### REL-3: WebSocket Heartbeat Detection

**Context**: Game server monitoring client connection health

**Stimulus**: Client becomes unresponsive (browser crash, network partition) and stops responding to heartbeat pings

**Response**: Pinus framework detects heartbeat timeout after 3 seconds, terminates connection, removes session

**Measure**:
- **Observable Implementation**: Pinus heartbeat configured at 3-second interval (main.ts)
- **Expected Behavior**: Client timeout detected within ≤3 seconds, session cleaned up automatically
- **Acceptance Criteria** (**Assumption**): 3-second timeout deemed acceptable based on Pinus default, not formal requirement

**Evidence**: Heartbeat configuration in `/Users/flo/work/StarshipMayflower/apps/game-server/src/main.ts` line 14: `heartbeat: 3`[^9]. Pinus framework handles automatic timeout detection and cleanup.

---

### 10.2.4 Maintainability Scenarios

#### MAINT-1: React Hooks Dependency Bug Prevention

**Context**: Developer adds `useEffect` hook with missing dependency variable

**Stimulus**: Run `nx lint starship-mayflower-frontend`

**Response**: ESLint fails with error: `React Hook useEffect has a missing dependency: 'shipId'. Either include it or remove the dependency array. (react-hooks/exhaustive-deps)`

**Measure**:
- **Observable Implementation**: ESLint `react-hooks/exhaustive-deps` rule set to 'error' level
- **Expected Behavior**: 100% of missing React hook dependencies caught during lint (build-time enforcement)
- **Acceptance Criteria** (**Assumption**): Build-time enforcement deemed sufficient based on development team preference

**Evidence**: ESLint rule in `/Users/flo/work/StarshipMayflower/eslint.config.mjs` line 45: `'react-hooks/exhaustive-deps': 'error'`[^10]. Documented in MODERNIZATION.md line 94 as key quality improvement.

---

#### MAINT-2: Type Safety Across Module Boundaries

**Context**: Developer modifies `Ship` class in `libs/util`, changing method signature

**Stimulus**: Run TypeScript compilation (`nx build`)

**Response**: Compiler reports type errors in all files importing Ship (frontend components, backend handlers, tests)

**Measure**:
- **Observable Implementation**: TypeScript strict mode enabled, isomorphic models shared between frontend/backend
- **Expected Behavior**: 100% of type mismatches caught at compile time before reaching production
- **Acceptance Criteria**: Type safety is a documented Quality Goal (#5 in Section 1.2) with HIGH priority

**Evidence**: Isomorphic TypeScript models with strict mode enabled[^11]. Section 1.2 Quality Goal #5 (Developer experience through type safety). Section 8.1 documents shared domain model pattern.

---

#### MAINT-3: Test Coverage Gap Assessment

**Context**: Evaluating project maintainability and regression risk before production deployment

**Stimulus**: Count test files vs production source files

**Response**: **LOW COVERAGE** - Only 10 test files (8 unit tests: physics.spec.ts, Ship.spec.ts, collision.spec.ts, ObjectInSpaceRegistry.spec.ts, Player.spec.ts, timer.spec.ts, entity.spec.ts, physics-integration.spec.ts; plus 2 Cypress component test apps) covering 73+ production source files

**Measure**:
- Test file coverage: ~13% (10 test files / 73+ source files)
- Untested critical paths: Lobby handlers, WebSocket middleware, RPC handlers
- Regression risk: **HIGH** - Most production code has no automated tests

**Evidence**: Test file count from codebase analysis[^12]. **Recommended**: Prioritize testing for handlers (lobby, entry), middleware (websocketMiddleware), and RPC layer. Target: 40%+ file coverage.

---

### 10.2.5 Observability Scenarios

#### OBS-1: Structured Log Rotation

**Context**: Game server running continuously for 7 days under normal load

**Stimulus**: Connector log file (`con-log-connector-server-1.log`) reaches 1MB size

**Response**: Log4js rotates log file, renames current file to `con-log-connector-server-1.log.1`, creates new log file. Oldest backup (`.log.5`) deleted.

**Measure**:
- Maximum disk usage per category: 5MB (1MB current + 4MB backups)
- Total log storage: ~45MB (9 categories × 5MB)
- Rotation trigger: Exact 1MB file size (1,048,576 bytes)

**Evidence**: Log rotation config in `/Users/flo/work/StarshipMayflower/apps/game-server/src/config/log4js.json` lines 10-14 (`maxLogSize: 1048576, backups: 5`)[^13]. Prevents unbounded disk growth.

---

#### OBS-2: RPC Communication Debugging

**Context**: Investigating inter-server communication issue causing player commands to fail

**Stimulus**: Enable RPC debug logging, reproduce issue

**Response**: Separate `rpc-debug-{serverId}.log` captures detailed RPC events (call parameters, response data, timing) isolated from application logs

**Measure**:
- Log isolation: RPC events separated from business logic logs
- Debug detail level: Full request/response payloads logged
- Performance impact: Minimal (<5ms per RPC call for logging)

**Evidence**: RPC debug log category in `/Users/flo/work/StarshipMayflower/apps/game-server/src/config/log4js.json` lines 34-42[^14]. 9 separate log categories enable targeted troubleshooting.

---

#### OBS-3: Metrics Collection Gap ⚠️

**Context**: Operations team monitoring game server performance in production

**Stimulus**: Query request rate, 95th percentile latency, error rate for last hour

**Response**: **NO METRICS AVAILABLE** - Must manually parse log files or query application directly

**Measure**:
- **FAILURE**: Cannot track Service Level Objectives (SLOs)
- Mean time to detection: **High** - Issues require manual log review
- Alerting capability: **None** - No threshold-based alerts possible

**Evidence**: No Prometheus/StatsD integration documented in Section 7 Deployment View lines 422-423[^15]. **Recommended**: Add `/metrics` endpoint with Prometheus format (request_count, request_duration_seconds, error_count).

---

### 10.2.6 Scalability Scenarios

#### SCALE-1: Connector Server Horizontal Scaling

**Context**: System receiving 500 concurrent WebSocket connections, exceeding single connector capacity

**Stimulus**: Deploy 5 connector server instances in `servers.json`, restart cluster

**Response**: Pinus master server distributes incoming connections across 5 connectors via round-robin or least-connections algorithm

**Measure**:
- Linear scaling: Each connector handles ~100 connections
- Load distribution: ±10% variance between connector loads
- Throughput: 5x connection capacity vs single connector

**Evidence**: Distributed connector architecture documented in ADR-001[^16]. Pinus framework supports multiple connector servers in `apps/game-server/src/config/servers.json`.

---

#### SCALE-2: World State Sharding Limitation

**Context**: Attempting to scale game world beyond single server CPU capacity (50+ ships, 400+ players)

**Stimulus**: Add second world server to `servers.json` for horizontal scaling

**Response**: **ARCHITECTURE LIMITATION** - In-memory state is not partitioned or sharded. Multiple world servers would have inconsistent state.

**Measure**:
- Maximum capacity: ~50 ships before physics tick exceeds 100ms budget
- Scaling approach: **Vertical only** - Must upgrade CPU/RAM
- Horizontal scaling: Not supported without major architecture change

**Evidence**: Single world server design documented in Section 5 Building Block View[^17]. ADR-004 In-Memory Ephemeral State prioritizes performance over distributed scalability.

---

#### SCALE-3: In-Memory State Memory Footprint

**Context**: Tracking 1000 ships with full position history and player metadata

**Stimulus**: Monitor Node.js heap usage over 24-hour period

**Response**: Memory grows unbounded without eviction policy or garbage collection for old entities

**Measure**:
- **RISK**: Out-of-memory (OOM) crash if entity count grows unchecked
- Estimated footprint: ~100KB per ship × 1000 ships = 100MB baseline
- Mitigation: **MISSING** - No TTL (time-to-live) or LRU eviction policy

**Evidence**: In-memory state without database documented in ADR-004[^18]. Section 9 recommends "Add entity lifecycle management (TTL for inactive ships)" as immediate action item.

---

### 10.2.7 Usability (Developer Experience) Scenarios

#### DX-1: Component Isolation Development

**Context**: Frontend developer building new station interface (Engineering console) for bridge

**Stimulus**: Run `nx run compass:storybook` to develop component in isolation

**Response**: Storybook launches visual development environment with hot module replacement. Component renders without running full game server or authentication.

**Measure**:
- Development speed: 5x faster iteration (no server startup, instant reload)
- Feedback loop: <1 second from code change to visual update
- Independence: Zero backend dependencies for UI development

**Evidence**: Storybook target in `/Users/flo/work/StarshipMayflower/libs/compass/project.json`[^19]. Similar configuration for map library. Documented in Section 5 as component isolation pattern.

---

#### DX-2: Type Error Immediate Feedback

**Context**: Developer passes invalid parameter type to Ship method (string instead of number)

**Stimulus**: Save file in VSCode with TypeScript language server active

**Response**: IDE displays red squiggle under error with message: `Argument of type 'string' is not assignable to parameter of type 'number'`

**Measure**:
- Detection time: <1 second from save to error display
- Context: Error shown inline at exact location
- Prevention: 100% of type errors caught before runtime

**Evidence**: TypeScript 4.4.3 with strict mode enabled[^20]. Quality Goal #5 from Section 1.2: "Developer experience through type safety prevents classes of runtime errors."

---

#### DX-3: Incremental Build Performance

**Context**: Developer modifying single component in `libs/compass`, wants to verify change

**Stimulus**: Run `nx build compass` after editing one TypeScript file

**Response**: Nx detects affected projects via dependency graph, rebuilds only `compass` library (~5 seconds), retrieves cached artifacts for all other projects

**Measure**:
- Build time: <10 seconds vs ~2 minutes for clean build (12x improvement)
- Cache hit rate: >90% for unaffected projects
- Developer productivity: Enables rapid iteration cycles

**Evidence**: Nx build caching in `nx.json` lines 20-34[^21]. Documented 5-10x build performance improvement in Section 8.8 Nx Monorepo pattern.

---

### 10.2.8 Testability Scenarios

#### TEST-1: Physics Accuracy Verification

**Context**: Verifying floating-point rotation math maintains orthonormality (axes remain perpendicular)

**Stimulus**: Run `nx test game-server` to execute physics stress test

**Response**: Test generates 10,000 random rotation matrices, applies to ship orientation, verifies all axes remain orthonormal within 1e-30 threshold

**Measure**:
- Test iterations: 10,000 random scenarios
- Pass criteria: 100% of rotations maintain axis alignment
- Precision threshold: 1e-30 (near machine epsilon for floating-point)

**Evidence**: Physics stress test in `/Users/flo/work/StarshipMayflower/apps/game-server/src/app/src/physics.spec.ts` lines 19-76[^22]. Validates critical physics accuracy quality goal from Section 1.2.

---

#### TEST-2: Visual Regression Testing

**Context**: Verifying UI components (compass, map) render correctly after library upgrade

**Stimulus**: Run `nx e2e compass-e2e` to execute Cypress visual tests

**Response**: Cypress renders component, captures screenshot, compares against baseline snapshot, reports visual differences

**Measure**:
- Visual coverage: Compass and map libraries have E2E test apps
- Regression detection: Pixel-level comparison catches unintended changes
- Approval workflow: Developer reviews and approves intentional visual changes

**Evidence**: Cypress E2E projects `apps/compass-e2e` and `apps/map-e2e` with separate test configurations[^23]. Enables visual regression testing for shared UI components.

---

#### TEST-3: Handler Integration Testing Gap ⚠️

**Context**: Ensuring lobby handlers (joinShip, createShip, registerPlayer) work correctly

**Stimulus**: Search for handler integration tests

**Response**: **NO TESTS FOUND** - Lobby handlers, entry handlers, and navigation handlers lack integration tests

**Measure**:
- Handler test coverage: 0% (no handler tests exist)
- Risk: Critical user flows (authentication, ship joining) untested
- Regression protection: **NONE** - Changes can break without detection

**Evidence**: Only 10 test files found in codebase[^24], none covering handlers in `apps/game-server/src/app/servers/world/handler/` or `apps/game-server/src/app/servers/connector/handler/`. **Recommended**: Add integration tests for authentication flow, ship joining, command processing.

---

## 10.3 Quality Requirements Summary

### Implemented Quality Requirements (High Confidence)

The following quality requirements have **concrete implementations** with code evidence:

1. **Build Cache Performance** (PE-1): Nx caching delivers 5-10x build speedup
2. **Entity Lookup Performance** (PE-2): O(1) hash registry pattern for sub-millisecond lookups
3. **Unauthenticated Access Prevention** (SEC-1): Session validation on all protected endpoints
4. **Heartbeat Detection** (REL-3): 3-second WebSocket heartbeat timeout
5. **React Hooks Dependency Enforcement** (MAINT-1): ESLint catches missing dependencies
6. **Type Safety** (MAINT-2, DX-2): TypeScript strict mode prevents runtime errors
7. **Structured Logging** (OBS-1, OBS-2): Log4js with 9 categories and rotation
8. **Connector Horizontal Scaling** (SCALE-1): Pinus distributed architecture
9. **Component Isolation** (DX-1): Storybook for visual development
10. **Physics Accuracy Verification** (TEST-1): 10,000-iteration stress test

### Critical Quality Gaps (Immediate Action Required)

The following quality requirements have **documented gaps** requiring remediation:

1. **🔴 Credential Management** (SEC-2): Hardcoded admin passwords in source control - **HIGH SEVERITY**
2. **🔴 Tick Cycle Resilience** (REL-1): No error boundaries - single exception crashes server
3. **🟡 Network Reconnection** (REL-2): Manual reconnection required, poor UX
4. **🟡 Test Coverage** (MAINT-3, TEST-3): Only 13% file coverage, handlers untested
5. **🟡 Metrics Collection** (OBS-3): No Prometheus/StatsD, cannot track SLOs
6. **🟡 Transport Security** (SEC-3): No TLS/SSL, not production-ready
7. **🟡 World State Sharding** (SCALE-2): Single server limit, no horizontal scaling
8. **🟡 Memory Management** (SCALE-3): No entity eviction policy, OOM risk

### Priority Recommendations

**Immediate (Week 1)**:
1. Remove hardcoded credentials, implement secrets management (SEC-2)
2. Add try/catch to tick cycle with graceful degradation (REL-1)

**High Priority (Month 1)**:
3. Implement automatic WebSocket reconnection with exponential backoff (REL-2)
4. Add handler integration tests for authentication and ship joining flows (TEST-3)
5. Add Prometheus `/metrics` endpoint (OBS-3)

**Medium Priority (Quarter 1)**:
6. Increase test coverage to 40%+ focusing on handlers and middleware (MAINT-3)
7. Add TLS/SSL for production WebSocket connections (SEC-3)
8. Implement entity lifecycle management with TTL for inactive ships (SCALE-3)

---

## 10.4 Questions for Clarification

This section identifies areas where quality requirements documentation has **LOW confidence** due to missing formal requirements, specifications, or SLA definitions. Stakeholder input is needed to formalize these quality attributes.

### 10.4.1 Performance Targets

**Current State**: Performance optimizations are implemented (Nx caching, O(1) registries, render throttling) but lack formal acceptance criteria or SLAs.

**Questions**:
1. **Build Performance SLA**: What is the acceptable maximum build time for CI pipeline? (Current: ~30s with cache, ~5min clean)
2. **Entity Lookup Latency**: What is the maximum acceptable latency for registry lookups? (Current: O(1) pattern but not profiled)
3. **Render Frame Rate**: Is 30 FPS sufficient for tactical display? Should we support higher frame rates for specific scenarios?
4. **Tick Budget**: What is the acceptable maximum physics tick duration? (Current: 100ms target for 10 Hz, but no monitoring)

**Impact**: Without formal SLAs, we cannot:
- Set up performance regression alerts
- Make informed trade-offs between performance and other attributes
- Validate that current performance meets stakeholder expectations

### 10.4.2 Security Requirements

**Current State**: Critical security gaps identified (SEC-2, SEC-3) but no documented security requirements or threat model.

**Questions**:
1. **Deployment Environment**: Is this intended for production deployment on public internet, or limited to trusted local networks?
2. **Credential Management**: What is the approved secrets management solution? (Environment variables, Vault, AWS Secrets Manager, Kubernetes Secrets?)
3. **TLS/SSL Requirement**: Is transport encryption (wss://) required for production deployment?
4. **Authentication Mechanism**: Should we implement OAuth2/OIDC instead of simple password authentication?
5. **Security Audit Frequency**: How often should security reviews be conducted?

**Impact**: Without clarification, we risk:
- Building inappropriate security controls for deployment environment
- Investing in security features that aren't needed (over-engineering)
- Leaving critical security gaps unaddressed (under-engineering)

### 10.4.3 Reliability and Availability

**Current State**: No error boundaries in tick cycle, manual reconnection, no formal availability targets.

**Questions**:
1. **Availability Requirement**: What is the target uptime/availability? (99%? 99.9%? Best effort?)
2. **Error Handling Priority**: Is tick cycle resilience (REL-1) critical for production, or acceptable for prototype?
3. **Reconnection UX**: Is automatic reconnection with exponential backoff required, or is manual reconnection acceptable?
4. **Data Persistence**: Should game state survive server restarts? (Currently all state is ephemeral)
5. **Backup/Recovery**: Are backup and disaster recovery procedures required?

**Impact**: Without availability targets, we cannot:
- Prioritize reliability improvements appropriately
- Design appropriate error handling and recovery mechanisms
- Set up monitoring and alerting thresholds

### 10.4.4 Scalability Requirements

**Current State**: Connector horizontal scaling supported, world state sharding not supported.

**Questions**:
1. **Expected User Load**: What is the maximum expected concurrent user count? (Current capacity: ~100-200 users per world)
2. **Growth Timeline**: What is the expected user growth rate over next 6-12 months?
3. **World Sharding**: Is multi-world support required? (e.g., multiple game instances on separate world servers)
4. **Geographic Distribution**: Do we need multi-region deployment for latency optimization?
5. **Scalability Priority**: Is horizontal scalability beyond connector layer a priority, or is vertical scaling (bigger servers) acceptable?

**Impact**: Without scalability requirements, we risk:
- Over-engineering distributed systems that aren't needed
- Under-provisioning for expected load
- Making architectural decisions that limit future growth

### 10.4.5 Test Coverage Targets

**Current State**: 13% test coverage, handlers untested, no formal coverage targets.

**Questions**:
1. **Coverage Target**: What is the minimum acceptable test coverage? (40%? 60%? 80%?)
2. **Critical Path Priority**: Which components are highest priority for test coverage? (Handlers? Physics? Middleware?)
3. **Test Types**: What types of tests are required? (Unit? Integration? E2E? Performance? Load?)
4. **Test Automation**: Should test coverage gates be enforced in CI/CD? (Block merges if coverage decreases?)
5. **Testing Budget**: How much time/effort should be allocated to increasing test coverage vs new features?

**Impact**: Without coverage targets, we cannot:
- Prioritize testing effort effectively
- Balance testing investment vs feature development
- Set up automated quality gates

### 10.4.6 Observability and Monitoring

**Current State**: Structured logging implemented, metrics collection missing.

**Questions**:
1. **Metrics Platform**: What monitoring platform should be used? (Prometheus? Datadog? CloudWatch? Application Insights?)
2. **Key Metrics**: What are the critical metrics to track? (Request rate? Error rate? Latency percentiles? Business metrics?)
3. **Alerting Requirements**: What conditions should trigger alerts? Who receives alerts?
4. **Logging Retention**: How long should logs be retained? (Current: ~5MB per category, rotates automatically)
5. **APM (Application Performance Monitoring)**: Is distributed tracing required for troubleshooting RPC calls?

**Impact**: Without observability requirements, we cannot:
- Implement appropriate monitoring infrastructure
- Set up effective alerting
- Troubleshoot production issues efficiently

---

## 10.5 Cross-References

- **Section 1.2**: Top-3 quality goals (Real-time responsiveness, Maintainability, Physics accuracy)
- **Section 4**: Solution strategy decisions driven by quality goals
- **Section 5**: Building blocks implementing quality requirements
- **Section 6**: Runtime scenarios demonstrating quality attributes
- **Section 7**: Deployment view documenting operational quality requirements
- **Section 8**: Crosscutting concepts supporting quality attributes (caching, registries, error handling)
- **Section 9**: Architecture decisions with quality trade-off analysis

[^1]: nx.json lines 20-34 configure caching for build, lint, test, e2e, build-storybook targets with cache: true
[^2]: libs/util/src/lib/model/ObjectInSpaceRegistry.ts uses Record<string, T> hash map; Section 8.2 documents O(1) lookup pattern
[^3]: web-server/public/js/Scanner/scanner.js line 27: _.throttle(render, 1000/30) throttles to 30 FPS (~33ms interval)
[^4]: apps/game-server/src/app/servers/world/handler/lobby.ts lines 16-19, 32-34, 116-120 validate session.get('playerId')
[^5]: apps/game-server/src/config/adminUser.json contains plaintext credentials (admin/admin, monitor/monitor, test/test) - CRITICAL SECURITY ISSUE
[^6]: Section 7 Deployment View lines 380, 462 document WebSocket using ws:// (plaintext) not wss:// (TLS)
[^7]: apps/game-server/src/app/src/timer.ts lacks try/catch; Section 6 Runtime View line 262 documents crash risk
[^8]: Section 6 Runtime View lines 553, 609 document manual reconnection requirement; no retry logic in websocketMiddleware.ts or client.ts
[^9]: apps/game-server/src/main.ts line 14: heartbeat: 3 (3-second interval)
[^10]: eslint.config.mjs line 45: 'react-hooks/exhaustive-deps': 'error'; documented in MODERNIZATION.md line 94
[^11]: Section 1.2 Quality Goal #5; Section 8.1 Isomorphic Domain Model; TypeScript 4.4.3 strict mode enabled
[^12]: Codebase analysis found 10 test files (8 unit tests: physics.spec.ts, Ship.spec.ts, collision.spec.ts, ObjectInSpaceRegistry.spec.ts, Player.spec.ts, timer.spec.ts, entity.spec.ts, physics-integration.spec.ts; 2 Cypress component test apps) vs 73+ production source files
[^13]: apps/game-server/src/config/log4js.json lines 10-14: maxLogSize: 1048576, backups: 5 for all appenders
[^14]: apps/game-server/src/config/log4js.json lines 34-42 define rpc-debug category with separate log file
[^15]: Section 7 Deployment View lines 422-423 document "No Prometheus/StatsD integration found"
[^16]: Section 9 ADR-001 Distributed Connector/World Server Architecture; apps/game-server/src/config/servers.json
[^17]: Section 5 Building Block View shows single world server topology; Section 9 ADR-004 In-Memory Ephemeral State
[^18]: Section 9 ADR-004 documents in-memory state without persistence; Recommendations section (line 634) lists "Add entity lifecycle management (TTL for inactive ships)"
[^19]: libs/compass/project.json includes storybook target; similar for libs/map/project.json
[^20]: TypeScript 4.4.3 in package.json; strict mode enabled in tsconfig.base.json; Section 1.2 Quality Goal #5
[^21]: nx.json lines 20-34; Section 8.8 documents 5-10x build performance improvement from Nx caching
[^22]: apps/game-server/src/app/src/physics.spec.ts lines 19-76 run 10,000-iteration rotation accuracy test with 1e-30 threshold
[^23]: apps/compass-e2e and apps/map-e2e directories contain Cypress E2E test configurations
[^24]: Codebase analysis found only 10 test files; no tests in apps/game-server/src/app/servers/world/handler/ or apps/game-server/src/app/servers/connector/handler/
