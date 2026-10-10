/**
 * Board Component
 * Tactile 3D toy puzzle tray matching the Feature Graphic aesthetic.
 * Iridescent candy bezel, golden star corner studs, recessed teal well slots, and floating elevation.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ArrowConfig } from '../../engine/types';
import { ColorTheme } from '../../theme/colors';
import { ArrowTile } from './ArrowTile';

interface BoardProps {
  width: number;
  height: number;
  activeArrows: readonly ArrowConfig[];
  escapingArrowIds: readonly string[];
  hintArrowId: string | null;
  blockedArrowId: string | null;
  blockerFlashId: string | null;
  theme: ColorTheme;
  maxBoardDimension?: number;
  onArrowTap: (arrowId: string) => void;
}

export const Board: React.FC<BoardProps> = ({
  width,
  height,
  activeArrows,
  escapingArrowIds,
  hintArrowId,
  blockedArrowId,
  blockerFlashId,
  theme,
  maxBoardDimension = 360,
  onArrowTap,
}) => {
  const gap = 10;
  const padding = 22;

  // Calculate cell size based on largest grid dimension
  const maxCols = Math.max(width, height);
  const cellSize = Math.floor((maxBoardDimension - padding * 2 - (maxCols - 1) * gap) / maxCols);

  const boardWidth = width * cellSize + (width - 1) * gap + padding * 2;
  const boardHeight = height * cellSize + (height - 1) * gap + padding * 2;

  // Generate background grid cells
  const gridCells = useMemo(() => {
    const cells: { id: string; x: number; y: number }[] = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        cells.push({ id: `cell-${c}-${r}`, x: c, y: r });
      }
    }
    return cells;
  }, [width, height]);

  return (
    <View style={styles.floatingWrapper}>
      {/* Iridescent Rainbow Bezel Frame */}
      <View
        style={[
          styles.rainbowBezel,
          {
            width: boardWidth + 14,
            height: boardHeight + 14,
          },
        ]}
      >
        {/* Decorative corner studs matching Feature Graphic */}
        <View style={[styles.cornerStud, styles.studTopLeft]}>
          <Text style={styles.studGlyph}>★</Text>
        </View>
        <View style={[styles.cornerStud, styles.studTopRight]}>
          <Text style={styles.studGlyph}>★</Text>
        </View>
        <View style={[styles.cornerStud, styles.studBottomLeft]}>
          <Text style={styles.studGlyph}>★</Text>
        </View>
        <View style={[styles.cornerStud, styles.studBottomRight]}>
          <Text style={styles.studGlyph}>★</Text>
        </View>

        {/* Decorative perimeter track notches */}
        <View style={styles.topNotchRow}>
          <Text style={styles.bezelIcon}>▲</Text>
          <Text style={styles.bezelIcon}>⚙</Text>
          <Text style={styles.bezelIcon}>▲</Text>
        </View>
        <View style={styles.bottomNotchRow}>
          <Text style={styles.bezelIcon}>▼</Text>
          <Text style={styles.bezelIcon}>⚙</Text>
          <Text style={styles.bezelIcon}>▼</Text>
        </View>

        {/* Main Inner Playfield Tray */}
        <View
          style={[
            styles.boardInnerTray,
            {
              width: boardWidth,
              height: boardHeight,
              backgroundColor: theme.boardBg,
            },
          ]}
        >
          <View style={[styles.boardInnerGrid, { padding }]}>
            {/* Ambient Recessed Empty Grid Cell Wells */}
            {gridCells.map(cell => (
              <View
                key={cell.id}
                style={[
                  styles.emptyCell,
                  {
                    left: padding + cell.x * (cellSize + gap),
                    top: padding + cell.y * (cellSize + gap),
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: theme.tileBg,
                  },
                ]}
              >
                {/* Tactile recessed well center ring */}
                <View style={styles.emptySlotRing}>
                  <Text style={styles.emptyWellIcon}>?</Text>
                </View>
              </View>
            ))}

            {/* Active & Escaping Arrow Tiles */}
            {activeArrows.map(arrow => {
              const isEscaping = escapingArrowIds.includes(arrow.id);
              const isBlocked = blockedArrowId === arrow.id;
              const isHinted = hintArrowId === arrow.id;
              const isBlockerFlash = blockerFlashId === arrow.id;

              return (
                <ArrowTile
                  key={arrow.id}
                  arrow={arrow}
                  cellSize={cellSize}
                  gap={gap}
                  padding={padding}
                  isEscaping={isEscaping}
                  isBlocked={isBlocked}
                  isHinted={isHinted}
                  isBlockerFlash={isBlockerFlash}
                  theme={theme}
                  onTap={onArrowTap}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainbowBezel: {
    borderRadius: 40,
    padding: 8,
    // Iridescent candy frame gradient
    backgroundColor: '#38BDF8',
    backgroundImage: 'linear-gradient(135deg, #FF6B97, #FFA25B, #FFE36A, #5BFFA7, #48DEFF, #B368FF, #FF6B97)' as any,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowColor: 'rgba(56, 189, 248, 0.65)',
    elevation: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardInnerTray: {
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    position: 'relative',
  },
  cornerStud: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FDE047',
    borderWidth: 2,
    borderColor: '#EAB308',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowColor: '#A16207',
  },
  studTopLeft: {
    top: 5,
    left: 5,
  },
  studTopRight: {
    top: 5,
    right: 5,
  },
  studBottomLeft: {
    bottom: 5,
    left: 5,
  },
  studBottomRight: {
    bottom: 5,
    right: 5,
  },
  studGlyph: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 12,
  },
  topNotchRow: {
    position: 'absolute',
    top: 0,
    left: 40,
    right: 40,
    height: 7,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 8,
  },
  bottomNotchRow: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 40,
    height: 7,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 8,
  },
  bezelIcon: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
  boardInnerGrid: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  emptyCell: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 1.5,
    borderTopWidth: 2.5,
    borderTopColor: 'rgba(0, 0, 0, 0.25)',
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlotRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWellIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.3)',
  },
});
