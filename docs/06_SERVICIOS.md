# SERVICIOS

## 1. ESTRUCTURA DE CARPETAS

```
services/
├── api/
│   ├── index.js
│   ├── apiClient.js            # fetch wrapper con auth
│   └── useApi.js               # Hook con login, logout, etc.
├── auth/
│   ├── index.js
│   └── useAuth.js              # AuthProvider + useAuth hook
├── cols/
│   ├── colaboradores/
│   │   ├── index.js
│   │   ├── colaboradoresService.js
│   │   └── useColaboradores.js
│   └── device/
│       ├── index.js
│       ├── useDevice.js
│       └── useDeviceInfo.js
├── lotes/
│   ├── index.js
│   ├── lotesService.js         # API calls
│   └── localLotesService.js    # Local DB + API fallback
├── notificaciones/
│   ├── index.js
│   └── notificaciones.js
├── proyectos/
│   ├── index.js
│   ├── proyectosService.js     # API calls
│   └── proyectosLocalService.js # Local DB + API fallback
├── sync/
│   ├── index.js
│   ├── catalogService.js
│   ├── downloadService.js
│   ├── syncService.js
│   └── uploadService.js
└── theme/
    ├── index.js
    ├── theme.js
    └── tabBarTheme.js
```

---

## 2. SERVICES/API

### 2.1 services/api/useApi.js

Hook principal para llamadas HTTP.

**Funciones:**

```javascript
export function useApi() {
    // Login normal (técnico/colaborador)
    login(credenciales, uuid, modelo, sisOp)
    // → POST /agrodecide/user/login
    // → Body: { correo_institucional, password, device_uuid }

    // Login invitado
    loginInvitado(uuid, modelo, sisOp, hardware)
    // → POST /agrodecide/guest/login
    // → Body: { device_uuid, modelo, sistema_operativo, hardware }

    // Cerrar sesión
    cerrarSesion()
    // → POST /auth/logout
    // → Limpia SecureStore y AsyncStorage

    // Verificar auth
    estaAutenticado()
    // → Verifica token en SecureStore/AsyncStorage

    // Obtener usuario guardado
    obtenerUsuarioGuardado()
    // → De AsyncStorage

    // Petición autenticada
    peticionAutenticada(url, opciones)
    // → Usa fetchConAuth con Bearer token
}
```

**Manejo de token:**
```javascript
const obtenerTokenFlexible = async () => {
    // 1. Primero SecureStore (preferido)
    // 2. Fallback AsyncStorage (legacy)
    // 3. Si encuentra en AsyncStorage, migra a SecureStore
};

const guardarSesion = async (token, usuario) => {
    // Guarda en AsyncStorage (compatibilidad)
    // Guarda en SecureStore (seguro)
};

const limpiarSesionCompleta = async () => {
    // Limpia AsyncStorage y SecureStore
};
```

### 2.2 services/api/apiClient.js

Wrapper de fetch con auth (para otras llamadas).

---

## 3. SERVICES/AUTH

### 3.1 services/auth/useAuth.js

AuthProvider principal.

```javascript
export function AuthProvider({ children }) {
    // Estados
    const [usuario, setUsuario] = useState(null);
    const [esInvitado, setEsInvitado] = useState(false);

    // Funciones de login
    const login = async (email, password) => {
        // Usa api.login con deviceInfo.uuid
    };

    const loginConMerge = async (email, password, deviceUuid) => {
        // Usa api.login con deviceUuid específico (para merge)
    };

    const loginInvitado = async (uuid, modelo, sisOp, hardware) => {
        // Usa api.loginInvitado
    };

    const cerrarSesion = async () => {
        // api.cerrarSesion() + limpiar estado
    };

    return (
        <AuthContext.Provider value={{
            usuario,
            esInvitado,
            dispositivoId: deviceInfo.uuid,
            login,
            loginConMerge,
            loginInvitado,
            cerrarSesion,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
```

---

## 4. SERVICES/LOTES

### 4.1 services/lotes/lotesService.js

Llamadas a API para lotes.

```javascript
export const lotesService = {
    obtenerLotes()          // GET /agrodecide/lotes
    crearLote(datos)       // POST /agrodecide/lotes
    actualizarLote(id, datos) // PUT /agrodecide/lotes/{id}
    eliminarLote(id)       // DELETE /agrodecide/lotes/{id}
};
```

### 4.2 services/lotes/localLotesService.js

Servicio local con fallback a API.

```javascript
export const localLotesService = {
    inicializarBaseDatosLocal()  // initDb()

    obtenerLotes() {
        // 1. Intentar API
        // 2. Si falla, usar local
    }

    crearLoteLocal(datos) {
        // 1. Guardar en SQLite
        // 2. Intentar subir a API
        // 3. Si falla, queda como pending
    }

    sincronizarLotesPendientes() {
        // Sube lotes con sync_status = 'pending'
    }
}
```

---

## 5. SERVICES/PROYECTOS

