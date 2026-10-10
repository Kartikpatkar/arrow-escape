/**
 * Arrow Escape — Home Screen
 * Central hub for Play/Continue, Level Select, Google Play Achievements, Settings,
 * Save Progress & Cloud Sync, and bottom Banner Ad.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
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
import { playGamesService } from '../services/playgames/playGamesService';
import { billingService } from '../services/billing/billingService';
import { admobService } from '../services/ads/admobService';
import { LevelSelectModal } from '../components/game/LevelSelectModal';
import { AchievementsModal } from '../components/game/AchievementsModal';
import { SettingsModal } from '../components/game/SettingsModal';
import { BannerAd } from '../components/ads/BannerAd';

interface HomeScreenProps {
  onStartGame: (levelId: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('dawn');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('All Progress Saved (Cloud & Local)');

  // Modals
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load Persisted Data
  const refreshProgress = useCallback(async () => {
    const saved = await loadUserProgress();
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

  const handleManualSave = useCallback(() => {
    audioService.playClick();
    hapticsService.vibrateLight();
    saveUserProgress({});
    setSyncStatusText(`Saved at ${new Date().toLocaleTimeString()} ✓`);
    setTimeout(() => {
      setSyncStatusText('All Progress Saved (Cloud & Local)');
    }, 3000);
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
  }, []);

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      <View style={styles.mainContent}>
        {/* Top Branding / Logo */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🏹</Text>
          </View>
          <Text style={styles.gameTitle}>ARROW ESCAPE</Text>
          <Text style={styles.gameSubtitle}>Casual Logic & Maze Puzzle</Text>
        </View>

        {/* Player Stats Mini-HUD */}
        <View style={styles.hudCard}>
          <View style={styles.hudStat}>
            <Text style={styles.hudValue}>{unlockedLevel}</Text>
            <Text style={styles.hudLabel}>Current Level</Text>
          </View>
          <View style={styles.hudDivider} />
          <View style={styles.hudStat}>
            <Text style={styles.hudValue}>★ {totalEarnedStars}</Text>
            <Text style={styles.hudLabel}>Total Stars</Text>
          </View>
          <View style={styles.hudDivider} />
          <View style={styles.hudStat}>
            <Text style={styles.hudValue}>{TOTAL_LEVELS}</Text>
            <Text style={styles.hudLabel}>Max Levels</Text>
          </View>
        </View>

        {/* Main Action Menu */}
        <View style={styles.menuContainer}>
          {/* Continue / Play Primary CTA */}
          <TouchableOpacity
            style={styles.primaryPlayButton}
            onPress={() => {
              audioService.playClick();
              onStartGame(unlockedLevel);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.playIconText}>▶</Text>
            <View>
              <Text style={styles.primaryPlayTitle}>
                {unlockedLevel > 1 ? `CONTINUE LEVEL ${unlockedLevel}` : 'START GAME'}
              </Text>
              <Text style={styles.primaryPlaySubtitle}>
                {unlockedLevel > 1
                  ? `${TOTAL_LEVELS - unlockedLevel + 1} puzzles remaining`
                  : 'Tap to begin puzzle journey'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Select Level Secondary CTA */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              audioService.playClick();
              setIsLevelSelectOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.menuButtonIcon}>🗺️</Text>
            <View style={styles.menuButtonTextCol}>
              <Text style={styles.menuButtonTitle}>Select Level</Text>
              <Text style={styles.menuButtonSubtitle}>Browse 1 to {TOTAL_LEVELS} Puzzles</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* Google Play Achievements */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              audioService.playClick();
              setIsAchievementsOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.menuButtonIcon}>🎮</Text>
            <View style={styles.menuButtonTextCol}>
              <Text style={styles.menuButtonTitle}>Play Achievements</Text>
              <Text style={styles.menuButtonSubtitle}>Google Play XP & Rewards</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              audioService.playClick();
              setIsSettingsOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.menuButtonIcon}>⚙️</Text>
            <View style={styles.menuButtonTextCol}>
              <Text style={styles.menuButtonTitle}>Settings</Text>
              <Text style={styles.menuButtonSubtitle}>Audio, Themes & Haptics</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Save Process & Cloud Sync Section */}
        <View style={styles.cloudSaveCard}>
          <View style={styles.cloudSaveInfo}>
            <Text style={styles.cloudIcon}>☁️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cloudTitle}>Save Progress</Text>
              <Text style={styles.cloudStatus}>{syncStatusText}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleManualSave}
            activeOpacity={0.7}
          >
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 2,
    borderColor: '#818CF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  logoIcon: {
    fontSize: 34,
  },
  gameTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  hudStat: {
    flex: 1,
    alignItems: 'center',
  },
  hudValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  hudLabel: {
    fontSize: 10,
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
  menuContainer: {
    width: '100%',
    gap: 10,
  },
  primaryPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#34D399',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  playIconText: {
    fontSize: 26,
    color: '#FFFFFF',
    marginRight: 14,
  },
  primaryPlayTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  primaryPlaySubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
    fontWeight: '600',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  menuButtonIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuButtonTextCol: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  menuButtonSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  menuChevron: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
  },
  cloudSaveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  cloudSaveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cloudIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cloudTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  cloudStatus: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 1,
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  syncButtonText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '700',
  },
});
