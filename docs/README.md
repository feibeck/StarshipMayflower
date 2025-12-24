# Starship Mayflower Documentation

## Overview

This directory contains comprehensive documentation for the Starship Mayflower multiplayer space game.

## Documentation Index

### Lobby System

The lobby is where players create/join ships, select stations, and coordinate game start.

- **[lobby-system.md](lobby-system.md)** - Complete specification documentation
  - Business rules and requirements
  - User flows
  - Edge cases

- **[features/lobby.feature](features/lobby.feature)** - BDD test scenarios
  - Gherkin-formatted test cases
  - Covers all lobby functionality
  - Ready for automated testing
  - ~90 test scenarios

## For Different Audiences

### 👨‍💻 Developers

1. Read [lobby-system.md](lobby-system.md) for complete understanding
2. Use [features/lobby.feature](features/lobby.feature) for test-driven development
3. Reference business rules section for requirements

### 🤖 AI Assistants

1. Read [lobby-system.md](lobby-system.md) for complete context
2. Follow business rules exactly as documented
3. Use [features/lobby.feature](features/lobby.feature) to validate implementations

### 🧪 QA Engineers

1. Use [features/lobby.feature](features/lobby.feature) as test specification
2. Reference [lobby-system.md](lobby-system.md) for expected behavior
3. Check edge cases section for boundary testing

### 📝 Product Owners

1. Read "Business Rules" section in [lobby-system.md](lobby-system.md)
2. Review user flows for UX understanding

## Document Structure

```
docs/
├── README.md                    # This file
├── lobby-system.md              # Full lobby documentation
└── features/
    └── lobby.feature            # BDD test scenarios (Gherkin)
```

## Key Lobby Rules

For quick reference, the 6 core lobby rules are:

1. **One Ship Per Player** - Must release all stations before switching ships
2. **Station Requirements** - Need ≥1 station to ready up
3. **15-Second Countdown** - Game starts 15 seconds after all players ready
4. **Countdown Interruption** - New players or unready players cancel countdown
5. **Game Start Transition** - Players navigate to their station views
6. **Late Joining** - Players can join after game starts

See [lobby-system.md](lobby-system.md) for detailed explanations.

## Testing

### Running BDD Tests

```bash
# Install Cucumber (if not already installed)
yarn add -D @cucumber/cucumber

# Run lobby feature tests
yarn cucumber-js docs/features/lobby.feature
```

### Manual Testing

See "User Flows" section in [lobby-system.md](lobby-system.md)

### QA Commands

```bash
yarn type-check    # TypeScript validation
yarn lint          # ESLint + Prettier
yarn format        # Auto-format code
yarn test          # Unit tests
```


## Contributing

When making changes to the lobby system:

1. ✅ Update documentation first
2. ✅ Add/update BDD scenarios if needed
3. ✅ Implement the changes
4. ✅ Run all QA tools
5. ✅ Test manually
6. ✅ Commit with clear message

## Version History

| Version | Date       | Changes               |
| ------- | ---------- | --------------------- |
| 1.0     | 2024-12-22 | Initial documentation |

## Questions or Feedback?

- Check the glossary in [lobby-system.md](lobby-system.md)
- Review BDD scenarios in [features/lobby.feature](features/lobby.feature)
- Ask the development team

---

**Maintained by:** Development Team
**Last Updated:** 2024-12-22
