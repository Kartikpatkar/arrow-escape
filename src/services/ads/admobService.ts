/**
 * Arrow Escape — AdMob Service Bridge
 * Coordinates rewarded ad grants and interstitial presentation via AdsPacingEngine.
 */

import { AdReward, IAdsService } from './adsInterface';
import { AdsPacingEngine, DEFAULT_ADS_CONFIG } from './adsPacingEngine';
import { updateHintsAvailable } from '../storage/progressStorage';

let AdMob: any = null;
let BannerAdSize: any = null;
let BannerAdPosition: any = null;
let RewardAdPluginEvents: any = null;

try {
  const admobPlugin = require('@capacitor-community/admob');
  AdMob = admobPlugin.AdMob;
  BannerAdSize = admobPlugin.BannerAdSize;
  BannerAdPosition = admobPlugin.BannerAdPosition;
  RewardAdPluginEvents = admobPlugin.RewardAdPluginEvents;
} catch {
  // Web or headless environment
}

// Production AdMob Ad Unit IDs for Arrow Escape (Android)
export const AD_UNIT_IDS = {
  BANNER: 'ca-app-pub-8070501881159460/1264381052',
  INTERSTITIAL: 'ca-app-pub-8070501881159460/6551357596',
  REWARDED: 'ca-app-pub-8070501881159460/8951299388',
};

export class AdMobService implements IAdsService {
  private pacingEngine: AdsPacingEngine;
  private isRewardedLoaded: boolean = true;
  private _isInterstitialLoaded: boolean = true;
  private onShowInterstitialModal: (() => Promise<void>) | null = null;
  private onShowRewardedModal: (() => Promise<boolean>) | null = null;
  private isNativeAdMobInitialized: boolean = false;
  private isBannerShowing: boolean = false;

  constructor() {
    this.pacingEngine = new AdsPacingEngine(DEFAULT_ADS_CONFIG);
    this.initNativeAdMob();
  }

  private async initNativeAdMob(): Promise<void> {
    if (!AdMob) return;
    try {
      await AdMob.initialize({
        testingDevices: ['EMULATOR'],
        initializeForTesting: true,
      });
      this.isNativeAdMobInitialized = true;
      await this.preloadInterstitial();
      await this.preloadRewarded();
    } catch (e) {
      console.warn('[AdMobService] Native initialize skipped / fallback:', e);
    }
  }

  private async preloadInterstitial(): Promise<void> {
    if (!this.isNativeAdMobInitialized || !AdMob) return;
    try {
      await AdMob.prepareInterstitial({
        adId: AD_UNIT_IDS.INTERSTITIAL,
        isTesting: true,
      });
    } catch (e) {
      console.warn('[AdMobService] prepareInterstitial failed:', e);
    }
  }

  private async preloadRewarded(): Promise<void> {
    if (!this.isNativeAdMobInitialized || !AdMob) return;
    try {
      await AdMob.prepareRewardVideoAd({
        adId: AD_UNIT_IDS.REWARDED,
        isTesting: true,
      });
    } catch (e) {
      console.warn('[AdMobService] prepareRewardVideoAd failed:', e);
    }
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
    if (removed && this.isBannerShowing) {
      this.hideBanner();
    }
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

  public async showBanner(): Promise<void> {
    if (!this.isNativeAdMobInitialized || !AdMob || this.isAdsRemoved()) return;
    try {
      await AdMob.showBanner({
        adId: AD_UNIT_IDS.BANNER,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        isTesting: true,
      });
      this.isBannerShowing = true;
    } catch (e) {
      console.warn('[AdMobService] showBanner failed:', e);
    }
  }

  public async hideBanner(): Promise<void> {
    if (!this.isNativeAdMobInitialized || !AdMob) return;
    try {
      await AdMob.hideBanner();
      this.isBannerShowing = false;
    } catch (e) {
      console.warn('[AdMobService] hideBanner error:', e);
    }
  }

  /**
   * Triggers voluntary rewarded video ad.
   * On successful view, grants +1 Hint.
   */
  public async showRewardedAd(): Promise<AdReward | null> {
    if (this.isNativeAdMobInitialized && AdMob) {
      try {
        const reward = await AdMob.showRewardVideoAd();
        if (reward) {
          this.recordRewardedAdWatched();
          await updateHintsAvailable(1);
          await this.preloadRewarded();
          return { type: 'hint', amount: 1 };
        }
      } catch (e) {
        console.warn('[AdMobService] Native rewarded ad failed, falling back to UI modal:', e);
      }
    }

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

    let showed = false;
    if (this.isNativeAdMobInitialized && AdMob) {
      try {
        await AdMob.showInterstitial();
        showed = true;
        await this.preloadInterstitial();
      } catch (e) {
        console.warn('[AdMobService] Native interstitial failed, using fallback:', e);
      }
    }

    if (!showed && this.onShowInterstitialModal) {
      await this.onShowInterstitialModal();
      showed = true;
    }

    this.pacingEngine.recordInterstitialShown();
    return true;
  }

  public getPacingEngine(): AdsPacingEngine {
    return this.pacingEngine;
  }
}

export const admobService = new AdMobService();
