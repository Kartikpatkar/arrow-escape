/**
 * Arrow Escape — Home Screen
 * Redesigned Modern Bento Grid Layout for streamlined mobile UX.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TOTAL_LEVELS } from '../data/levels';
import { THEMES, defaultTheme, ColorTheme } from '../theme/colors';
import {
  loadUserProgress,
  saveUserProgress,
  resetAllProgress,
} from '../services/storage/progressStorage';
import { audioService } from '../services/audio/audioService';
import { hapticsService } from '../services/haptics/hapticsService';
import { billingService } from '../services/billing/billingService';
import { admobService } from '../services/ads/admobService';
import { LevelSelectModal } from '../components/game/LevelSelectModal';
import { AchievementsModal } from '../components/game/AchievementsModal';
import { SettingsModal } from '../components/game/SettingsModal';
import { StatisticsModal } from '../components/game/StatisticsModal';
import { CosmeticsModal } from '../components/game/CosmeticsModal';
import { BannerAd } from '../components/ads/BannerAd';
import { DailyChallengeCard } from '../components/daily/DailyChallengeCard';
import { dailyChallengeService, getLocalDateString, DailyChallengeState } from '../services/daily/dailyChallengeService';
import { getPlayerStatsSummary, PlayerStatsSummary } from '../services/progression/progressionService';
import { UserProgressData, DEFAULT_PROGRESS, equipCosmetic } from '../services/storage/progressStorage';
import { CosmeticCategory } from '../services/cosmetics/cosmeticsCatalog';

interface HomeScreenProps {
  onStartGame: (levelId: number, isDaily?: boolean, dailyDate?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const [progressData, setProgressData] = useState<UserProgressData>(DEFAULT_PROGRESS);
  const [dailyState, setDailyState] = useState<DailyChallengeState | undefined>(undefined);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('dawn');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('All Synced ✓');

  // Modals
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);

  const handleEquipCosmetic = useCallback(async (category: CosmeticCategory, key: string) => {
    const updated = await equipCosmetic(category, key);
    setProgressData(updated);
    if (category === 'theme') {
      setSelectedThemeKey(key);
    }
  }, []);

  // Load Persisted Data
  const refreshProgress = useCallback(async () => {
    const saved = await loadUserProgress();
    setProgressData(saved);
    const dState = await dailyChallengeService.getState();
    setDailyState(dState);

    setUnlockedLevel(saved.unlockedLevel);
    setSelectedThemeKey(saved.selectedTheme);
    setSoundEnabled(saved.soundEnabled);
    setHapticsEnabled(saved.hapticsEnabled);
    setAdsRemoved(saved.adsRemoved);
    audioService.setEnabled(saved.soundEnabled);
    hapticsService.setEnabled(saved.hapticsEnabled);
    admobService.setAdsRemoved(saved.adsRemoved);

    const starsMap: Record<number, number> = {};
    Object.entries(saved.levelRecords).forEach(([lvlId, rec]) => {
      starsMap[Number(lvlId)] = rec.stars;
    });
    setLevelStars(starsMap);
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const theme: ColorTheme = THEMES[selectedThemeKey] || defaultTheme;

  const totalEarnedStars = useMemo(() => {
    return Object.values(levelStars).reduce((sum, s) => sum + s, 0);
  }, [levelStars]);

  const statsSummary: PlayerStatsSummary = useMemo(() => {
    return getPlayerStatsSummary(progressData, dailyState);
  }, [progressData, dailyState]);

  const handleManualSave = useCallback(() => {
    audioService.playClick();
    hapticsService.vibrateLight();
    saveUserProgress({});
    setSyncStatusText(`Saved ${new Date().toLocaleTimeString()} ✓`);
    setTimeout(() => {
      setSyncStatusText('All Synced ✓');
    }, 2500);
  }, []);

  // Settings Handlers
  const handleToggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    audioService.setEnabled(enabled);
    saveUserProgress({ soundEnabled: enabled });
  }, []);

  const handleToggleHaptics = useCallback((enabled: boolean) => {
    setHapticsEnabled(enabled);
    hapticsService.setEnabled(enabled);
    saveUserProgress({ hapticsEnabled: enabled });
  }, []);

  const handleSelectTheme = useCallback((themeKey: string) => {
    audioService.playClick();
    setSelectedThemeKey(themeKey);
    saveUserProgress({ selectedTheme: themeKey });
  }, []);

  const handlePurchaseRemoveAds = useCallback(async () => {
    const res = await billingService.purchaseRemoveAds();
    if (res.success) {
      setAdsRemoved(true);
      admobService.setAdsRemoved(true);
      audioService.playVictoryFanfare();
    }
  }, []);

  const handleRestorePurchases = useCallback(async () => {
    const res = await billingService.restorePurchases();
    if (res.restored) {
      setAdsRemoved(true);
      admobService.setAdsRemoved(true);
      audioService.playClick();
    }
  }, []);

  const handleResetProgress = useCallback(async () => {
    await resetAllProgress();
    setUnlockedLevel(1);
    setLevelStars({});
    setAdsRemoved(false);
    admobService.setAdsRemoved(false);
    refreshProgress();
  }, [refreshProgress]);

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Branding / Logo */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🏹</Text>
          </View>
          <Text style={styles.gameTitle}>ARROW ESCAPE</Text>
          <Text style={styles.gameSubtitle}>Casual Logic & Maze Puzzle</Text>
        </View>

        {/* Player Stats Mini-HUD with Rank */}
        <View style={styles.hudCard}>
          <TouchableOpacity
            style={styles.hudStat}
            onPress={() => {
              audioService.playClick();
              setIsStatisticsOpen(true);
            }}
            activeOpacity={0.75}
          >
            <Text style={[styles.hudValue, { color: statsSummary.currentRank.badgeColor }]}>
              {statsSummary.currentRank.icon} {statsSummary.currentRank.title}
            </Text>
            <Text style={styles.hudLabel}>{statsSummary.totalXp.toLocaleString()} XP • Stats ↗</Text>
          </TouchableOpacity>
          <View style={styles.hudDivider} />
          <View style={styles.hudStat}>
            <Text style={styles.hudValue}>
              {statsSummary.levelsCompleted} <Text style={{ fontSize: 13, color: '#94A3B8' }}>/ 500</Text>
            </Text>
            <Text style={styles.hudLabel}>Cleared</Text>
          </View>
          <View style={styles.hudDivider} />
          <View style={styles.hudStat}>
            <Text style={[styles.hudValue, { color: '#F59E0B' }]}>★ {totalEarnedStars}</Text>
            <Text style={styles.hudLabel}>Total Stars</Text>
          </View>
        </View>

        {/* Hero Primary Action (Full-Width Card) */}
        <TouchableOpacity
          style={styles.heroPlayCard}
          onPress={() => {
            audioService.playClick();
            onStartGame(unlockedLevel);
          }}
          activeOpacity={0.88}
        >
          <View style={styles.heroPlayIconWrapper}>
            <Text style={styles.heroPlayIcon}>▶</Text>
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroPlayTitle}>
              {unlockedLevel > 1 ? `CONTINUE LEVEL ${unlockedLevel}` : 'START GAME'}
            </Text>
            <Text style={styles.heroPlaySubtitle}>
              {unlockedLevel > 1
                ? `${TOTAL_LEVELS - unlockedLevel + 1} puzzles remaining • Tap to play`
                : 'Tap to begin spatial puzzle journey'}
            </Text>
          </View>
          <Text style={styles.heroArrowGlyph}>→</Text>
        </TouchableOpacity>

        {/* Daily Challenge Card */}
        <DailyChallengeCard
          onPlayDaily={() => {
            audioService.playClick();
            onStartGame(9999, true, getLocalDateString());
          }}
        />

        {/* Bento Tiles Grid */}
        <View style={styles.bentoGrid}>
          {/* Tile 1: Level Packs */}
          <TouchableOpacity
            style={styles.bentoTile}
            onPress={() => {
              audioService.playClick();
              setIsLevelSelectOpen(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={styles.tileIcon}>🗺️</Text>
            </View>
            <Text style={styles.tileTitle}>Level Packs</Text>
            <Text style={styles.tileSubtitle}>6 Worlds • 500 Puzzles</Text>
          </TouchableOpacity>

          {/* Tile 2: Visual Vault & Wardrobe */}
          <TouchableOpacity
            style={styles.bentoTile}
            onPress={() => {
              audioService.playClick();
              setIsCosmeticsOpen(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.2)' }]}>
              <Text style={styles.tileIcon}>✨</Text>
            </View>
            <Text style={styles.tileTitle}>Visual Vault</Text>
            <Text style={styles.tileSubtitle}>Skins, Themes & FX</Text>
          </TouchableOpacity>

          {/* Tile 3: Statistics Dashboard */}
          <TouchableOpacity
            style={styles.bentoTile}
            onPress={() => {
              audioService.playClick();
              setIsStatisticsOpen(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Text style={styles.tileIcon}>📊</Text>
            </View>
            <Text style={styles.tileTitle}>Statistics</Text>
            <Text style={styles.tileSubtitle}>KPIs & Career Records</Text>
          </TouchableOpacity>

          {/* Tile 4: Play Games Achievements */}
          <TouchableOpacity
            style={styles.bentoTile}
            onPress={() => {
              audioService.playClick();
              setIsAchievementsOpen(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
              <Text style={styles.tileIcon}>🎮</Text>
            </View>
            <Text style={styles.tileTitle}>Achievements</Text>
            <Text style={styles.tileSubtitle}>Google Play XP Badges</Text>
          </TouchableOpacity>

          {/* Tile 5: Settings */}
          <TouchableOpacity
            style={styles.bentoTile}
            onPress={() => {
              audioService.playClick();
              setIsSettingsOpen(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
              <Text style={styles.tileIcon}>⚙️</Text>
            </View>
            <Text style={styles.tileTitle}>Settings</Text>
            <Text style={styles.tileSubtitle}>Audio, Themes & Store</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Cloud Save Bar */}
        <TouchableOpacity
          style={styles.cloudSaveBar}
          onPress={handleManualSave}
          activeOpacity={0.8}
        >
          <Text style={styles.cloudSaveIcon}>☁️</Text>
          <Text style={styles.cloudSaveText}>
            Cloud Sync Status: <Text style={styles.cloudSaveStatus}>{syncStatusText}</Text>
          </Text>
          <Text style={styles.cloudSaveAction}>Save Now</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Banner Ad */}
      <BannerAd
        adsRemoved={adsRemoved}
        onRemoveAdsPress={() => setIsSettingsOpen(true)}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        visible={isLevelSelectOpen}
        currentLevelId={unlockedLevel}
        unlockedLevel={unlockedLevel}
        levelStars={levelStars}
        theme={theme}
        onSelectLevel={lvl => onStartGame(lvl)}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* Statistics Dashboard Modal */}
      <StatisticsModal
        visible={isStatisticsOpen}
        summary={statsSummary}
        levelRecords={progressData.levelRecords}
        unlockedLevel={unlockedLevel}
        theme={theme}
        onClose={() => setIsStatisticsOpen(false)}
      />

      {/* Google Play Achievements Modal */}
      <AchievementsModal
        visible={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsOpen}
        soundEnabled={soundEnabled}
        hapticsEnabled={hapticsEnabled}
        selectedThemeKey={selectedThemeKey}
        adsRemoved={adsRemoved}
        theme={theme}
        onOpenCosmetics={() => setIsCosmeticsOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleHaptics={handleToggleHaptics}
        onSelectTheme={handleSelectTheme}
        onPurchaseRemoveAds={handlePurchaseRemoveAds}
        onRestorePurchases={handleRestorePurchases}
        onResetProgress={handleResetProgress}
        onClose={() => {
          setIsSettingsOpen(false);
          refreshProgress();
        }}
      />

      {/* Cosmetics Wardrobe & Vault Modal */}
      <CosmeticsModal
        visible={isCosmeticsOpen}
        theme={theme}
        progress={progressData}
        dailyState={dailyState}
        onEquipCosmetic={handleEquipCosmetic}
        onPurchaseVipSuccess={refreshProgress}
        onClose={() => {
          setIsCosmeticsOpen(false);
          refreshProgress();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundImage:
      'radial-gradient(ellipse 90% 70% at 50% 25%, #183D5D 0%, #0C1E30 60%, #06101B 100%)' as any,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  logoBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 2,
    borderColor: '#818CF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  logoIcon: {
    fontSize: 30,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  hudCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  hudStat: {
    flex: 1,
    alignItems: 'center',
  },
  hudValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  hudDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'center',
  },
  heroPlayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 4,
  },
  heroPlayIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroPlayIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  heroTextCol: {
    flex: 1,
  },
  heroPlayTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroPlaySubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
    fontWeight: '600',
  },
  heroArrowGlyph: {
    fontSize: 20,
    color: '#A7F3D0',
    fontWeight: '900',
    marginLeft: 8,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
    justifyContent: 'space-between',
  },
  bentoTile: {
    width: '48.5%',
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 100,
    justifyContent: 'space-between',
  },
  tileIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileIcon: {
    fontSize: 18,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  tileSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  cloudSaveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    gap: 10,
  },
  cloudSaveIcon: {
    fontSize: 16,
  },
  cloudSaveText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cloudSaveStatus: {
    color: '#34D399',
    fontWeight: '700',
  },
  cloudSaveAction: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '800',
  },
});
