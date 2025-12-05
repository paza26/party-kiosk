/**
 * AppContext - Global state management for Party Kiosk
 *
 * Manages products, orders, and current order state with persistent storage.
 * Uses debounced auto-save to AsyncStorage for optimal performance.
 *
 * @module context/AppContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order, OrderItem } from '../types';
import { validateProducts, validateOrders } from '../validators/schemas';
import { APP_CONSTANTS } from '../constants/theme';

/**
 * Context API interface exposing all app state and actions
 */
interface AppContextType {
  /** All products in the catalog */
  products: Product[];
  /** All completed orders */
  orders: Order[];
  /** Items in the current order being built */
  currentOrder: OrderItem[];

  /** Add a new product to the catalog */
  addProduct: (product: Product) => void;
  /** Update an existing product by ID */
  updateProduct: (id: string, product: Product) => void;
  /** Remove a product from the catalog (doesn't affect completed orders) */
  deleteProduct: (id: string) => void;

  /** Add a product to the current order (increments quantity if already exists) */
  addToCurrentOrder: (product: Product) => void;
  /** Remove one unit of a product from current order (removes item if quantity becomes 0) */
  removeFromCurrentOrder: (productId: string) => void;
  /** Clear all items from the current order */
  clearCurrentOrder: () => void;

  /** Complete the current order and save it to history */
  completeOrder: (cashPaid?: number) => void;
  /** Delete a specific order from history */
  deleteOrder: (orderId: string) => void;
  /** Reset all orders (keeps products) - cannot be undone */
  resetSession: () => void;

  /** True while loading data from AsyncStorage on app start */
  isLoading: boolean;
  /** Error message if storage operations fail */
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AsyncStorage keys for persisting data
 * @constant
 */
const STORAGE_KEYS = {
  PRODUCTS: '@party_kiosk_products',
  ORDERS: '@party_kiosk_orders',
} as const;

/**
 * AppProvider - Context provider component
 *
 * Provides global state to all child components. Handles data loading from AsyncStorage
 * on mount and automatic saving with debouncing on state changes.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AppProvider>
 *       <YourApp />
 *     </AppProvider>
 *   );
 * }
 * ```
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for debounced save timeouts (cleaned up on unmount)
  const productsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ordersTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load products and orders from AsyncStorage on app start
   * Validates data with Zod schemas before setting state
   */
  const loadData = useCallback(async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
      ]);

      if (productsData) {
        const parsedProducts = JSON.parse(productsData);
        const validationResult = validateProducts(parsedProducts);

        if (validationResult.success) {
          setProducts(validationResult.data);
        } else {
          console.error('Invalid products data:', validationResult.errors);
          setProducts([]);
        }
      }

      if (ordersData) {
        const parsedOrders = JSON.parse(ordersData);
        const ordersWithDates = parsedOrders.map((order: Order) => ({
          ...order,
          timestamp: new Date(order.timestamp),
        }));

        const validationResult = validateOrders(ordersWithDates);

        if (validationResult.success) {
          setOrders(validationResult.data);
        } else {
          console.error('Invalid orders data:', validationResult.errors);
          setOrders([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Save products to AsyncStorage with debouncing
   * Prevents excessive writes during rapid updates (500ms delay)
   */
  const debouncedSaveProducts = useCallback((productsToSave: Product[]) => {
    if (productsTimeoutRef.current) {
      clearTimeout(productsTimeoutRef.current);
    }

    productsTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsToSave));
      } catch (error) {
        console.error('Error saving products:', error);
        setError('Failed to save products');
      }
    }, APP_CONSTANTS.DEBOUNCE_DELAY);
  }, []);

  /**
   * Save orders to AsyncStorage with debouncing
   * Prevents excessive writes during rapid updates (500ms delay)
   */
  const debouncedSaveOrders = useCallback((ordersToSave: Order[]) => {
    if (ordersTimeoutRef.current) {
      clearTimeout(ordersTimeoutRef.current);
    }

    ordersTimeoutRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersToSave));
      } catch (error) {
        console.error('Error saving orders:', error);
        setError('Failed to save orders');
      }
    }, APP_CONSTANTS.DEBOUNCE_DELAY);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      debouncedSaveProducts(products);
    }
  }, [products, isLoading, debouncedSaveProducts]);

  useEffect(() => {
    if (!isLoading) {
      debouncedSaveOrders(orders);
    }
  }, [orders, isLoading, debouncedSaveOrders]);

  useEffect(() => {
    return () => {
      if (productsTimeoutRef.current) {
        clearTimeout(productsTimeoutRef.current);
      }
      if (ordersTimeoutRef.current) {
        clearTimeout(ordersTimeoutRef.current);
      }
    };
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => (p.id === id ? updatedProduct : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  /**
   * Add a product to the current order
   * If product already exists in order, increments quantity by 1
   * Otherwise adds it with quantity 1
   */
  const addToCurrentOrder = useCallback((product: Product) => {
    setCurrentOrder(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);

      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  }, []);

  /**
   * Remove one unit of a product from current order
   * If quantity > 1, decrements by 1
   * If quantity = 1, removes the item entirely
   */
  const removeFromCurrentOrder = useCallback((productId: string) => {
    setCurrentOrder(prev => {
      const existingItem = prev.find(item => item.product.id === productId);

      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.product.id !== productId);
      }
    });
  }, []);

  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder([]);
  }, []);

  /**
   * Complete the current order and add it to order history
   * Calculates total and change if cash payment provided
   * Clears current order after completion
   *
   * @param cashPaid - Optional cash amount paid (if using cash payment)
   */
  const completeOrder = useCallback((cashPaid?: number) => {
    setCurrentOrder(prev => {
      if (prev.length === 0) return prev;

      const total = prev.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const newOrder: Order = {
        id: Date.now().toString(),
        items: prev,
        total,
        timestamp: new Date(),
        cashPaid,
        change: cashPaid ? cashPaid - total : undefined,
      };

      setOrders(prevOrders => [newOrder, ...prevOrders]);
      return [];
    });
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  }, []);

  /**
   * Reset the session by clearing all orders
   * Keeps products intact. Cannot be undone.
   * Also clears current order and removes orders from storage.
   */
  const resetSession = useCallback(async () => {
    setOrders([]);
    setCurrentOrder([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ORDERS);
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      products,
      orders,
      currentOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCurrentOrder,
      removeFromCurrentOrder,
      clearCurrentOrder,
      completeOrder,
      deleteOrder,
      resetSession,
      isLoading,
      error,
    }),
    [
      products,
      orders,
      currentOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCurrentOrder,
      removeFromCurrentOrder,
      clearCurrentOrder,
      completeOrder,
      deleteOrder,
      resetSession,
      isLoading,
      error,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Custom hook to access app context
 * Must be used within an AppProvider
 *
 * @throws {Error} If used outside AppProvider
 * @returns {AppContextType} App state and actions
 *
 * @example
 * ```tsx
 * function ProductList() {
 *   const { products, addToCurrentOrder } = useApp();
 *
 *   return (
 *     <View>
 *       {products.map(product => (
 *         <Button key={product.id} onPress={() => addToCurrentOrder(product)} />
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
