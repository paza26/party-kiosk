/**
 * Responsive utilities for adaptive layouts across devices
 *
 * Provides helpers for detecting device types, calculating responsive sizes,
 * and adapting layouts for phone/tablet/desktop screens.
 *
 * @module utils/responsive
 */

import { Dimensions, Platform, StatusBar } from 'react-native';
import { BREAKPOINTS } from '../constants/theme';

/**
 * Get current window dimensions
 * @returns Window width and height in pixels
 */
export const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Get screen dimensions (includes system UI like status bar)
 * @returns Screen width and height in pixels
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('screen');
  return { width, height };
};

/**
 * Check if device is a tablet (width >= 768px)
 * @param width - Optional width to check (defaults to current window width)
 * @returns True if device is tablet-sized or larger
 */
export const isTablet = (width?: number): boolean => {
  const deviceWidth = width || Dimensions.get('window').width;
  return deviceWidth >= BREAKPOINTS.tablet;
};

/**
 * Check if device is a phone (width < 768px)
 * @param width - Optional width to check
 * @returns True if device is phone-sized
 */
export const isPhone = (width?: number): boolean => {
  return !isTablet(width);
};

/**
 * Get device type based on width breakpoints
 * @param width - Optional width to check
 * @returns 'phone' | 'tablet' | 'desktop'
 */
export const getDeviceType = (width?: number): 'phone' | 'tablet' | 'desktop' => {
  const deviceWidth = width || Dimensions.get('window').width;

  if (deviceWidth >= BREAKPOINTS.desktop) return 'desktop';
  if (deviceWidth >= BREAKPOINTS.tablet) return 'tablet';
  return 'phone';
};

/**
 * Scale a size proportionally based on device width
 * Uses iPhone SE/8 (375px) as baseline
 *
 * @param size - Base size to scale
 * @param width - Optional device width
 * @returns Scaled size rounded to nearest integer
 */
const BASE_WIDTH = 375; // iPhone SE/8 width as baseline

export const scaleSize = (size: number, width?: number): number => {
  const deviceWidth = width || Dimensions.get('window').width;
  return Math.round((size * deviceWidth) / BASE_WIDTH);
};

/**
 * Get optimal number of grid columns for device
 * Returns 4 for tablets, 2 for phones
 *
 * @param width - Optional device width
 * @returns Number of columns (2 or 4)
 */
export const getGridColumns = (width?: number): number => {
  return isTablet(width) ? 4 : 2;
};

/** True if running on iOS */
export const isIOS = Platform.OS === 'ios';
/** True if running on Android */
export const isAndroid = Platform.OS === 'android';
/** True if running on web */
export const isWeb = Platform.OS === 'web';

/**
 * Get Android status bar height
 * @returns Status bar height in pixels (0 on iOS/web)
 */
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0;
  }
  return 0;
};

/**
 * Detect if iOS device has a notch or Dynamic Island
 * Uses screen dimensions as approximation
 *
 * @returns True if device likely has a notch
 */
export const hasNotch = (): boolean => {
  if (Platform.OS === 'ios') {
    const { height, width } = Dimensions.get('window');
    // iPhone X and newer models
    return (
      (height === 812 || width === 812) || // iPhone X, XS, 11 Pro
      (height === 896 || width === 896) || // iPhone XR, XS Max, 11, 11 Pro Max
      (height === 844 || width === 844) || // iPhone 12, 12 Pro, 13, 13 Pro, 14
      (height === 926 || width === 926) || // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
      (height === 932 || width === 932)    // iPhone 14 Pro Max, 15 Pro Max
    );
  }
  return false;
};

/**
 * Scale font size based on device type
 * Increases fonts by 10% on tablets for better readability
 *
 * @param size - Base font size
 * @param width - Optional device width
 * @returns Scaled font size
 */
export const scaleFontSize = (size: number, width?: number): number => {
  const deviceWidth = width || Dimensions.get('window').width;

  if (deviceWidth >= BREAKPOINTS.tablet) {
    return size * 1.1; // Slightly larger fonts on tablets
  }

  return size;
};

/**
 * Grid item dimensions
 */
export interface GridItemSize {
  /** Item width in pixels */
  width: number;
  /** Item height in pixels */
  height: number;
}

/**
 * Calculate optimal grid item dimensions based on container and spacing
 * Accounts for spacing around and between items
 *
 * @param containerWidth - Total width available for grid
 * @param columns - Number of columns in grid
 * @param spacing - Space between items and around edges (default: 12)
 * @param aspectRatio - Height/width ratio (default: 1 for square)
 * @returns Calculated item width and height
 *
 * @example
 * ```ts
 * const { width, height } = calculateGridItemSize(800, 4, 12, 1);
 * // Returns dimensions for 4-column grid with 12px spacing
 * ```
 */
export const calculateGridItemSize = (
  containerWidth: number,
  columns: number,
  spacing: number = 12,
  aspectRatio: number = 1
): GridItemSize => {
  const totalSpacing = spacing * (columns + 1);
  const availableWidth = containerWidth - totalSpacing;
  const itemWidth = availableWidth / columns;
  const itemHeight = itemWidth * aspectRatio;

  return {
    width: Math.floor(itemWidth),
    height: Math.floor(itemHeight),
  };
};
