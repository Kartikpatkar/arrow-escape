/**
 * Arrow Escape — Interstitial Ads Pacing Engine
 * Enforces strict frequency caps and player-first fairness rules.
 */

import { AdsServiceConfig } from './adsInterface';

export const DEFAULT_ADS_CONFIG: AdsServiceConfig = {
  interstitialLevelInterval: 4, // at least 4 completed levels between interstitials
  interstitialCooldownSeconds: 180, // 3 minutes cooldown between interstitials
  maxRewardedPerSession: 5,
};

export class AdsPacingEngine {
  private config: AdsServiceConfig;
  private lastInterstitialTimestamp: number = 0;
  private lastRewardedTimestamp: number = 0;
  private levelsCompletedSinceLastAd: number = 0;
  private adsRemoved: boolean = false;

  constructor(config: AdsServiceConfig = DEFAULT_ADS_CONFIG) {
    this.config = config;
  }

  public setAdsRemoved(removed: boolean): void {
    this.adsRemoved = removed;
  }

  public isAdsRemoved(): boolean {
    return this.adsRemoved;
  }

  public onLevelCompleted(): void {
    this.levelsCompletedSinceLastAd++;
  }

  public onRewardedAdWatched(): void {
    this.lastRewardedTimestamp = Date.now();
    // Reset interstitial counter so player is never shown an interstitial after a rewarded ad
    this.levelsCompletedSinceLastAd = 0;
  }

  /**
   * Evaluates all 4 gating criteria before permitting an interstitial:
   * 1. Player has not purchased "Remove Ads"
   * 2. Player has completed at least interstitialLevelInterval levels
   * 3. At least interstitialCooldownSeconds have passed since last interstitial
   * 4. Player did not just watch a rewarded ad
   */
  public canShowInterstitial(now: number = Date.now()): { allowed: boolean; reason?: string } {
    if (this.adsRemoved) {
      return { allowed: false, reason: 'Ads have been removed via purchase' };
    }

    if (this.levelsCompletedSinceLastAd < this.config.interstitialLevelInterval) {
      return {
        allowed: false,
        reason: `Need ${this.config.interstitialLevelInterval} levels, current: ${this.levelsCompletedSinceLastAd}`,
      };
    }

    const secondsSinceLastInterstitial = (now - this.lastInterstitialTimestamp) / 1000;
    if (this.lastInterstitialTimestamp > 0 && secondsSinceLastInterstitial < this.config.interstitialCooldownSeconds) {
      return {
        allowed: false,
        reason: `Cooldown active: ${Math.ceil(this.config.interstitialCooldownSeconds - secondsSinceLastInterstitial)}s remaining`,
      };
    }

    // Rewarded ad cooldown: do not show interstitial within 120s of a rewarded ad
    const secondsSinceLastRewarded = (now - this.lastRewardedTimestamp) / 1000;
    if (this.lastRewardedTimestamp > 0 && secondsSinceLastRewarded < 120) {
      return {
        allowed: false,
        reason: 'Rewarded ad recently watched',
      };
    }

    return { allowed: true };
  }

  public recordInterstitialShown(now: number = Date.now()): void {
    this.lastInterstitialTimestamp = now;
    this.levelsCompletedSinceLastAd = 0;
  }

  public getLevelsCompletedSinceLastAd(): number {
    return this.levelsCompletedSinceLastAd;
  }
}
