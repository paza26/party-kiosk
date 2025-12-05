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
  ActivityIndicator,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { Product, OrderItem } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';

export default function OrderScreen() {
  const { products, currentOrder, addToCurrentOrder, removeFromCurrentOrder, clearCurrentOrder, completeOrder, isLoading } = useApp();
  const { width } = useWindowDimensions();
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [cashPaid, setCashPaid] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tabIndex, setTabIndex] = useState(0);

  const isTablet = width >= 768;

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

  const handleAddToOrder = useCallback((product: Product) => {
    addToCurrentOrder(product);
    triggerHaptic('light');
  }, [addToCurrentOrder, triggerHaptic]);

  const handleRemoveFromOrder = useCallback((productId: string) => {
    removeFromCurrentOrder(productId);
    triggerHaptic('medium');
  }, [removeFromCurrentOrder, triggerHaptic]);

  const handleCompleteOrder = useCallback(() => {
    if (currentOrder.length === 0) {
      Alert.alert('Ordine vuoto', 'Aggiungi almeno un prodotto all\'ordine');
      return;
    }
    triggerHaptic('medium');
    setReceiptModalVisible(true);
  }, [currentOrder.length, triggerHaptic]);

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
    triggerHaptic('heavy');
    Alert.alert('Successo', 'Ordine completato!');
  }, [cashPaid, total, completeOrder, triggerHaptic]);

  const handleCompleteWithoutCash = useCallback(() => {
    completeOrder();
    setReceiptModalVisible(false);
    triggerHaptic('heavy');
    Alert.alert('Successo', 'Ordine completato!');
  }, [completeOrder, triggerHaptic]);

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
            triggerHaptic('heavy');
          },
        },
      ]
    );
  }, [clearCurrentOrder, triggerHaptic]);

  const renderProductItem = useCallback(({ item: product }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productButton,
        { backgroundColor: product.buttonColor },
      ]}
      onPress={() => handleAddToOrder(product)}
      activeOpacity={0.8}
    >
      <Text style={styles.productEmoji}>{product.emoji}</Text>
      <Text style={styles.productButtonName}>{product.name}</Text>
      <Text style={styles.productButtonPrice}>€ {product.price.toFixed(2)}</Text>
    </TouchableOpacity>
  ), [handleAddToOrder]);

  const renderOrderItem = useCallback(({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderItemEmoji}>{item.product.emoji}</Text>
      <View style={styles.orderItemDetails}>
        <Text style={styles.orderItemName}>{item.product.name}</Text>
        <Text style={styles.orderItemPrice}>
          € {item.product.price.toFixed(2)} x {item.quantity} = € {(item.product.price * item.quantity).toFixed(2)}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleRemoveFromOrder(item.product.id)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleAddToOrder(item.product)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  ), [selectedCategory, triggerHaptic]);

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
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nessun prodotto disponibile</Text>
          <Text style={styles.emptySubtext}>
            Vai alla sezione "Prodotti" per aggiungerne
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          numColumns={isTablet ? 4 : 2}
          key={isTablet ? 'tablet' : 'mobile'}
          contentContainerStyle={styles.productsGrid}
          removeClippedSubviews={true}
          windowSize={10}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
        />
      )}
    </View>
  ), [filteredProducts, isTablet, renderProductItem, renderCategoryTab]);

  const renderOrderSection = useCallback(() => (
    <View style={styles.orderSection}>
      <Text style={styles.sectionTitle}>Ordine Corrente</Text>
      <FlatList
        data={currentOrder}
        renderItem={renderOrderItem}
        keyExtractor={item => item.product.id}
        style={styles.orderItems}
        ListEmptyComponent={
          <Text style={styles.emptyOrderText}>Nessun prodotto nell'ordine</Text>
        }
        removeClippedSubviews={true}
        windowSize={5}
      />

      {currentOrder.length > 0 && (
        <>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTALE:</Text>
            <Text style={styles.totalAmount}>€ {total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteOrder}
          >
            <Text style={styles.completeButtonText}>Completa Ordine</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  ), [currentOrder, renderOrderItem, total, handleCompleteOrder]);

  const tabRoutes = [
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
      activeColor="#4CAF50"
      inactiveColor="#999"
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Caricamento dati...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nuovo Ordine</Text>
        {currentOrder.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearOrder}
          >
            <Text style={styles.clearButtonText}>Cancella</Text>
          </TouchableOpacity>
        )}
      </View>

      {isTablet ? (
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

      <Modal
        visible={receiptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReceiptModalVisible(false)}
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
              <TouchableOpacity
                style={[styles.receiptButton, styles.cashButton]}
                onPress={handlePayWithCash}
              >
                <Text style={styles.receiptButtonText}>Pagamento Contanti</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.receiptButton, styles.completeDirectButton]}
                onPress={handleCompleteWithoutCash}
              >
                <Text style={styles.receiptButtonText}>Completa</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.receiptButton, styles.cancelReceiptButton]}
              onPress={() => setReceiptModalVisible(false)}
            >
              <Text style={styles.receiptButtonText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
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
              <TouchableOpacity
                style={[styles.paymentButton, styles.cancelPaymentButton]}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setReceiptModalVisible(true);
                }}
              >
                <Text style={styles.paymentButtonText}>Indietro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentButton, styles.confirmPaymentButton]}
                onPress={handleConfirmPayment}
              >
                <Text style={styles.paymentButtonText}>Conferma</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  clearButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  productsSection: {
    flex: 2,
    padding: 16,
  },
  orderSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoriesList: {
    marginBottom: 16,
    flexGrow: 0,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  categoryTabActive: {
    backgroundColor: '#4CAF50',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6E6E6E',
    textAlign: 'center',
  },
  productsGrid: {
    paddingBottom: 16,
  },
  productButton: {
    width: 150,
    height: 150,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    margin: 6,
  },
  productEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  productButtonName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  productButtonPrice: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  orderItems: {
    flex: 1,
    marginBottom: 16,
  },
  emptyOrderText: {
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderItemEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
  },
  tabIndicator: {
    backgroundColor: '#4CAF50',
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  receiptItems: {
    maxHeight: 200,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  receiptItemText: {
    fontSize: 14,
    flex: 1,
  },
  receiptItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  receiptTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  receiptTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  receiptButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cashButton: {
    backgroundColor: '#FF9800',
  },
  completeDirectButton: {
    backgroundColor: '#4CAF50',
  },
  cancelReceiptButton: {
    backgroundColor: '#999',
  },
  receiptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paymentContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  paymentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  paymentTotal: {
    alignItems: 'center',
    marginBottom: 24,
  },
  paymentTotalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  paymentTotalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cashInput: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 56,
  },
  changeSection: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  changeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  changeAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelPaymentButton: {
    backgroundColor: '#999',
  },
  confirmPaymentButton: {
    backgroundColor: '#4CAF50',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
