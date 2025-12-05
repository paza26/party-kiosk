import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { triggerHaptic, triggerSelectionHaptic } from '../../utils/haptics';

// Mock expo-haptics
jest.mock('expo-haptics');

describe('Haptics Utilities', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
      writable: true,
    });
  });

  describe('triggerHaptic', () => {
    describe('on iOS', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'ios',
          writable: true,
        });
      });

      it('should trigger light impact haptic', async () => {
        await triggerHaptic('light');
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });

      it('should trigger medium impact haptic', async () => {
        await triggerHaptic('medium');
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });

      it('should trigger heavy impact haptic', async () => {
        await triggerHaptic('heavy');
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Heavy
        );
      });

      it('should trigger success notification haptic', async () => {
        await triggerHaptic('success');
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success
        );
      });

      it('should trigger warning notification haptic', async () => {
        await triggerHaptic('warning');
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Warning
        );
      });

      it('should trigger error notification haptic', async () => {
        await triggerHaptic('error');
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error
        );
      });

      it('should default to light haptic when no type specified', async () => {
        await triggerHaptic();
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Light
        );
      });

      it('should handle haptic errors gracefully', async () => {
        const consoleDebug = jest.spyOn(console, 'debug').mockImplementation();
        (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Haptic not available')
        );

        await triggerHaptic('light');

        expect(consoleDebug).toHaveBeenCalled();
        consoleDebug.mockRestore();
      });

      it('should not throw error when haptic fails', async () => {
        jest.spyOn(console, 'debug').mockImplementation();
        (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Haptic not available')
        );

        await expect(triggerHaptic('light')).resolves.not.toThrow();
      });
    });

    describe('on Android', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'android',
          writable: true,
        });
      });

      it('should trigger haptics on Android', async () => {
        await triggerHaptic('light');
        expect(Haptics.impactAsync).toHaveBeenCalled();
      });

      it('should handle all haptic types on Android', async () => {
        await triggerHaptic('light');
        await triggerHaptic('medium');
        await triggerHaptic('heavy');
        await triggerHaptic('success');
        await triggerHaptic('warning');
        await triggerHaptic('error');

        expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
        expect(Haptics.notificationAsync).toHaveBeenCalledTimes(3);
      });
    });

    describe('on Web', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'web',
          writable: true,
        });
      });

      it('should not trigger haptics on web', async () => {
        await triggerHaptic('light');
        expect(Haptics.impactAsync).not.toHaveBeenCalled();
        expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      });

      it('should return immediately without error', async () => {
        await expect(triggerHaptic('success')).resolves.toBeUndefined();
      });
    });

    describe('on other platforms', () => {
      it('should not trigger haptics on Windows', async () => {
        Object.defineProperty(Platform, 'OS', {
          value: 'windows',
          writable: true,
        });

        await triggerHaptic('light');
        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });

      it('should not trigger haptics on macOS', async () => {
        Object.defineProperty(Platform, 'OS', {
          value: 'macos',
          writable: true,
        });

        await triggerHaptic('light');
        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('triggerSelectionHaptic', () => {
    describe('on iOS', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'ios',
          writable: true,
        });
      });

      it('should trigger selection haptic', async () => {
        await triggerSelectionHaptic();
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });

      it('should handle errors gracefully', async () => {
        const consoleDebug = jest.spyOn(console, 'debug').mockImplementation();
        (Haptics.selectionAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Haptic not available')
        );

        await triggerSelectionHaptic();

        expect(consoleDebug).toHaveBeenCalled();
        consoleDebug.mockRestore();
      });

      it('should not throw error when haptic fails', async () => {
        jest.spyOn(console, 'debug').mockImplementation();
        (Haptics.selectionAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Haptic not available')
        );

        await expect(triggerSelectionHaptic()).resolves.not.toThrow();
      });
    });

    describe('on Android', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'android',
          writable: true,
        });
      });

      it('should trigger selection haptic', async () => {
        await triggerSelectionHaptic();
        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });

    describe('on Web', () => {
      beforeEach(() => {
        Object.defineProperty(Platform, 'OS', {
          value: 'web',
          writable: true,
        });
      });

      it('should not trigger haptics on web', async () => {
        await triggerSelectionHaptic();
        expect(Haptics.selectionAsync).not.toHaveBeenCalled();
      });

      it('should return immediately without error', async () => {
        await expect(triggerSelectionHaptic()).resolves.toBeUndefined();
      });
    });
  });

  describe('Type coverage', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });
    });

    it('should accept all valid haptic types', async () => {
      const types: Array<'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'> = [
        'light',
        'medium',
        'heavy',
        'success',
        'warning',
        'error',
      ];

      for (const type of types) {
        await expect(triggerHaptic(type)).resolves.not.toThrow();
      }
    });
  });
});
