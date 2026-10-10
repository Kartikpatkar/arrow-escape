# Changelog

All notable changes to **Arrow Escape** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-10

### 🚀 Initial Production Release Candidate (Feature Complete)

#### Added
- **Core Engine & Solver (`src/engine/`)**
  - Pure TypeScript zero-dependency headless game engine.
  - Mathematical raycasting algorithm (`raycaster.ts`) supporting grid bounds and collision paths.
  - Deterministic move validator (`moveValidator.ts`) with clear path resolution and blocker detection.
  - Backtracking puzzle solver (`solver.ts`) with state-space memoization for sub-10ms solution trees.
  - Hint engine (`hintEngine.ts`) delivering player hints with optimal move lookaheads.
  - Immutable state transitions and move history in `gameState.ts`.
  - 30 curated core puzzle levels (`packCore.json`) validated 100% solvable with automated test runner (`validateLevels.ts`).

- **Playable UI & Dynamic Motion (`src/components/game/`)**
  - Interactive grid board with responsive sizing for 3x3 up to 6x6 configurations (`Board.tsx`).
  - Tactile arrow components with spring flyout animations and invalid shake feedback (`ArrowTile.tsx`).
  - Game header with move counter, level titles, and 3-star rating indicators (`GameHeader.tsx`).
  - Floating bottom controls for Undo, Hint (with badge count), and Restart (`GameControls.tsx`).
  - Victory celebration overlay with dynamic star ratings and confetti particles (`VictoryOverlay.tsx`).
  - Level selection modal with lock states, star tallies, and pagination (`LevelSelectModal.tsx`).

- **Persistence & Progress Engine (`src/services/storage/`)**
  - Universal storage adapter (`progressStorage.ts`) with AsyncStorage/localStorage and in-memory SSR fallback.
  - Persistent level completion records, 3-star achievements, best moves, and timestamps.
  - Hint bank persistence across app restarts.
  - Theme preference and sound/haptics settings persistence.

- **Audio & Haptic Feedback (`src/services/audio/`, `src/services/haptics/`)**
  - Procedural WebAudio synthesizer (`audioService.ts`) with zero external sound asset dependencies.
  - Ascending pentatonic escape pops, gentle wooden invalid thuds, victory fanfares, and hint chimes.
  - Native haptic feedback service (`hapticsService.ts`) with light, medium, and heavy impact triggers.
  - Settings modal (`SettingsModal.tsx`) for toggling sound, haptics, theme selection, and progress reset.

- **Monetization & Store Services (`src/services/ads/`, `src/services/billing/`)**
  - Ad pacing engine (`adsPacingEngine.ts`) enforcing player-first interstitial frequency limits (4-level interval).
  - AdMob service bridge (`admobService.ts`) with rewarded ads for hints and interstitial placements.
  - Google Play Billing bridge (`billingService.ts`) supporting the "Remove Ads" ($1.99) non-consumable IAP.
  - Rewarded ad prompt modal (`RewardedAdPromptModal.tsx`) and interstitial dialog (`AdInterstitialModal.tsx`).

- **Store Preparation & Compliance (`docs/`)**
  - Comprehensive Google Play Store listing and ASO metadata (`docs/STORE_LISTING.md`).
  - GDPR, COPPA, and Google Play compliant privacy policy (`docs/PRIVACY_POLICY.md`).
  - Step-by-step production signing and release deployment guide (`docs/ANDROID_RELEASE_GUIDE.md`).
  - App icons and high-resolution Feature Graphic branding assets (`src/assets/branding/`).

- **Feature Graphic Visual Upgrade (3D Candy Toy Style)**
  - Redesigned arrow tokens into molded 3D candy arrows with directional palettes:
    - ⬆️ Sky Blue (`#60A5FA` / `#1D4ED8`)
    - ➡️ Tangerine Orange (`#FDBA74` / `#EA580C`)
    - ⬇️ Bubblegum Pink (`#F472B6` / `#DB2777`)
    - ⬅️ Kiwi Lime Green (`#86EFAC` / `#16A34A`)
  - Pastel turquoise cushion pads (`#38C2C9`) under each arrow token.
  - Tactile toy tray with iridescent rainbow border frame, golden corner star studs (`★`), and recessed well slots (`?`).
  - Cosmic aurora backdrop with twilight cyan gradient in `GameScreen.tsx`.

#### Fixed
- **Grid Alignment & Centering (`ArrowTile.tsx`, `Board.tsx`)**: Fixed coordinate offset where arrows were floating off-center by 22px due to missing board padding in `ArrowTile` position calculation. Added `padding={padding}` prop passing and synchronized formulas:
  ```ts
  left = padding + arrow.x * (cellSize + gap);
  top  = padding + arrow.y * (cellSize + gap);
  ```
  Tokens are now 100% concentric with their recessed board well slots.
- **Identifier Collision (`admobService.ts`)**: Resolved duplicate identifier error between private state variable `isInterstitialLoaded` and public getter `isInterstitialLoaded()`, renaming private field to `_isInterstitialLoaded`. Restored clean Vite HMR and dev bundling.

#### Verified
- 11 unit test suites, 45 tests passing (100% green).
- 30/30 level solver validation passed in 12ms.
- Web production bundle compiles cleanly via Vite in ~72ms.
- End-to-end interactive browser testing verified on `http://localhost:3000/` (Level 1 clear, Level 2 progression, hint golden aura, victory overlay confetti, settings toggles).
