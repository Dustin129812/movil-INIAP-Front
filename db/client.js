import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq, isNull } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import * as schema from './schema';

const expoDb = SQLite.openDatabaseSync('simpagi_local.db');

export const db = drizzle(expoDb, { schema });

export const SYNC_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    SYNCED: 'synced',
};

export const initDb = async () => {
    try {
        await expoDb.execAsync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS lotes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                uuid_movil TEXT,
                nombre_lote TEXT NOT NULL,
                sync_status TEXT DEFAULT 'draft',
                coordenadas TEXT,
                ubicacion_manual TEXT,
                provincia_id INTEGER,
                canton_id INTEGER,
                estacion_id INTEGER,
                imagen_url TEXT,
                vertices_count INTEGER DEFAULT 0,
                estado_verificacion TEXT DEFAULT 'pendiente',
                created_at TEXT,
                updated_at TEXT,
                deleted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS provincias (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cantones (
                id INTEGER PRIMARY KEY,
                provincia_id INTEGER NOT NULL,
                nombre TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS estaciones (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                canton_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS configuracion (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                usuario_id INTEGER,
                es_invitado INTEGER DEFAULT 0,
                dispositivo_id TEXT,
                ultimo_sync TEXT
            );

            INSERT OR IGNORE INTO configuracion (id) VALUES (1);

            CREATE TABLE IF NOT EXISTS proyectos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid_movil TEXT,
                lote_uuid TEXT,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                variedad TEXT,
                variedad_id INTEGER,
                variedad_nombre TEXT,
                cultivo_id INTEGER,
                cultivo_nombre TEXT,
                fecha_siembra TEXT,
                estado TEXT DEFAULT 'activo',
                tipo_acolchado TEXT,
                tipo_ensayo TEXT,
                diseno_experimental TEXT,
                financiamiento TEXT,
                colaborador_nombre TEXT,
                colaborador_telefono TEXT,
                colaborador_celular TEXT,
                sync_status TEXT DEFAULT 'draft',
                created_at TEXT,
                updated_at TEXT,
                deleted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS ciclos_cultivo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid_movil TEXT,
                lote_uuid TEXT,
                proyecto_uuid TEXT,
                cultivo_variedad TEXT NOT NULL,
                distancia_siembra TEXT,
                fecha_siembra TEXT,
                fecha_fin TEXT,
                metricas_siembra TEXT,
                es_actual INTEGER DEFAULT 1,
                sync_status TEXT DEFAULT 'draft',
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS visitas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid_movil TEXT,
                lote_uuid TEXT,
                proyecto_uuid TEXT,
                ciclo_uuid TEXT,
                tecnico_nombre TEXT,
                fecha_visita TEXT NOT NULL,
                observaciones TEXT,
                recomendaciones TEXT,
                sync_status TEXT DEFAULT 'draft',
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS hojas_datos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid_movil TEXT,
                lote_uuid TEXT,
                proyecto_uuid TEXT,
                ciclo_uuid TEXT,
                visita_uuid TEXT,
                nombre_plantilla TEXT,
                datos_variables TEXT,
                sync_status TEXT DEFAULT 'draft',
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS cultivos (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                nombre_cientifico TEXT,
                descripcion TEXT,
                estado TEXT DEFAULT 'activo',
                created_at TEXT,
                updated_at TEXT,
                deleted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS variedades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cultivo_id INTEGER,
                nombre TEXT NOT NULL,
                caracteristicas_base TEXT
            );

            CREATE TABLE IF NOT EXISTS enfermedades (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                nombre_cientifico TEXT,
                descripcion TEXT,
                sintomas TEXT,
                estado TEXT DEFAULT 'activo',
                created_at TEXT,
                updated_at TEXT,
                deleted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS plagas (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                nombre_cientifico TEXT,
                descripcion TEXT,
                danos TEXT,
                estado TEXT DEFAULT 'activo',
                created_at TEXT,
                updated_at TEXT,
                deleted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS recomendaciones (
                id INTEGER PRIMARY KEY,
                titulo TEXT NOT NULL,
                descripcion TEXT NOT NULL,
                tipo TEXT DEFAULT 'manejo',
                instrucciones TEXT,
                estado TEXT DEFAULT 'activo',
                created_at TEXT,
                updated_at TEXT,
                deleted_at TEXT
            );

            CREATE TABLE IF NOT EXISTS cultivo_enfermedad (
                cultivo_id INTEGER NOT NULL,
                enfermedad_id INTEGER NOT NULL,
                updated_at TEXT,
                PRIMARY KEY (cultivo_id, enfermedad_id),
                FOREIGN KEY (cultivo_id)
                    REFERENCES cultivos(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (enfermedad_id)
                    REFERENCES enfermedades(id)
                    ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS cultivo_plaga (
                cultivo_id INTEGER NOT NULL,
                plaga_id INTEGER NOT NULL,
                updated_at TEXT,
                PRIMARY KEY (cultivo_id, plaga_id),
                FOREIGN KEY (cultivo_id)
                    REFERENCES cultivos(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (plaga_id)
                    REFERENCES plagas(id)
                    ON DELETE CASCADE
        );

            CREATE TABLE IF NOT EXISTS enfermedad_recomendacion (
                enfermedad_id INTEGER NOT NULL,
                recomendacion_id INTEGER NOT NULL,
                updated_at TEXT,
                PRIMARY KEY (enfermedad_id, recomendacion_id),
                FOREIGN KEY (enfermedad_id)
                    REFERENCES enfermedades(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (recomendacion_id)
                    REFERENCES recomendaciones(id)
                    ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS plaga_recomendacion (
                plaga_id INTEGER NOT NULL,
                recomendacion_id INTEGER NOT NULL,
                updated_at TEXT,
                PRIMARY KEY (plaga_id, recomendacion_id),
                FOREIGN KEY (plaga_id)
                    REFERENCES plagas(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (recomendacion_id)
                    REFERENCES recomendaciones(id)
                    ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS catalogos_sync_control (
                clave TEXT PRIMARY KEY,
                ultima_sincronizacion TEXT,
                servidor_fecha TEXT,
                estado TEXT DEFAULT 'pendiente',
                ultimo_error TEXT,
                updated_at TEXT
            );

            INSERT OR IGNORE INTO catalogos_sync_control (
                clave,
                estado
            ) VALUES (
                'catalogos',
                'pendiente'
            );

            CREATE TABLE IF NOT EXISTS proyecto_lotes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                proyecto_uuid TEXT NOT NULL,
                lote_uuid TEXT NOT NULL,
                sync_status TEXT DEFAULT 'draft',
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS proyecto_colaboradores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                proyecto_uuid TEXT NOT NULL,
                usuario_id INTEGER NOT NULL,
                sync_status TEXT DEFAULT 'draft',
                created_at TEXT
            );

    `);
    
        // Migración: agregar columnas UUID si no existen (para DB existentes)
        const migrarColumnas = async () => {
            try {
                 
            // MIGRACIÓN DEL CATÁLOGO DE CULTIVOS
            try {
                await expoDb.execAsync(`
                    ALTER TABLE cultivos
                    ADD COLUMN descripcion TEXT;
                `);
            } catch (e) {
                // La columna ya existe
            }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE cultivos
                    ADD COLUMN estado TEXT DEFAULT 'activo';
                `);
            } catch (e) {
                // La columna ya existe
            }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE cultivos
                    ADD COLUMN created_at TEXT;
                `);
            } catch (e) {
                // La columna ya existe
            }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE cultivos
                    ADD COLUMN updated_at TEXT;
                `);
            } catch (e) {
                // La columna ya existe
            }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE cultivos
                    ADD COLUMN deleted_at TEXT;
                `);
            } catch (e) {
                // La columna ya existe
            }

                // Proyectos
                await expoDb.execAsync(`
                    ALTER TABLE proyectos ADD COLUMN lote_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE ciclos_cultivo ADD COLUMN lote_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE ciclos_cultivo ADD COLUMN proyecto_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE visitas ADD COLUMN lote_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE visitas ADD COLUMN proyecto_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE visitas ADD COLUMN ciclo_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE hojas_datos ADD COLUMN lote_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE hojas_datos ADD COLUMN proyecto_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE hojas_datos ADD COLUMN ciclo_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE hojas_datos ADD COLUMN visita_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE lotes ADD COLUMN estado_verificacion TEXT DEFAULT 'pendiente';
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE lotes ADD COLUMN deleted_at TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE proyectos ADD COLUMN deleted_at TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE proyectos ADD COLUMN cultivo_id INTEGER;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE proyectos ADD COLUMN cultivo_nombre TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE proyectos ADD COLUMN variedad_id INTEGER;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE proyectos ADD COLUMN variedad_nombre TEXT;
                `);
            } catch (e) { /* columna ya existe */ }

            try {
                await expoDb.execAsync(`
                    ALTER TABLE proyectos ADD COLUMN lote_uuid TEXT;
                `);
            } catch (e) { /* columna ya existe */ }
        };

        await migrarColumnas();
    } catch (error) {
        throw error;
    }
};

export const crearLoteLocal = async (loteData) => {
    const uuid = Crypto.randomUUID();
    const now = new Date().toISOString();

    const nuevoLote = {
        uuid_movil: uuid,
        user_id: loteData.user_id,
        nombre_lote: loteData.nombre_lote,
        coordenadas: JSON.stringify(loteData.coordenadas || null),
        ubicacion_manual: loteData.ubicacion_manual || null,
        provincia_id: loteData.provincia_id || null,
        canton_id: loteData.canton_id || null,
        estacion_id: loteData.estacion_id || null,
        imagen_url: loteData.imagen_url || null,
        vertices_count: loteData.vertices_count || 0,
        estado_verificacion: loteData.estado_verificacion || 'pendiente',
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
        updated_at: now,
    };

    await db.insert(schema.lotes).values(nuevoLote);
    return { ...nuevoLote, uuid_movil: uuid };
};

export const obtenerLotesLocales = async () => {
    return await db
        .select()
        .from(schema.lotes)
        .where(isNull(schema.lotes.deleted_at));
};

export const softDeleteLote = async (uuid_movil) => {
    await db
        .update(schema.lotes)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(schema.lotes.uuid_movil, uuid_movil));
};

export const obtenerLotesPendientesSync = async () => {
    return await db
        .select()
        .from(schema.lotes)
        .where(eq(schema.lotes.sync_status, SYNC_STATUS.PENDING));
};

export const marcarLoteComoSincronizado = async (uuid_movil) => {
    await db
        .update(schema.lotes)
        .set({
            sync_status: SYNC_STATUS.SYNCED,
            updated_at: new Date().toISOString(),
        })
        .where(eq(schema.lotes.uuid_movil, uuid_movil));
};

// ============================================
// PROYECTOS
// ============================================

export const crearProyectoLocal = async (proyectoData, { loteUuid }) => {
    const uuid = proyectoData.uuid_movil || Crypto.randomUUID();
    const now = new Date().toISOString();

    const nuevoProyecto = {
        uuid_movil: uuid,
        lote_uuid: loteUuid || proyectoData.lote_uuid || null,
        titulo: proyectoData.titulo,
        descripcion: proyectoData.descripcion || null,
        variedad_id: proyectoData.variedad_id || null,
        variedad: proyectoData.variedad_nombre || proyectoData.variedad || null,
        variedad_nombre: proyectoData.variedad_nombre || null,
        cultivo_id: proyectoData.cultivo_id || null,
        cultivo_nombre: proyectoData.cultivo_nombre || null,
        fecha_siembra: proyectoData.fecha_siembra || null,
        estado: proyectoData.estado || 'activo',
        tipo_acolchado: proyectoData.tipo_acolchado || null,
        tipo_ensayo: proyectoData.tipo_ensayo || null,
        diseno_experimental: proyectoData.diseno_experimental || null,
        financiamiento: proyectoData.financiamiento || null,
        colaborador_nombre: proyectoData.colaborador_nombre || null,
        colaborador_telefono: proyectoData.colaborador_telefono || null,
        colaborador_celular: proyectoData.colaborador_celular || null,
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
        updated_at: now,
    };

    await db.insert(schema.proyectos).values(nuevoProyecto);
    return { ...nuevoProyecto, uuid_movil: uuid };
};

export const obtenerProyectosLocales = async () => {
    return await db
        .select()
        .from(schema.proyectos)
        .where(isNull(schema.proyectos.deleted_at));
};

export const obtenerProyectoLocal = async (uuid_movil) => {
    const resultados = await db
        .select()
        .from(schema.proyectos)
        .where(eq(schema.proyectos.uuid_movil, uuid_movil))
        .where(isNull(schema.proyectos.deleted_at));
    return resultados[0] || null;
};

export const obtenerProyectosPorLote = async (loteUuid) => {
    return await db
        .select()
        .from(schema.proyectos)
        .where(eq(schema.proyectos.lote_uuid, loteUuid))
        .where(isNull(schema.proyectos.deleted_at));
};

export const softDeleteProyecto = async (uuid_movil) => {
    await db
        .update(schema.proyectos)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: SYNC_STATUS.PENDING,
        })
        .where(eq(schema.proyectos.uuid_movil, uuid_movil));
};

export const actualizarProyectoLocal = async (uuid_movil, datos) => {
    // Excluir campos de relación N:M y variedad_id que no son columnas de proyectos
    const { lotes_ids, lotes_uuids, variedad_id, colaboradores_ids, ...proyectoData } = datos;
    await db
        .update(schema.proyectos)
        .set({
            ...proyectoData,
            sync_status: SYNC_STATUS.PENDING,
            updated_at: new Date().toISOString(),
        })
        .where(eq(schema.proyectos.uuid_movil, uuid_movil));
};

export const obtenerProyectosPendientesSync = async () => {
    return await db
        .select()
        .from(schema.proyectos)
        .where(eq(schema.proyectos.sync_status, SYNC_STATUS.PENDING));
};

export const marcarProyectoComoSincronizado = async (uuid_movil) => {
    await db
        .update(schema.proyectos)
        .set({
            sync_status: SYNC_STATUS.SYNCED,
            updated_at: new Date().toISOString(),
        })
        .where(eq(schema.proyectos.uuid_movil, uuid_movil));
};

// ============================================
// PROYECTO-LOTES (RELACION N:M)
// ============================================

export const crearProyectoLoteRelacion = async (proyectoUuid, loteUuid) => {
    const now = new Date().toISOString();
    await db.insert(schema.proyecto_lotes).values({
        proyecto_uuid: proyectoUuid,
        lote_uuid: loteUuid,
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
    });
};

export const obtenerLotesPorProyecto = async (proyectoUuid) => {
    const resultados = await db
        .select()
        .from(schema.proyecto_lotes)
        .where(eq(schema.proyecto_lotes.proyecto_uuid, proyectoUuid));
    return resultados.map(r => r.lote_uuid);
};

export const actualizarLotesDelProyecto = async (proyectoUuid, loteUuids) => {
    // Eliminar relaciones existentes
    await db.delete(schema.proyecto_lotes)
        .where(eq(schema.proyecto_lotes.proyecto_uuid, proyectoUuid));
    // Crear nuevas relaciones
    for (const loteUuid of loteUuids) {
        await crearProyectoLoteRelacion(proyectoUuid, loteUuid);
    }
};

// ============================================
// PROYECTO-COLABORADORES (RELACION N:M)
// ============================================

export const crearProyectoColaboradorRelacion = async (proyectoUuid, usuarioId) => {
    const now = new Date().toISOString();
    await db.insert(schema.proyecto_colaboradores).values({
        proyecto_uuid: proyectoUuid,
        usuario_id: usuarioId,
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
    });
};

export const obtenerColaboradoresPorProyecto = async (proyectoUuid) => {
    const resultados = await db
        .select()
        .from(schema.proyecto_colaboradores)
        .where(eq(schema.proyecto_colaboradores.proyecto_uuid, proyectoUuid));
    return resultados.map(r => r.usuario_id);
};

export const actualizarColaboradoresDelProyecto = async (proyectoUuid, usuarioIds) => {
    // Eliminar relaciones existentes
    await db.delete(schema.proyecto_colaboradores)
        .where(eq(schema.proyecto_colaboradores.proyecto_uuid, proyectoUuid));
    // Crear nuevas relaciones
    for (const usuarioId of usuarioIds) {
        await crearProyectoColaboradorRelacion(proyectoUuid, usuarioId);
    }
};

// ============================================
// CICLOS DE CULTIVO
// ============================================

export const crearCicloLocal = async (cicloData, { loteUuid, proyectoUuid }) => {
    const uuid = Crypto.randomUUID();
    const now = new Date().toISOString();

    const nuevoCiclo = {
        uuid_movil: uuid,
        lote_uuid: loteUuid || null,
        proyecto_uuid: proyectoUuid || null,
        cultivo_variedad: cicloData.cultivo_variedad,
        distancia_siembra: cicloData.distancia_siembra || null,
        fecha_siembra: cicloData.fecha_siembra || null,
        fecha_fin: cicloData.fecha_fin || null,
        metricas_siembra: cicloData.metricas_siembra ? JSON.stringify(cicloData.metricas_siembra) : null,
        es_actual: cicloData.es_actual !== false,
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
        updated_at: now,
    };

    await db.insert(schema.ciclos_cultivo).values(nuevoCiclo);
    return { ...nuevoCiclo, uuid_movil: uuid };
};

export const obtenerCiclosPorProyectoUuid = async (proyectoUuid) => {
    return await db
        .select()
        .from(schema.ciclos_cultivo)
        .where(eq(schema.ciclos_cultivo.proyecto_uuid, proyectoUuid));
};

export const obtenerCiclosPorProyecto = async (proyectoUuid) => {
    if (!proyectoUuid) return [];
    return await db
        .select()
        .from(schema.ciclos_cultivo)
        .where(eq(schema.ciclos_cultivo.proyecto_uuid, proyectoUuid));
};

export const obtenerCicloLocal = async (uuid_movil) => {
    const resultados = await db
        .select()
        .from(schema.ciclos_cultivo)
        .where(eq(schema.ciclos_cultivo.uuid_movil, uuid_movil));
    return resultados[0] || null;
};

// ============================================
// VISITAS
// ============================================

export const crearVisitaLocal = async (visitaData, { loteUuid, proyectoUuid, cicloUuid }) => {
    const uuid = Crypto.randomUUID();
    const now = new Date().toISOString();

    const nuevaVisita = {
        uuid_movil: uuid,
        lote_uuid: loteUuid || null,
        proyecto_uuid: proyectoUuid || null,
        ciclo_uuid: cicloUuid || null,
        tecnico_nombre: visitaData.tecnico_nombre || null,
        fecha_visita: visitaData.fecha_visita,
        observaciones: visitaData.observaciones || null,
        recomendaciones: visitaData.recomendaciones || null,
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
        updated_at: now,
    };

    await db.insert(schema.visitas).values(nuevaVisita);
    return { ...nuevaVisita, uuid_movil: uuid };
};

export const obtenerVisitasPorProyectoUuid = async (proyectoUuid) => {
    return await db
        .select()
        .from(schema.visitas)
        .where(eq(schema.visitas.proyecto_uuid, proyectoUuid));
};

export const obtenerVisitasPorCicloUuid = async (cicloUuid) => {
    return await db
        .select()
        .from(schema.visitas)
        .where(eq(schema.visitas.ciclo_uuid, cicloUuid));
};

export const obtenerVisitasPorProyecto = async (proyectoUuid) => {
    if (!proyectoUuid) return [];
    return await db
        .select()
        .from(schema.visitas)
        .where(eq(schema.visitas.proyecto_uuid, proyectoUuid));
};

export const obtenerVisitasPorCiclo = async (cicloId) => {
    return await db.select().from(schema.visitas);
};

export const actualizarVisitaLocal = async (uuid_movil, datos) => {
    await db
        .update(schema.visitas)
        .set({
            ...datos,
            updated_at: new Date().toISOString(),
        })
        .where(eq(schema.visitas.uuid_movil, uuid_movil));
};

export const marcarVisitaComoSincronizado = async (uuid_movil) => {
    await db
        .update(schema.visitas)
        .set({
            sync_status: SYNC_STATUS.SYNCED,
            updated_at: new Date().toISOString(),
        })
        .where(eq(schema.visitas.uuid_movil, uuid_movil));
};

// ============================================
// HOJAS DE DATOS
// ============================================

export const crearHojaDatosLocal = async (hojaData, { loteUuid, proyectoUuid, cicloUuid, visitaUuid }) => {
    const uuid = Crypto.randomUUID();
    const now = new Date().toISOString();

    const nuevaHoja = {
        uuid_movil: uuid,
        lote_uuid: loteUuid || null,
        proyecto_uuid: proyectoUuid || null,
        ciclo_uuid: cicloUuid || null,
        visita_uuid: visitaUuid || null,
        nombre_plantilla: hojaData.nombre_plantilla || 'Evaluación Generica',
        datos_variables: hojaData.datos_variables ? JSON.stringify(hojaData.datos_variables) : JSON.stringify({}),
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
        updated_at: now,
    };

    await db.insert(schema.hojas_datos).values(nuevaHoja);
    return { ...nuevaHoja, uuid_movil: uuid };
};

export const obtenerHojasPorVisitaUuid = async (visitaUuid) => {
    return await db
        .select()
        .from(schema.hojas_datos)
        .where(eq(schema.hojas_datos.visita_uuid, visitaUuid));
};

export const obtenerHojaDatosPorVisita = async (visitaUuid) => {
    if (!visitaUuid) return [];
    return await db
        .select()
        .from(schema.hojas_datos)
        .where(eq(schema.hojas_datos.visita_uuid, visitaUuid));
};

export const actualizarHojaDatosLocal = async (uuid_movil, datos) => {
    await db
        .update(schema.hojas_datos)
        .set({
            ...datos,
            datos_variables: datos.datos_variables ? JSON.stringify(datos.datos_variables) : undefined,
            updated_at: new Date().toISOString(),
        })
        .where(eq(schema.hojas_datos.uuid_movil, uuid_movil));
};

// ============================================
// CULTIVOS Y VARIEDADES
// ============================================

export const obtenerCultivosLocales = async () => {
    return await db.select().from(schema.cultivos);
};

export const obtenerVariedadesPorCultivo = async (cultivoId) => {
    return await db
        .select()
        .from(schema.variedades)
        .where(eq(schema.variedades.cultivo_id, cultivoId));
};

export default db;
