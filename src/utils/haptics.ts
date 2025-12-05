/**
 * Haptic feedback utilities for tactile user feedback
 *
 * Provides cross-platform haptic feedback that works on iOS and Android.
 * Gracefully degrades on web and unsupported platforms.
 *
 * @module utils/haptics
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Available haptic feedback types */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback on supported platforms (iOS and Android)
 * Gracefully degrades on web and other platforms
 *
 * @param type - Type of haptic feedback (default: 'light')
 *
 * @example
 * ```ts
 * // Light feedback for adding items
 * await triggerHaptic('light');
 *
 * // Success feedback for completing order
 * await triggerHaptic('success');
 * ```
 */
export const triggerHaptic = async (type: HapticType = 'light'): Promise<void> => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Silently fail if haptics are not available
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Trigger selection haptic feedback
 * Used for UI element selection (e.g., switching tabs or selecting options)
 *
 * @example
 * ```ts
 * await triggerSelectionHaptic();
 * ```
 */
export const triggerSelectionHaptic = async (): Promise<void> => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return;
  }

  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.debug('Haptic feedback not available:', error);
  }
};
