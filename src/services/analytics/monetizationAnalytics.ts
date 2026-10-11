/**
 * Arrow Escape — Monetization & Rewarded Ad Analytics Engine
 * Tracks aggregate ad performance, IAP conversion funnels, and ARPDAU.
 */

export type AdPlacement = 'hints' | 'past_daily' | 'bonus_xp';
export type ProductSku = 'remove_ads' | 'vip_pass';

const STORAGE_KEY = '@arrow_escape_monetization_analytics_v1';

export interface MonetizationRawState {
  rewardedAdsOffered: {
    total: number;
    byPlacement: Record<AdPlacement, number>;
  };
  rewardedAdsCompleted: {
    total: number;
    byPlacement: Record<AdPlacement, number>;
  };
  productsOffered: {
    remove_ads: number;
    vip_pass: number;
  };
  productsPurchased: {
    remove_ads: number;
    vip_pass: number;
  };
  activePlayerCount: number;
  activeDates: string[]; // YYYY-MM-DD
  totalRevenueUsd: number;
}

export interface MonetizationSummary {
  rewardedAdsOffered: number;
  rewardedAdsCompleted: number;
  avgRewardedPerActivePlayer: number;
  removeAdsOffered: number;
  removeAdsPurchased: number;
  removeAdsConversionPercent: number;
  vipPassOffered: number;
  vipPassPurchased: number;
  vipPassConversionPercent: number;
  activeDaysCount: number;
  totalRevenueUsd: number;
  arpdau: number;
  placements: Record<AdPlacement, { offered: number; completed: number }>;
}

const DEFAULT_STATE: MonetizationRawState = {
  rewardedAdsOffered: {
    total: 0,
    byPlacement: {
      hints: 0,
      past_daily: 0,
      bonus_xp: 0,
    },
  },
  rewardedAdsCompleted: {
    total: 0,
    byPlacement: {
      hints: 0,
      past_daily: 0,
      bonus_xp: 0,
    },
  },
  productsOffered: {
    remove_ads: 0,
    vip_pass: 0,
  },
  productsPurchased: {
    remove_ads: 0,
    vip_pass: 0,
  },
  activePlayerCount: 1,
  activeDates: [],
  totalRevenueUsd: 0,
};

class MonetizationAnalyticsService {
  private state: MonetizationRawState = { ...DEFAULT_STATE };
  private isLoaded: boolean = false;

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    if (typeof localStorage === 'undefined') {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.isLoaded = true;
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = {
          ...DEFAULT_STATE,
          ...parsed,
          rewardedAdsOffered: {
            ...DEFAULT_STATE.rewardedAdsOffered,
            ...(parsed.rewardedAdsOffered || {}),
            byPlacement: {
              ...DEFAULT_STATE.rewardedAdsOffered.byPlacement,
              ...(parsed.rewardedAdsOffered?.byPlacement || {}),
            },
          },
          rewardedAdsCompleted: {
            ...DEFAULT_STATE.rewardedAdsCompleted,
            ...(parsed.rewardedAdsCompleted || {}),
            byPlacement: {
              ...DEFAULT_STATE.rewardedAdsCompleted.byPlacement,
              ...(parsed.rewardedAdsCompleted?.byPlacement || {}),
            },
          },
          productsOffered: {
            ...DEFAULT_STATE.productsOffered,
            ...(parsed.productsOffered || {}),
          },
          productsPurchased: {
            ...DEFAULT_STATE.productsPurchased,
            ...(parsed.productsPurchased || {}),
          },
        };
      } else {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    } catch {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    this.isLoaded = true;
    this.recordDailyActive();
  }

