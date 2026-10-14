/**
 * Arrow Escape — Cosmetics Modal (Visuals Wardrobe & VIP Vault)
 * Allows players to inspect, preview locked items, and unlock Arrow Skins, Board Themes, and Effects.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { ColorTheme, THEMES } from '../../theme/colors';
import {
  ARROW_SKINS,
  BOARD_THEMES,
  ESCAPE_EFFECTS,
  CosmeticCategory,
  CosmeticItem,
  isCosmeticUnlocked,
  getVipCollectionCatalog,
} from '../../services/cosmetics/cosmeticsCatalog';
import { UserProgressData } from '../../services/storage/progressStorage';
import { DailyChallengeState } from '../../services/daily/dailyChallengeService';
import { audioService } from '../../services/audio/audioService';
import { hapticsService } from '../../services/haptics/hapticsService';
import { billingService } from '../../services/billing/billingService';
import { monetizationAnalytics } from '../../services/analytics/monetizationAnalytics';

type TabKey = CosmeticCategory | 'vip';

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
  const [activeTab, setActiveTab] = useState<TabKey>('theme');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);

  const selectedSkin = progress.selectedSkin || 'classic';
  const selectedTheme = progress.selectedTheme || 'dawn';
  const selectedEffect = progress.selectedEscapeEffect || 'classic';
  const isVipUnlocked = !!progress.cosmeticsVipUnlocked || billingService.isCosmeticsVip();

  // Track product offer when modal is presented
  useEffect(() => {
    if (visible && !isVipUnlocked) {
      monetizationAnalytics.trackProductOffered('vip_pass');
    }
  }, [visible, isVipUnlocked]);

  // Set default preview item when modal opens or tab changes
  useEffect(() => {
    if (!previewItem) {
      const defaultItem = BOARD_THEMES.find(t => t.key === selectedTheme) || BOARD_THEMES[0];
      setPreviewItem(defaultItem);
    }
  }, [selectedTheme, previewItem]);

  const vipCatalog = useMemo(() => getVipCollectionCatalog(), []);

  const currentItems: readonly CosmeticItem[] = useMemo(() => {
    switch (activeTab) {
      case 'skin':
        return ARROW_SKINS;
      case 'effect':
        return ESCAPE_EFFECTS;
      case 'theme':
        return BOARD_THEMES;
      case 'vip':
        return [];
      default:
        return BOARD_THEMES;
    }
  }, [activeTab]);

  const handleTabChange = (tab: TabKey) => {
    audioService.playClick();
    hapticsService.vibrateLight();
    setActiveTab(tab);
    if (tab === 'theme') {
      setPreviewItem(BOARD_THEMES.find(t => t.key === selectedTheme) || BOARD_THEMES[0]);
    } else if (tab === 'skin') {
      setPreviewItem(ARROW_SKINS.find(s => s.key === selectedSkin) || ARROW_SKINS[0]);
    } else if (tab === 'effect') {
      setPreviewItem(ESCAPE_EFFECTS.find(e => e.key === selectedEffect) || ESCAPE_EFFECTS[0]);
    } else if (tab === 'vip') {
      setPreviewItem(vipCatalog.themes[0]);
    }
  };

  const handleSelectItemForPreview = (item: CosmeticItem) => {
    audioService.playClick();
    hapticsService.vibrateLight();
    setPreviewItem(item);
  };

  const handleEquip = (item: CosmeticItem) => {
    audioService.playClick();
    hapticsService.vibrateSuccess();
    onEquipCosmetic(item.category, item.key);
    setPreviewItem(item);
  };

  const handleBuyVip = async () => {
    if (isPurchasing || isVipUnlocked) return;
    setIsPurchasing(true);
    audioService.playClick();
    hapticsService.vibrateLight();
    try {
      const result = await billingService.purchaseCosmeticsVip();
      if (result.success) {
        monetizationAnalytics.trackProductPurchased('vip_pass', 2.99);
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

  // Preview styling calculations
  const previewThemeKey = previewItem?.category === 'theme' ? previewItem.key : selectedTheme;
  const previewSkinKey = previewItem?.category === 'skin' ? previewItem.key : selectedSkin;
  const previewEffectKey = previewItem?.category === 'effect' ? previewItem.key : selectedEffect;
  const previewThemeConfig = THEMES[previewThemeKey] || theme;
  const isPreviewUnlocked = previewItem
    ? isCosmeticUnlocked(previewItem, progress, dailyState, isVipUnlocked)
    : true;

  let isPreviewEquipped = false;
  if (previewItem) {
    if (previewItem.category === 'theme') isPreviewEquipped = selectedTheme === previewItem.key;
    if (previewItem.category === 'skin') isPreviewEquipped = selectedSkin === previewItem.key;
    if (previewItem.category === 'effect') isPreviewEquipped = selectedEffect === previewItem.key;
  }

  const renderCosmeticCard = (item: CosmeticItem) => {
    const unlocked = isCosmeticUnlocked(item, progress, dailyState, isVipUnlocked);
    let isEquipped = false;
    if (item.category === 'theme') isEquipped = selectedTheme === item.key;
    if (item.category === 'skin') isEquipped = selectedSkin === item.key;
    if (item.category === 'effect') isEquipped = selectedEffect === item.key;

    const isCurrentlyPreviewed = previewItem?.id === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.85}
        onPress={() => handleSelectItemForPreview(item)}
        style={[
          styles.itemCard,
          {
            backgroundColor: theme.surfaceElevated || 'rgba(255,255,255,0.05)',
            borderColor: isCurrentlyPreviewed
              ? '#F59E0B'
              : isEquipped
              ? theme.accent
              : unlocked
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(255,255,255,0.05)',
          },
          isCurrentlyPreviewed && styles.itemCardPreviewed,
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
            {isEquipped ? (
              <View style={[styles.equippedPill, { backgroundColor: theme.accent }]}>
                <Text style={styles.equippedPillText}>EQUIPPED</Text>
              </View>
            ) : item.isVipCollection ? (
              <View style={styles.vipTagPill}>
                <Text style={styles.vipTagText}>👑 VIP</Text>
              </View>
            ) : item.isUnlockedByDefault ? (
              <View style={styles.freeTagPill}>
                <Text style={styles.freeTagText}>FREE</Text>
              </View>
            ) : (
              <View style={styles.milestoneTagPill}>
                <Text style={styles.milestoneTagText}>REWARD</Text>
              </View>
            )}
          </View>

          <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>{item.description}</Text>

          {!unlocked ? (
            <Text style={styles.requirementText}>🔒 {item.unlockRequirementText}</Text>
          ) : (
            <Text style={styles.unlockedHintText}>✓ Tap to preview & equip</Text>
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
            <TouchableOpacity
              style={[
                styles.previewLockedBtn,
                isCurrentlyPreviewed && styles.previewLockedBtnActive,
              ]}
              onPress={() => handleSelectItemForPreview(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.previewLockedBtnText}>
                {isCurrentlyPreviewed ? '👁️ Viewing' : 'Preview'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.boardBorder },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerIcon}>✨</Text>
                <View>
                  <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    Cosmetics Wardrobe
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                    Preview locked themes, skins & effects before buying
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  audioService.playClick();
                  onClose();
                }}
                style={[
                  styles.closeBtn,
                  { backgroundColor: theme.surfaceElevated || 'rgba(255,255,255,0.08)' },
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.closeBtnText, { color: theme.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* LIVE COSMETICS PREVIEW STAGE */}
            {previewItem && (
              <View
                style={[
                  styles.previewStageCard,
                  {
                    backgroundColor: previewThemeConfig.boardBg || '#1B6474',
                    borderColor: previewThemeConfig.boardBorder || '#4DD4DC',
                  },
                ]}
              >
                {/* Stage Header */}
                <View style={styles.previewStageHeader}>
                  <View style={styles.previewBadgeRow}>
                    <Text style={styles.previewStageLabel}>LIVE PREVIEW</Text>
                    {previewItem.isVipCollection ? (
                      <View style={styles.stageVipBadge}>
                        <Text style={styles.stageVipBadgeText}>💎 VIP COLLECTION</Text>
                      </View>
                    ) : previewItem.isUnlockedByDefault ? (
                      <View style={styles.stageFreeBadge}>
                        <Text style={styles.stageFreeBadgeText}>🆓 FREE STARTER</Text>
                      </View>
                    ) : (
                      <View style={styles.stageMilestoneBadge}>
                        <Text style={styles.stageMilestoneBadgeText}>🏆 GAMEPLAY REWARD</Text>
                      </View>
                    )}
                  </View>

                  {/* Stage Action */}
                  {isPreviewUnlocked ? (
                    isPreviewEquipped ? (
                      <View style={styles.stageActivePill}>
                        <Text style={styles.stageActiveText}>EQUIPPED ✓</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.stageEquipBtn, { backgroundColor: theme.accent }]}
                        onPress={() => handleEquip(previewItem)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.stageEquipBtnText}>EQUIP NOW</Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    <TouchableOpacity
                      style={styles.stageVipUnlockBtn}
                      onPress={handleBuyVip}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.stageVipUnlockBtnText}>UNLOCK WITH VIP</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Stage Canvas */}
                <View style={styles.previewCanvasRow}>
                  {/* Mini Board Simulator */}
                  <View
                    style={[
                      styles.miniBoardTile,
                      {
                        backgroundColor: previewThemeConfig.tileBg || '#124856',
                        borderColor: previewThemeConfig.boardBorder || '#4DD4DC',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.miniArrowToken,
                        {
                          backgroundColor:
                            previewItem.category === 'skin'
                              ? previewItem.previewColor
                              : previewThemeConfig.arrowBody,
                        },
                      ]}
                    >
                      <Text style={styles.miniArrowGlyph}>▲</Text>
                    </View>
                    <Text style={styles.miniFxBadge}>{previewItem.icon}</Text>
                  </View>

                  {/* Item Description in Stage */}
                  <View style={styles.previewStageInfoCol}>
                    <Text
                      style={[styles.previewStageTitle, { color: previewThemeConfig.textPrimary }]}
                    >
                      {previewItem.name}
                    </Text>
                    <Text
                      style={[
                        styles.previewStageDesc,
                        { color: previewThemeConfig.textSecondary },
                      ]}
                    >
                      {previewItem.description}
                    </Text>
                    {!isPreviewUnlocked && (
                      <Text style={styles.previewStageLockNote}>
                        🔒 Locked: {previewItem.unlockRequirementText}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Category Tabs */}
            <View
              style={[
                styles.tabBar,
                { backgroundColor: theme.surfaceElevated || 'rgba(0,0,0,0.2)' },
              ]}
            >
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'theme' && styles.tabBtnActive]}
                onPress={() => handleTabChange('theme')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'theme' ? styles.tabTextActive : { color: theme.textMuted },
                  ]}
                >
                  🎨 Themes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'skin' && styles.tabBtnActive]}
                onPress={() => handleTabChange('skin')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'skin' ? styles.tabTextActive : { color: theme.textMuted },
                  ]}
                >
                  🏹 Skins
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'effect' && styles.tabBtnActive]}
                onPress={() => handleTabChange('effect')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'effect' ? styles.tabTextActive : { color: theme.textMuted },
                  ]}
                >
                  💫 Effects
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'vip' && styles.tabBtnVipActive]}
                onPress={() => handleTabChange('vip')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'vip' ? styles.tabTextVipActive : { color: '#FDE047' },
                  ]}
                >
                  👑 VIP Vault
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Item List */}
            <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
              {activeTab === 'vip' ? (
                /* DEDICATED VIP COLLECTION SHOWCASE */
                <View style={styles.vipCollectionSection}>
                  <View style={styles.vipCollectionIntroCard}>
                    <Text style={styles.vipCollectionTitle}>👑 VIP COLLECTION VAULT</Text>
                    <Text style={styles.vipCollectionSub}>
                      All premium cosmetics bundled together. Preview every item before purchasing!
                    </Text>
                  </View>

                  {/* VIP Themes */}
                  <Text style={[styles.vipGroupHeader, { color: theme.textPrimary }]}>
                    🎨 Premium Board Themes ({vipCatalog.themes.length})
                  </Text>
                  {vipCatalog.themes.map(item => renderCosmeticCard(item))}

                  {/* VIP Arrow Skins */}
                  <Text
                    style={[styles.vipGroupHeader, { color: theme.textPrimary, marginTop: 14 }]}
                  >
                    🏹 Premium Arrow Skins ({vipCatalog.skins.length})
                  </Text>
                  {vipCatalog.skins.map(item => renderCosmeticCard(item))}

                  {/* VIP Escape Effects */}
                  <Text
                    style={[styles.vipGroupHeader, { color: theme.textPrimary, marginTop: 14 }]}
                  >
                    💫 Premium Escape Effects ({vipCatalog.effects.length})
                  </Text>
                  {vipCatalog.effects.map(item => renderCosmeticCard(item))}
                </View>
              ) : (
                /* STANDARD TAB ITEMS */
                currentItems.map(item => renderCosmeticCard(item))
              )}

              {/* VIP Vault Purchase Banner */}
              <View style={[styles.vipBanner, { borderColor: theme.accent }]}>
                <View style={styles.vipLeft}>
                  <Text style={styles.vipCrown}>👑</Text>
                  <View style={styles.vipTextCol}>
                    <Text style={styles.vipTitle}>VIP Collection Pass</Text>
                    <Text style={styles.vipDesc}>
                      Instant lifetime access: 6 Premium Themes, 5 Skins, 4 Effects & all future
                      cosmetics!
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: 520,
    height: '94%',
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
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  previewStageCard: {
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  previewStageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewStageLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
  },
  stageVipBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageVipBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F172A',
  },
  stageFreeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageFreeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stageMilestoneBadge: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageMilestoneBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F172A',
  },
  stageActivePill: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderWidth: 1,
    borderColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stageActiveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4ADE80',
  },
  stageEquipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageEquipBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  stageVipUnlockBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageVipUnlockBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
  },
  previewCanvasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniBoardTile: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  miniArrowToken: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniArrowGlyph: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  miniFxBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    fontSize: 14,
  },
  previewStageInfoCol: {
    flex: 1,
  },
  previewStageTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  previewStageDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  previewStageLockNote: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F87171',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 14,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#38BDF8',
  },
  tabBtnVipActive: {
    backgroundColor: '#F59E0B',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  tabTextVipActive: {
    color: '#0F172A',
  },
  scrollList: {
    flex: 1,
    marginTop: 6,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 10,
    gap: 10,
  },
  itemCardPreviewed: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  cardLeftCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  itemIcon: {
    fontSize: 20,
  },
  lightBadge: {
    marginTop: 3,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  lightBadgeText: {
    fontSize: 7,
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
    fontSize: 13,
    fontWeight: '800',
  },
  equippedPill: {
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  equippedPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000',
  },
  vipTagPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  vipTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FDE047',
  },
  freeTagPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  freeTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#4ADE80',
  },
  milestoneTagPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  milestoneTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#38BDF8',
  },
  itemDesc: {
    fontSize: 10,
    marginTop: 2,
    lineHeight: 13,
  },
  requirementText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F87171',
    marginTop: 3,
  },
  unlockedHintText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  cardActionCol: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionBtn: {
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 11,
    minWidth: 64,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionBtnEquipped: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  actionBtnEquippedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ADE80',
  },
  previewLockedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  previewLockedBtnActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  previewLockedBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE047',
  },
  vipCollectionSection: {
    gap: 8,
  },
  vipCollectionIntroCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 4,
  },
  vipCollectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FDE047',
  },
  vipCollectionSub: {
    fontSize: 10,
    color: '#FEF08A',
    marginTop: 2,
    lineHeight: 14,
  },
  vipGroupHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  vipBanner: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    padding: 12,
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
    fontSize: 26,
  },
  vipTextCol: {
    flex: 1,
  },
  vipTitle: {
    fontSize: 13,
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
    borderRadius: 11,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  vipBuyBtnText: {
    fontSize: 11,
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
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
