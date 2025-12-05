import React, { useState, useCallback } from 'react';
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
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { foodEmojis } from '../data/foodEmojis';
import { DEFAULT_CATEGORIES } from '../data/categories';

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
];

export default function ProductsScreen() {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍕');
  const [price, setPrice] = useState('');
  const [buttonColor, setButtonColor] = useState(PRESET_COLORS[0]);
  const [category, setCategory] = useState('food');

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

  const openAddModal = useCallback(() => {
    setEditingProduct(null);
    setName('');
    setEmoji('🍕');
    setPrice('');
    setButtonColor(PRESET_COLORS[0]);
    setCategory('food');
    setModalVisible(true);
    triggerHaptic('light');
  }, [triggerHaptic]);

  const openEditModal = useCallback((product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setEmoji(product.emoji);
    setPrice(product.price.toString());
    setButtonColor(product.buttonColor);
    setCategory(product.category || 'food');
    setModalVisible(true);
    triggerHaptic('light');
  }, [triggerHaptic]);

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

    triggerHaptic('medium');
    setModalVisible(false);
  }, [name, price, emoji, buttonColor, category, editingProduct, addProduct, updateProduct, triggerHaptic]);

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
            triggerHaptic('heavy');
          },
        },
      ]
    );
  }, [deleteProduct, triggerHaptic]);

  const renderProductCard = useCallback(({ item: product }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productEmoji}>{product.emoji}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>€ {product.price.toFixed(2)}</Text>
          {product.category && (
            <Text style={styles.productCategory}>
              {DEFAULT_CATEGORIES.find(c => c.id === product.category)?.name || 'Altro'}
            </Text>
          )}
        </View>
        <View
          style={[styles.colorPreview, { backgroundColor: product.buttonColor }]}
        />
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(product)}
        >
          <Text style={styles.actionButtonText}>Modifica</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(product)}
        >
          <Text style={styles.actionButtonText}>Elimina</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [openEditModal, handleDelete]);

  const renderEmojiOption = useCallback(({ item: emojiOption }: { item: string }) => (
    <Pressable
      style={styles.emojiOption}
      onPress={() => {
        setEmoji(emojiOption);
        setEmojiPickerVisible(false);
        triggerHaptic('light');
      }}
    >
      <Text style={styles.emojiOptionText}>{emojiOption}</Text>
    </Pressable>
  ), [triggerHaptic]);

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
    />
  ), [buttonColor, triggerHaptic]);

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
  }, [category, triggerHaptic]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Caricamento prodotti...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestione Prodotti</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Aggiungi Prodotto</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nessun prodotto</Text>
            <Text style={styles.emptySubtext}>
              Tocca "Aggiungi Prodotto" per iniziare
            </Text>
          </View>
        }
        removeClippedSubviews={true}
        windowSize={10}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
            </Text>

            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => {
                setEmojiPickerVisible(true);
                triggerHaptic('light');
              }}
            >
              <Text style={styles.emojiButtonText}>{emoji}</Text>
              <Text style={styles.emojiLabel}>Tocca per cambiare emoji</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Nome prodotto"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Prezzo (€)"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
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
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={emojiPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEmojiPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emojiPickerContent}>
            <Text style={styles.modalTitle}>Scegli Emoji</Text>
            <FlatList
              data={foodEmojis}
              renderItem={renderEmojiOption}
              keyExtractor={(item, index) => `${item}-${index}`}
              numColumns={6}
              contentContainerStyle={styles.emojiGrid}
              removeClippedSubviews={true}
              windowSize={10}
            />
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setEmojiPickerVisible(false)}
            >
              <Text style={styles.modalButtonText}>Chiudi</Text>
            </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
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
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#757575',
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  emojiButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  emojiButtonText: {
    fontSize: 60,
    marginBottom: 8,
  },
  emojiLabel: {
    fontSize: 12,
    color: '#757575',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 48,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryList: {
    marginBottom: 16,
    flexGrow: 0,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  categoryOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  categoryOptionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  colorList: {
    marginBottom: 20,
    flexGrow: 0,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  colorOptionSelected: {
    borderColor: '#000000',
    borderWidth: 3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emojiPickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  emojiGrid: {
    paddingVertical: 16,
  },
  emojiOption: {
    padding: 8,
    margin: 4,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionText: {
    fontSize: 32,
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
