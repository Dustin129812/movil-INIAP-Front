import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
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
                created_at TEXT,
                updated_at TEXT
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
        `);
        console.log('[SQLite] Base de datos local inicializada correctamente');
    } catch (error) {
        console.error('[SQLite] Error al inicializar la base de datos:', error);
        throw error;
    }
};

export const crearLoteLocal = async (loteData) => {
    const uuid = crypto.randomUUID();
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
        sync_status: SYNC_STATUS.DRAFT,
        created_at: now,
        updated_at: now,
    };

    await db.insert(schema.lotes).values(nuevoLote);
    return { ...nuevoLote, uuid_movil: uuid };
};

export const obtenerLotesLocales = async () => {
    return await db.select().from(schema.lotes);
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

export default db;
