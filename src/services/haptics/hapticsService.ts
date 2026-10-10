/**
 * Arrow Escape — Tactile Haptics Service
 * Provides physical haptic feedback on devices supporting Vibration API.
 */

class HapticsService {
  private isEnabled: boolean = true;

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Crisp light tap when arrow escapes
   */
  public vibrateLight(): void {
    if (!this.isEnabled) return;
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      if (nav && typeof nav.vibrate === 'function') {
        nav.vibrate(15);
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Double buzz warning when arrow is blocked
   */
  public vibrateWarning(): void {
    if (!this.isEnabled) return;
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      if (nav && typeof nav.vibrate === 'function') {
        nav.vibrate([25, 35, 25]);
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Celebration vibration on level completion
   */
  public vibrateSuccess(): void {
    if (!this.isEnabled) return;
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      if (nav && typeof nav.vibrate === 'function') {
        nav.vibrate([30, 40, 30, 40, 60]);
      }
    } catch (e) {
      // ignore
    }
  }
}

export const hapticsService = new HapticsService();
