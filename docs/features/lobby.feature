Feature: Lobby System
  As a player
  I want to join ships, select stations, and coordinate game start
  So that I can play the game with other players

  Background:
    Given the game server is running
    And the lobby is empty

  # ============================================================================
  # Ship Management
  # ============================================================================

  Scenario: Player creates a new ship
    Given player "Alice" is in the lobby
    When "Alice" creates a ship named "USS Enterprise"
    Then ship "USS Enterprise" should exist
    And all players in lobby should see ship "USS Enterprise"

  Scenario: Player selects an existing ship
    Given player "Alice" is in the lobby
    And ship "USS Enterprise" exists
    When "Alice" selects ship "USS Enterprise"
    Then "Alice" should have ship "USS Enterprise" selected
    And "Alice" should be able to see available stations on "USS Enterprise"

  Scenario: Player joins ship by taking a station
    Given player "Alice" is in the lobby
    And ship "USS Enterprise" exists
    When "Alice" selects ship "USS Enterprise"
    And "Alice" takes station "helm"
    Then "Alice" should be on ship "USS Enterprise"
    And ship "USS Enterprise" should have 1 player with stations
    And all players should see "Alice" on "USS Enterprise"

  # ============================================================================
  # Ship Switching Prevention (Rule 1)
  # ============================================================================

  Scenario: Player cannot take station on another ship while holding stations
    Given ship "USS Enterprise" exists
    And ship "Voyager" exists
    And player "Alice" has selected ship "USS Enterprise"
    And "Alice" has taken station "helm"
    When "Alice" selects ship "Voyager"
    And "Alice" attempts to take station "weapons"
    Then the request should fail with error "Please release all stations before switching ships"
    And "Alice" should still be on ship "USS Enterprise"
    And "Alice" should still have station "helm"

  Scenario: Player can switch ships after releasing all stations
    Given ship "USS Enterprise" exists
    And ship "Voyager" exists
    And player "Alice" has selected ship "USS Enterprise"
    And "Alice" has taken station "helm"
    And "Alice" has taken station "weapons"
    When "Alice" releases station "helm"
    And "Alice" releases station "weapons"
    And "Alice" selects ship "Voyager"
    And "Alice" takes station "science"
    Then "Alice" should be on ship "Voyager"
    And "Alice" should not be on ship "USS Enterprise"
    And "Alice" should have station "science"

  Scenario: Player with no stations can freely select different ships
    Given ship "USS Enterprise" exists
    And ship "Voyager" exists
    And player "Alice" has selected ship "USS Enterprise"
    And "Alice" has no stations
    When "Alice" selects ship "Voyager"
    Then "Alice" should have ship "Voyager" selected
    And "Alice" should not be on ship "USS Enterprise"

  # ============================================================================
  # Station Management (Rule 2)
  # ============================================================================

  Scenario: Player takes an available station
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    And station "helm" is available on "USS Enterprise"
    When "Alice" takes station "helm"
    Then "Alice" should have station "helm"
    And "Alice" should be on ship "USS Enterprise"
    And station "helm" should be taken by "Alice" on "USS Enterprise"
    And all players should see "helm" taken by "Alice" on "USS Enterprise"

  Scenario: Player cannot take an occupied station
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    And player "Bob" has selected ship "USS Enterprise"
    And "Alice" has taken station "helm"
    When "Bob" attempts to take station "helm"
    Then the request should fail with error "Position already taken"
    And station "helm" should still be taken by "Alice"

  Scenario: Player takes multiple stations
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    When "Alice" takes station "helm"
    And "Alice" takes station "weapons"
    And "Alice" takes station "science"
    Then "Alice" should have 3 stations
    And "Alice" should have stations "helm, weapons, science"

  Scenario: Player releases a station
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    When "Alice" releases station "helm"
    Then "Alice" should not have station "helm"
    And "Alice" should not be on ship "USS Enterprise"
    And station "helm" should be available on "USS Enterprise"
    And all players should see "helm" available on "USS Enterprise"

  Scenario: Player cannot release a station they don't have
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    And "Alice" has no stations
    When "Alice" attempts to release station "helm"
    Then the request should fail with error "Position not taken by player"

  Scenario: Ready button is disabled without stations
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    And "Alice" has no stations
    Then the "Ready to Play" button should be disabled for "Alice"

  Scenario: Ready button is enabled with at least one station
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    When "Alice" takes station "helm"
    Then the "Ready to Play" button should be enabled for "Alice"

  # ============================================================================
  # Ready Status
  # ============================================================================

  Scenario: Player marks themselves ready
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And "Alice" is not ready
    When "Alice" marks themselves ready
    Then "Alice" should be ready
    And all players should see "Alice" as ready

  Scenario: Player marks themselves not ready
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And "Alice" is ready
    When "Alice" marks themselves not ready
    Then "Alice" should not be ready
    And all players should see "Alice" as not ready

  Scenario: Player cannot ready without stations
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    And "Alice" has no stations
    When "Alice" attempts to mark themselves ready
    Then the request should fail
    And "Alice" should not be ready

  Scenario: Releasing last station unreadies player
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And "Alice" is ready
    When "Alice" releases station "helm"
    Then "Alice" should not be ready
    And "Alice" should have no stations
    And "Alice" should not be on ship "USS Enterprise"

  # ============================================================================
  # Countdown System (Rule 3) - GLOBAL GAME
  # ============================================================================

  Scenario: Countdown starts when all players in lobby are ready
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And "Alice" is ready
    And "Bob" is not ready
    When "Bob" marks themselves ready
    Then global countdown should start
    And countdown should be 15 seconds
    And ALL players in lobby should see countdown started

  Scenario: Countdown ticks down every second
    Given global countdown is active at 15 seconds
    When 1 second passes
    Then countdown should be 14 seconds
    And ALL players in lobby should see countdown at 14 seconds
    When 1 second passes
    Then countdown should be 13 seconds
    And ALL players in lobby should see countdown at 13 seconds

  Scenario: Game starts when countdown reaches zero with multiple ships
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And global countdown is active at 1 second
    When 1 second passes
    Then the global game should start
    And ALL players in lobby should receive "GameStarted" event
    And the game loop should be running
    And ALL ships with players should be in the game world

  Scenario: Single player can start game alone
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And "Alice" is not ready
    When "Alice" marks themselves ready
    Then global countdown should start
    And countdown should be 15 seconds
    When countdown reaches 0
    Then the global game should start
    And ship "USS Enterprise" should be in the game world

  # ============================================================================
  # Countdown Interruption (Rule 4) - GLOBAL GAME
  # ============================================================================

  Scenario: New player taking station on any ship cancels countdown
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    And global countdown is active at 7 seconds
    When player "Charlie" selects ship "USS Enterprise"
    And "Charlie" takes station "science"
    Then global countdown should be cancelled
    And ALL players in lobby should see countdown cancelled
    And "Alice" should still be ready
    And "Bob" should still be ready
    And "Charlie" should not be ready

  Scenario: Any player unreadying cancels countdown
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    And global countdown is active at 10 seconds
    When "Alice" marks themselves not ready
    Then global countdown should be cancelled
    And ALL players in lobby should see countdown cancelled
    And "Bob" should still be ready

  Scenario: Countdown restarts when all players across all ships ready again
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And global countdown was cancelled at 7 seconds
    And "Alice" is ready
    And "Bob" is not ready
    When "Bob" marks themselves ready
    Then global countdown should start
    And countdown should be 15 seconds
    And ALL players in lobby should see countdown at 15 seconds

  Scenario: Ready status persists after countdown cancellation across ships
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    And global countdown is active at 5 seconds
    When player "Charlie" creates ship "Defiant"
    And "Charlie" takes station "science"
    Then global countdown should be cancelled
    And "Alice" should still be ready
    And "Bob" should still be ready
    And "Charlie" should not be ready

  Scenario: Any player releasing last station during countdown cancels it
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    And global countdown is active at 8 seconds
    When "Alice" releases station "helm"
    Then global countdown should be cancelled
    And "Alice" should not be ready
    And "Alice" should not be on ship "USS Enterprise"
    And "Bob" should still be ready

  # ============================================================================
  # Game Start Transition (Rule 5)
  # ============================================================================

  Scenario: Player with one station navigates to that station
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And "Alice" is ready
    And countdown completes
    When the game starts
    Then "Alice" should navigate to station view "helm"

  Scenario: Player with multiple stations navigates to first station alphabetically
    Given ship "USS Enterprise" has player "Alice" with stations "weapons, helm, science"
    And "Alice" is ready
    And countdown completes
    When the game starts
    Then "Alice" should navigate to station view "helm"

  Scenario: All players across multiple ships navigate to their stations
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And ship "Defiant" has player "Charlie" with stations "science, comm"
    And all players are ready
    And global countdown completes
    When the global game starts
    Then "Alice" should navigate to station view "helm"
    And "Bob" should navigate to station view "weapons"
    And "Charlie" should navigate to station view "comm"
    And ALL ships with players should be in the game world

  # ============================================================================
  # Edge Cases
  # ============================================================================

  Scenario: Player disconnects during countdown doesn't affect other players
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    And global countdown is active at 10 seconds
    When "Alice" disconnects
    Then global countdown should continue
    When countdown reaches 0
    Then the global game should start
    And "Bob" should navigate to their station
    And ship "Voyager" should be in the game world

  Scenario: Countdown doesn't start duplicate game
    Given the game is already running
    And ship "USS Enterprise" has player "Alice" with station "helm"
    And "Alice" is ready
    When countdown reaches 0
    Then no new game should start
    And a warning should be logged

  Scenario: Empty ship has no countdown
    Given ship "USS Enterprise" exists
    And ship "USS Enterprise" has no players with stations
    Then countdown should not be active

  Scenario: Lobby with not-ready players has no countdown
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And "Alice" is not ready
    And "Bob" is not ready
    Then global countdown should not be active

  # ============================================================================
  # Real-time Updates
  # ============================================================================

  Scenario: Ship updates broadcast to all lobby players
    Given player "Alice" is in the lobby viewing ship list
    And player "Bob" is in the lobby viewing ship list
    When player "Charlie" creates a ship named "USS Enterprise"
    Then "Alice" should see ship "USS Enterprise" in the list
    And "Bob" should see ship "USS Enterprise" in the list

  Scenario: Station changes broadcast to all players
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And player "Bob" has selected ship "USS Enterprise"
    When "Bob" takes station "weapons"
    Then "Alice" should see "Bob" has taken station "weapons"
    And "Alice" should see station "weapons" as unavailable

  Scenario: Ready status changes broadcast to relevant players
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "USS Enterprise" has player "Bob" with station "weapons"
    When "Alice" marks themselves ready
    Then "Bob" should see "Alice" as ready

  Scenario: Countdown events broadcast to ALL players in lobby
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    When global countdown starts
    Then "Alice" should see countdown UI at 15 seconds
    And "Bob" should see countdown UI at 15 seconds
    When 1 second passes
    Then "Alice" should see countdown UI at 14 seconds
    And "Bob" should see countdown UI at 14 seconds

  # ============================================================================
  # Complex Scenarios
  # ============================================================================

  Scenario: Full game start flow with multiple interruptions across ships
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    And global countdown starts at 15 seconds
    When countdown reaches 8 seconds
    And player "Charlie" creates ship "Defiant"
    And "Charlie" takes station "science"
    Then global countdown should be cancelled
    And "Alice" should still be ready
    And "Bob" should still be ready
    When "Charlie" marks themselves ready
    Then global countdown should start at 15 seconds
    When countdown reaches 12 seconds
    And "Alice" marks themselves not ready
    Then global countdown should be cancelled
    When "Alice" marks themselves ready
    Then global countdown should start at 15 seconds
    When countdown reaches 0
    Then the global game should start
    And all players should navigate to their stations
    And ALL three ships should be in the game world

  Scenario: Player switching ships affects global countdown
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    And ship "Voyager" has player "Bob" with station "weapons"
    And both players are ready
    And global countdown is active at 5 seconds
    When "Alice" releases station "helm"
    Then global countdown should be cancelled
    And ship "USS Enterprise" should have 0 players with stations
    And "Bob" should still be ready

  Scenario: Multiple ships share single global countdown
    Given ship "USS Enterprise" has players "Alice" and "Bob" with stations
    And ship "Voyager" has players "Charlie" and "Diana" with stations
    And all players are ready
    When global countdown starts
    Then there should be ONE countdown for all ships
    And ALL four players should see the same countdown
    When countdown reaches 0
    Then the global game should start
    And both ships should be in the game world together

  # ============================================================================
  # Error Handling
  # ============================================================================

  Scenario: Graceful handling of network disconnection
    Given ship "USS Enterprise" has player "Alice" with station "helm"
    When "Alice" loses network connection
    Then "Alice" should be marked as disconnected
    And station "helm" should still be taken by "Alice"
    When "Alice" reconnects
    Then "Alice" should still have station "helm"
    And "Alice" should still be on ship "USS Enterprise"

  Scenario: Handling invalid ship ID
    Given player "Alice" is in the lobby
    When "Alice" attempts to select ship "invalid-ship-id"
    Then the request should fail with error "Unknown ship"

  Scenario: Handling invalid station name
    Given ship "USS Enterprise" exists
    And player "Alice" has selected ship "USS Enterprise"
    When "Alice" attempts to take station "invalid-station"
    Then the request should fail with error
    And "Alice" should have no stations

  Scenario: Handling duplicate ship name
    Given ship "USS Enterprise" exists
    When player "Alice" attempts to create ship named "USS Enterprise"
    Then the request should fail with error "Ship already exists"

  # ============================================================================
  # Late Joining (Rule 6)
  # ============================================================================

  Scenario: Player joins game after it has started
    Given the global game is running
    And ship "USS Enterprise" has player "Alice" with station "helm" in game
    And player "Bob" joins the lobby
    When "Bob" selects ship "Voyager"
    And "Bob" takes station "weapons"
    And "Bob" marks themselves ready
    Then "Bob" should immediately join the running game
    And "Bob" should navigate to station view "weapons"
    And ship "Voyager" should spawn in the game world
    And no countdown should occur

  Scenario: Late joiner creates new ship
    Given the global game is running
    And player "Charlie" joins the lobby
    When "Charlie" creates ship "Defiant"
    And "Charlie" takes station "science"
    And "Charlie" marks themselves ready
    Then "Charlie" should immediately join the running game
    And ship "Defiant" should spawn in the game world
    And "Charlie" should navigate to station view "science"

  Scenario: Late joiner joins existing ship in game
    Given the global game is running
    And ship "USS Enterprise" has player "Alice" with station "helm" in game
    And player "Bob" joins the lobby
    When "Bob" selects ship "USS Enterprise"
    And "Bob" takes station "weapons"
    And "Bob" marks themselves ready
    Then "Bob" should immediately join the running game
    And "Bob" should navigate to station view "weapons"
    And ship "USS Enterprise" should be in game with 2 players

  Scenario: Empty ship does not spawn in game
    Given the global game is running
    And ship "Empty Ship" exists with no players
    Then ship "Empty Ship" should not be in the game world
    And ship "Empty Ship" should be visible in lobby

  Scenario: First player on empty ship spawns it when ready
    Given the global game is running
    And ship "Dormant Ship" exists with no players
    When player "Alice" selects ship "Dormant Ship"
    And "Alice" takes station "helm"
    And "Alice" marks themselves ready
    Then ship "Dormant Ship" should spawn in the game world
    And "Alice" should navigate to station view "helm"

  Scenario: All players leave ship during game
    Given the global game is running
    And ship "USS Enterprise" has players "Alice" and "Bob" in game
    When "Alice" disconnects
    And "Bob" disconnects
    Then ship "USS Enterprise" should despawn from game world
    But ship "USS Enterprise" should still exist in lobby
    And ship "USS Enterprise" should have 0 players with stations

  Scenario: Multiple late joiners at different times
    Given the global game is running
    When player "Charlie" joins lobby at time T+10
    And "Charlie" selects ship "Defiant"
    And "Charlie" takes station "helm"
    And "Charlie" marks themselves ready
    Then "Charlie" should join the running game immediately
    When player "Diana" joins lobby at time T+30
    And "Diana" selects ship "Defiant"
    And "Diana" takes station "weapons"
    And "Diana" marks themselves ready
    Then "Diana" should join the running game immediately
    And ship "Defiant" should have 2 players in game
