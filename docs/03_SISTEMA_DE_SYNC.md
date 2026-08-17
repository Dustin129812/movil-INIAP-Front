# SISTEMA DE SINCRONIZACIÓN

## 1. FLUJOS DE DATOS (Sincronización)

### 1.1 Patrón Offline-First

```
┌─────────────────────────────────────────────────────────────┐
│                    PATRÓN OFFLINE-FIRST                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Guardar en SQLite primero (disponible offline)          │
│  2. Intentar subir a API en segundo plano                  │
│  3. Si falla, se sincroniza cuando haya conexión           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Crear Lote

```
ACCION: Crear Lote
    ↓
CroquisMapaUI / useCroquisMapa
    ↓
crearLoteLocal() → db (SQLite)
crearProyectoLocal() → db (SQLite)
    ↓
lotesService.crearLote() → API (background)
    ↓
NotificationContext: agregarNotificacion()
```

### 1.3 Sincronizar

```
ACCION: Sincronizar
    ↓
HomeDashboard / useHomeDashboard
    ↓
syncEngine() → uploadService.js
    ↓
construirPayloadSync() → obtenerLotesPendientesSync()
    ↓
POST /sync → Backend
    ↓
NotificationContext: agregarNotificacionSync()
```

---

## 2. ESTRUCTURA DE SERVICIOS DE SYNC

### 2.1 Archivos

| Archivo | Descripción |
|---------|-------------|
| `services/sync/uploadService.js` | Subir datos pendientes al servidor |
| `services/sync/downloadService.js` | Descargar catálogos y datos del usuario |
| `services/sync/syncService.js` | Procesa datos descargados |
| `services/sync/catalogService.js` | Descarga catálogos (provincias, cantones, etc.) |

### 2.2 Upload Service

```javascript
// services/sync/uploadService.js
export const syncEngine = async () => {
    // 1. Obtener token
    // 2. Construir payload con datos pendientes
    // 3. POST /sync
    // 4. Actualizar sync_status local
    // 5. Retornar resultados
}

export const obtenerConteoPendientes = async () => {
    // Cuenta lotes, proyectos, visitas, hojas pendientes
}
```

### 2.3 Download Service

```javascript
// services/sync/downloadService.js
export const descargarCatalogos = async () => {
    // Descarga: provincias, cantones, estaciones, cultivos, variedades
}

export const descargarMisDatos = async () => {
    // Descarga del servidor: lotes, proyectos, ciclos, visitas, hojas
    // hace UPSERT en SQLite local
}
```

---

## 3. ESTADO DE SINCRONIZACIÓN (sync_status)

### 3.1 Estados posibles

```javascript
const SYNC_STATUS = {
    DRAFT: 'draft',      // Creado localmente, nunca sincronizado
    PENDING: 'pending',  // Pendiente de subir al servidor
    SYNCED: 'synced',    // Sincronizado con el servidor
};
```

### 3.2 Transiciones de estado

```
DRAFT → (al intentar sincronizar) → PENDING → (éxito) → SYNCED
                                            ↓ (error)
                                          PENDING (reintentar después)
