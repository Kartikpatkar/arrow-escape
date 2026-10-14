/**
 * Cosmetics Catalog & Unlock Engine Tests
 */

import {
  ARROW_SKINS,
  BOARD_THEMES,
  ESCAPE_EFFECTS,
  isCosmeticUnlocked,
  getUnlockedCosmeticIds,
} from '../../src/services/cosmetics/cosmeticsCatalog';
import {
  DEFAULT_PROGRESS,
  equipCosmetic,
  unlockCosmetic,
  loadUserProgress,
  resetAllProgress,
} from '../../src/services/storage/progressStorage';
import { THEMES } from '../../src/theme/colors';

describe('Cosmetics Catalog & Unlock Engine', () => {
  beforeEach(async () => {
    await resetAllProgress();
  });

  describe('Catalog Definitions', () => {
    it('defines expected arrow skins including galaxy, metallic, crystal, fire, minimalist', () => {
      const keys = ARROW_SKINS.map(s => s.key);
      expect(keys).toContain('classic');
      expect(keys).toContain('metallic');
      expect(keys).toContain('crystal');
      expect(keys).toContain('fire');
      expect(keys).toContain('galaxy');
      expect(keys).toContain('minimalist');
    });

    it('defines expected board themes including ocean, forest, space, cyberpunk, monochrome', () => {
      const keys = BOARD_THEMES.map(t => t.key);
      expect(keys).toContain('dawn');
      expect(keys).toContain('midnight');
      expect(keys).toContain('neon');
      expect(keys).toContain('ocean');
      expect(keys).toContain('forest');
      expect(keys).toContain('space');
      expect(keys).toContain('cyberpunk');
      expect(keys).toContain('monochrome');
    });

    it('includes light-based themes with isLight flag', () => {
      const lightThemes = BOARD_THEMES.filter(t => t.isLight);
      expect(lightThemes.length).toBeGreaterThanOrEqual(3);
      const lightKeys = lightThemes.map(t => t.key);
      expect(lightKeys).toContain('paperLight');
      expect(lightKeys).toContain('sunnyPastel');
      expect(lightKeys).toContain('frostLight');

      // Check corresponding THEMES in colors.ts
      expect(THEMES.paperLight.isLight).toBe(true);
      expect(THEMES.sunnyPastel.isLight).toBe(true);
      expect(THEMES.frostLight.isLight).toBe(true);
    });

    it('defines expected escape effects', () => {
      const keys = ESCAPE_EFFECTS.map(e => e.key);
      expect(keys).toContain('classic');
      expect(keys).toContain('sparkle');
      expect(keys).toContain('neonTrail');
      expect(keys).toContain('starExplosion');
      expect(keys).toContain('crystalShatter');
    });

    it('identifies VIP Collection catalog correctly', () => {
      const { getVipCollectionCatalog, VIP_COLLECTION_ITEMS } = require('../../src/services/cosmetics/cosmeticsCatalog');
      const catalog = getVipCollectionCatalog();
      expect(catalog.themes.length).toBe(6);
      expect(catalog.skins.length).toBe(5);
      expect(catalog.effects.length).toBe(4);
      expect(VIP_COLLECTION_ITEMS.length).toBe(15);

      // Verify distinction between free starter and VIP items
      const classic = ARROW_SKINS.find(s => s.key === 'classic')!;
      const galaxy = ARROW_SKINS.find(s => s.key === 'galaxy')!;
      expect(classic.tier).toBe('free');
      expect(classic.isVipCollection).toBe(false);
      expect(galaxy.tier).toBe('vip');
      expect(galaxy.isVipCollection).toBe(true);
    });
  });

  describe('Unlock Verification', () => {
    it('unlocks default items on fresh account', () => {
      const progress = { ...DEFAULT_PROGRESS };
      const classicSkin = ARROW_SKINS.find(s => s.key === 'classic')!;
      const dawnTheme = BOARD_THEMES.find(t => t.key === 'dawn')!;
      const paperTheme = BOARD_THEMES.find(t => t.key === 'paperLight')!;
      const classicEffect = ESCAPE_EFFECTS.find(e => e.key === 'classic')!;

      expect(isCosmeticUnlocked(classicSkin, progress)).toBe(true);
      expect(isCosmeticUnlocked(dawnTheme, progress)).toBe(true);
      expect(isCosmeticUnlocked(paperTheme, progress)).toBe(true);
      expect(isCosmeticUnlocked(classicEffect, progress)).toBe(true);
    });

    it('locks advanced cosmetics when milestones not met', () => {
      const progress = { ...DEFAULT_PROGRESS, unlockedLevel: 5 };
      const metallicSkin = ARROW_SKINS.find(s => s.key === 'metallic')!;
      const crystalSkin = ARROW_SKINS.find(s => s.key === 'crystal')!;
      const cyberpunkTheme = BOARD_THEMES.find(t => t.key === 'cyberpunk')!;

      expect(isCosmeticUnlocked(metallicSkin, progress)).toBe(false);
      expect(isCosmeticUnlocked(crystalSkin, progress)).toBe(false);
      expect(isCosmeticUnlocked(cyberpunkTheme, progress)).toBe(false);
    });

    it('unlocks metallic skin after completing World 1 (level 30)', () => {
      const metallicSkin = ARROW_SKINS.find(s => s.key === 'metallic')!;
      const progressBefore = { ...DEFAULT_PROGRESS, unlockedLevel: 30 };
      expect(isCosmeticUnlocked(metallicSkin, progressBefore)).toBe(false);

      const progressAfter = { ...DEFAULT_PROGRESS, unlockedLevel: 31 };
      expect(isCosmeticUnlocked(metallicSkin, progressAfter)).toBe(true);
    });

    it('unlocks crystal skin and crystal shatter after completing World 2 (level 80)', () => {
      const crystalSkin = ARROW_SKINS.find(s => s.key === 'crystal')!;
      const crystalEffect = ESCAPE_EFFECTS.find(e => e.key === 'crystalShatter')!;

      const progressAfter = { ...DEFAULT_PROGRESS, unlockedLevel: 85 };
      expect(isCosmeticUnlocked(crystalSkin, progressAfter)).toBe(true);
      expect(isCosmeticUnlocked(crystalEffect, progressAfter)).toBe(true);
    });

    it('unlocks space theme with 7-day daily challenge streak', () => {
      const spaceTheme = BOARD_THEMES.find(t => t.key === 'space')!;
      const dailyStateLow = { currentStreak: 3, longestStreak: 3, lastCompletedDate: null, records: {}, unlockedPastDates: [], notificationsEnabled: false };
      expect(isCosmeticUnlocked(spaceTheme, DEFAULT_PROGRESS, dailyStateLow)).toBe(false);

      const dailyState7 = { currentStreak: 7, longestStreak: 7, lastCompletedDate: null, records: {}, unlockedPastDates: [], notificationsEnabled: false };
      expect(isCosmeticUnlocked(spaceTheme, DEFAULT_PROGRESS, dailyState7)).toBe(true);
    });

    it('unlocks all cosmetics when VIP pass is purchased', () => {
      const progressVip = { ...DEFAULT_PROGRESS, cosmeticsVipUnlocked: true };
      const crystalSkin = ARROW_SKINS.find(s => s.key === 'crystal')!;
      const cyberpunkTheme = BOARD_THEMES.find(t => t.key === 'cyberpunk')!;
      const fireSkin = ARROW_SKINS.find(s => s.key === 'fire')!;

      expect(isCosmeticUnlocked(crystalSkin, progressVip)).toBe(true);
      expect(isCosmeticUnlocked(cyberpunkTheme, progressVip)).toBe(true);
      expect(isCosmeticUnlocked(fireSkin, progressVip)).toBe(true);
    });

    it('getUnlockedCosmeticIds returns set of unlocked IDs', () => {
      const progress = { ...DEFAULT_PROGRESS, unlockedLevel: 40 };
      const ids = getUnlockedCosmeticIds(progress);
      expect(ids.has('skin:classic')).toBe(true);
      expect(ids.has('skin:metallic')).toBe(true);
      expect(ids.has('theme:midnight')).toBe(true);
      expect(ids.has('theme:sunnyPastel')).toBe(true);
      expect(ids.has('effect:sparkle')).toBe(true);
      expect(ids.has('skin:crystal')).toBe(false);
    });
  });

  describe('Storage Integration', () => {
    it('equips cosmetics and persists selection', async () => {
      await equipCosmetic('skin', 'metallic');
      await equipCosmetic('theme', 'paperLight');
      await equipCosmetic('effect', 'sparkle');

      const progress = await loadUserProgress();
      expect(progress.selectedSkin).toBe('metallic');
      expect(progress.selectedTheme).toBe('paperLight');
      expect(progress.selectedEscapeEffect).toBe('sparkle');
    });

    it('unlocks cosmetic items permanently', async () => {
      await unlockCosmetic('skin:fire');
      const progress = await loadUserProgress();
      expect(progress.unlockedCosmetics).toContain('skin:fire');
    });
  });
});
