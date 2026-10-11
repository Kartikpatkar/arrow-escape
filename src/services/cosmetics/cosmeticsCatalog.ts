/**
 * Arrow Escape — Cosmetics Catalog & Unlock Engine
 * Manages unlockable Arrow Skins, Board Themes (including Light Themes), and Escape Effects.
 */

import { UserProgressData } from '../storage/progressStorage';
import { DailyChallengeState } from '../daily/dailyChallengeService';

export type CosmeticCategory = 'skin' | 'theme' | 'effect';

export interface CosmeticItem {
  readonly id: string; // e.g. 'skin:classic', 'theme:ocean'
  readonly category: CosmeticCategory;
  readonly key: string; // e.g. 'classic', 'ocean'
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly previewColor: string;
  readonly unlockRequirementText: string;
  readonly isUnlockedByDefault?: boolean;
  readonly isLight?: boolean;
  readonly checkMilestone: (progress: UserProgressData, dailyState?: DailyChallengeState | null) => boolean;
}

export const ARROW_SKINS: readonly CosmeticItem[] = [
  {
    id: 'skin:classic',
    category: 'skin',
    key: 'classic',
    name: 'Classic Candy',
    description: 'Vibrant glossy 3D directional toy arrow tokens.',
    icon: '🍬',
    previewColor: '#38BDF8',
    unlockRequirementText: 'Unlocked by default',
    isUnlockedByDefault: true,
    checkMilestone: () => true,
  },
  {
    id: 'skin:metallic',
    category: 'skin',
    key: 'metallic',
    name: 'Metallic Chrome',
    description: 'Polished titanium silver with specular chrome highlights.',
    icon: '🛡️',
    previewColor: '#E2E8F0',
    unlockRequirementText: 'Complete World 1 (Level 30)',
    checkMilestone: progress => progress.unlockedLevel > 30,
  },
  {
    id: 'skin:crystal',
    category: 'skin',
    key: 'crystal',
    name: 'Crystal Prism',
    description: 'Faceted prismatic quartz with iridescent glow.',
    icon: '💎',
    previewColor: '#67E8F9',
    unlockRequirementText: 'Complete World 2 (Level 80)',
    checkMilestone: progress => progress.unlockedLevel > 80,
  },
  {
    id: 'skin:fire',
    category: 'skin',
    key: 'fire',
    name: 'Fire Blaze',
    description: 'Molten magma arrows with blazing heat aura.',
    icon: '🔥',
    previewColor: '#F97316',
    unlockRequirementText: 'Reach Level 100',
    checkMilestone: progress => progress.unlockedLevel >= 100,
  },
  {
    id: 'skin:galaxy',
    category: 'skin',
    key: 'galaxy',
    name: 'Galaxy Cosmic',
    description: 'Deep starlight cosmos with celestial dust swirls.',
    icon: '🌌',
    previewColor: '#A855F7',
    unlockRequirementText: '7-Day Daily Streak or 100 Stars',
    checkMilestone: (progress, daily) => {
      const streak = daily?.longestStreak || 0;
      const stars = Object.values(progress.levelRecords || {}).reduce((s, r) => s + (r?.stars || 0), 0);
      return streak >= 7 || stars >= 100;
    },
  },
  {
    id: 'skin:minimalist',
    category: 'skin',
    key: 'minimalist',
    name: 'Minimalist Bauhaus',
    description: 'Monochrome geometry with pure architectural lines.',
    icon: '📐',
    previewColor: '#71717A',
    unlockRequirementText: 'Complete 3 Daily Challenges',
    checkMilestone: (_progress, daily) => {
      const completedCount = Object.values(daily?.records || {}).filter(r => r.completed).length;
      return completedCount >= 3;
    },
  },
];

