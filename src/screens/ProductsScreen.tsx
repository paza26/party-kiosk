/**
 * ProductsScreen - Manage product catalog
 *
 * Screen for creating, editing, and deleting products in the catalog.
 * Products can be customized with emojis, names, prices, colors, and categories.
 *
 * Features:
 * - Add/Edit/Delete products with form validation
 * - Emoji picker with 100+ food-related emojis
 * - Color picker with preset colors
 * - Category assignment
 * - List view with product details
 * - Haptic feedback for actions
 *
 * @module screens/ProductsScreen
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { foodEmojis } from '../data/foodEmojis';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { Button, Card, EmptyState, Loading } from '../components';
import { triggerHaptic } from '../utils/haptics';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  TOUCH_TARGETS,
  SHADOWS,
  APP_CONSTANTS,
} from '../constants/theme';

const PRESET_COLORS = COLORS.productColors;

/**
 * ProductsScreen component
 */
export default function ProductsScreen() {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useApp();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍕');
  const [price, setPrice] = useState('');
  const [buttonColor, setButtonColor] = useState<string>(PRESET_COLORS[0]);
  const [category, setCategory] = useState('food');

  const openAddModal = useCallback(() => {
    setEditingProduct(null);
    setName('');
    setEmoji('🍕');
    setPrice('');
    setButtonColor(PRESET_COLORS[0]);
    setCategory('food');
    setModalVisible(true);
    triggerHaptic('light');
  }, []);

  const openEditModal = useCallback((product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setEmoji(product.emoji);
    setPrice(product.price.toString());
    setButtonColor(product.buttonColor);
    setCategory(product.category || 'food');
    setModalVisible(true);
    triggerHaptic('light');
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per il prodotto');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Errore', 'Inserisci un prezzo valido');
      return;
    }

    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: name.trim(),
      emoji,
      price: priceNum,
      buttonColor,
      category,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, product);
    } else {
      addProduct(product);
    }

    triggerHaptic('success');
    setModalVisible(false);
  }, [name, price, emoji, buttonColor, category, editingProduct, addProduct, updateProduct]);

  const handleDelete = useCallback((product: Product) => {
    Alert.alert(
      'Elimina Prodotto',
      `Vuoi eliminare "${product.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            deleteProduct(product.id);
            triggerHaptic('error');
          },
        },
      ]
    );
  }, [deleteProduct]);

  const renderProductCard = useCallback(({ item: product }: { item: Product }) => (
    <Card style={styles.productCard} padding="lg">
      <View style={styles.productInfo}>
        <Text style={styles.productEmoji} accessibilityLabel={`Emoji ${product.emoji}`}>
          {product.emoji}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice} accessibilityLabel={`Price ${product.price} euros`}>
            € {product.price.toFixed(2)}
          </Text>
          {product.category && (
            <Text style={styles.productCategory}>
              {DEFAULT_CATEGORIES.find(c => c.id === product.category)?.name || 'Altro'}
            </Text>
          )}
        </View>
        <View
          style={[styles.colorPreview, { backgroundColor: product.buttonColor }]}
          accessibilityLabel={`Color ${product.buttonColor}`}
        />
      </View>
      <View style={styles.productActions}>
        <Button
          title="Modifica"
          variant="secondary"
          size="small"
          onPress={() => openEditModal(product)}
          style={styles.actionButton}
          accessibilityLabel={`Edit ${product.name}`}
        />
        <Button
          title="Elimina"
          variant="danger"
          size="small"
          onPress={() => handleDelete(product)}
          style={styles.actionButton}
          accessibilityLabel={`Delete ${product.name}`}
        />
      </View>
    </Card>
  ), [openEditModal, handleDelete]);

  const renderEmojiOption = useCallback(({ item: emojiOption }: { item: string }) => (
    <Pressable
      style={styles.emojiOption}
      onPress={() => {
        setEmoji(emojiOption);
        setEmojiPickerVisible(false);
        triggerHaptic('light');
      }}
      accessibilityRole="button"
      accessibilityLabel={`Select emoji ${emojiOption}`}
    >
      <Text style={styles.emojiOptionText}>{emojiOption}</Text>
    </Pressable>
  ), []);

  const renderColorOption = useCallback(({ item: color }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.colorOption,
        { backgroundColor: color },
        buttonColor === color && styles.colorOptionSelected,
      ]}
      onPress={() => {
        setButtonColor(color);
        triggerHaptic('light');
      }}
      accessibilityRole="button"
      accessibilityLabel={`Select color ${color}`}
      accessibilityState={{ selected: buttonColor === color }}
    />
  ), [buttonColor]);

  const renderCategoryOption = useCallback(({ item }: { item: typeof DEFAULT_CATEGORIES[0] }) => {
    if (item.id === 'all') return null;

    return (
      <TouchableOpacity
        style={[
          styles.categoryOption,
          category === item.id && styles.categoryOptionSelected,
        ]}
        onPress={() => {
          setCategory(item.id);
          triggerHaptic('light');
        }}
        accessibilityRole="button"
        accessibilityLabel={`Select category ${item.name}`}
        accessibilityState={{ selected: category === item.id }}
      >
        <Text style={styles.categoryOptionEmoji}>{item.emoji}</Text>
        <Text
          style={[
            styles.categoryOptionText,
            category === item.id && styles.categoryOptionTextSelected,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  }, [category]);

  const keyExtractor = useCallback((item: Product) => item.id, []);
  const emojiKeyExtractor = useCallback((item: string, index: number) => `${item}-${index}`, []);

  if (isLoading) {
    return <Loading fullScreen text="Caricamento prodotti..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestione Prodotti</Text>
        <Button
          title="Aggiungi Prodotto"
          variant="primary"
          size="medium"
          onPress={openAddModal}
          leftIcon={<Text style={styles.addIcon}>+</Text>}
          accessibilityLabel="Add new product"
        />
      </View>

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <EmptyState
            emoji="📦"
            title="Nessun prodotto"
            subtitle="Tocca 'Aggiungi Prodotto' per iniziare"
          />
        }
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={APP_CONSTANTS.LIST_PERFORMANCE.windowSize}
        maxToRenderPerBatch={APP_CONSTANTS.LIST_PERFORMANCE.maxToRenderPerBatch}
        initialNumToRender={APP_CONSTANTS.LIST_PERFORMANCE.initialNumToRender}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        accessibilityViewIsModal
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>
                  {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
                </Text>

                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => {
                    setEmojiPickerVisible(true);
                    triggerHaptic('light');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Selected emoji ${emoji}, tap to change`}
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                  <Text style={styles.emojiLabel}>Tocca per cambiare emoji</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Nome prodotto"
                  value={name}
                  onChangeText={setName}
                  maxLength={APP_CONSTANTS.MAX_PRODUCT_NAME_LENGTH}
                  accessibilityLabel="Product name input"
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Prezzo (€)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Product price input"
                  returnKeyType="done"
                />

                <Text style={styles.sectionLabel}>Categoria:</Text>
                <FlatList
                  horizontal
                  data={DEFAULT_CATEGORIES}
                  renderItem={renderCategoryOption}
                  keyExtractor={item => item.id}
                  style={styles.categoryList}
                  showsHorizontalScrollIndicator={false}
                />

                <Text style={styles.sectionLabel}>Colore pulsante:</Text>
                <FlatList
                  horizontal
                  data={PRESET_COLORS}
                  renderItem={renderColorOption}
                  keyExtractor={item => item}
                  style={styles.colorList}
                  showsHorizontalScrollIndicator={false}
                />

                <View style={styles.modalActions}>
                  <Button
                    title="Annulla"
                    variant="ghost"
                    size="large"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalActionButton}
                  />
                  <Button
                    title="Salva"
                    variant="primary"
                    size="large"
                    onPress={handleSave}
                    style={styles.modalActionButton}
                  />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={emojiPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEmojiPickerVisible(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emojiPickerContent}>
            <Text style={styles.modalTitle}>Scegli Emoji</Text>
            <FlatList
              data={foodEmojis}
              renderItem={renderEmojiOption}
              keyExtractor={emojiKeyExtractor}
              numColumns={6}
              contentContainerStyle={styles.emojiGrid}
              removeClippedSubviews={Platform.OS === 'android'}
              windowSize={10}
            />
            <Button
              title="Chiudi"
              variant="ghost"
              size="large"
              onPress={() => setEmojiPickerVisible(false)}
              fullWidth
            />
          </View>
        </View>
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
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addIcon: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  productList: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  productCard: {
    marginBottom: SPACING.md,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productEmoji: {
    fontSize: APP_CONSTANTS.EMOJI_SIZE.medium,
    marginRight: SPACING.md,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  productActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  emojiButton: {
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  emojiButtonText: {
    fontSize: APP_CONSTANTS.EMOJI_SIZE.large,
    marginBottom: SPACING.sm,
  },
  emojiLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    marginBottom: SPACING.lg,
    minHeight: TOUCH_TARGETS.medium,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  categoryList: {
    marginBottom: SPACING.lg,
    flexGrow: 0,
  },
  categoryOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGETS.medium,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionEmoji: {
    fontSize: FONT_SIZES.lg,
    marginRight: 6,
  },
  categoryOptionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryOptionTextSelected: {
    color: COLORS.textInverse,
  },
  colorList: {
    marginBottom: SPACING.xl,
    flexGrow: 0,
  },
  colorOption: {
    width: TOUCH_TARGETS.medium,
    height: TOUCH_TARGETS.medium,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  colorOptionSelected: {
    borderColor: COLORS.textPrimary,
    borderWidth: 3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalActionButton: {
    flex: 1,
  },
  emojiPickerContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  emojiGrid: {
    paddingVertical: SPACING.lg,
  },
  emojiOption: {
    padding: SPACING.sm,
    margin: SPACING.xs,
    minWidth: TOUCH_TARGETS.medium,
    minHeight: TOUCH_TARGETS.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionText: {
    fontSize: 32,
  },
});
