# Developer Guide - Party Kiosk

## Quick Start

### Installation
```bash
npm install
```

### Running the App
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### TypeScript Check
```bash
npx tsc --noEmit
```

---

## Project Architecture

### Directory Structure
```
src/
├── components/       # Reusable UI components
├── constants/        # Theme and app constants
├── context/          # React Context providers
├── data/             # Static data (categories, emojis)
├── screens/          # Screen components
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── validators/       # Data validation schemas
```

---

## Using Theme Constants

### Import Theme
```typescript
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  TOUCH_TARGETS,
  SHADOWS,
  APP_CONSTANTS,
} from '../constants/theme';
```

### Example Usage
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    minHeight: TOUCH_TARGETS.medium,
    paddingHorizontal: SPACING.lg,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
});
```

---

## Using Reusable Components

### Button Component
```typescript
import { Button } from '../components';

<Button
  title="Save"
  variant="primary"        // primary | secondary | danger | warning | ghost
  size="large"             // small | medium | large
  onPress={handleSave}
  loading={isLoading}
  leftIcon={<Icon />}
  accessibilityLabel="Save product"
/>
```

### Card Component
```typescript
import { Card } from '../components';

<Card variant="elevated" padding="lg">
  <Text>Card content</Text>
</Card>
```

### Loading Component
```typescript
import { Loading } from '../components';

<Loading fullScreen text="Loading products..." />
```

### EmptyState Component
```typescript
import { EmptyState } from '../components';

<EmptyState
  emoji="📦"
  title="No products"
  subtitle="Tap 'Add Product' to get started"
  action={<Button title="Add Product" onPress={openModal} />}
/>
```

---

## Using Responsive Utilities

### Device Detection
```typescript
import { isTablet, getGridColumns } from '../utils/responsive';

const deviceIsTablet = isTablet(width);
const columns = getGridColumns(width);

// Conditional rendering
{deviceIsTablet ? <TabletLayout /> : <PhoneLayout />}

// Adaptive columns
<FlatList
  numColumns={columns}
  key={`grid-${columns}`}  // Important for re-rendering
/>
```

### Responsive Sizing
```typescript
import { scaleSize, scaleFontSize } from '../utils/responsive';

const styles = StyleSheet.create({
  text: {
    fontSize: scaleFontSize(FONT_SIZES.lg),
  },
  image: {
    width: scaleSize(100),
    height: scaleSize(100),
  },
});
```

---

## Using Haptic Feedback

```typescript
import { triggerHaptic } from '../utils/haptics';

// Light feedback (button tap)
triggerHaptic('light');

// Medium feedback (selection change)
triggerHaptic('medium');

// Heavy feedback (important action)
triggerHaptic('heavy');

// Success feedback (order completed)
triggerHaptic('success');

// Warning feedback
triggerHaptic('warning');

// Error feedback (deletion)
triggerHaptic('error');
```

---

## Screen Layout Pattern

### Basic Screen Structure
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Loading, EmptyState } from '../components';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function MyScreen() {
  const { data, isLoading } = useApp();

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Screen Title</Text>
        <Button title="Action" onPress={handleAction} />
      </View>

      {/* Content */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});
```

---

## FlatList Optimization

### Optimized FlatList
```typescript
import { APP_CONSTANTS } from '../constants/theme';

const renderItem = useCallback(({ item }) => (
  <ItemComponent item={item} />
), []);

const keyExtractor = useCallback((item) => item.id, []);

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  removeClippedSubviews={Platform.OS === 'android'}
  windowSize={APP_CONSTANTS.LIST_PERFORMANCE.windowSize}
  maxToRenderPerBatch={APP_CONSTANTS.LIST_PERFORMANCE.maxToRenderPerBatch}
  initialNumToRender={APP_CONSTANTS.LIST_PERFORMANCE.initialNumToRender}
  ListEmptyComponent={<EmptyState title="No items" />}
/>
```

---

## Modal Pattern

### Modal with Keyboard Handling
```typescript
import { KeyboardAvoidingView, Platform, Modal } from 'react-native';

<Modal
  visible={isVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={handleClose}
  accessibilityViewIsModal
>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.modalOverlay}
  >
    <Pressable style={styles.modalOverlay} onPress={handleClose}>
      <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
        {/* Modal content */}
      </Pressable>
    </Pressable>
  </KeyboardAvoidingView>
</Modal>
```

---

## Accessibility Guidelines

