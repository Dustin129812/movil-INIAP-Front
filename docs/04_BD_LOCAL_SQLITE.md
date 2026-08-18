# BASE DE DATOS LOCAL (SQLite + Drizzle ORM)

## 1. ESTRUCTURA DE ARCHIVOS

```
db/
├── index.js          # Barrel export: db, initDb, todas las funciones CRUD
├── client.js         # Implementación: db, initDb, CRUD operations
└── schema.js         # Definición de tablas Drizzle ORM
```

---

## 2. SCHEMA (Definición de tablas)

### 2.1 Tabla: lotes

```javascript
// db/schema.js
export const lotes = sqliteTable('lotes', {
    id: integer('id').primaryKey().autoincrement(),
    user_id: integer('user_id'),
    uuid_movil: text('uuid_movil'),           // UUID local único
    nombre_lote: text('nombre_lote').notNull(),
    sync_status: text('sync_status').default('draft'),
    coordenadas: text('coordenadas'),          // JSON string
    ubicacion_manual: text('ubicacion_manual'),
    provincia_id: integer('provincia_id'),
    canton_id: integer('canton_id'),
    estacion_id: integer('estacion_id'),
    imagen_url: text('imagen_url'),
    vertices_count: integer('vertices_count').default(0),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});
```

### 2.2 Tabla: proyectos

```javascript
export const proyectos = sqliteTable('proyectos', {
    id: integer('id').primaryKey().autoincrement(),
    uuid_movil: text('uuid_movil'),
    lote_uuid: text('lote_uuid'),              // FK a lotes.uuid_movil
    titulo: text('titulo').notNull(),
    descripcion: text('descripcion'),
    variedad: text('variedad'),
    fecha_siembra: text('fecha_siembra'),
    estado: text('estado').default('activo'),  // activo, pendiente, inactivo
    tipo_acolchado: text('tipo_acolchado'),
    tipo_ensayo: text('tipo_ensayo'),
    diseno_experimental: text('diseno_experimental'),
    financiamiento: text('financiamiento'),
    colaborador_nombre: text('colaborador_nombre'),
    colaborador_telefono: text('colaborador_telefono'),
    colaborador_celular: text('colaborador_celular'),
    sync_status: text('sync_status').default('draft'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});
```

### 2.3 Tabla: ciclos_cultivo

```javascript
export const ciclos_cultivo = sqliteTable('ciclos_cultivo', {
    id: integer('id').primaryKey().autoincrement(),
    uuid_movil: text('uuid_movil'),
    lote_uuid: text('lote_uuid'),              // FK a lotes.uuid_movil
    proyecto_uuid: text('proyecto_uuid'),       // FK a proyectos.uuid_movil
    cultivo_variedad: text('cultivo_variedad').notNull(),
    distancia_siembra: text('distancia_siembra'),
    fecha_siembra: text('fecha_siembra'),
    fecha_fin: text('fecha_fin'),
    metricas_siembra: text('metricas_siembra'), // JSON string
    es_actual: integer('es_actual').default(1),
    sync_status: text('sync_status').default('draft'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});
```

### 2.4 Tabla: visitas

```javascript
export const visitas = sqliteTable('visitas', {
    id: integer('id').primaryKey().autoincrement(),
    uuid_movil: text('uuid_movil'),
    lote_uuid: text('lote_uuid'),
    proyecto_uuid: text('proyecto_uuid'),
    ciclo_uuid: text('ciclo_uuid'),
    tecnico_nombre: text('tecnico_nombre'),
    fecha_visita: text('fecha_visita').notNull(),
    observaciones: text('observaciones'),
    recomendaciones: text('recomendaciones'),
    sync_status: text('sync_status').default('draft'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});
```

### 2.5 Tabla: hojas_datos

```javascript
export const hojas_datos = sqliteTable('hojas_datos', {
    id: integer('id').primaryKey().autoincrement(),
    uuid_movil: text('uuid_movil'),
    lote_uuid: text('lote_uuid'),
    proyecto_uuid: text('proyecto_uuid'),
    ciclo_uuid: text('ciclo_uuid'),
    visita_uuid: text('visita_uuid'),          // FK a visitas.uuid_movil
    nombre_plantilla: text('nombre_plantilla'),
    datos_variables: text('datos_variables'),   // JSON string
    sync_status: text('sync_status').default('draft'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});
```

### 2.6 Tablas de Catálogo (solo lectura local)

```javascript
export const provincias = sqliteTable('provincias', {
    id: integer('id').primaryKey(),
    nombre: text('nombre').notNull(),
});

export const cantones = sqliteTable('cantones', {
    id: integer('id').primaryKey(),
    provincia_id: integer('provincia_id').notNull(),
    nombre: text('nombre').notNull(),
});

export const estaciones = sqliteTable('estaciones', {
    id: integer('id').primaryKey(),
    nombre: text('nombre').notNull(),
    canton_id: integer('canton_id'),
});

export const cultivos = sqliteTable('cultivos', {
    id: integer('id').primaryKey(),
    nombre: text('nombre').notNull(),
    nombre_cientifico: text('nombre_cientifico'),
});

export const variedades = sqliteTable('variedades', {
    id: integer('id').primaryKey().autoincrement(),
    cultivo_id: integer('cultivo_id'),
    nombre: text('nombre').notNull(),
    caracteristicas_base: text('caracteristicas_base'),
});
```

