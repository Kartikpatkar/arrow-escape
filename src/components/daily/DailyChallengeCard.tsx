/**
 * Arrow Escape — Daily Challenge Card Component
 * Prominently displays today's puzzle, streak counter, rewards, and play action on HomeScreen.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  dailyChallengeService,
  DailyChallengeState,
  getLocalDateString,
  getPuzzleNumberFromDate,
  STREAK_MILESTONES,
} from '../../services/daily/dailyChallengeService';
import { notificationService } from '../../services/notifications/notificationService';

interface DailyChallengeCardProps {
  onPlayDaily: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  onPlayDaily,
}) => {
  const [dailyState, setDailyState] = useState<DailyChallengeState>(() =>
    dailyChallengeService.getState()
  );
  const [notifScheduled, setNotifScheduled] = useState<boolean>(false);

  useEffect(() => {
    setDailyState(dailyChallengeService.getState());
  }, []);

  const todayStr = getLocalDateString();
  const puzzleNumber = getPuzzleNumberFromDate(todayStr);
  const todayRecord = dailyState.records[todayStr];
  const isCompleted = !!todayRecord?.completed;

  // Next milestone preview
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > dailyState.currentStreak) ||
    STREAK_MILESTONES[STREAK_MILESTONES.length - 1];

  const handleToggleNotification = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setNotifScheduled(true);
      setTimeout(() => setNotifScheduled(false), 2500);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.headerTitle}>DAILY CHALLENGE</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.fireIcon}>🔥</Text>
          <Text style={styles.streakText}>
            {dailyState.currentStreak > 0
              ? `${dailyState.currentStreak} Day Streak`
              : 'Streak Ready'}
          </Text>
        </View>
      </View>

      {/* Main Puzzle Info & Action */}
      <View style={styles.contentRow}>
        <View style={styles.infoCol}>
          <Text style={styles.puzzleTitle}>Daily Puzzle #{puzzleNumber}</Text>
          <Text style={styles.puzzleDate}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>

          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>
                ✓ Solved ({todayRecord.stars} ★ • {todayRecord.moves} moves)
              </Text>
            </View>
          ) : (
            <Text style={styles.rewardText}>Reward: +100 Bonus XP & Streak</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.actionButton, isCompleted && styles.actionButtonCompleted]}
          onPress={onPlayDaily}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            {isCompleted ? 'Replay' : 'PLAY'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer: Milestone & Notification Trigger */}
      <View style={styles.footerRow}>
        <Text style={styles.milestoneText}>
          Next goal: {nextMilestone.icon} {nextMilestone.days} days ({nextMilestone.rewardText})
        </Text>

        <TouchableOpacity
          onPress={handleToggleNotification}
          style={styles.notifButton}
          activeOpacity={0.7}
        >
          <Text style={styles.notifIcon}>
            {notifScheduled ? '✓ Reminded' : '🔔 Remind'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    padding: 14,
    marginVertical: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    gap: 4,
  },
  fireIcon: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F87171',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoCol: {
    flex: 1,
    paddingRight: 10,
  },
  puzzleTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  puzzleDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  completedText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  rewardText: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 4,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  actionButtonCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
  },
  actionButtonText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    marginTop: 8,
  },
  milestoneText: {
    fontSize: 10,
    color: '#94A3B8',
    flex: 1,
  },
  notifButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  notifIcon: {
    fontSize: 10,
    color: '#60A5FA',
    fontWeight: '700',
  },
});