export const BOARD_THEMES: readonly CosmeticItem[] = [
  {
    id: 'theme:dawn',
    category: 'theme',
    key: 'dawn',
    name: 'Candy Arcade',
    description: 'Signature cosmic cyan board with turquoise cushions.',
    icon: '🎮',
    previewColor: '#1B6474',
    unlockRequirementText: 'Unlocked by default',
    isUnlockedByDefault: true,
    checkMilestone: () => true,
  },
  {
    id: 'theme:paperLight',
    category: 'theme',
    key: 'paperLight',
    name: 'Zen Paper (Light)',
    description: 'Gentle warm parchment light mode with dark ink arrows.',
    icon: '📜',
    previewColor: '#F8F6F0',
    isLight: true,
    unlockRequirementText: 'Unlocked by default (Light Mode)',
    isUnlockedByDefault: true,
    checkMilestone: () => true,
  },
  {
    id: 'theme:midnight',
    category: 'theme',
    key: 'midnight',
    name: 'Midnight Dark',
    description: 'Sleek slate indigo darkness for night play.',
    icon: '🌙',
    previewColor: '#182234',
    unlockRequirementText: 'Complete Level 10',
    checkMilestone: progress => progress.unlockedLevel > 10,
  },
  {
    id: 'theme:sunnyPastel',
    category: 'theme',
    key: 'sunnyPastel',
    name: 'Sunny Meadow (Light)',
    description: 'Fresh mint and warm sunlight pastel light mode.',
    icon: '☀️',
    previewColor: '#E0F3E4',
    isLight: true,
    unlockRequirementText: 'Complete Level 20',
    checkMilestone: progress => progress.unlockedLevel > 20,
  },
  {
    id: 'theme:frostLight',
    category: 'theme',
    key: 'frostLight',
    name: 'Frost Pearl (Light)',
    description: 'Clean ice crystal blue and snow white light mode.',
    icon: '❄️',
    previewColor: '#E0F2FE',
    isLight: true,
    unlockRequirementText: 'Complete Level 35',
    checkMilestone: progress => progress.unlockedLevel > 35,
  },
  {
    id: 'theme:ocean',
    category: 'theme',
    key: 'ocean',
    name: 'Deep Ocean',
    description: 'Bioluminescent deep sea turquoise and teal corals.',
    icon: '🌊',
    previewColor: '#0E4459',
    unlockRequirementText: 'Complete 3 Daily Challenges',
    checkMilestone: (_progress, daily) => {
      const count = Object.values(daily?.records || {}).filter(r => r.completed).length;
      return count >= 3;
    },
  },
  {
    id: 'theme:forest',
    category: 'theme',
    key: 'forest',
    name: 'Forest Canopy',
    description: 'Lush emerald foliage and soothing woodland depth.',
    icon: '🌲',
    previewColor: '#17472E',
    unlockRequirementText: 'Complete Level 50',
    checkMilestone: progress => progress.unlockedLevel > 50,
  },
  {
    id: 'theme:neon',
    category: 'theme',
    key: 'neon',
    name: 'Cyber Neon',
    description: 'Ultra-vivid cyan and laser magenta neon wireframes.',
    icon: '⚡',
    previewColor: '#0F172A',
    unlockRequirementText: 'Complete Level 60',
    checkMilestone: progress => progress.unlockedLevel > 60,
  },
  {
    id: 'theme:monochrome',
    category: 'theme',
    key: 'monochrome',
    name: 'Slate Noir',
    description: 'Ultra-minimal dark grey monochromatic slate stone.',
    icon: '⬛',
    previewColor: '#24242A',
    unlockRequirementText: 'Earn 75 Stars',
    checkMilestone: progress => {
      const stars = Object.values(progress.levelRecords || {}).reduce((s, r) => s + (r?.stars || 0), 0);
      return stars >= 75;
    },
  },
  {
    id: 'theme:space',
    category: 'theme',
    key: 'space',
    name: 'Deep Space Nebula',
    description: 'Interstellar purple cosmos with nebula dust.',
    icon: '🚀',
    previewColor: '#231846',
    unlockRequirementText: '7-Day Daily Challenge Streak',
    checkMilestone: (_progress, daily) => (daily?.longestStreak || 0) >= 7,
  },
  {
    id: 'theme:cyberpunk',
    category: 'theme',
    key: 'cyberpunk',
    name: 'Cyberpunk 2077',
    description: 'High-contrast synthetic yellow, crimson and cyan cyber city.',
    icon: '🤖',
    previewColor: '#2D1540',
    unlockRequirementText: 'Complete World 3 (Level 150)',
    checkMilestone: progress => progress.unlockedLevel > 150,
  },
];

