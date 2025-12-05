# Party Kiosk - Architecture Guide

## Table of Contents
1. [Project Structure](#project-structure)
2. [Design Patterns](#design-patterns)
3. [State Management](#state-management)
4. [Component Architecture](#component-architecture)
5. [Styling System](#styling-system)
6. [Cross-Platform Strategy](#cross-platform-strategy)
7. [Performance Optimization](#performance-optimization)

---

## Project Structure

```
party-kiosk/
├── App.tsx                          # Root component with providers
├── index.js                         # Entry point
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── index.ts                # Component exports
│   │   ├── Button.tsx              # Button component
│   │   ├── Card.tsx                # Card container
│   │   ├── EmptyState.tsx          # Empty state display
│   │   ├── ErrorBoundary.tsx       # Error handling
│   │   └── Loading.tsx             # Loading indicator
│   ├── constants/                   # App-wide constants
│   │   └── theme.ts                # Theme configuration
│   ├── context/                     # React Context providers
│   │   └── AppContext.tsx          # Global state management
│   ├── data/                        # Static data
│   │   ├── categories.ts           # Product categories
│   │   └── foodEmojis.ts           # Emoji library
│   ├── screens/                     # Screen components
│   │   ├── ProductsScreen.tsx      # Product management
│   │   ├── OrderScreen.tsx         # Order creation
│   │   └── HistoryScreen.tsx       # Order history
│   ├── types/                       # TypeScript types
│   │   └── index.ts                # Type definitions
│   ├── utils/                       # Utility functions
│   │   ├── haptics.ts              # Haptic feedback
│   │   └── responsive.ts           # Responsive utilities
│   └── validators/                  # Data validation
│       └── schemas.ts              # Zod schemas
├── package.json
└── tsconfig.json
```

---

## Design Patterns

### 1. **Context + Hooks Pattern**
Global state is managed using React Context with custom hooks:

```typescript
// Define context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook with error handling
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

**Benefits**:
- Prevents misuse outside provider
- Type-safe access to context
- Single source of truth

### 2. **Component Composition**
Build complex UIs from simple, reusable components:

```typescript
// Instead of monolithic components
<Card style={styles.card} padding="lg">
  <Button title="Save" variant="primary" size="large" />
</Card>
```

**Benefits**:
- Easier testing
- Better reusability
- Clearer component hierarchy

### 3. **Render Props Pattern**
FlatList uses render props for flexibility:

```typescript
const renderItem = useCallback(({ item }) => (
  <ProductCard product={item} />
), [dependencies]);

<FlatList data={products} renderItem={renderItem} />
```

**Benefits**:
- Separation of data and presentation
- Reusable render functions
- Better performance with memoization

### 4. **HOC Pattern (Error Boundary)**
Error handling wraps the entire app:

```typescript
<ErrorBoundary>
  <SafeAreaProvider>
    <AppProvider>
      {/* App content */}
    </AppProvider>
  </SafeAreaProvider>
</ErrorBoundary>
```

**Benefits**:
- Graceful error handling
- Prevents app crashes
- Better UX

---

## State Management

### Architecture
```
┌─────────────────────────────────────────┐
│           AppProvider (Root)            │
│  ┌───────────────────────────────────┐  │
│  │  State:                           │  │
│  │  - products: Product[]            │  │
│  │  - orders: Order[]                │  │
│  │  - currentOrder: OrderItem[]      │  │
│  │  - isLoading: boolean             │  │
│  │  - error: string | null           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Actions:                         │  │
│  │  - addProduct()                   │  │
│  │  - updateProduct()                │  │
│  │  - deleteProduct()                │  │
│  │  - addToCurrentOrder()            │  │
│  │  - removeFromCurrentOrder()       │  │
│  │  - completeOrder()                │  │
│  │  - deleteOrder()                  │  │
│  │  - resetSession()                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │           │           │
     ┌─────┘           │           └─────┐
     │                 │                 │
┌────▼────┐     ┌──────▼──────┐    ┌────▼────┐
│ Products│     │    Order    │    │ History │
│ Screen  │     │   Screen    │    │ Screen  │
└─────────┘     └─────────────┘    └─────────┘
```

### Data Flow
1. **User Action** → Component calls context action
2. **Context Action** → Updates state via setState
3. **State Update** → Triggers re-render
4. **Persistence** → Debounced save to AsyncStorage
5. **UI Update** → Components receive new state

### Persistence Strategy
- **Debounced Writes**: 500ms delay to batch updates
- **AsyncStorage**: Local persistence on device
- **Validation**: Zod schemas ensure data integrity
- **Error Handling**: Graceful fallback on validation failure

---

## Component Architecture

### Component Hierarchy
```
Button (Atomic)
  ↓
Card (Atomic)
  ↓
ProductCard (Molecule) = Card + Text + Button
  ↓
ProductList (Organism) = FlatList + ProductCard[]
  ↓
ProductsScreen (Page) = SafeAreaView + ProductList + Modals
```

### Component Types

#### Atomic Components
- **Button**: Single-purpose, highly reusable
- **Card**: Container with consistent styling
- **Loading**: Simple loading indicator
- **EmptyState**: Placeholder for empty data

#### Molecule Components
- **ProductCard**: Card + Product data + Actions
- **OrderItemCard**: Card + Order item + Quantity controls
- **CategoryTab**: TouchableOpacity + Icon + Text

#### Organism Components
- **ProductList**: FlatList + ProductCard + Empty state
- **OrderSummary**: OrderItems + Total + Actions
- **ReceiptModal**: Modal + Order items + Payment options

#### Page Components
- **ProductsScreen**: Full screen with product management
- **OrderScreen**: Full screen with order creation
- **HistoryScreen**: Full screen with order history

---

## Styling System

### Theme Architecture
```typescript
// Central theme definition
export const COLORS = { ... };
export const SPACING = { ... };
export const FONT_SIZES = { ... };

// Component usage
const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
  },
});
```

### Responsive Design
```typescript
// Device detection
const deviceIsTablet = isTablet(width);

// Conditional rendering
{deviceIsTablet ? <SplitView /> : <TabView />}

// Adaptive columns
numColumns={deviceIsTablet ? 4 : 2}

// Scaled sizing
fontSize: scaleFontSize(FONT_SIZES.md, width)
```

### Platform-Specific Styling
```typescript
// Using Platform.select
paddingBottom: Platform.select({
  ios: SPACING.sm,
  android: SPACING.xs,
  default: SPACING.xs,
})

// Using Platform.OS
removeClippedSubviews={Platform.OS === 'android'}

// Conditional styles
...Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  android: {
    elevation: 3,
  },
})
```

---

## Cross-Platform Strategy

### Safe Area Handling
```typescript
// iOS notches, Android status bars
<SafeAreaView edges={['top']}>
  {content}
</SafeAreaView>

// Manual insets when needed
const insets = useSafeAreaInsets();
```

### Haptic Feedback
```typescript
// Platform-aware haptics
triggerHaptic('success');  // Works on iOS/Android, silent on web
```

### Keyboard Handling
```typescript
// Adaptive keyboard avoidance
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  {content}
</KeyboardAvoidingView>
```

### Touch Targets
```typescript
// Platform-compliant sizes
minHeight: Platform.select({
  ios: 44,      // iOS HIG
  android: 48,  // Material Design
  default: 44,
})
```

---

## Performance Optimization

### List Rendering
```typescript
<FlatList
  // Optimize rendering
  removeClippedSubviews={Platform.OS === 'android'}
  windowSize={10}
  maxToRenderPerBatch={10}
  initialNumToRender={8}

  // Stable keys
  keyExtractor={item => item.id}

  // Memoized render
  renderItem={renderItem}
/>
```

### Memoization Strategy
```typescript
// Expensive computations
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);

// Event handlers
const handlePress = useCallback(() => {
  doSomething(id);
}, [id]);

// Components
const ProductCard = React.memo(({ product }) => {
  // Component implementation
});
```

### Context Optimization
```typescript
// Memoize context value
const contextValue = useMemo(
  () => ({
    products,
    orders,
    addProduct,
    // ... other values
  }),
  [products, orders, addProduct, ...]
);
```

### Image Optimization
- Use emoji instead of image assets (zero network cost)
- No image loading delays
- Perfect for food/product icons

---

## Best Practices Summary

### Do's ✅
- Use TypeScript for type safety
- Memoize expensive operations
- Use SafeAreaView for all screens
- Add accessibility labels
- Use Platform.select for platform differences
- Extract constants to theme file
- Use useCallback for event handlers
- Use useMemo for derived data
- Validate user input
- Provide user feedback (haptics, loading states)

### Don'ts ❌
- Don't use magic numbers
- Don't use inline styles for repeated patterns
- Don't forget to handle loading states
- Don't skip accessibility
- Don't ignore platform differences
- Don't use non-memoized callbacks in FlatList
- Don't forget error boundaries
- Don't hardcode colors/spacing
- Don't skip validation
- Don't use any types

---

## Development Workflow

### Adding a New Screen
1. Create screen file in `/src/screens/`
2. Use SafeAreaView wrapper
3. Import theme constants
4. Use existing components
5. Add to navigation in App.tsx
6. Test on iOS and Android

### Adding a New Component
1. Create component in `/src/components/`
2. Add TypeScript interface for props
3. Use theme constants for styling
4. Add accessibility props
5. Export from `/src/components/index.ts`
6. Document component usage

### Modifying Theme
1. Edit `/src/constants/theme.ts`
2. Changes propagate automatically
3. Test across all screens
4. Verify on different devices

---

## Troubleshooting

### Common Issues

**Issue**: Content hidden behind notch
- **Solution**: Ensure SafeAreaView is used with proper edges

**Issue**: Haptics not working
- **Solution**: Test on physical device, not simulator

**Issue**: FlatList performance issues
- **Solution**: Check memoization, key extractors, and optimization props

**Issue**: Platform-specific styling not applying
- **Solution**: Verify Platform.select syntax and default values

**Issue**: Context not accessible
- **Solution**: Ensure component is wrapped in provider

---

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)

---

This architecture provides a solid foundation for scalable, maintainable, and performant React Native applications.
