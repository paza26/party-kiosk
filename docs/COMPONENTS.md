# Components Documentation

**Party Kiosk - Documentazione Completa dei Componenti**

Versione: 1.0.0
Ultima modifica: 2025-12-05

---

## Indice

1. [Overview](#overview)
2. [Screen Components](#screen-components)
3. [Utility Components](#utility-components)
4. [Component Patterns](#component-patterns)
5. [Best Practices](#best-practices)

---

## Overview

Party Kiosk utilizza un'architettura component-based con React Native. I componenti sono organizzati in:

- **Screen Components**: Componenti full-screen per navigazione
- **Utility Components**: Componenti cross-cutting (ErrorBoundary)
- **Built-in Modals**: Modali integrati nelle screen per specifiche funzionalita

### Component Philosophy

- **Single Responsibility**: Ogni componente ha uno scopo chiaro
- **Composition**: Componenti piccoli e componibili
- **Type Safety**: Props e state completamente tipizzati
- **Performance**: Memoization e optimization props

---

## Screen Components

### OrderScreen

**Location**: `src/screens/OrderScreen.tsx`

**Purpose**: Gestisce la creazione di nuovi ordini, selezione prodotti e pagamento.

#### Props

Nessun prop (utilizza context tramite `useApp()`).

#### State Management

```typescript
// Local State
const [receiptModalVisible, setReceiptModalVisible] = useState(false);
const [paymentModalVisible, setPaymentModalVisible] = useState(false);
const [cashPaid, setCashPaid] = useState('');
const [selectedCategory, setSelectedCategory] = useState('all');
const [tabIndex, setTabIndex] = useState(0);

// Context State
const {
  products,
  currentOrder,
  addToCurrentOrder,
  removeFromCurrentOrder,
  clearCurrentOrder,
  completeOrder
} = useApp();
```

#### Key Features

1. **Responsive Layout**
   - Mobile: Tab-based interface (Products | Order)
   - Tablet: Split-screen layout (Products left, Order right)

2. **Category Filtering**
   - Horizontal scrollable category tabs
   - Filter products by category
   - "All" category shows all products

3. **Haptic Feedback**
   - Light: Product selection
   - Medium: Quantity changes, modal actions
   - Heavy: Order completion, cancellation

4. **Product Grid**
   - Responsive columns (2 mobile, 4 tablet)
   - Virtualized list for performance
   - Color-coded buttons per product

5. **Order Management**
   - Add/remove products with +/- buttons
   - Real-time total calculation
   - Clear entire order option

6. **Payment Flow**
   - Receipt modal with order summary
   - Two payment options: Direct or Cash
   - Cash payment with automatic change calculation

#### Computed Values

```typescript
// Responsive breakpoint
const isTablet = width >= 768;

// Order total (memoized)
const total = useMemo(
  () => currentOrder.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  [currentOrder]
);

// Filtered products by category (memoized)
const filteredProducts = useMemo(() => {
  if (selectedCategory === 'all') return products;
  return products.filter(p => p.category === selectedCategory);
}, [products, selectedCategory]);
```

#### Event Handlers

```typescript
// Product selection with haptic feedback
const handleAddToOrder = useCallback((product: Product) => {
  addToCurrentOrder(product);
  triggerHaptic('light');
}, [addToCurrentOrder, triggerHaptic]);

// Remove from order
const handleRemoveFromOrder = useCallback((productId: string) => {
  removeFromCurrentOrder(productId);
  triggerHaptic('medium');
}, [removeFromCurrentOrder, triggerHaptic]);

// Complete order flow
const handleCompleteOrder = useCallback(() => {
  if (currentOrder.length === 0) {
    Alert.alert('Ordine vuoto', 'Aggiungi almeno un prodotto');
    return;
  }
  triggerHaptic('medium');
  setReceiptModalVisible(true);
}, [currentOrder.length, triggerHaptic]);

// Cash payment confirmation
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
```

#### Performance Optimizations

```typescript
// Virtualized FlatList
<FlatList
  data={filteredProducts}
  renderItem={renderProductItem}
  numColumns={isTablet ? 4 : 2}
  removeClippedSubviews={true}
  windowSize={10}
  maxToRenderPerBatch={10}
  initialNumToRender={8}
/>

// Memoized render functions
const renderProductItem = useCallback(({ item: product }: { item: Product }) => (
  // ... component
), [handleAddToOrder]);
```

#### Modals

##### Receipt Modal
- Shows order summary
- Displays total
- Two action buttons: Cash Payment | Complete
- Cancel option

##### Payment Modal
- Input for cash received
- Real-time change calculation
- Validation for insufficient amount
- Back and Confirm buttons

#### Usage Example

```typescript
// In App.tsx navigation
<Tab.Screen
  name="Order"
  component={OrderScreen}
  options={{
    tabBarLabel: 'Ordine',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="cart" size={size} color={color} />
    ),
  }}
/>
```

---

### ProductsScreen

**Location**: `src/screens/ProductsScreen.tsx`

**Purpose**: Gestisce il catalogo prodotti con operazioni CRUD (Create, Read, Update, Delete).

#### Props

Nessun prop (utilizza context tramite `useApp()`).

#### State Management

```typescript
// Local State
const [modalVisible, setModalVisible] = useState(false);
const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
const [name, setName] = useState('');
const [emoji, setEmoji] = useState('🍕');
const [price, setPrice] = useState('');
const [buttonColor, setButtonColor] = useState(PRESET_COLORS[0]);
const [category, setCategory] = useState('food');

// Context State
const { products, addProduct, updateProduct, deleteProduct } = useApp();
```

#### Key Features

1. **Product Listing**
   - Card-based layout
   - Shows emoji, name, price, category, color
   - Edit and Delete actions per product

2. **Product Creation/Editing**
   - Modal form with all fields
   - Emoji picker with 100+ food emojis
   - 10 preset colors for buttons
   - 6 categories (Food, Drinks, Desserts, Snacks, Other)

3. **Validation**
   - Name: Required, max 100 chars
   - Price: Required, must be positive number
   - Real-time feedback via alerts

4. **Haptic Feedback**
   - Light: Open modal, select emoji/color/category
   - Medium: Save product
   - Heavy: Delete product

#### Event Handlers

```typescript
// Open add modal
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

// Open edit modal with product data
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

// Save product (create or update)
const handleSave = useCallback(() => {
  // Validation
  if (!name.trim()) {
    Alert.alert('Errore', 'Inserisci un nome per il prodotto');
    return;
  }
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    Alert.alert('Errore', 'Inserisci un prezzo valido');
    return;
  }

  // Create product object
  const product: Product = {
    id: editingProduct?.id || Date.now().toString(),
    name: name.trim(),
    emoji,
    price: priceNum,
    buttonColor,
    category,
  };

  // Save
  if (editingProduct) {
    updateProduct(editingProduct.id, product);
  } else {
    addProduct(product);
  }

  triggerHaptic('medium');
  setModalVisible(false);
}, [name, price, emoji, buttonColor, category, editingProduct, addProduct, updateProduct, triggerHaptic]);

// Delete with confirmation
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
```

#### Performance Optimizations

```typescript
// Virtualized product list
<FlatList
  data={products}
  renderItem={renderProductCard}
  removeClippedSubviews={true}
  windowSize={10}
  maxToRenderPerBatch={5}
  initialNumToRender={10}
/>

// Memoized render functions
const renderProductCard = useCallback(({ item }: { item: Product }) => (
  // ... component
), [openEditModal, handleDelete]);

const renderEmojiOption = useCallback(({ item }: { item: string }) => (
  // ... component
), [triggerHaptic]);
```

#### Modals

##### Product Editor Modal
- Emoji button (opens emoji picker)
- Text input: Product name
- Number input: Price
- Category selector (horizontal scroll)
- Color selector (horizontal scroll)
- Cancel and Save buttons

##### Emoji Picker Modal
- Grid of 100+ food emojis
- 6 columns
- Virtualized for performance
- Tap to select and close

#### Constants

```typescript
const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
];
```

---

### HistoryScreen

**Location**: `src/screens/HistoryScreen.tsx`

**Purpose**: Visualizza storico ordini, statistiche e metriche di vendita.

#### Props

Nessun prop (utilizza context tramite `useApp()`).

#### State Management

```typescript
// Context State
const { orders, deleteOrder, resetSession } = useApp();

// Computed State (memoized)
const summary = useMemo(() => {
  // Calculate statistics
}, [orders]);
```

#### Key Features

1. **Summary Statistics**
   - Total orders count
   - Total revenue
   - Top products sold (sorted by quantity)

2. **Order History**
   - Chronological list (newest first)
   - Each order shows:
     - Date and time
     - Order ID (last 6 digits)
     - Item list with quantities
     - Total amount
     - Cash payment details (if applicable)

3. **Actions**
   - Delete single order
   - Reset entire session (keeps products)
   - Confirmation dialogs for destructive actions

4. **Haptic Feedback**
   - Heavy: Delete order, reset session

#### Computed Values

```typescript
const summary = useMemo(() => {
  const productCounts: {
    [key: string]: {
      name: string;
      emoji: string;
      count: number;
      total: number
    }
  } = {};

  let totalRevenue = 0;

  // Aggregate data from all orders
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

  // Sort by quantity sold
  const sortedProducts = Object.values(productCounts)
    .sort((a, b) => b.count - a.count);

  return {
    totalOrders: orders.length,
    totalRevenue,
    products: sortedProducts,
  };
}, [orders]);
```

#### Event Handlers

```typescript
// Delete single order with confirmation
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

// Reset session with strong warning
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

// Format date for display
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
```

#### Performance Optimizations

```typescript
// Virtualized order list
<FlatList
  data={orders}
  renderItem={renderOrder}
  removeClippedSubviews={true}
  windowSize={10}
  maxToRenderPerBatch={5}
  initialNumToRender={8}
/>

// Memoized render functions
const renderOrder = useCallback(({ item }: { item: Order }) => (
  // ... component
), [formatDate, handleDeleteOrder, renderOrderItem]);
```

#### UI Sections

##### Summary Section
- Two cards: Order count and Total revenue
- Top products list with emoji, name, count, and total

##### Orders List
- Header: "Tutti gli Ordini"
- Order cards with full details
- Delete button per order
- Payment details (if cash paid)

#### Empty State

When no orders exist:
```typescript
<View style={styles.emptyState}>
  <Text>Nessun ordine ancora</Text>
  <Text>Gli ordini completati appariranno qui</Text>
</View>
```

---

## Utility Components

### ErrorBoundary

**Location**: `src/components/ErrorBoundary.tsx`

**Purpose**: Cattura errori React non gestiti e mostra UI di fallback user-friendly.

#### Props

```typescript
interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}
```

- **children**: Componenti da wrappare
- **fallback** (optional): Custom fallback UI

#### State

```typescript
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
```

#### Lifecycle Methods

```typescript
// Update state when error occurs
static getDerivedStateFromError(error: Error): Partial<State> {
  return {
    hasError: true,
    error,
  };
}

// Log error details
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  this.setState({
    error,
    errorInfo,
  });
}
```

#### Features

1. **Error Catching**: Cattura errori in albero componenti figli
2. **Fallback UI**: Mostra schermata errore user-friendly
3. **Dev Mode Details**: Mostra stack trace in development
4. **Recovery**: Bottone "Riprova" per reset

#### Default Fallback UI

```
┌─────────────────────────┐
│           ⚠️             │
│                          │
│  Oops! Qualcosa è        │
│  andato storto           │
│                          │
│  Si è verificato un      │
│  errore imprevisto       │
│                          │
│  [Error Details - DEV]   │
│                          │
│      [Riprova]           │
└─────────────────────────┘
```

#### Usage Example

```typescript
// Wrap entire app
<ErrorBoundary>
  <AppProvider>
    <NavigationContainer>
      {/* app content */}
    </NavigationContainer>
  </AppProvider>
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={(error, resetError) => (
    <View>
      <Text>Custom Error: {error.message}</Text>
      <Button onPress={resetError}>Reset</Button>
    </View>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

#### Error Recovery

```typescript
resetError = (): void => {
  this.setState({
    hasError: false,
    error: null,
    errorInfo: null,
  });
};
```

---

## Component Patterns

### 1. Custom Hooks Pattern

```typescript
// Hook for app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Usage in components
const MyComponent = () => {
  const { products, addProduct } = useApp();
  // ... component logic
};
```

### 2. Memoization Pattern

```typescript
// Memoize expensive computations
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// Memoize render functions
const renderItem = useCallback(({ item }) => (
  <ItemComponent item={item} onPress={handlePress} />
), [handlePress]);
```

### 3. Responsive Pattern

```typescript
const MyComponent = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return isTablet ? (
    <TabletLayout />
  ) : (
    <MobileLayout />
  );
};
```

### 4. Conditional Rendering Pattern

```typescript
// Empty states
{items.length === 0 ? (
  <EmptyState />
) : (
  <ItemList items={items} />
)}

// Optional sections
{showDetails && (
  <DetailsSection />
)}

// Loading states
{isLoading ? (
  <LoadingSpinner />
) : (
  <Content />
)}
```

### 5. Modal Pattern

```typescript
const [visible, setVisible] = useState(false);

// Open modal
const openModal = () => setVisible(true);

// Close modal
const closeModal = () => setVisible(false);

// Modal component
<Modal
  visible={visible}
  animationType="slide"
  transparent={true}
  onRequestClose={closeModal}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* modal content */}
      <Button onPress={closeModal}>Close</Button>
    </View>
  </View>
</Modal>
```

---

## Best Practices

### Component Structure

```typescript
// 1. Imports
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Types/Interfaces
interface Props {
  title: string;
  onPress: () => void;
}

// 3. Constants (outside component)
const COLORS = {
  primary: '#4CAF50',
  secondary: '#2196F3',
};

// 4. Component
export default function MyComponent({ title, onPress }: Props) {
  // 4a. Hooks
  const [state, setState] = useState(false);

  // 4b. Callbacks
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  // 4c. Render functions
  const renderContent = () => (
    <Text>{title}</Text>
  );

  // 4d. Return JSX
  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

// 5. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Performance Best Practices

1. **Use Virtualized Lists**: FlatList over ScrollView per liste lunghe
2. **Memoize Everything**: useMemo per computed values, useCallback per handlers
3. **Avoid Inline Functions**: Definisci callbacks outside render quando possibile
4. **Use Keys Properly**: Unique, stable keys per list items
5. **Optimize Images**: Use appropriate sizes, lazy loading

### Accessibility Best Practices

1. **Touch Targets**: Minimum 44x44pt per elementi interattivi
2. **Labels**: Descrittivi e chiari
3. **Feedback**: Visual e haptic per azioni
4. **Contrast**: Sufficiente contrasto colori
5. **Text Size**: Leggibile, scalabile

### State Management Best Practices

1. **Lift State Up**: Solo quando necessario
2. **Local First**: Usa state locale quando possibile
3. **Context for Global**: Solo per stato veramente globale
4. **Immutable Updates**: Sempre
5. **Single Source of Truth**: Evita duplicazione stato

### Error Handling Best Practices

1. **Always Handle Errors**: Try-catch per async operations
2. **User-Friendly Messages**: Messaggi chiari, non tecnici
3. **Fallback UI**: Sempre fornire alternative
4. **Log Errors**: Per debugging
5. **Recovery Options**: Permetti all'utente di recuperare

---

## Component Testing

### Recommended Testing Approach

```typescript
// Component test example
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: '1',
      name: 'Pizza',
      emoji: '🍕',
      price: 12.50,
      buttonColor: '#FF6B6B',
    };

    const { getByText } = render(
      <ProductCard product={product} onPress={jest.fn()} />
    );

    expect(getByText('Pizza')).toBeTruthy();
    expect(getByText('€ 12.50')).toBeTruthy();
  });

  it('calls onPress when touched', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ProductCard product={mockProduct} onPress={onPress} />
    );

    fireEvent.press(getByTestId('product-card'));
    expect(onPress).toHaveBeenCalledWith(mockProduct);
  });
});
```

---

## Future Component Ideas

### Planned Components

1. **StatCard**: Reusable statistic card component
2. **FilterBar**: Reusable filter/search bar
3. **ConfirmDialog**: Reusable confirmation dialog
4. **LoadingOverlay**: Full-screen loading indicator
5. **Toast**: Non-intrusive notifications
6. **Charts**: Revenue and sales charts
7. **ExportButton**: Export data functionality
8. **SettingsPanel**: App settings management

---

**Prossimi Passi**:
- Vedi [API.md](API.md) per Context API documentation
- Vedi [TYPES.md](TYPES.md) per TypeScript types
- Vedi [ARCHITECTURE.md](ARCHITECTURE.md) per design patterns
