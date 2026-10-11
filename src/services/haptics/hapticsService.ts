/**
 * Arrow Escape — Tactile Haptics Service
 * Provides real hardware haptic feedback using @capacitor/haptics with Vibration API fallback.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

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
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
        this.fallbackVibrate(15);
      });
    } catch {
      this.fallbackVibrate(15);
    }
  }

  /**
   * Double buzz warning when arrow is blocked
   */
  public vibrateWarning(): void {
    if (!this.isEnabled) return;
    try {
      Haptics.notification({ type: NotificationType.Warning }).catch(() => {
        this.fallbackVibrate([25, 35, 25]);
      });
    } catch {
      this.fallbackVibrate([25, 35, 25]);
    }
  }

  /**
   * Celebration vibration on level completion
   */
  public vibrateSuccess(): void {
    if (!this.isEnabled) return;
    try {
      Haptics.notification({ type: NotificationType.Success }).catch(() => {
        this.fallbackVibrate([30, 40, 30, 40, 60]);
      });
    } catch {
      this.fallbackVibrate([30, 40, 30, 40, 60]);
    }
  }

  private fallbackVibrate(pattern: number | number[]): void {
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      if (nav && typeof nav.vibrate === 'function') {
        nav.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  }
}

export const hapticsService = new HapticsService();
