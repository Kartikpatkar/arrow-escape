/**
 * Arrow Escape — Root Application Component
 * Seamless screen router between HomeScreen and GameScreen.
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [isDailyChallenge, setIsDailyChallenge] = useState<boolean>(false);
  const [dailyDateStr, setDailyDateStr] = useState<string | undefined>(undefined);

  const handleStartGame = useCallback(
    (levelId: number, isDaily?: boolean, dailyDate?: string) => {
      setActiveLevelId(levelId);
      setIsDailyChallenge(!!isDaily);
      setDailyDateStr(dailyDate);
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
          key={`${activeLevelId}_${isDailyChallenge ? dailyDateStr : 'std'}`}
          initialLevelId={activeLevelId}
          isDailyChallenge={isDailyChallenge}
          dailyDateStr={dailyDateStr}
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
