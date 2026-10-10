/**
 * Arrow Escape — Local Notifications Service
 * Schedules engaging daily reminders for player retention.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { dailyChallengeService } from '../daily/dailyChallengeService';

export interface NotificationStatus {
  granted: boolean;
  scheduledCount: number;
}

const NOTIFICATION_IDS = {
  DAILY_MORNING: 101,
  DAILY_EVENING: 102,
};

const ENGAGING_REMINDERS = [
  {
    title: '🏹 Daily Puzzle Ready!',
    body: "Today's maze puzzle is live. Can you solve it in 3 stars?",
  },
  {
    title: '🔥 Keep Your Streak Alive!',
    body: "Don't let your daily streak cool down. 2 minutes to glory!",
  },
  {
    title: '🧠 Daily Brain Exercise',
    body: "Arrow Escape Daily Challenge #Ready. Train your spatial logic today!",
  },
];

class NotificationService {
  private isSupported: boolean = true;

  constructor() {
    this.checkPlatformSupport();
  }

  private checkPlatformSupport(): void {
    try {
      this.isSupported = typeof window !== 'undefined';
    } catch {
      this.isSupported = false;
    }
  }

  /**
   * Requests permission to send notifications across Native and Web.
   */
  public async requestPermission(): Promise<boolean> {
    try {
      // 1. Try Capacitor Native LocalNotifications
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        await this.scheduleDailyReminders();
        dailyChallengeService.setNotificationsEnabled(true);
        return true;
      }
    } catch {
      // 2. Fallback to Web standard Notification API
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const webPerm = await Notification.requestPermission();
        if (webPerm === 'granted') {
          dailyChallengeService.setNotificationsEnabled(true);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Schedules repeating daily reminders at 10:00 AM and 18:00 (6:00 PM).
   */
  public async scheduleDailyReminders(): Promise<void> {
    const state = dailyChallengeService.getState();
    if (!state.notificationsEnabled) return;

    try {
      // Clear previous notifications
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_IDS.DAILY_MORNING },
          { id: NOTIFICATION_IDS.DAILY_EVENING },
        ],
      });

      const randomReminder =
        ENGAGING_REMINDERS[Math.floor(Math.random() * ENGAGING_REMINDERS.length)];

      const streak = state.currentStreak;
      const streakText = streak > 0 ? `🔥 ${streak}-day streak at stake!` : 'Start your streak!';

      const now = new Date();
      const morningTarget = new Date();
      morningTarget.setHours(10, 0, 0, 0);
      if (morningTarget.getTime() <= now.getTime()) {
        morningTarget.setDate(morningTarget.getDate() + 1);
      }

      const eveningTarget = new Date();
      eveningTarget.setHours(18, 0, 0, 0);
      if (eveningTarget.getTime() <= now.getTime()) {
        eveningTarget.setDate(eveningTarget.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: NOTIFICATION_IDS.DAILY_MORNING,
            title: randomReminder.title,
            body: `${randomReminder.body} (${streakText})`,
            schedule: { at: morningTarget, repeats: true },
            sound: 'beep.wav',
            smallIcon: 'ic_launcher_round',
          },
          {
            id: NOTIFICATION_IDS.DAILY_EVENING,
            title: '🏹 Evening Puzzle Break',
            body: `Unwind with today's Arrow Escape. ${streakText}`,
            schedule: { at: eveningTarget, repeats: true },
            sound: 'beep.wav',
            smallIcon: 'ic_launcher_round',
          },
        ],
      });
    } catch {
      // Non-blocking fallback for web environments
    }
  }

  /**
   * Cancels scheduled reminders if disabled by player.
   */
  public async cancelReminders(): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_IDS.DAILY_MORNING },
          { id: NOTIFICATION_IDS.DAILY_EVENING },
        ],
      });
    } catch {
      // Safe noop
    }
  }
}

export const notificationService = new NotificationService();
