import {
  billingService,
  REMOVE_ADS_PRODUCT,
  COSMETICS_VIP_PRODUCT,
} from '../../src/services/billing/billingService';
import { resetAllProgress } from '../../src/services/storage/progressStorage';
import { admobService } from '../../src/services/ads/admobService';

describe('In-App Billing Service', () => {
  beforeEach(async () => {
    await resetAllProgress();
    await billingService.init();
    admobService.setAdsRemoved(false);
  });

  it('exposes standard Remove Ads and VIP Vault product metadata', () => {
    expect(REMOVE_ADS_PRODUCT.sku).toBe('arrow_escape_remove_ads_tier1');
    expect(REMOVE_ADS_PRODUCT.price).toBe('$1.99');
    expect(COSMETICS_VIP_PRODUCT.sku).toBe('arrow_escape_cosmetics_vip_pack');
    expect(COSMETICS_VIP_PRODUCT.price).toBe('$2.99');
  });

  it('reports adsRemoved and cosmeticsVip as false initially', () => {
    expect(billingService.isAdsRemoved()).toBe(false);
    expect(billingService.isCosmeticsVip()).toBe(false);
  });

  it('successfully purchases Remove Ads and enables entitlement', async () => {
    const result = await billingService.purchaseRemoveAds();
    expect(result.success).toBe(true);
    expect(billingService.isAdsRemoved()).toBe(true);
  });

  it('successfully purchases VIP Cosmetics Vault and enables entitlement', async () => {
    const result = await billingService.purchaseCosmeticsVip();
    expect(result.success).toBe(true);
    expect(billingService.isCosmeticsVip()).toBe(true);
  });

  it('restores purchases accurately', async () => {
    await billingService.purchaseRemoveAds();
    const restoreResult = await billingService.restorePurchases();
    expect(restoreResult.restored).toBe(true);
  });

  it('preserves voluntary rewarded ads after Remove Ads purchase', async () => {
    await billingService.purchaseRemoveAds();
    admobService.setAdsRemoved(true);

    // Interstitials blocked by Remove Ads
    const canShowInterstitial = admobService.getPacingEngine().canShowInterstitial();
    expect(canShowInterstitial.allowed).toBe(false);
    expect(canShowInterstitial.reason).toContain('Ads have been removed');

    // Rewarded ad still available for optional hints/gifts
    const rewardedResult = await admobService.showRewardedAd();
    expect(rewardedResult).not.toBeNull();
    expect(rewardedResult?.amount).toBe(1);
  });
});

