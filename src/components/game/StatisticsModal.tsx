/**
 * Arrow Escape — Player Statistics Dashboard Modal
 * Visualizes rank ladder, accuracy, clears, gameplay metrics, and world completions.
 */

import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorTheme } from '../../theme/colors';
import { PlayerStatsSummary } from '../../services/progression/progressionService';
import { WORLDS, calculateWorldProgress } from '../../data/worlds/worldData';
import { monetizationAnalytics } from '../../services/analytics/monetizationAnalytics';

interface StatisticsModalProps {
  visible: boolean;
  summary: PlayerStatsSummary;
  levelRecords: Record<number, { stars: number; bestMoves: number }>;
  unlockedLevel: number;
  theme: ColorTheme;
  onClose: () => void;
}

function formatPlayTime(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  visible,
  summary,
  levelRecords,
  unlockedLevel,
  theme,
  onClose,
}) => {
  if (!visible) return null;

  const { currentRank, nextRank, rankProgressPercent, xpInRank, xpRequiredForNext } = summary;
  const monetization = monetizationAnalytics.getMetricsSummary();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.surface, borderColor: theme.boardBorder },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.headerIcon}>📊</Text>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Statistics</Text>
                <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
                  Career Records & Player Rank
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { borderColor: theme.boardBorder }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Player Rank & XP Card */}
            <View style={[styles.rankCard, { borderColor: currentRank.badgeColor }]}>
              <View style={styles.rankTopRow}>
                <View style={[styles.rankIconCircle, { backgroundColor: currentRank.badgeColor + '22' }]}>
                  <Text style={styles.rankIcon}>{currentRank.icon}</Text>
                </View>
                <View style={styles.rankTextCol}>
                  <View style={styles.rankBadgeRow}>
                    <Text style={[styles.rankTitle, { color: currentRank.badgeColor }]}>
                      {currentRank.title}
                    </Text>
                    <View style={[styles.xpPill, { backgroundColor: theme.surfaceElevated }]}>
                      <Text style={[styles.xpPillText, { color: theme.accent }]}>
                        {summary.totalXp.toLocaleString()} XP
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.rankDesc, { color: theme.textSecondary }]}>
                    {currentRank.description}
                  </Text>
                </View>
              </View>

              {/* XP Progress Bar to Next Rank */}
              {nextRank ? (
                <View style={styles.xpBarWrapper}>
                  <View style={styles.xpLabelsRow}>
                    <Text style={[styles.xpProgressLabel, { color: theme.textSecondary }]}>
                      Next: {nextRank.icon} {nextRank.title}
                    </Text>
                    <Text style={[styles.xpNumbersLabel, { color: theme.textPrimary }]}>
                      {xpInRank.toLocaleString()} / {xpRequiredForNext.toLocaleString()} XP
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${rankProgressPercent}%`, backgroundColor: currentRank.badgeColor },
                      ]}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.maxRankBanner}>
                  <Text style={[styles.maxRankText, { color: '#F59E0B' }]}>
                    👑 MAXIMUM RANK ACHIEVED • ARROW LEGEND
                  </Text>
                </View>
              )}
            </View>

            {/* Core KPI Metrics Grid (2x2) */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.boardBorder }]}>
                <Text style={styles.kpiEmoji}>🎯</Text>
                <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
                  {summary.levelsCompleted} <Text style={styles.kpiTotal}>/ {summary.totalLevels}</Text>
                </Text>
                <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Levels Cleared</Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.boardBorder }]}>
                <Text style={styles.kpiEmoji}>★</Text>
                <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>
                  {summary.totalStars} <Text style={styles.kpiTotal}>/ {summary.maxStars}</Text>
                </Text>
                <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total Stars</Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.boardBorder }]}>
                <Text style={styles.kpiEmoji}>🌟</Text>
                <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
                  {summary.perfectClears}
                </Text>
                <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>3-Star Clears</Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.boardBorder }]}>
                <Text style={styles.kpiEmoji}>⚡</Text>
                <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
                  {summary.averageMovesPerLevel || '—'}
                </Text>
                <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Avg Moves / Lvl</Text>
              </View>
            </View>

            {/* Gameplay Stats Card */}
            <View style={[styles.detailSection, { backgroundColor: theme.surfaceElevated, borderColor: theme.boardBorder }]}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ACTIVITY & RECORDS</Text>
              
              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>🏹 Total Arrows Escaped</Text>
                <Text style={[styles.metricVal, { color: theme.textPrimary }]}>
                  {summary.totalArrowsEscaped.toLocaleString()}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>👆 Total Moves Made</Text>
                <Text style={[styles.metricVal, { color: theme.textPrimary }]}>
                  {summary.totalMovesMade.toLocaleString()}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>📅 Daily Challenges Solved</Text>
                <Text style={[styles.metricVal, { color: theme.textPrimary }]}>
                  {summary.dailyCompletedCount}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>🔥 Consecutive Streak</Text>
                <Text style={[styles.metricVal, { color: '#F97316' }]}>
                  {summary.currentStreak} Days (Best: {summary.longestStreak})
                </Text>
              </View>

              <View style={[styles.metricRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>⏱️ Estimated Play Time</Text>
                <Text style={[styles.metricVal, { color: theme.textPrimary }]}>
                  {formatPlayTime(summary.totalPlayTimeSeconds || summary.levelsCompleted * 45)}
                </Text>
              </View>
            </View>

            {/* World Packs Progress Summary */}
            <View style={styles.worldsSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                THEMED WORLDS ({summary.worldsCompletedCount} / 6 CLEARED)
              </Text>

              {WORLDS.map(w => {
                const wp = calculateWorldProgress(w, unlockedLevel, levelRecords);
                return (
                  <View
                    key={w.id}
                    style={[
                      styles.worldRowCard,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: wp.isCompleted ? w.accentColor : theme.boardBorder,
                      },
                    ]}
                  >
                    <View style={styles.worldCardHeader}>
                      <View style={styles.worldNameCol}>
                        <Text style={styles.worldIcon}>{w.icon}</Text>
                        <View>
                          <Text style={[styles.worldName, { color: theme.textPrimary }]}>
                            {w.id}. {w.name}
                          </Text>
                          <Text style={[styles.worldSub, { color: theme.textSecondary }]}>
                            Levels {w.startLevel}–{w.endLevel} • {w.mechanicTag}
                          </Text>
                        </View>
                      </View>

                      {wp.isMastered ? (
                        <View style={[styles.worldBadgePill, { backgroundColor: '#10B98122', borderColor: '#10B981' }]}>
                          <Text style={styles.worldBadgeText}>🌟 MASTERED</Text>
                        </View>
                      ) : wp.isCompleted ? (
                        <View style={[styles.worldBadgePill, { backgroundColor: w.accentColor + '22', borderColor: w.accentColor }]}>
                          <Text style={[styles.worldBadgeText, { color: w.accentColor }]}>🏅 {w.badgeName}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.worldFraction, { color: theme.textSecondary }]}>
                          {wp.completedCount}/{wp.totalLevels}
                        </Text>
                      )}
                    </View>

                    {/* Progress Bar */}
                    <View style={[styles.worldTrack, { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
                      <View
                        style={[
                          styles.worldFill,
                          {
                            width: `${wp.percentComplete}%`,
                            backgroundColor: wp.isCompleted ? '#10B981' : w.accentColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Monetization & Rewarded Ad Metrics */}
            <View
              style={[
                styles.detailSection,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.boardBorder,
                  marginTop: 8,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                MONETIZATION & REWARDED ADS
              </Text>

              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>
                  🎬 Rewarded Ads Completed
                </Text>
                <Text style={[styles.metricVal, { color: theme.accent }]}>
                  {monetization.rewardedAdsCompleted} / {monetization.rewardedAdsOffered}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>
                  📊 Avg Rewarded / Active Player
                </Text>
                <Text style={[styles.metricVal, { color: theme.textPrimary }]}>
                  {monetization.avgRewardedPerActivePlayer}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>
                  💎 Remove Ads Conversion
                </Text>
                <Text style={[styles.metricVal, { color: '#38BDF8' }]}>
                  {monetization.removeAdsConversionPercent}% ({monetization.removeAdsPurchased}/{monetization.removeAdsOffered})
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>
                  👑 VIP Pass Conversion
                </Text>
                <Text style={[styles.metricVal, { color: '#F59E0B' }]}>
                  {monetization.vipPassConversionPercent}% ({monetization.vipPassPurchased}/{monetization.vipPassOffered})
                </Text>
              </View>

              <View style={[styles.metricRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.metricName, { color: theme.textPrimary }]}>
                  💵 Estimated ARPDAU
                </Text>
                <Text style={[styles.metricVal, { color: '#10B981' }]}>
                  ${monetization.arpdau.toFixed(3)} (${monetization.totalRevenueUsd.toFixed(2)} rev)
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 22, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 26,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  rankCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    marginBottom: 16,
  },
  rankTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rankIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 26,
  },
  rankTextCol: {
    flex: 1,
  },
  rankBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  xpPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  rankDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  xpBarWrapper: {
    marginTop: 14,
  },
  xpLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  xpNumbersLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  maxRankBanner: {
    marginTop: 12,
    alignItems: 'center',
  },
  maxRankText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  kpiEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  kpiTotal: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  detailSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricName: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  worldsSection: {
    marginBottom: 8,
  },
  worldRowCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  worldCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  worldNameCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  worldIcon: {
    fontSize: 22,
  },
  worldName: {
    fontSize: 14,
    fontWeight: '700',
  },
  worldSub: {
    fontSize: 11,
  },
  worldBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  worldBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  worldFraction: {
    fontSize: 12,
    fontWeight: '700',
  },
  worldTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  worldFill: {
    height: '100%',
    borderRadius: 3,
  },
});
