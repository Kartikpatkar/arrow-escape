# Changelog

All notable changes to **Arrow Escape** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-11

### 🚀 Major Feature Release: Special Arrow Mechanics, Progression Worlds, Daily Calendar, Endless Modes & Anti-Tampering

#### Added
- **Feature #1: Daily Puzzle Challenge & Streak System (`src/services/daily/dailyChallengeService.ts`, `src/components/daily/DailyChallengeCard.tsx`)**
  - Offline-first deterministic date-seeded daily puzzle with 14–18 arrows on 6x6 grid.
  - Consecutive calendar streak tracker with 5 progression tiers (1, 3, 7, 14, 30 days) and bonus XP rewards.
  - Optional local reminder notification via `@capacitor/local-notifications`.
- **Feature #2: Special Arrow Mechanics (`src/engine/types.ts`, `src/engine/gameState.ts`)**
  - `LOCKED`: Arrows disabled until clear quota or chained dependencies are satisfied.
  - `KEY`: Unlocks matching locked or chained arrows upon escaping.
  - `ROTATING`: 90-degree clockwise pivot on blocked tap, allowing dynamic escape rerouting.
  - `BOMB`: Explosive clearing of orthogonally neighboring arrows upon escape.
- **Feature #3: Themed Worlds Progression & Visual Vault (`src/data/worlds/worldData.ts`, `src/services/progression/progressionService.ts`)**
  - Divided 500 levels into 6 distinct themed worlds with tailored mechanic tags, milestone badges, and mastery ratings.
  - Statistics Modal with player XP rank (Beginner to Grandmaster), completion KPIs, and activity analytics.
- **Feature #4: 3-Tier Educational Hint System (`src/engine/hintEngine.ts`, `src/components/game/HintModal.tsx`)**
  - Tier 1: Directional hint highlighting immediately escapable arrows.
  - Tier 2: Blocker diagnostic showing blocked arrow + obstacle preventing escape.
  - Tier 3: Solution path recommendation with solver validation.
- **Feature #5: Cosmetics Wardrobe & Vault (`src/services/cosmetics/cosmeticsCatalog.ts`, `src/components/game/CosmeticsModal.tsx`)**
  - Arrow Skins: Classic, Galaxy, Metallic, Crystal, Fire, Minimalist.
  - Board Themes: Dawn, Paper Light, Midnight, Ocean, Forest, Space, Cyberpunk, Monochrome.
  - Escape Particle FX: Classic Swoosh, Sparkle Burst, Neon Trail, Star Explosion, Crystal Shatter.
  - Unlockable via world milestones, daily streaks, or optional VIP Cosmetics Pass ($2.99 IAP).
- **Feature #6: Offline Replay Hub & Fairness Engine (`src/services/modes/gameModesService.ts`, `src/components/game/GameModesModal.tsx`)**
  - Mode A: Daily Challenge.
  - Mode B: Quick Escape endless sessions across Quick (4x5), Normal (5x5), and Expert (6x6) tiers.
  - Mode C: Practice Sandbox replaying any unlocked level without altering career records.
  - Mode D: Perfect Clear Challenge solving levels within exact solver-verified move budget for badges.
  - Fairness Engine (`validatePuzzleFairness`): Verifies solvability, turn-0 escape availability, comfortable density (20–70%), and non-deadlock generation.
- **Past Daily Calendar & Rewarded Ad Unlock (`src/components/daily/PastDailiesModal.tsx`)**
  - 14-day history calendar allowing players to catch up on missed daily puzzles.
  - Missed days unlockable by voluntarily watching a rewarded video ad.

#### Security & Quality Assurance
- **Anti-Tampering Storage Architecture (`src/services/storage/progressStorage.ts`)**
  - Cryptographic salted HMAC checksum signature (`sig`) preventing manual modification of levels, hints, or progress.
  - Automatic data sanitization clamping unlocked level (1..501), hints (0..9999), and star records.
  - Removed query parameter level bypass (`?level=N`) and dev unlock backdoor (`?unlock=all`).
- **Level Quality & Validation Pipeline (`src/services/validation/levelValidationPipeline.ts`)**
  - Automated audit of all 500 levels validating 100% solvability, coordinate bounds, and zero duplicate coordinates.
- **Save-Game Reliability Test Suite (`tests/services/saveGameReliability.test.ts`)**
  - Verified career score protection against accidental downgrades during replays and simulated force-stops.

