/**
 * Board Component
 * Responsive squircle puzzle board rendering grid cells and active arrows.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowConfig } from '../../engine/types';
import { ColorTheme } from '../../theme/colors';
import { ArrowTile } from './ArrowTile';

interface BoardProps {
  width: number; // grid columns
  height: number; // grid rows
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
  const gap = 8;
  const padding = 16;

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
    <View
      style={[
        styles.boardOuterContainer,
        {
          width: boardWidth,
          height: boardHeight,
          backgroundColor: theme.boardBg,
          borderColor: theme.boardBorder,
          shadowColor: theme.arrowShadow,
        },
      ]}
    >
      <View style={[styles.boardInnerGrid, { padding }]}>
        {/* Ambient Empty Grid Cell Slots */}
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
                borderColor: theme.boardBorder,
              },
            ]}
          />
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
  );
};

const styles = StyleSheet.create({
  boardOuterContainer: {
    borderRadius: 28,
    borderWidth: 2,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  boardInnerGrid: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  emptyCell: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: 1,
    opacity: 0.8,
  },
});
