/**
 * Arrow Escape — Root Application Component
 * Seamless screen router between HomeScreen and GameScreen.
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ReplayGameMode, QuickEscapeDifficulty } from './services/modes/gameModesService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [isDailyChallenge, setIsDailyChallenge] = useState<boolean>(false);
  const [dailyDateStr, setDailyDateStr] = useState<string | undefined>(undefined);
  const [activeGameMode, setActiveGameMode] = useState<ReplayGameMode>('CAMPAIGN');
  const [activeQuickDifficulty, setActiveQuickDifficulty] = useState<QuickEscapeDifficulty>('NORMAL');

  const handleStartGame = useCallback(
    (
      levelId: number,
      isDaily?: boolean,
      dailyDate?: string,
      gameMode: ReplayGameMode = 'CAMPAIGN',
      quickDifficulty: QuickEscapeDifficulty = 'NORMAL'
    ) => {
      setActiveLevelId(levelId);
      setIsDailyChallenge(!!isDaily || gameMode === 'DAILY');
      setDailyDateStr(dailyDate);
      setActiveGameMode(gameMode);
      setActiveQuickDifficulty(quickDifficulty);
      setCurrentScreen('game');
    },
    []
  );

  const handleNavigateHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  return (
    <View style={styles.appContainer}>
      {currentScreen === 'home' ? (
        <HomeScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen
          key={`${activeLevelId}_${activeGameMode}_${isDailyChallenge ? dailyDateStr : 'std'}`}
          initialLevelId={activeLevelId}
          isDailyChallenge={isDailyChallenge}
          dailyDateStr={dailyDateStr}
          gameMode={activeGameMode}
          quickDifficulty={activeQuickDifficulty}
          onNavigateHome={handleNavigateHome}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
