# Installation Guide

## Prerequisites

- Node.js 16+ and npm/yarn installed
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode installed (macOS)
- Android: Android Studio with SDK installed

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install New Packages

```bash
npm install zod expo-haptics react-native-tab-view
```

## Running the App

### Development

```bash
npm start
```

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Web

```bash
npm run web
```

## Verify Installation

The app should:
- Start without dependency errors
- Show haptic feedback on button taps (physical device only)
- Display product categories in OrderScreen
- Switch layout between tablet and mobile based on screen size

## Troubleshooting

**Cannot find module 'zod'**:
```bash
rm -rf node_modules
npm install
```

**expo-haptics not found**:
```bash
npx expo install expo-haptics
```

**Layout not responsive**:
```bash
npx expo start --clear
```

## Important Notes

- Haptic feedback only works on physical iOS/Android devices
- TabView layout visible only on screens < 768px width
- Corrupted AsyncStorage data is automatically reset during load
- All changes maintain backward compatibility
