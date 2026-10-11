/**
 * GameScreen Component
 * Orchestrates gameplay, smooth physical arrow animations, rapid-tap mechanics,
 * and 500-level progression with Grand Completion celebrations.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, useWindowDimensions } from 'react-native';
import {
  GameEngineState,
  initializeGameState,
  processTap,
  undoLastMove,
  resetGameState,
  getHint,
  ArrowConfig,
} from '../engine';
import { CORE_LEVELS, getLevelById, TOTAL_LEVELS } from '../data/levels';
import { THEMES, defaultTheme, ColorTheme } from '../theme/colors';
import {
  loadUserProgress,
  recordLevelCompletion,
  updateHintsAvailable,
  updateAnimationPacing,
  saveUserProgress,
  resetAllProgress,
  equipCosmetic,
  UserProgressData,
  DEFAULT_PROGRESS,
} from '../services/storage/progressStorage';
import { audioService } from '../services/audio/audioService';
import { hapticsService } from '../services/haptics/hapticsService';
import { admobService } from '../services/ads/admobService';
import { billingService } from '../services/billing/billingService';
import { playGamesService } from '../services/playgames/playGamesService';
import { monetizationAnalytics } from '../services/analytics/monetizationAnalytics';
import { Board } from '../components/game/Board';
import { GameHeader } from '../components/game/GameHeader';
import { GameControls } from '../components/game/GameControls';
import { VictoryOverlay } from '../components/game/VictoryOverlay';
import { LevelSelectModal } from '../components/game/LevelSelectModal';
import { SettingsModal } from '../components/game/SettingsModal';
import { CosmeticsModal } from '../components/game/CosmeticsModal';
import { RewardedAdPromptModal } from '../components/game/RewardedAdPromptModal';
import { AdInterstitialModal } from '../components/game/AdInterstitialModal';
import { GrandCompletionModal } from '../components/game/GrandCompletionModal';
import { HintModal } from '../components/game/HintModal';
import { getTieredHint, HintTierLevel, TieredHintResult } from '../engine/hintEngine';
import { BannerAd } from '../components/ads/BannerAd';
import { dailyChallengeService, getLocalDateString } from '../services/daily/dailyChallengeService';
import { CosmeticCategory } from '../services/cosmetics/cosmeticsCatalog';
import {
  ReplayGameMode,
  QuickEscapeDifficulty,
  generateQuickEscapePuzzle,
  getPerfectClearMoveBudget,
} from '../services/modes/gameModesService';
import { recordPerfectClear, recordQuickEscapeWin } from '../services/storage/progressStorage';

import { backButtonManager } from '../services/navigation/backButtonHandler';

interface GameScreenProps {
  initialLevelId?: number;
  isDailyChallenge?: boolean;
  dailyDateStr?: string;
  gameMode?: ReplayGameMode;
  quickDifficulty?: QuickEscapeDifficulty;
  theme?: ColorTheme;
  selectedThemeKey?: string;
  onSelectTheme?: (themeKey: string) => void;
  onNavigateHome?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  initialLevelId = 1,
  isDailyChallenge = false,
  dailyDateStr,
  gameMode = 'CAMPAIGN',
  quickDifficulty = 'NORMAL',
  theme: propTheme,
  selectedThemeKey: propThemeKey,
  onSelectTheme: onPropSelectTheme,
  onNavigateHome,
}) => {
  const effectiveMode: ReplayGameMode = isDailyChallenge ? 'DAILY' : gameMode;
  const [currentLevelId, setCurrentLevelId] = useState(initialLevelId);
  const [quickEscapeRound, setQuickEscapeRound] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [hintsAvailable, setHintsAvailable] = useState(5);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('dawn');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [adsRemoved, setAdsRemoved] = useState(false);

  // Animation & Feedback States
  const [escapingArrowIds, setEscapingArrowIds] = useState<string[]>([]);
  const [escapingArrows, setEscapingArrows] = useState<ArrowConfig[]>([]);
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [blockerFlashId, setBlockerFlashId] = useState<string | null>(null);
  const [hintArrowId, setHintArrowId] = useState<string | null>(null);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRewardedPromptOpen, setIsRewardedPromptOpen] = useState(false);
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [isGrandCompletionOpen, setIsGrandCompletionOpen] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);
  const [isVictoryGiftClaimed, setIsVictoryGiftClaimed] = useState(false);
  const [activeHint, setActiveHint] = useState<TieredHintResult | null>(null);
  const [progressData, setProgressData] = useState<UserProgressData>(DEFAULT_PROGRESS);
  const [selectedSkin, setSelectedSkin] = useState<string>('classic');
  const [selectedEscapeEffect, setSelectedEscapeEffect] = useState<string>('classic');
  const [escapeDurationMs, setEscapeDurationMs] = useState(650);
  const lastEscapeTimeRef = useRef<number>(0);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const responsiveBoardDimension = useMemo(() => {
    return Math.min(360, Math.max(270, Math.floor(Math.min(windowWidth - 32, windowHeight * 0.46))));
  }, [windowWidth, windowHeight]);

  // Load Persisted Progress on Initial Mount
  const refreshProgress = useCallback(async () => {
    const saved = await loadUserProgress();
    setProgressData(saved);
    setUnlockedLevel(saved.unlockedLevel);
    setHintsAvailable(saved.hintsAvailable);
    setSelectedThemeKey(saved.selectedTheme);
    setSelectedSkin(saved.selectedSkin || 'classic');
    setSelectedEscapeEffect(saved.selectedEscapeEffect || 'classic');
    setSoundEnabled(saved.soundEnabled);
    setHapticsEnabled(saved.hapticsEnabled);
    setAdsRemoved(saved.adsRemoved);
    audioService.setEnabled(saved.soundEnabled);
    hapticsService.setEnabled(saved.hapticsEnabled);
    admobService.setAdsRemoved(saved.adsRemoved);

    const starsMap: Record<number, number> = {};
    Object.entries(saved.levelRecords).forEach(([lvlId, rec]) => {
      starsMap[Number(lvlId)] = rec.stars;
    });
    setLevelStars(starsMap);
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  // Hardware Back Button Integration in GameScreen
  useEffect(() => {
    const unregister = backButtonManager.pushHandler(() => {
      if (isSettingsOpen) { setIsSettingsOpen(false); return true; }
      if (isLevelSelectOpen) { setIsLevelSelectOpen(false); return true; }
      if (isCosmeticsOpen) { setIsCosmeticsOpen(false); return true; }
      if (isHintModalOpen) { setIsHintModalOpen(false); return true; }
      if (isRewardedPromptOpen) { setIsRewardedPromptOpen(false); return true; }
      if (onNavigateHome) {
        onNavigateHome();
        return true;
      }
      return false;
    });
    return unregister;
  }, [
    isSettingsOpen,
    isLevelSelectOpen,
    isCosmeticsOpen,
    isHintModalOpen,
    isRewardedPromptOpen,
    onNavigateHome,
  ]);

  const handleEquipCosmetic = useCallback(async (category: CosmeticCategory, key: string) => {
    const updated = await equipCosmetic(category, key);
    setProgressData(updated);
    if (category === 'skin') setSelectedSkin(key);
    if (category === 'theme') {
      setSelectedThemeKey(key);
      if (onPropSelectTheme) {
        onPropSelectTheme(key);
      }
    }
    if (category === 'effect') setSelectedEscapeEffect(key);
  }, [onPropSelectTheme]);

  const activeThemeKey = propThemeKey || selectedThemeKey;
  const theme: ColorTheme = propTheme || THEMES[activeThemeKey] || defaultTheme;

  // Initialize Level Engine
  const currentLevelData = useMemo(() => {
    if (effectiveMode === 'DAILY') {
      return dailyChallengeService.getDailyPuzzle(dailyDateStr || getLocalDateString());
    }
    if (effectiveMode === 'QUICK_ESCAPE') {
      const generated = generateQuickEscapePuzzle(quickDifficulty, Date.now() + quickEscapeRound * 100);
      return generated.level;
    }
    return getLevelById(currentLevelId) || CORE_LEVELS[0];
  }, [currentLevelId, effectiveMode, dailyDateStr, quickDifficulty, quickEscapeRound]);

  const [gameState, setGameState] = useState<GameEngineState>(() =>
    initializeGameState(currentLevelData)
  );

  // Synchronous engine ref to completely prevent rapid tap race conditions
  const engineStateRef = useRef<GameEngineState>(gameState);
  useEffect(() => {
    engineStateRef.current = gameState;
  }, [gameState]);

  // Switch Level
  const loadLevel = useCallback(
    (levelId: number) => {
      const lvl = getLevelById(levelId);
      if (lvl) {
        setCurrentLevelId(levelId);
        const nextEngine = initializeGameState(lvl);
        engineStateRef.current = nextEngine;
        setGameState(nextEngine);
        setEscapingArrowIds([]);
        setEscapingArrows([]);
        setBlockedArrowId(null);
        setBlockerFlashId(null);
        setHintArrowId(null);
        setActiveHint(null);
        setIsVictoryGiftClaimed(false);
        setIsGrandCompletionOpen(false);
      }
    },
    []
  );

  // Handle Arrow Tap with Synchronous Engine Evaluation & Smooth Physical Flyout
  const handleArrowTap = useCallback(
    (arrowId: string) => {
      const currentEngine = engineStateRef.current;
      if (currentEngine.isCompleted || escapingArrowIds.includes(arrowId)) return;

      const targetArrow = currentEngine.activeArrows.find(a => a.id === arrowId);
      if (!targetArrow) return;

      // Evaluate tap using pure engine synchronously
      const { nextState, moveResult } = processTap(currentEngine, arrowId);

      if (moveResult.success) {
        // Immediate synchronous commit to eliminate multi-tap lag
        engineStateRef.current = nextState;
        setGameState(nextState);

        // Dynamic Animation Duration: Rapid combos accelerate, final victory gets grand swoop
        const now = Date.now();
        const isRapidCombo = now - lastEscapeTimeRef.current < 750 || escapingArrowIds.length > 0;
        lastEscapeTimeRef.current = now;
        const isFinalArrow = nextState.isCompleted;

        const pacing = progressData.animationPacing || 'dynamic';
        let flightDuration = 650;
        if (pacing === 'fast') {
          flightDuration = isFinalArrow ? 750 : 380;
        } else if (pacing === 'cinematic') {
          flightDuration = isFinalArrow ? 1200 : 900;
        } else {
          // Dynamic combo: 450ms for consecutive rapid moves, 1200ms grand finale
          flightDuration = isFinalArrow ? 1200 : isRapidCombo ? 450 : 650;
        }
        setEscapeDurationMs(flightDuration);

        // Keep flying arrow visible in DOM until flight animation completes
        setEscapingArrows(prev => [...prev, targetArrow]);
        setEscapingArrowIds(prev => [...prev, arrowId]);

        // Clear active hint if matching
        if (hintArrowId === arrowId || activeHint?.targetArrowId === arrowId) {
          setHintArrowId(null);
          setActiveHint(null);
        }

        // Sensory feedback
        audioService.playEscapePop(nextState.escapedArrowIds.length);
        hapticsService.vibrateLight();

        // Remove from animation track dynamically
        setTimeout(() => {
          setEscapingArrows(prev => prev.filter(a => a.id !== arrowId));
          setEscapingArrowIds(prev => prev.filter(id => id !== arrowId));
        }, flightDuration + 50);

        // Level Complete
        if (nextState.isCompleted) {
          audioService.playVictoryFanfare();
          hapticsService.vibrateSuccess();

          const stars = nextState.starsAwarded;

          // Mode-specific record persisting & badge awarding
          if (effectiveMode === 'PRACTICE') {
            // MODE C: Practice Mode does NOT alter original career records or unlock state
            // Completely safe experimental sandbox
          } else if (effectiveMode === 'DAILY') {
            const dateStr = dailyDateStr || getLocalDateString();
            dailyChallengeService.recordDailyCompletion(dateStr, stars, nextState.totalTaps);
          } else if (effectiveMode === 'QUICK_ESCAPE') {
            recordQuickEscapeWin();
          } else if (effectiveMode === 'PERFECT_CLEAR') {
            const moveBudget = getPerfectClearMoveBudget(currentLevelData);
            if (nextState.totalTaps <= moveBudget) {
              recordPerfectClear(currentLevelId);
            }
            recordLevelCompletion(
              currentLevelId,
              stars,
              nextState.totalTaps,
              currentLevelData.arrows.length,
              25
            );
          } else {
            // Standard Campaign
            setLevelStars(prev => ({
              ...prev,
              [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars),
            }));
            setUnlockedLevel(prev => Math.max(prev, currentLevelId + 1));
            recordLevelCompletion(
              currentLevelId,
              stars,
              nextState.totalTaps,
              currentLevelData.arrows.length,
              25
            );
            admobService.onLevelCompleted();

            const updatedSolvedCount = Math.max(currentLevelId, unlockedLevel);
            const threeStarCount = Object.values(levelStars).filter(s => s === 3).length + (stars === 3 ? 1 : 0);
            playGamesService.syncProgressWithLevelRecords(updatedSolvedCount, threeStarCount);

            // Check if final level 500 completed
            if (currentLevelId >= TOTAL_LEVELS) {
              setTimeout(() => {
                setIsGrandCompletionOpen(true);
              }, 600);
            }
          }
        }
      } else {
        const wasRotated = targetArrow.type === 'ROTATING';
        if (wasRotated) {
          audioService.playClick();
          hapticsService.vibrateLight();
        } else {
          // Blocked tap: Damped jiggle & blocker highlight flash
          audioService.playBlockedThud();
          hapticsService.vibrateWarning();

          setBlockedArrowId(arrowId);
          if (moveResult.diagnostic.blockerId) {
            setBlockerFlashId(moveResult.diagnostic.blockerId);
          }

          setTimeout(() => {
            setBlockedArrowId(null);
            setBlockerFlashId(null);
          }, 360);
        }

        engineStateRef.current = nextState;
        setGameState(nextState);
      }
    },
    [currentLevelId, escapingArrowIds, hintArrowId, levelStars, unlockedLevel]
  );

  // Handle Undo
  const handleUndo = useCallback(() => {
    audioService.playClick();
    const updated = undoLastMove(engineStateRef.current);
    engineStateRef.current = updated;
    setGameState(updated);
    setHintArrowId(null);
  }, []);

  // Handle Restart
  const handleRestart = useCallback(() => {
    audioService.playClick();
    const reset = resetGameState(engineStateRef.current);
    engineStateRef.current = reset;
    setGameState(reset);
    setEscapingArrowIds([]);
    setEscapingArrows([]);
    setBlockedArrowId(null);
    setBlockerFlashId(null);
    setHintArrowId(null);
    setActiveHint(null);
    setIsVictoryGiftClaimed(false);
    setIsGrandCompletionOpen(false);
  }, []);

  // Handle Hint: Open 3-tier educational modal or rewarded prompt
  const handleHint = useCallback(() => {
    if (gameState.isCompleted) return;

    if (hintsAvailable <= 0) {
      monetizationAnalytics.trackAdOffered('hints');
      setIsRewardedPromptOpen(true);
      return;
    }

    setIsHintModalOpen(true);
  }, [hintsAvailable, gameState.isCompleted]);

  // Execute selected hint tier
  const handleSelectHintTier = useCallback(
    (tier: HintTierLevel) => {
      setIsHintModalOpen(false);
      const result = getTieredHint(tier, gameState.activeArrows, gameState.level);
      if (result.hasHint) {
        audioService.playHintChime();
        hapticsService.vibrateLight();
        setActiveHint(result);
        setHintArrowId(result.targetArrowId);
        if (result.blockerArrowId) {
          setBlockerFlashId(result.blockerArrowId);
        }
        updateHintsAvailable(-1).then(newCount => setHintsAvailable(newCount));
      }
    },
    [gameState.activeArrows, gameState.level]
  );

  // Watch Rewarded Ad for Free Hint (Voluntary request when stuck)
  const handleWatchRewardedAd = useCallback(async () => {
    const reward = await admobService.showRewardedAd();
    if (reward) {
      monetizationAnalytics.trackAdCompleted('hints');
      setHintsAvailable(prev => prev + reward.amount);
      audioService.playHintChime();
    }
  }, []);

  // Watch Rewarded Ad for Victory Completion Gift (+2 hints) (Secondary voluntary bonus)
  const handleClaimVictoryGift = useCallback(async () => {
    audioService.playClick();
    hapticsService.vibrateLight();
    monetizationAnalytics.trackAdOffered('bonus_xp');
    const reward = await admobService.showRewardedAd();
    if (reward) {
      monetizationAnalytics.trackAdCompleted('bonus_xp');
      const nextHints = await updateHintsAvailable(1);
      setHintsAvailable(nextHints);
      setIsVictoryGiftClaimed(true);
      audioService.playVictoryFanfare();
      hapticsService.vibrateSuccess();
    }
  }, []);

  // Handle Remove Ads Purchase
  const handlePurchaseRemoveAds = useCallback(async () => {
    const res = await billingService.purchaseRemoveAds();
    if (res.success) {
      monetizationAnalytics.trackProductPurchased('remove_ads', 1.99);
      setAdsRemoved(true);
      admobService.setAdsRemoved(true);
      audioService.playVictoryFanfare();
    }
  }, []);

  // Handle Restore Purchases
  const handleRestorePurchases = useCallback(async () => {
    const res = await billingService.restorePurchases();
    if (res.restored) {
      setAdsRemoved(true);
      admobService.setAdsRemoved(true);
      audioService.playClick();
    }
  }, []);

  // Cycle Theme
  const handleToggleTheme = useCallback(() => {
    audioService.playClick();
    const keys = Object.keys(THEMES);
    const nextIdx = (keys.indexOf(activeThemeKey) + 1) % keys.length;
    const nextThemeKey = keys[nextIdx];
    setSelectedThemeKey(nextThemeKey);
    saveUserProgress({ selectedTheme: nextThemeKey });
    if (onPropSelectTheme) {
      onPropSelectTheme(nextThemeKey);
    }
  }, [activeThemeKey, onPropSelectTheme]);

  // Handle Sound Toggle
  const handleToggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    audioService.setEnabled(enabled);
    saveUserProgress({ soundEnabled: enabled });
  }, []);

  // Handle Haptics Toggle
  const handleToggleHaptics = useCallback((enabled: boolean) => {
    setHapticsEnabled(enabled);
    hapticsService.setEnabled(enabled);
    saveUserProgress({ hapticsEnabled: enabled });
  }, []);

  // Handle Theme Selection from Settings
  const handleSelectTheme = useCallback((themeKey: string) => {
    audioService.playClick();
    setSelectedThemeKey(themeKey);
    saveUserProgress({ selectedTheme: themeKey });
    if (onPropSelectTheme) {
      onPropSelectTheme(themeKey);
    }
  }, [onPropSelectTheme]);

  // Handle Animation Pacing from Settings
  const handleSelectAnimationPacing = useCallback(async (pacing: 'dynamic' | 'fast' | 'cinematic') => {
    audioService.playClick();
    const updated = await updateAnimationPacing(pacing);
    setProgressData(updated);
  }, []);

  // Tutorial introduction explanation for special mechanic milestones
  const tutorialInfo = useMemo(() => {
    const title = currentLevelData.title.toLowerCase();
    if (title.includes('locked')) {
      return {
        icon: '🔒',
        title: 'NEW MECHANIC: LOCKED ARROW',
        desc: 'Solve other unblocked arrows first to meet the unlock counter!',
      };
    }
    if (title.includes('key')) {
      return {
        icon: '🔑',
        title: 'NEW MECHANIC: KEY & LOCK',
        desc: 'Free the Key arrow first to immediately unlock the paired Lock arrow!',
      };
    }
    if (title.includes('rotating')) {
      return {
        icon: '↻',
        title: 'NEW MECHANIC: ROTATING ARROW',
        desc: 'Tap arrow to spin 90° clockwise until an open exit path appears!',
      };
    }
    if (title.includes('bomb')) {
      return {
        icon: '💣',
        title: 'NEW MECHANIC: BOMB ARROW',
        desc: 'Launch the Bomb arrow to detonate and clear adjacent blocking arrows!',
      };
    }
    return null;
  }, [currentLevelData.title]);

  // Handle Reset Progress
  const handleResetProgress = useCallback(async () => {
    await resetAllProgress();
    setUnlockedLevel(1);
    setLevelStars({});
    setHintsAvailable(5);
    setAdsRemoved(false);
    admobService.setAdsRemoved(false);
    loadLevel(1);
  }, [loadLevel]);

  const proceedToNextLevel = useCallback(() => {
    if (effectiveMode === 'QUICK_ESCAPE') {
      setQuickEscapeRound(r => r + 1);
      setEscapingArrowIds([]);
      setEscapingArrows([]);
      setBlockedArrowId(null);
      setBlockerFlashId(null);
      setHintArrowId(null);
      setActiveHint(null);
      setIsVictoryGiftClaimed(false);
      return;
    }

    if (effectiveMode === 'PRACTICE' || effectiveMode === 'PERFECT_CLEAR') {
      const nextId = Math.min(TOTAL_LEVELS, currentLevelId + 1);
      loadLevel(nextId);
      return;
    }

    const nextId = currentLevelId + 1;
    if (nextId <= TOTAL_LEVELS) {
      loadLevel(nextId);
    } else {
      setIsGrandCompletionOpen(true);
    }
  }, [currentLevelId, effectiveMode, loadLevel]);

  // Handle Next Level
  const handleNextLevel = useCallback(() => {
    audioService.playClick();

    if (currentLevelId >= TOTAL_LEVELS) {
      setIsGrandCompletionOpen(true);
      return;
    }

    if (admobService.getPacingEngine().canShowInterstitial().allowed) {
      admobService.getPacingEngine().recordInterstitialShown();
      setIsInterstitialOpen(true);
      return;
    }

    proceedToNextLevel();
  }, [currentLevelId, proceedToNextLevel]);

  const handleDismissInterstitial = useCallback(() => {
    setIsInterstitialOpen(false);
    proceedToNextLevel();
  }, [proceedToNextLevel]);

  // Combined active and flying arrows for silky rendering
  const renderedArrows = useMemo(() => {
    return gameState.activeArrows.concat(escapingArrows);
  }, [gameState.activeArrows, escapingArrows]);

  const totalCalculatedStars = useMemo(() => {
    return Object.values(levelStars).reduce((sum, s) => sum + s, 0);
  }, [levelStars]);

  const mechanicTip = useMemo(() => {
    const arrows = gameState.level.arrows;
    if (gameState.level.id === 31 || arrows.some(a => a.type === 'LOCKED')) {
      return '🔒 Locked Arrow: Clear other arrows first to unlock!';
    }
    if (gameState.level.id === 61 || arrows.some(a => a.type === 'KEY')) {
      return '🔑 Key Arrow: Escape the key to unlock the chained arrow!';
    }
    if (gameState.level.id === 101 || arrows.some(a => a.type === 'ROTATING')) {
      return '↻ Rotating Arrow: Tap while blocked to rotate direction!';
    }
    if (gameState.level.id === 161 || arrows.some(a => a.type === 'BOMB')) {
      return '💣 Bomb Arrow: Escapes and clears neighboring arrows!';
    }
    return null;
  }, [gameState.level]);

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      <View style={styles.contentWrapper}>
        {/* Header with Home Button */}
        <GameHeader
          levelId={gameState.level.id}
          levelTitle={
            effectiveMode === 'PRACTICE'
              ? `🔬 Practice — ${gameState.level.title}`
              : effectiveMode === 'PERFECT_CLEAR'
              ? `🎯 Perfect Clear (Max ${getPerfectClearMoveBudget(currentLevelData)} Moves)`
              : effectiveMode === 'QUICK_ESCAPE'
              ? `⚡ Quick Escape #${quickEscapeRound + 1}`
              : gameState.level.title
          }
          totalArrows={gameState.level.arrows.length}
          totalTaps={gameState.totalTaps}
          theme={theme}
          onHomePress={onNavigateHome}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Game Mode Banner */}
        {effectiveMode !== 'CAMPAIGN' && effectiveMode !== 'DAILY' && (
          <View
            style={[
              styles.tipBanner,
              {
                backgroundColor:
                  effectiveMode === 'PRACTICE'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : effectiveMode === 'PERFECT_CLEAR'
                    ? 'rgba(236, 72, 153, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)',
                borderColor:
                  effectiveMode === 'PRACTICE'
                    ? '#10B981'
                    : effectiveMode === 'PERFECT_CLEAR'
                    ? '#EC4899'
                    : '#38BDF8',
              },
            ]}
          >
            <Text
              style={[
                styles.tipText,
                {
                  color:
                    effectiveMode === 'PRACTICE'
                      ? '#10B981'
                      : effectiveMode === 'PERFECT_CLEAR'
                      ? '#EC4899'
                      : '#38BDF8',
                  fontWeight: '800',
                },
              ]}
            >
              {effectiveMode === 'PRACTICE' && '🔬 PRACTICE SANDBOX: Experiment freely. Career scores are not modified.'}
              {effectiveMode === 'PERFECT_CLEAR' &&
                `🎯 TARGET: Clear in ≤ ${getPerfectClearMoveBudget(currentLevelData)} moves! (${gameState.totalTaps}/${getPerfectClearMoveBudget(currentLevelData)} used)`}
              {effectiveMode === 'QUICK_ESCAPE' && `⚡ QUICK ESCAPE (${quickDifficulty}): 100% solvable & fair endless session.`}
            </Text>
          </View>
        )}

        {/* Mechanic Tip Banner */}
        {mechanicTip && (
          <View style={[styles.tipBanner, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>{mechanicTip}</Text>
          </View>
        )}

        {/* Active Educational Hint Banner */}
        {activeHint && (
          <View
            style={[
              styles.activeHintBanner,
              { backgroundColor: theme.surfaceElevated, borderColor: '#38BDF8' },
            ]}
          >
            <Text style={styles.activeHintIcon}>{activeHint.icon}</Text>
            <View style={styles.activeHintTextCol}>
              <Text style={styles.activeHintTitle}>{activeHint.title}</Text>
              <Text style={[styles.activeHintDesc, { color: theme.textPrimary }]}>
                {activeHint.explanation}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setActiveHint(null);
                setHintArrowId(null);
                setBlockerFlashId(null);
              }}
              style={styles.activeHintDismiss}
              activeOpacity={0.7}
            >
              <Text style={[styles.activeHintDismissText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Board Center Stage */}
        <View style={styles.boardContainer}>
          {tutorialInfo && (
            <View
              style={[
                styles.tutorialBanner,
                {
                  backgroundColor: theme.surfaceElevated || '#1E293B',
                  borderColor: theme.accent,
                },
              ]}
            >
              <Text style={styles.tutorialIcon}>{tutorialInfo.icon}</Text>
              <View style={styles.tutorialTextCol}>
                <Text style={[styles.tutorialTitle, { color: theme.accent }]}>
                  {tutorialInfo.title}
                </Text>
                <Text style={[styles.tutorialDesc, { color: theme.textPrimary }]}>
                  {tutorialInfo.desc}
                </Text>
              </View>
            </View>
          )}

          <Board
            width={gameState.level.width}
            height={gameState.level.height}
            activeArrows={renderedArrows}
            escapingArrowIds={escapingArrowIds}
            hintArrowId={hintArrowId}
            blockedArrowId={blockedArrowId}
            blockerFlashId={blockerFlashId}
            theme={theme}
            skin={selectedSkin}
            escapeEffect={selectedEscapeEffect}
            escapeDurationMs={escapeDurationMs}
            maxBoardDimension={responsiveBoardDimension}
            onArrowTap={handleArrowTap}
          />
        </View>

        {/* Controls Footer */}
        <GameControls
          canUndo={gameState.moveHistory.length > 0 && !gameState.isCompleted}
          hintsAvailable={hintsAvailable}
          isHintActive={hintArrowId !== null}
          theme={theme}
          onUndo={handleUndo}
          onHint={handleHint}
          onRestart={handleRestart}
        />
      </View>

      {/* Bottom Banner Ad — Adaptive: hidden on dense grids (>5x5) to preserve board space */}
      {gameState.level.width <= 5 && gameState.level.height <= 5 && (
        <BannerAd
          adsRemoved={adsRemoved}
          onRemoveAdsPress={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Level Select Modal (500 Levels Paginated) */}
      <LevelSelectModal
        visible={isLevelSelectOpen}
        currentLevelId={currentLevelId}
        unlockedLevel={unlockedLevel}
        levelStars={levelStars}
        theme={theme}
        adsRemoved={adsRemoved}
        onSelectLevel={loadLevel}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsOpen}
        soundEnabled={soundEnabled}
        hapticsEnabled={hapticsEnabled}
        selectedThemeKey={selectedThemeKey}
        animationPacing={progressData.animationPacing}
        adsRemoved={adsRemoved}
        theme={theme}
        onOpenCosmetics={() => setIsCosmeticsOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleHaptics={handleToggleHaptics}
        onSelectTheme={handleSelectTheme}
        onSelectAnimationPacing={handleSelectAnimationPacing}
        onPurchaseRemoveAds={handlePurchaseRemoveAds}
        onRestorePurchases={handleRestorePurchases}
        onResetProgress={handleResetProgress}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Cosmetics Wardrobe & Vault Modal */}
      <CosmeticsModal
        visible={isCosmeticsOpen}
        theme={theme}
        progress={progressData}
        onEquipCosmetic={handleEquipCosmetic}
        onPurchaseVipSuccess={refreshProgress}
        onClose={() => {
          setIsCosmeticsOpen(false);
          refreshProgress();
        }}
      />

      {/* Rewarded Ad Prompt Modal */}
      <RewardedAdPromptModal
        visible={isRewardedPromptOpen}
        theme={theme}
        onWatchAd={handleWatchRewardedAd}
        onClose={() => setIsRewardedPromptOpen(false)}
      />

      {/* 3-Tier Educational Hint Modal */}
      <HintModal
        visible={isHintModalOpen}
        hintsAvailable={hintsAvailable}
        theme={theme}
        onSelectTier={handleSelectHintTier}
        onWatchAdForHints={() => {
          setIsHintModalOpen(false);
          handleWatchRewardedAd();
        }}
        onClose={() => setIsHintModalOpen(false)}
      />

      {/* Interstitial Ad Modal */}
      <AdInterstitialModal
        visible={isInterstitialOpen}
        onDismiss={handleDismissInterstitial}
      />

      {/* Standard Victory Celebration Overlay (Levels 1 to 499 & Daily & Game Modes) */}
      {(currentLevelId < TOTAL_LEVELS || effectiveMode !== 'CAMPAIGN') && (
        <VictoryOverlay
          visible={gameState.isCompleted && !isGrandCompletionOpen}
          levelId={effectiveMode === 'DAILY' ? 1 : gameState.level.id}
          levelTitle={
            effectiveMode === 'PRACTICE'
              ? `Practice Solved!`
              : effectiveMode === 'PERFECT_CLEAR'
              ? `Perfect Clear Solved!`
              : effectiveMode === 'QUICK_ESCAPE'
              ? `Quick Escape Cleared!`
              : gameState.level.title
          }
          starsAwarded={gameState.starsAwarded || 1}
          totalTaps={gameState.totalTaps}
          targetMoves={gameState.level.arrows.length}
          theme={theme}
          isGiftClaimed={isVictoryGiftClaimed}
          onClaimGift={handleClaimVictoryGift}
          onNextLevel={isDailyChallenge && onNavigateHome ? onNavigateHome : handleNextLevel}
          onReplay={handleRestart}
        />
      )}

      {/* Grand Completion Modal (Level 500 Finale) */}
      <GrandCompletionModal
        visible={isGrandCompletionOpen}
        totalLevels={TOTAL_LEVELS}
        totalStars={totalCalculatedStars}
        onHomePress={() => {
          setIsGrandCompletionOpen(false);
          if (onNavigateHome) onNavigateHome();
        }}
        onSelectLevelPress={() => {
          setIsGrandCompletionOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 4,
    marginHorizontal: 12,
    gap: 10,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  activeHintIcon: {
    fontSize: 22,
  },
  activeHintTextCol: {
    flex: 1,
  },
  activeHintTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  activeHintDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '500',
  },
  activeHintDismiss: {
    padding: 6,
  },
  activeHintDismissText: {
    fontSize: 14,
    fontWeight: '800',
  },
  tutorialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
    marginHorizontal: 8,
    gap: 8,
    maxWidth: 380,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tutorialIcon: {
    fontSize: 20,
  },
  tutorialTextCol: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  tutorialDesc: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
    marginTop: 2,
  },
});
