import { AdsPacingEngine } from '../../src/services/ads/adsPacingEngine';

describe('Ads Pacing Engine', () => {
  let engine: AdsPacingEngine;

  beforeEach(() => {
    engine = new AdsPacingEngine({
      interstitialLevelInterval: 4,
      interstitialCooldownSeconds: 180,
      maxRewardedPerSession: 5,
    });
  });

  it('rejects interstitial if level interval (4) has not been reached', () => {
    engine.onLevelCompleted();
    engine.onLevelCompleted();
    engine.onLevelCompleted(); // 3 levels

    const check = engine.canShowInterstitial();
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Need 4 levels');
  });

  it('allows interstitial once 4 levels have been completed', () => {
    engine.onLevelCompleted();
    engine.onLevelCompleted();
    engine.onLevelCompleted();
    engine.onLevelCompleted(); // 4 levels

    const check = engine.canShowInterstitial();
    expect(check.allowed).toBe(true);
  });

  it('enforces 180s cooldown timer between consecutive interstitials', () => {
    // Complete 4 levels
    for (let i = 0; i < 4; i++) engine.onLevelCompleted();

    const t0 = 1000000;
    engine.recordInterstitialShown(t0);

    // Another 4 levels completed immediately (t0 + 30 seconds)
    for (let i = 0; i < 4; i++) engine.onLevelCompleted();

    const checkBlocked = engine.canShowInterstitial(t0 + 30 * 1000);
    expect(checkBlocked.allowed).toBe(false);
    expect(checkBlocked.reason).toContain('Cooldown active');

    // 181 seconds later
    const checkPassed = engine.canShowInterstitial(t0 + 181 * 1000);
    expect(checkPassed.allowed).toBe(true);
  });

  it('blocks interstitials completely if Remove Ads is purchased', () => {
    for (let i = 0; i < 10; i++) engine.onLevelCompleted();
    engine.setAdsRemoved(true);

    const check = engine.canShowInterstitial();
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Ads have been removed');
  });

  it('resets level counter when rewarded ad is watched to prevent back-to-back ads', () => {
    for (let i = 0; i < 3; i++) engine.onLevelCompleted();
    expect(engine.getLevelsCompletedSinceLastAd()).toBe(3);

    engine.onRewardedAdWatched();
    expect(engine.getLevelsCompletedSinceLastAd()).toBe(0);
  });
});
