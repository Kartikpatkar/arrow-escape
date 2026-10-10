/**
 * Arrow Escape — Grand 500-Level Completion Modal
 * Celebrates completing the entire 500-level game without looping back.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GrandCompletionModalProps {
  visible: boolean;
  totalLevels: number;
  totalStars: number;
  onHomePress: () => void;
  onSelectLevelPress: () => void;
}

export const GrandCompletionModal: React.FC<GrandCompletionModalProps> = ({
  visible,
  totalLevels,
  totalStars,
  onHomePress,
  onSelectLevelPress,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.trophyContainer}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.sparkleEmoji}>✨ 🎉 ✨</Text>
        </View>

        <Text style={styles.title}>CONGRATULATIONS!</Text>
        <Text style={styles.subtitle}>Grand Master of Arrow Escape</Text>

        <Text style={styles.message}>
          You have conquered all {totalLevels} levels of Arrow Escape!
          Every intricate grid, labyrinth, and maze has been solved by your master logic.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalLevels}</Text>
            <Text style={styles.statLabel}>Levels Solved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>★ {totalStars}</Text>
            <Text style={styles.statLabel}>Total Stars</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onHomePress}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Return to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSelectLevelPress}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Replay Any Level</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 20, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 179, 8, 0.5)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
  },
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyEmoji: {
    fontSize: 64,
  },
  sparkleEmoji: {
    fontSize: 20,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#EAB308',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
});
