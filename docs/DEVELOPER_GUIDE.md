# Developer Guide

## Quick Start

```bash
npm install
npm start
npm run ios    # or android/web
```

## Project Structure

```
src/
├── components/       # Reusable components
├── constants/        # Theme constants
├── context/          # React Context
├── data/             # Static data
├── screens/          # Full-screen views
├── types/            # TypeScript types
├── utils/            # Utilities
└── validators/       # Zod schemas
```

## Using Reusable Components

### Button
```typescript
import { Button } from '../components';

<Button
  title="Save"
  variant="primary"    // primary | secondary | danger | warning | ghost
  size="large"         // small | medium | large
  onPress={handleSave}
  loading={isLoading}
  disabled={isDisabled}
/>
```

### Card
```typescript
<Card variant="elevated" padding="lg">
  <Text>Content</Text>
</Card>
```

### Loading
```typescript
<Loading fullScreen text="Loading..." />
```

### EmptyState
```typescript
<EmptyState
  emoji="📦"
  title="No items"
  subtitle="Add one to get started"
  action={<Button title="Add" onPress={handleAdd} />}
/>
```

## Using Theme Constants

```typescript
import {
  COLORS, SPACING, FONT_SIZES, BORDER_RADIUS,
  TOUCH_TARGETS, SHADOWS, APP_CONSTANTS
} from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    minHeight: TOUCH_TARGETS.medium,
    borderRadius: BORDER_RADIUS.md,
  },
});
```

## Using Responsive Utilities

```typescript
import { isTablet, getGridColumns, scaleFontSize } from '../utils/responsive';

const { width } = useWindowDimensions();
const deviceIsTablet = isTablet(width);
const columns = getGridColumns(width);
```

## Using Haptic Feedback

```typescript
import { triggerHaptic } from '../utils/haptics';

triggerHaptic('light');    // Button tap
triggerHaptic('medium');   // Selection change
triggerHaptic('heavy');    // Important action
triggerHaptic('success');  // Completion
triggerHaptic('warning');  // Warning
triggerHaptic('error');    // Deletion
```

## Screen Pattern

```typescript
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
        <Text style={styles.title}>Title</Text>
      </View>
      {data.length === 0 ? (
        <EmptyState emoji="📦" title="No data" />
      ) : (
        <FlatList data={data} renderItem={renderItem} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
  },
});
```

## FlatList Optimization

```typescript
const renderItem = useCallback(({ item }) => (
  <ItemComponent item={item} />
), []);

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={Platform.OS === 'android'}
  windowSize={APP_CONSTANTS.LIST_PERFORMANCE.windowSize}
  maxToRenderPerBatch={APP_CONSTANTS.LIST_PERFORMANCE.maxToRenderPerBatch}
  initialNumToRender={APP_CONSTANTS.LIST_PERFORMANCE.initialNumToRender}
  ListEmptyComponent={<EmptyState title="No items" />}
/>
```

## Modal Pattern

```typescript
<Modal
  visible={isVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={handleClose}
>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <Pressable style={styles.overlay} onPress={handleClose}>
      <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
        {/* Modal content */}
      </Pressable>
    </Pressable>
  </KeyboardAvoidingView>
</Modal>
```

## Accessibility

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

Ensure minimum touch targets: `minHeight: TOUCH_TARGETS.medium`

## State Management

```typescript
import { useApp } from '../context/AppContext';

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
```

## Performance Tips

1. **Memoize callbacks**: `useCallback` for event handlers
2. **Memoize data**: `useMemo` for computed values
3. **Stable keys**: Use `item.id` as FlatList key
4. **Avoid inline styles**: Use constants instead
5. **Use React.memo**: For components that receive same props

## Platform-Specific Code

```typescript
import { Platform } from 'react-native';

// For small differences
const padding = Platform.select({
  ios: SPACING.sm,
  android: SPACING.xs,
  default: SPACING.xs,
});

// For large differences, create separate files:
// Component.ios.tsx, Component.android.tsx, Component.tsx
```

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
Alert.alert(
  'Delete',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: () => {
        handleDelete();
        triggerHaptic('heavy');
      },
    },
  ]
);
```

### Form Validation
```typescript
if (!name.trim()) {
  Alert.alert('Error', 'Name required');
  return;
}

const price = parseFloat(priceInput);
if (isNaN(price) || price <= 0) {
  Alert.alert('Error', 'Invalid price');
  return;
}
```

## Adding Features

1. **Create component**: `/src/components/Feature.tsx`
2. **Add to exports**: `/src/components/index.ts`
3. **Use in screens**: `import { Feature } from '../components'`
4. **Test on devices**: iOS and Android

## Debugging

```bash
# TypeScript check
npx tsc --noEmit

# Console logs
console.log('Debug:', data);
console.error('Error:', error);
```

Enable debugger in simulator: Cmd/Ctrl+D

## Testing Checklist

- [ ] Runs on iOS simulator
- [ ] Runs on Android emulator
- [ ] Runs on physical iOS device
- [ ] Runs on physical Android device
- [ ] Responsive on tablet
- [ ] VoiceOver/TalkBack works
- [ ] Large font sizes work
- [ ] Landscape orientation works

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Content hidden by notch | Use SafeAreaView |
| Keyboard covers input | Use KeyboardAvoidingView |
| FlatList slow | Check memoization and keys |
| Component re-renders | Memoize callbacks and data |
| Module not found | Check imports and barrel export |

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react)
