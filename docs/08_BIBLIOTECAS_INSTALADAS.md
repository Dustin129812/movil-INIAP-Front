# BIBLIOTECAS INSTALADAS

## 1. DEPENDENCIAS PRINCIPALES

### 1.1 Expo SDK

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo` | ~54.0.35 | Framework principal |
| `expo-router` | ~6.0.24 | Navegación basada en archivos |
| `expo-status-bar` | ~3.0.9 | Barra de estado |
| `expo-splash-screen` | ~31.0.13 | Pantalla de splash |
| `expo-constants` | ~18.0.13 | Constantes del sistema |

### 1.2 Base de Datos

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-sqlite` | ~16.0.10 | Base de datos SQLite local |
| `drizzle-orm` | ^0.38.0 | ORM para SQLite |

### 1.3 Autenticación y Almacenamiento

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-secure-store` | ~15.0.8 | Almacenamiento seguro (tokens) |
| `expo-crypto` | ~15.0.9 | Generación de UUIDs |
| `@react-native-async-storage/async-storage` | 2.2.0 | Almacenamiento key-value |

### 1.4 Navegación

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `@react-navigation/native` | ^7.1.8 | Navegación principal |
| `@react-navigation/bottom-tabs` | ^7.4.0 | Pestañas inferiores |
| `@react-navigation/elements` | ^2.6.3 | Elementos de navegación |
| `react-native-screens` | ~4.16.0 | Optimización de pantallas |
| `react-native-safe-area-context` | ~5.6.0 | Áreas seguras |

### 1.5 UI y Animaciones

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `react-native-reanimated` | ~4.1.1 | Animaciones |
| `react-native-gesture-handler` | ~2.28.0 | Gestos |
| `@gorhom/bottom-sheet` | ^5.2.14 | Bottom sheets |
| `react-native-svg` | 15.12.1 | Gráficos vectoriales |
| `expo-blur` | ~15.0.8 | Efectos de blur |
| `expo-linear-gradient` | ~15.0.8 | Gradientes |
| `moti` | ^0.30.0 | Animaciones con Reanimated |
| `@shopify/react-native-skia` | 2.2.12 | Gráficos 2D |
| `react-native-redash` | ^18.1.5 | Helpers para Reanimated |
| `tamagui` | ^2.5.1 | UI kit |
| `@tamagui/config` | ^2.5.1 | Configuración de Tamagui |
| `@tamagui/lucide-icons` | ^1.144.4 | Iconos para Tamagui |

### 1.6 Mapas y Location

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `react-native-maps` | 1.20.1 | Mapas interactivos |
| `expo-location` | ~19.0.8 | Localización GPS |

### 1.7 Red y Conectividad

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `@react-native-community/netinfo` | 11.4.1 | Información de red |

### 1.8 Notificaciones

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-notifications` | ~0.32.17 | Notificaciones push y locales |

### 1.9 Imagen y Media

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-image` | ~3.0.11 | Componente de imagen optimizado |
| `expo-clipboard` | ~8.0.8 | Clipboard |
| `expo-image-picker` | - | Selector de imágenes (verificar) |
| `react-native-view-shot` | 4.0.3 | Captura de pantalla |

### 1.10 Dispositivo

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-device` | ~8.0.10 | Información del dispositivo |

### 1.11 Haptics y Feedback

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-haptics` | ~15.0.8 | Feedback háptico |

### 1.12 Link y Browser

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-linking` | ~8.0.12 | Deep links |
| `expo-web-browser` | ~15.0.11 | Browser externo |

### 1.13 Sistema

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `expo-font` | ~14.0.12 | Carga de fuentes |
| `expo-screen-orientation` | ~9.0.9 | Orientación de pantalla |
| `expo-system-ui` | ~6.0.9 | UI del sistema |
| `expo-symbols` | ~1.0.8 | Símbolos del sistema |

### 1.14 Iconos

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `@expo/vector-icons` | ^15.0.3 | Iconos vectoriales (Feather, etc.) |

### 1.15 React y Web

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `react` | 19.1.0 | Framework UI |
| `react-dom` | 19.1.0 | DOM para web |
| `react-native` | 0.81.5 | Framework móvil |
| `react-native-web` | ~0.21.0 | Compatibilidad web |

### 1.16 Experimental

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `react-native-worklets` | 0.5.1 | Worklets (experimental) |
| `silex` | ^0.1.5 | (verificar uso) |

---

## 2. DEPENDENCIAS DE DESARROLLO

| Biblioteca | Versión | Uso |
|------------|---------|-----|
| `typescript` | ~5.9.2 | TypeScript |
| `eslint` | ^9.25.0 | Linting |
| `eslint-config-expo` | ~10.0.0 | ESLint config para Expo |
| `@types/react` | ~19.1.0 | Tipos de React |
| `@expo/ngrok` | ^4.1.3 | Tunneling para desarrollo |

---

## 3. PAQUETES ELIMINADOS/NO USADOS

Según el análisis del código:

- `expo-image-picker` - No se usa actualmente
- `silex` - ¿Usado?

---

## 4. CONFIGURACIÓN IMPORTANTE

### 4.1 babel.config.js

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Debe ser último
    ],
  };
};
```

### 4.2 app.json (expo)

```json
{
  "expo": {
    "name": "INIAP Gestion Agricola",
    "slug": "app-front",
    "version": "1.0.0",
    "sdkVersion": "54.0.0",
    "plugins": [
      "expo-secure-store",
      "expo-sqlite",
      "expo-location",
      "expo-notifications"
    ]
  }
}
```

---

## 5. VARIABLES DE ENTORNO

```
EXPO_PUBLIC_API_URL    # URL del backend (ej: http://localhost:8000)
```

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
