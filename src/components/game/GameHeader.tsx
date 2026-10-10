/**
 * GameHeader Component
 * Shows level status, move count, star rating gauge, and settings trigger.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ColorTheme } from '../../theme/colors';

interface GameHeaderProps {
  levelId: number;
  levelTitle: string;
  totalArrows: number;
  totalTaps: number;
  theme: ColorTheme;
  onOpenLevelSelect?: () => void;
  onToggleTheme?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  levelId,
  levelTitle,
  totalArrows,
  totalTaps,
  theme,
  onOpenLevelSelect,
  onToggleTheme,
}) => {
  // Current star preview based on taps
  const invalidTaps = Math.max(0, totalTaps - totalArrows);
  const twoStarLimit = Math.ceil(0.3 * totalArrows) + 1;
  const currentStars = invalidTaps === 0 ? 3 : invalidTaps <= twoStarLimit ? 2 : 1;

  return (
    <View style={styles.headerContainer}>
      {/* Top Bar with Navigation & Actions */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onOpenLevelSelect}
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}
        >
          <Text style={[styles.iconText, { color: theme.textPrimary }]}>☰</Text>
        </TouchableOpacity>

        <View style={styles.levelTitleContainer}>
          <Text style={[styles.levelSubtitle, { color: theme.textSecondary }]}>LEVEL {levelId}</Text>
          <Text style={[styles.levelTitle, { color: theme.textPrimary }]}>{levelTitle}</Text>
        </View>

        <TouchableOpacity
          onPress={onToggleTheme}
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}
        >
          <Text style={[styles.iconText, { color: theme.textPrimary }]}>🎨</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row (Stars & Moves) */}
      <View style={[styles.metricsBar, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>MOVES</Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {totalTaps} <Text style={{ fontSize: 13, color: theme.textMuted }}>/ {totalArrows}</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>RATING</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3].map(starIndex => (
              <Text
                key={starIndex}
                style={[
                  styles.starGlyph,
                  { color: starIndex <= currentStars ? theme.starFilled : theme.starEmpty },
                ]}
              >
                ★
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelTitleContainer: {
    alignItems: 'center',
  },
  levelSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starGlyph: {
    fontSize: 18,
  },
});
