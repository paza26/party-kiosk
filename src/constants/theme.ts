import { Platform } from 'react-native';

export const COLORS = {
  // Primary palette
  primary: '#4CAF50',
  primaryDark: '#45A049',
  primaryLight: '#E8F5E9',

  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Semantic colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E0E0E0',

  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#BBBBBB',
  textInverse: '#FFFFFF',

  // Product button colors
  productColors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ],

  // Category colors (mapped from categories.ts)
  categoryAll: '#9C27B0',
  categoryFood: '#FF5722',
  categoryDrinks: '#2196F3',
  categoryDesserts: '#E91E63',
  categorySnacks: '#FF9800',
  categoryOther: '#607D8B',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  heading: 28,
  display: 32,
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: 'bold' as const,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
} as const;

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Touch target sizes following iOS Human Interface Guidelines and Material Design
export const TOUCH_TARGETS = {
  small: 32,
  medium: 44,
  large: 48,
  xlarge: 56,
} as const;

// Platform-specific adjustments
export const PLATFORM_SPACING = {
  // iOS typically uses more padding
  headerPadding: Platform.select({ ios: SPACING.lg, android: SPACING.md, default: SPACING.md }),
  tabBarPadding: Platform.select({ ios: SPACING.sm, android: SPACING.xs, default: SPACING.xs }),
  modalPadding: Platform.select({ ios: SPACING.xxl, android: SPACING.lg, default: SPACING.lg }),
} as const;

// Layout breakpoints for responsive design
export const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// App-specific constants
export const APP_CONSTANTS = {
  DEBOUNCE_DELAY: 500,
  MAX_PRODUCT_NAME_LENGTH: 100,
  EMOJI_SIZE: {
    small: 24,
    medium: 40,
    large: 60,
  },
  GRID_COLUMNS: {
    phone: 2,
    tablet: 4,
  },
  LIST_PERFORMANCE: {
    windowSize: 10,
    maxToRenderPerBatch: 10,
    initialNumToRender: 8,
  },
} as const;
