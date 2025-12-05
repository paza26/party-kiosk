/**
 * Represents a product in the kiosk catalog
 */
export interface Product {
  /** Unique identifier for the product */
  id: string;
  /** Display name of the product */
  name: string;
  /** Emoji icon representing the product */
  emoji: string;
  /** Price in euros */
  price: number;
  /** Hex color code for the product button (e.g., "#FF6B6B") */
  buttonColor: string;
  /** Category ID for filtering (food, drinks, desserts, snacks, other) */
  category?: string;
}

/**
 * Represents a product and its quantity in an order
 */
export interface OrderItem {
  /** The product being ordered */
  product: Product;
  /** Number of units ordered (must be positive integer) */
  quantity: number;
}

/**
 * Represents a completed order with payment details
 */
export interface Order {
  /** Unique identifier for the order (timestamp-based) */
  id: string;
  /** List of products and quantities in this order */
  items: OrderItem[];
  /** Total price of the order in euros */
  total: number;
  /** When the order was completed */
  timestamp: Date;
  /** Amount paid in cash (if cash payment was used) */
  cashPaid?: number;
  /** Change returned to customer (calculated as cashPaid - total) */
  change?: number;
}

/**
 * Global application state structure
 * @deprecated Use AppContext instead of accessing state directly
 */
export interface AppState {
  /** All products in the catalog */
  products: Product[];
  /** All completed orders */
  orders: Order[];
  /** Items in the current order being built */
  currentOrder: OrderItem[];
}
