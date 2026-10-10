/**
 * LevelSelectModal Component
 * Interactive grid drawer to choose and replay any level.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LevelData } from '../../engine/types';
import { ColorTheme } from '../../theme/colors';

interface LevelSelectModalProps {
  visible: boolean;
  levels: readonly LevelData[];
  currentLevelId: number;
  unlockedLevel: number;
  levelStars: Record<number, number>;
  theme: ColorTheme;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  visible,
  levels,
  currentLevelId,
  unlockedLevel,
  levelStars,
  theme,
  onSelectLevel,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.boardBorder }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Select Level</Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: theme.boardBorder }]}>
            <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer}>
          {levels.map(lvl => {
            const isUnlocked = lvl.id <= unlockedLevel;
            const isCurrent = lvl.id === currentLevelId;
            const stars = levelStars[lvl.id] || 0;

            return (
              <TouchableOpacity
                key={lvl.id}
                disabled={!isUnlocked}
                onPress={() => {
                  onSelectLevel(lvl.id);
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
              >
                <Text
                  style={[
                    styles.levelNum,
                    { color: isCurrent ? '#FFFFFF' : isUnlocked ? theme.textPrimary : theme.textMuted },
                  ]}
                >
                  {lvl.id}
                </Text>
                {isUnlocked ? (
                  <View style={styles.starsRow}>
                    {[1, 2, 3].map(s => (
                      <Text
                        key={s}
                        style={[
                          styles.starChar,
                          { color: s <= stars ? theme.starFilled : isCurrent ? 'rgba(255,255,255,0.4)' : theme.starEmpty },
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 998,
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    borderRadius: 28,
    borderWidth: 2,
    padding: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  levelTile: {
    width: 62,
    height: 66,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  starChar: {
    fontSize: 10,
  },
  lockIcon: {
    fontSize: 12,
    marginTop: 2,
  },
});
