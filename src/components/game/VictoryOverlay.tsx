/**
 * VictoryOverlay Component
 * Celebratory completion screen with animated stars and confetti.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import confetti from 'canvas-confetti';
import { ColorTheme } from '../../theme/colors';

interface VictoryOverlayProps {
  visible: boolean;
  levelId: number;
  levelTitle: string;
  starsAwarded: 1 | 2 | 3;
  totalTaps: number;
  targetMoves: number;
  theme: ColorTheme;
  onNextLevel: () => void;
  onReplay: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  visible,
  levelId,
  levelTitle,
  starsAwarded,
  totalTaps,
  targetMoves,
  theme,
  onNextLevel,
  onReplay,
}) => {
  useEffect(() => {
    if (visible) {
      try {
        // Confetti burst on solve
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#F59E0B', '#10B981', '#EC4899'],
        });
      } catch (e) {
        // ignore in non-browser env
      }
    }
  }, [visible]);

  if (!visible) return null;

  const starTitles: Record<number, string> = {
    3: 'FLAWLESS ESCAPE!',
    2: 'GREAT PUZZLE SOLVE!',
    1: 'LEVEL COMPLETED!',
  };

  return (
    <View style={styles.overlayBackdrop}>
      <View
        style={[
          styles.modalCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.boardBorder,
            shadowColor: theme.arrowShadow,
          },
        ]}
      >
        <Text style={[styles.badgeText, { color: theme.accent }]}>LEVEL {levelId} CLEARED</Text>
        <Text style={[styles.headline, { color: theme.textPrimary }]}>
          {starTitles[starsAwarded] || 'PUZZLE SOLVED!'}
        </Text>

        {/* Big 3-Star Cluster */}
        <View style={styles.starsContainer}>
          {[1, 2, 3].map(starNum => {
            const isEarned = starNum <= starsAwarded;
            return (
              <View
                key={starNum}
                style={[
                  styles.starPill,
                  starNum === 2 && styles.centerStar,
                  { backgroundColor: isEarned ? theme.starFilled : theme.starEmpty },
                ]}
              >
                <Text style={styles.starText}>★</Text>
              </View>
            );
          })}
        </View>

        {/* Performance Summary */}
        <View style={[styles.statsCard, { backgroundColor: theme.boardBg }]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Moves Taken:</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{totalTaps}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Optimal Moves:</Text>
            <Text style={[styles.statValue, { color: theme.victoryGlow }]}>{targetMoves}</Text>
          </View>
        </View>

        {/* Action CTAs */}
        <View style={styles.buttonStack}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onNextLevel}
            style={[styles.primaryButton, { backgroundColor: theme.arrowBody }]}
          >
            <Text style={styles.primaryButtonText}>NEXT LEVEL ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onReplay}
            style={[styles.secondaryButton, { borderColor: theme.boardBorder }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>REPLAY LEVEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 32,
    borderWidth: 2,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  headline: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  starPill: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  centerStar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    transform: [{ translateY: -6 }],
  },
  starText: {
    color: '#FFFFFF',
    fontSize: 32,
  },
  statsCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    marginVertical: 18,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  buttonStack: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
