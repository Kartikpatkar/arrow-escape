import { hapticsService } from '../../src/services/haptics/hapticsService';

describe('Haptics Service', () => {
  beforeEach(() => {
    hapticsService.setEnabled(true);
  });

  it('toggles haptics enabled state correctly', () => {
    expect(hapticsService.getEnabled()).toBe(true);

    hapticsService.setEnabled(false);
    expect(hapticsService.getEnabled()).toBe(false);

    hapticsService.setEnabled(true);
    expect(hapticsService.getEnabled()).toBe(true);
  });

  it('handles vibration patterns safely without navigator.vibrate present', () => {
    expect(() => {
      hapticsService.vibrateLight();
      hapticsService.vibrateWarning();
      hapticsService.vibrateSuccess();
    }).not.toThrow();
  });
});
