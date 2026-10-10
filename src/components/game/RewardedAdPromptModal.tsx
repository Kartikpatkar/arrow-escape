/**
 * RewardedAdPromptModal Component
 * Prompts the player to voluntarily watch a rewarded video for +1 Free Hint.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ColorTheme } from '../../theme/colors';

interface RewardedAdPromptModalProps {
  visible: boolean;
  theme: ColorTheme;
  onWatchAd: () => Promise<void>;
  onClose: () => void;
}

export const RewardedAdPromptModal: React.FC<RewardedAdPromptModalProps> = ({
  visible,
  theme,
  onWatchAd,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const handleWatch = async () => {
    setLoading(true);
    await onWatchAd();
    setLoading(false);
    onClose();
  };

  return (
    <View style={styles.backdrop}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>💡</Text>
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Need an Extra Hint?</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          Watch a quick sponsor message to receive +1 Free Hint immediately.
        </Text>

        <View style={styles.buttonStack}>
          <TouchableOpacity
            disabled={loading}
            activeOpacity={0.85}
            onPress={handleWatch}
            style={[styles.watchBtn, { backgroundColor: theme.hintGlow }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.watchBtnText}>🎬 WATCH VIDEO (+1 HINT)</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            activeOpacity={0.8}
            onPress={onClose}
            style={[styles.cancelBtn, { borderColor: theme.boardBorder }]}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>NO THANKS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 2,
    padding: 28,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  watchBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  watchBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
