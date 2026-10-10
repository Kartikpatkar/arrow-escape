/**
 * GameControls Component
 * Provides Undo, Hint, and Restart controls with tactile feedback.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ColorTheme } from '../../theme/colors';

interface GameControlsProps {
  canUndo: boolean;
  hintsAvailable: number;
  isHintActive: boolean;
  theme: ColorTheme;
  onUndo: () => void;
  onHint: () => void;
  onRestart: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  canUndo,
  hintsAvailable,
  isHintActive,
  theme,
  onUndo,
  onHint,
  onRestart,
}) => {
  return (
    <View style={styles.controlsContainer}>
      {/* Undo Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        disabled={!canUndo}
        onPress={onUndo}
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.boardBorder,
            opacity: canUndo ? 1 : 0.45,
          },
        ]}
      >
        <Text style={[styles.actionIcon, { color: theme.textPrimary }]}>↩</Text>
        <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>UNDO</Text>
      </TouchableOpacity>

      {/* Hint Button (Prominent & highlighted) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onHint}
        style={[
          styles.hintButton,
          {
            backgroundColor: isHintActive ? theme.hintGlow : theme.surface,
            borderColor: theme.hintGlow,
            shadowColor: theme.hintGlow,
          },
        ]}
      >
        <View style={styles.hintBadge}>
          <Text style={styles.hintBadgeText}>{hintsAvailable}</Text>
        </View>
        <Text style={[styles.hintIcon, { color: isHintActive ? '#FFFFFF' : theme.hintGlow }]}>💡</Text>
        <Text
          style={[
            styles.hintLabel,
            { color: isHintActive ? '#FFFFFF' : theme.textPrimary },
          ]}
        >
          {isHintActive ? 'HINT ACTIVE' : 'HINT'}
        </Text>
      </TouchableOpacity>

      {/* Restart Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onRestart}
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.boardBorder,
          },
        ]}
      >
        <Text style={[styles.actionIcon, { color: theme.textPrimary }]}>↻</Text>
        <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>RETRY</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  hintButton: {
    flex: 1.3,
    height: 70,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  hintBadge: {
    position: 'absolute',
    top: -6,
    right: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  hintBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  hintIcon: {
    fontSize: 20,
  },
  hintLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
});
