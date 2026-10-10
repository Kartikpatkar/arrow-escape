/**
 * Arrow Escape — Root Application Component
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GameScreen } from './screens/GameScreen';

export default function App() {
  return (
    <View style={styles.appContainer}>
      <GameScreen />
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
