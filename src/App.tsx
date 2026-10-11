/**
 * Arrow Escape — Root Application Component
 * Seamless screen router between HomeScreen and GameScreen,
 * with Global Theme State, Hardware Back Button handling,
 * Splash Screen, and First-Time Permissions Onboarding.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ReplayGameMode, QuickEscapeDifficulty } from './services/modes/gameModesService';
import { THEMES, ColorTheme, defaultTheme } from './theme/colors';
import { getUserProgress, saveUserProgress } from './services/storage/progressStorage';
import { SplashScreen } from './components/common/SplashScreen';
import { PermissionsSetupModal } from './components/common/PermissionsSetupModal';
import { backButtonManager } from './services/navigation/backButtonHandler';
import { audioService } from './services/audio/audioService';
import { hapticsService } from './services/haptics/hapticsService';

const PERMISSIONS_SETUP_KEY = 'arrow_escape_permissions_setup_completed_v1';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [isDailyChallenge, setIsDailyChallenge] = useState<boolean>(false);
  const [dailyDateStr, setDailyDateStr] = useState<string | undefined>(undefined);
  const [activeGameMode, setActiveGameMode] = useState<ReplayGameMode>('CAMPAIGN');
  const [activeQuickDifficulty, setActiveQuickDifficulty] = useState<QuickEscapeDifficulty>('NORMAL');

  // Global Theme State
  const initialProg = getUserProgress();
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>(initialProg.selectedTheme || 'dawn');
  const theme: ColorTheme = THEMES[selectedThemeKey] || defaultTheme;

  // Splash & Onboarding State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);

  // Back Button Double-Tap Exit Toast
  const [showExitToast, setShowExitToast] = useState<boolean>(false);

  useEffect(() => {
    // Check if first-launch onboarding completed
    const onboardingDone = localStorage.getItem(PERMISSIONS_SETUP_KEY);
    if (!onboardingDone) {
      // Show onboarding modal after splash screen
      const timer = setTimeout(() => {
        setShowPermissionsModal(true);
      }, 1650);
      return () => clearTimeout(timer);
    }
  }, []);

  // Hardware Back Button Warning Listener
  useEffect(() => {
    const unregister = backButtonManager.registerWarningCallback(() => {
      setShowExitToast(true);
      hapticsService.vibrateLight();
      setTimeout(() => {
        setShowExitToast(false);
      }, 2000);
    });
    return unregister;
  }, []);

  const handleSelectTheme = useCallback((themeKey: string) => {
    setSelectedThemeKey(themeKey);
    saveUserProgress({ selectedTheme: themeKey });
    audioService.playClick();
  }, []);

  const handleStartGame = useCallback(
    (
      levelId: number,
      isDaily?: boolean,
      dailyDate?: string,
      gameMode: ReplayGameMode = 'CAMPAIGN',
      quickDifficulty: QuickEscapeDifficulty = 'NORMAL'
    ) => {
      setActiveLevelId(levelId);
      setIsDailyChallenge(!!isDaily || gameMode === 'DAILY');
      setDailyDateStr(dailyDate);
      setActiveGameMode(gameMode);
      setActiveQuickDifficulty(quickDifficulty);
      setCurrentScreen('game');
    },
    []
  );

  const handleNavigateHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  const handlePermissionsComplete = useCallback(
    (settings: { soundEnabled: boolean; hapticsEnabled: boolean; notificationsEnabled: boolean }) => {
      audioService.setEnabled(settings.soundEnabled);
      hapticsService.setEnabled(settings.hapticsEnabled);
      saveUserProgress({
        soundEnabled: settings.soundEnabled,
        hapticsEnabled: settings.hapticsEnabled,
      });
      localStorage.setItem(PERMISSIONS_SETUP_KEY, 'true');
      setShowPermissionsModal(false);
      hapticsService.vibrateSuccess();
    },
    []
  );

  return (
    <View style={[styles.appContainer, { backgroundColor: theme.background }]}>
      {showSplash ? (
        <SplashScreen theme={theme} onFinish={() => setShowSplash(false)} />
      ) : currentScreen === 'home' ? (
        <HomeScreen
          theme={theme}
          selectedThemeKey={selectedThemeKey}
          onSelectTheme={handleSelectTheme}
          onStartGame={handleStartGame}
        />
      ) : (
        <GameScreen
          key={`${activeLevelId}_${activeGameMode}_${isDailyChallenge ? dailyDateStr : 'std'}`}
          initialLevelId={activeLevelId}
          isDailyChallenge={isDailyChallenge}
          dailyDateStr={dailyDateStr}
          gameMode={activeGameMode}
          quickDifficulty={activeQuickDifficulty}
          theme={theme}
          selectedThemeKey={selectedThemeKey}
          onSelectTheme={handleSelectTheme}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {/* First-Time Permissions & Preferences Setup Modal */}
      <PermissionsSetupModal
        visible={showPermissionsModal && !showSplash}
        theme={theme}
        initialSound={initialProg.soundEnabled ?? true}
        initialHaptics={initialProg.hapticsEnabled ?? true}
        onComplete={handlePermissionsComplete}
      />

      {/* Android Hardware Double-Back Exit Notification Toast */}
      {showExitToast && (
        <View style={styles.exitToastWrapper}>
          <View style={[styles.exitToast, { backgroundColor: theme.surfaceElevated || '#1E293B' }]}>
            <Text style={styles.exitToastText}>Press back again to exit 🏹</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  exitToastWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999999,
  },
  exitToast: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  exitToastText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
