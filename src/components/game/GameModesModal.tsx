/**
 * Arrow Escape — Game Modes Hub Modal
 * Dedicated launcher for Daily Challenge, Quick Escape, Practice Sandbox, and Perfect Clear.
 */

import React, { useState } from 'react';
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
import { QuickEscapeDifficulty } from '../../services/modes/gameModesService';
import { audioService } from '../../services/audio/audioService';
import { hapticsService } from '../../services/haptics/hapticsService';

export interface GameModeLaunchConfig {
  mode: 'DAILY' | 'QUICK_ESCAPE' | 'PRACTICE' | 'PERFECT_CLEAR';
  quickDifficulty?: QuickEscapeDifficulty;
  practiceLevelId?: number;
  perfectClearLevelId?: number;
}

interface GameModesModalProps {
  visible: boolean;
  theme: ColorTheme;
  unlockedLevel: number;
  currentStreak: number;
  perfectClearsCount: number;
  quickEscapeWins: number;
  onLaunchMode: (config: GameModeLaunchConfig) => void;
  onClose: () => void;
}

export const GameModesModal: React.FC<GameModesModalProps> = ({
  visible,
  theme,
  unlockedLevel,
  currentStreak,
  perfectClearsCount,
  quickEscapeWins,
  onLaunchMode,
  onClose,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuickEscapeDifficulty>('NORMAL');
  const [practiceLevel, setPracticeLevel] = useState<number>(Math.max(1, unlockedLevel - 1));

  if (!visible) return null;

  const handleLaunch = (config: GameModeLaunchConfig) => {
    audioService.playClick();
    hapticsService.vibrateLight();
    onClose();
    onLaunchMode(config);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerIcon}>🎮</Text>
                <View>
                  <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Game Modes Hub</Text>
                  <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                    Endless Replay, Daily Challenges & Practice
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

            <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
              {/* Card 1: Daily Puzzle Challenge */}
              <View style={[styles.modeCard, { backgroundColor: theme.surfaceElevated, borderColor: '#F59E0B' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.cardBadge}>OFFLINE & CALENDAR-SEEDED</Text>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>📅 Daily Challenge</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillText}>🔥 {currentStreak}D Streak</Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  One specially generated puzzle per calendar day. Complete daily to earn bonus hints and climb the streak ladder.
                </Text>
                <TouchableOpacity
                  style={[styles.launchBtn, { backgroundColor: '#F59E0B' }]}
                  onPress={() => handleLaunch({ mode: 'DAILY' })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.launchBtnText}>PLAY TODAY'S PUZZLE ➔</Text>
                </TouchableOpacity>
              </View>

              {/* Card 2: Quick Escape (Endless Random Sessions) */}
              <View style={[styles.modeCard, { backgroundColor: theme.surfaceElevated, borderColor: '#38BDF8' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.cardBadge}>2–5 MINUTE SESSIONS</Text>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>⚡ Quick Escape (Endless)</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillText}>🏆 {quickEscapeWins} Solved</Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Instantly generated random puzzles verified 100% solvable and fair. Pick a difficulty and jump right in.
                </Text>

                {/* Difficulty Selector */}
                <View style={styles.diffSelectorRow}>
                  {(['QUICK', 'NORMAL', 'EXPERT'] as QuickEscapeDifficulty[]).map(diff => (
                    <TouchableOpacity
                      key={diff}
                      style={[
                        styles.diffPill,
                        selectedDifficulty === diff && { backgroundColor: theme.accent },
                      ]}
                      onPress={() => {
                        audioService.playClick();
                        setSelectedDifficulty(diff);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.diffPillText,
                          selectedDifficulty === diff ? { color: '#0F172A', fontWeight: '900' } : { color: theme.textSecondary },
                        ]}
                      >
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.launchBtn, { backgroundColor: '#38BDF8' }]}
                  onPress={() => handleLaunch({ mode: 'QUICK_ESCAPE', quickDifficulty: selectedDifficulty })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.launchBtnText}>START QUICK ESCAPE ➔</Text>
                </TouchableOpacity>
              </View>

              {/* Card 3: Practice Sandbox Mode */}
              <View style={[styles.modeCard, { backgroundColor: theme.surfaceElevated, borderColor: '#10B981' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.cardBadge}>RISK-FREE EXPERIMENTATION</Text>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>🔬 Practice Sandbox</Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Replay any unlocked level risk-free. Experiment with move sequences and mechanics without altering career records.
                </Text>

                {/* Level Stepper */}
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={() => setPracticeLevel(Math.max(1, practiceLevel - 1))}
                  >
                    <Text style={[styles.stepperBtnText, { color: theme.textPrimary }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.stepperValueText, { color: theme.accent }]}>Level {practiceLevel}</Text>
                  <TouchableOpacity
                    style={[styles.stepperBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={() => setPracticeLevel(Math.min(unlockedLevel, practiceLevel + 1))}
                  >
                    <Text style={[styles.stepperBtnText, { color: theme.textPrimary }]}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.launchBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => handleLaunch({ mode: 'PRACTICE', practiceLevelId: practiceLevel })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.launchBtnText}>START PRACTICE RUN ➔</Text>
                </TouchableOpacity>
              </View>

              {/* Card 4: Perfect Clear Challenge */}
              <View style={[styles.modeCard, { backgroundColor: theme.surfaceElevated, borderColor: '#EC4899' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardTitleCol}>
                    <Text style={styles.cardBadge}>STRICT MOVE BUDGET</Text>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>🎯 Perfect Clear Challenge</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillText}>🏅 {perfectClearsCount} Badges</Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Solve the level within an exact move budget calculated by the solver. Earn exclusive Perfect Clear badges!
                </Text>
                <TouchableOpacity
                  style={[styles.launchBtn, { backgroundColor: '#EC4899' }]}
                  onPress={() => handleLaunch({ mode: 'PERFECT_CLEAR', perfectClearLevelId: unlockedLevel })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.launchBtnText}>ATTEMPT PERFECT CLEAR ➔</Text>
                </TouchableOpacity>
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
  scrollList: {
    flex: 1,
    marginTop: 6,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    gap: 12,
  },
  modeCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardBadge: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#94A3B8',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  statPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  diffSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  diffPill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  diffPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '900',
  },
  stepperValueText: {
    fontSize: 14,
    fontWeight: '800',
  },
  launchBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  launchBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
