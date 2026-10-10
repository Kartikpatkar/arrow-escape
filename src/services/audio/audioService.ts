/**
 * Arrow Escape — Low-Latency Procedural Audio Service
 * Uses WebAudio API for instantaneous synthesized SFX without network asset lag.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.initContext();
  }

  private initContext(): void {
    try {
      const AudioCtx = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      // Audio not supported in this environment
    }
  }

  private ensureUnlocked(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Crisp, tactile pop when an arrow escapes.
   * Pitch dynamically ascends with consecutive combo escapes.
   */
  public playEscapePop(comboIndex: number = 0): void {
    if (!this.isEnabled || !this.ctx) return;
    this.ensureUnlocked();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 480;
      // Musical pentatonic scale pitch intervals: 0, 2, 4, 7, 9, 12 semitones
      const intervals = [0, 2, 4, 7, 9, 12, 14, 16];
      const semitone = intervals[Math.min(comboIndex, intervals.length - 1)];
      const freq = baseFreq * Math.pow(2, semitone / 12);

      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Muted wooden 'thump' when an arrow is blocked.
   */
  public playBlockedThud(): void {
    if (!this.isEnabled || !this.ctx) return;
    this.ensureUnlocked();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Shimmering bell chime when hint is revealed.
   */
  public playHintChime(): void {
    if (!this.isEnabled || !this.ctx) return;
    this.ensureUnlocked();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.31);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Major triad fanfare arpeggio on level completion.
   */
  public playVictoryFanfare(): void {
    if (!this.isEnabled || !this.ctx) return;
    this.ensureUnlocked();

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Subtle UI click for buttons.
   */
  public playClick(): void {
    if (!this.isEnabled || !this.ctx) return;
    this.ensureUnlocked();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // ignore
    }
  }
}

export const audioService = new AudioService();
