/**
 * OrderScreen - Create and manage customer orders
 *
 * Main screen for building orders by selecting products from categorized lists.
 * Supports both phone (tabbed) and tablet (split-screen) layouts.
 *
 * Features:
 * - Product selection by category with haptic feedback
 * - Real-time order total calculation
 * - Quantity adjustment with +/- controls
 * - Cash and direct payment flows
 * - Receipt modal with payment details
 * - Responsive layout adapting to device size
 *
 * @module screens/OrderScreen
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar, Route } from 'react-native-tab-view';
import { useApp } from '../context/AppContext';
import { Product, OrderItem } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { Button, Card, EmptyState, Loading } from '../components';
import { triggerHaptic } from '../utils/haptics';
import { isTablet } from '../utils/responsive';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  TOUCH_TARGETS,
  APP_CONSTANTS,
} from '../constants/theme';

/**
 * OrderScreen component
 */
export default function OrderScreen() {
  const { products, currentOrder, addToCurrentOrder, removeFromCurrentOrder, clearCurrentOrder, completeOrder, isLoading } = useApp();
  const { width } = useWindowDimensions();
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cashPaid, setCashPaid] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tabIndex, setTabIndex] = useState(0);

  const deviceIsTablet = isTablet(width);

  const total = useMemo(
    () => currentOrder.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [currentOrder]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAddToOrder = useCallback((product: Product) => {
    addToCurrentOrder(product);
    triggerHaptic('light');
  }, [addToCurrentOrder]);

  const handleRemoveFromOrder = useCallback((productId: string) => {
    removeFromCurrentOrder(productId);
    triggerHaptic('medium');
  }, [removeFromCurrentOrder]);

  const handleCompleteOrder = useCallback(() => {
    if (currentOrder.length === 0) {
      Alert.alert('Ordine vuoto', 'Aggiungi almeno un prodotto all\'ordine');
      return;
    }
    triggerHaptic('medium');
    setReceiptModalVisible(true);
  }, [currentOrder.length]);

  const handlePayWithCash = useCallback(() => {
    setReceiptModalVisible(false);
    setPaymentModalVisible(true);
  }, []);

  const handleConfirmPayment = useCallback(() => {
    const cashAmount = parseFloat(cashPaid);

    if (isNaN(cashAmount) || cashAmount < total) {
      Alert.alert('Errore', 'Importo insufficiente');
      return;
    }

    completeOrder(cashAmount);
    setPaymentModalVisible(false);
    setCashPaid('');
    triggerHaptic('success');
    Alert.alert('Successo', 'Ordine completato!');
  }, [cashPaid, total, completeOrder]);

  const handleCompleteWithoutCash = useCallback(() => {
    completeOrder();
    setReceiptModalVisible(false);
    triggerHaptic('success');
    Alert.alert('Successo', 'Ordine completato!');
  }, [completeOrder]);

  const handleClearOrder = useCallback(() => {
    Alert.alert(
      'Cancella ordine',
      'Vuoi cancellare l\'ordine corrente?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì',
          onPress: () => {
            clearCurrentOrder();
            triggerHaptic('error');
          },
        },
      ]
    );
  }, [clearCurrentOrder]);

  const renderProductItem = useCallback(({ item: product }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productButton,
        { backgroundColor: product.buttonColor },
      ]}
      onPress={() => handleAddToOrder(product)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Add ${product.name}, ${product.price} euros`}
    >
      <Text style={styles.productEmoji}>{product.emoji}</Text>
      <Text style={styles.productButtonName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.productButtonPrice}>€ {product.price.toFixed(2)}</Text>
    </TouchableOpacity>
  ), [handleAddToOrder]);

  const renderOrderItem = useCallback(({ item }: { item: OrderItem }) => (
    <Card style={styles.orderItemCard} padding="md">
      <View style={styles.orderItem}>
        <Text style={styles.orderItemEmoji}>{item.product.emoji}</Text>
        <View style={styles.orderItemDetails}>
          <Text style={styles.orderItemName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.orderItemPrice}>
            € {item.product.price.toFixed(2)} x {item.quantity} = € {(item.product.price * item.quantity).toFixed(2)}
          </Text>
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleRemoveFromOrder(item.product.id)}
            accessibilityRole="button"
            accessibilityLabel={`Decrease quantity of ${item.product.name}`}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity} accessibilityLabel={`Quantity ${item.quantity}`}>
            {item.quantity}
          </Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleAddToOrder(item.product)}
            accessibilityRole="button"
            accessibilityLabel={`Increase quantity of ${item.product.name}`}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  ), [handleRemoveFromOrder, handleAddToOrder]);

  const renderCategoryTab = useCallback(({ item }: { item: typeof DEFAULT_CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.categoryTabActive,
      ]}
      onPress={() => {
        setSelectedCategory(item.id);
        triggerHaptic('light');
      }}
      accessibilityRole="tab"
      accessibilityLabel={`Category ${item.name}`}
      accessibilityState={{ selected: selectedCategory === item.id }}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item.id && styles.categoryTabTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory]);

  const renderProductsSection = useCallback(() => (
    <View style={styles.productsSection}>
      <Text style={styles.sectionTitle}>Seleziona Prodotti</Text>
      <FlatList
        horizontal
        data={DEFAULT_CATEGORIES}
        renderItem={renderCategoryTab}
        keyExtractor={item => item.id}
        style={styles.categoriesList}
        showsHorizontalScrollIndicator={false}
      />
      {filteredProducts.length === 0 ? (
        <EmptyState
          emoji="🍽️"
          title="Nessun prodotto disponibile"
          subtitle="Vai alla sezione 'Prodotti' per aggiungerne"
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          numColumns={deviceIsTablet ? APP_CONSTANTS.GRID_COLUMNS.tablet : APP_CONSTANTS.GRID_COLUMNS.phone}
          key={deviceIsTablet ? 'tablet' : 'mobile'}
          contentContainerStyle={styles.productsGrid}
          removeClippedSubviews={Platform.OS === 'android'}
          windowSize={APP_CONSTANTS.LIST_PERFORMANCE.windowSize}
          maxToRenderPerBatch={APP_CONSTANTS.LIST_PERFORMANCE.maxToRenderPerBatch}
          initialNumToRender={APP_CONSTANTS.LIST_PERFORMANCE.initialNumToRender}
        />
      )}
    </View>
  ), [filteredProducts, deviceIsTablet, renderProductItem, renderCategoryTab]);

  const renderOrderSection = useCallback(() => (
    <View style={styles.orderSection}>
      <Text style={styles.sectionTitle}>Ordine Corrente</Text>
      <FlatList
        data={currentOrder}
        renderItem={renderOrderItem}
        keyExtractor={item => item.product.id}
        style={styles.orderItems}
        ListEmptyComponent={
          <EmptyState
            emoji="🛒"
            title="Nessun prodotto nell'ordine"
            subtitle="Aggiungi prodotti per iniziare"
          />
        }
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={5}
      />

      {currentOrder.length > 0 && (
        <>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTALE:</Text>
            <Text style={styles.totalAmount} accessibilityLabel={`Total ${total} euros`}>
              € {total.toFixed(2)}
            </Text>
          </View>
          <Button
            title="Completa Ordine"
            variant="primary"
            size="large"
            onPress={handleCompleteOrder}
            fullWidth
            accessibilityLabel="Complete order"
          />
        </>
      )}
    </View>
  ), [currentOrder, renderOrderItem, total, handleCompleteOrder]);

  const tabRoutes: Route[] = [
    { key: 'products', title: 'Prodotti' },
    { key: 'order', title: 'Ordine' },
  ];

  const renderScene = SceneMap({
    products: renderProductsSection,
    order: renderOrderSection,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={COLORS.primary}
      inactiveColor={COLORS.textTertiary}
    />
  );

  if (isLoading) {
    return <Loading fullScreen text="Caricamento ordini..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Nuovo Ordine</Text>
        {currentOrder.length > 0 && (
          <Button
            title="Cancella"
            variant="danger"
            size="small"
            onPress={handleClearOrder}
            accessibilityLabel="Clear order"
          />
        )}
      </View>

      {deviceIsTablet ? (
        <View style={styles.content}>
          {renderProductsSection()}
          {renderOrderSection()}
        </View>
      ) : (
        <TabView
          navigationState={{ index: tabIndex, routes: tabRoutes }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          renderTabBar={renderTabBar}
        />
      )}

      {/* Receipt Modal */}
      <Modal
        visible={receiptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReceiptModalVisible(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContent}>
            <Text style={styles.receiptTitle}>Scontrino</Text>
            <View style={styles.receiptDivider} />

            <FlatList
              data={currentOrder}
              renderItem={({ item }) => (
                <View style={styles.receiptItem}>
                  <Text style={styles.receiptItemText}>
                    {item.product.emoji} {item.product.name} x{item.quantity}
                  </Text>
                  <Text style={styles.receiptItemPrice}>
                    € {(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              )}
              keyExtractor={item => item.product.id}
              style={styles.receiptItems}
            />

            <View style={styles.receiptDivider} />
            <View style={styles.receiptTotal}>
              <Text style={styles.receiptTotalLabel}>TOTALE:</Text>
              <Text style={styles.receiptTotalAmount}>€ {total.toFixed(2)}</Text>
            </View>

            <View style={styles.receiptActions}>
              <Button
                title="Contanti"
                variant="warning"
                size="medium"
                onPress={handlePayWithCash}
                style={styles.receiptActionButton}
              />
              <Button
                title="Completa"
                variant="primary"
                size="medium"
                onPress={handleCompleteWithoutCash}
                style={styles.receiptActionButton}
              />
            </View>

            <Button
              title="Annulla"
              variant="ghost"
              size="medium"
              onPress={() => setReceiptModalVisible(false)}
              fullWidth
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
        accessibilityViewIsModal
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Pagamento Contanti</Text>
            <View style={styles.paymentTotal}>
              <Text style={styles.paymentTotalLabel}>Totale da pagare:</Text>
              <Text style={styles.paymentTotalAmount}>€ {total.toFixed(2)}</Text>
            </View>

            <TextInput
              style={styles.cashInput}
              placeholder="Importo ricevuto (€)"
              value={cashPaid}
              onChangeText={setCashPaid}
              keyboardType="decimal-pad"
              autoFocus
              accessibilityLabel="Cash received input"
            />

            {cashPaid && parseFloat(cashPaid) >= total && (
              <View style={styles.changeSection}>
                <Text style={styles.changeLabel}>Resto:</Text>
                <Text style={styles.changeAmount}>
                  € {(parseFloat(cashPaid) - total).toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.paymentActions}>
              <Button
                title="Indietro"
                variant="ghost"
                size="large"
                onPress={() => {
                  setPaymentModalVisible(false);
                  setReceiptModalVisible(true);
                }}
                style={styles.paymentActionButton}
              />
              <Button
                title="Conferma"
                variant="primary"
                size="large"
                onPress={handleConfirmPayment}
                style={styles.paymentActionButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  productsSection: {
    flex: 2,
    padding: SPACING.lg,
  },
  orderSection: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  categoriesList: {
    marginBottom: SPACING.lg,
    flexGrow: 0,
  },
  categoryTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGETS.medium,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: FONT_SIZES.xl,
    marginRight: 6,
  },
  categoryTabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTabTextActive: {
    color: COLORS.textInverse,
  },
  productsGrid: {
    paddingBottom: SPACING.lg,
  },
  productButton: {
    width: 150,
    height: 150,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  productEmoji: {
    fontSize: 42,
    marginBottom: SPACING.sm,
  },
  productButtonName: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  productButtonPrice: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  orderItems: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  orderItemCard: {
    marginBottom: SPACING.sm,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemEmoji: {
    fontSize: APP_CONSTANTS.EMOJI_SIZE.small,
    marginRight: SPACING.sm,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  orderItemPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quantityButton: {
    width: TOUCH_TARGETS.medium,
    height: TOUCH_TARGETS.medium,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
  },
  tabIndicator: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  receiptContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  receiptTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  receiptItems: {
    maxHeight: 200,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  receiptItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  receiptItemPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  receiptTotalLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  receiptTotalAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  receiptActionButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: SPACING.sm,
  },
  paymentContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
  },
  paymentTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxl,
  },
  paymentTotal: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  paymentTotalLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  paymentTotalAmount: {
    fontSize: FONT_SIZES.display,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cashInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.xxxl,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    minHeight: TOUCH_TARGETS.xlarge,
    color: COLORS.textPrimary,
  },
  changeSection: {
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  changeLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  changeAmount: {
    fontSize: FONT_SIZES.heading,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  paymentActionButton: {
    flex: 1,
  },
});
