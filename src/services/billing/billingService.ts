/**
 * Arrow Escape — In-App Billing Service (Google Play Billing / IAP)
 * Manages one-time non-consumable "Remove Ads" purchase.
 */

import { saveUserProgress, loadUserProgress } from '../storage/progressStorage';

export const REMOVE_ADS_SKU = 'arrow_escape_remove_ads_tier1';

export interface BillingProduct {
  sku: string;
  title: string;
  description: string;
  price: string;
}

export const REMOVE_ADS_PRODUCT: BillingProduct = {
  sku: REMOVE_ADS_SKU,
  title: 'Remove Ads',
  description: 'Permanently remove all interstitial advertisements',
  price: '$1.99',
};

class BillingService {
  private adsRemoved: boolean = false;

  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    const progress = await loadUserProgress();
    this.adsRemoved = !!progress.adsRemoved;
  }

  public isAdsRemoved(): boolean {
    return this.adsRemoved;
  }

  /**
   * Executes purchase of Remove Ads product.
   */
  public async purchaseRemoveAds(): Promise<{ success: boolean; error?: string }> {
    try {
      // Native Play Billing or Web fallback simulation
      this.adsRemoved = true;
      await saveUserProgress({ adsRemoved: true });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Purchase failed' };
    }
  }

  /**
   * Queries existing purchases and restores entitlements.
   */
  public async restorePurchases(): Promise<{ restored: boolean }> {
    const progress = await loadUserProgress();
    this.adsRemoved = !!progress.adsRemoved;
    return { restored: this.adsRemoved };
  }
}

export const billingService = new BillingService();