#### Native & UI Polish
- **Global Theme Application**: Lifted theme state to `App.tsx` and removed hardcoded CSS background gradients from `HomeScreen` and `GameScreen`, allowing selected themes (Candy Arcade, Midnight Dark, Cyber Neon, Deep Ocean, Sunset Glow, etc.) to transform the entire application immediately and persistently.
- **Android Hardware Back Button Navigation (`src/services/navigation/backButtonHandler.ts`)**: Integrated `@capacitor/app` back button listener; closes active modals first, returns from gameplay to home, and requires a double back press within 2s on the home screen to exit with a floating toast notice.
- **Branded Splash Screen (`src/components/common/SplashScreen.tsx`)**: Added animated startup splash with glowing logo and loading progress bar on launch.
- **First-Time Permissions & Preferences Setup (`src/components/common/PermissionsSetupModal.tsx`)**: Introduced initial launch onboarding dialog allowing players to configure notification permissions, tactile haptics, and sound effects before playing.
- **Hardware Haptics Engine (`src/services/haptics/hapticsService.ts`)**: Migrated to `@capacitor/haptics` native Android bridge for tactile vibration on valid moves, blockers, and victories with Web Vibration API fallback.
- **Cinematic Arrow Flyout Speed Tuning (`src/components/game/ArrowTile.tsx`, `src/screens/GameScreen.tsx`)**: Increased arrow escape flight duration from 720ms to 1200ms with smooth cubic-bezier easing and synced 1250ms cleanup timeout so the full flight trajectory is comfortably visible to human eyes.
- **Google Play Games Cloud Save (`src/services/playgames/playGamesService.ts`, `src/screens/HomeScreen.tsx`)**: Connected progress saving to Google Play Games Cloud Saved Games with an interactive "Sync Now" bar in the Home HUD.
- **Settings Modal Render & Scroll Fix**: Fixed missing `ScrollView` import that caused the settings modal to render blank; wrapped modal card in vertical scroll container with `nestedScrollEnabled` on theme picker for smooth rendering across all screen sizes.
- **Settings Visual Themes Pill UI**: Redesigned theme selector from compressed vertical pills into a horizontal, smoothly scrolling card row with full titles and dot indicators.
- **Level Select Progress Overflow**: Fixed flex sizing and text clipping on World progress card header.
- **Hardware Vibration Access**: Added `android.permission.VIBRATE` to `AndroidManifest.xml` enabling physical haptics on real devices.
- **Portrait Orientation Lock**: Set `android:screenOrientation="portrait"` on MainActivity to prevent board layout distortion on device rotation.
- **Notification Permission Cleanup**: Switched to standard delay-based reminder notification schedule without triggering Android 12+ `SCHEDULE_EXACT_ALARM` dialog.
- **Native Task Bar & Nav Bar Theming**: Styled `statusBarColor` and `navigationBarColor` to `#0E1F33` in `styles.xml` matching game background.
- **Cross-Device Responsiveness**: Clamped layout width to `maxWidth: 480` with auto-centering on both mobile and tablet devices.

---

## [1.1.0] - 2026-10-11

### 🌟 Home Screen, 500 Levels Expansion & Google Play Integration

#### Added
- **Home Screen & Navigation Hub (`src/screens/HomeScreen.tsx`, `src/App.tsx`)**
  - Dedicated Home screen with "Continue Level X" / "Start Game" hero button.
  - Quick action links for Level Select, Google Play Achievements, and Settings.
  - Player HUD displaying Current Level, Total Stars, and 500 Max Levels capacity.
  - Save Progress card displaying real-time local and simulated cloud sync status with a manual "Sync Now" trigger.
  - Home button (🏠) in `GameHeader.tsx` to seamlessly navigate back from gameplay to the Home screen.

- **500-Level Procedural Generation Suite (`src/data/levels/levelGenerator.ts`)**
  - Seeded Mulberry32 deterministic PRNG generating 100% solvable puzzles from Level 31 to 500.
  - Reverse constructive placement ensuring guaranteed escape vectors with zero unsolvable boards.
  - In-memory level caching for instant sub-millisecond level loads.
  - Paginated level selection drawer (`LevelSelectModal.tsx`) with 10 range tabs (`1-50` through `451-500`).
  - Automated Jest test suite (`tests/levels/levelGenerator.test.ts`) validating solvability across sample tiers (31, 50, 100, 250, 500).

- **Google Play Games Services & Achievements Bridge (`src/services/playgames/`, `src/components/game/AchievementsModal.tsx`)**
  - Persistent achievement tracking across 7 tiers: "First Escape" (500 XP), "Pathfinder" (1k XP), "Core Master" (2.5k XP), "Half Century" (5k XP), "Century Club" (10k XP), "Flawless Mind" (3.5k XP), and "Grand Master 500" (25k XP).
  - Achievements UI modal with GamerTag profile badge, total earned XP counter, and real-time completion progress bars.
  - Automatic progress synchronization triggered on level victory.

- **Grand 500-Level Completion Finale (`src/components/game/GrandCompletionModal.tsx`)**
  - Full-screen celebratory modal with trophy badge, completion metrics (500/500 solved, 100% completion), and celebration graphics.
  - Prevents game from looping back to Level 1 upon completing Level 500.

- **Persistent Bottom Banner Ad (`src/components/ads/BannerAd.tsx`)**
  - Adaptive AdMob test banner integrated into both Home and Game screens.
  - Contextual "Remove Ads" action linking directly to IAP purchase; automatically hidden when `adsRemoved` is active.

- **Native Android Launcher Mipmap Assets**
  - Generated complete mipmap suites (`ic_launcher.png`, `ic_launcher_round.png`, `ic_launcher_foreground.png`) across all densities: `mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`.
  - Configured Android App Bundle (`ArrowEscape-release.aab`) production release build via `./gradlew bundleRelease`.

#### Fixed & Optimized
- **Rapid Multi-Tap Stutter & Blocking Lag**: Refactored `GameScreen.tsx` with synchronous engine state commits using `engineStateRef`. Eliminates race conditions where consecutive quick taps were incorrectly evaluated against in-flight arrows.
- **Arrow Escape Animation Timing**: Extended escape travel distance to 560px and tuned easing curve to `480ms cubic-bezier(0.2, 0.75, 0.25, 1)` with `450ms ease-out` opacity fade for silky, cinematic tactile satisfaction.

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
