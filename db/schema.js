import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const SYNC_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    SYNCED: 'synced',
};

export const lotes = sqliteTable('lotes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id'),
    uuid_movil: text('uuid_movil'),
    nombre_lote: text('nombre_lote').notNull(),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    coordenadas: text('coordenadas'),
    ubicacion_manual: text('ubicacion_manual'),
    provincia_id: integer('provincia_id'),
    canton_id: integer('canton_id'),
    estacion_id: integer('estacion_id'),
    imagen_url: text('imagen_url'),
    vertices_count: integer('vertices_count').default(0),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

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

export const configuracion = sqliteTable('configuracion', {
    id: integer('id').primaryKey(),
    usuario_id: integer('usuario_id'),
    es_invitado: integer('es_invitado', { mode: 'boolean' }).default(false),
    dispositivo_id: text('dispositivo_id'),
    ultimo_sync: text('ultimo_sync'),
});
