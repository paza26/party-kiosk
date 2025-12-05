# Architecture Documentation

**Party Kiosk POS System - Architettura Tecnica Completa**

Versione: 1.0.0
Ultima modifica: 2025-12-05

---

## Indice

1. [Overview](#overview)
2. [Architettura Generale](#architettura-generale)
3. [State Management](#state-management)
4. [Data Flow](#data-flow)
5. [Component Hierarchy](#component-hierarchy)
6. [Pattern e Design Decisions](#pattern-e-design-decisions)
7. [Performance Optimizations](#performance-optimizations)
8. [Data Persistence](#data-persistence)
9. [Validation Strategy](#validation-strategy)
10. [Error Handling](#error-handling)
11. [Responsive Design](#responsive-design)
12. [Future Scalability](#future-scalability)

---

## Overview

Party Kiosk e un'applicazione POS (Point of Sale) costruita con React Native ed Expo, progettata per funzionare su piattaforme mobile (iOS/Android) e web. L'architettura segue i principi di:

- **Separation of Concerns**: Chiara divisione tra UI, business logic e data
- **Unidirectional Data Flow**: State management predittibile con Context API
- **Type Safety**: TypeScript per prevenire errori runtime
- **Performance First**: Ottimizzazioni per lista virtualizzate e operazioni debounced
- **Error Resilience**: Error boundaries e validazione robusta

### Principi Architetturali

1. **Single Source of Truth**: Context API come unico store globale
2. **Immutability**: State updates immutabili per tracciabilita
3. **Component Composition**: Componenti piccoli, riutilizzabili e testabili
4. **Separation UI/Logic**: Hooks custom per isolare business logic
5. **Progressive Enhancement**: Funzionalita avanzate (haptics) come enhancement

---

## Architettura Generale

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│                    (Entry Point)                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──> ErrorBoundary (Error Handling)
             │
             └──> AppProvider (Global State)
                  │
                  └──> NavigationContainer
                       │
                       └──> Tab Navigator
                            │
                            ├──> OrderScreen
                            ├──> ProductsScreen
                            └──> HistoryScreen
```

### Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│        (Screens, Components, UI Logic)               │
├─────────────────────────────────────────────────────┤
│                  Business Logic Layer                │
│         (Context, Hooks, State Management)           │
├─────────────────────────────────────────────────────┤
│                   Data Layer                         │
│        (AsyncStorage, Validation, Types)             │
├─────────────────────────────────────────────────────┤
│                  Platform Layer                      │
│         (React Native, Expo, Native APIs)            │
└─────────────────────────────────────────────────────┘
```

---

## State Management

### Context API Architecture

Party Kiosk utilizza React Context API per lo state management globale. Questa scelta e motivata da:

- **Semplicita**: No learning curve di Redux/MobX
- **Type Safety**: Facile integrazione con TypeScript
- **Performance**: Sufficiente per la scala dell'app
- **Zero Dependencies**: Nessuna libreria esterna necessaria

### AppContext Structure

```typescript
interface AppContextType {
  // State
  products: Product[];
  orders: Order[];
  currentOrder: OrderItem[];
  isLoading: boolean;

  // Product Actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;

  // Order Actions
  addToCurrentOrder: (product: Product) => void;
  removeFromCurrentOrder: (productId: string) => void;
  clearCurrentOrder: () => void;
  completeOrder: (cashPaid?: number) => void;

  // History Actions
  deleteOrder: (orderId: string) => void;
  resetSession: () => void;
}
```

### State Update Flow

```
User Action → Event Handler → Context Action → State Update → Re-render
     ↓                                                           ↓
Haptic Feedback                                         AsyncStorage
```

### State Persistence Strategy

1. **Debounced Save**: Salvataggio con debounce di 500ms per evitare scritture eccessive
2. **Separate Storage Keys**: Products e Orders in chiavi separate per operazioni indipendenti
3. **Validation on Load**: I dati vengono validati al caricamento per garantire integrita
4. **Error Recovery**: Se i dati sono corrotti, viene utilizzato uno stato vuoto

---

## Data Flow

### Unidirectional Data Flow

```
┌──────────────┐
│   AppContext │ ◄──── Load from AsyncStorage
│  (State)     │
└──────┬───────┘
       │
       ├──────────┐
       ↓          ↓
┌──────────┐  ┌──────────┐
│ Products │  │  Orders  │
│  Screen  │  │  Screen  │
└─────┬────┘  └─────┬────┘
      │             │
      └─────┬───────┘
            ↓
      ┌──────────┐
      │  Actions │
      └─────┬────┘
            │
            ↓
      ┌──────────────┐
      │ State Update │
      └──────┬───────┘
             │
             ├──> Re-render Components
             └──> Debounced Save to AsyncStorage
```

### Order Creation Flow

```
1. User selects products from OrderScreen
   ↓
2. addToCurrentOrder() updates currentOrder state
   ↓
3. Component re-renders with updated order
   ↓
4. User completes order
   ↓
5. completeOrder() creates Order object
   ↓
6. Order added to orders array
   ↓
7. currentOrder cleared
   ↓
8. Orders saved to AsyncStorage (debounced)
   ↓
9. Success feedback (haptic + alert)
```

### Product Management Flow

```
1. User creates/edits product
   ↓
2. Form validation (client-side)
   ↓
3. addProduct() or updateProduct() action
   ↓
4. State updated with new/modified product
   ↓
5. Products saved to AsyncStorage (debounced)
   ↓
6. UI re-renders with updated products
```

---

## Component Hierarchy

### Main Application Tree

```
App
├── ErrorBoundary
│   └── AppProvider (Context)
│       └── NavigationContainer
│           └── BottomTabNavigator
│               ├── OrderScreen
│               │   ├── CategoryTabs
│               │   ├── ProductsGrid
│               │   ├── OrderList
│               │   ├── ReceiptModal
│               │   └── PaymentModal
│               │
│               ├── ProductsScreen
│               │   ├── ProductList
│               │   ├── ProductCard
│               │   ├── ProductEditorModal
│               │   └── EmojiPickerModal
│               │
│               └── HistoryScreen
│                   ├── SummaryCards
│                   ├── TopProducts
│                   └── OrdersList
│                       └── OrderCard
```

### Component Responsibilities

#### Screen Components
- **OrderScreen**: Gestisce creazione ordini, selezione prodotti, pagamenti
- **ProductsScreen**: CRUD operations per prodotti
- **HistoryScreen**: Visualizzazione storico e statistiche

#### Modal Components
- **ReceiptModal**: Scontrino ordine con opzioni pagamento
- **PaymentModal**: Input pagamento contanti e calcolo resto
- **ProductEditorModal**: Form creazione/modifica prodotto
- **EmojiPickerModal**: Selezione emoji da lista

#### Utility Components
- **ErrorBoundary**: Cattura e gestisce errori React

---

## Pattern e Design Decisions

### 1. Hooks Pattern

**Custom Hook: useApp()**

```typescript
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

**Vantaggi**:
- Type-safe access al context
- Runtime check per garantire Provider
- Single import per tutti i componenti

### 2. Memoization Strategy

**useMemo per Computed Values**:
```typescript
const total = useMemo(
  () => currentOrder.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  [currentOrder]
);
```

**useCallback per Event Handlers**:
```typescript
const handleAddToOrder = useCallback((product: Product) => {
  addToCurrentOrder(product);
  triggerHaptic('light');
}, [addToCurrentOrder, triggerHaptic]);
```

**Motivazione**: Evita re-render inutili e ricreazione di funzioni

### 3. Debouncing Pattern

```typescript
const debouncedSave = useCallback((data: T[]) => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  timeoutRef.current = setTimeout(async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  }, DEBOUNCE_DELAY);
}, []);
```

**Benefici**:
- Riduce scritture su AsyncStorage
- Migliora performance durante editing rapido
- Garantisce salvataggio finale

### 4. Error Boundary Pattern

```typescript
class ErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
}
```

**Funzionalita**:
- Cattura errori in componenti figli
- Mostra UI fallback user-friendly
- Log dettagli in dev mode
- Permette recovery con reset

### 5. Validation Pattern

```typescript
// Schema definition
const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  price: z.number().positive().finite(),
  // ...
});

// Validation function
export const validateProduct = (data: unknown) => {
  try {
    return { success: true, data: ProductSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Unknown error' }] };
  }
};
```

---

## Performance Optimizations

### 1. List Virtualization

Tutte le FlatList utilizzano virtualizzazione per performance ottimali:

```typescript
<FlatList
  data={products}
  renderItem={renderItem}
  // Optimization props
  removeClippedSubviews={true}    // Rimuove view fuori viewport
  windowSize={10}                  // Buffer intorno al viewport
  maxToRenderPerBatch={10}         // Items per batch
  initialNumToRender={8}           // Render iniziale
/>
```

### 2. Debounced AsyncStorage Writes

- **500ms debounce** su products e orders
- **Separate timeouts** per indipendenza
- **Cleanup on unmount** per prevenire memory leaks

### 3. Memoization

- **useMemo**: Totali, filtered lists, computed values
- **useCallback**: Event handlers, render functions
- **React.memo**: Componenti puri (future implementation)

### 4. Code Splitting

Attualmente non implementato, ma preparato per:
- **Screen-level splitting** con React.lazy()
- **Component-level splitting** per modali pesanti

### 5. Responsive Performance

```typescript
const isTablet = width >= 768;

// Adatta numero colonne
numColumns={isTablet ? 4 : 2}

// Layout diverso per evitare re-render
key={isTablet ? 'tablet' : 'mobile'}
```

---

## Data Persistence

### AsyncStorage Strategy

```typescript
const STORAGE_KEYS = {
  PRODUCTS: '@party_kiosk_products',
  ORDERS: '@party_kiosk_orders',
};
```

### Data Flow

```
┌─────────────────────────────────────────────────┐
│             Application Lifecycle                │
└─────────────────────────────────────────────────┘

App Mount
   ↓
Load from AsyncStorage
   ↓
Validate Data (Zod)
   ↓
Set State
   ↓
... User Interactions ...
   ↓
State Updates
   ↓
Debounced Save (500ms)
   ↓
Write to AsyncStorage
   ↓
... App Continues ...
   ↓
Component Unmount
   ↓
Cleanup Timeouts
```

### Error Handling on Load

```typescript
try {
  const data = await AsyncStorage.getItem(KEY);
  if (data) {
    const parsed = JSON.parse(data);
    const validation = validate(parsed);

    if (validation.success) {
      setState(validation.data);
    } else {
      console.error('Invalid data:', validation.errors);
      setState([]); // Fallback to empty
    }
  }
} catch (error) {
  console.error('Load error:', error);
  setState([]); // Fallback to empty
}
```

---

## Validation Strategy

### Runtime Validation with Zod

**Philosophy**: Trust nothing, validate everything

### Validation Points

1. **On Load**: Dati da AsyncStorage validati prima di usarli
2. **On User Input**: Form validation prima del submit
3. **Before Save**: Double-check prima di persistere

### Schema Structure

```typescript
// Product validation
ProductSchema
  ├── id: string (min 1)
  ├── name: string (1-100 chars)
  ├── emoji: string (min 1)
  ├── price: number (positive, finite)
  ├── buttonColor: string (hex color regex)
  └── category: string (optional)

// Order validation
OrderSchema
  ├── id: string (min 1)
  ├── items: array (min 1)
  │   └── OrderItemSchema
  │       ├── product: ProductSchema
  │       └── quantity: number (positive int)
  ├── total: number (non-negative, finite)
  ├── timestamp: Date
  ├── cashPaid: number (optional, non-negative)
  └── change: number (optional, non-negative)
```

### Validation Benefits

- **Type Safety**: Garantisce struttura dati corretta
- **Data Integrity**: Previene stati inconsistenti
- **Error Recovery**: Fallback graceful su dati corrotti
- **Migration Ready**: Facilita future migrazioni schema

---

## Error Handling

### Multi-Layer Error Handling

```
┌─────────────────────────────────────────┐
│       Error Boundary (Component)         │ ← React errors
├─────────────────────────────────────────┤
│     Try-Catch (Async Operations)        │ ← Async errors
├─────────────────────────────────────────┤
│    Validation (Data Integrity)          │ ← Data errors
├─────────────────────────────────────────┤
│     User Alerts (User Errors)           │ ← User feedback
└─────────────────────────────────────────┘
```

### Error Types

1. **Component Errors**: Catturati da ErrorBoundary
2. **Async Errors**: Try-catch con console.error
3. **Validation Errors**: Zod error handling con feedback utente
4. **User Errors**: Alert per input invalidi

### Error Recovery

- **ErrorBoundary**: Reset button per recovery
- **Validation**: Fallback a stato vuoto
- **AsyncStorage**: Retry logic (future)

---

## Responsive Design

### Breakpoint Strategy

```typescript
const BREAKPOINTS = {
  mobile: width < 768,
  tablet: width >= 768 && width < 1024,
  desktop: width >= 1024,
};

// Current implementation
const isTablet = width >= 768;
```

### Layout Adaptation

#### OrderScreen

**Mobile**:
```
┌──────────────┐
│  Tab Bar     │
├──────────────┤
│  Products    │ ← Tab 1
│   or         │
│  Order       │ ← Tab 2
└──────────────┘
```

**Tablet**:
```
┌──────────────────────────────┐
│         Header               │
├───────────────┬──────────────┤
│   Products    │    Order     │
│   (Left)      │   (Right)    │
│               │              │
└───────────────┴──────────────┘
```

### Grid Adaptation

- **Mobile**: 2 columns product grid
- **Tablet**: 4 columns product grid
- **Key prop**: Forza re-mount su breakpoint change

---

## Future Scalability

### Planned Enhancements

#### 1. State Management Evolution

**Current**: Context API
**Future Options**:
- Redux Toolkit (if complexity grows)
- Zustand (lightweight alternative)
- Jotai/Recoil (atomic state)

**Migration Path**: Mantiene interfaccia useApp() per backward compatibility

#### 2. Backend Integration

```
Current Architecture:
App ←→ AsyncStorage

Future Architecture:
App ←→ Local Cache ←→ Backend API
       (AsyncStorage)    (REST/GraphQL)
```

**Preparation**:
- Separation of concerns gia pronta
- Validation layer riutilizzabile
- Type system compatibile con API responses

#### 3. Offline-First Strategy

```
┌─────────────────────────────────────┐
│          Sync Manager                │
├─────────────────────────────────────┤
│  Local State ←→ Queue ←→ Backend    │
└─────────────────────────────────────┘
```

**Features**:
- Queue pending operations
- Sync on connection restore
- Conflict resolution

#### 4. Real-Time Features

**Potential Use Cases**:
- Multi-device sync
- Live order updates
- Collaborative editing

**Technology Options**:
- WebSockets
- Server-Sent Events
- Firebase Realtime Database

#### 5. Advanced Analytics

```
Current: Basic summaries
Future: Advanced analytics
  ├── Time-series data
  ├── Product trends
  ├── Revenue forecasting
  └── Custom reports
```

---

## Architecture Best Practices

### Do's

1. **Keep Context Lean**: Solo stato veramente globale
2. **Validate Early**: Valida input appena possibile
3. **Memoize Expensive Operations**: useMemo/useCallback per performance
4. **Handle Errors Gracefully**: Mai crashare l'app
5. **Type Everything**: TypeScript strict mode
6. **Cleanup Resources**: Timeout, listeners, subscriptions

### Don'ts

1. **Don't Overfetch**: Carica solo dati necessari
2. **Don't Block UI**: Operazioni async sempre in background
3. **Don't Trust User Input**: Valida sempre
4. **Don't Ignore Errors**: Log sempre per debugging
5. **Don't Premature Optimize**: Misura prima di ottimizzare

---

## Diagrammi Tecnici

### State Update Lifecycle

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       ↓
┌──────────────┐
│Event Handler │ ← useCallback
└──────┬───────┘
       ↓
┌──────────────┐
│Context Action│ ← addProduct, completeOrder, etc.
└──────┬───────┘
       ↓
┌──────────────┐
│ State Update │ ← setState
└──────┬───────┘
       ├──────────────┐
       ↓              ↓
┌──────────────┐ ┌──────────────┐
│  Re-render   │ │ Debounced    │
│  Components  │ │ AsyncStorage │
└──────────────┘ └──────────────┘
```

### Component Communication

```
AppContext (Global State)
    ↕
┌───┴───┬───────┬────────┐
↓       ↓       ↓        ↓
Order   Products History  Navigation
Screen  Screen   Screen
↕       ↕       ↕
Modals  Forms   Lists
```

---

## Conclusioni

L'architettura di Party Kiosk e progettata per:

- **Semplicita**: Facile da comprendere e mantenere
- **Scalabilita**: Pronta per crescita futura
- **Performance**: Ottimizzata per esperienza utente fluida
- **Robustezza**: Error handling e validation completi
- **Manutenibilita**: Type-safe, ben documentato, testabile

La struttura modulare e i pattern utilizzati permettono facili estensioni e integrazioni future senza major refactoring.

---

**Prossimi Passi**:
- Vedi [COMPONENTS.md](COMPONENTS.md) per dettagli sui componenti
- Vedi [API.md](API.md) per documentazione API
- Vedi [DEVELOPMENT.md](DEVELOPMENT.md) per guida sviluppo
