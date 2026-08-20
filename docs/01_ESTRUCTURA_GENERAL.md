# ESTRUCTURA GENERAL DEL PROYECTO

## 1. ARQUITECTURA DE CARPETAS

```
movil-INIAP-Front/           # Raíz del proyecto React Native/Expo
├── app/                      # Pantallas (Expo Router)
├── components/               # Componentes reutilizables
├── services/                 # Servicios (API, auth, sync, theme)
├── db/                       # Base de datos SQLite (Drizzle ORM)
├── src/styles/               # Estilos globales y temas
├── scripts/                  # Scripts de utilidad
└── package.json              # Dependencias del proyecto

/Users/david/Documentacion/   # Documentación (fuera del proyecto)
├── 01_ESTRUCTURA_GENERAL.md
├── 02_LOGIN_Y_AUTENTICACION.md
├── 03_SISTEMA_DE_SYNC.md
├── 04_BD_LOCAL_SQLITE.md
├── 05_COMPONENTES.md
├── 06_SERVICIOS.md
├── 07_PANTALLAS_Y_NAVEGACION.md
├── 08_BIBLIOTECAS_INSTALADAS.md
└── 09_FLUJO_DE_DATOS.md
```

---

## 2. JERARQUÍA DE PROVEEDORES (Providers)

### app/_layout.js
```
ThemeProvider
└── NotificationProvider
    └── AuthProvider
        └── AuthNavigator (maneja login/home)
```

---

## 3. ESTRUCTURA DE APP (EXPO ROUTER)

| Ruta | Descripción |
|------|-------------|
| app/_layout.js | Root layout - Providers (Theme → Notification → Auth) |
| app/login/index.js | Pantalla de login |
| app/(tabs)/_layout.js | Tab layout + SearchProvider + CustomTabBar |
| app/(tabs)/index.js | Home Dashboard |
| app/(tabs)/lotes.js | Lotes tab wrapper |
| app/(tabs)/proyectos.js | Proyectos tab wrapper |
| app/(tabs)/explore.js | Ajustes/Configuración tab |
| app/lotes/[id].js | Detalle de lote |
| app/lotes/nuevo/index.js | Crear nuevo lote (mapa croquis) |
| app/proyectos/index.js | Redirect a /(tabs)/proyectos |
| app/proyectos/nuevo/index.js | Crear nuevo proyecto |
| app/proyectos/[id]/index.js | Editar proyecto |
| app/proyectos/[id]/visita/index.js | Nueva visita |
| app/proyectos/[id]/matriz/index.js | Matriz biométrica |
| app/calculadora/calculadora.js | Calculadora de fertilizantes |
| app/configuracion/colaboradores.js | Gestión colaboradores |
| app/configuracion/dispositivo.js | Info dispositivo |

---

## 4. ESTRUCTURA DE COMPONENTES

| Ruta | Descripción |
|------|-------------|
| components/auth/hooks/useAuth.js | Wrapper que re-exporta de services/auth/useAuth.js |
| components/auth/ui/LoginForm.js | Formulario de login |
| components/calculadora/colors.js | Re-exporta COLORS_CALC desde src/styles/colors.js |
| components/home/hooks/useHomeDashboard.js | Hook principal del home |
| components/home/ui/HomeDashboard.js | Dashboard principal con sync |
| components/lotes/context/SearchContext.js | Context para búsqueda de lotes |
| components/lotes/hooks/useCroquisMapa.js | Hook del mapa de croquis |
| components/lotes/ui/CroquisMapaUI.js | UI del mapa de croquis |
| components/lotes/ui/LotesDashboardUI.js | Lista de lotes |
| components/lotes/ui/lotesDashboardColors.js | Re-exporta STATUS_STYLES, STATUS_OPTIONS, COLORS |
| components/notifications/context/NotificationContext.js | Provider y estado de notificaciones |
| components/notifications/hooks/useLocalNotifications.js | Hook para notificar cambios locales |
| components/notifications/ui/NotificationsCenter.js | Bandeja de notificaciones |
| components/proyectos/hooks/useEditarProyecto.js | Hook para editar proyecto |
| components/proyectos/hooks/useListaProyectos.js | Hook para listar proyectos |
| components/proyectos/hooks/useNuevaVisita.js | Hook para nueva visita |
| components/proyectos/ui/ListaProyectosUI.js | Lista con filtros TODOS/ACTIVOS/PENDIENTES/INACTIVOS |
| components/proyectos/ui/EditarProyectoForm.js | Formulario editar proyecto |
| components/proyectos/ui/NuevaVisitaForm.js | Formulario nueva visita |
| components/proyectos/ui/ColaboradoresModal.js | Modal de colaboradores |
| components/proyectos/ui/proyectosStyles.js | createProyectosStyles(isDark) |

