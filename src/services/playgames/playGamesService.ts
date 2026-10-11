/**
 * Arrow Escape — Google Play Games Services & Achievements Bridge
 * Integrates achievements, XP rewards, and player profile persistence.
 */

import { resolveSaveConflict } from '../storage/progressStorage';

export interface PlayGamesAchievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly xp: number;
  readonly icon: string;
  readonly maxProgress: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface PlayGamesProfile {
  readonly playerId: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly isSignedIn: boolean;
  readonly totalXp: number;
}

const STORAGE_KEY = 'arrow_escape_play_games_achievements_v1';
const PROFILE_KEY = 'arrow_escape_play_games_profile_v1';

const DEFAULT_ACHIEVEMENTS: PlayGamesAchievement[] = [
  {
    id: 'first_escape',
    name: 'First Escape',
    description: 'Complete Level 1 of Arrow Escape',
    xp: 500,
    icon: '🎯',
    maxProgress: 1,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'pathfinder_10',
    name: 'Pathfinder',
    description: 'Clear 10 puzzle levels',
    xp: 1000,
    icon: '🧭',
    maxProgress: 10,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'core_master_30',
    name: 'Core Pack Master',
    description: 'Conquer all 30 hand-crafted core levels',
    xp: 2500,
    icon: '👑',
    maxProgress: 30,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'half_century_50',
    name: 'Half Century',
    description: 'Successfully complete 50 levels',
    xp: 5000,
    icon: '⚡',
    maxProgress: 50,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'century_club_100',
    name: 'Century Club',
    description: 'Reach and solve Level 100',
    xp: 10000,
    icon: '🌟',
    maxProgress: 100,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'flawless_mind',
    name: 'Flawless Mind',
    description: 'Earn 3 stars on at least 15 levels',
    xp: 3500,
    icon: '💎',
    maxProgress: 15,
    progress: 0,
    unlocked: false,
  },
  {
    id: 'grand_master_500',
    name: 'Grand Master 500',
    description: 'Conquer all 500 levels of Arrow Escape!',
    xp: 25000,
    icon: '🏆',
    maxProgress: 500,
    progress: 0,
    unlocked: false,
  },
];

class PlayGamesService {
  private achievements: PlayGamesAchievement[] = [];
  private profile: PlayGamesProfile = {
    playerId: 'G_847291048',
    displayName: 'ArrowPlayer#1337',
    isSignedIn: true,
    totalXp: 0,
  };

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const storedAch = localStorage.getItem(STORAGE_KEY);
      if (storedAch) {
        const parsed = JSON.parse(storedAch);
        this.achievements = DEFAULT_ACHIEVEMENTS.map(def => {
          const found = parsed.find((p: PlayGamesAchievement) => p.id === def.id);
          return found ? { ...def, ...found } : { ...def };
        });
      } else {
        this.achievements = DEFAULT_ACHIEVEMENTS.map(a => ({ ...a }));
      }

      const storedProf = localStorage.getItem(PROFILE_KEY);
      if (storedProf) {
        this.profile = JSON.parse(storedProf);
      }
      this.recalculateXp();
    } catch {
      this.achievements = DEFAULT_ACHIEVEMENTS.map(a => ({ ...a }));
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.achievements));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile));
    } catch {
      // Storage failure graceful handling
    }
  }

  private recalculateXp(): void {
    const earned = this.achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.xp, 0);
    this.profile = { ...this.profile, totalXp: earned };
  }

  public getProfile(): PlayGamesProfile {
    return { ...this.profile };
  }

  public getAchievements(): readonly PlayGamesAchievement[] {
    return [...this.achievements];
  }

  public syncProgressWithLevelRecords(completedLevelsCount: number, threeStarCount: number): {
    newlyUnlocked: PlayGamesAchievement[];
  } {
    const newlyUnlocked: PlayGamesAchievement[] = [];

    this.achievements.forEach(ach => {
      let targetProgress = ach.progress;

      if (ach.id === 'first_escape') {
        targetProgress = completedLevelsCount >= 1 ? 1 : 0;
      } else if (ach.id === 'pathfinder_10') {
        targetProgress = Math.min(completedLevelsCount, 10);
      } else if (ach.id === 'core_master_30') {
        targetProgress = Math.min(completedLevelsCount, 30);
      } else if (ach.id === 'half_century_50') {
        targetProgress = Math.min(completedLevelsCount, 50);
      } else if (ach.id === 'century_club_100') {
        targetProgress = Math.min(completedLevelsCount, 100);
      } else if (ach.id === 'flawless_mind') {
        targetProgress = Math.min(threeStarCount, 15);
      } else if (ach.id === 'grand_master_500') {
        targetProgress = Math.min(completedLevelsCount, 500);
      }

      ach.progress = targetProgress;

      if (!ach.unlocked && ach.progress >= ach.maxProgress) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(ach);
      }
    });

    this.recalculateXp();
    this.saveState();
    return { newlyUnlocked };
  }

  public toggleSignIn(): boolean {
    this.profile = {
      ...this.profile,
      isSignedIn: !this.profile.isSignedIn,
    };
    this.saveState();
    return this.profile.isSignedIn;
  }

  /**
   * Google Play Games Cloud Save (Saved Games API simulation)
   * Commits game progress snapshot to Google Play Games cloud storage.
   */
  public async saveToCloud(progress: any): Promise<{
    success: boolean;
    timestamp: number;
    snapshotId: string;
    account: string;
  }> {
    const timestamp = Date.now();
    const snapshotId = `gpsave_${timestamp}`;
    const payload = {
      snapshotId,
      timestamp,
      account: this.profile.displayName,
      progress,
    };

    try {
      localStorage.setItem('arrow_escape_google_play_cloud_save_v1', JSON.stringify(payload));
    } catch {
      // ignore
    }

    return {
      success: true,
      timestamp,
      snapshotId,
      account: this.profile.displayName,
    };
  }

  /**
   * Syncs local progress with cloud, resolving conflicts with Highest Progress Union
   */
  public async syncWithCloud(localProgress: any): Promise<{
    mergedProgress: any;
    resolvedConflict: boolean;
  }> {
    try {
      const raw = localStorage.getItem('arrow_escape_google_play_cloud_save_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.progress) {
          const merged = resolveSaveConflict(localProgress, parsed.progress);
          await this.saveToCloud(merged);
          return { mergedProgress: merged, resolvedConflict: true };
        }
      }
    } catch {
      // ignore
    }
    await this.saveToCloud(localProgress);
    return { mergedProgress: localProgress, resolvedConflict: false };
  }

  public getCloudSaveMetadata(): {
    isSynced: boolean;
    lastSavedTime: number | null;
    account: string;
  } {
    try {
      const raw = localStorage.getItem('arrow_escape_google_play_cloud_save_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          isSynced: true,
          lastSavedTime: parsed.timestamp || null,
          account: parsed.account || this.profile.displayName,
        };
      }
    } catch {
      // ignore
    }

    return {
      isSynced: false,
      lastSavedTime: null,
      account: this.profile.displayName,
    };
  }
}

export const playGamesService = new PlayGamesService();
