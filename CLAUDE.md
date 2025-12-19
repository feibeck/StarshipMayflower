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

- **QA Tools nach jedem Schritt ausführen**:
  ```bash
  yarn type-check    # TypeScript-Prüfung
  yarn lint          # Linting
  yarn test          # Unit Tests
  ```

- **Clean Code Prinzipien**:
  - Kleine Methoden (Single Responsibility)
  - Kleine Klassen
  - SOLID-Prinzipien befolgen
  - Lesbarer, selbsterklärender Code
  - Keine Code-Duplikation (DRY)

## Git

- Main Branch: `master`
- Kommunikation Client ↔ Server funktioniert bereits (Proof of Concept)
