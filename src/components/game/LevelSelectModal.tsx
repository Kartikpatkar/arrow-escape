/**
 * Arrow Escape — LevelSelectModal Component
 * Themed Worlds (Level Packs) navigator with 6 themed chapters,
 * world completion badges, star targets, and level grids.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorTheme } from '../../theme/colors';
import { WORLDS, getWorldForLevel, calculateWorldProgress, WorldDef } from '../../data/worlds/worldData';
import { BannerAd } from '../ads/BannerAd';

interface LevelSelectModalProps {
  visible: boolean;
  currentLevelId: number;
  unlockedLevel: number;
  levelStars: Record<number, number>;
  theme: ColorTheme;
  adsRemoved?: boolean;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  visible,
  currentLevelId,
  unlockedLevel,
  levelStars,
  theme,
  adsRemoved = false,
  onSelectLevel,
  onClose,
}) => {
  const initialWorld = getWorldForLevel(currentLevelId);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorld.id);

  if (!visible) return null;

  const activeWorld = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];

  const levelsInWorld: number[] = [];
  for (let lvl = activeWorld.startLevel; lvl <= activeWorld.endLevel; lvl++) {
    levelsInWorld.push(lvl);
  }

  // World progress
  const worldProgress = calculateWorldProgress(
    activeWorld,
    unlockedLevel,
    levelStars as any
  );

  return (
    <View style={styles.backdrop}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.surface, borderColor: theme.boardBorder },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Level Packs</Text>
            <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
              6 Themed Worlds • 500 Puzzles
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { borderColor: theme.boardBorder }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Themed Worlds Tab Selector */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {WORLDS.map(w => {
              const isActive = w.id === selectedWorldId;
              const isWorldUnlocked = w.startLevel <= unlockedLevel;
              const wp = calculateWorldProgress(w, unlockedLevel, levelStars as any);

              return (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setSelectedWorldId(w.id)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: isActive
                        ? theme.accent
                        : isWorldUnlocked
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(255, 255, 255, 0.02)',
                      borderColor: isActive ? theme.accent : theme.boardBorder,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tabIcon}>{w.icon}</Text>
                  <Text
                    style={[
                      styles.tabPillText,
                      {
                        color: isActive
                          ? '#0F172A'
                          : isWorldUnlocked
                          ? theme.textPrimary
                          : theme.textMuted,
                        fontWeight: isActive ? '800' : '600',
                      },
                    ]}
                  >
                    {w.name}
                  </Text>
                  {wp.isCompleted && (
                    <Text style={styles.tabBadgeCheck}>{wp.isMastered ? '🌟' : '✓'}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Active World Banner / Progress Card */}
        <View style={[styles.worldHeroCard, { backgroundColor: theme.surfaceElevated, borderColor: activeWorld.accentColor + '55' }]}>
          <View style={styles.worldHeroTop}>
            <View style={styles.worldHeroLeft}>
              <Text style={styles.worldHeroIcon}>{activeWorld.icon}</Text>
              <View style={styles.worldInfoCol}>
                <View style={styles.worldTagRow}>
                  <Text style={[styles.worldHeroTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    World {activeWorld.id}: {activeWorld.name}
                  </Text>
                  <View style={[styles.tagPill, { backgroundColor: activeWorld.accentColor + '22' }]}>
                    <Text style={[styles.tagText, { color: activeWorld.accentColor }]}>
                      {activeWorld.mechanicTag}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.worldHeroSub, { color: theme.textSecondary }]} numberOfLines={2}>
                  {activeWorld.description} (Lv {activeWorld.startLevel}–{activeWorld.endLevel})
                </Text>
              </View>
            </View>

            <View style={styles.worldHeroRight}>
              {worldProgress.isMastered ? (
                <View style={[styles.rewardBadge, { backgroundColor: '#10B98122', borderColor: '#10B981' }]}>
                  <Text style={styles.rewardBadgeText}>🌟 MASTERED</Text>
                </View>
              ) : worldProgress.isCompleted ? (
                <View style={[styles.rewardBadge, { backgroundColor: activeWorld.accentColor + '22', borderColor: activeWorld.accentColor }]}>
                  <Text style={[styles.rewardBadgeText, { color: activeWorld.accentColor }]}>🏅 {activeWorld.badgeName}</Text>
                </View>
              ) : (
                <View style={styles.starsGaugeCol}>
                  <Text style={[styles.starsGaugeVal, { color: '#F59E0B' }]}>
                    ★ {worldProgress.starsEarned} <Text style={styles.starsGaugeMax}>/ {worldProgress.maxStars}</Text>
                  </Text>
                  <Text style={[styles.starsGaugeLabel, { color: theme.textSecondary }]}>
                    {worldProgress.completedCount}/{worldProgress.totalLevels} Cleared
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* World Progress Bar */}
          <View style={[styles.worldHeroTrack, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <View
              style={[
                styles.worldHeroFill,
                {
                  width: `${worldProgress.percentComplete}%`,
                  backgroundColor: worldProgress.isCompleted ? '#10B981' : activeWorld.accentColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Level Grid */}
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          {levelsInWorld.map(lvlId => {
            const isUnlocked = lvlId <= unlockedLevel;
            const isCurrent = lvlId === currentLevelId;
            const stars = levelStars[lvlId] || 0;

            return (
              <TouchableOpacity
                key={lvlId}
                disabled={!isUnlocked}
                onPress={() => {
                  onSelectLevel(lvlId);
                  onClose();
                }}
                style={[
                  styles.levelTile,
                  {
                    backgroundColor: isCurrent
                      ? theme.arrowBody
                      : isUnlocked
                      ? theme.boardBg
                      : theme.tileBg,
                    borderColor: isCurrent ? theme.accent : theme.boardBorder,
                    opacity: isUnlocked ? 1 : 0.45,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.levelNum,
                    {
                      color: isCurrent
                        ? '#FFFFFF'
                        : isUnlocked
                        ? theme.textPrimary
                        : theme.textMuted,
                    },
                  ]}
                >
                  {lvlId}
                </Text>

                {isUnlocked ? (
                  <View style={styles.starsRow}>
                    {[1, 2, 3].map(s => (
                      <Text
                        key={s}
                        style={[
                          styles.starChar,
                          {
                            color:
                              s <= stars
                                ? theme.starFilled
                                : isCurrent
                                ? 'rgba(255,255,255,0.4)'
                                : theme.starEmpty,
                          },
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.lockIcon, { color: theme.textMuted }]}>🔒</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Integrated Bottom Banner for Level Selection */}
        <BannerAd adsRemoved={adsRemoved} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 12, 22, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    height: '88%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabsWrapper: {
    marginBottom: 12,
  },
  tabsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabPillText: {
    fontSize: 12,
  },
  tabBadgeCheck: {
    fontSize: 11,
  },
  worldHeroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  worldHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  worldHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  worldInfoCol: {
    flex: 1,
    minWidth: 0,
  },
  worldHeroRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  worldHeroIcon: {
    fontSize: 26,
  },
  worldTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  worldHeroTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  worldHeroSub: {
    fontSize: 11,
    marginTop: 2,
  },
  rewardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  rewardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  starsGaugeCol: {
    alignItems: 'flex-end',
  },
  starsGaugeVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  starsGaugeMax: {
    fontSize: 11,
    color: '#94A3B8',
  },
  starsGaugeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  worldHeroTrack: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  worldHeroFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    paddingBottom: 24,
  },
  levelTile: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNum: {
    fontSize: 14,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  starChar: {
    fontSize: 9,
    marginHorizontal: 0.5,
  },
  lockIcon: {
    fontSize: 11,
    marginTop: 2,
  },
});
