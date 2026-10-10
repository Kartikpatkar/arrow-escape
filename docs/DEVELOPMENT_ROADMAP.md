# Arrow Escape — Development Roadmap & Milestones

## Overview & Execution Schedule

A six-phase agile roadmap tailored for high execution velocity, testability, and risk reduction:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Phase 1    │────►│   Phase 2    │────►│   Phase 3    │
│ Pure Engine  │     │  Playable UI │     │ Progression  │
│  & Solver    │     │  & Motion    │     │ & 30 Levels  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
┌──────────────┐     ┌──────────────┐            │
│   Phase 6    │◄────│   Phase 5    │◄───────────┘
│ Play Store   │     │ Monetization │     ┌──────────────┐
│ Publication  │     │ & Billing    │◄────│   Phase 4    │
└──────────────┘     └──────────────┘     │ Polish & SFX │
                                          └──────────────┘
```

---

## Phase 1: Core Engine & Automated Solver (Sprint 1)
- [x] Initialize repository with TypeScript & Jest configuration.
- [x] Implement `engine/types.ts` (Direction, Arrow, Grid, MoveResult).
- [x] Implement `engine/raycaster.ts` (boundary checks, obstacle detection).
- [x] Implement `engine/moveValidator.ts` (evaluate move, generate blocking diagnostic).
- [x] Implement `engine/solver.ts` (recursive backtracking solver, find shortest paths).
- [x] Implement `engine/hintEngine.ts` (candidate unblocked move resolver).
- [x] Implement CLI tool `scripts/validateLevels.ts` to verify level datasets automatically.
- [x] **Definition of Done:** 100% test coverage on engine logic; CLI passes validation on sample puzzles.

---

## Phase 2: Playable Interface & Motion Engine (Sprint 2)
- [x] Setup React Native mobile project skeleton.
- [x] Build `Board.tsx` grid layout supporting dynamic $W \times H$ aspect ratios.
- [x] Build `ArrowTile.tsx` with rounded geometry and directional glyphs.
- [x] Integrate `react-native-reanimated` worklets for:
  - Arrow escape acceleration off-screen (250ms spring/timing).
  - Blocked tap horizontal shake animation ($\pm 6\text{px}$ jiggle).
  - Hint glow pulse effect.
- [x] Implement Game Header with live Move Counter, Level Title, and Restart button.
- [x] **Definition of Done:** Smooth 60fps tactile gameplay loop running on an Android device or simulator.

---

## Phase 3: Progression, 30 Curated Levels & Local Persistence (Sprint 3)
- [ ] Author and validate curated initial 30-level pack across 5 difficulty tiers.
- [ ] Build `services/storage/progressStorage.ts` with AsyncStorage.
- [ ] Build `screens/LevelSelectScreen.tsx` (scrollable grid of levels, star badges, lock/unlock states).
- [ ] Implement Move Undo history stack.
- [ ] Implement Hint system (deducting from hint bank, visual arrow highlight).
- [ ] Implement Level Completion Victory Modal with star awards (1, 2, or 3 stars) and "Next Level" CTA.
- [ ] **Definition of Done:** Player can progress from Level 1 to 30; closing and killing the app retains all progress and stars.

---

## Phase 4: Sensory Polish, Theme Engine & Settings (Sprint 4)
- [ ] Integrate `react-native-haptic-feedback` (light tap for escape, double buzz for blocked).
- [ ] Integrate sound engine with crisp, low-latency audio assets (escape pops, blocked thud, fanfare).
- [ ] Build `screens/SettingsScreen.tsx` (Sound toggle, Haptics toggle, Credits, Reset Data).
- [ ] Implement Theme tokens (Default "Dawn Softness" + "Midnight Dark").
- [ ] **Definition of Done:** Game feels tactile, punchy, responsive, and aesthetically premium.

---

## Phase 5: Monetization & Store Services (Sprint 5)
- [ ] Implement `services/ads/adsInterface.ts` with mock provider for local development.
- [ ] Integrate Google Mobile Ads SDK (`react-native-google-mobile-ads`):
  - Rewarded Ad loader & reward listener for Hints.
  - Interstitial Ad with 4-level pacing engine & cooldown timer.
- [ ] Integrate Google Play Billing (`react-native-iap`):
  - "Remove Ads" product query, purchase flow, and signature verification.
  - "Restore Purchases" button in Settings.
- [ ] Offline fallback: Ensure zero crashes or blocking screens when internet is disconnected.
- [ ] **Definition of Done:** Verified ad playback on Android test devices; mock/sandbox IAP removes interstitials.

---

## Phase 6: Play Store Preparation & Production Release (Sprint 6)
- [ ] App Icon generation (adaptive icon with modern squircle & escaping arrow silhouette).
- [ ] Google Play Store assets: Feature Graphic ($1024 \times 500$), 4–6 high-resolution phone screenshots.
- [ ] Store Copy (Short description, engaging long description, keywords for casual puzzle category).
- [ ] Privacy Policy hosted URL & Data Safety declarations.
- [ ] Android App Bundle (`.aab`) signing with production keystore.
- [ ] Google Play Console Closed Testing / Internal Track deployment.
- [ ] **Definition of Done:** Production-signed AAB uploaded to Play Console passing automated pre-launch checks.
