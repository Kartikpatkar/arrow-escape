import { audioService } from '../../src/services/audio/audioService';

describe('Audio Service', () => {
  beforeEach(() => {
    audioService.setEnabled(true);
  });

  it('toggles audio enabled state correctly', () => {
    expect(audioService.getEnabled()).toBe(true);

    audioService.setEnabled(false);
    expect(audioService.getEnabled()).toBe(false);

    audioService.setEnabled(true);
    expect(audioService.getEnabled()).toBe(true);
  });

  it('safely handles playback methods without crashing in Node/headless environment', () => {
    expect(() => {
      audioService.playEscapePop(0);
      audioService.playEscapePop(3);
      audioService.playBlockedThud();
      audioService.playHintChime();
      audioService.playVictoryFanfare();
      audioService.playClick();
    }).not.toThrow();
  });

  it('no-ops silently when disabled', () => {
    audioService.setEnabled(false);
    expect(() => {
      audioService.playEscapePop(0);
      audioService.playBlockedThud();
    }).not.toThrow();
  });
});
