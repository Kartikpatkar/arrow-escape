/**
 * Monetization & Rewarded Ad Analytics Unit Tests
 */

import { monetizationAnalytics } from '../../src/services/analytics/monetizationAnalytics';

describe('Monetization & Rewarded Ad Analytics', () => {
  beforeEach(() => {
    monetizationAnalytics.resetMetrics();
  });

  it('initializes with zero counters and tracks ad offers & completions', () => {
    let summary = monetizationAnalytics.getMetricsSummary();
    expect(summary.rewardedAdsOffered).toBe(0);
    expect(summary.rewardedAdsCompleted).toBe(0);
    expect(summary.avgRewardedPerActivePlayer).toBe(0);

    monetizationAnalytics.trackAdOffered('hints');
    monetizationAnalytics.trackAdOffered('hints');
    monetizationAnalytics.trackAdCompleted('hints');

    summary = monetizationAnalytics.getMetricsSummary();
    expect(summary.rewardedAdsOffered).toBe(2);
    expect(summary.rewardedAdsCompleted).toBe(1);
    expect(summary.placements.hints.offered).toBe(2);
    expect(summary.placements.hints.completed).toBe(1);
    expect(summary.avgRewardedPerActivePlayer).toBe(1);
  });

  it('tracks placement breakdown for hints, past_daily, and bonus_xp', () => {
    monetizationAnalytics.trackAdOffered('past_daily');
    monetizationAnalytics.trackAdCompleted('past_daily');

    monetizationAnalytics.trackAdOffered('bonus_xp');
    monetizationAnalytics.trackAdCompleted('bonus_xp');

    const summary = monetizationAnalytics.getMetricsSummary();
    expect(summary.placements.past_daily.completed).toBe(1);
    expect(summary.placements.bonus_xp.completed).toBe(1);
    expect(summary.rewardedAdsCompleted).toBe(2);
  });

  it('computes Remove Ads and VIP Pass conversion rates accurately', () => {
    // 4 times offered Remove Ads, 1 purchased
    monetizationAnalytics.trackProductOffered('remove_ads');
    monetizationAnalytics.trackProductOffered('remove_ads');
    monetizationAnalytics.trackProductOffered('remove_ads');
    monetizationAnalytics.trackProductOffered('remove_ads');
    monetizationAnalytics.trackProductPurchased('remove_ads', 1.99);

    // 2 times offered VIP Pass, 1 purchased
    monetizationAnalytics.trackProductOffered('vip_pass');
    monetizationAnalytics.trackProductOffered('vip_pass');
    monetizationAnalytics.trackProductPurchased('vip_pass', 2.99);

    const summary = monetizationAnalytics.getMetricsSummary();
    expect(summary.removeAdsOffered).toBe(4);
    expect(summary.removeAdsPurchased).toBe(1);
    expect(summary.removeAdsConversionPercent).toBe(25);

    expect(summary.vipPassOffered).toBe(2);
    expect(summary.vipPassPurchased).toBe(1);
    expect(summary.vipPassConversionPercent).toBe(50);
  });

  it('calculates total revenue and ARPDAU', () => {
    monetizationAnalytics.recordDailyActive('2026-10-10');
    monetizationAnalytics.recordDailyActive('2026-10-11');

    monetizationAnalytics.trackProductPurchased('vip_pass', 2.99);
    monetizationAnalytics.trackAdCompleted('hints'); // +0.02

    const summary = monetizationAnalytics.getMetricsSummary();
    expect(summary.totalRevenueUsd).toBeCloseTo(3.01, 2);
    expect(summary.activeDaysCount).toBeGreaterThanOrEqual(2);
    expect(summary.arpdau).toBeGreaterThan(0);
  });
});
