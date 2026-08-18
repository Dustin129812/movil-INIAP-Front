# PANTALLAS Y NAVEGACIÓN

## 1. ESTRUCTURA DE RUTAS (EXPO ROUTER)

```
app/
├── _layout.js                    # Root layout
├── login/
│   └── index.js                  # Pantalla de login
├── (tabs)/
│   ├── _layout.js                # Tab layout
│   ├── index.js                  # Home Dashboard
│   ├── lotes.js                  # Lotes tab
│   ├── proyectos.js              # Proyectos tab
│   └── explore.js                # Configuración tab
├── lotes/
│   ├── [id].js                   # Detalle de lote
│   └── nuevo/
│       └── index.js              # Crear nuevo lote
├── proyectos/
│   ├── index.js                  # Redirect a tabs
│   ├── nuevo/
│   │   └── index.js              # Crear proyecto
│   └── [id]/
│       ├── index.js              # Editar proyecto
│       ├── visita/
│       │   └── index.js          # Nueva visita
│       └── matriz/
│           └── index.js          # Matriz biométrica
├── calculadora/
│   └── calculadora.js            # Calculadora de fertilizantes
└── configuracion/
    ├── colaboradores.js           # Gestión colaboradores
    └── dispositivo.js             # Info dispositivo
```

---

## 2. JERARQUÍA DE LAYOUTS

```
RootLayout (app/_layout.js)
    │
    ├── ThemeProvider
    ├── NotificationProvider
    │
    └── AuthNavigator
        │
        ├── LoginScreen (app/login/index.js)
        │
        └── TabLayout (app/(tabs)/_layout.js)
            │
            ├── SearchProvider
            └── CustomTabBar
                │
                ├── HomeScreen (tabs/index.js)
                ├── LotesScreen (tabs/lotes.js)
                ├── ProyectosScreen (tabs/proyectos.js)
                └── ExploreScreen (tabs/explore.js)
```

---

## 3. app/_layout.js (ROOT)

```javascript
export default function RootLayout() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <AuthProvider>
                    <AuthNavigator />
                </AuthProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}
```

---

## 4. NAVEGADOR DE AUTENTICACIÓN (AuthNavigator)

```javascript
function AuthNavigator() {
    const { autenticado, cargando } = useAuth();

    if (cargando) {
        return <AnimatedSplashScreen />;
    }

    return autenticado ? <HomeTabs /> : <LoginScreen />;
}
```

---

## 5. app/(tabs)/_layout.js (TABS)

```javascript
export default function TabLayout() {
    return (
        <SearchProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBar: () => <CustomTabBar />,
                }}
            >
                <Tabs.Screen name="index" component={HomeScreen} />
                <Tabs.Screen name="lotes" component={LotesScreen} />
                <Tabs.Screen name="proyectos" component={ProyectosScreen} />
                <Tabs.Screen name="explore" component={ExploreScreen} />
            </Tabs>
        </SearchProvider>
    );
}
```

---

## 6. DESCRIPCIÓN DE PANTALLAS

### 6.1 Login (app/login/index.js)

- Renderiza `<LoginForm />`
- Pantalla inicial cuando no hay sesión

### 6.2 Home Dashboard (app/(tabs)/index.js)

- Muestra contadores (lotes, proyectos, visitas)
- Botón de sincronización
- Animación de mundo durante sync
- Muestra notificaciones pendientes

### 6.3 Lotes (app/(tabs)/lotes.js)

- Wrapper que renderiza `<LotesDashboardUI />`
- Lista de lotes con SearchContext

### 6.4 Lote Detalle (app/lotes/[id].js)

- Detalle de un lote específico
- Muestra croquis, coordenadas, información
- Enlaces para editar

### 6.5 Nuevo Lote (app/lotes/nuevo/index.js)

- Mapa interactivo para dibujar croquis
- Formulario de datos del lote
- Crea lote + proyecto asociado

### 6.6 Proyectos (app/(tabs)/proyectos.js)

- Wrapper que renderiza `<ListaProyectosUI />`
- Filtros: TODOS, ACTIVOS, PENDIENTES, INACTIVOS

### 6.7 Nuevo Proyecto (app/proyectos/nuevo/index.js)

- Formulario para crear proyecto
- Vinculado a lote existente o nuevo

### 6.8 Editar Proyecto (app/proyectos/[id]/index.js)

- Formulario para editar proyecto
- Gestión de colaboradores

### 6.9 Nueva Visita (app/proyectos/[id]/visita/index.js)

- Formulario de visita técnica
- Datos de la visita, observaciones

### 6.10 Matriz Biométrica (app/proyectos/[id]/matriz/index.js)

- Registro de datos biométricos
- Plantillas de evaluación

### 6.11 Calculadora (app/calculadora/calculadora.js)

- Calculadora de fertilizantes
- Basada en nutrientes y cultivos

### 6.12 Colaboradores (app/configuracion/colaboradores.js)

- Gestión de colaboradores
- Buscar, agregar, eliminar

### 6.13 Dispositivo (app/configuracion/dispositivo.js)

- Información del dispositivo
- ID, modelo, SO

---

## 7. NAVEGACIÓN ENTRE PANTALLAS

### 7.1 Navegación por defecto (Expo Router)

```javascript
import { router } from 'expo-router';

// Navegar a una pantalla
router.push('/lotes/nuevo');

// Navegar con parámetros
router.push('/lotes/123');

// Ir atrás
router.back();
```

### 7.2 Links en componentes

```javascript
import { Link } from 'expo-router';

<Link href="/lotes/nuevo">Crear Lote</Link>
```

---

## 8. FLUJO DE NAVEGACIÓN

```
                    ┌─────────────┐
                    │   Login     │
                    └──────┬──────┘
                           │ (login exitoso)
                           ↓
                    ┌─────────────┐
                    │  HomeTabs   │
                    └──────┬──────┘
           ┌──────────────┼──────────────┐
           │              │              │
           ↓              ↓              ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  Home    │   │  Lotes   │   │ Proyectos│
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
         │              ↓              ↓
         │       ┌──────────┐   ┌──────────┐
         │       │Lote/[id] │   │Proyecto/ │
         │       └──────────┘   │  [id]    │
         │                      └────┬─────┘
         │                           │
         │              ┌────────────┼────────────┐
         │              ↓            ↓            ↓
         │       ┌──────────┐ ┌──────────┐ ┌──────────┐
         │       │  visita  │ │  matriz  │ │colaborad.│
         │       └──────────┘ └──────────┘ └──────────┘
         ↓
    ┌──────────────┐
    │ Sync Modal  │
    │(Animación)  │
    └──────────────┘
```

---

## 9. PARÁMETROS DE RUTA

### Lotes

| Ruta | Parámetros | Descripción |
|------|------------|-------------|
| `/lotes/[id]` | `id` (string) | UUID del lote |

### Proyectos

| Ruta | Parámetros | Descripción |
|------|------------|-------------|
| `/proyectos/nuevo` | - | Crear proyecto |
| `/proyectos/[id]` | `id` (string) | UUID del proyecto |
| `/proyectos/[id]/visita` | `id` (string) | UUID del proyecto |
| `/proyectos/[id]/matriz` | `id` (string) | UUID del proyecto |

---

## 10. MODALES Y OVERLAYS

### 10.1 Sync Modal (World Animation)

- Animación de mundo girando
- Se muestra durante sincronización
- Implementado en HomeDashboard

### 10.2 Colaboradores Modal

- Modal para gestionar colaboradores
- Buscar usuarios
- Agregar/eliminar

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
