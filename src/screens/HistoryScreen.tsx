/**
 * HistoryScreen - View order history and statistics
 *
 * Displays completed orders with summary statistics and revenue tracking.
 * Shows top-selling products and individual order details.
 *
 * Features:
 * - Total orders count and revenue
 * - Top-selling products ranked by quantity
 * - Detailed order list with timestamps
 * - Cash payment details (when applicable)
 * - Delete individual orders
 * - Reset all orders (session reset)
 * - Empty state when no orders exist
 *
 * @module screens/HistoryScreen
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Order, OrderItem } from '../types';
import { Button, Card, EmptyState, Loading } from '../components';
import { triggerHaptic } from '../utils/haptics';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  TOUCH_TARGETS,
  APP_CONSTANTS,
} from '../constants/theme';

/**
 * HistoryScreen component
 */
export default function HistoryScreen() {
  const { orders, deleteOrder, resetSession, isLoading } = useApp();

  const summary = useMemo(() => {
    const productCounts: { [key: string]: { name: string; emoji: string; count: number; total: number } } = {};
    let totalRevenue = 0;

    orders.forEach(order => {
      totalRevenue += order.total;
      order.items.forEach(item => {
        const key = item.product.id;
        if (!productCounts[key]) {
          productCounts[key] = {
            name: item.product.name,
            emoji: item.product.emoji,
            count: 0,
            total: 0,
          };
        }
        productCounts[key].count += item.quantity;
        productCounts[key].total += item.product.price * item.quantity;
      });
    });

    const sortedProducts = Object.values(productCounts).sort((a, b) => b.count - a.count);

    return {
      totalOrders: orders.length,
      totalRevenue,
      products: sortedProducts,
    };
  }, [orders]);

  const handleDeleteOrder = useCallback((orderId: string) => {
    Alert.alert(
      'Elimina Ordine',
      'Sei sicuro di voler eliminare questo ordine?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            deleteOrder(orderId);
            triggerHaptic('error');
          },
        },
      ]
    );
  }, [deleteOrder]);

  const handleResetSession = useCallback(() => {
    Alert.alert(
      'Reset Sessione',
      'Sei sicuro di voler cancellare tutti gli ordini? Questa azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSession();
            triggerHaptic('error');
          },
        },
      ]
    );
  }, [resetSession]);

  const formatDate = useCallback((date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderTopProduct = useCallback(({ item, index }: { item: typeof summary.products[0]; index: number }) => (
    <View style={styles.topProductItem}>
      <View style={styles.topProductRank}>
        <Text style={styles.topProductRankText}>{index + 1}</Text>
      </View>
      <Text style={styles.topProductEmoji}>{item.emoji}</Text>
      <View style={styles.topProductDetails}>
        <Text style={styles.topProductName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.topProductStats}>
          {item.count} venduti • € {item.total.toFixed(2)}
        </Text>
      </View>
    </View>
  ), []);

  const renderOrderItem = useCallback(({ item }: { item: OrderItem }) => (
    <View style={styles.orderItemRow}>
      <Text style={styles.orderItemText} numberOfLines={1}>
        {item.product.emoji} {item.product.name} x{item.quantity}
      </Text>
      <Text style={styles.orderItemPrice}>
        € {(item.product.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  ), []);

  const renderOrder = useCallback(({ item: order }: { item: Order }) => (
    <Card style={styles.orderCard} padding="lg">
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderDate}>{formatDate(order.timestamp)}</Text>
          <Text style={styles.orderId}>Ordine #{order.id.slice(-6)}</Text>
        </View>
        <Button
          title="Elimina"
          variant="danger"
          size="small"
          onPress={() => handleDeleteOrder(order.id)}
          accessibilityLabel={`Delete order ${order.id}`}
        />
      </View>

      <FlatList
        data={order.items}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => `${item.product.id}-${index}`}
        scrollEnabled={false}
      />

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>Totale:</Text>
          <Text style={styles.orderTotalAmount}>€ {order.total.toFixed(2)}</Text>
        </View>
        {order.cashPaid && (
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentText}>
              Contanti: € {order.cashPaid.toFixed(2)}
            </Text>
            <Text style={styles.paymentText}>
              Resto: € {order.change?.toFixed(2) || '0.00'}
            </Text>
          </View>
        )}
      </View>
    </Card>
  ), [formatDate, handleDeleteOrder, renderOrderItem]);

  const ListHeaderComponent = useCallback(() => (
    <>
      {orders.length > 0 && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Riepilogo Totale</Text>
          <View style={styles.summaryCards}>
            <Card style={styles.summaryCard} padding="lg" variant="filled">
              <Text style={styles.summaryValue}>{summary.totalOrders}</Text>
              <Text style={styles.summaryLabel}>Ordini</Text>
            </Card>
            <Card style={styles.summaryCard} padding="lg" variant="filled">
              <Text style={[styles.summaryValue, styles.revenueValue]}>
                € {summary.totalRevenue.toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Incasso Totale</Text>
            </Card>
          </View>

          {summary.products.length > 0 && (
            <Card style={styles.topProductsSection} padding="lg" variant="filled">
              <Text style={styles.topProductsTitle}>Prodotti Più Venduti</Text>
              <FlatList
                data={summary.products.slice(0, 5)}
                renderItem={renderTopProduct}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                scrollEnabled={false}
              />
            </Card>
          )}
        </View>
      )}

      {orders.length > 0 && (
        <View style={styles.ordersSectionHeader}>
          <Text style={styles.ordersSectionTitle}>Tutti gli Ordini</Text>
        </View>
      )}
    </>
  ), [summary, renderTopProduct, orders.length]);

  const ListEmptyComponent = useCallback(() => (
    <EmptyState
      emoji="📋"
      title="Nessun ordine ancora"
      subtitle="Gli ordini completati appariranno qui"
    />
  ), []);

  if (isLoading) {
    return <Loading fullScreen text="Caricamento storico..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Storico Ordini</Text>
        {orders.length > 0 && (
          <Button
            title="Reset Sessione"
            variant="danger"
            size="small"
            onPress={handleResetSession}
            accessibilityLabel="Reset session"
          />
        )}
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={APP_CONSTANTS.LIST_PERFORMANCE.windowSize}
        maxToRenderPerBatch={5}
        initialNumToRender={8}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  listContent: {
    flexGrow: 1,
  },
  summarySection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONT_SIZES.heading,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  revenueValue: {
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  topProductsSection: {
    marginTop: SPACING.sm,
  },
  topProductsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  topProductRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  topProductRankText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.textInverse,
  },
  topProductEmoji: {
    fontSize: APP_CONSTANTS.EMOJI_SIZE.small,
    marginRight: SPACING.md,
  },
  topProductDetails: {
    flex: 1,
  },
  topProductName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  topProductStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ordersSectionHeader: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  ordersSectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  orderCard: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderDate: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  orderId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  orderItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  orderItemPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  orderFooter: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  orderTotalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  orderTotalAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentDetails: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  paymentText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
});
