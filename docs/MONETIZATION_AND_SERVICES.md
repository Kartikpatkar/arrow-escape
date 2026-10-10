# Arrow Escape — Monetization & Services Specification

## 1. Monetization Architecture

The monetization philosophy is **Player-First Hybrid F2P**:
- Ads should never interrupt a player mid-puzzle.
- Rewarded video ads are 100% voluntary and reward real utility (Hints).
- Interstitials are paced with strict frequency caps and cooldowns.
- "Remove Ads" one-time IAP provides an ad-free experience for interstitial ads.

---

## 2. Advertising Rules & Pacing Engine

```
                                  Level Completed
                                         │
                                         ▼
                             Is "Remove Ads" active?
                                   │           │
                                 (Yes)        (No)
                                   │           │
                             Skip Ad Loop      ▼
                                       Has player watched a
                                     Rewarded Ad this session?
                                        │ (Cooldown active)
                                       (Yes) ──► Reset Interstitial Counter & Skip
                                        │ (No)
                                        ▼
                               Have ≥ 4 levels passed
                                since last Interstitial?
                                        │           │
                                      (No)        (Yes)
                                        │           │
                                   Increment        ▼
                                    Counter    Has ≥ 180s elapsed
                                   and Skip     since last ad?
                                                    │           │
                                                  (No)        (Yes)
                                                    │           │
                                                   Skip    Show Interstitial
                                                           & Reset Timers
```

### 2.1 Ad Formats & Configurations

| Ad Type | Trigger Event | Reward | Cooldown / Restrictions |
|---|---|---|---|
| **Rewarded Video** | User taps "Hint" when hint bank = 0 | +1 Free Hint (immediately applied) | Max 3 rewarded views per 15 minutes to prevent spamming. |
| **Interstitial Ad** | Level completion transition | None (Progression transition) | Minimum 4 levels completed AND $\ge 180$ seconds since last full-screen ad. **Never** shown immediately following a rewarded ad view. |
| **Banner Ad** | Bottom of Level Select screen (Optional) | N/A | Excluded from the active gameplay screen to maximize playfield focus and avoid accidental touches. |

---

## 3. In-App Purchases (IAP) Specification

### 3.1 Product Catalog
- **SKU ID:** `arrow_escape_remove_ads_tier1`
- **Product Type:** Non-consumable (One-Time In-App Purchase)
- **Target Price:**
  - India: ₹99 – ₹149 INR
  - US / Global: $1.99 – $2.99 USD
- **Entitlements:**
  - Instantly disables all interstitial ads and banner ads permanently.
  - Keeps Rewarded Ads active (purely opt-in for players who want extra hints without paying for consumables).
  - Unlocks an exclusive "Ad-Free Supporter" badge or theme accent.

### 3.2 Purchase Flow & Restoration
1. User taps "Remove Ads" button in Settings or Level Select.
2. App queries Google Play Billing via `purchaseService.buyRemoveAds()`.
3. Native Google Play bottom sheet opens.
4. On success:
   - Verify purchase signature locally.
   - Set `entitlements.adsRemoved = true` in local persistence.
   - Immediately refresh UI and dismiss ad containers.
5. **Restore Purchases:** Mandatory "Restore Purchases" button in Settings queries active purchases from Google Play Billing and re-enables `adsRemoved` on clean installs or new devices.

---

## 4. Privacy, Offline Fallback & Compliance

### 4.1 Zero-Penalty Offline Play
- Arrow Escape functions completely offline with zero network connectivity.
- When offline:
  - Ads services gracefully report `AdNotAvailable`.
  - Hint button allows using accumulated hints.
  - If 0 hints remain offline, a gentle message appears: *"Connect to internet to watch an ad for a hint."*
  - All progression, stars, and level unlocks save locally to storage.

### 4.2 Play Store Compliance & Consent
- **Google Mobile Ads Consent SDK (UMP):** Integrated for GDPR / UK / EEA compliance dialogs on initial launch where required.
- **COPPA / Families Policy:** Tag for child-directed treatment configured according to Google Play target audience declarations.
