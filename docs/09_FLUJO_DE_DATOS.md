# FLUJO DE DATOS

## 1. FLUJO COMPLETO DE UNA ACCIÓN

### 1.1 Crear Lote (Offline-First)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREAR LOTE                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USUARIO                                                         │
│    │                                                             │
│    ↓                                                             │
│  CroquisMapaUI.js → useCroquisMapa.js                           │
│    │                                                             │
│    ├── dibujar vertices en mapa                                 │
│    ├── fill form (nombre, provincia, canton, etc.)               │
│    │                                                             │
│    ↓                                                             │
│  handleCrearLote()                                              │
│    │                                                             │
│    ├── crearLoteLocal() → db/client.js                          │
│    │      │                                                      │
│    │      ├── Crypto.randomUUID() → uuid_movil                  │
│    │      ├── now = new Date().toISOString()                    │
│    │      ├── INSERT INTO lotes (sync_status: 'draft')           │
│    │      │                                                      │
│    │      └── return { ...lote, uuid_movil }                     │
│    │                                                             │
│    ├── crearProyectoLocal() → db/client.js                      │
│    │      │                                                      │
│    │      ├── uuid = Crypto.randomUUID()                        │
│    │      ├── INSERT INTO proyectos (sync_status: 'draft')        │
│    │      │                                                      │
│    │      └── return { ...proyecto, uuid_movil }                 │
│    │                                                             │
│    └── agregarNotificacion('LOTE_GUARDADO')                      │
│             │                                                    │
│             ↓                                                    │
│  NotificationContext                                             │
│    │                                                             │
│    └── setNotificaciones([...notificaciones, { tipo, mensaje }])  │
│                                                                  │
│  SEGUNDO PLANO (background)                                      │
│    │                                                             │
│    ↓                                                            │
│  lotesService.crearLote() → API                                 │
│    │                                                             │
│    ├── POST /agrodecide/lotes                                   │
│    │                                                             │
│    ├── Si éxito → marcarLoteComoSincronizado(uuid)               │
│    │                  └── sync_status: 'synced'                  │
│    │                                                             │
│    └── Si error → sync_status sigue 'pending'                   │
│                       (se reintentará en siguiente sync)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Sincronización Manual

