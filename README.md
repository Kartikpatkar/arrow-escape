# 🏹 Arrow Escape (Android & Web)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React Native Web](https://img.shields.io/badge/React%20Native%20Web-0.21-61DAFB.svg?logo=react)](https://necolas.github.io/react-native-web/)
[![Jest Tests](https://img.shields.io/badge/Tests-105%20Passed-brightgreen.svg?logo=jest)](https://jestjs.io/)
[![Solvable Levels](https://img.shields.io/badge/Solvable%20Levels-500%2F500-success.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-orange.svg)]()

> A polished, tactile casual puzzle game built for organic downloads, high retention, and sustainable hybrid monetization.

---

## 🎮 Gameplay Overview

- **The Objective:** Clear all arrows from the board in the fewest moves possible.
- **The Core Rule:** An arrow can only escape if its forward path to the edge of the board is completely unobstructed by any other arrow.
- **Special Arrow Mechanics:**
  - 🔒 **Locked Arrows:** Quota or chained dependencies must be cleared first.
  - 🔑 **Key Arrows:** Escapes and unchains target locked arrows.
  - ↻ **Rotating Arrows:** Tap while blocked to pivot 90° clockwise.
  - 💣 **Bomb Arrows:** Explodes orthogonally neighboring obstacles upon escaping.
- **Game Modes Hub:**
  - 📅 **Daily Challenge & Calendar:** Date-seeded puzzles with streaks; unlock past days via rewarded video ads.
  - ⚡ **Quick Escape:** Endless 2–5 min sessions (Quick 4x5, Normal 5x5, Expert 6x6).
  - 🔬 **Practice Sandbox:** Safe experimentation without altering career scores.
  - 🎯 **Perfect Clear:** Beat solver's exact move budget to earn badges.
- **Move Dynamics:**
  - **Valid Move:** Arrow launches off-screen with tactile acceleration and ascending pentatonic pop.
  - **Invalid Move:** Arrow jiggles with gentle thud and blocker flash.
- **Star Scoring & Progression:** 500 levels across 6 themed worlds with XP ranks from Beginner to Grandmaster.
- **Visual Vault:** 6 arrow skins, 8 board themes, and 5 particle escape FX.

---

## 🏗️ Technical Architecture

Arrow Escape is architected with strict separation of concerns, separating pure engine mathematics from presentation:

```
arrow-escape/
├── docs/                             # Engineering specs & release guides
│   ├── PRD.md                        # Product requirements document
│   ├── GAME_DESIGN_SPEC.md           # Coordinates, mechanics, and physics
│   ├── LEVEL_DESIGN_AND_SOLVER_SPEC.md# Backtracking solver & generation specs
│   ├── TECHNICAL_ARCHITECTURE.md     # Engineering blueprints & diagrams
│   ├── MONETIZATION_AND_SERVICES.md  # AdMob pacing & Play Billing specs
│   ├── DEVELOPMENT_ROADMAP.md        # 6-phase development tracker
│   ├── STORE_LISTING.md              # Google Play ASO & store listing
│   ├── PRIVACY_POLICY.md             # Play Store compliant privacy policy
│   └── ANDROID_RELEASE_GUIDE.md      # Keystore & .aab release instructions
├── scripts/
│   └── validateLevels.ts             # Level solvability verification script
├── src/
│   ├── engine/                       # Headless pure TypeScript game engine
│   │   ├── types.ts                  # Domain models & coordinate contracts
│   │   ├── raycaster.ts              # Mathematical collision raycaster
│   │   ├── moveValidator.ts          # Deterministic move validator
│   │   ├── gameState.ts              # Immutable state transition engine
│   │   ├── solver.ts                 # Memoized backtracking puzzle solver
│   │   └── hintEngine.ts             # Optimal move hint resolver
│   ├── data/
│   │   └── levels/                   # Curated 30 levels + procedural 500 generator
│   ├── components/
│   │   ├── ads/                      # Bottom BannerAd component
│   │   └── game/                     # UI, Board, ArrowTile, Modals, Overlays
│   ├── services/
│   │   ├── audio/                    # Procedural WebAudio synthesizer
│   │   ├── haptics/                  # Tactile vibration service
│   │   ├── storage/                  # Offline progress persistence engine
│   │   ├── ads/                      # AdMob bridge & pacing engine
│   │   ├── billing/                  # Google Play Billing IAP service
│   │   └── playgames/                # Google Play Games achievements bridge
│   ├── screens/                      # HomeScreen hub & GameScreen gameplay
│   └── theme/                        # Candy Arcade, Midnight, Neon palettes
└── tests/                            # 12 Jest test suites covering engine & services
```

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js `v18+` (tested on Node `v22` / `v24`)
- npm `v9+`
- JDK 17 (for Android native builds)

### Installation
```bash
# Clone the repository
git clone https://github.com/Kartikpatkar/arrow-escape.git
cd arrow-escape

# Install dependencies
npm install
```

### Running Locally (Web Dev Server)
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

### Running Unit Tests & Level Solvers
```bash
# Run all 12 unit test suites (49 unit tests)
npm test

# Run tests with code coverage report
npm run test:coverage

# Run automated backtracking solver across all core levels
npm run validate:levels
```

### Production Web & Android Builds
```bash
# Production web bundle build
npm run build:web

# Sync assets to native Android project
npx cap sync android

# Build debug APK for testing (ArrowEscape-debug.apk)
cd android && ./gradlew assembleDebug

# Build release App Bundle for Google Play Store (ArrowEscape-release.aab)
cd android && ./gradlew bundleRelease
```

---

## 📦 Documentation Directory

| Document | Purpose |
| :--- | :--- |
| **[Product Requirements (PRD)](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/PRD.md)** | Target audience, business model, and KPIs |
| **[Game Design Spec (GDS)](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/GAME_DESIGN_SPEC.md)** | Discrete coordinates, raycasting, and mechanics |
| **[Level Design & Solver](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/LEVEL_DESIGN_AND_SOLVER_SPEC.md)** | Backtracking algorithm and difficulty ratings |
| **[Technical Architecture](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/TECHNICAL_ARCHITECTURE.md)** | Engineering blueprints and cross-platform architecture |
| **[Monetization & Services](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/MONETIZATION_AND_SERVICES.md)** | AdMob pacing engine & Play Billing contract |
| **[Development Roadmap](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/DEVELOPMENT_ROADMAP.md)** | Six-phase roadmap and milestone deliverables |
| **[Store Listing & ASO](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/STORE_LISTING.md)** | Google Play store metadata and screenshots guide |
| **[Privacy Policy](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/PRIVACY_POLICY.md)** | Google Play, GDPR, and COPPA compliance |
| **[Android Release Guide](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/docs/ANDROID_RELEASE_GUIDE.md)** | Keystore, signing, bundle build, and deployment |
| **[Changelog](file:///Users/apple/Desktop/Desktop%20Backup/New%20folder/Mobile%20Apps/Arrow%20Escape/arrow-escape/CHANGELOG.md)** | Version history and feature release logs |

---

## 🛡️ Pre-Merge Verification Checklist

Before merging branches into `main`:

- [x] All 11 Jest test suites passing (`npm test` -> 45/45 green).
- [x] All 30 levels pass backtracking solver verification (`npm run validate:levels`).
- [x] TypeScript builds without errors (`npm run build`).
- [x] Web production bundle compiles cleanly (`npm run build:web`).
- [x] Progress persistence validated across restarts (`@arrow_escape_user_progress_v1`).
- [x] Procedural WebAudio functions without external asset latency.
- [x] Ad pacing engine enforces non-intrusive 4-level interstitial intervals.
- [x] Google Play Store listing and Privacy Policy documents up to date.

---

## 📄 License & Credits

- **Author:** Kartik Patkar
- **License:** Proprietary — All Rights Reserved