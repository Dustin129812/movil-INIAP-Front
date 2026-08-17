# COMPONENTES

## 1. ESTRUCTURA DE CARPETAS

```
components/
├── auth/
│   ├── hooks/
│   │   ├── index.js
│   │   └── useAuth.js              # Wrapper del servicio de auth
│   └── ui/
│       ├── index.js
│       └── LoginForm.js            # Formulario de login
├── calculadora/
│   ├── colors.js
│   ├── fertilizantes.js
│   ├── hooks/
│   │   └── useCalculadora.js
│   ├── nutrientes.js
│   └── ui/
├── calendario/
│   └── ui/
│       └── DatePickerWheel.js
├── home/
│   ├── hooks/
│   │   └── useHomeDashboard.js
│   └── ui/
│       └── HomeDashboard.js
├── loader/
│   ├── hooks/
│   │   └── AuthNavigator.js
│   └── ui/
│       └── AnimatedSplashScreen.js
├── lotes/
│   ├── context/
│   │   └── SearchContext.js
│   ├── hooks/
│   │   └── useCroquisMapa.js
│   └── ui/
│       ├── CroquisMapaUI.js
│       ├── LotesDashboardUI.js
│       ├── VerticesMap.js
│       ├── lotesDashboardAnimations.js
│       └── lotesDashboardColors.js
├── notificaciones/
│   ├── context/
│   │   └── NotificationContext.js
│   ├── hooks/
│   │   └── useLocalNotifications.js
│   └── ui/
│       └── NotificationsCenter.js
├── proyectos/
│   ├── hooks/
│   │   ├── index.js
│   │   ├── useEditarProyecto.js
│   │   ├── useListaProyectos.js
│   │   ├── useMatrizBiometrica.js
│   │   ├── useNuevaVisita.js
│   │   └── useProyectoDetalle.js
│   └── ui/
│       ├── index.js
│       ├── ColaboradoresModal.js
│       ├── EditarProyectoForm.js
│       ├── ListaProyectosUI.js
│       ├── MatrizBiometricaUI.js
│       ├── NuevaVisitaForm.js
│       ├── ProyectoDetalleUI.js
│       └── proyectosStyles.js
└── ui/
    └── DynamicIslandNotification.js
```

---

## 2. AUTH (Autenticación)

### 2.1 components/auth/hooks/useAuth.js

Wrapper que re-exporta del servicio de auth.

```javascript
export const useAuth = () => {
    // Re-exporta del servicio
    const {
        login, loginConMerge, loginInvitado,
        usuario, cargando, cargandoLogin,
        cerrarSesion, dispositivoId, esInvitado
    } = useAuthService();

    // Estados locales del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handlers
    const handleLogin = async () => { ... };
    const handleLoginInvitado = async () => { ... };
    const handleLogout = async () => { ... };

    return {
        email, setEmail,
        password, setPassword,
        isLoading,
        handleLogin,
        handleLoginInvitado,
        handleLogout,
        loginConMerge,
        esInvitado,
        dispositivoId,
        // ...
    };
};
```

### 2.2 components/auth/ui/LoginForm.js

UI del formulario de login con:
- Campo email
- Campo password (con toggle mostrar/ocultar)
- Botón "Iniciar Sesión" → handleLoginSubmit
- Botón "Ingresar como Invitado" → handleInvitado

**Flujo de handleLoginSubmit:**
```javascript
const handleLoginSubmit = async () => {
    // 1. Validar campos
    // 2. Si hay sesión invitado activa → loginConMerge
    // 3. Si no → login normal
    // 4. Mostrar Alert con resultado
};
```

---

## 3. HOME (Dashboard Principal)

### 3.1 components/home/ui/HomeDashboard.js

Dashboard principal que muestra:
- Contador de lotes
- Contador de proyectos
- Contador de visitas pendientes
- Botón de sincronización
- Animación de mundo girando durante sync

**Animación de sincronización:**
- Usa Lottie/Animated para animación de mundo
- Se muestra durante la sincronización

### 3.2 components/home/hooks/useHomeDashboard.js

Hook principal del home que:
- Carga datos locales
- Maneja sincronización
- Actualiza contadores

---

## 4. LOTES

### 4.1 components/lotes/context/SearchContext.js

Context para búsqueda de lotes.

```javascript
const SearchContext = createContext(undefined);

export const SearchProvider = ({ children }) => {
    const [busqueda, setBusqueda] = useState('');

    return (
        <SearchContext.Provider value={{ busqueda, setBusqueda }}>
            {children}
        </SearchContext.Provider>
    );
};
```

