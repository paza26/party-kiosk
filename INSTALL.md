# Guida Installazione Rapida - Party Kiosk App

## 1. Installa le Nuove Dipendenze

Esegui uno dei seguenti comandi nella root del progetto:

### Con npm:
```bash
npm install zod expo-haptics react-native-tab-view
```

### Con yarn:
```bash
yarn add zod expo-haptics react-native-tab-view
```

### Con pnpm:
```bash
pnpm add zod expo-haptics react-native-tab-view
```

## 2. Avvia l'Applicazione

```bash
npm start
```

oppure:

```bash
npx expo start
```

## 3. Testa su Dispositivo

### iOS:
```bash
npm run ios
```

### Android:
```bash
npm run android
```

### Web (opzionale):
```bash
npm run web
```

## Verifica Installazione

Se tutto è stato installato correttamente, l'app dovrebbe:
- Avviarsi senza errori di dipendenze mancanti
- Mostrare haptic feedback quando tocchi i pulsanti (solo su dispositivo fisico)
- Visualizzare le categorie prodotti nella schermata ordini
- Cambiare layout tra tablet e mobile in base alla dimensione dello schermo

## Troubleshooting

### Errore: Cannot find module 'zod'
```bash
rm -rf node_modules
npm install
```

### Errore: expo-haptics not found
Assicurati di avere Expo SDK 52.0.0 installato:
```bash
npx expo install expo-haptics
```

### Layout non responsivo
Pulisci la cache Metro:
```bash
npx expo start --clear
```

## Note Importanti

- **Haptic Feedback:** Funziona solo su dispositivi fisici iOS/Android, non su emulatori/simulatori
- **TabView:** Visibile solo su schermi < 768px di larghezza
- **Validazione Zod:** Se hai dati esistenti in AsyncStorage corrotti, verranno resettati automaticamente

## File Modificati

Tutti i file sono stati aggiornati e sono pronti all'uso:
- ✅ `/src/types/index.ts`
- ✅ `/src/context/AppContext.tsx`
- ✅ `/src/screens/OrderScreen.tsx`
- ✅ `/src/screens/ProductsScreen.tsx`
- ✅ `/src/screens/HistoryScreen.tsx`
- ✅ `App.tsx`

## File Nuovi Creati

- ✅ `/src/data/categories.ts`
- ✅ `/src/validators/schemas.ts`
- ✅ `/src/components/ErrorBoundary.tsx`

## Prossimi Passi

1. Testa l'app su vari dispositivi (phone e tablet)
2. Verifica che il layout responsivo funzioni correttamente
3. Prova a creare prodotti con categorie diverse
4. Controlla che il haptic feedback sia presente (su dispositivo fisico)
5. Consulta `IMPROVEMENTS.md` per i dettagli completi

## Supporto

Per dubbi o problemi, consulta:
- `IMPROVEMENTS.md` - Documentazione dettagliata delle modifiche
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
