/**
 * Arrow Escape — Google Play Games Achievements Modal
 * Displays player GamerTag, total XP, and unlocked/locked achievements.
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  PlayGamesAchievement,
  PlayGamesProfile,
  playGamesService,
} from '../../services/playgames/playGamesService';

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  visible,
  onClose,
}) => {
  const [profile, setProfile] = useState<PlayGamesProfile>(() =>
    playGamesService.getProfile()
  );
  const [achievements, setAchievements] = useState<readonly PlayGamesAchievement[]>(
    () => playGamesService.getAchievements()
  );

  useEffect(() => {
    if (visible) {
      setProfile(playGamesService.getProfile());
      setAchievements(playGamesService.getAchievements());
    }
  }, [visible]);

  if (!visible) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.googlePlayIcon}>🎮</Text>
            <View>
              <Text style={styles.title}>Play Games</Text>
              <Text style={styles.subtitle}>Achievements & XP</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Player Profile Bar */}
        <View style={styles.profileBar}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarIcon}>🏹</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.gamerTag}>{profile.displayName}</Text>
            <Text style={styles.profileStatus}>
              {profile.isSignedIn ? '● Connected to Google Play' : '○ Offline Mode'}
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpValue}>{profile.totalXp.toLocaleString()} XP</Text>
            <Text style={styles.unlockedSummary}>
              {unlockedCount}/{achievements.length} Unlocked
            </Text>
          </View>
        </View>

        {/* Achievements List */}
        <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
          {achievements.map(ach => {
            const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
            return (
              <View
                key={ach.id}
                style={[
                  styles.achievementItem,
                  ach.unlocked && styles.achievementItemUnlocked,
                ]}
              >
                <View style={styles.itemIconContainer}>
                  <Text style={styles.itemIcon}>{ach.icon}</Text>
                </View>

                <View style={styles.itemContent}>
                  <View style={styles.itemTopRow}>
                    <Text
                      style={[
                        styles.itemName,
                        ach.unlocked && styles.itemNameUnlocked,
                      ]}
                    >
                      {ach.name}
                    </Text>
                    <View style={styles.itemXpTag}>
                      <Text style={styles.itemXpText}>+{ach.xp} XP</Text>
                    </View>
                  </View>

                  <Text style={styles.itemDesc}>{ach.description}</Text>

                  {/* Progress bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${pct}%` },
                        ach.unlocked && styles.progressBarFillUnlocked,
                      ]}
                    />
                  </View>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.progressNum}>
                      {ach.progress} / {ach.maxProgress}
                    </Text>
                    <Text style={styles.progressStatus}>
                      {ach.unlocked ? '✓ Unlocked' : `${pct}%`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googlePlayIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarIcon: {
    fontSize: 20,
  },
  profileDetails: {
    flex: 1,
  },
  gamerTag: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  profileStatus: {
    fontSize: 10,
    color: '#34D399',
    marginTop: 2,
    fontWeight: '600',
  },
  xpBadge: {
    alignItems: 'flex-end',
  },
  xpValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FBBF24',
  },
  unlockedSummary: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  scrollList: {
    flexGrow: 0,
  },
  achievementItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  achievementItemUnlocked: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  itemIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  itemNameUnlocked: {
    color: '#93C5FD',
  },
  itemXpTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemXpText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FBBF24',
  },
  itemDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 3,
  },
  progressBarFillUnlocked: {
    backgroundColor: '#34D399',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressNum: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  progressStatus: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
