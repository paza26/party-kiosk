# Components Documentation

Component architecture for Party Kiosk application.

## Overview

**Component Types:**
- **Screen Components**: Full-screen views (ProductsScreen, OrderScreen, HistoryScreen)
- **Utility Components**: Cross-cutting concerns (ErrorBoundary)
- **Reusable Components**: Button, Card, Loading, EmptyState

---

## Screen Components

### OrderScreen (`src/screens/OrderScreen.tsx`)

**Purpose**: Create orders with product selection and payment handling.

**Key Features**:
- Responsive layout: tabs (mobile) / split-view (tablet)
- Category filtering with horizontal scroll
- Haptic feedback on all interactions
- Receipt and payment modals
- Real-time total calculation

**State**: Uses AppContext + local state for UI (modal visibility, category selection)

---

### ProductsScreen (`src/screens/ProductsScreen.tsx`)

**Purpose**: Manage product catalog (CRUD operations).

**Key Features**:
- Product listing with edit/delete actions
- Modal form with emoji picker and color selector
- Form validation (name required, positive price)
- 6 product categories
- Haptic feedback on interactions

**State**: Uses AppContext + local state for form management

---

### HistoryScreen (`src/screens/HistoryScreen.tsx`)

**Purpose**: Display order history and sales statistics.

**Key Features**:
- Summary cards (total orders, total revenue)
- Top products ranking by quantity sold
- Full order history with item details
- Delete individual orders or reset entire session
- Confirmation dialogs for destructive actions

**State**: Uses AppContext + computed values (totals, rankings)

---

## Utility Components

### ErrorBoundary (`src/components/ErrorBoundary.tsx`)

**Purpose**: Catch unhandled React errors and display user-friendly fallback UI.

**Props**:
- `children`: Components to wrap
- `fallback?`: Custom error UI renderer

**Features**:
- Catches component tree errors
- Shows friendly error message
- Dev mode shows full stack trace
- Recovery button to retry

**Usage**:
```typescript
<ErrorBoundary>
  <AppProvider>
    <NavigationContainer>{/* app */}</NavigationContainer>
  </AppProvider>
</ErrorBoundary>
```

---

## Component Patterns

**Custom Hooks**: Use `useApp()` to access context
**Memoization**: `useMemo` for computed values, `useCallback` for callbacks
**Responsive**: Check `useWindowDimensions()` with 768px tablet breakpoint
**Lists**: Use FlatList with `renderItem`, `keyExtractor`, and optimization props
**Modals**: Implement with `Modal` component, handle keyboard with `KeyboardAvoidingView`

---

## Best Practices

- Component structure: Imports → Types → Constants → Component → Styles
- Use SafeAreaView for all screens
- Memoize callbacks in FlatList render functions
- Add accessibility labels to interactive elements
- Validation before persisting data
- Use theme constants (COLORS, SPACING, FONT_SIZES)
- Handle loading and error states
- Confirm destructive actions

---

## See Also

- ARCHITECTURE.md: Design patterns and system structure
- DEVELOPER_GUIDE.md: Setup, usage, and development workflow
