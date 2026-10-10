/**
 * Arrow Escape — Advertising Service Interface
 */

export interface AdReward {
  type: 'hint';
  amount: number;
}

export interface AdsServiceConfig {
  interstitialLevelInterval: number; // minimum levels completed between interstitials (e.g. 4)
  interstitialCooldownSeconds: number; // minimum seconds between interstitials (e.g. 180s)
  maxRewardedPerSession: number;
}

export interface IAdsService {
  isRewardedAdLoaded(): boolean;
  isInterstitialLoaded(): boolean;
  showRewardedAd(): Promise<AdReward | null>;
  showInterstitialIfAllowed(levelsCompletedSinceLast: number): Promise<boolean>;
  recordRewardedAdWatched(): void;
  setAdsRemoved(removed: boolean): void;
}
