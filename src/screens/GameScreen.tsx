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
} from '../services/storage/progressStorage';
import { Board } from '../components/game/Board';
import { GameHeader } from '../components/game/GameHeader';
import { GameControls } from '../components/game/GameControls';
import { VictoryOverlay } from '../components/game/VictoryOverlay';
import { LevelSelectModal } from '../components/game/LevelSelectModal';

export const GameScreen: React.FC = () => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [hintsAvailable, setHintsAvailable] = useState(5);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('dawn');

  // Animation & Feedback States
  const [escapingArrowIds, setEscapingArrowIds] = useState<string[]>([]);
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [blockerFlashId, setBlockerFlashId] = useState<string | null>(null);
  const [hintArrowId, setHintArrowId] = useState<string | null>(null);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);

  // Load Persisted Progress on Initial Mount
  useEffect(() => {
    loadUserProgress().then(saved => {
      setUnlockedLevel(saved.unlockedLevel);
      setHintsAvailable(saved.hintsAvailable);
      setSelectedThemeKey(saved.selectedTheme);

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

        // Trigger smooth physical escape flyout
        setEscapingArrowIds(prev => [...prev, arrowId]);

        // After flyout animation duration (260ms), commit removal into state
        setTimeout(() => {
          setGameState(nextState);
          setEscapingArrowIds(prev => prev.filter(id => id !== arrowId));

          // If level completed, update progression & stars
          if (nextState.isCompleted) {
            const stars = nextState.starsAwarded;
            setLevelStars(prev => ({
              ...prev,
              [currentLevelId]: Math.max(prev[currentLevelId] || 0, stars),
            }));
            setUnlockedLevel(prev => Math.max(prev, currentLevelId + 1));

            // Persist to local storage
            recordLevelCompletion(currentLevelId, stars, nextState.totalTaps);
          }
        }, 260);
      } else {
        // Blocked tap: Trigger horizontal damped jiggle & blocker highlight flash
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
    setGameState(prev => undoLastMove(prev));
    setHintArrowId(null);
  }, []);

  // Handle Restart
  const handleRestart = useCallback(() => {
    setGameState(resetGameState(gameState));
    setEscapingArrowIds([]);
    setBlockedArrowId(null);
    setBlockerFlashId(null);
    setHintArrowId(null);
  }, [gameState]);

  // Handle Hint
  const handleHint = useCallback(() => {
    if (hintsAvailable <= 0 || gameState.isCompleted) return;

    const recommendation = getHint(gameState.activeArrows, gameState.level);
    if (recommendation.hasHint && recommendation.recommendedArrowId) {
      setHintArrowId(recommendation.recommendedArrowId);
      updateHintsAvailable(-1).then(newCount => setHintsAvailable(newCount));
    }
  }, [hintsAvailable, gameState]);

  // Cycle Theme
  const handleToggleTheme = useCallback(() => {
    const keys = Object.keys(THEMES);
    const nextIdx = (keys.indexOf(selectedThemeKey) + 1) % keys.length;
    const nextThemeKey = keys[nextIdx];
    setSelectedThemeKey(nextThemeKey);
    saveUserProgress({ selectedTheme: nextThemeKey });
  }, [selectedThemeKey]);

  // Handle Next Level
  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1;
    if (nextId <= CORE_LEVELS.length) {
      loadLevel(nextId);
    } else {
      loadLevel(1); // loop back
    }
  }, [currentLevelId, loadLevel]);

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
