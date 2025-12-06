# Party Kiosk - POS System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-0.76.5-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-52.0.0-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6.svg)
![Tests](https://img.shields.io/badge/tests-495_passing-green.svg)

Modern Point of Sale (POS) application for mobile and web. Built with React Native and Expo for cafes, restaurants, and kiosks.

## Features

- **Product Management** - Create, edit, and delete products with emojis and categories
- **Order Creation** - Touch interface with category filtering and real-time totals
- **Order History** - Complete history with statistics and revenue tracking
- **Payment Options** - Direct payment or cash with automatic change calculation
- **Persistent Storage** - All data saved locally with AsyncStorage
- **Responsive Design** - Adapts to phone, tablet, and desktop layouts
- **Haptic Feedback** - Tactile feedback on iOS and Android
- **Data Validation** - Runtime validation with Zod schemas

## Quick Start

### Install

```bash
git clone https://github.com/yourusername/party-kiosk.git
cd party-kiosk
npm install
```

### Run

```bash
npm run web      # Web (fastest for development)
npm run android  # Android (emulator or device)
npm run ios      # iOS (macOS only, requires Xcode)
```

## Requirements

- Node.js 18.x+
- npm 9.x+
- Expo CLI (latest)

**Platform Support:**
- iOS 13.0+ (iPhone 8+, all iPads)
- Android 6.0+ (API 23+)
- Modern browsers (Chrome, Safari, Firefox, Edge)

## Project Structure

```
party-kiosk/
├── src/
│   ├── components/      # Reusable UI (Button, Card, etc.)
│   ├── screens/         # OrderScreen, ProductsScreen, HistoryScreen
│   ├── context/         # Global state with AsyncStorage
│   ├── validators/      # Zod schemas
│   └── utils/           # Helpers and responsive utilities
├── docs/                # Complete documentation
├── App.tsx              # Entry point
└── package.json         # Dependencies
```

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.76.5 | Cross-platform UI |
| Expo | 52.0.0 | Build toolchain |
| TypeScript | 5.3.3 | Type safety |
| React Navigation | 7.0.13 | Navigation |
| Zod | 4.1.13 | Validation |

## Documentation

📚 **Complete documentation in [docs/](./docs/)**

- [Architecture](./docs/ARCHITECTURE.md) - System design and patterns
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Development workflow
- [Components](./docs/COMPONENTS.md) - Component library reference
- [Installation](./docs/INSTALL.md) - Detailed setup instructions

## Testing

```bash
npm test              # Run all 495 tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## License

Private and proprietary. All rights reserved.

**Copyright (c) 2025 Party Kiosk**

---

Built for cafes, restaurants, and kiosks • Last updated: 2025-12-06