### 4.2 components/lotes/hooks/useCroquisMapa.js

Hook del mapa de croquis que:
- Maneja vertices del lote
- Crea lote y proyecto localmente
- Maneja guardados

```javascript
export const useCroquisMapa = () => {
    const [vertices, setVertices] = useState([]);
    const [coordenadas, setCoordenadas] = useState([]);

    const agregarVertice = (latlng) => { ... };
    const eliminarVertice = (index) => { ... };
    const crearLoteConProyecto = async (datos) => { ... };
};
```

### 4.3 components/lotes/ui/CroquisMapaUI.js

UI del mapa de croquis con:
- Mapa interactivo (react-native-maps)
- Marcadores de vertices
- Botón para agregar vertice
- Formulario de datos del lote

### 4.4 components/lotes/ui/LotesDashboardUI.js

Lista de lotes con:
- Lista(scroll)
- Filtros
- Tarjetas de lotes
- Pull to refresh

---

## 5. PROYECTOS

### 5.1 components/proyectos/hooks/useListaProyectos.js

Hook para listar proyectos.

```javascript
export const useListaProyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState('TODOS');

    const proyectosFiltrados = useMemo(() => {
        if (filtroActivo === 'TODOS') return proyectos;
        if (filtroActivo === 'ACTIVOS')
            return proyectos.filter(p => p.estado === 'activo' && p.sync_status !== 'pending' && p.sync_status !== 'draft');
        if (filtroActivo === 'PENDIENTES')
            return proyectos.filter(p => p.estado === 'pendiente' || p.sync_status === 'pending' || p.sync_status === 'draft');
        if (filtroActivo === 'INACTIVOS')
            return proyectos.filter(p => p.estado === 'inactivo');
        return proyectos;
    }, [proyectos, filtroActivo]);
};
```

### 5.2 components/proyectos/hooks/useEditarProyecto.js

Hook para editar proyecto con soporte para proyecto "Por definir".

### 5.3 components/proyectos/hooks/useNuevaVisita.js

Hook para crear nueva visita.

### 5.4 components/proyectos/ui/ListaProyectosUI.js

Lista con filtros:
- TODOS
- ACTIVOS
- PENDIENTES
- INACTIVOS

Usa scroll horizontal programático con `isProgrammaticRef` para evitar conflictos.

### 5.5 components/proyectos/ui/EditarProyectoForm.js

Formulario para editar proyecto.

### 5.6 components/proyectos/ui/NuevaVisitaForm.js

Formulario para nueva visita técnica.

### 5.7 components/proyectos/ui/ColaboradoresModal.js

Modal para gestionar colaboradores del proyecto.

---

## 6. NOTIFICACIONES

### 6.1 components/notifications/context/NotificationContext.js

Provider de notificaciones.

```javascript
const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
    const [notificaciones, setNotificaciones] = useState([]);

    const agregarNotificacion = (tipo, mensaje, datos) => { ... };
    const agregarNotificacionSync = (resultado) => { ... };
    const limpiarNotificaciones = () => { ... };

    return (
        <NotificationContext.Provider value={{
            notificaciones,
            agregarNotificacion,
            agregarNotificacionSync,
            limpiarNotificaciones,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
```

### 6.2 components/notifications/hooks/useLocalNotifications.js

Hook para notificar cambios locales.

### 6.3 components/notifications/ui/NotificationsCenter.js

Bandeja de notificaciones que muestra:
- Notificaciones pendientes
- Último sync
- Botón para sincronizar

---

## 7. CALCULADORA

### 7.1 components/calculadora/

- `colors.js` - Re-exporta COLORS_CALC
- `fertilizantes.js` - Datos de fertilizantes
- `nutrientes.js` - Datos de nutrientes
- `hooks/useCalculadora.js` - Lógica de cálculos
- `ui/` - Componentes de UI de la calculadora

---

## 8. UI COMPARTIDOS

### 8.1 src/styles/global/

Colores y estilos compartidos entre componentes.

```javascript
// src/styles/global/colors.js
export const GLOBAL_COLORS = {
    primary: '#34C759',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#007AFF',
    light: { bg: '#F2F2F7', card: '#fff' },
    dark: { bg: '#000', card: '#1C1C1E' },
};

// Aliases
export const COLORS = GLOBAL_COLORS;
export const THEME_COLORS = GLOBAL_COLORS;
```

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
