/**
 * SettingsModal Component
 * Controls for audio, haptics, theme selection, and progress reset.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { THEMES, ColorTheme } from '../../theme/colors';
import { monetizationAnalytics } from '../../services/analytics/monetizationAnalytics';

interface SettingsModalProps {
  visible: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  selectedThemeKey: string;
  adsRemoved: boolean;
  theme: ColorTheme;
  animationPacing?: 'dynamic' | 'fast' | 'cinematic';
  onOpenCosmetics?: () => void;
  onToggleSound: (enabled: boolean) => void;
  onToggleHaptics: (enabled: boolean) => void;
  onSelectTheme: (themeKey: string) => void;
  onSelectAnimationPacing?: (mode: 'dynamic' | 'fast' | 'cinematic') => void;
  onPurchaseRemoveAds: () => void;
  onRestorePurchases: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  soundEnabled,
  hapticsEnabled,
  selectedThemeKey,
  adsRemoved,
  theme,
  animationPacing = 'dynamic',
  onOpenCosmetics,
  onToggleSound,
  onToggleHaptics,
  onSelectTheme,
  onSelectAnimationPacing,
  onPurchaseRemoveAds,
  onRestorePurchases,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (visible && !adsRemoved) {
      monetizationAnalytics.trackProductOffered('remove_ads');
    }
  }, [visible, adsRemoved]);

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.bodyScroll}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginBottom: 0 }]}>VISUAL THEMES & SKINS</Text>
            {onOpenCosmetics && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenCosmetics();
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.accent }}>Full Vault ✨</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.themeScrollContent}
          >
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
                      borderColor: isSelected ? theme.accent : 'rgba(255, 255, 255, 0.15)',
                      borderWidth: isSelected ? 2.5 : 1.5,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.themeDot, { backgroundColor: th.arrowBody }]} />
                  <Text
                    style={[
                      styles.themeName,
                      {
                        color: isSelected ? '#FFFFFF' : th.textSecondary || '#CBD5E1',
                        fontWeight: isSelected ? '900' : '700',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {th.name.replace(/\s*\(.*\)/, '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Animation & Pacing Setting */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ANIMATION & PACING</Text>
          <View style={styles.pacingRow}>
            {(
              [
                { key: 'dynamic', title: '⚡ Dynamic (Combo Turbo)', sub: 'Fast rapid moves • Cinematic final' },
                { key: 'fast', title: '⏩ Fast & Snappy', sub: '380ms all moves • High throughput' },
                { key: 'cinematic', title: '🎬 Cinematic', sub: '900ms smooth • Full visual drama' },
              ] as const
            ).map(opt => {
              const isSelected = animationPacing === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => onSelectAnimationPacing?.(opt.key)}
                  style={[
                    styles.pacingCard,
                    {
                      backgroundColor: isSelected ? theme.accent : theme.surfaceElevated,
                      borderColor: isSelected ? '#FDE047' : theme.boardBorder,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pacingTitle, { color: isSelected ? '#0F172A' : theme.textPrimary }]}>
                    {opt.title}
                  </Text>
                  <Text style={[styles.pacingSub, { color: isSelected ? '#1E293B' : theme.textMuted }]}>
                    {opt.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Monetization / In-App Purchases */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>STORE & PURCHASES</Text>
          {adsRemoved ? (
            <View style={[styles.adFreeBadge, { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22C55E' }]}>
              <Text style={styles.adFreeText}>✨ Ad-Free Supporter Active</Text>
              <Text style={[styles.adFreeSubtext, { color: theme.textSecondary }]}>
                Banner & Interstitial ads permanently disabled. Optional rewarded ads remain accessible for bonus hints & gifts.
              </Text>
            </View>
          ) : (
            <View style={styles.storeCard}>
              <TouchableOpacity
                onPress={onPurchaseRemoveAds}
                style={[styles.removeAdsBtn, { backgroundColor: theme.arrowBody }]}
                activeOpacity={0.85}
              >
                <Text style={styles.removeAdsBtnText}>💎 Remove Ads ($1.99)</Text>
              </TouchableOpacity>
              <Text style={[styles.storeOfferNote, { color: theme.textMuted }]}>
                Permanently removes all Banner & Interstitial ads. Rewarded ads remain 100% optional for bonus hints and gifts.
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={onRestorePurchases} style={styles.restoreBtn} activeOpacity={0.7}>
            <Text style={[styles.restoreBtnText, { color: theme.textSecondary }]}>Restore Purchases</Text>
          </TouchableOpacity>
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
        </ScrollView>
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
    maxHeight: '88%',
    borderRadius: 28,
    borderWidth: 2,
    padding: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  bodyScroll: {
    flexShrink: 1,
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
  themeScrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  themeButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeName: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  removeAdsBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeAdsBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  storeCard: {
    width: '100%',
    marginBottom: 8,
  },
  storeOfferNote: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  adFreeBadge: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 8,
  },
  adFreeText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 13,
  },
  adFreeSubtext: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
  pacingRow: {
    gap: 8,
  },
  pacingCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  pacingTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  pacingSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