---

## 5. ESTRUCTURA DE SERVICIOS

| Ruta | Descripción |
|------|-------------|
| services/api/apiClient.js | fetchApi wrapper con auth |
| services/api/useApi.js | Hook useApi (login, logout, etc.) |
| services/auth/useAuth.js | AuthProvider + useAuth hook |
| services/lotes/lotesService.js | API calls (obtenerLotes, crearLote, etc.) |
| services/lotes/localLotesService.js | Local DB + API fallback |
| services/proyectos/proyectosService.js | API calls |
| services/proyectos/proyectosLocalService.js | Local DB + API fallback |
| services/sync/downloadService.js | descargarCatalogos, descargarMisDatos |
| services/sync/uploadService.js | syncEngine, obtenerConteoPendientes |
| services/sync/syncService.js | Procesa datos baixados |
| services/theme/theme.js | ThemeProvider + useTheme |
| services/theme/tabBarTheme.js | TAB_BAR_COLORS, TAB_BAR_DIMENSIONS |

---

## 6. ESTRUCTURA DE BASE DE DATOS

### db/
```
db/
├── index.js          # Barrel: db, initDb, crearLoteLocal, etc.
├── client.js         # Implementación: db, initDb, CRUD operations
└── schema.js         # Definición de tablas Drizzle ORM
```

### Tablas en schema.js

| Tabla | Descripción |
|-------|-------------|
| lotes | Lotes de terreno |
| provincias | Provincias de Ecuador |
| cantones | Cantones |
| estaciones | Estaciones meteorológicas |
| cultivos | Tipos de cultivo |
| variedades | Variedades de cultivos |
| proyectos | Proyectos experimentales |
| ciclos_cultivo | Ciclos de cultivo |
| visitas | Visitas técnicas |
| hojas_datos | Hojas de datos técnicos |
| configuracion | Configuración local |

---

## 7. FLUJO DE NAVEGACIÓN

```
App Start
    ↓
RootLayout (_layout.js)
    ├── ThemeProvider
    ├── NotificationProvider
    └── AuthProvider
            ↓
        AuthNavigator
        /       \
    Login    HomeDashboard
               ↓
         TabLayout ((tabs)/_layout.js)
         ├── SearchProvider
         └── CustomTabBar
              ↓
        ┌─────┼─────┐
      Home  Lotes  Proyectos  Explore
        |     |        |        |
        |     ↓        ↓        |
        |  Lotes    Proyectos  Ajustes
        |  Dashboard  List
        |     |
        |     └──[id]── Detalle Lote
        |              └── Editar
        |
        └── Sync Modal (World Animation)
```

---

## 8. SISTEMA DE COLORES Y ESTILOS

### Dos sistemas de colores (coexisten):

#### 1. src/styles/colors.js - Colores de la APP
```
COLORS.light / COLORS.dark     # Tema completo
STATUS_STYLES                 # Estados de verificación
STATUS_OPTIONS                 # Opciones de estado
CALC_COLORS                   # Colores calculadora
getColors(isDark)             # Helper
getCalcColors(isDark)         # Helper
```

#### 2. src/styles/global/colors.js - Colores para componentes COMPARTIDOS
```
GLOBAL_COLORS.primary           # Verde principal
GLOBAL_COLORS.success/error/warning/info
GLOBAL_COLORS.light.bg / dark.bg
COLORS (alias de GLOBAL_COLORS)
THEME_COLORS (alias de GLOBAL_COLORS)
```

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
