/**
 * Arrow Escape — AdMob Service Bridge
 * Coordinates rewarded ad grants and interstitial presentation via AdsPacingEngine.
 */

import { AdReward, IAdsService } from './adsInterface';
import { AdsPacingEngine, DEFAULT_ADS_CONFIG } from './adsPacingEngine';
import { updateHintsAvailable } from '../storage/progressStorage';

export class AdMobService implements IAdsService {
  private pacingEngine: AdsPacingEngine;
  private isRewardedLoaded: boolean = true;
  private _isInterstitialLoaded: boolean = true;
  private onShowInterstitialModal: (() => Promise<void>) | null = null;
  private onShowRewardedModal: (() => Promise<boolean>) | null = null;

  constructor() {
    this.pacingEngine = new AdsPacingEngine(DEFAULT_ADS_CONFIG);
  }

  public setUIBridges(
    showInterstitial: () => Promise<void>,
    showRewarded: () => Promise<boolean>
  ): void {
    this.onShowInterstitialModal = showInterstitial;
    this.onShowRewardedModal = showRewarded;
  }

  public isRewardedAdLoaded(): boolean {
    return this.isRewardedLoaded;
  }

  public isInterstitialLoaded(): boolean {
    return this._isInterstitialLoaded;
  }

  public setAdsRemoved(removed: boolean): void {
    this.pacingEngine.setAdsRemoved(removed);
  }

  public isAdsRemoved(): boolean {
    return this.pacingEngine.isAdsRemoved();
  }

  public onLevelCompleted(): void {
    this.pacingEngine.onLevelCompleted();
  }

  public recordRewardedAdWatched(): void {
    this.pacingEngine.onRewardedAdWatched();
  }

  /**
   * Triggers voluntary rewarded video ad.
   * On successful view, grants +1 Hint.
   */
  public async showRewardedAd(): Promise<AdReward | null> {
    if (this.onShowRewardedModal) {
      const completed = await this.onShowRewardedModal();
      if (completed) {
        this.recordRewardedAdWatched();
        await updateHintsAvailable(1);
        return { type: 'hint', amount: 1 };
      }
      return null;
    }

    // Default auto-grant for headless tests
    this.recordRewardedAdWatched();
    await updateHintsAvailable(1);
    return { type: 'hint', amount: 1 };
  }

  /**
   * Attempts to show an interstitial ad according to pacing rules.
   */
  public async showInterstitialIfAllowed(): Promise<boolean> {
    const check = this.pacingEngine.canShowInterstitial();
    if (!check.allowed) {
      return false;
    }

    if (this.onShowInterstitialModal) {
      await this.onShowInterstitialModal();
    }

    this.pacingEngine.recordInterstitialShown();
    return true;
  }

  public getPacingEngine(): AdsPacingEngine {
    return this.pacingEngine;
  }
}

export const admobService = new AdMobService();
