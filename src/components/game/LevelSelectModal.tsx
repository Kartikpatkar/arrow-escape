/**
 * LevelSelectModal Component
 * Paginated grid drawer to choose and replay any level up to 500.
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TOTAL_LEVELS } from '../../data/levels';
import { ColorTheme } from '../../theme/colors';

const PAGE_SIZE = 50;
const TOTAL_PAGES = Math.ceil(TOTAL_LEVELS / PAGE_SIZE);

interface LevelSelectModalProps {
  visible: boolean;
  currentLevelId: number;
  unlockedLevel: number;
  levelStars: Record<number, number>;
  theme: ColorTheme;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  visible,
  currentLevelId,
  unlockedLevel,
  levelStars,
  theme,
  onSelectLevel,
  onClose,
}) => {
  const initialPage = Math.floor((Math.max(1, currentLevelId) - 1) / PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  if (!visible) return null;

  const startLevel = currentPage * PAGE_SIZE + 1;
  const endLevel = Math.min(TOTAL_LEVELS, (currentPage + 1) * PAGE_SIZE);

  const levelsInPage: number[] = [];
  for (let lvl = startLevel; lvl <= endLevel; lvl++) {
    levelsInPage.push(lvl);
  }

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
            <Text style={[styles.title, { color: theme.textPrimary }]}>Select Level</Text>
            <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
              Levels {startLevel}–{endLevel} of {TOTAL_LEVELS}
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

        {/* Page / Range Tab Switcher */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {Array.from({ length: TOTAL_PAGES }).map((_, idx) => {
              const pStart = idx * PAGE_SIZE + 1;
              const pEnd = Math.min(TOTAL_LEVELS, (idx + 1) * PAGE_SIZE);
              const isActive = idx === currentPage;
              const isPageUnlocked = pStart <= unlockedLevel;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setCurrentPage(idx)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: isActive
                        ? theme.accent
                        : isPageUnlocked
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(255, 255, 255, 0.02)',
                      borderColor: isActive ? theme.accent : theme.boardBorder,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      {
                        color: isActive
                          ? '#0F172A'
                          : isPageUnlocked
                          ? theme.textPrimary
                          : theme.textMuted,
                        fontWeight: isActive ? '800' : '600',
                      },
                    ]}
                  >
                    {pStart}-{pEnd}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 50-Level Grid */}
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {levelsInPage.map(lvlId => {
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabsWrapper: {
    marginBottom: 14,
  },
  tabsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    paddingBottom: 16,
  },
  levelTile: {
    width: '17.8%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNum: {
    fontSize: 15,
    fontWeight: '800',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  starChar: {
    fontSize: 8,
  },
  lockIcon: {
    fontSize: 10,
    marginTop: 2,
  },
});
