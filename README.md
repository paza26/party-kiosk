# Party Kiosk - POS System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.76.5-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-52.0.0-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6.svg)

Modern Point of Sale (POS) application for mobile and web. Built with React Native and Expo for cafes, restaurants, and kiosks.

## Key Features

- **Product Management** - Create, edit, and delete products with emojis, prices, colors, and categories
- **Order Creation** - Intuitive touch interface with category filtering and real-time totals
- **Order History** - Complete order history with statistics and revenue tracking
- **Payment Options** - Direct payment or cash with automatic change calculation
- **Persistent Storage** - All data saved locally with AsyncStorage
- **Responsive Design** - Adapts to phone (tabbed), tablet (split-screen), and desktop layouts
- **Haptic Feedback** - Tactile feedback on iOS and Android for key actions
- **Data Validation** - Runtime validation with Zod schemas to ensure data integrity

## Quick Start

### Installation

```bash
git clone https://github.com/yourusername/party-kiosk.git
cd party-kiosk
npm install
```

### Run Development

```bash
# Web (fastest for development)
npm run web

# Android (emulator or device)
npm run android

# iOS (macOS only)
npm run ios

# Start Metro bundler with all options
npm start
```

## Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Expo CLI**: Latest version

### Platform Requirements

- **iOS**: 13.0+ (iPhone 8 and newer, all iPads)
- **Android**: 6.0+ (API 23+)
- **Web**: Chrome 80+, Safari 13+, Firefox 75+, Edge 80+

## Architecture

```
party-kiosk/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Button with variants and sizes
│   │   ├── Card.tsx         # Container with elevation/outline styles
│   │   ├── EmptyState.tsx   # Empty state placeholders
│   │   ├── ErrorBoundary.tsx # Error handling component
│   │   └── Loading.tsx      # Loading indicators
│   ├── context/             # Global state management
│   │   └── AppContext.tsx   # Context provider with AsyncStorage
│   ├── screens/             # Main application screens
│   │   ├── OrderScreen.tsx  # Order creation and management
│   │   ├── ProductsScreen.tsx # Product catalog management
│   │   └── HistoryScreen.tsx # Order history and statistics
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Product, Order, OrderItem types
│   ├── validators/          # Data validation with Zod
│   │   └── schemas.ts       # Validation schemas
│   ├── utils/               # Utility functions
│   │   ├── haptics.ts       # Haptic feedback helpers
│   │   └── responsive.ts    # Responsive layout utilities
│   ├── constants/           # Theme and configuration
│   │   └── theme.ts         # Colors, spacing, typography
│   └── data/                # Static data
│       ├── categories.ts    # Product categories
│       └── foodEmojis.ts    # Emoji database
├── App.tsx                  # Application entry point
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Core Concepts

### State Management

Uses React Context API for global state with automatic persistence to AsyncStorage. Debounced saves (500ms) optimize performance.

```tsx
import { useApp } from './src/context/AppContext';

function Component() {
  const { products, addProduct, currentOrder, completeOrder } = useApp();
  // Access state and actions
}
```

### Data Validation

All data validated with Zod schemas before saving or loading. Prevents corrupt data from causing runtime errors.

```tsx
import { validateProduct } from './src/validators/schemas';

const result = validateProduct(data);
if (result.success) {
  // Data is valid, use result.data
} else {
  // Handle validation errors
}
```

### Responsive Layouts

Automatically adapts to device size:
- **Phone**: Tabbed navigation with 2-column product grid
- **Tablet**: Split-screen layout with 4-column grid
- **Desktop**: Optimized for large screens

```tsx
import { isTablet } from './src/utils/responsive';

const columns = isTablet(width) ? 4 : 2;
```

## Usage Examples

### Add Product

```tsx
const newProduct: Product = {
  id: Date.now().toString(),
  name: 'Espresso',
  emoji: '☕',
  price: 2.50,
  buttonColor: '#FF6B6B',
  category: 'drinks'
};

addProduct(newProduct);
```

### Create Order

```tsx
// Add products to order
addToCurrentOrder(product1);
addToCurrentOrder(product2);

// Complete with cash payment
const cashPaid = 20.00;
completeOrder(cashPaid);

// Or complete without cash tracking
completeOrder();
```

### Access Order History

```tsx
const { orders } = useApp();

const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
const todayOrders = orders.filter(order =>
  isToday(new Date(order.timestamp))
);
```

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.76.5 | Cross-platform UI framework |
| Expo | 52.0.0 | Build toolchain and SDK |
| TypeScript | 5.3.3 | Type safety |
| React Navigation | 7.0.13 | Navigation system |
| AsyncStorage | 2.1.0 | Local data persistence |
| Zod | 4.1.13 | Runtime validation |
| Expo Haptics | 15.0.8 | Tactile feedback |

## Performance Optimizations

- **Debounced Auto-Save**: 500ms delay prevents excessive AsyncStorage writes
- **List Virtualization**: FlatList with optimized rendering for large datasets
- **Memoization**: useMemo and useCallback prevent unnecessary re-renders
- **Cleanup**: Automatic timeout cleanup on unmount

## Development

### Code Documentation

All code is documented with JSDoc comments following these standards:
- Module-level documentation for all files
- Interface and type documentation
- Function documentation with parameters and return values
- Usage examples for complex components

### Project Structure

- **components/**: Reusable UI components with props documentation
- **context/**: Global state with Context API
- **screens/**: Main application screens
- **validators/**: Zod schemas for runtime validation
- **utils/**: Helper functions and utilities
- **constants/**: Theme configuration and app constants

## License

Private and proprietary. All rights reserved.

**Copyright (c) 2025 Party Kiosk**

---

**Built for cafes, restaurants, and kiosks**

Last updated: 2025-12-05
