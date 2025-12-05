/**
 * Loading indicator component
 *
 * Displays an activity spinner with optional text.
 * Can be used inline or as a full-screen loading overlay.
 *
 * @module components/Loading
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

/**
 * Loading component props
 */
export interface LoadingProps {
  /** Spinner size (default: 'large') */
  size?: 'small' | 'large';
  /** Spinner color (default: primary theme color) */
  color?: string;
  /** Optional loading text */
  text?: string;
  /** Fill entire screen (default: false) */
  fullScreen?: boolean;
  /** Custom container styles */
  style?: ViewStyle;
}

/**
 * Loading component
 *
 * @example
 * ```tsx
 * <Loading text="Loading products..." fullScreen />
 * ```
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  fullScreen = false,
  style,
}) => {
  const containerStyle = fullScreen ? styles.fullScreen : styles.container;

  return (
    <View style={[containerStyle, style]} accessibilityLabel={text || 'Loading'}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default Loading;
