import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider, useApp } from '../../context/AppContext';
import { createMockProduct, createMockOrderItem } from '../utils/testUtils';
import { Product, Order } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('AppContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('useApp hook', () => {
    it('should throw error when used outside AppProvider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useApp());
      }).toThrow('useApp must be used within an AppProvider');

      consoleError.mockRestore();
    });

    it('should provide context when used within AppProvider', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      expect(result.current).toHaveProperty('products');
      expect(result.current).toHaveProperty('orders');
      expect(result.current).toHaveProperty('currentOrder');
      expect(result.current).toHaveProperty('addProduct');
      expect(result.current).toHaveProperty('updateProduct');
      expect(result.current).toHaveProperty('deleteProduct');
      expect(result.current).toHaveProperty('addToCurrentOrder');
      expect(result.current).toHaveProperty('removeFromCurrentOrder');
      expect(result.current).toHaveProperty('clearCurrentOrder');
      expect(result.current).toHaveProperty('completeOrder');
      expect(result.current).toHaveProperty('deleteOrder');
      expect(result.current).toHaveProperty('resetSession');
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty products, orders, and currentOrder', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.orders).toEqual([]);
      expect(result.current.currentOrder).toEqual([]);
    });

    it('should set isLoading to false after initialization', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Data Persistence - Loading', () => {
    it('should load products from AsyncStorage on mount', async () => {
      const mockProducts: Product[] = [
        createMockProduct({ id: '1', name: 'Pizza' }),
        createMockProduct({ id: '2', name: 'Burger' }),
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@party_kiosk_products') {
          return Promise.resolve(JSON.stringify(mockProducts));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].name).toBe('Pizza');
      expect(result.current.products[1].name).toBe('Burger');
    });

    it('should load orders from AsyncStorage with correct date conversion', async () => {
      const timestamp = new Date('2025-01-15T10:30:00');
      const mockOrders = [
        {
          id: 'order-1',
          items: [createMockOrderItem()],
          total: 10.0,
          timestamp: timestamp.toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@party_kiosk_orders') {
          return Promise.resolve(JSON.stringify(mockOrders));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].timestamp).toBeInstanceOf(Date);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.orders).toEqual([]);
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('Product Management', () => {
    describe('addProduct', () => {
      it('should add a new product to the list', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const newProduct = createMockProduct({ name: 'Test Pizza' });

        act(() => {
          result.current.addProduct(newProduct);
        });

        expect(result.current.products).toHaveLength(1);
        expect(result.current.products[0]).toEqual(newProduct);
      });

      it('should save products to AsyncStorage after adding', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const newProduct = createMockProduct();

        act(() => {
          result.current.addProduct(newProduct);
        });

        await waitFor(() => {
          expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            '@party_kiosk_products',
            expect.any(String)
          );
        });
      });

      it('should add multiple products correctly', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1', name: 'Pizza' });
        const product2 = createMockProduct({ id: '2', name: 'Burger' });

        act(() => {
          result.current.addProduct(product1);
          result.current.addProduct(product2);
        });

        expect(result.current.products).toHaveLength(2);
        expect(result.current.products[0].name).toBe('Pizza');
        expect(result.current.products[1].name).toBe('Burger');
      });
    });

    describe('updateProduct', () => {
      it('should update an existing product', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: 'test-1', name: 'Pizza', price: 5.0 });

        act(() => {
          result.current.addProduct(product);
        });

        const updatedProduct = { ...product, name: 'Updated Pizza', price: 7.0 };

        act(() => {
          result.current.updateProduct('test-1', updatedProduct);
        });

        expect(result.current.products[0].name).toBe('Updated Pizza');
        expect(result.current.products[0].price).toBe(7.0);
      });

      it('should not affect other products when updating', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1', name: 'Pizza' });
        const product2 = createMockProduct({ id: '2', name: 'Burger' });

        act(() => {
          result.current.addProduct(product1);
          result.current.addProduct(product2);
        });

        const updatedProduct1 = { ...product1, name: 'Super Pizza' };

        act(() => {
          result.current.updateProduct('1', updatedProduct1);
        });

        expect(result.current.products[0].name).toBe('Super Pizza');
        expect(result.current.products[1].name).toBe('Burger');
      });

      it('should handle updating non-existent product gracefully', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1', name: 'Pizza' });

        act(() => {
          result.current.addProduct(product);
        });

        const updatedProduct = createMockProduct({ id: 'non-existent' });

        act(() => {
          result.current.updateProduct('non-existent', updatedProduct);
        });

        expect(result.current.products).toHaveLength(1);
        expect(result.current.products[0].id).toBe('1');
      });
    });

    describe('deleteProduct', () => {
      it('should delete a product by id', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: 'test-1' });

        act(() => {
          result.current.addProduct(product);
        });

        expect(result.current.products).toHaveLength(1);

        act(() => {
          result.current.deleteProduct('test-1');
        });

        expect(result.current.products).toHaveLength(0);
      });

      it('should only delete the specified product', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1', name: 'Pizza' });
        const product2 = createMockProduct({ id: '2', name: 'Burger' });
        const product3 = createMockProduct({ id: '3', name: 'Fries' });

        act(() => {
          result.current.addProduct(product1);
          result.current.addProduct(product2);
          result.current.addProduct(product3);
        });

        act(() => {
          result.current.deleteProduct('2');
        });

        expect(result.current.products).toHaveLength(2);
        expect(result.current.products.find(p => p.id === '2')).toBeUndefined();
        expect(result.current.products.find(p => p.id === '1')).toBeDefined();
        expect(result.current.products.find(p => p.id === '3')).toBeDefined();
      });

      it('should handle deleting non-existent product gracefully', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1' });

        act(() => {
          result.current.addProduct(product);
        });

        act(() => {
          result.current.deleteProduct('non-existent');
        });

        expect(result.current.products).toHaveLength(1);
      });
    });
  });

  describe('Current Order Management', () => {
    describe('addToCurrentOrder', () => {
      it('should add a product to current order with quantity 1', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1', name: 'Pizza' });

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        expect(result.current.currentOrder).toHaveLength(1);
        expect(result.current.currentOrder[0].product).toEqual(product);
        expect(result.current.currentOrder[0].quantity).toBe(1);
      });

      it('should increment quantity when same product is added again', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1', name: 'Pizza' });

        act(() => {
          result.current.addToCurrentOrder(product);
          result.current.addToCurrentOrder(product);
          result.current.addToCurrentOrder(product);
        });

        expect(result.current.currentOrder).toHaveLength(1);
        expect(result.current.currentOrder[0].quantity).toBe(3);
      });

      it('should handle multiple different products in order', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1', name: 'Pizza' });
        const product2 = createMockProduct({ id: '2', name: 'Burger' });

        act(() => {
          result.current.addToCurrentOrder(product1);
          result.current.addToCurrentOrder(product2);
          result.current.addToCurrentOrder(product1);
        });

        expect(result.current.currentOrder).toHaveLength(2);
        expect(result.current.currentOrder[0].quantity).toBe(2);
        expect(result.current.currentOrder[1].quantity).toBe(1);
      });
    });

    describe('removeFromCurrentOrder', () => {
      it('should decrement quantity when product has multiple items', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1' });

        act(() => {
          result.current.addToCurrentOrder(product);
          result.current.addToCurrentOrder(product);
          result.current.addToCurrentOrder(product);
        });

        expect(result.current.currentOrder[0].quantity).toBe(3);

        act(() => {
          result.current.removeFromCurrentOrder('1');
        });

        expect(result.current.currentOrder[0].quantity).toBe(2);
      });

      it('should remove item completely when quantity is 1', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1' });

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        expect(result.current.currentOrder).toHaveLength(1);

        act(() => {
          result.current.removeFromCurrentOrder('1');
        });

        expect(result.current.currentOrder).toHaveLength(0);
      });

      it('should only affect the specified product', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1' });
        const product2 = createMockProduct({ id: '2' });

        act(() => {
          result.current.addToCurrentOrder(product1);
          result.current.addToCurrentOrder(product2);
          result.current.addToCurrentOrder(product2);
        });

        act(() => {
          result.current.removeFromCurrentOrder('2');
        });

        expect(result.current.currentOrder).toHaveLength(2);
        expect(result.current.currentOrder.find(item => item.product.id === '1')?.quantity).toBe(1);
        expect(result.current.currentOrder.find(item => item.product.id === '2')?.quantity).toBe(1);
      });

      it('should handle removing non-existent product gracefully', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1' });

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.removeFromCurrentOrder('non-existent');
        });

        expect(result.current.currentOrder).toHaveLength(1);
      });
    });

    describe('clearCurrentOrder', () => {
      it('should clear all items from current order', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1' });
        const product2 = createMockProduct({ id: '2' });

        act(() => {
          result.current.addToCurrentOrder(product1);
          result.current.addToCurrentOrder(product2);
        });

        expect(result.current.currentOrder).toHaveLength(2);

        act(() => {
          result.current.clearCurrentOrder();
        });

        expect(result.current.currentOrder).toHaveLength(0);
      });

      it('should handle clearing empty order', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        act(() => {
          result.current.clearCurrentOrder();
        });

        expect(result.current.currentOrder).toHaveLength(0);
      });
    });
  });

  describe('Order Completion', () => {
    describe('completeOrder', () => {
      it('should create an order from current order items', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ id: '1', price: 5.0 });

        act(() => {
          result.current.addToCurrentOrder(product);
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.completeOrder();
        });

        expect(result.current.orders).toHaveLength(1);
        expect(result.current.orders[0].items).toHaveLength(1);
        expect(result.current.orders[0].total).toBe(10.0);
      });

      it('should calculate total correctly', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1', price: 5.0 });
        const product2 = createMockProduct({ id: '2', price: 3.5 });

        act(() => {
          result.current.addToCurrentOrder(product1);
          result.current.addToCurrentOrder(product1);
          result.current.addToCurrentOrder(product2);
        });

        act(() => {
          result.current.completeOrder();
        });

        expect(result.current.orders[0].total).toBe(13.5); // (5*2) + (3.5*1)
      });

      it('should handle cash payment and calculate change', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ price: 10.0 });

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.completeOrder(20.0);
        });

        expect(result.current.orders[0].cashPaid).toBe(20.0);
        expect(result.current.orders[0].change).toBe(10.0);
      });

      it('should handle exact cash payment', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct({ price: 15.0 });

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.completeOrder(15.0);
        });

        expect(result.current.orders[0].cashPaid).toBe(15.0);
        expect(result.current.orders[0].change).toBe(0);
      });

      it('should clear current order after completion', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        expect(result.current.currentOrder).toHaveLength(1);

        act(() => {
          result.current.completeOrder();
        });

        expect(result.current.currentOrder).toHaveLength(0);
      });

      it('should add new orders to the beginning of the list', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product1 = createMockProduct({ id: '1' });
        const product2 = createMockProduct({ id: '2' });

        act(() => {
          result.current.addToCurrentOrder(product1);
        });

        act(() => {
          result.current.completeOrder();
        });

        act(() => {
          result.current.addToCurrentOrder(product2);
        });

        act(() => {
          result.current.completeOrder();
        });

        expect(result.current.orders).toHaveLength(2);
        expect(result.current.orders[0].items[0].product.id).toBe('2');
        expect(result.current.orders[1].items[0].product.id).toBe('1');
      });

      it('should not create order when current order is empty', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        act(() => {
          result.current.completeOrder();
        });

        expect(result.current.orders).toHaveLength(0);
      });

      it('should generate unique order IDs', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.completeOrder();
        });

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.completeOrder();
        });

        expect(result.current.orders[0].id).not.toBe(result.current.orders[1].id);
      });

      it('should set timestamp to current date', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();
        const beforeTime = new Date();

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.completeOrder();
        });

        const afterTime = new Date();

        expect(result.current.orders[0].timestamp).toBeInstanceOf(Date);
        expect(result.current.orders[0].timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
        expect(result.current.orders[0].timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      });
    });

    describe('deleteOrder', () => {
      it('should delete an order by id', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        act(() => {
          result.current.completeOrder();
        });

        const orderId = result.current.orders[0].id;

        act(() => {
          result.current.deleteOrder(orderId);
        });

        expect(result.current.orders).toHaveLength(0);
      });

      it('should only delete the specified order', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();

        act(() => {
          result.current.addToCurrentOrder(product);
          result.current.completeOrder();
          result.current.addToCurrentOrder(product);
          result.current.completeOrder();
          result.current.addToCurrentOrder(product);
          result.current.completeOrder();
        });

        const orderIdToDelete = result.current.orders[1].id;

        act(() => {
          result.current.deleteOrder(orderIdToDelete);
        });

        expect(result.current.orders).toHaveLength(2);
        expect(result.current.orders.find(o => o.id === orderIdToDelete)).toBeUndefined();
      });
    });
  });

  describe('Session Management', () => {
    describe('resetSession', () => {
      it('should clear all orders', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();

        act(() => {
          result.current.addToCurrentOrder(product);
          result.current.completeOrder();
          result.current.addToCurrentOrder(product);
          result.current.completeOrder();
        });

        expect(result.current.orders).toHaveLength(2);

        await act(async () => {
          await result.current.resetSession();
        });

        expect(result.current.orders).toHaveLength(0);
      });

      it('should clear current order', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();

        act(() => {
          result.current.addToCurrentOrder(product);
        });

        expect(result.current.currentOrder).toHaveLength(1);

        await act(async () => {
          await result.current.resetSession();
        });

        expect(result.current.currentOrder).toHaveLength(0);
      });

      it('should remove orders from AsyncStorage', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
          await result.current.resetSession();
        });

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@party_kiosk_orders');
      });

      it('should not affect products', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const product = createMockProduct();

        act(() => {
          result.current.addProduct(product);
        });

        await act(async () => {
          await result.current.resetSession();
        });

        expect(result.current.products).toHaveLength(1);
      });

      it('should handle AsyncStorage errors gracefully', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation();
        (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
          await result.current.resetSession();
        });

        expect(result.current.orders).toHaveLength(0);
        expect(consoleError).toHaveBeenCalled();

        consoleError.mockRestore();
      });
    });
  });

  describe('Data Persistence - Saving', () => {
    it('should save products to AsyncStorage when products change', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const product = createMockProduct();

      act(() => {
        result.current.addProduct(product);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@party_kiosk_products',
          JSON.stringify([product])
        );
      });
    });

    it('should save orders to AsyncStorage when orders change', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCurrentOrder(product);
      });

      act(() => {
        result.current.completeOrder();
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@party_kiosk_orders',
          expect.any(String)
        );
      });
    });

    it('should not save during initial loading', async () => {
      (AsyncStorage.setItem as jest.Mock).mockClear();

      renderHook(() => useApp(), { wrapper });

      // Wait a bit but not for loading to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // setItem should not be called during loading
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle rapid successive operations', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const product = createMockProduct({ id: '1', price: 5.0 });

      act(() => {
        result.current.addToCurrentOrder(product);
        result.current.addToCurrentOrder(product);
        result.current.removeFromCurrentOrder('1');
        result.current.addToCurrentOrder(product);
        result.current.addToCurrentOrder(product);
      });

      expect(result.current.currentOrder[0].quantity).toBe(3);
    });

    it('should handle orders with many products', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const products = Array.from({ length: 20 }, (_, i) =>
        createMockProduct({ id: `${i}`, price: (i + 1) * 2 })
      );

      act(() => {
        products.forEach(product => {
          result.current.addToCurrentOrder(product);
        });
      });

      act(() => {
        result.current.completeOrder();
      });

      expect(result.current.orders[0].items).toHaveLength(20);
      const expectedTotal = products.reduce((sum, p) => sum + p.price, 0);
      expect(result.current.orders[0].total).toBe(expectedTotal);
    });

    it('should handle decimal precision in calculations', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const product = createMockProduct({ price: 3.33 });

      act(() => {
        result.current.addToCurrentOrder(product);
        result.current.addToCurrentOrder(product);
        result.current.addToCurrentOrder(product);
      });

      act(() => {
        result.current.completeOrder(10.0);
      });

      expect(result.current.orders[0].total).toBeCloseTo(9.99, 2);
      expect(result.current.orders[0].change).toBeCloseTo(0.01, 2);
    });
  });
});
