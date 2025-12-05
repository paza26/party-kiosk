import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { Order, OrderItem } from '../types';

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

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }
  }, []);

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
            triggerHaptic('heavy');
          },
        },
      ]
    );
  }, [deleteOrder, triggerHaptic]);

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
            triggerHaptic('heavy');
          },
        },
      ]
    );
  }, [resetSession, triggerHaptic]);

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
      <Text style={styles.topProductEmoji}>{item.emoji}</Text>
      <View style={styles.topProductDetails}>
        <Text style={styles.topProductName}>{item.name}</Text>
        <Text style={styles.topProductStats}>
          {item.count} venduti • € {item.total.toFixed(2)}
        </Text>
      </View>
    </View>
  ), []);

  const renderOrderItem = useCallback(({ item }: { item: OrderItem }) => (
    <View style={styles.orderItemRow}>
      <Text style={styles.orderItemText}>
        {item.product.emoji} {item.product.name} x{item.quantity}
      </Text>
      <Text style={styles.orderItemPrice}>
        € {(item.product.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  ), []);

  const renderOrder = useCallback(({ item: order }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderDate}>{formatDate(order.timestamp)}</Text>
          <Text style={styles.orderId}>Ordine #{order.id.slice(-6)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteOrderButton}
          onPress={() => handleDeleteOrder(order.id)}
        >
          <Text style={styles.deleteOrderText}>Elimina</Text>
        </TouchableOpacity>
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
    </View>
  ), [formatDate, handleDeleteOrder, renderOrderItem]);

  const ListHeaderComponent = useCallback(() => (
    <>
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Riepilogo Totale</Text>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalOrders}</Text>
            <Text style={styles.summaryLabel}>Ordini</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, styles.revenueValue]}>
              € {summary.totalRevenue.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Incasso Totale</Text>
          </View>
        </View>

        {summary.products.length > 0 && (
          <View style={styles.topProductsSection}>
            <Text style={styles.topProductsTitle}>Prodotti Venduti</Text>
            <FlatList
              data={summary.products}
              renderItem={renderTopProduct}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>

      <View style={styles.ordersSectionHeader}>
        <Text style={styles.ordersSectionTitle}>Tutti gli Ordini</Text>
      </View>
    </>
  ), [summary, renderTopProduct]);

  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Nessun ordine ancora</Text>
      <Text style={styles.emptySubtext}>
        Gli ordini completati appariranno qui
      </Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Caricamento storico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Storico Ordini</Text>
        {orders.length > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetSession}
          >
            <Text style={styles.resetButtonText}>Reset Sessione</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        windowSize={10}
        maxToRenderPerBatch={5}
        initialNumToRender={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  revenueValue: {
    color: '#4CAF50',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  topProductsSection: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  topProductsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  topProductEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  topProductDetails: {
    flex: 1,
  },
  topProductName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  topProductStats: {
    fontSize: 12,
    color: '#5A5A5A',
  },
  ordersSectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  ordersSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6E6E6E',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  orderDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#757575',
  },
  deleteOrderButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteOrderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  orderItemText: {
    fontSize: 14,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentDetails: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 2,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5A5A5A',
  },
});
