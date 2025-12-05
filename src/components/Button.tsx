/**
 * Reusable Button component with multiple variants and sizes
 *
 * Supports loading states, icons, and full accessibility.
 * Follows design system with consistent styling and touch targets.
 *
 * @module components/Button
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGETS, SHADOWS } from '../constants/theme';

/** Button color variants */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
/** Button size presets */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button component props
 */
export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button text label */
  title: string;
  /** Visual variant (default: 'primary') */
  variant?: ButtonVariant;
  /** Size preset (default: 'medium') */
  size?: ButtonSize;
  /** Show loading spinner instead of title */
  loading?: boolean;
  /** Expand to full width of container */
  fullWidth?: boolean;
  /** Optional icon to show before title */
  leftIcon?: React.ReactNode;
  /** Optional icon to show after title */
  rightIcon?: React.ReactNode;
  /** Custom container styles */
  style?: ViewStyle;
  /** Custom text styles */
  textStyle?: TextStyle;
}

/**
 * Button component
 *
 * @example
 * ```tsx
 * <Button
 *   title="Complete Order"
 *   variant="primary"
 *   size="large"
 *   onPress={handleComplete}
 *   loading={isProcessing}
 * />
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    (disabled || loading) && styles.textDisabled,
    textStyle,
  ];

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    return loading ? `${title}, Loading` : title;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {leftIcon && !loading && leftIcon}
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? COLORS.primary : COLORS.textInverse}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      {rightIcon && !loading && rightIcon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.info,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  warning: {
    backgroundColor: COLORS.warning,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Sizes
  size_small: {
    minHeight: TOUCH_TARGETS.small,
    paddingVertical: SPACING.xs,
  },
  size_medium: {
    minHeight: TOUCH_TARGETS.medium,
    paddingVertical: SPACING.sm,
  },
  size_large: {
    minHeight: TOUCH_TARGETS.large,
    paddingVertical: SPACING.md,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: COLORS.textInverse,
  },
  text_secondary: {
    color: COLORS.textInverse,
  },
  text_danger: {
    color: COLORS.textInverse,
  },
  text_warning: {
    color: COLORS.textInverse,
  },
  text_ghost: {
    color: COLORS.textPrimary,
  },
  textDisabled: {
    color: COLORS.textDisabled,
  },

  // Text sizes
  textSize_small: {
    fontSize: FONT_SIZES.sm,
  },
  textSize_medium: {
    fontSize: FONT_SIZES.lg,
  },
  textSize_large: {
    fontSize: FONT_SIZES.xl,
  },
});

export default Button;