### All Touchable Elements
```typescript
<TouchableOpacity
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Add product"
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Add Product</Text>
</TouchableOpacity>
```

### Form Inputs
```typescript
<TextInput
  placeholder="Product name"
  accessibilityLabel="Product name input"
  returnKeyType="next"
  onSubmitEditing={focusNextInput}
/>
```

### Minimum Touch Targets
```typescript
// Always use minimum 44px touch targets
minHeight: TOUCH_TARGETS.medium,  // 44px
```

---

## State Management

### Using AppContext
```typescript
import { useApp } from '../context/AppContext';

function MyComponent() {
  const {
    products,
    orders,
    currentOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCurrentOrder,
    removeFromCurrentOrder,
    completeOrder,
    isLoading,
    error,
  } = useApp();

  // Use state and actions
}
```

---

## Performance Best Practices

### 1. Memoize Callbacks
```typescript
const handlePress = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 2. Memoize Derived Data
```typescript
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

### 3. Memoize Components
```typescript
const ProductCard = React.memo(({ product }) => {
  return <Card>...</Card>;
});
```

### 4. Use Stable Keys
```typescript
// Good
keyExtractor={(item) => item.id}

// Bad
keyExtractor={(item, index) => index}
```

---

## Platform-Specific Code

### Platform.select
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  text: {
    fontSize: Platform.select({
      ios: 16,
      android: 14,
      default: 16,
    }),
  },
});
```

### Platform.OS Check
```typescript
if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}
```

### Platform Files
For larger platform differences, create separate files:
- `Component.ios.tsx` - iOS version
- `Component.android.tsx` - Android version
- `Component.tsx` - Shared/default version

---

## Adding New Features

### 1. Create Component
```bash
src/components/MyComponent.tsx
```

### 2. Add to Exports
```typescript
// src/components/index.ts
export { default as MyComponent } from './MyComponent';
```

### 3. Use in Screens
```typescript
import { MyComponent } from '../components';
```

---

## Common Patterns

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
    triggerHaptic('success');
  } catch (error) {
    triggerHaptic('error');
    Alert.alert('Error', error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Confirmation Dialog
```typescript
const handleDelete = (item) => {
  Alert.alert(
    'Delete Item',
    `Are you sure you want to delete "${item.name}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteItem(item.id);
          triggerHaptic('error');
        },
      },
    ]
  );
};
```

### Form Validation
```typescript
const handleSave = () => {
  if (!name.trim()) {
    Alert.alert('Error', 'Please enter a name');
    return;
  }

  const price = parseFloat(priceInput);
  if (isNaN(price) || price <= 0) {
    Alert.alert('Error', 'Please enter a valid price');
    return;
  }

  // Save data
};
```

---

## Debugging

### React Native Debugger
```bash
# Enable debugging
Cmd/Ctrl + D (in simulator)
```

### TypeScript Errors
```bash
npx tsc --noEmit
```

### Console Logs
```typescript
console.log('Debug:', data);
console.error('Error:', error);
console.warn('Warning:', warning);
```

### Performance Monitoring
```typescript
import { InteractionManager } from 'react-native';

InteractionManager.runAfterInteractions(() => {
  console.log('Animation complete');
});
```

---

## Testing Recommendations

### Unit Tests (to be added)
```bash
npm test
```

### Manual Testing Checklist
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Test on tablet
- [ ] Test with VoiceOver/TalkBack
- [ ] Test with large font sizes
- [ ] Test in landscape orientation

---

## Common Issues & Solutions

### Issue: Content Hidden by Notch
**Solution**: Use SafeAreaView
```typescript
<SafeAreaView edges={['top', 'bottom']}>
```

### Issue: Keyboard Covering Input
**Solution**: Use KeyboardAvoidingView
```typescript
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
```

### Issue: FlatList Performance
**Solution**: Add optimization props
```typescript
removeClippedSubviews={Platform.OS === 'android'}
windowSize={10}
```

### Issue: Component Re-rendering
**Solution**: Memoize callbacks and data
```typescript
const callback = useCallback(() => {}, [deps]);
const data = useMemo(() => {}, [deps]);
```

---

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react)
- [Accessibility Guide](https://reactnative.dev/docs/accessibility)

---

## Getting Help

1. Check existing documentation (ARCHITECTURE.md, REFACTORING_SUMMARY.md)
2. Search React Native docs
3. Check Stack Overflow
4. Review existing code patterns in the project

---

Happy coding!
