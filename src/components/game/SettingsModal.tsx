/**
 * SettingsModal Component
 * Controls for audio, haptics, theme selection, and progress reset.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { THEMES, ColorTheme } from '../../theme/colors';

interface SettingsModalProps {
  visible: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  selectedThemeKey: string;
  theme: ColorTheme;
  onToggleSound: (enabled: boolean) => void;
  onToggleHaptics: (enabled: boolean) => void;
  onSelectTheme: (themeKey: string) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  soundEnabled,
  hapticsEnabled,
  selectedThemeKey,
  theme,
  onToggleSound,
  onToggleHaptics,
  onSelectTheme,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
          <TouchableOpacity
            onPress={() => {
              setConfirmReset(false);
              onClose();
            }}
            style={[styles.closeBtn, { borderColor: theme.boardBorder }]}
          >
            <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <View style={[styles.settingRow, { borderBottomColor: theme.boardBorder }]}>
            <View style={styles.labelCol}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>🔊 Sound Effects</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Crisp escape pops & chimes</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={onToggleSound}
              trackColor={{ false: '#CBD5E1', true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.boardBorder }]}>
            <View style={styles.labelCol}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>📳 Haptic Feedback</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Tactile vibrations on moves</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={onToggleHaptics}
              trackColor={{ false: '#CBD5E1', true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Theme Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>VISUAL THEME</Text>
          <View style={styles.themeRow}>
            {Object.keys(THEMES).map(tKey => {
              const th = THEMES[tKey];
              const isSelected = selectedThemeKey === tKey;
              return (
                <TouchableOpacity
                  key={tKey}
                  onPress={() => onSelectTheme(tKey)}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: th.background,
                      borderColor: isSelected ? theme.accent : theme.boardBorder,
                      borderWidth: isSelected ? 2.5 : 1,
                    },
                  ]}
                >
                  <View style={[styles.themeDot, { backgroundColor: th.arrowBody }]} />
                  <Text
                    style={[
                      styles.themeName,
                      { color: th.textPrimary, fontWeight: isSelected ? '800' : '600' },
                    ]}
                  >
                    {th.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Danger Zone: Reset */}
        <View style={styles.section}>
          {confirmReset ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>Reset all levels, stars, and progress?</Text>
              <View style={styles.confirmBtnRow}>
                <TouchableOpacity
                  onPress={() => {
                    onResetProgress();
                    setConfirmReset(false);
                    onClose();
                  }}
                  style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                >
                  <Text style={styles.confirmBtnText}>YES, RESET</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setConfirmReset(false)}
                  style={[styles.confirmBtn, { borderColor: theme.boardBorder, borderWidth: 1 }]}
                >
                  <Text style={[styles.confirmCancelText, { color: theme.textSecondary }]}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setConfirmReset(true)}
              style={[styles.resetButton, { borderColor: '#FCA5A5' }]}
            >
              <Text style={styles.resetButtonText}>⚠️ Reset Game Progress</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Credits */}
        <View style={styles.footer}>
          <Text style={[styles.credits, { color: theme.textMuted }]}>
            Arrow Escape v1.0.0 • Created with care by Kartik Patkar
          </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    borderWidth: 2,
    padding: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  labelCol: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 12,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  themeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeName: {
    fontSize: 12,
  },
  resetButton: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  resetButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBox: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 14,
  },
  confirmText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  confirmCancelText: {
    fontWeight: '800',
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  credits: {
    fontSize: 11,
    fontWeight: '600',
  },
});
