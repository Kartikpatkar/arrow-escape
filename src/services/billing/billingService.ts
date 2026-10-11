/**
 * Arrow Escape — In-App Billing Service (Google Play Billing / IAP)
 * Manages one-time non-consumable "Remove Ads" purchase.
 */

import { saveUserProgress, loadUserProgress } from '../storage/progressStorage';

export const REMOVE_ADS_SKU = 'arrow_escape_remove_ads_tier1';
export const COSMETICS_VIP_SKU = 'arrow_escape_cosmetics_vip_pack';

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

export const COSMETICS_VIP_PRODUCT: BillingProduct = {
  sku: COSMETICS_VIP_SKU,
  title: 'VIP Cosmetics Vault Pack',
  description: 'Instantly unlock all Arrow Skins, Board Themes & Escape Effects',
  price: '$2.99',
};

class BillingService {
  private adsRemoved: boolean = false;
  private cosmeticsVip: boolean = false;

  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    const progress = await loadUserProgress();
    this.adsRemoved = !!progress.adsRemoved;
    this.cosmeticsVip = !!progress.cosmeticsVipUnlocked;
  }

  public isAdsRemoved(): boolean {
    return this.adsRemoved;
  }

  public isCosmeticsVip(): boolean {
    return this.cosmeticsVip;
  }

  /**
   * Executes purchase of Remove Ads product.
   */
  public async purchaseRemoveAds(): Promise<{ success: boolean; error?: string }> {
    try {
      this.adsRemoved = true;
      await saveUserProgress({ adsRemoved: true });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Purchase failed' };
    }
  }

  /**
   * Executes purchase of VIP Cosmetics Vault Pack.
   */
  public async purchaseCosmeticsVip(): Promise<{ success: boolean; error?: string }> {
    try {
      this.cosmeticsVip = true;
      await saveUserProgress({ cosmeticsVipUnlocked: true });
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
    this.cosmeticsVip = !!progress.cosmeticsVipUnlocked;
    return { restored: this.adsRemoved || this.cosmeticsVip };
  }
}

export const billingService = new BillingService();

