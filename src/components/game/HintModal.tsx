/**
 * Arrow Escape — HintModal Component
 * Educational 3-tier assistance selector:
 * Level 1 (Directional) | Level 2 (Blocker) | Level 3 (Solution Path)
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorTheme } from '../../theme/colors';
import { HintTierLevel } from '../../engine/hintEngine';

interface HintModalProps {
  visible: boolean;
  hintsAvailable: number;
  theme: ColorTheme;
  onSelectTier: (tier: HintTierLevel) => void;
  onWatchAdForHints: () => void;
  onClose: () => void;
}

interface TierOption {
  tier: HintTierLevel;
  icon: string;
  title: string;
  badge: string;
  description: string;
  accent: string;
}

const TIERS: TierOption[] = [
  {
    tier: 'DIRECTIONAL',
    icon: '🧭',
    title: 'Level 1: Directional Hint',
    badge: 'Gentle Nudge',
    description: 'Highlights an unobstructed arrow ready to escape the board immediately.',
    accent: '#38BDF8',
  },
  {
    tier: 'BLOCKER',
    icon: '🔍',
    title: 'Level 2: Blocker Dependency',
    badge: 'Dependency Insight',
    description: 'Reveals a blocked arrow and highlights the obstacle in its exit path.',
    accent: '#F59E0B',
  },
  {
    tier: 'SOLUTION',
    icon: '🎯',
    title: 'Level 3: Master Solution Path',
    badge: 'Guaranteed Step',
    description: 'Calculates the next strategic move from a verified complete solution sequence.',
    accent: '#10B981',
  },
];

export const HintModal: React.FC<HintModalProps> = ({
  visible,
  hintsAvailable,
  theme,
  onSelectTier,
  onWatchAdForHints,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.surface, borderColor: theme.boardBorder },
        ]}
      >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Tactical Assistance</Text>
              <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
                Choose the level of help you need
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { borderColor: theme.boardBorder }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Hint Balance Pill */}
          <View style={[styles.balancePill, { backgroundColor: theme.surfaceElevated, borderColor: theme.boardBorder }]}>
            <Text style={styles.balanceIcon}>💡</Text>
            <Text style={[styles.balanceText, { color: theme.textPrimary }]}>
              {hintsAvailable} <Text style={{ color: theme.textSecondary, fontWeight: '500' }}>Hints Available</Text>
            </Text>
            {hintsAvailable > 0 && (
              <Text style={[styles.costLabel, { color: theme.accent }]}>Costs 1 Hint</Text>
            )}
          </View>

          {/* 3 Assistance Tiers */}
          <View style={styles.tiersList}>
            {TIERS.map(opt => {
              const disabled = hintsAvailable <= 0;
              return (
                <TouchableOpacity
                  key={opt.tier}
                  disabled={disabled}
                  onPress={() => onSelectTier(opt.tier)}
                  style={[
                    styles.tierCard,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: disabled ? theme.boardBorder : opt.accent + '66',
                      opacity: disabled ? 0.6 : 1,
                    },
                  ]}
                  activeOpacity={0.82}
                >
                  <View style={styles.tierTopRow}>
                    <View style={styles.tierIconGroup}>
                      <Text style={styles.tierIcon}>{opt.icon}</Text>
                      <View>
                        <Text style={[styles.tierTitle, { color: theme.textPrimary }]}>
                          {opt.title}
                        </Text>
                        <View style={[styles.badgePill, { backgroundColor: opt.accent + '22' }]}>
                          <Text style={[styles.badgeText, { color: opt.accent }]}>
                            {opt.badge}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.tierArrow, { color: opt.accent }]}>→</Text>
                  </View>
                  <Text style={[styles.tierDesc, { color: theme.textSecondary }]}>
                    {opt.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Out of Hints Ad Option */}
          {hintsAvailable <= 0 ? (
            <TouchableOpacity
              style={styles.adActionBtn}
              onPress={onWatchAdForHints}
              activeOpacity={0.85}
            >
              <Text style={styles.adBtnIcon}>🎁</Text>
              <View style={styles.adBtnTextCol}>
                <Text style={styles.adBtnTitle}>Watch Short Video</Text>
                <Text style={styles.adBtnSub}>Receive +3 Free Hints</Text>
              </View>
              <Text style={styles.adBtnArrow}>▶</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.freeHintBtn, { borderColor: theme.boardBorder }]}
              onPress={onWatchAdForHints}
              activeOpacity={0.8}
            >
              <Text style={[styles.freeHintText, { color: theme.accent }]}>
                🎁 Need More? Watch Video (+3 Hints)
              </Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: 'rgba(5, 12, 22, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  balanceIcon: {
    fontSize: 18,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  costLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  tiersList: {
    gap: 10,
    marginBottom: 16,
  },
  tierCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  tierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierIcon: {
    fontSize: 22,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tierArrow: {
    fontSize: 18,
    fontWeight: '900',
  },
  tierDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  adActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#34D399',
    gap: 12,
  },
  adBtnIcon: {
    fontSize: 22,
  },
  adBtnTextCol: {
    flex: 1,
  },
  adBtnTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adBtnSub: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 1,
  },
  adBtnArrow: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  freeHintBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  freeHintText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
