/**
 * Party Kiosk - Main Application Entry Point
 *
 * A modern POS (Point of Sale) system for mobile and web.
 * Built with React Native and Expo for cross-platform compatibility.
 *
 * @module App
 */

import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './src/context/AppContext';
import { ErrorBoundary } from './src/components';
import ProductsScreen from './src/screens/ProductsScreen';
import OrderScreen from './src/screens/OrderScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { COLORS, FONT_SIZES, SPACING, PLATFORM_SPACING } from './src/constants/theme';

const Tab = createBottomTabNavigator();

/**
 * Main App component
 *
 * Sets up the navigation structure with three main screens:
 * - Order: Create and manage current orders
 * - Products: Manage product catalog
 * - History: View order history and statistics
 *
 * Wrapped in ErrorBoundary, SafeAreaProvider, and AppProvider for
 * error handling, safe areas, and global state management.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={COLORS.surface}
          />
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textTertiary,
                tabBarStyle: {
                  backgroundColor: COLORS.surface,
                  borderTopWidth: 1,
                  borderTopColor: COLORS.border,
                  paddingBottom: Platform.select({
                    ios: SPACING.sm,
                    android: SPACING.xs,
                    default: SPACING.xs,
                  }),
                  paddingTop: PLATFORM_SPACING.tabBarPadding,
                  height: Platform.select({
                    ios: 85,
                    android: 60,
                    default: 60,
                  }),
                },
                tabBarLabelStyle: {
                  fontSize: FONT_SIZES.sm,
                  fontWeight: '600',
                },
                tabBarAccessibilityLabel: 'Main navigation',
              }}
            >
              <Tab.Screen
                name="Order"
                component={OrderScreen}
                options={{
                  tabBarLabel: 'Ordine',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="cart" size={size} color={color} />
                  ),
                  tabBarAccessibilityLabel: 'Order tab',
                }}
              />
              <Tab.Screen
                name="Products"
                component={ProductsScreen}
                options={{
                  tabBarLabel: 'Prodotti',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="fast-food" size={size} color={color} />
                  ),
                  tabBarAccessibilityLabel: 'Products tab',
                }}
              />
              <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                  tabBarLabel: 'Storico',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="list" size={size} color={color} />
                  ),
                  tabBarAccessibilityLabel: 'History tab',
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
