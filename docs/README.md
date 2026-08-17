# DOCUMENTACIÓN DEL PROYECTO MOVIL-INIAP-FRONT

## 1. ÍNDICE DE DOCUMENTOS

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [01_ESTRUCTURA_GENERAL.md](./01_ESTRUCTURA_GENERAL.md) | Arquitectura de carpetas, proveedores, rutas, estructura de componentes y servicios |
| 02 | [02_LOGIN_Y_AUTENTICACION.md](./02_LOGIN_Y_AUTENTICACION.md) | Sistema de login (invitado, técnico, merge), colaboradores, persistencia |
| 03 | [03_SISTEMA_DE_SYNC.md](./03_SISTEMA_DE_SYNC.md) | Sistema de sincronización offline-first, upload/download, estados |
| 04 | [04_BD_LOCAL_SQLITE.md](./04_BD_LOCAL_SQLITE.md) | Base de datos SQLite con Drizzle ORM, tablas, funciones CRUD |
| 05 | [05_COMPONENTES.md](./05_COMPONENTES.md) | Componentes de UI, hooks, contexts, estructura |
| 06 | [06_SERVICIOS.md](./06_SERVICIOS.md) | Servicios API, auth, sync, lotes, proyectos, theme |
| 07 | [07_PANTALLAS_Y_NAVEGACION.md](./07_PANTALLAS_Y_NAVEGACION.md) | Rutas Expo Router, layouts, flujos de navegación |
| 08 | [08_BIBLIOTECAS_INSTALADAS.md](./08_BIBLIOTECAS_INSTALADAS.md) | Todas las dependencias npm/expo con versiones |
| 09 | [09_FLUJO_DE_DATOS.md](./09_FLUJO_DE_DATOS.md) | Diagramas de flujo de acciones principales, APIs |

---

## 2. RESUMEN EJECUTIVO

### 2.1 Tecnología

- **Framework:** Expo SDK 54 con React Native 0.81
- **Navegación:** Expo Router (basado en archivos)
- **Base de Datos:** SQLite + Drizzle ORM (local)
- **Estado:** React Context + hooks
- **UI:** React Native + Tamagui + Skia

### 2.2 Tipos de Usuario

| Tipo | Descripción | Acceso |
|------|-------------|--------|
| **Invitado** | Sin cuenta, identificado por device_uuid | Solo datos locales |
| **Técnico** | Usuario con credenciales INIAP | Todos sus datos + merge |
| **Colaborador** | Agregado a proyectos | Solo proyectos que fue agregado |

### 2.3 Patrón Offline-First

1. Guardar en SQLite primero
2. Intentar subir a API en background
3. Si falla, queda como "pending"
4. Sincronizar cuando haya conexión

---

## 3. GUÍA RÁPIDA DE ARCHIVOS CLAVE

| Archivo | Propósito |
|---------|-----------|
| `app/_layout.js` | Root layout con Providers |
| `services/auth/useAuth.js` | AuthProvider principal |
| `services/api/useApi.js` | Cliente HTTP con auth |
| `db/client.js` | SQLite + Drizzle ORM |
| `services/sync/uploadService.js` | Subir datos pendientes |
| `services/sync/downloadService.js` | Descargar datos del servidor |

---

## 4. COMANDOS ÚTILES

```bash
# Iniciar proyecto
npm start

# Resetear proyecto
npm run reset-project

# Iniciar en iOS
npm run ios

# Iniciar en Android
npm run android

# Linting
npm run lint
```

---

## 5. VARIABLES DE ENTORNO

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## 6. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
movil-INIAP-Front/
├── app/                    # Rutas Expo Router
├── components/             # Componentes React
├── services/               # Lógica de negocio
├── db/                     # SQLite + Drizzle
├── src/styles/             # Estilos y temas
├── scripts/                # Scripts utility
└── package.json            # Dependencias

/Users/david/Documentacion/  # Esta documentación
```

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
