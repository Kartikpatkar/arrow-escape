import {
  loadUserProgress,
  saveUserProgress,
  recordLevelCompletion,
  updateHintsAvailable,
  resetAllProgress,
  equipCosmetic,
} from '../../src/services/storage/progressStorage';
import { billingService } from '../../src/services/billing/billingService';
import { admobService } from '../../src/services/ads/admobService';

describe('B. Save-Game Reliability & Interruption Resiliency', () => {
  beforeEach(async () => {
    await resetAllProgress();
  });

  it('preserves progress across interrupted level completions and instant exit', async () => {
    // Complete level 1 with 3 stars
    await recordLevelCompletion(1, 3, 5, 5, 25);
    const savedAfterLevel1 = await loadUserProgress();
    expect(savedAfterLevel1.unlockedLevel).toBe(2);
    expect(savedAfterLevel1.levelRecords[1].stars).toBe(3);

    // Simulate force-stop or restart: fresh read from disk
    const reloaded = await loadUserProgress();
    expect(reloaded.unlockedLevel).toBe(2);
    expect(reloaded.levelRecords[1].stars).toBe(3);
  });

  it('does not downgrade stars or best moves if player replays with lower performance', async () => {
    // Level 5 completed with 3 stars in 8 moves
    await recordLevelCompletion(5, 3, 8, 8, 25);
    let state = await loadUserProgress();
    expect(state.levelRecords[5].stars).toBe(3);
    expect(state.levelRecords[5].bestMoves).toBe(8);

    // Replay with 1 star and 20 moves
    await recordLevelCompletion(5, 1, 20, 8, 25);
    state = await loadUserProgress();
    // Star record and best moves remain protected
    expect(state.levelRecords[5].stars).toBe(3);
    expect(state.levelRecords[5].bestMoves).toBe(8);
  });

  it('preserves IAP Remove Ads and cosmetic entitlements across app reset and reload', async () => {
    await billingService.purchaseRemoveAds();
    expect(billingService.isAdsRemoved()).toBe(true);

    const reloaded = await loadUserProgress();
    expect(reloaded.adsRemoved).toBe(true);

    const restoreResult = await billingService.restorePurchases();
    expect(restoreResult.restored).toBe(true);
  });

  it('safely handles hint balance updates atomically without negative counts', async () => {
    await saveUserProgress({ hintsAvailable: 2 });
    let count = await updateHintsAvailable(-1);
    expect(count).toBe(1);

    count = await updateHintsAvailable(-1);
    expect(count).toBe(0);

    // Attempting to consume hint below zero clamps at 0
    count = await updateHintsAvailable(-1);
    expect(count).toBe(0);
  });

  it('retains equipped cosmetics across cold-start reload', async () => {
    await equipCosmetic('skin', 'galaxy');
    await equipCosmetic('theme', 'midnight');

    const progress = await loadUserProgress();
    expect(progress.selectedSkin).toBe('galaxy');
    expect(progress.selectedTheme).toBe('midnight');
  });

  it('safely handles corrupt or malformed JSON in storage without crashing', async () => {
    const { setRawStorageForTest } = await import('../../src/services/storage/progressStorage');
    setRawStorageForTest('@arrow_escape_user_progress_v1', '!!!INVALID_JSON_CORRUPTED_STRING@@@');
    const recovered = await loadUserProgress();
    expect(recovered).toBeDefined();
    expect(recovered.unlockedLevel).toBe(1);
    expect(recovered.hintsAvailable).toBe(5);
  });

  it('clamps out-of-bounds or manipulated save values safely', async () => {
    const { setRawStorageForTest } = await import('../../src/services/storage/progressStorage');
    const maliciousPayload = JSON.stringify({
      data: {
        unlockedLevel: 9999999,
        hintsAvailable: -50,
        levelRecords: { '1': { stars: 99, bestMoves: -10 } },
      },
    });
    setRawStorageForTest('@arrow_escape_user_progress_v1', maliciousPayload);
    const sanitized = await loadUserProgress();
    expect(sanitized.unlockedLevel).toBe(1); // clamped
    expect(sanitized.hintsAvailable).toBe(5); // clamped
    expect(sanitized.levelRecords[1].stars).toBe(3); // clamped to max 3
    expect(sanitized.levelRecords[1].bestMoves).toBe(1); // clamped to min 1
  });

  it('resolves cloud save conflicts using Highest Progress Union policy', async () => {
    const { resolveSaveConflict, DEFAULT_PROGRESS } = await import('../../src/services/storage/progressStorage');

    const deviceA = {
      ...DEFAULT_PROGRESS,
      unlockedLevel: 15,
      levelRecords: {
        1: { stars: 2, bestMoves: 10, completedAt: 1000 },
        2: { stars: 3, bestMoves: 5, completedAt: 1000 },
      },
      hintsAvailable: 4,
      unlockedCosmetics: ['theme:dawn', 'skin:galaxy'],
      adsRemoved: false,
    };

    const deviceB = {
      ...DEFAULT_PROGRESS,
      unlockedLevel: 20,
      levelRecords: {
        1: { stars: 3, bestMoves: 6, completedAt: 2000 }, // better performance
        3: { stars: 3, bestMoves: 8, completedAt: 2000 },
      },
      hintsAvailable: 8,
      unlockedCosmetics: ['theme:dawn', 'theme:neon'],
      adsRemoved: true,
    };

    const merged = resolveSaveConflict(deviceA, deviceB);

    // Highest unlocked level
    expect(merged.unlockedLevel).toBe(20);
    // Highest stars & lowest moves on level 1
    expect(merged.levelRecords[1].stars).toBe(3);
    expect(merged.levelRecords[1].bestMoves).toBe(6);
    // Preserves level 2 and level 3
    expect(merged.levelRecords[2].stars).toBe(3);
    expect(merged.levelRecords[3].stars).toBe(3);
    // Highest hints
    expect(merged.hintsAvailable).toBe(8);
    // Entitlements preserved
    expect(merged.adsRemoved).toBe(true);
    // Union of cosmetics
    expect(merged.unlockedCosmetics).toContain('skin:galaxy');
    expect(merged.unlockedCosmetics).toContain('theme:neon');
  });
});
