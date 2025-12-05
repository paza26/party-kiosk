/**
 * Zod validation schemas for runtime type checking
 *
 * Ensures data loaded from AsyncStorage or user input matches expected types.
 * Prevents corrupt or malformed data from causing runtime errors.
 *
 * @module validators/schemas
 */

import { z } from 'zod';

/**
 * Product validation schema
 * Validates product objects have required fields with correct types
 */
export const ProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  emoji: z.string().min(1, 'Emoji is required'),
  price: z.number().positive('Price must be positive').finite(),
  buttonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  category: z.string().optional(),
});

/**
 * Order item validation schema
 * Validates an order item has a valid product and positive quantity
 */
export const OrderItemSchema = z.object({
  product: ProductSchema,
  quantity: z.number().int().positive('Quantity must be positive'),
});

/**
 * Order validation schema
 * Validates completed orders with payment details
 */
export const OrderSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  total: z.number().nonnegative('Total cannot be negative').finite(),
  timestamp: z.date(),
  cashPaid: z.number().nonnegative().finite().optional(),
  change: z.number().nonnegative().finite().optional(),
});

/** TypeScript type inferred from ProductSchema */
export type ValidatedProduct = z.infer<typeof ProductSchema>;
/** TypeScript type inferred from OrderItemSchema */
export type ValidatedOrderItem = z.infer<typeof OrderItemSchema>;
/** TypeScript type inferred from OrderSchema */
export type ValidatedOrder = z.infer<typeof OrderSchema>;

/**
 * Validate a single product object
 *
 * @param data - Unknown data to validate
 * @returns Success with validated data or failure with error details
 */
export const validateProduct = (data: unknown) => {
  try {
    return { success: true as const, data: ProductSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: error.issues };
    }
    return { success: false as const, errors: [{ message: 'Unknown validation error' }] };
  }
};

/**
 * Validate a single order object
 *
 * @param data - Unknown data to validate
 * @returns Success with validated data or failure with error details
 */
export const validateOrder = (data: unknown) => {
  try {
    return { success: true as const, data: OrderSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: error.issues };
    }
    return { success: false as const, errors: [{ message: 'Unknown validation error' }] };
  }
};

/**
 * Validate an array of products
 * Used when loading products from AsyncStorage
 *
 * @param data - Unknown data to validate
 * @returns Success with validated array or failure with error details
 */
export const validateProducts = (data: unknown) => {
  try {
    const schema = z.array(ProductSchema);
    return { success: true as const, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: error.issues };
    }
    return { success: false as const, errors: [{ message: 'Unknown validation error' }] };
  }
};

/**
 * Validate an array of orders
 * Used when loading order history from AsyncStorage
 *
 * @param data - Unknown data to validate
 * @returns Success with validated array or failure with error details
 */
export const validateOrders = (data: unknown) => {
  try {
    const schema = z.array(OrderSchema);
    return { success: true as const, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: error.issues };
    }
    return { success: false as const, errors: [{ message: 'Unknown validation error' }] };
  }
};
