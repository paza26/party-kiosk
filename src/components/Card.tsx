/**
 * Card container component with multiple style variants
 *
 * Provides consistent container styling with elevation, borders, or filled backgrounds.
 * Supports dynamic padding from theme spacing scale.
 *
 * @module components/Card
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

/**
 * Card component props
 */
export interface CardProps extends ViewProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant (default: 'elevated') */
  variant?: 'elevated' | 'outlined' | 'filled';
  /** Padding size from theme spacing (default: 'lg') */
  padding?: keyof typeof SPACING;
  /** Custom container styles */
  style?: ViewStyle;
}

/**
 * Card component
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="md">
 *   <Text>Card content</Text>
 * </Card>
 * ```
 */
const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'lg',
  style,
  ...props
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: SPACING[padding] },
    style,
  ];

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  elevated: {
    ...SHADOWS.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filled: {
    backgroundColor: COLORS.background,
  },
});

export default Card;