### 5.1 services/proyectos/proyectosService.js

Llamadas a API para proyectos.

```javascript
export const proyectosService = {
    obtenerProyectos()           // GET /agrodecide/proyectos
    obtenerProyecto(id)         // GET /agrodecide/proyectos/{id}
    crearProyecto(datos)        // POST /agrodecide/proyectos
    actualizarProyecto(id, datos) // PUT /agrodecide/proyectos/{id}
};
```

### 5.2 services/proyectos/proyectosLocalService.js

Servicio local con fallback a API.

```javascript
export const proyectosLocalService = {
    inicializarBaseDatosProyectos()
    obtenerProyectos()
    crearProyectoLocal(datosProyecto)
    crearCicloLocal(datosCiclo)
    crearVisitaLocal(datosVisita)
    crearHojaDatosLocal(datosHoja)
    obtenerVisitasDelProyecto(proyectoId)
    obtenerCiclosDelProyecto(proyectoId)
    obtenerHojasDeVisita(visitaId)
    sincronizarProyectosPendientes()
}
```

---

## 6. SERVICES/SYNC

### 6.1 services/sync/uploadService.js

Sube datos pendientes al servidor.

```javascript
export const syncEngine = async () => {
    // 1. Obtener token
    // 2. construirPayloadSync()
    // 3. POST /sync
    // 4. Actualizar sync_status
    // 5. Retornar resultados
}

export const obtenerConteoPendientes = async () => {
    // Cuenta: lotes, proyectos, ciclos, visitas, hojas
    // con sync_status = 'pending' o 'draft'
    return {
        lotes: n,
        proyectos: n,
        ciclos: n,
        visitas: n,
        hojas: n
    };
}

export const construirPayloadSync = async () => {
    // Obtiene todos los datos pendientes
    // Retorna objeto con arrays para subir
}
```

### 6.2 services/sync/downloadService.js

Descarga catálogos y datos del usuario.

```javascript
export const descargarCatalogos = async () => {
    // Descarga:
    // - Provincias
    // - Cantones
    // - Estaciones
    // - Cultivos
    // - Variedades
}

export const descargarMisDatos = async () => {
    // GET /sync/download
    // Upsert en SQLite local
}
```

### 6.3 services/sync/syncService.js

Procesa datos descargados.

### 6.4 services/sync/catalogService.js

Helper para descargar catálogos.

---

## 7. SERVICES/THEME

### 7.1 services/theme/theme.js

Provider de tema (claro/oscuro).

```javascript
export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <theme.Provider value={{ isDark, toggleTheme }}>
            {children}
        </theme.Provider>
    );
};
```

### 7.2 services/theme/tabBarTheme.js

Colores y dimensiones de la tab bar.

```javascript
export const TAB_BAR_COLORS = {
    active: '#34C759',
    inactive: '#8E8E93',
    background: '#fff',
    // ...
};

export const TAB_BAR_DIMENSIONS = {
    height: 80,
    iconSize: 24,
    // ...
};
```

---

## 8. SERVICES/COLABORADORES

### 8.1 services/colaboradores/colaboradoresService.js

```javascript
export const colaboradoresService = {
    obtenerColaboradores(proyectoId)
    // → GET /agrodecide/proyectos/{id}/colaboradores

    agregarColaboradores(proyectoId, userIds)
    // → POST /agrodecide/proyectos/{id}/colaboradores
    // → Body: { user_ids: [...] }

    eliminarColaborador(proyectoId, userId)
    // → DELETE /agrodecide/proyectos/{id}/colaboradores/{userId}

    buscarUsuarios(termino)
    // → GET /agrodecide/colaboradores/buscar?termino=...
}
```

---

## 9. SERVICES/DEVICE

### 9.1 services/device/useDeviceInfo.js

Obtiene información del dispositivo.

```javascript
export const useDeviceInfo = () => {
    const [deviceInfo, setDeviceInfo] = useState({
        uuid: null,
        modelo: null,
        sistemaOperativo: null,
        hardware: null,
    });

    useEffect(() => {
        // Obtiene de expo-device
        // Genera/manejiene UUID
    }, []);

    return { deviceInfo, isLoading };
};
```

---

## 10. FLUJO DE DATOS POR SERVICIO

### 10.1 Crear Lote

```
UI: CroquisMapaUI.js
  ↓
Hook: useCroquisMapa.js
  ↓
Service: localLotesService.crearLoteLocal()
  ↓
DB: crearLoteLocal() → SQLite
  ↓
API: lotesService.crearLote() (background)
  ↓
NotificationContext: agregarNotificacion()
```

### 10.2 Sincronizar

```
UI: HomeDashboard → botón sincronizar
  ↓
Hook: useHomeDashboard
  ↓
Service: uploadService.syncEngine()
  ↓
DB: obtenerLotesPendientesSync(), etc.
  ↓
API: POST /sync
  ↓
DB: marcarLoteComoSincronizado()
  ↓
NotificationContext: agregarNotificacionSync()
```

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
