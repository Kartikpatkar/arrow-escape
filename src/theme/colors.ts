/**
 * Arrow Escape — Color Tokens
 * Premium Casual Style ("Dawn Softness" default + themes)
 */

export interface ColorTheme {
  name: string;
  id: string;
  background: string;
  surface: string;
  boardBg: string;
  boardBorder: string;
  tileBg: string;
  arrowBody: string;
  arrowHead: string;
  arrowShadow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  hintGlow: string;
  blockedFlash: string;
  victoryGlow: string;
  starFilled: string;
  starEmpty: string;
}

export const THEMES: Record<string, ColorTheme> = {
  dawn: {
    id: 'dawn',
    name: 'Candy Arcade (Feature Graphic)',
    background: '#0E1F33', // Deep cosmic aurora cyan/indigo
    surface: '#15324E',
    boardBg: '#1B6474', // Vibrant turquoise toy tray
    boardBorder: '#4DD4DC', // Cyan gloss bezel rim
    tileBg: '#124856', // Recessed empty well slots
    arrowBody: '#38BDF8',
    arrowHead: '#FFFFFF',
    arrowShadow: 'rgba(77, 212, 220, 0.4)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A5F3FC',
    textMuted: '#67E8F9',
    accent: '#F59E0B',
    hintGlow: '#FDE047',
    blockedFlash: '#FF477E',
    victoryGlow: '#34D399',
    starFilled: '#FBBF24',
    starEmpty: '#33586C',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Dark',
    background: '#0F172A',
    surface: '#1E293B',
    boardBg: '#182234',
    boardBorder: '#334155',
    tileBg: '#1E293B',
    arrowBody: '#818CF8',
    arrowHead: '#FFFFFF',
    arrowShadow: 'rgba(129, 140, 248, 0.35)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#A5B4FC',
    hintGlow: '#FBBF24',
    blockedFlash: '#F87171',
    victoryGlow: '#34D399',
    starFilled: '#FBBF24',
    starEmpty: '#475569',
  },
  neon: {
    id: 'neon',
    name: 'Cyber Neon',
    background: '#090D16',
    surface: '#111827',
    boardBg: '#0F172A',
    boardBorder: '#06B6D4',
    tileBg: '#131D31',
    arrowBody: '#06B6D4',
    arrowHead: '#FFFFFF',
    arrowShadow: 'rgba(6, 182, 212, 0.45)',
    textPrimary: '#FFFFFF',
    textSecondary: '#38BDF8',
    textMuted: '#64748B',
    accent: '#EC4899',
    hintGlow: '#FACC15',
    blockedFlash: '#FF0055',
    victoryGlow: '#10B981',
    starFilled: '#FACC15',
    starEmpty: '#334155',
  },
};

export const defaultTheme = THEMES.dawn;
