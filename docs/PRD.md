# Arrow Escape — Product Requirements Document (PRD)

## 1. Product Overview

- **Product Name:** Arrow Escape
- **Platform:** Android (Google Play Store) — cross-platform ready via React Native
- **Genre:** Casual Logic & Spatial Puzzle
- **Audience:** Casual puzzle gamers seeking 1-3 minute bite-sized, tactile, and intellectually satisfying sessions.
- **Monetization Model:** Free-to-Play Hybrid (Rewarded Ads, Soft Interstitials with smart pacing, One-time "Remove Ads" IAP).
- **Core Loop:**
  `Open Game -> Select Level / Daily Puzzle -> Observe Arrow Vector Grid -> Tap Unblocked Arrow -> Watch Arrow Escape -> Board Decongests -> Victory Animation -> Star Rating & Next Level`

---

## 2. Key Decisions & Strategic Alignment

| Decision | Selected Choice | Rationale |
|---|---|---|
| **Visual Style** | **C. Premium Casual** | Tactile, organic, rounded geometry, vibrant soft palettes, physical spring animations, and subtle micro-shadows. Provides an approachable aesthetic while facilitating future theme unlocks (Midnight, Neon, Paper). |
| **Difficulty Model** | **B. Strategic** | Forgiving standard loop (no game-over or hearts/lives depletion on invalid taps), paired with 3-star move efficiency benchmarks and optional limited-move master challenges. |
| **Initial Release Scope** | **A -> B Phased MVP** | Phase 1 focuses on a playable 30-level curated pack with hint/undo and local persistence, designed with modular service interfaces for daily challenges and ad/billing activation. |

---

## 3. Product Goals & Success Metrics

### 3.1 Business Goals
1. Establish a low-maintenance, zero-backend, offline-first mobile game with low friction and high polish.
2. Maximize player retention through friction-free onboarding, instantaneous restart/undo, and smooth tactile feedback.
3. Build sustainable monetization where ads feel like voluntary player choices rather than disruptive penalties.

### 3.2 Key Performance Indicators (KPI Targets)
- **Onboarding / Tutorial Completion (Levels 1–5):** > 85%
- **Day 1 Retention (D1):** > 32%
- **Day 7 Retention (D7):** > 12%
- **Crash-Free Session Rate:** > 99.8%
- **Rewarded Ad Opt-in Rate:** > 25% of active daily users
- **Store Rating Target:** 4.6+ stars on Google Play Store

---

## 4. User Personas & Use Cases

### Persona 1: "Commute Puzzler" (Aarav, 24)
- **Context:** Plays during short metro rides or waiting in queues (2–5 minutes).
- **Needs:** Instant launch, zero loading screens, offline playability, quick restart, and clear visual clarity on a 6-inch phone screen in bright sunlight.

### Persona 2: "Evening Relaxer" (Neha, 31)
- **Context:** Wind-down session before sleep (15–20 minutes).
- **Needs:** Non-stressful timers, satisfying audio clicks/pops, aesthetic color transitions, rewarding feeling of untangling complexity without punishment.

---

## 5. Scope & Release Matrix

### 5.1 MVP (Phase 1 — Launch Candidate)
- [x] Pure TypeScript Headless Game Engine (Grid coordinate system, escape vector raycasting, collision resolution).
- [x] Interactive Board UI with smooth 60/120fps arrow exit transitions & invalid tap jiggle animations.
- [x] Curated 30-Level Progression Pack across 5 difficulty tiers (Tutorial, Beginner, Intermediate, Advanced, Expert).
- [x] Level Validation & Solver CLI tool.
- [x] Move Undo & Intelligent Hint Engine (identifies unblocked escaping arrows).
- [x] Game Controls: Restart, Pause, Audio/Haptics toggle.
- [x] Star Scoring System (1–3 stars based on move count).
- [x] Local Persistence via AsyncStorage (level unlocks, stars, settings, best moves).
- [x] Modular Advertising Service Abstraction (AdMob mock + real provider bridge).
- [x] Google Play In-App Billing ("Remove Ads" one-time purchase).

### 5.2 Version 1.1 (Retention Update)
- [ ] Daily Escape challenge (deterministic calendar-based seed puzzle).
- [ ] Daily streak counter & reward chest.
- [ ] Unlockable Themes (Midnight Dark, Paper Minimal, Cyber Neon).
- [ ] In-game Achievements (e.g., "Untangler", "Perfect Run", "Speed Escaper").

### 5.3 Version 2.0 (Expansion)
- [ ] Novel Arrow Mechanics (Frozen Arrows, Key & Lock Arrows, Two-Way Reversible Arrows).
- [ ] Cloud Save & Cross-Device Sync (Google Play Games Services).
- [ ] Sound Design expansion (custom musical scale chimes per arrow escape).
- [ ] iOS App Store deployment.

---

## 6. Non-Functional Requirements
- **Performance:** Constant 60fps (or 120fps on high-refresh displays) on mid-tier Android devices (Snapdragon 680 or equivalent).
- **App Size:** Target APK/AAB download size under 25 MB.
- **Cold Start Time:** Under 1.5 seconds to interactive Home screen.
- **Battery & Thermal:** Negligible background battery consumption; zero CPU wake locks.
- **Accessibility:** High-contrast arrow glyphs, distinguishable colorblind-safe arrows, screen-reader labeled controls.