### 2.7 Tabla: configuracion

```javascript
export const configuracion = sqliteTable('configuracion', {
    id: integer('id').primaryKey().check('id' === 1), // Solo 1 fila
    usuario_id: integer('usuario_id'),
    es_invitado: integer('es_invitado').default(0),
    dispositivo_id: text('dispositivo_id'),
    ultimo_sync: text('ultimo_sync'),
});
```

---

## 3. FUNCIONES CRUD

### 3.1 Lotes

```javascript
// Crear
crearLoteLocal(loteData) → Promise<{ ...lote, uuid_movil }>

// Leer
obtenerLotesLocales() → Promise<Lote[]>
obtenerLotesPendientesSync() → Promise<Lote[]>  // WHERE sync_status = 'pending'

// Actualizar
marcarLoteComoSincronizado(uuid_movil) → Promise<void>

// Dentro de db/client.js
export const crearLoteLocal = async (loteData) => {
    const uuid = Crypto.randomUUID();
    const now = new Date().toISOString();
    // INSERT con sync_status: SYNC_STATUS.DRAFT
    // Retorna { ...nuevoLote, uuid_movil: uuid }
};
```

### 3.2 Proyectos

```javascript
crearProyectoLocal(proyectoData, { loteUuid }) → Promise<Proyecto>
obtenerProyectosLocales() → Promise<Proyecto[]>
obtenerProyectosPorLote(loteUuid) → Promise<Proyecto[]>
obtenerProyectosPendientesSync() → Promise<Proyecto[]>
actualizarProyectoLocal(uuid_movil, datos) → Promise<void>
eliminarProyectoLocal(uuid_movil) → Promise<void>
marcarProyectoComoSincronizado(uuid_movil) → Promise<void>
```

### 3.3 Ciclos de Cultivo

```javascript
crearCicloLocal(cicloData, { loteUuid, proyectoUuid }) → Promise<Ciclo>
obtenerCiclosPorProyecto(proyectoUuid) → Promise<Ciclo[]>
obtenerCiclosPorProyectoUuid(proyectoUuid) → Promise<Ciclo[]>
obtenerCicloLocal(uuid_movil) → Promise<Ciclo | null>
```

### 3.4 Visitas

```javascript
crearVisitaLocal(visitaData, { loteUuid, proyectoUuid, cicloUuid }) → Promise<Visita>
obtenerVisitasPorProyecto(proyectoUuid) → Promise<Visita[]>
obtenerVisitasPorProyectoUuid(proyectoUuid) → Promise<Visita[]>
obtenerVisitasPorCicloUuid(cicloUuid) → Promise<Visita[]>
actualizarVisitaLocal(uuid_movil, datos) → Promise<void>
marcarVisitaComoSincronizado(uuid_movil) → Promise<void>
```

### 3.5 Hojas de Datos

```javascript
crearHojaDatosLocal(hojaData, { loteUuid, proyectoUuid, cicloUuid, visitaUuid }) → Promise<Hoja>
obtenerHojasPorVisitaUuid(visitaUuid) → Promise<Hoja[]>
obtenerHojaDatosPorVisita(visitaUuid) → Promise<Hoja[]>
actualizarHojaDatosLocal(uuid_movil, datos) → Promise<void>
```

### 3.6 Catálogos

```javascript
obtenerCultivosLocales() → Promise<Cultivo[]>
obtenerVariedadesPorCultivo(cultivoId) → Promise<Variedad[]>
```

---

## 4. INICIALIZACIÓN

```javascript
// db/client.js
export const initDb = async () => {
    await expoDb.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS lotes (...);
        CREATE TABLE IF NOT EXISTS proyectos (...);
        -- etc.
    `);

    // Migración: agregar columnas UUID si no existen (para DB existentes)
    const migrarColumnas = async () => {
        // ALTER TABLE para agregar columnas uuid_* a tablas existentes
    };
    await migrarColumnas();
};
```

---

## 5. UUID MÓVIL

Cada registro local tiene un `uuid_movil` generado con:

```javascript
import * as Crypto from 'expo-crypto';
const uuid = Crypto.randomUUID();
```

Este UUID es único por dispositivo y se usa para:
- Identificar registros locales antes de tener ID del servidor
- Hacer sync/merge con el backend
- Relacionar entidades (lote → proyecto → ciclo → visita → hoja)

---

## 6. sync_status

Todas las entidades modificables tienen campo `sync_status`:

| Estado | Significado |
|--------|--------------|
| `'draft'` | Creado localmente, nunca sincronizado |
| `'pending'` | Pendiente de subir al servidor |
| `'synced'` | Sincronizado con el servidor |

---

## 7. EXPORTACIÓN (db/index.js)

```javascript
// db/index.js - Barrel export
export { db, initDb, SYNC_STATUS } from './client';
export {
    crearLoteLocal,
    obtenerLotesLocales,
    obtenerLotesPendientesSync,
    marcarLoteComoSincronizado,
    crearProyectoLocal,
    // ... todas las demás funciones
} from './client';
```

---

**Generado: 2026-08-16 | Proyecto: movil-INIAP-Front**
