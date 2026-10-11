/**
 * SplashScreen Component
 * Branded opening splash with tactile arrow icon and glowing logo.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ColorTheme } from '../../theme/colors';

interface SplashScreenProps {
  theme: ColorTheme;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ theme, onFinish }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    const timer = setTimeout(() => {
      onFinish();
    }, 1600);

    return () => {
      clearInterval(dotTimer);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onFinish}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.centerBox}>
        {/* Glowing Logo Badge */}
        <View style={[styles.logoBadge, { borderColor: theme.accent, backgroundColor: theme.surface }]}>
          <Text style={styles.logoIcon}>🏹</Text>
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>ARROW ESCAPE</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tactile Spatial & Maze Puzzle
        </Text>

        <View style={styles.loaderWrapper}>
          <View style={[styles.progressBar, { backgroundColor: theme.surfaceElevated || 'rgba(255,255,255,0.1)' }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent }]} />
          </View>
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Loading Levels{dots}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: theme.textMuted }]}>v1.2.0 • Offline Ready</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 36,
    textAlign: 'center',
  },
  loaderWrapper: {
    alignItems: 'center',
    width: 180,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
