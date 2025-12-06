# Architecture Guide

## Project Structure

```
party-kiosk/
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Theme and constants
│   ├── context/           # React Context for state
│   ├── data/              # Static data (categories, emojis)
│   ├── screens/           # Full-screen components
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utilities (responsive, haptics)
│   └── validators/        # Zod validation schemas
├── App.tsx                # Root component with navigation
├── index.js               # Entry point
└── package.json
```

## Design Patterns

### 1. Context + Hooks
Global state via React Context with custom `useApp()` hook that prevents misuse outside provider.

### 2. Component Composition
Build from reusable components (Button, Card, Loading, EmptyState) rather than monolithic screens.

### 3. Render Props
FlatList render functions memoized with `useCallback` for performance.

### 4. Error Boundary
ErrorBoundary wraps entire app to catch unhandled errors and display recovery UI.

## State Management

**AppContext** manages:
- Products list
- Current order items
- Completed orders
- Loading and error states

**Data Flow**:
1. User action → Component calls context action
2. Context action → Updates state via setState
3. State update → Triggers re-render
4. Persistence → Debounced save to AsyncStorage (500ms)
5. Validation → Zod schemas ensure data integrity

**Persistence Strategy**:
- Debounced writes reduce AsyncStorage I/O
- Validation prevents corrupted data
- Error handling provides graceful fallback

## Component Architecture

**Atomic**: Button, Card, Loading, EmptyState
**Screens**: ProductsScreen, OrderScreen, HistoryScreen
**Utilities**: ErrorBoundary

**Key Principle**: Components are small, focused, reusable with clear props interfaces.

## Styling System

Centralized theme in `/src/constants/theme.ts`:
- **Colors**: Primary, semantic, status
- **Spacing**: xs (4px) to xxxl (32px)
- **Typography**: Sizes xs to xxxl
- **Touch Targets**: 44px (iOS) / 48px (Android)
- **Shadows**: Elevation system

No magic numbers. All styling uses theme constants.

## Cross-Platform Strategy

**Safe Areas**: SafeAreaView handles iOS notches and Android status bars

**Platform Differences**:
- `Platform.select()` for styling (shadows vs elevation)
- Touch targets meet both iOS (44pt) and Android (48dp) standards
- Haptic feedback gracefully degrades on unsupported platforms

**Keyboard Handling**: KeyboardAvoidingView for modals on both platforms

## Performance Optimization

**List Rendering**:
```typescript
<FlatList
  removeClippedSubviews={Platform.OS === 'android'}
  windowSize={10}
  maxToRenderPerBatch={10}
  initialNumToRender={8}
/>
```

**Memoization**:
- `useCallback` for event handlers
- `useMemo` for derived data
- Context value memoized to prevent unnecessary re-renders

**Key Extractors**: Stable, unique keys for list items

## Best Practices

**Do's**:
- Use TypeScript for type safety
- Memoize expensive operations
- Use SafeAreaView on all screens
- Add accessibility labels
- Use `Platform.select` for differences
- Extract constants to theme
- Validate user input
- Provide user feedback (haptics, loading states)

**Don'ts**:
- Don't use magic numbers
- Don't hardcode colors/spacing
- Don't use inline styles for patterns
- Don't forget loading/error states
- Don't skip accessibility
- Don't ignore platform differences
- Don't use non-memoized callbacks in FlatList
- Don't skip error boundaries

## Development Workflow

**Adding a Screen**:
1. Create in `/src/screens/`
2. Use SafeAreaView
3. Import theme constants
4. Use existing components
5. Add to navigation in App.tsx
6. Test on iOS and Android

**Adding a Component**:
1. Create in `/src/components/`
2. Add TypeScript interface for props
3. Use theme constants
4. Add accessibility props
5. Export from `/src/components/index.ts`

**Modifying Theme**:
1. Edit `/src/constants/theme.ts`
2. Changes propagate automatically
3. Test across all screens and devices

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Content hidden by notch | Use SafeAreaView with proper edges |
| Haptics not working | Test on physical device, not simulator |
| FlatList performance issues | Check memoization and key extractors |
| Platform styling not applying | Verify Platform.select syntax |
| Context not accessible | Ensure component wrapped in AppProvider |

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
