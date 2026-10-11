/**
 * Arrow Escape — Cosmetics Modal (Visuals Wardrobe & Vault)
 * Allows players to inspect, unlock, and equip Arrow Skins, Board Themes, and Escape Effects.
 */

import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ColorTheme } from '../../theme/colors';
import {
  ARROW_SKINS,
  BOARD_THEMES,
  ESCAPE_EFFECTS,
  CosmeticCategory,
  CosmeticItem,
  isCosmeticUnlocked,
} from '../../services/cosmetics/cosmeticsCatalog';
import { UserProgressData } from '../../services/storage/progressStorage';
import { DailyChallengeState } from '../../services/daily/dailyChallengeService';
import { audioService } from '../../services/audio/audioService';
import { hapticsService } from '../../services/haptics/hapticsService';
import { billingService } from '../../services/billing/billingService';

interface CosmeticsModalProps {
  visible: boolean;
  theme: ColorTheme;
  progress: UserProgressData;
  dailyState?: DailyChallengeState | null;
  onEquipCosmetic: (category: CosmeticCategory, key: string) => void;
  onPurchaseVipSuccess?: () => void;
  onClose: () => void;
}

export const CosmeticsModal: React.FC<CosmeticsModalProps> = ({
  visible,
  theme,
  progress,
  dailyState,
  onEquipCosmetic,
  onPurchaseVipSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CosmeticCategory>('theme');
  const [isPurchasing, setIsPurchasing] = useState(false);

  const selectedSkin = progress.selectedSkin || 'classic';
  const selectedTheme = progress.selectedTheme || 'dawn';
  const selectedEffect = progress.selectedEscapeEffect || 'classic';
  const isVipUnlocked = !!progress.cosmeticsVipUnlocked || billingService.isCosmeticsVip();

  const currentItems: readonly CosmeticItem[] = useMemo(() => {
    switch (activeTab) {
      case 'skin':
        return ARROW_SKINS;
      case 'effect':
        return ESCAPE_EFFECTS;
      case 'theme':
      default:
        return BOARD_THEMES;
    }
  }, [activeTab]);

  const handleTabChange = (tab: CosmeticCategory) => {
    audioService.playClick();
    hapticsService.vibrateLight();
    setActiveTab(tab);
  };

  const handleEquip = (item: CosmeticItem) => {
    audioService.playClick();
    hapticsService.vibrateSuccess();
    onEquipCosmetic(item.category, item.key);
  };

  const handleBuyVip = async () => {
    if (isPurchasing || isVipUnlocked) return;
    setIsPurchasing(true);
    audioService.playClick();
    hapticsService.vibrateLight();
    try {
      const result = await billingService.purchaseCosmeticsVip();
      if (result.success) {
        hapticsService.vibrateSuccess();
        audioService.playVictory();
        if (onPurchaseVipSuccess) {
          onPurchaseVipSuccess();
        }
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerIcon}>✨</Text>
                <View>
                  <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Cosmetics Vault</Text>
                  <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                    Themes, Skins & Escape Effects
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  audioService.playClick();
                  onClose();
                }}
                style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated || 'rgba(255,255,255,0.08)' }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.closeBtnText, { color: theme.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category Tabs */}
            <View style={[styles.tabBar, { backgroundColor: theme.surfaceElevated || 'rgba(0,0,0,0.2)' }]}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'theme' && styles.tabBtnActive]}
                onPress={() => handleTabChange('theme')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'theme' ? styles.tabTextActive : { color: theme.textMuted }]}>
                  🎨 Board Themes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'skin' && styles.tabBtnActive]}
                onPress={() => handleTabChange('skin')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'skin' ? styles.tabTextActive : { color: theme.textMuted }]}>
                  🏹 Arrow Skins
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'effect' && styles.tabBtnActive]}
                onPress={() => handleTabChange('effect')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'effect' ? styles.tabTextActive : { color: theme.textMuted }]}>
                  💫 Effects
                </Text>
              </TouchableOpacity>
            </View>

            {/* Equipped Summary Strip */}
            <View style={[styles.equippedStrip, { backgroundColor: theme.surfaceElevated || 'rgba(0,0,0,0.15)' }]}>
              <Text style={[styles.equippedSummaryText, { color: theme.textSecondary }]}>
                🎨 {selectedTheme} &nbsp;|&nbsp; 🏹 {selectedSkin} &nbsp;|&nbsp; 💫 {selectedEffect}
              </Text>
            </View>

            {/* Scrollable Item Grid */}
            <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
              {currentItems.map(item => {
                const unlocked = isCosmeticUnlocked(item, progress, dailyState, isVipUnlocked);
                let isEquipped = false;
                if (item.category === 'theme') isEquipped = selectedTheme === item.key;
                if (item.category === 'skin') isEquipped = selectedSkin === item.key;
                if (item.category === 'effect') isEquipped = selectedEffect === item.key;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: theme.surfaceElevated || 'rgba(255,255,255,0.05)',
                        borderColor: isEquipped ? theme.accent : unlocked ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                      },
                      isEquipped && styles.itemCardEquipped,
                    ]}
                  >
                    {/* Left Icon & Preview Dot */}
                    <View style={styles.cardLeftCol}>
                      <View style={[styles.previewBadge, { backgroundColor: item.previewColor }]}>
                        <Text style={styles.itemIcon}>{item.icon}</Text>
                      </View>
                      {item.isLight && (
                        <View style={styles.lightBadge}>
                          <Text style={styles.lightBadgeText}>LIGHT</Text>
                        </View>
                      )}
                    </View>

                    {/* Middle Info */}
                    <View style={styles.cardInfoCol}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.itemName, { color: theme.textPrimary }]}>{item.name}</Text>
                        {isEquipped && (
                          <View style={[styles.equippedPill, { backgroundColor: theme.accent }]}>
                            <Text style={styles.equippedPillText}>EQUIPPED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>{item.description}</Text>
                      {!unlocked && (
                        <Text style={styles.requirementText}>
                          🔒 {item.unlockRequirementText}
                        </Text>
                      )}
                    </View>

                    {/* Right Action */}
                    <View style={styles.cardActionCol}>
                      {isEquipped ? (
                        <View style={[styles.actionBtn, styles.actionBtnEquipped]}>
                          <Text style={styles.actionBtnEquippedText}>Active ✓</Text>
                        </View>
                      ) : unlocked ? (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: theme.accent }]}
                          onPress={() => handleEquip(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnText}>Equip</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.lockedBadge}>
                          <Text style={styles.lockedBadgeText}>Locked</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* VIP Vault Pack Banner */}
              <View style={[styles.vipBanner, { borderColor: theme.accent }]}>
                <View style={styles.vipLeft}>
                  <Text style={styles.vipCrown}>👑</Text>
                  <View style={styles.vipTextCol}>
                    <Text style={styles.vipTitle}>VIP Cosmetics Vault</Text>
                    <Text style={styles.vipDesc}>
                      Instantly unlock all 6 Skins, 11 Themes & 5 Escape Effects!
                    </Text>
                  </View>
                </View>

                {isVipUnlocked ? (
                  <View style={styles.vipUnlockedBadge}>
                    <Text style={styles.vipUnlockedText}>Unlocked ✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.vipBuyBtn, { backgroundColor: theme.accent }]}
                    onPress={handleBuyVip}
                    disabled={isPurchasing}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.vipBuyBtnText}>
                      {isPurchasing ? 'Unlocking...' : '$2.99 Unlock All'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: 520,
    height: '92%',
    paddingHorizontal: 12,
  },
  modalCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 26,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 14,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#38BDF8',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  equippedStrip: {
    marginHorizontal: 14,
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  equippedSummaryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollList: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    gap: 10,
  },
  itemCardEquipped: {
    borderWidth: 2,
  },
  cardLeftCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  itemIcon: {
    fontSize: 22,
  },
  lightBadge: {
    marginTop: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  lightBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000',
  },
  cardInfoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  equippedPill: {
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  equippedPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  itemDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  requirementText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F87171',
    marginTop: 4,
  },
  cardActionCol: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionBtnEquipped: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  actionBtnEquippedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4ADE80',
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  vipBanner: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  vipCrown: {
    fontSize: 28,
  },
  vipTextCol: {
    flex: 1,
  },
  vipTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FDE047',
  },
  vipDesc: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FEF08A',
    marginTop: 2,
    lineHeight: 13,
  },
  vipBuyBtn: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  vipBuyBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  vipUnlockedBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  vipUnlockedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