export const ESCAPE_EFFECTS: readonly CosmeticItem[] = [
  {
    id: 'effect:classic',
    category: 'effect',
    key: 'classic',
    name: 'Candy Pop',
    description: 'Crisp golden halo launch burst.',
    icon: '💫',
    previewColor: '#FDE047',
    unlockRequirementText: 'Unlocked by default',
    isUnlockedByDefault: true,
    checkMilestone: () => true,
  },
  {
    id: 'effect:sparkle',
    category: 'effect',
    key: 'sparkle',
    name: 'Sparkle Burst',
    description: 'Radiant golden starlight shower following the arrow.',
    icon: '✨',
    previewColor: '#FBBF24',
    unlockRequirementText: 'Complete Level 15',
    checkMilestone: progress => progress.unlockedLevel > 15,
  },
  {
    id: 'effect:neonTrail',
    category: 'effect',
    key: 'neonTrail',
    name: 'Neon Speed Trail',
    description: 'High-speed luminous cyan & magenta hyper-streak.',
    icon: '⚡',
    previewColor: '#06B6D4',
    unlockRequirementText: 'Complete Level 45',
    checkMilestone: progress => progress.unlockedLevel > 45,
  },
  {
    id: 'effect:starExplosion',
    category: 'effect',
    key: 'starExplosion',
    name: 'Star Nova',
    description: 'Pop explosion of multicolored miniature celebration stars.',
    icon: '🌟',
    previewColor: '#EC4899',
    unlockRequirementText: 'Complete 5 Daily Challenges',
    checkMilestone: (_progress, daily) => {
      const count = Object.values(daily?.records || {}).filter(r => r.completed).length;
      return count >= 5;
    },
  },
  {
    id: 'effect:crystalShatter',
    category: 'effect',
    key: 'crystalShatter',
    name: 'Crystal Shatter',
    description: 'Prismatic diamond shards scattering across the screen.',
    icon: '💠',
    previewColor: '#A855F7',
    unlockRequirementText: 'Complete World 2 (Level 80)',
    checkMilestone: progress => progress.unlockedLevel > 80,
  },
];

export const ALL_COSMETICS: readonly CosmeticItem[] = [
  ...ARROW_SKINS,
  ...BOARD_THEMES,
  ...ESCAPE_EFFECTS,
];

/**
 * Checks whether an individual cosmetic item is unlocked for the user.
 */
export function isCosmeticUnlocked(
  item: CosmeticItem,
  progress: UserProgressData,
  dailyState?: DailyChallengeState | null,
  isVipUnlocked: boolean = false
): boolean {
  if (item.isUnlockedByDefault) return true;
  if (isVipUnlocked || progress.cosmeticsVipUnlocked) return true;

  // Explicitly unlocked via persistence
  if (progress.unlockedCosmetics && progress.unlockedCosmetics.includes(item.id)) {
    return true;
  }

  // Milestone unlocked
  return item.checkMilestone(progress, dailyState);
}

/**
 * Returns all cosmetic IDs currently unlocked for the player.
 */
export function getUnlockedCosmeticIds(
  progress: UserProgressData,
  dailyState?: DailyChallengeState | null,
  isVipUnlocked: boolean = false
): Set<string> {
  const unlocked = new Set<string>();
  ALL_COSMETICS.forEach(item => {
    if (isCosmeticUnlocked(item, progress, dailyState, isVipUnlocked)) {
      unlocked.add(item.id);
    }
  });
  return unlocked;
}
