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

  const handleStartGame = useCallback((levelId: number) => {
    setActiveLevelId(levelId);
    setCurrentScreen('game');
  }, []);

  const handleNavigateHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  return (
    <View style={styles.appContainer}>
      {currentScreen === 'home' ? (
        <HomeScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen
          key={activeLevelId}
          initialLevelId={activeLevelId}
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