```

---

## 4. FUNCIONES DE BASE DE DATOS

### 4.1 Lotes

```javascript
crearLoteLocal(loteData)          // Crea con sync_status: 'draft'
obtenerLotesLocales()             // Obtiene todos
obtenerLotesPendientesSync()      // WHERE sync_status = 'pending'
marcarLoteComoSincronizado(uuid)  // UPDATE sync_status = 'synced'
```

### 4.2 Proyectos

```javascript
crearProyectoLocal(proyectoData, { loteUuid })
obtenerProyectosLocales()
obtenerProyectosPendientesSync()
marcarProyectoComoSincronizado(uuid)
actualizarProyectoLocal(uuid, datos)
```

### 4.3 Ciclos de Cultivo

```javascript
crearCicloLocal(ciclosData, { loteUuid, proyectoUuid })
obtenerCiclosPorProyecto(proyectoUuid)
obtenerCiclosPorProyectoUuid(proyectoUuid)
```

### 4.4 Visitas

```javascript
crearVisitaLocal(visitaData, { loteUuid, proyectoUuid, cicloUuid })
obtenerVisitasPorProyecto(proyectoUuid)
obtenerVisitasPorProyectoUuid(proyectoUuid)
obtenerVisitasPorCicloUuid(cicloUuid)
actualizarVisitaLocal(uuid, datos)
marcarVisitaComoSincronizado(uuid)
```

### 4.5 Hojas de Datos

```javascript
crearHojaDatosLocal(hojaData, { loteUuid, proyectoUuid, cicloUuid, visitaUuid })
obtenerHojasPorVisitaUuid(visitaUuid)
obtenerHojaDatosPorVisita(visitaUuid)
actualizarHojaDatosLocal(uuid, datos)
```

---

## 5. NOTIFICACIONES DE SYNC

### 5.1 Tipos de notificaciones

```javascript
const TIPOS_NOTIFICACIONES = {
    SYNC_SUCCESS: 'SYNC_SUCCESS',       // Sincronización exitosa
    SYNC_ERROR: 'SYNC_ERROR',           // Error en sincronización
    LOTE_GUARDADO: 'LOTE_GUARDADO',     // Lote guardado localmente
    PROYECTO_GUARDADO: 'PROYECTO_GUARDADO',
    VISITA_GUARDADA: 'VISITA_GUARDADA',
    COLABORADOR_AGREGADO: 'COLABORADOR_AGREGADO',
};
```

### 5.2 Centro de notificaciones

- Muestra pendientes
- Muestra último sync
- Permite sincronizar manualmente

---

## 6. FLUJO COMPLETO OFFLINE-FIRST

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREAR LOTE (Offline-First)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario dibuja lote en mapa                                      │
│         │                                                         │
│         ↓                                                         │
│  useCroquisMapa.crearLote()                                      │
│         │                                                         │
│         ├── crearLoteLocal() → SQLite (sync_status: 'draft')      │
│         │                                                         │
│         ├── crearProyectoLocal() → SQLite (sync_status: 'draft')  │
│         │                                                         │
│         └── agregarNotificacion('LOTE_GUARDADO')                  │
│                  │                                                │
│                  ↓                                                │
│         intentar subir a API (background)                          │
│                  │                                                │
│         ┌────────┴────────┐                                      │
│         ↓                 ↓                                      │
│      ÉXITO            ERROR                                      │
│         ↓                 ↓                                      │
│  sync_status:       sync_status:                               │
│    'synced'          'pending' (reintentará después)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SINCRONIZAR MANUAL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario toca "Sincronizar" en HomeDashboard                      │
│         │                                                         │
│         ↓                                                         │
│  syncEngine()                                                    │
│         │                                                         │
│         ├── obtenerConteoPendientes() → muestra en UI            │
│         │                                                         │
│         ├── construirPayloadSync()                               │
│         │    ├── obtenerLotesPendientesSync()                     │
│         │    ├── obtenerProyectosPendientesSync()                │
│         │    └── obtener其他 datos pendientes                    │
│         │                                                         │
│         └── POST /sync (payload)                                 │
│                  │                                               │
│         ┌────────┴────────┐                                     │
│         ↓                 ↓                                     │
│      ÉXITO            ERROR                                     │
│         ↓                 ↓                                     │
│  Marcar todos como    Mostrar notificación                      │
│  SYNCED + Toast       SYNC_ERROR                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. BUGS CORREGIDOS

| Bug | Ubicación | Estado |
|-----|-----------|--------|
| obtenerCiclosPorProyecto ignoraba parámetro | db/client.js:380 | **CORREGIDO** |
| obtenerVisitasPorProyecto ignoraba parámetro | db/client.js:436 | **CORREGIDO** |
| obtenerHojaDatosPorVisita ignoraba parámetro | db/client.js:500 | **CORREGIDO** |
| obtenerConteoPendientes array destructuring | services/sync/uploadService.js | **CORREGIDO** |

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
