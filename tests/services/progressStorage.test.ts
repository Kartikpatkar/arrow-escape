import {
  DEFAULT_PROGRESS,
  loadUserProgress,
  recordLevelCompletion,
  resetAllProgress,
  saveUserProgress,
  updateHintsAvailable,
} from '../../src/services/storage/progressStorage';

describe('Progress Storage Service', () => {
  beforeEach(async () => {
    await resetAllProgress();
  });

  it('loads default progress on initial cold start', async () => {
    const progress = await loadUserProgress();
    expect(progress.unlockedLevel).toBe(1);
    expect(progress.hintsAvailable).toBe(5);
    expect(progress.selectedTheme).toBe('dawn');
    expect(progress.levelRecords).toEqual({});
  });

  it('records level completion and updates unlocked level', async () => {
    await recordLevelCompletion(1, 3, 2);
    const progress = await loadUserProgress();

    expect(progress.unlockedLevel).toBe(2);
    expect(progress.levelRecords[1]).toBeDefined();
    expect(progress.levelRecords[1].stars).toBe(3);
    expect(progress.levelRecords[1].bestMoves).toBe(2);
  });

  it('preserves higher star rating when replaying level', async () => {
    await recordLevelCompletion(1, 3, 2);
    // Replay with worse performance (1 star, 5 moves)
    await recordLevelCompletion(1, 1, 5);
    const progress = await loadUserProgress();

    // Stars should remain 3, best moves should remain 2
    expect(progress.levelRecords[1].stars).toBe(3);
    expect(progress.levelRecords[1].bestMoves).toBe(2);
  });

  it('updates hint balance with deduction and additions', async () => {
    // Deduct 1 hint
    const afterDeduct = await updateHintsAvailable(-1);
    expect(afterDeduct).toBe(4);

    // Add 2 hints (e.g. from rewarded ad)
    const afterReward = await updateHintsAvailable(2);
    expect(afterReward).toBe(6);

    const progress = await loadUserProgress();
    expect(progress.hintsAvailable).toBe(6);
  });

  it('persists selected theme', async () => {
    await saveUserProgress({ selectedTheme: 'midnight' });
    const progress = await loadUserProgress();
    expect(progress.selectedTheme).toBe('midnight');
  });

  it('resets progress back to default state', async () => {
    await recordLevelCompletion(5, 3, 6);
    await resetAllProgress();

    const progress = await loadUserProgress();
    expect(progress.unlockedLevel).toBe(1);
    expect(progress.levelRecords).toEqual({});
  });
});
