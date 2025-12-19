# Claude Code - Projektinformationen

## Package Manager

**Verwende ausschließlich Yarn, niemals npm!**

```bash
yarn install          # Dependencies installieren
yarn add <package>    # Dependency hinzufügen
yarn upgrade <package># Dependency aktualisieren
```

- `yarn.lock` ist die einzige Lock-Datei
- `package-lock.json` muss gelöscht werden, falls es erstellt wird

## Projektstruktur (Nx Monorepo)

### Apps

- **starship-mayflower-frontend**: Haupt-Frontend (React 19)
- **game-server-next**: Neuer Game Server (WebSocket, Port 10000) ✅ **Verwenden!**
- **game-server**: Legacy Server ❌ Nicht verwenden

### Libs

- **game-server-lib**: Shared Server Logic (SocketHandler)
- **compass**, **map**, **util**: Feature-Libraries

## Wichtige Befehle

```bash
# Starten
nx serve game-server-next
nx serve starship-mayflower-frontend

# Build & Test
nx build <app-name>
nx test <app-name>
yarn type-check

# Nx Tools
nx dep-graph         # Dependency-Graph anzeigen
```

## Tech Stack

- **Frontend**: React 19, Redux Toolkit 2.5, React Router 6.28, Emotion, Three.js
- **Backend**: Pinus (Game Server), WebSocket (ws 8.x)
- **Tools**: Nx 20.3.0, TypeScript 5.7.2, Jest, Cypress

## Code-Qualität & Best Practices

**Qualität hat höchste Priorität!**

- **QA Tools IMMER ausführen**:

  ```bash
  yarn type-check    # TypeScript-Prüfung
  yarn lint          # Linting + Prettier
  yarn format:check  # Nur Prettier-Check
  yarn format        # Code formatieren
  yarn test          # Unit Tests
  ```

  **WICHTIG**:
  - **VOR jedem Commit**: Alle QA-Tools laufen lassen
  - **VOR jeder Erfolgsmeldung**: Alle QA-Tools testen
  - Niemals Code committen oder als "fertig" melden ohne vorherige QA-Prüfung
  - Code automatisch formatieren mit `yarn format`

- **Clean Code Prinzipien**:
  - Kleine Methoden (Single Responsibility)
  - Kleine Klassen
  - SOLID-Prinzipien befolgen
  - Lesbarer, selbsterklärender Code
  - Keine Code-Duplikation (DRY)

## Git

- Main Branch: `master`
- Kommunikation Client ↔ Server funktioniert bereits (Proof of Concept)

### Commit Message Guidelines

- **Kurz und prägnant**: Commit-Nachrichten sollen knapp und auf den Punkt sein
- **Keine AI-Erwähnung**: Keine Hinweise auf Claude, AI oder automatische Generierung
- **Zusammenfassung statt Details**: Nicht alle kleinen Änderungen einzeln auflisten, nur die Kernänderung beschreiben

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
