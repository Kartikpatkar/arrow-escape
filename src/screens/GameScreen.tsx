/**
 * GameScreen Component
 * Orchestrates gameplay, animations, engine state transitions, and UI modals.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import {
  GameEngineState,
  initializeGameState,
  processTap,
  undoLastMove,
  resetGameState,
  getHint,
} from '../engine';
import { CORE_LEVELS, getLevelById } from '../data/levels';
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
import { Board } from '../components/game/Board';
import { GameHeader } from '../components/game/GameHeader';
import { GameControls } from '../components/game/GameControls';
import { VictoryOverlay } from '../components/game/VictoryOverlay';
import { LevelSelectModal } from '../components/game/LevelSelectModal';
import { SettingsModal } from '../components/game/SettingsModal';
import { RewardedAdPromptModal } from '../components/game/RewardedAdPromptModal';
import { AdInterstitialModal } from '../components/game/AdInterstitialModal';

export const GameScreen: React.FC = () => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [hintsAvailable, setHintsAvailable] = useState(5);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('dawn');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [adsRemoved, setAdsRemoved] = useState(false);

  // Animation & Feedback States
  const [escapingArrowIds, setEscapingArrowIds] = useState<string[]>([]);
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [blockerFlashId, setBlockerFlashId] = useState<string | null>(null);
  const [hintArrowId, setHintArrowId] = useState<string | null>(null);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRewardedPromptOpen, setIsRewardedPromptOpen] = useState(false);
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);

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
    return getLevelById(currentLevelId) || CORE_LEVELS[0];
  }, [currentLevelId]);

  const [gameState, setGameState] = useState<GameEngineState>(() =>
    initializeGameState(currentLevelData)
  );

  // Switch Level
  const loadLevel = useCallback(
    (levelId: number) => {
      const lvl = getLevelById(levelId);
      if (lvl) {
        setCurrentLevelId(levelId);
        setGameState(initializeGameState(lvl));
        setEscapingArrowIds([]);
        setBlockedArrowId(null);
        setBlockerFlashId(null);
        setHintArrowId(null);
      }
    },
    []
  );

  // Handle Arrow Tap with Physical Motion
  const handleArrowTap = useCallback(
    (arrowId: string) => {
      if (escapingArrowIds.includes(arrowId) || gameState.isCompleted) return;

      // Evaluate tap using pure engine
      const { nextState, moveResult } = processTap(gameState, arrowId);

      if (moveResult.success) {
        // Clear any active hint
        if (hintArrowId === arrowId) {
          setHintArrowId(null);
        }

        // Trigger sensory feedback
        audioService.playEscapePop(gameState.escapedArrowIds.length);
        hapticsService.vibrateLight();

        // Trigger smooth physical escape flyout
        setEscapingArrowIds(prev => [...prev, arrowId]);

        // After flyout animation duration (260ms), commit removal into state
        setTimeout(() => {
          setGameState(nextState);
          setEscapingArrowIds(prev => prev.filter(id => id !== arrowId));

          // If level completed, update progression & stars
          if (nextState.isCompleted) {
            audioService.playVictoryFanfare();
            hapticsService.vibrateSuccess();

            const stars = nextState.starsAwarded;
            setLevelStars(prev => ({
              ...prev,
              [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars),
            }));
            setUnlockedLevel(prev => Math.max(prev, currentLevelId + 1));

            // Persist to local storage & notify ad pacing
            recordLevelCompletion(currentLevelId, stars, nextState.totalTaps);
            admobService.onLevelCompleted();
          }
        }, 260);
      } else {
        // Blocked tap: Trigger sensory feedback, horizontal damped jiggle & blocker highlight flash
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

        setGameState(nextState);
      }
    },
    [escapingArrowIds, gameState, hintArrowId, currentLevelId]
  );

  // Handle Undo
  const handleUndo = useCallback(() => {
    audioService.playClick();
    setGameState(prev => undoLastMove(prev));
    setHintArrowId(null);
  }, []);

  // Handle Restart
  const handleRestart = useCallback(() => {
    audioService.playClick();
    setGameState(resetGameState(gameState));
    setEscapingArrowIds([]);
    setBlockedArrowId(null);
    setBlockerFlashId(null);
    setHintArrowId(null);
  }, [gameState]);

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
    if (nextId <= CORE_LEVELS.length) {
      loadLevel(nextId);
    } else {
      loadLevel(1);
    }
  }, [currentLevelId, loadLevel]);

  // Handle Next Level
  const handleNextLevel = useCallback(() => {
    audioService.playClick();

    // Check if Interstitial ad is permitted by pacing engine
    if (admobService.getPacingEngine().canShowInterstitial().allowed) {
      admobService.getPacingEngine().recordInterstitialShown();
      setIsInterstitialOpen(true);
      return;
    }

    proceedToNextLevel();
  }, [proceedToNextLevel]);

  const handleDismissInterstitial = useCallback(() => {
    setIsInterstitialOpen(false);
    proceedToNextLevel();
  }, [proceedToNextLevel]);

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <GameHeader
          levelId={gameState.level.id}
          levelTitle={gameState.level.title}
          totalArrows={gameState.level.arrows.length}
          totalTaps={gameState.totalTaps}
          theme={theme}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Board Center Stage */}
        <View style={styles.boardContainer}>
          <Board
            width={gameState.level.width}
            height={gameState.level.height}
            activeArrows={gameState.activeArrows}
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

      {/* Level Select Modal */}
      <LevelSelectModal
        visible={isLevelSelectOpen}
        levels={CORE_LEVELS}
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

      {/* Victory Celebration Overlay */}
      <VictoryOverlay
        visible={gameState.isCompleted}
        levelId={gameState.level.id}
        levelTitle={gameState.level.title}
        starsAwarded={gameState.starsAwarded || 1}
        totalTaps={gameState.totalTaps}
        targetMoves={gameState.level.arrows.length}
        theme={theme}
        onNextLevel={handleNextLevel}
        onReplay={handleRestart}
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
});
