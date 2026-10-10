# 🏹 Arrow Escape (Android & Web)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React Native Web](https://img.shields.io/badge/React%20Native%20Web-0.21-61DAFB.svg?logo=react)](https://necolas.github.io/react-native-web/)
[![Jest Tests](https://img.shields.io/badge/Tests-45%20Passed-brightgreen.svg?logo=jest)](https://jestjs.io/)
[![Solvable Levels](https://img.shields.io/badge/Solvable%20Levels-30%2F30-success.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-orange.svg)]()

> A polished, tactile casual puzzle game built for organic downloads, high retention, and sustainable hybrid monetization.

---

## 🎮 Gameplay Overview

- **The Objective:** Clear all arrows from the board in the fewest moves possible.
- **The Core Rule:** An arrow can only escape if its forward path to the edge of the board is completely unobstructed by any other arrow.
- **Move Dynamics:**
  - **Valid Move:** The arrow launches off-screen with satisfying acceleration and an ascending pentatonic pop. Paths open up for blocked arrows behind it.
  - **Invalid Move:** The arrow jiggles with a gentle thud and briefly flashes its blocker. No penalizing timers or life gates.
- **Star Scoring:** Clear the board matching or beating target moves to earn 3 stars per level.
- **Tactile 3D Aesthetic:** Molded candy arrow tokens resting on pastel turquoise cushion pads within an iridescent rainbow puzzle tray.

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
│   │   └── levels/                   # Curated 30-level core pack (packCore.json)
│   ├── components/
│   │   └── game/                     # UI, Board, ArrowTile, Modals, Overlays
│   ├── services/
│   │   ├── audio/                    # Procedural WebAudio synthesizer
│   │   ├── haptics/                  # Tactile vibration service
│   │   ├── storage/                  # Offline progress persistence engine
│   │   ├── ads/                      # AdMob bridge & pacing engine
│   │   └── billing/                  # Google Play Billing IAP service
│   ├── screens/                      # Main GameScreen orchestration
│   └── theme/                        # Candy Arcade, Midnight, Neon palettes
└── tests/                            # 11 Jest test suites covering engine & services
```

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js `v18+` (tested on Node `v24`)
- npm `v9+`

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
# Run all 11 unit test suites (45 unit tests)
npm test

# Run tests with code coverage report
npm run test:coverage

# Run automated backtracking solver across all 30 core levels
npm run validate:levels
```

### Production Build
```bash
# Production web bundle build
npm run build:web

# TypeScript typechecking
npm run build
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