  private saveState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // safe fallback
    }
  }

  /**
   * Tracks an active daily player visit.
   */
  public recordDailyActive(dateStr?: string): void {
    const today = dateStr || new Date().toISOString().split('T')[0];
    if (!this.state.activeDates.includes(today)) {
      this.state.activeDates.push(today);
      this.saveState();
    }
  }

  /**
   * Track rewarded ad presentation / offer.
   */
  public trackAdOffered(placement: AdPlacement): void {
    this.state.rewardedAdsOffered.total += 1;
    this.state.rewardedAdsOffered.byPlacement[placement] =
      (this.state.rewardedAdsOffered.byPlacement[placement] || 0) + 1;
    this.saveState();
  }

  /**
   * Track rewarded ad completion by player.
   */
  public trackAdCompleted(placement: AdPlacement): void {
    this.state.rewardedAdsCompleted.total += 1;
    this.state.rewardedAdsCompleted.byPlacement[placement] =
      (this.state.rewardedAdsCompleted.byPlacement[placement] || 0) + 1;
    // Estimated casual rewarded video eCPM (~$20/1000 = $0.02)
    this.state.totalRevenueUsd = Number((this.state.totalRevenueUsd + 0.02).toFixed(2));
    this.saveState();
  }

  /**
   * Track when a purchasable offer modal or card is presented.
   */
  public trackProductOffered(sku: ProductSku): void {
    this.state.productsOffered[sku] = (this.state.productsOffered[sku] || 0) + 1;
    this.saveState();
  }

  /**
   * Track when player completes an IAP purchase.
   */
  public trackProductPurchased(sku: ProductSku, priceUsd?: number): void {
    this.state.productsPurchased[sku] = (this.state.productsPurchased[sku] || 0) + 1;
    const defaultPrice = sku === 'remove_ads' ? 1.99 : 2.99;
    const amount = priceUsd !== undefined ? priceUsd : defaultPrice;
    this.state.totalRevenueUsd = Number((this.state.totalRevenueUsd + amount).toFixed(2));
    this.saveState();
  }

  /**
   * Returns calculated aggregate metrics summary.
   */
  public getMetricsSummary(): MonetizationSummary {
    const offered = this.state.rewardedAdsOffered.total;
    const completed = this.state.rewardedAdsCompleted.total;
    const activePlayers = Math.max(1, this.state.activePlayerCount);
    const activeDays = Math.max(1, this.state.activeDates.length);

    const removeAdsOffered = this.state.productsOffered.remove_ads;
    const removeAdsPurchased = this.state.productsPurchased.remove_ads;
    const removeAdsConversion =
      removeAdsOffered > 0
        ? Number(((removeAdsPurchased / removeAdsOffered) * 100).toFixed(1))
        : removeAdsPurchased > 0
        ? 100
        : 0;

    const vipPassOffered = this.state.productsOffered.vip_pass;
    const vipPassPurchased = this.state.productsPurchased.vip_pass;
    const vipPassConversion =
      vipPassOffered > 0
        ? Number(((vipPassPurchased / vipPassOffered) * 100).toFixed(1))
        : vipPassPurchased > 0
        ? 100
        : 0;

    const arpdau = Number((this.state.totalRevenueUsd / activeDays).toFixed(3));
    const avgRewarded = Number((completed / activePlayers).toFixed(2));

    return {
      rewardedAdsOffered: offered,
      rewardedAdsCompleted: completed,
      avgRewardedPerActivePlayer: avgRewarded,
      removeAdsOffered,
      removeAdsPurchased,
      removeAdsConversionPercent: removeAdsConversion,
      vipPassOffered,
      vipPassPurchased,
      vipPassConversionPercent: vipPassConversion,
      activeDaysCount: activeDays,
      totalRevenueUsd: this.state.totalRevenueUsd,
      arpdau,
      placements: {
        hints: {
          offered: this.state.rewardedAdsOffered.byPlacement.hints,
          completed: this.state.rewardedAdsCompleted.byPlacement.hints,
        },
        past_daily: {
          offered: this.state.rewardedAdsOffered.byPlacement.past_daily,
          completed: this.state.rewardedAdsCompleted.byPlacement.past_daily,
        },
        bonus_xp: {
          offered: this.state.rewardedAdsOffered.byPlacement.bonus_xp,
          completed: this.state.rewardedAdsCompleted.byPlacement.bonus_xp,
        },
      },
    };
  }

  /**
   * Resets metrics (used for test isolation).
   */
  public resetMetrics(): void {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // safe fallback
      }
    }
  }
}

export const monetizationAnalytics = new MonetizationAnalyticsService();
