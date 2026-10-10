/**
 * ArrowTile Component
 * High-performance interactive arrow tile with escape flyout,
 * blocked shake, and hint pulse animations.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ArrowConfig, Direction } from '../../engine/types';
import { ColorTheme } from '../../theme/colors';

interface ArrowTileProps {
  arrow: ArrowConfig;
  cellSize: number;
  gap: number;
  isHinted: boolean;
  isBlockerFlash: boolean;
  isEscaping: boolean;
  isBlocked: boolean;
  theme: ColorTheme;
  onTap: (arrowId: string) => void;
}

export const ArrowTile: React.FC<ArrowTileProps> = ({
  arrow,
  cellSize,
  gap,
  isHinted,
  isBlockerFlash,
  isEscaping,
  isBlocked,
  theme,
  onTap,
}) => {
  const [shakeOffset, setShakeOffset] = useState(0);
  const [flyOffset, setFlyOffset] = useState({ x: 0, y: 0, opacity: 1 });

  // Handle Blocked Shake Animation
  useEffect(() => {
    if (isBlocked) {
      const shakeFrames = [6, -6, 5, -5, 3, -3, 0];
      shakeFrames.forEach((offset, idx) => {
        setTimeout(() => {
          setShakeOffset(offset);
        }, idx * 40);
      });
    } else {
      setShakeOffset(0);
    }
  }, [isBlocked]);

  // Handle Escape Animation
  useEffect(() => {
    if (isEscaping) {
      const distance = 400; // Fly completely off the board
      const dirMap: Record<Direction, { x: number; y: number }> = {
        UP: { x: 0, y: -distance },
        DOWN: { x: 0, y: distance },
        LEFT: { x: -distance, y: 0 },
        RIGHT: { x: distance, y: 0 },
      };

      const target = dirMap[arrow.direction];
      setFlyOffset({ x: target.x, y: target.y, opacity: 0 });
    } else {
      setFlyOffset({ x: 0, y: 0, opacity: 1 });
    }
  }, [isEscaping, arrow.direction]);

  // Directional arrow rotation in degrees
  const rotationDegrees: Record<Direction, string> = {
    UP: '0deg',
    RIGHT: '90deg',
    DOWN: '180deg',
    LEFT: '270deg',
  };

  const left = arrow.x * (cellSize + gap);
  const top = arrow.y * (cellSize + gap);

  const containerStyle = [
    styles.container,
    {
      left,
      top,
      width: cellSize,
      height: cellSize,
      transform: [
        { translateX: flyOffset.x + shakeOffset },
        { translateY: flyOffset.y },
      ],
      opacity: flyOffset.opacity,
      transition: isEscaping
        ? 'transform 280ms cubic-bezier(0.3, 0, 0.2, 1), opacity 240ms ease-out'
        : 'transform 80ms ease',
    } as any,
  ];

  const tileBgColor = isBlockerFlash
    ? theme.blockedFlash
    : isHinted
    ? theme.hintGlow
    : theme.arrowBody;

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => onTap(arrow.id)}
        style={[
          styles.arrowPill,
          {
            backgroundColor: tileBgColor,
            borderColor: isHinted ? theme.hintGlow : theme.boardBorder,
            shadowColor: theme.arrowShadow,
          },
          isHinted && styles.hintedPill,
          isBlockerFlash && styles.blockedPill,
        ]}
      >
        <View
          style={[
            styles.arrowIconContainer,
            { transform: [{ rotate: rotationDegrees[arrow.direction] }] },
          ]}
        >
          {/* Custom vector chevron arrow glyph */}
          <View style={styles.arrowChevron}>
            <View style={[styles.arrowHeadLeft, { backgroundColor: theme.arrowHead }]} />
            <View style={[styles.arrowHeadRight, { backgroundColor: theme.arrowHead }]} />
            <View style={[styles.arrowStem, { backgroundColor: theme.arrowHead }]} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrowPill: {
    width: '92%',
    height: '92%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
  },
  hintedPill: {
    transform: [{ scale: 1.06 }],
    borderWidth: 2.5,
  },
  blockedPill: {
    borderWidth: 2.5,
  },
  arrowIconContainer: {
    width: '60%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowChevron: {
    width: 24,
    height: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHeadLeft: {
    position: 'absolute',
    width: 3.5,
    height: 12,
    borderRadius: 2,
    top: 3,
    left: 7.5,
    transform: [{ rotate: '-45deg' }],
  },
  arrowHeadRight: {
    position: 'absolute',
    width: 3.5,
    height: 12,
    borderRadius: 2,
    top: 3,
    right: 7.5,
    transform: [{ rotate: '45deg' }],
  },
  arrowStem: {
    position: 'absolute',
    width: 3.5,
    height: 14,
    borderRadius: 2,
    bottom: 3,
  },
});
