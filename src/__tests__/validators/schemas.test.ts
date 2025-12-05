import {
  ProductSchema,
  OrderItemSchema,
  OrderSchema,
  validateProduct,
  validateOrder,
  validateProducts,
  validateOrders,
} from '../../validators/schemas';
import { Product, OrderItem, Order } from '../../types';

describe('Validation Schemas', () => {
  describe('ProductSchema', () => {
    const validProduct: Product = {
      id: 'test-1',
      name: 'Pizza Margherita',
      emoji: '🍕',
      price: 9.99,
      buttonColor: '#FF6B6B',
      category: 'food',
    };

    it('should validate a valid product', () => {
      const result = ProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProduct);
      }
    });

    it('should require id', () => {
      const product = { ...validProduct, id: '' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should require name', () => {
      const product = { ...validProduct, name: '' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const product = { ...validProduct, name: 'a'.repeat(101) };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should require emoji', () => {
      const product = { ...validProduct, emoji: '' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should require positive price', () => {
      const product = { ...validProduct, price: 0 };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const product = { ...validProduct, price: -5.0 };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should reject infinite price', () => {
      const product = { ...validProduct, price: Infinity };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should require valid hex color', () => {
      const product = { ...validProduct, buttonColor: 'not-a-color' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should accept valid hex colors with lowercase', () => {
      const product = { ...validProduct, buttonColor: '#abcdef' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it('should accept valid hex colors with uppercase', () => {
      const product = { ...validProduct, buttonColor: '#ABCDEF' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it('should reject hex colors without hash', () => {
      const product = { ...validProduct, buttonColor: 'FF6B6B' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should reject short hex colors', () => {
      const product = { ...validProduct, buttonColor: '#FFF' };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(false);
    });

    it('should make category optional', () => {
      const product = { ...validProduct, category: undefined };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });

    it('should allow decimal prices', () => {
      const product = { ...validProduct, price: 3.33 };
      const result = ProductSchema.safeParse(product);
      expect(result.success).toBe(true);
    });
  });

  describe('OrderItemSchema', () => {
    const validProduct: Product = {
      id: 'test-1',
      name: 'Pizza',
      emoji: '🍕',
      price: 10.0,
      buttonColor: '#FF6B6B',
    };

    const validOrderItem: OrderItem = {
      product: validProduct,
      quantity: 2,
    };

    it('should validate a valid order item', () => {
      const result = OrderItemSchema.safeParse(validOrderItem);
      expect(result.success).toBe(true);
    });

    it('should require positive quantity', () => {
      const item = { ...validOrderItem, quantity: 0 };
      const result = OrderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const item = { ...validOrderItem, quantity: -1 };
      const result = OrderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should reject decimal quantity', () => {
      const item = { ...validOrderItem, quantity: 2.5 };
      const result = OrderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should require valid product', () => {
      const item = { ...validOrderItem, product: { ...validProduct, id: '' } };
      const result = OrderItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });
  });

  describe('OrderSchema', () => {
    const validProduct: Product = {
      id: 'test-1',
      name: 'Pizza',
      emoji: '🍕',
      price: 10.0,
      buttonColor: '#FF6B6B',
    };

    const validOrder: Order = {
      id: 'order-1',
      items: [{ product: validProduct, quantity: 2 }],
      total: 20.0,
      timestamp: new Date(),
    };

    it('should validate a valid order', () => {
      const result = OrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it('should require order id', () => {
      const order = { ...validOrder, id: '' };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should require at least one item', () => {
      const order = { ...validOrder, items: [] };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should require non-negative total', () => {
      const order = { ...validOrder, total: -10.0 };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should accept zero total', () => {
      const order = { ...validOrder, total: 0 };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it('should reject infinite total', () => {
      const order = { ...validOrder, total: Infinity };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should require valid Date for timestamp', () => {
      const order = { ...validOrder, timestamp: 'not a date' };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should accept optional cashPaid', () => {
      const order = { ...validOrder, cashPaid: 25.0 };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it('should accept optional change', () => {
      const order = { ...validOrder, cashPaid: 25.0, change: 5.0 };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it('should reject negative cashPaid', () => {
      const order = { ...validOrder, cashPaid: -10.0 };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should reject negative change', () => {
      const order = { ...validOrder, cashPaid: 25.0, change: -5.0 };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should validate order with multiple items', () => {
      const order = {
        ...validOrder,
        items: [
          { product: validProduct, quantity: 2 },
          { product: { ...validProduct, id: 'test-2', name: 'Burger' }, quantity: 1 },
        ],
        total: 30.0,
      };
      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });
  });

  describe('validateProduct function', () => {
    it('should return success for valid product', () => {
      const product: Product = {
        id: 'test-1',
        name: 'Pizza',
        emoji: '🍕',
        price: 10.0,
        buttonColor: '#FF6B6B',
      };

      const result = validateProduct(product);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(product);
      }
    });

    it('should return error details for invalid product', () => {
      const product = {
        id: '',
        name: 'Pizza',
        emoji: '🍕',
        price: -5,
        buttonColor: 'invalid',
      };

      const result = validateProduct(product);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle unknown errors gracefully', () => {
      const result = validateProduct(null);
      expect(result.success).toBe(false);
    });
  });

  describe('validateOrder function', () => {
    it('should return success for valid order', () => {
      const order: Order = {
        id: 'order-1',
        items: [
          {
            product: {
              id: 'test-1',
              name: 'Pizza',
              emoji: '🍕',
              price: 10.0,
              buttonColor: '#FF6B6B',
            },
            quantity: 2,
          },
        ],
        total: 20.0,
        timestamp: new Date(),
      };

      const result = validateOrder(order);
      expect(result.success).toBe(true);
    });

    it('should return error details for invalid order', () => {
      const order = {
        id: '',
        items: [],
        total: -10,
        timestamp: 'not a date',
      };

      const result = validateOrder(order);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateProducts function', () => {
    it('should validate array of valid products', () => {
      const products: Product[] = [
        {
          id: 'test-1',
          name: 'Pizza',
          emoji: '🍕',
          price: 10.0,
          buttonColor: '#FF6B6B',
        },
        {
          id: 'test-2',
          name: 'Burger',
          emoji: '🍔',
          price: 8.0,
          buttonColor: '#4ECDC4',
        },
      ];

      const result = validateProducts(products);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('should reject array with invalid products', () => {
      const products = [
        {
          id: 'test-1',
          name: 'Pizza',
          emoji: '🍕',
          price: 10.0,
          buttonColor: '#FF6B6B',
        },
        {
          id: '',
          name: 'Invalid',
          emoji: '',
          price: -5,
          buttonColor: 'bad',
        },
      ];

      const result = validateProducts(products);
      expect(result.success).toBe(false);
    });

    it('should validate empty array', () => {
      const result = validateProducts([]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('validateOrders function', () => {
    it('should validate array of valid orders', () => {
      const orders: Order[] = [
        {
          id: 'order-1',
          items: [
            {
              product: {
                id: 'test-1',
                name: 'Pizza',
                emoji: '🍕',
                price: 10.0,
                buttonColor: '#FF6B6B',
              },
              quantity: 1,
            },
          ],
          total: 10.0,
          timestamp: new Date(),
        },
      ];

      const result = validateOrders(orders);
      expect(result.success).toBe(true);
    });

    it('should reject array with invalid orders', () => {
      const orders = [
        {
          id: '',
          items: [],
          total: -10,
          timestamp: new Date(),
        },
      ];

      const result = validateOrders(orders);
      expect(result.success).toBe(false);
    });

    it('should validate empty array', () => {
      const result = validateOrders([]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });
});
