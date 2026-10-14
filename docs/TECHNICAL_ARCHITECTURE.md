# Arrow Escape — Technical Architecture Document

## 1. Architectural Philosophy

The key architectural principle for Arrow Escape is **Strict Separation of Engine Logic from UI Rendering**.

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│   (React Native Views, Screens, Reanimated Worklets)   │
└───────────────────────────▲────────────────────────────┘
                            │ Dispatches User Actions
                            │ Consumes Immutable Game State
┌───────────────────────────▼────────────────────────────┐
│                    Game Engine Core                    │
│     (Pure TypeScript, Zero Native or React Imports)    │
│  - Move Validator    - Raycaster    - Solver / Hint    │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                     Service Layer                      │
│   - ProgressService     - AdsService (AdMob Bridge)    │
│   - BillingService      - Audio / Haptics Service      │
└────────────────────────────────────────────────────────┘
```

Benefits:
- **100% Unit Testable Engine:** Engine tests run in standard Node.js/Jest in milliseconds without mocking React, DOM, or React Native runtime.
- **Solver CLI Tools:** The exact same engine code runs in CI / node scripts to validate level JSON packs during build time.
- **UI Flexibility:** Swapping rendering from standard Views to Skia or Web Canvas requires zero changes to the underlying gameplay engine.

---

## 2. Directory Structure

```text
arrow-escape/
├── android/                   # Native Android configuration, gradle, assets
├── docs/                      # Knowledge Base & Design Specifications
│   ├── PRD.md
│   ├── GAME_DESIGN_SPEC.md
│   ├── LEVEL_DESIGN_AND_SOLVER_SPEC.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── MONETIZATION_AND_SERVICES.md
│   └── DEVELOPMENT_ROADMAP.md
├── scripts/                   # CLI Tools (Level generator, batch validator)
│   ├── validateLevels.ts
│   └── generateLevel.ts
├── src/
│   ├── assets/                # Audio files (mp3), Icons, Fonts
│   │   ├── sfx/
│   │   └── fonts/
│   ├── engine/                # PURE TYPESCRIPT GAME ENGINE
│   │   ├── types.ts           # Core domain models
│   │   ├── raycaster.ts       # Path collision math
│   │   ├── moveValidator.ts   # Move validation & obstacle detection
│   │   ├── gameState.ts       # Immutable game state reducer
│   │   ├── hintEngine.ts      # Unblocked arrow resolver
│   │   └── solver.ts          # Backtracking puzzle solver
│   ├── services/              # PERSISTENCE & HARDWARE ABSTRACTIONS
│   │   ├── storage/
│   │   │   ├── progressStorage.ts
│   │   │   └── settingsStorage.ts
│   │   ├── ads/
│   │   │   ├── adsInterface.ts
│   │   │   ├── admobProvider.ts
│   │   │   └── mockAdsProvider.ts
│   │   ├── billing/
│   │   │   ├── billingInterface.ts
│   │   │   └── playBillingProvider.ts
│   │   ├── audio/
│   │   │   └── audioService.ts
│   │   └── haptics/
│   │       └── hapticsService.ts
│   ├── data/                  # STATIC CONTENT
│   │   ├── levels/
│   │   │   ├── index.ts
│   │   │   ├── packCore.json
│   │   │   └── packTutorial.json
│   │   └── themes/
│   │       └── themeDefinitions.ts
│   ├── components/            # REUSABLE UI
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Header.tsx
│   │   └── game/
│   │       ├── Board.tsx
│   │       ├── ArrowTile.tsx
│   │       ├── ParticleTrail.tsx
│   │       ├── GameControls.tsx
│   │       └── VictoryOverlay.tsx
│   ├── screens/               # APPLICATION SCREENS
│   │   ├── HomeScreen.tsx
│   │   ├── LevelSelectScreen.tsx
│   │   ├── GamePlayScreen.tsx
│   │   ├── DailyChallengeScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── theme/                 # DESIGN SYSTEM TOKENS
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── layout.ts
│   └── App.tsx
├── package.json
└── tsconfig.json
```

---

## 3. High-Performance Animation Architecture (Reanimated Worklets)

Casual puzzle games rely heavily on **tactile responsiveness**. Any frame drop or touch lag directly destroys player delight.

### 3.1 Worklet-Driven Arrow Flyout
To ensure 60fps/120fps fluid escapes:
- The arrow's translation and opacity animations run entirely on the UI thread via `react-native-reanimated`.
- When an arrow is tapped, the engine immediately verifies if the move is valid synchronously.
- If valid:
  - The component triggers `withTiming` / `withSpring` along the escape vector $(D_x \times \text{distance}, D_y \times \text{distance})$.
  - On animation completion (`runOnJS(onAnimationComplete)`), the engine state officially commits the removal.

---

## 4. Local Persistence Schema (AsyncStorage)

Key: `@arrow_escape_user_progress_v1`
```json
{
  "unlockedLevel": 14,
  "levelStats": {
    "1": { "stars": 3, "bestMoves": 2, "completedAt": 1728500000 },
    "2": { "stars": 3, "bestMoves": 4, "completedAt": 1728500050 }
  },
  "hintsAvailable": 3,
  "dailyStats": {
    "lastCompletedDate": "2026-10-10",
    "currentStreak": 4,
    "longestStreak": 7
  },
  "settings": {
    "soundEnabled": true,
    "hapticsEnabled": true,
    "selectedTheme": "dawn_softness"
  },
  "entitlements": {
    "adsRemoved": false,
    "purchaseToken": null
  }
}
```
All read/writes are batched and cached in-memory with debounced async sync to disk to prevent I/O blocking.

---

## 5. Save Integrity, Resiliency & Cloud Conflict Resolution

### A. Threat Model & Philosophy
In an offline-first single-player casual puzzle game:
- Client-side checksum hashing (`computeChecksum`) operates as an **accidental corruption detector and casual tamper deterrent**, not an absolute security boundary against dedicated reverse engineering.
- Robustness and player data safety take priority: the game never crashes on malformed save data.

### B. Defensive Validation & Error Recovery
1. **Schema Sanitization (`sanitizeProgress`)**: Validates data types, clamps `unlockedLevel` to `1..501`, clamps `hintsAvailable` to `0..9999`, bounds star ratings to `1..3`, and verifies non-negative move counts.
2. **Corrupt Payload Recovery**: If storage contains malformed or unparseable JSON, the engine catches the exception gracefully, logs a diagnostic warning, and restores clean default progress without crashing.
3. **App Update Migration**: Progress envelopes support backward-compatible payload migration and field additions.

### C. Cloud Save Conflict Resolution (`resolveSaveConflict`)
When synchronizing with Google Play Cloud Save across multiple devices:
- **Resolution Strategy**: Deterministic **"Highest Progress Union"** policy.
- **Level Progress**: `Math.max(local.unlockedLevel, remote.unlockedLevel)`.
- **Level Records**: Union of completed levels. For overlapping levels, preserves highest star rating and lowest move count.
- **Hints Bank**: `Math.max(local.hintsAvailable, remote.hintsAvailable)`.
- **Entitlements**: `local.adsRemoved || remote.adsRemoved` (purchases never lost).
- **Cosmetics & Badges**: Set union of unlocked cosmetics and badges across both devices.
