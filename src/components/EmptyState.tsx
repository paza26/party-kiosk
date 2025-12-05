/**
 * Empty state component for lists and screens with no content
 *
 * Displays a friendly message with optional emoji, subtitle, and action button.
 * Used when product lists, orders, or history are empty.
 *
 * @module components/EmptyState
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

/**
 * EmptyState component props
 */
export interface EmptyStateProps {
  /** Optional emoji icon (large, centered) */
  emoji?: string;
  /** Main message title */
  title: string;
  /** Optional subtitle with additional context */
  subtitle?: string;
  /** Optional action button or component */
  action?: React.ReactNode;
  /** Custom container styles */
  style?: ViewStyle;
}

/**
 * EmptyState component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   emoji="📦"
 *   title="No products yet"
 *   subtitle="Add your first product to get started"
 *   action={<Button title="Add Product" onPress={onAdd} />}
 * />
 * ```
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingVertical: SPACING.xxxl * 2,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  actionContainer: {
    marginTop: SPACING.md,
  },
});

export default EmptyState;
