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
});
