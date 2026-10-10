/**
 * GameScreen Component
 * Orchestrates gameplay, smooth physical arrow animations, rapid-tap mechanics,
 * and 500-level progression with Grand Completion celebrations.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
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
  saveUserProgress,
  resetAllProgress,
} from '../services/storage/progressStorage';
import { audioService } from '../services/audio/audioService';
import { hapticsService } from '../services/haptics/hapticsService';
import { admobService } from '../services/ads/admobService';
import { billingService } from '../services/billing/billingService';
import { playGamesService } from '../services/playgames/playGamesService';
import { Board } from '../components/game/Board';
import { GameHeader } from '../components/game/GameHeader';
import { GameControls } from '../components/game/GameControls';
import { VictoryOverlay } from '../components/game/VictoryOverlay';
import { LevelSelectModal } from '../components/game/LevelSelectModal';
import { SettingsModal } from '../components/game/SettingsModal';
import { RewardedAdPromptModal } from '../components/game/RewardedAdPromptModal';
import { AdInterstitialModal } from '../components/game/AdInterstitialModal';
import { GrandCompletionModal } from '../components/game/GrandCompletionModal';
import { BannerAd } from '../components/ads/BannerAd';
import { dailyChallengeService, getLocalDateString } from '../services/daily/dailyChallengeService';

interface GameScreenProps {
  initialLevelId?: number;
  isDailyChallenge?: boolean;
  dailyDateStr?: string;
  onNavigateHome?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  initialLevelId = 1,
  isDailyChallenge = false,
  dailyDateStr,
  onNavigateHome,
}) => {
  const [currentLevelId, setCurrentLevelId] = useState(initialLevelId);
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

  // Load Persisted Progress on Initial Mount
  useEffect(() => {
    loadUserProgress().then(saved => {
      setUnlockedLevel(saved.unlockedLevel);
      setHintsAvailable(saved.hintsAvailable);
      setSelectedThemeKey(saved.selectedTheme);
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
    });
  }, []);

  const theme: ColorTheme = THEMES[selectedThemeKey] || defaultTheme;

  // Initialize Level Engine
  const currentLevelData = useMemo(() => {
    if (isDailyChallenge) {
      return dailyChallengeService.getDailyPuzzle(dailyDateStr || getLocalDateString());
    }
    return getLevelById(currentLevelId) || CORE_LEVELS[0];
  }, [currentLevelId, isDailyChallenge, dailyDateStr]);

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

        // Keep flying arrow visible in DOM until flight animation completes
        setEscapingArrows(prev => [...prev, targetArrow]);
        setEscapingArrowIds(prev => [...prev, arrowId]);

        // Clear active hint if matching
        if (hintArrowId === arrowId) {
          setHintArrowId(null);
        }

        // Sensory feedback
        audioService.playEscapePop(nextState.escapedArrowIds.length);
        hapticsService.vibrateLight();

        // Remove from animation track after smooth swoosh (480ms)
        setTimeout(() => {
          setEscapingArrows(prev => prev.filter(a => a.id !== arrowId));
          setEscapingArrowIds(prev => prev.filter(id => id !== arrowId));
        }, 480);

        // Level Complete
        if (nextState.isCompleted) {
          audioService.playVictoryFanfare();
          hapticsService.vibrateSuccess();

          const stars = nextState.starsAwarded;
          setLevelStars(prev => ({
            ...prev,
            [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars),
          }));
          setUnlockedLevel(prev => Math.max(prev, currentLevelId + 1));

          // Persist progress and trigger Google Play & AdMob sync
          if (isDailyChallenge) {
            const dateStr = dailyDateStr || getLocalDateString();
            dailyChallengeService.recordDailyCompletion(dateStr, stars, nextState.totalTaps);
          } else {
            recordLevelCompletion(currentLevelId, stars, nextState.totalTaps);
          }
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
    setIsGrandCompletionOpen(false);
  }, []);

  // Handle Hint
  const handleHint = useCallback(() => {
    if (gameState.isCompleted) return;

    if (hintsAvailable <= 0) {
      setIsRewardedPromptOpen(true);
      return;
    }

    const recommendation = getHint(gameState.activeArrows, gameState.level);
    if (recommendation.hasHint && recommendation.recommendedArrowId) {
      audioService.playHintChime();
      setHintArrowId(recommendation.recommendedArrowId);
      updateHintsAvailable(-1).then(newCount => setHintsAvailable(newCount));
    }
  }, [hintsAvailable, gameState]);

  // Watch Rewarded Ad for Free Hint
  const handleWatchRewardedAd = useCallback(async () => {
    const reward = await admobService.showRewardedAd();
    if (reward) {
      setHintsAvailable(prev => prev + reward.amount);
      audioService.playHintChime();
    }
  }, []);

  // Handle Remove Ads Purchase
  const handlePurchaseRemoveAds = useCallback(async () => {
    const res = await billingService.purchaseRemoveAds();
    if (res.success) {
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
    const nextIdx = (keys.indexOf(selectedThemeKey) + 1) % keys.length;
    const nextThemeKey = keys[nextIdx];
    setSelectedThemeKey(nextThemeKey);
    saveUserProgress({ selectedTheme: nextThemeKey });
  }, [selectedThemeKey]);

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
  }, []);

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
    const nextId = currentLevelId + 1;
    if (nextId <= TOTAL_LEVELS) {
      loadLevel(nextId);
    } else {
      setIsGrandCompletionOpen(true);
    }
  }, [currentLevelId, loadLevel]);

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

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      <View style={styles.contentWrapper}>
        {/* Header with Home Button */}
        <GameHeader
          levelId={gameState.level.id}
          levelTitle={gameState.level.title}
          totalArrows={gameState.level.arrows.length}
          totalTaps={gameState.totalTaps}
          theme={theme}
          onHomePress={onNavigateHome}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Board Center Stage */}
        <View style={styles.boardContainer}>
          <Board
            width={gameState.level.width}
            height={gameState.level.height}
            activeArrows={renderedArrows}
            escapingArrowIds={escapingArrowIds}
            hintArrowId={hintArrowId}
            blockedArrowId={blockedArrowId}
            blockerFlashId={blockerFlashId}
            theme={theme}
            maxBoardDimension={350}
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

      {/* Bottom Banner Ad */}
      <BannerAd
        adsRemoved={adsRemoved}
        onRemoveAdsPress={() => setIsSettingsOpen(true)}
      />

      {/* Level Select Modal (500 Levels Paginated) */}
      <LevelSelectModal
        visible={isLevelSelectOpen}
        currentLevelId={currentLevelId}
        unlockedLevel={unlockedLevel}
        levelStars={levelStars}
        theme={theme}
        onSelectLevel={loadLevel}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsOpen}
        soundEnabled={soundEnabled}
        hapticsEnabled={hapticsEnabled}
        selectedThemeKey={selectedThemeKey}
        adsRemoved={adsRemoved}
        theme={theme}
        onToggleSound={handleToggleSound}
        onToggleHaptics={handleToggleHaptics}
        onSelectTheme={handleSelectTheme}
        onPurchaseRemoveAds={handlePurchaseRemoveAds}
        onRestorePurchases={handleRestorePurchases}
        onResetProgress={handleResetProgress}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Rewarded Ad Prompt Modal */}
      <RewardedAdPromptModal
        visible={isRewardedPromptOpen}
        theme={theme}
        onWatchAd={handleWatchRewardedAd}
        onClose={() => setIsRewardedPromptOpen(false)}
      />

      {/* Interstitial Ad Modal */}
      <AdInterstitialModal
        visible={isInterstitialOpen}
        onDismiss={handleDismissInterstitial}
      />

      {/* Standard Victory Celebration Overlay (Levels 1 to 499 & Daily) */}
      {currentLevelId < TOTAL_LEVELS && (
        <VictoryOverlay
          visible={gameState.isCompleted && !isGrandCompletionOpen}
          levelId={isDailyChallenge ? 1 : gameState.level.id}
          levelTitle={isDailyChallenge ? 'Daily Challenge' : gameState.level.title}
          starsAwarded={gameState.starsAwarded || 1}
          totalTaps={gameState.totalTaps}
          targetMoves={gameState.level.arrows.length}
          theme={theme}
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
    backgroundImage:
      'radial-gradient(ellipse 90% 70% at 50% 25%, #183D5D 0%, #0C1E30 60%, #06101B 100%)' as any,
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
});
