/**
 * Arrow Escape — Past Daily Challenges Calendar Modal
 * Lets players review previous calendar days and unlock missed daily puzzles by watching a rewarded ad.
 */

import React, { useState, useEffect } from 'react';
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
  dailyChallengeService,
  getLocalDateString,
  getPuzzleNumberFromDate,
  DailyChallengeState,
} from '../../services/daily/dailyChallengeService';
import { admobService } from '../../services/ads/admobService';
import { audioService } from '../../services/audio/audioService';
import { hapticsService } from '../../services/haptics/hapticsService';
import { monetizationAnalytics } from '../../services/analytics/monetizationAnalytics';

interface PastDailiesModalProps {
  visible: boolean;
  theme: ColorTheme;
  onPlayDate: (dateStr: string) => void;
  onClose: () => void;
}

export const PastDailiesModal: React.FC<PastDailiesModalProps> = ({
  visible,
  theme,
  onPlayDate,
  onClose,
}) => {
  const [dailyState, setDailyState] = useState<DailyChallengeState>(() =>
    dailyChallengeService.getState()
  );
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  useEffect(() => {
    if (visible) {
      setDailyState(dailyChallengeService.getState());
    }
  }, [visible]);

  if (!visible) return null;

  // Generate list of the past 14 days
  const todayStr = getLocalDateString();
  const pastDays: string[] = [];
  const baseDate = new Date();

  for (let i = 0; i <= 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    pastDays.push(getLocalDateString(d));
  }

  const handleUnlockAndPlay = async (dateStr: string) => {
    audioService.playClick();
    hapticsService.vibrateLight();

    const isToday = dateStr === todayStr;
    const isUnlocked = dailyChallengeService.isDateUnlocked(dateStr);

    if (isToday || isUnlocked) {
      onClose();
      onPlayDate(dateStr);
      return;
    }

    // Require rewarded ad to unlock past missed day
    monetizationAnalytics.trackAdOffered('past_daily');
    setIsWatchingAd(true);
    const reward = await admobService.showRewardedAd();
    setIsWatchingAd(false);

    if (reward) {
      monetizationAnalytics.trackAdCompleted('past_daily');
      dailyChallengeService.unlockPastDailyLevel(dateStr);
      setDailyState(dailyChallengeService.getState());
      audioService.playVictoryFanfare();
      hapticsService.vibrateSuccess();
      onClose();
      onPlayDate(dateStr);
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
                <Text style={styles.headerIcon}>📅</Text>
                <View>
                  <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Daily Calendar</Text>
                  <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                    Play past daily puzzles • Watch ad to unlock missed days
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

            {/* Calendar Days List */}
            <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
              {pastDays.map(dateStr => {
                const isToday = dateStr === todayStr;
                const record = dailyState.records[dateStr];
                const isCompleted = !!record?.completed;
                const isUnlocked = isToday || isCompleted || dailyState.unlockedPastDates.includes(dateStr);
                const puzzleNum = getPuzzleNumberFromDate(dateStr);

                return (
                  <View
                    key={dateStr}
                    style={[
                      styles.dayCard,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: isToday ? '#F59E0B' : isCompleted ? '#10B981' : theme.boardBorder,
                      },
                    ]}
                  >
                    <View style={styles.dayInfoCol}>
                      <View style={styles.dayBadgeRow}>
                        <Text style={styles.puzzleNumText}>Puzzle #{puzzleNum}</Text>
                        {isToday && (
                          <View style={styles.todayPill}>
                            <Text style={styles.todayPillText}>TODAY</Text>
                          </View>
                        )}
                        {isCompleted && (
                          <View style={styles.solvedPill}>
                            <Text style={styles.solvedPillText}>SOLVED ★ {record?.stars}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.dateText, { color: theme.textPrimary }]}>
                        {new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.playBtn,
                        {
                          backgroundColor: isCompleted
                            ? '#10B981'
                            : isToday
                            ? '#F59E0B'
                            : isUnlocked
                            ? '#38BDF8'
                            : '#8B5CF6',
                        },
                      ]}
                      onPress={() => handleUnlockAndPlay(dateStr)}
                      activeOpacity={0.85}
                      disabled={isWatchingAd}
                    >
                      <Text style={styles.playBtnText}>
                        {isCompleted
                          ? 'REPLAY'
                          : isToday
                          ? 'PLAY'
                          : isUnlocked
                          ? 'PLAY'
                          : '🎬 WATCH AD'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
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
    maxWidth: 500,
    height: '88%',
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
    gap: 10,
  },
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  dayInfoCol: {
    flex: 1,
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  puzzleNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  todayPill: {
    backgroundColor: '#F59E0B22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  todayPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
  },
  solvedPill: {
    backgroundColor: '#10B98122',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  solvedPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#10B981',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
  },
  playBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 96,
  },
  playBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
