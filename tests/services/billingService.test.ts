import { billingService, REMOVE_ADS_PRODUCT } from '../../src/services/billing/billingService';
import { resetAllProgress } from '../../src/services/storage/progressStorage';

describe('In-App Billing Service', () => {
  beforeEach(async () => {
    await resetAllProgress();
    await billingService.init();
  });

  it('exposes standard Remove Ads product metadata', () => {
    expect(REMOVE_ADS_PRODUCT.sku).toBe('arrow_escape_remove_ads_tier1');
    expect(REMOVE_ADS_PRODUCT.price).toBe('$1.99');
  });

  it('reports adsRemoved as false initially', () => {
    expect(billingService.isAdsRemoved()).toBe(false);
  });

  it('successfully purchases Remove Ads and enables entitlement', async () => {
    const result = await billingService.purchaseRemoveAds();
    expect(result.success).toBe(true);
    expect(billingService.isAdsRemoved()).toBe(true);
  });

  it('restores purchases accurately', async () => {
    await billingService.purchaseRemoveAds();
    const restoreResult = await billingService.restorePurchases();
    expect(restoreResult.restored).toBe(true);
  });
});
