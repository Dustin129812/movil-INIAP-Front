# LOGIN Y AUTENTICACIÓN

## 1. SISTEMA DE LOGIN

### 1.1 Tipos de Usuario

El sistema maneja dos tipos de acceso:

#### LOGIN DE INVITADO (dispositivo)
- **¿Quién?** Persona **sin cuenta** en el sistema
- **¿Cómo?** Solo usa el botón "Ingresar como Invitado"
- **Identificación:** Se identifica por `device_uuid` del dispositivo
- **Permisos:** Puede crear lotes/proyectos localmente
- **Limitación:** No aparece en el sistema hasta que un técnico lo agregue como colaborador

#### COLABORADORES (usuarios con cuenta)
- **¿Quién?** Usuarios registrados con correo y contraseña
- **¿Cómo?** Ingresan con correo institucional + contraseña
- **Identificación:** Se identifican por su ID de usuario en la base de datos
- **Permisos:** Solo ven los proyectos a los que fueron agregados por un técnico

---

### 1.2 Matriz de Escenarios de Acceso

| Escenario | ¿Puede entrar? | ¿Cómo? | Notas |
|-----------|----------------|--------|-------|
| **Invitado** (no tiene cuenta) | Sí | Botón "Ingresar como Invitado" con device_uuid | Solo crea datos localmente |
| **Colaborador agregado** al proyecto | Sí | Correo + contraseña normales | Ve solo proyectos donde fue agregado |
| **Persona NO invitada** (no tiene cuenta) | **NO** | No tiene acceso | No existe en el sistema |

---

## 2. FLUJO DE LOGIN NORMAL (TÉCNICO/COLABORADOR)

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN NORMAL                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LoginForm.js → handleLoginSubmit()                         │
│         │                                                  │
│         ├── ¿Hay sesión invitado activa?                    │
│         │   ├── SÍ → loginConMerge(email, password, deviceId)│
│         │   │         ↓                                    │
│         │   │    Backend hace merge de datos               │
│         │   │         ↓                                    │
│         │   │    Retorna: { success, datosReasignados }    │
│         │   │                                                  │
│         │   └── NO → login(email, password)                 │
│         │              ↓                                    │
│         │         Backend valida credenciales               │
│         │              ↓                                    │
│         │         Retorna: { success, token, user }         │
│         │                                                  │
│         └── Alert.show() según resultado                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Código en LoginForm.js:
```javascript
const handleLoginSubmit = async () => {
    // Si hay sesión de invitado activa, usar loginConMerge
    if (esInvitado && dispositivoId) {
        resultado = await loginConMerge(email, password, dispositivoId);
    } else {
        // Login normal sin merge
        resultado = await handleLogin(email, password);
    }
};
```

---

## 3. FLUJO DE LOGIN INVITADO

```
┌─────────────────────────────────────────────────────────────┐
│                   LOGIN INVITADO                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LoginForm.js → handleInvitado()                            │
│         │                                                  │
│         ↓                                                  │
│  loginInvitado(deviceUuid, modelo, sisOp, hardware)         │
│         │                                                  │
│         ↓                                                  │
│  API: POST /agrodecide/guest/login                         │
│  Body: {                                                   │
│      device_uuid: uuid,                                    │
│      modelo: modelo,                                       │
│      sistema_operativo: sisOp,                             │
│      hardware: hardware                                    │
│  }                                                         │
│         │                                                  │
│         ↓                                                  │
│  Backend retorna: { access_token }                          │
│         │                                                  │
│         ↓                                                  │
│  Guardar en SecureStore/AsyncStorage                       │
│         │                                                  │
│         ↓                                                  │
│  Estado: { esInvitado: true, ID: deviceUuid }              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. SISTEMA DE MERGE (INVITADO → USUARIO)

### 4.1 ¿Cuándo ocurre el Merge?

El merge solo ocurre cuando:
1. Alguien entró como **invitado** en un dispositivo
2. Luego un **técnico se loguea con credenciales** en el **mismo dispositivo**
3. El backend **reasigna** los lotes del `device_uuid` al usuario

### 4.2 Diagrama del Merge

```
DISPOSITIVO: "device-abc-123"

┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Usuario Invitado crea datos                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dispositivo: device-abc-123                               │
│       │                                                    │
│       ├── Lote A (dispositivo_invitado_id = device-abc-123)│
│       └── Lote B (dispositivo_invitado_id = device-abc-123)│
│                                                             │
└─────────────────────────────────────────────────────────────┘

                         ↓ Técnico se loguea

┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Login con credenciales + merge                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Login → {                                                 │
│      correo: "tecnico@iniap.ec",                           │
│      password: "***",                                      │
│      device_uuid: "device-abc-123"  ← MISMO dispositivo    │
│  }                                                         │
│       │                                                    │
│       ├── Backend valida credenciales                       │
│       ├── Backend detecta device_uuid con datos de invitado │
│       ├── Backend hace MERGE: Lotes A, B → user_id = 5     │
│       └── Backend retorna token + datosReasignados          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                         ↓

┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Después del merge                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Usuario técnico (id=5) ahora ve:                          │
│       ├── Lote A (user_id = 5) ← mergeado                 │
│       ├── Lote B (user_id = 5) ← mergeado                 │
│       └── Lote C (responsable_id = 5) ← creado siendo user│
│                                                             │
│  En el servidor, los lotes ya no tienen                     │
│  dispositivo_invitado_id, ahora tienen user_id=5            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Código del Merge

En `services/auth/useAuth.js`:
```javascript
const loginConMerge = useCallback(async (email, password, deviceUuid) => {
    const respuesta = await api.login(
        { email, password },
        deviceUuid,  // ← Envía el device_uuid del invitado
        null,
        null
    );

    if (respuesta.success && respuesta.ID) {
        setUsuario({ ID: respuesta.ID, NOMBRE: respuesta.NOMBRE, CORREO: respuesta.CORREO });
        setEsInvitado(false);
        await localLotesService.inicializarBaseDatosLocal();

        // Retorna info de merge si la hay
        const datosReasignados = respuesta.datos_reasignados || 0;
        return { success: true, datosReasignados };
    }
    return { success: false, message: respuesta.message };
}, [api]);
```

En `services/api/useApi.js` (login del backend):
```javascript
// POST /agrodecide/user/login
body: JSON.stringify({
    correo_institucional: credenciales.email,
    password: credenciales.password,
    device_uuid: uuid || null,  // ← Envía device_uuid para merge
}),
```

---

## 5. FLUJO DE LOGOUT

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGOUT                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  cerrarSesion()                                             │
│       │                                                    │
│       ├── POST /auth/logout (si existe endpoint)           │
│       │                                                  │
│       ├── Limpiar SecureStore:                            │
│       │   - userToken                                     │
│       │   - offlineUserId                                 │
│       │                                                  │
│       ├── Limpiar AsyncStorage:                            │
│       │   - token_acceso                                  │
│       │   - datos_usuario                                 │
│       │                                                  │
│       └── Estado: { usuario: null, esInvitado: false }     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. PERSISTENCIA DE SESIÓN

### 6.1 Donde se guarda

| Almacenamiento | Uso |
|----------------|-----|
| **SecureStore** | Token JWT, User ID (más seguro) |
| **AsyncStorage** | Token JWT legacy, Datos usuario |

### 6.2 Verificación al iniciar

```
App Start
    ↓
verificarTokenAlIniciar()
    ↓
¿Token válido en SecureStore/AsyncStorage?
    ├── SÍ → cargar usuario, mantener sesión
    └── NO → limpiar sesión, mostrar login
```

### 6.3 Tiempo de carga mínimo

Para mostrar la animación de splash:
- **Mínimo:** 3.5 segundos de animación
- **Máximo:** 8 segundos timeout de seguridad

---

## 7. COLABORADORES VS INVITADOS

### Diferencias clave

| Característica | Invitado | Colaborador |
|----------------|----------|-------------|
| **Tiene cuenta** | No | Sí |
| **Puede crear lotes** | Sí (local) | Sí |
| **Puede ver todos los proyectos** | No | Solo los que fue agregado |
| **Necesita ser agregado** | No | Sí |
| **Merge necesario** | Sí (al loguearse técnico) | No |

### Agregar colaborador a proyecto

```
┌─────────────────────────────────────────────────────────────┐
│          AGREGAR COLABORADOR A PROYECTO                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Técnico abre proyecto → ColaboradoresModal                  │
│         │                                                  │
│         ↓                                                  │
│  buscarUsuarios(termino) → GET /colaboradores/buscar       │
│         │                                                  │
│         ↓                                                  │
│  mostrar resultados de búsqueda                            │
│         │                                                  │
│         ├── Usuario seleccionado                           │
│         │                                                  │
│         ↓                                                  │
│  agregarColaboradores(proyectoId, [userId])                │
│      → POST /proyectos/{id}/colaboradores                 │
│      → Body: { user_ids: [userId] }                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. ARCHIVOS RELACIONADOS

| Archivo | Descripción |
|---------|-------------|
| `services/auth/useAuth.js` | AuthProvider, login, loginConMerge, loginInvitado, cerrarSesion |
| `services/api/useApi.js` | Llamadas HTTP al backend, guardarSesion, limpiarSesion |
| `components/auth/hooks/useAuth.js` | Wrapper para el componente LoginForm |
| `components/auth/ui/LoginForm.js` | UI del formulario de login |
| `services/colaboradores/colaboradoresService.js` | Buscar, agregar, eliminar colaboradores |

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
