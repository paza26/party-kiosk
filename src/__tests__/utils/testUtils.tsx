import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AppProvider } from '../../context/AppContext';
import { Product, Order, OrderItem } from '../../types';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <AppProvider>{children}</AppProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock product factory
 */
export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  id: `product-${Date.now()}-${Math.random()}`,
  name: 'Test Product',
  emoji: '🍕',
  price: 5.0,
  buttonColor: '#FF6B6B',
  ...overrides,
});

/**
 * Mock order item factory
 */
export const createMockOrderItem = (
  overrides?: Partial<OrderItem>
): OrderItem => ({
  product: createMockProduct(),
  quantity: 1,
  ...overrides,
});

/**
 * Mock order factory
 */
export const createMockOrder = (overrides?: Partial<Order>): Order => ({
  id: `order-${Date.now()}-${Math.random()}`,
  items: [createMockOrderItem()],
  total: 5.0,
  timestamp: new Date(),
  ...overrides,
});

/**
 * Create multiple mock products
 */
export const createMockProducts = (count: number): Product[] => {
  const emojis = ['🍕', '🍔', '🌭', '🍟', '🥤', '🍦', '🍰', '🍪'];
  const names = ['Pizza', 'Burger', 'Hot Dog', 'Fries', 'Drink', 'Ice Cream', 'Cake', 'Cookie'];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  return Array.from({ length: count }, (_, i) => ({
    id: `product-${i}`,
    name: names[i % names.length],
    emoji: emojis[i % emojis.length],
    price: (i + 1) * 2.5,
    buttonColor: colors[i % colors.length],
  }));
};

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react-native';
