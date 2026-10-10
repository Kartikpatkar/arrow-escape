/**
 * ArrowTile Component
 * High-fidelity 3D tactile candy arrow matching the Feature Graphic aesthetic.
 * Chunky molded 3D directional arrow tokens mounted on pastel turquoise cushion pads.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowConfig, Direction } from '../../engine/types';
import { ColorTheme } from '../../theme/colors';

interface ArrowTileProps {
  arrow: ArrowConfig;
  cellSize: number;
  gap: number;
  padding: number;
  isHinted: boolean;
  isBlockerFlash: boolean;
  isEscaping: boolean;
  isBlocked: boolean;
  theme: ColorTheme;
  onTap: (arrowId: string) => void;
}

// Directional candy palettes matching the Google Play Feature Graphic
interface CandyArrowToken {
  name: string;
  gradStart: string;
  gradEnd: string;
  extrusionColor: string; // 3D bottom edge
  rimGlow: string;
  dropShadowColor: string;
}

const CANDY_PALETTES: Record<Direction, CandyArrowToken> = {
  UP: {
    name: 'Sky Blue',
    gradStart: '#60A5FA', // Azure / Sky Blue
    gradEnd: '#1D4ED8',
    extrusionColor: '#1E3A8A',
    rimGlow: 'rgba(219, 234, 254, 0.85)',
    dropShadowColor: 'rgba(29, 78, 216, 0.55)',
  },
  RIGHT: {
    name: 'Tangerine Orange',
    gradStart: '#FDBA74', // Juicy Orange
    gradEnd: '#EA580C',
    extrusionColor: '#9A3412',
    rimGlow: 'rgba(255, 237, 213, 0.85)',
    dropShadowColor: 'rgba(234, 88, 12, 0.55)',
  },
  DOWN: {
    name: 'Bubblegum Pink',
    gradStart: '#F472B6', // Vivid Pink
    gradEnd: '#DB2777',
    extrusionColor: '#9D174D',
    rimGlow: 'rgba(252, 231, 243, 0.85)',
    dropShadowColor: 'rgba(219, 39, 119, 0.55)',
  },
  LEFT: {
    name: 'Kiwi Lime Green',
    gradStart: '#86EFAC', // Electric Green
    gradEnd: '#16A34A',
    extrusionColor: '#14532D',
    rimGlow: 'rgba(220, 252, 231, 0.85)',
    dropShadowColor: 'rgba(22, 163, 74, 0.55)',
  },
};

export const ArrowTile: React.FC<ArrowTileProps> = ({
  arrow,
  cellSize,
  gap,
  padding,
  isHinted,
  isBlockerFlash,
  isEscaping,
  isBlocked,
  theme: _theme,
  onTap,
}) => {
  const [shakeOffset, setShakeOffset] = useState(0);
  const [flyOffset, setFlyOffset] = useState({ x: 0, y: 0, opacity: 1, scale: 1 });

  // Handle Blocked Shake Animation
  useEffect(() => {
    if (isBlocked) {
      const shakeFrames = [8, -8, 6, -6, 4, -4, 2, 0];
      shakeFrames.forEach((offset, idx) => {
        setTimeout(() => {
          setShakeOffset(offset);
        }, idx * 35);
      });
    } else {
      setShakeOffset(0);
    }
  }, [isBlocked]);

  // Handle Escape Flyout Animation
  useEffect(() => {
    if (isEscaping) {
      const distance = 560;
      const dirMap: Record<Direction, { x: number; y: number }> = {
        UP: { x: 0, y: -distance },
        DOWN: { x: 0, y: distance },
        LEFT: { x: -distance, y: 0 },
        RIGHT: { x: distance, y: 0 },
      };

      const target = dirMap[arrow.direction];
      setFlyOffset({ x: target.x, y: target.y, opacity: 0, scale: 1.25 });
    } else {
      setFlyOffset({ x: 0, y: 0, opacity: 1, scale: 1 });
    }
  }, [isEscaping, arrow.direction]);

  const rotationDegrees: Record<Direction, string> = {
    UP: '0deg',
    RIGHT: '90deg',
    DOWN: '180deg',
    LEFT: '270deg',
  };

  const left = padding + arrow.x * (cellSize + gap);
  const top = padding + arrow.y * (cellSize + gap);
  const palette = CANDY_PALETTES[arrow.direction];

  // SVG arrow dimensions scaled proportionally
  const arrowSvgSize = Math.max(34, Math.round(cellSize * 0.76));

  return (
    <View
      style={[
        styles.container,
        {
          left,
          top,
          width: cellSize,
          height: cellSize,
          transform: [
            { translateX: flyOffset.x + shakeOffset },
            { translateY: flyOffset.y },
            { scale: flyOffset.scale },
          ],
          opacity: flyOffset.opacity,
          transition: isEscaping
            ? 'transform 480ms cubic-bezier(0.2, 0.75, 0.25, 1), opacity 450ms ease-out'
            : 'transform 80ms ease',
        } as any,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onTap(arrow.id)}
        style={[
          styles.cushionPad,
          isHinted && styles.hintedPad,
          isBlockerFlash && styles.blockedPad,
          isEscaping && styles.escapingPad,
        ]}
      >
        {/* Soft Specular Reflection on Turquoise Cushion */}
        <View style={styles.padGlossShine} />

        {/* Rotated 3D Chunky Candy Arrow */}
        <View
          style={[
            styles.arrowRotateWrapper,
            {
              transform: [{ rotate: rotationDegrees[arrow.direction] }],
            },
          ]}
        >
          <svg
            width={arrowSvgSize}
            height={arrowSvgSize}
            viewBox="0 0 100 100"
            fill="none"
            style={{
              display: 'block',
              overflow: 'visible',
              filter: isEscaping
                ? 'drop-shadow(0 0 16px #FDE047) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                : `drop-shadow(0 4px 6px ${palette.dropShadowColor})`,
            }}
          >
            <defs>
              {/* Vibrant Body Gradient */}
              <linearGradient
                id={`candyGrad-${arrow.id}`}
                x1="50"
                y1="8"
                x2="50"
                y2="92"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={isEscaping ? '#FFFBEB' : palette.gradStart} />
                <stop offset="0.75" stopColor={isEscaping ? '#FDE047' : palette.gradEnd} />
                <stop offset="1" stopColor={isEscaping ? '#EAB308' : palette.extrusionColor} />
              </linearGradient>

              {/* Specular Highlight Gradient */}
              <linearGradient
                id={`shineGrad-${arrow.id}`}
                x1="50"
                y1="10"
                x2="50"
                y2="60"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* 1. 3D Bottom Extrusion / Bevel Shelf (Depth layer shifted downward) */}
            <path
              d="M 50 16 
                 L 86 48 C 88 50, 88 53, 85 55 
                 L 70 55 C 68 55, 67 56, 67 58 
                 L 67 89 C 67 93, 64 96, 60 96 
                 L 40 96 C 36 96, 33 93, 33 89 
                 L 33 58 C 33 56, 32 55, 30 55 
                 L 15 55 C 12 53, 12 50, 14 48 
                 L 50 16 Z"
              fill={isEscaping ? '#CA8A04' : palette.extrusionColor}
            />

            {/* 2. Main 3D Candy Arrow Body */}
            <path
              d="M 50 10 
                 C 52 8, 55 8, 57 10 
                 L 86 42 
                 C 89 45, 87 49, 83 49 
                 L 70 49 
                 C 68 49, 66 51, 66 53 
                 L 66 84 
                 C 66 88, 63 91, 59 91 
                 L 41 91 
                 C 37 91, 34 88, 34 84 
                 L 34 53 
                 C 34 51, 32 49, 30 49 
                 L 17 49 
                 C 13 49, 11 45, 14 42 
                 L 43 10 
                 C 45 8, 48 8, 50 10 Z"
              fill={`url(#candyGrad-${arrow.id})`}
              stroke={palette.rimGlow}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* 3. Curved Specular Gloss Highlight (Glass shine reflection on crest) */}
            <path
              d="M 50 13 
                 C 51 12, 53 12, 54 13 
                 L 78 38 
                 C 79 39, 78 41, 76 41 
                 L 65 41 
                 C 62 41, 61 43, 61 46 
                 L 61 68 
                 C 61 69, 58 69, 58 68 
                 L 58 45 
                 C 58 43, 56 41, 54 41 
                 L 44 41 
                 C 42 41, 41 40, 42 38 
                 L 50 13 Z"
              fill={`url(#shineGrad-${arrow.id})`}
            />

            {/* 4. Rounded Specular Bead at the Tip */}
            <circle cx="50" cy="18" r="3.5" fill="#FFFFFF" opacity="0.9" />
          </svg>
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
  cushionPad: {
    width: '94%',
    height: '94%',
    borderRadius: 18,
    backgroundColor: '#38C2C9', // Vibrant pastel turquoise cushion matching Feature Graphic
    borderBottomWidth: 4,
    borderBottomColor: '#209197', // 3D Inset cushion bevel
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.65)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    borderRightWidth: 1,
    borderRightColor: '#1B7B81',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: 'rgba(15, 60, 68, 0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  padGlossShine: {
    position: 'absolute',
    top: 2,
    left: '12%',
    right: '12%',
    height: '22%',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  arrowRotateWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintedPad: {
    transform: [{ scale: 1.08 }],
    borderColor: '#FEF08A',
    borderWidth: 3,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.85,
    shadowRadius: 14,
  },
  blockedPad: {
    borderColor: '#F87171',
    borderWidth: 3,
    shadowColor: '#EF4444',
  },
  escapingPad: {
    backgroundColor: '#FEF08A',
    borderColor: '#FBBF24',
  },
});