```
┌─────────────────────────────────────────────────────────────────┐
│                    SINCRONIZAR                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USUARIO                                                         │
│    │                                                             │
│    ↓                                                             │
│  HomeDashboard → botón "Sincronizar"                            │
│    │                                                             │
│    ↓                                                             │
│  useHomeDashboard.sincronizar()                                 │
│    │                                                             │
│    ├── setSincronizando(true)                                   │
│    │                                                             │
│    ├── syncEngine() → uploadService.js                          │
│    │      │                                                      │
│    │      ├── obtenerToken() → SecureStore/AsyncStorage          │
│    │      │                                                      │
│    │      ├── construirPayloadSync()                            │
│    │      │      │                                              │
│    │      │      ├── lotesP = obtenerLotesPendientesSync()      │
│    │      │      ├── proyectosP = obtenerProyectosPendientes()  │
│    │      │      ├── visitasP = obtenerVisitasPendientes()       │
│    │      │      └── return { lotes: [...], proyectos: [...] }  │
│    │      │                                                      │
│    │      └── POST /sync (payload)                              │
│    │             │                                              │
│    │             ├── Si éxito → marcar todos como synced        │
│    │             │                          └── sync_status: 'synced'
│    │             │                                                  │
│    │             └── Si error → notification SYNC_ERROR          │
│    │                                                                  │
│    └── setSincronizando(false)                                  │
│             │                                                    │
│             ↓                                                    │
│  agregarNotificacionSync(resultado)                             │
│    │                                                             │
│    └── setNotificaciones([...])                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUJO DE LOGIN Y AUTENTICACIÓN

### 2.1 Login Normal (Técnico/Colaborador)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN NORMAL                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LoginForm.js                                                    │
│    │                                                             │
│    ├── email: "tecnico@iniap.ec"                                │
│    ├── password: "****"                                        │
│    │                                                             │
│    └── handleLoginSubmit()                                      │
│             │                                                    │
│             ├── esInvitado = false                               │
│             │                                                    │
│             ↓                                                    │
│    handleLogin(email, password) → components/auth/hooks/useAuth   │
│             │                                                    │
│             ↓                                                    │
│    login(email, password) → services/auth/useAuth.js             │
│             │                                                    │
│             ↓                                                    │
│    api.login() → services/api/useApi.js                          │
│             │                                                    │
│             ├── POST /agrodecide/user/login                     │
│             │      Body: {                                     │
│             │        correo_institucional: email,               │
│             │        password: password,                        │
│             │        device_uuid: deviceUuid                    │
│             │      }                                            │
│             │                                                    │
│             ├── Si éxito → guardarSesion(token, user)           │
│             │      │      │                                     │
│             │      │      ├── SecureStore: token, userId        │
│             │      │      └── AsyncStorage: token, user        │
│             │      │                                              │
│             │      └── return { success: true, user }          │
│             │                                                      │
│             └── Si error → Alert.show()                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Login Invitado

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN INVITADO                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LoginForm.js                                                    │
│    │                                                             │
│    └── handleInvitado()                                         │
│             │                                                    │
│             ├── deviceInfo.uuid                                 │
│             ├── deviceInfo.modelo                                │
│             ├── deviceInfo.sistemaOperativo                      │
│             └── deviceInfo.hardware                              │
│                       │                                          │
│                       ↓                                          │
│    loginInvitado(uuid, modelo, sisOp, hardware)                  │
│             │                                                    │
│             ├── POST /agrodecide/guest/login                    │
│             │      Body: {                                      │
│             │        device_uuid: uuid,                         │
│             │        modelo: modelo,                            │
│             │        sistema_operativo: sisOp,                  │
│             │        hardware: hardware                          │
│             │      }                                            │
│             │                                                    │
│             ├── Si éxito →                                       │
│             │      │      ├── guardarSesion(token, user)        │
│             │      │      └── setEsInvitado(true)              │
│             │      │                                              │
│             │      └── return { success: true }                │
│             │                                                      │
│             └── Si error → Alert.show()                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Login con Merge

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN CON MERGE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRECONDICIÓN: Usuario estaba como invitado                       │
│  (dispositivo tiene lotes con device_uuid)                       │
│                                                                  │
│  LoginForm.js                                                    │
│    │                                                             │
│    ├── email: "tecnico@iniap.ec"                                │
│    ├── password: "****"                                         │
│    ├── esInvitado: true                                         │
│    └── dispositivoId: "device-abc-123"                           │
│             │                                                    │
│             ↓                                                    │
│    loginConMerge(email, password, dispositivoId)                 │
│             │                                                    │
│             ├── POST /agrodecide/user/login                     │
│             │      Body: {                                     │
│             │        correo_institucional: email,               │
│             │        password: password,                       │
│             │        device_uuid: "device-abc-123" ← INVITADO  │
│             │      }                                            │
│             │                                                    │
│             ├── Backend detecta device_uuid con datos            │
│             │     └── Reasigna lotes al usuario                 │
│             │                                                    │
│             ├── Si éxito →                                       │
│             │      │      ├── guardarSesion(token, user)        │
│             │      │      ├── setEsInvitado(false)             │
│             │      │      └── return { success, datosReasignados }│
│             │      │                                              │
│             │      └── Alert.show("Se fusionaron N registros")  │
│             │                                                      │
│             └── Si error → Alert.show()                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. FLUJO DE NAVEGACIÓN Y DATOS

### 3.1 Ver Detalle de Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│              VER DETALLE DE PROYECTO                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ListaProyectosUI.js                                            │
│    │                                                             │
│    └── <TouchableOpacity onPress={() => router.push(...)} />    │
│             │                                                    │
│             ↓                                                    │
│  router.push('/proyectos/123')                                  │
│             │                                                    │
│             ↓                                                    │
│  app/proyectos/[id]/index.js                                    │
│    │                                                             │
│    ├── useProyetoDetalle(id) → hook                             │
│    │      │                                                      │
│    │      ├── obtenerProyectoLocal(id)                          │
│    │      ├── obtenerCiclosPorProyecto(id)                      │
│    │      ├── obtenerVisitasPorProyecto(id)                     │
│    │      │                                                      │
│    │      └── return { proyecto, ciclos, visitas }              │
│    │                                                             │
│    └── <ProyectoDetalleUI proyecto={...} />                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Crear Nueva Visita

```
┌─────────────────────────────────────────────────────────────────┐
│              CREAR NUEVA VISITA                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  app/proyectos/[id]/visita/index.js                             │
│    │                                                             │
│    └── <NuevaVisitaForm />                                     │
│             │                                                    │
│             ├── seleccionar ciclo (dropdown)                    │
│             ├── fecha_visita (DatePicker)                       │
│             ├── observaciones (TextInput)                      │
│             ├── recomendaciones (TextInput)                     │
│             │                                                    │
│             └── handleGuardar()                                 │
│                       │                                          │
│                       ↓                                          │
│  crearVisitaLocal(datos, { proyectoUuid, cicloUuid })           │
│    │                                                             │
│    ├── uuid = Crypto.randomUUID()                              │
│    ├── INSERT INTO visitas (sync_status: 'draft')               │
│    │                                                             │
│    └── return { ...visita, uuid_movil }                         │
│                       │                                          │
│                       ↓                                          │
│  agregarNotificacion('VISITA_GUARDADA')                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. FLUJO DE DESCARGAR DATOS (SYNC DOWN)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESCARGAR DATOS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  downloadService.descargarMisDatos()                            │
│    │                                                             │
│    ├── GET /sync/download                                       │
│    │      Headers: Authorization: Bearer {token}                │
│    │                                                             │
│    ├── Respuesta: {                                              │
│    │      lotes: [...],                                         │
│    │      proyectos: [...],                                     │
│    │      ciclos: [...],                                        │
│    │      visitas: [...],                                       │
│    │      hojas_datos: [...]                                   │
│    │   }                                                        │
│    │                                                             │
│    └── upsertData() para cada tabla                             │
│             │                                                    │
│             ├── Upsert lotes                                    │
│             ├── Upsert proyectos                                │
│             ├── Upsert ciclos_cultivo                           │
│             ├── Upsert visitas                                   │
│             └── Upsert hojas_datos                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. RESUMEN DE APIS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /agrodecide/user/login | Login técnico/colaborador |
| POST | /agrodecide/guest/login | Login invitado |
| POST | /auth/logout | Cerrar sesión |
| GET | /agrodecide/lotes | Obtener lotes |
| POST | /agrodecide/lotes | Crear lote |
| GET | /agrodecide/proyectos | Obtener proyectos |
| POST | /agrodecide/proyectos | Crear proyecto |
| GET | /proyectos/{id}/colaboradores | Obtener colaboradores |
| POST | /proyectos/{id}/colaboradores | Agregar colaboradores |
| DELETE | /proyectos/{id}/colaboradores/{userId} | Eliminar colaborador |
| GET | /colaboradores/buscar | Buscar usuarios |
| POST | /sync | Subir datos pendientes |
| GET | /sync/download | Descargar datos del usuario |
| GET | /catalogos/* | Descargar catálogos |

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
