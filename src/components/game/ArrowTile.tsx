/**
 * ArrowTile Component
 * High-fidelity 3D tactile candy arrow matching the Feature Graphic aesthetic.
 * Chunky molded 3D directional arrow tokens mounted on pastel turquoise cushion pads.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
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
  skin?: string;
  escapeEffect?: string;
  escapeDurationMs?: number;
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

const SKIN_PALETTES: Record<string, Record<Direction, CandyArrowToken>> = {
  classic: {
    UP: {
      name: 'Sky Blue',
      gradStart: '#60A5FA',
      gradEnd: '#1D4ED8',
      extrusionColor: '#1E3A8A',
      rimGlow: 'rgba(219, 234, 254, 0.85)',
      dropShadowColor: 'rgba(29, 78, 216, 0.55)',
    },
    RIGHT: {
      name: 'Tangerine Orange',
      gradStart: '#FDBA74',
      gradEnd: '#EA580C',
      extrusionColor: '#9A3412',
      rimGlow: 'rgba(255, 237, 213, 0.85)',
      dropShadowColor: 'rgba(234, 88, 12, 0.55)',
    },
    DOWN: {
      name: 'Bubblegum Pink',
      gradStart: '#F472B6',
      gradEnd: '#DB2777',
      extrusionColor: '#9D174D',
      rimGlow: 'rgba(252, 231, 243, 0.85)',
      dropShadowColor: 'rgba(219, 39, 119, 0.55)',
    },
    LEFT: {
      name: 'Kiwi Lime Green',
      gradStart: '#86EFAC',
      gradEnd: '#16A34A',
      extrusionColor: '#14532D',
      rimGlow: 'rgba(220, 252, 231, 0.85)',
      dropShadowColor: 'rgba(22, 163, 74, 0.55)',
    },
  },
  metallic: {
    UP: {
      name: 'Platinum Silver',
      gradStart: '#FFFFFF',
      gradEnd: '#94A3B8',
      extrusionColor: '#475569',
      rimGlow: 'rgba(255, 255, 255, 0.95)',
      dropShadowColor: 'rgba(100, 116, 139, 0.65)',
    },
    RIGHT: {
      name: 'Polished Titanium',
      gradStart: '#F1F5F9',
      gradEnd: '#64748B',
      extrusionColor: '#334155',
      rimGlow: 'rgba(241, 245, 249, 0.95)',
      dropShadowColor: 'rgba(71, 85, 105, 0.65)',
    },
    DOWN: {
      name: 'Gunmetal Steel',
      gradStart: '#E2E8F0',
      gradEnd: '#475569',
      extrusionColor: '#1E293B',
      rimGlow: 'rgba(226, 232, 240, 0.95)',
      dropShadowColor: 'rgba(51, 65, 85, 0.65)',
    },
    LEFT: {
      name: 'Chrome Alloy',
      gradStart: '#F8FAFC',
      gradEnd: '#64748B',
      extrusionColor: '#334155',
      rimGlow: 'rgba(248, 250, 252, 0.95)',
      dropShadowColor: 'rgba(71, 85, 105, 0.65)',
    },
  },
  crystal: {
    UP: {
      name: 'Aqua Quartz',
      gradStart: '#A5F3FC',
      gradEnd: '#06B6D4',
      extrusionColor: '#0891B2',
      rimGlow: 'rgba(207, 250, 254, 0.9)',
      dropShadowColor: 'rgba(6, 182, 212, 0.6)',
    },
    RIGHT: {
      name: 'Amethyst Gem',
      gradStart: '#DDD6FE',
      gradEnd: '#8B5CF6',
      extrusionColor: '#6D28D9',
      rimGlow: 'rgba(237, 233, 254, 0.9)',
      dropShadowColor: 'rgba(139, 92, 246, 0.6)',
    },
    DOWN: {
      name: 'Rose Sapphire',
      gradStart: '#FBCFE8',
      gradEnd: '#EC4899',
      extrusionColor: '#BE185D',
      rimGlow: 'rgba(251, 207, 232, 0.9)',
      dropShadowColor: 'rgba(236, 72, 153, 0.6)',
    },
    LEFT: {
      name: 'Emerald Beryl',
      gradStart: '#A7F3D0',
      gradEnd: '#10B981',
      extrusionColor: '#047857',
      rimGlow: 'rgba(167, 243, 208, 0.9)',
      dropShadowColor: 'rgba(16, 185, 129, 0.6)',
    },
  },
  fire: {
    UP: {
      name: 'Solar Yellow',
      gradStart: '#FEF08A',
      gradEnd: '#EAB308',
      extrusionColor: '#A16207',
      rimGlow: 'rgba(254, 240, 138, 0.9)',
      dropShadowColor: 'rgba(234, 179, 8, 0.6)',
    },
    RIGHT: {
      name: 'Magma Orange',
      gradStart: '#FED7AA',
      gradEnd: '#EA580C',
      extrusionColor: '#9A3412',
      rimGlow: 'rgba(254, 215, 170, 0.9)',
      dropShadowColor: 'rgba(234, 88, 12, 0.6)',
    },
    DOWN: {
      name: 'Blaze Crimson',
      gradStart: '#FECACA',
      gradEnd: '#DC2626',
      extrusionColor: '#991B1B',
      rimGlow: 'rgba(254, 202, 202, 0.9)',
      dropShadowColor: 'rgba(220, 38, 38, 0.6)',
    },
    LEFT: {
      name: 'Volcanic Amber',
      gradStart: '#FDE68A',
      gradEnd: '#D97706',
      extrusionColor: '#92400E',
      rimGlow: 'rgba(253, 230, 138, 0.9)',
      dropShadowColor: 'rgba(217, 119, 6, 0.6)',
    },
  },
  galaxy: {
    UP: {
      name: 'Nebula Violet',
      gradStart: '#E9D5FF',
      gradEnd: '#7E22CE',
      extrusionColor: '#581C87',
      rimGlow: 'rgba(233, 213, 255, 0.9)',
      dropShadowColor: 'rgba(126, 34, 206, 0.6)',
    },
    RIGHT: {
      name: 'Cosmic Magenta',
      gradStart: '#FBCFE8',
      gradEnd: '#BE185D',
      extrusionColor: '#831843',
      rimGlow: 'rgba(251, 207, 232, 0.9)',
      dropShadowColor: 'rgba(190, 24, 93, 0.6)',
    },
    DOWN: {
      name: 'Deep Cosmos',
      gradStart: '#C7D2FE',
      gradEnd: '#3730A3',
      extrusionColor: '#1E1B4B',
      rimGlow: 'rgba(199, 210, 254, 0.9)',
      dropShadowColor: 'rgba(55, 48, 163, 0.6)',
    },
    LEFT: {
      name: 'Aurora Teal',
      gradStart: '#99F6E4',
      gradEnd: '#0F766E',
      extrusionColor: '#134E4A',
      rimGlow: 'rgba(153, 246, 228, 0.9)',
      dropShadowColor: 'rgba(15, 118, 110, 0.6)',
    },
  },
  minimalist: {
    UP: {
      name: 'Slate Charcoal',
      gradStart: '#E4E4E7',
      gradEnd: '#71717A',
      extrusionColor: '#3F3F46',
      rimGlow: 'rgba(244, 244, 245, 0.8)',
      dropShadowColor: 'rgba(39, 39, 42, 0.4)',
    },
    RIGHT: {
      name: 'Iron Grey',
      gradStart: '#D4D4D8',
      gradEnd: '#52525B',
      extrusionColor: '#27272A',
      rimGlow: 'rgba(228, 228, 231, 0.8)',
      dropShadowColor: 'rgba(39, 39, 42, 0.4)',
    },
    DOWN: {
      name: 'Noir Jet',
      gradStart: '#A1A1AA',
      gradEnd: '#3F3F46',
      extrusionColor: '#18181B',
      rimGlow: 'rgba(212, 212, 216, 0.8)',
      dropShadowColor: 'rgba(24, 24, 27, 0.4)',
    },
    LEFT: {
      name: 'Pure Graphite',
      gradStart: '#E4E4E7',
      gradEnd: '#52525B',
      extrusionColor: '#27272A',
      rimGlow: 'rgba(244, 244, 245, 0.8)',
      dropShadowColor: 'rgba(39, 39, 42, 0.4)',
    },
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
  theme,
  skin = 'classic',
  escapeEffect = 'classic',
  escapeDurationMs = 650,
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
  const skinKey = skin && SKIN_PALETTES[skin] ? skin : 'classic';
  const palette = SKIN_PALETTES[skinKey][arrow.direction];

  // SVG arrow dimensions scaled proportionally
  const arrowSvgSize = Math.max(34, Math.round(cellSize * 0.76));

  // Determine escape shadow filter
  const getEscapeShadow = () => {
    switch (escapeEffect) {
      case 'sparkle':
        return 'drop-shadow(0 0 20px #FBBF24) drop-shadow(0 0 10px #FFFFFF)';
      case 'neonTrail':
        return 'drop-shadow(0 0 24px #06B6D4) drop-shadow(0 0 12px #EC4899)';
      case 'starExplosion':
        return 'drop-shadow(0 0 22px #F43F5E) drop-shadow(0 0 12px #FACC15)';
      case 'crystalShatter':
        return 'drop-shadow(0 0 20px #A855F7) drop-shadow(0 0 10px #38BDF8)';
      default:
        return 'drop-shadow(0 0 16px #FDE047) drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
    }
  };

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
            ? `transform ${escapeDurationMs}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity ${Math.max(120, escapeDurationMs - 60)}ms cubic-bezier(0.8, 0, 0.95, 0.1)`
            : 'transform 80ms ease',
        } as any,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onTap(arrow.id)}
        style={[
          styles.cushionPad,
          theme.isLight && {
            backgroundColor: theme.surfaceElevated || '#FFFFFF',
            borderBottomColor: '#CBD5E1',
            borderRightColor: '#94A3B8',
            borderTopColor: '#FFFFFF',
            borderLeftColor: '#F1F5F9',
            shadowColor: 'rgba(0, 0, 0, 0.12)',
          },
          isHinted && styles.hintedPad,
          isBlockerFlash && styles.blockedPad,
          isEscaping && styles.escapingPad,
        ]}
      >
        {/* Soft Specular Reflection on Cushion */}
        <View style={styles.padGlossShine} />

        {/* Rotated 3D Arrow Token */}
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
                ? getEscapeShadow()
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

        {/* Special Arrow Mechanics Badges */}
        {arrow.isLocked && (
          <View style={styles.badgeLocked}>
            <Text style={styles.badgeText}>🔒</Text>
          </View>
        )}
        {arrow.type === 'KEY' && (
          <View style={styles.badgeKey}>
            <Text style={styles.badgeText}>🔑</Text>
          </View>
        )}
        {arrow.type === 'BOMB' && (
          <View style={styles.badgeBomb}>
            <Text style={styles.badgeText}>💣</Text>
          </View>
        )}
        {arrow.type === 'ROTATING' && (
          <View style={styles.badgeRotating}>
            <Text style={styles.badgeText}>↻</Text>
          </View>
        )}

        {/* Escape Effect Particle Trails & Visual Bursts */}
        {isEscaping && escapeEffect === 'sparkle' && (
          <View style={styles.escapeParticleOverlay} pointerEvents="none">
            <Text style={styles.sparkleParticle1}>✨</Text>
            <Text style={styles.sparkleParticle2}>✨</Text>
          </View>
        )}
        {isEscaping && escapeEffect === 'starExplosion' && (
          <View style={styles.escapeParticleOverlay} pointerEvents="none">
            <Text style={styles.starParticle1}>⭐</Text>
            <Text style={styles.starParticle2}>🌟</Text>
          </View>
        )}
        {isEscaping && escapeEffect === 'crystalShatter' && (
          <View style={styles.escapeParticleOverlay} pointerEvents="none">
            <Text style={styles.crystalParticle1}>💎</Text>
            <Text style={styles.crystalParticle2}>💠</Text>
          </View>
        )}
        {isEscaping && escapeEffect === 'neonTrail' && (
          <View style={styles.neonTrailStreak} pointerEvents="none" />
        )}
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
  badgeLocked: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(234, 179, 8, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#FEF08A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  badgeKey: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#93C5FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  badgeBomb: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  badgeRotating: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(168, 85, 247, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  escapeParticleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleParticle1: {
    position: 'absolute',
    top: -6,
    left: 4,
    fontSize: 16,
    textShadowColor: '#FDE047',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sparkleParticle2: {
    position: 'absolute',
    bottom: -6,
    right: 4,
    fontSize: 14,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  starParticle1: {
    position: 'absolute',
    top: -8,
    right: 0,
    fontSize: 18,
    textShadowColor: '#F59E0B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  starParticle2: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    fontSize: 16,
    textShadowColor: '#F43F5E',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  crystalParticle1: {
    position: 'absolute',
    top: -6,
    left: 2,
    fontSize: 15,
    textShadowColor: '#A855F7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  crystalParticle2: {
    position: 'absolute',
    bottom: -6,
    right: 2,
    fontSize: 15,
    textShadowColor: '#38BDF8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  neonTrailStreak: {
    position: 'absolute',
    width: '120%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#06B6D4',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
});
