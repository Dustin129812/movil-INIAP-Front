import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const SYNC_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    SYNCED: 'synced',
};

// ============================================
// TABLAS EXISTENTES
// ============================================

export const lotes = sqliteTable('lotes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id'),
    uuid_movil: text('uuid_movil').unique(),
    nombre_lote: text('nombre_lote').notNull(),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    coordenadas: text('coordenadas'),
    ubicacion_manual: text('ubicacion_manual'),
    provincia_id: integer('provincia_id'),
    canton_id: integer('canton_id'),
    estacion_id: integer('estacion_id'),
    imagen_url: text('imagen_url'),
    vertices_count: integer('vertices_count').default(0),
    estado_verificacion: text('estado_verificacion').default('pendiente'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
    deleted_at: text('deleted_at'),
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

// ============================================
// TABLAS DE PROYECTOS (AGRODECIDE)
// ============================================

export const proyectos = sqliteTable('proyectos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid_movil: text('uuid_movil').unique(),
    lote_uuid: text('lote_uuid'),           // UUID del lote al que pertenece (principal)
    titulo: text('titulo').notNull(),
    descripcion: text('descripcion'),
    variedad_id: integer('variedad_id'),     // ID de la variedad seleccionada
    variedad: text('variedad'),             // Nombre de la variedad (texto)
    variedad_nombre: text('variedad_nombre'), // Alias para variedad
    cultivo_id: integer('cultivo_id'),       // ID del cultivo
    cultivo_nombre: text('cultivo_nombre'),  // Nombre del cultivo
    fecha_siembra: text('fecha_siembra'),
    estado: text('estado').default('activo'),
    tipo_acolchado: text('tipo_acolchado'),
    tipo_ensayo: text('tipo_ensayo'),
    diseno_experimental: text('diseno_experimental'),
    financiamiento: text('financiamiento'),
    colaborador_nombre: text('colaborador_nombre'),
    colaborador_telefono: text('colaborador_telefono'),
    colaborador_celular: text('colaborador_celular'),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
    deleted_at: text('deleted_at'),
});

// Tabla intermedia para relacion N:M proyectos-lotes
export const proyecto_lotes = sqliteTable('proyecto_lotes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    proyecto_uuid: text('proyecto_uuid').notNull(),
    lote_uuid: text('lote_uuid').notNull(),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
});

// Tabla intermedia para relacion N:M proyectos-colaboradores
export const proyecto_colaboradores = sqliteTable('proyecto_colaboradores', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    proyecto_uuid: text('proyecto_uuid').notNull(),
    usuario_id: integer('usuario_id').notNull(),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
});

// Catálogo local de colaboradores externos
export const colaboradores_externos = sqliteTable('colaboradores_externos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    server_id: integer('server_id'),
    ci: text('ci').notNull().unique(),
    nombre_completo: text('nombre_completo').notNull(),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

// Relación N:M proyectos-colaboradores externos
export const proyecto_colaborador_externo = sqliteTable('proyecto_colaborador_externo', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    proyecto_uuid: text('proyecto_uuid').notNull(),
    colaborador_externo_id: integer('colaborador_externo_id').notNull(),
    participacion: text('participacion').notNull(),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});
export const ciclos_cultivo = sqliteTable('ciclos_cultivo', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid_movil: text('uuid_movil').unique(),
    lote_uuid: text('lote_uuid'),            // UUID del lote
    proyecto_uuid: text('proyecto_uuid'),     // UUID del proyecto al que pertenece
    cultivo_variedad: text('cultivo_variedad').notNull(),
    distancia_siembra: text('distancia_siembra'),
    fecha_siembra: text('fecha_siembra'),
    fecha_fin: text('fecha_fin'),
    metricas_siembra: text('metricas_siembra'),
    es_actual: integer('es_actual', { mode: 'boolean' }).default(true),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

export const visitas = sqliteTable('visitas', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid_movil: text('uuid_movil').unique(),
    lote_uuid: text('lote_uuid'),            // UUID del lote
    proyecto_uuid: text('proyecto_uuid'),     // UUID del proyecto
    ciclo_uuid: text('ciclo_uuid'),          // UUID del ciclo al que pertenece
    tecnico_nombre: text('tecnico_nombre'),
    fecha_visita: text('fecha_visita').notNull(),
    observaciones: text('observaciones'),
    recomendaciones: text('recomendaciones'),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

export const hojas_datos = sqliteTable('hojas_datos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    uuid_movil: text('uuid_movil').unique(),
    lote_uuid: text('lote_uuid'),            // UUID del lote
    proyecto_uuid: text('proyecto_uuid'),     // UUID del proyecto
    ciclo_uuid: text('ciclo_uuid'),          // UUID del ciclo
    visita_uuid: text('visita_uuid'),         // UUID de la visita al que pertenece
    nombre_plantilla: text('nombre_plantilla'),
    datos_variables: text('datos_variables'),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

// ============================================
// TABLAS DE CATÁLOGOS
// ============================================

export const cultivos = sqliteTable('cultivos', {
    id: integer('id').primaryKey(),
    nombre: text('nombre').notNull(),
    nombre_cientifico: text('nombre_cientifico'),
    descripcion: text('descripcion'),
    estado: text('estado').default('activo'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
    deleted_at: text('deleted_at'),
});

export const variedades = sqliteTable('variedades', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    cultivo_id: integer('cultivo_id'),
    nombre: text('nombre').notNull(),
    caracteristicas_base: text('caracteristicas_base'),
    deleted_at: text('deleted_at'),
});

export const enfermedades = sqliteTable('enfermedades', {
    id: integer('id').primaryKey(),
    nombre: text('nombre').notNull(),
    nombre_cientifico: text('nombre_cientifico'),
    descripcion: text('descripcion'),
    sintomas: text('sintomas'),
    estado: text('estado').default('activo'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
    deleted_at: text('deleted_at'),
});

export const plagas = sqliteTable('plagas', {
    id: integer('id').primaryKey(),
    nombre: text('nombre').notNull(),
    nombre_cientifico: text('nombre_cientifico'),
    descripcion: text('descripcion'),
    danos: text('danos'),
    estado: text('estado').default('activo'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
    deleted_at: text('deleted_at'),
});

export const recomendaciones = sqliteTable('recomendaciones', {
    id: integer('id').primaryKey(),
    titulo: text('titulo').notNull(),
    descripcion: text('descripcion'),
    tipo: text('tipo').default('manejo'),
    instrucciones: text('instrucciones'),
    estado: text('estado').default('activo'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
    deleted_at: text('deleted_at'),
});

export const cultivoEnfermedad = sqliteTable(
    'cultivo_enfermedad',
    {
        cultivo_id: integer('cultivo_id').notNull(),
        enfermedad_id: integer('enfermedad_id').notNull(),
        updated_at: text('updated_at'),
    },
    (tabla) => [
        primaryKey({
            columns: [
                tabla.cultivo_id,
                tabla.enfermedad_id,
            ],
        }),
    ]
);

export const cultivoPlaga = sqliteTable(
    'cultivo_plaga',
    {
        cultivo_id: integer('cultivo_id').notNull(),
        plaga_id: integer('plaga_id').notNull(),
        updated_at: text('updated_at'),
    },
    (tabla) => [
        primaryKey({
            columns: [
                tabla.cultivo_id,
                tabla.plaga_id,
            ],
        }),
    ]
);

export const enfermedadRecomendacion = sqliteTable(
    'enfermedad_recomendacion',
    {
        enfermedad_id: integer('enfermedad_id').notNull(),
        recomendacion_id: integer('recomendacion_id').notNull(),
        updated_at: text('updated_at'),
    },
    (tabla) => [
        primaryKey({
            columns: [
                tabla.enfermedad_id,
                tabla.recomendacion_id,
            ],
        }),
    ]
);

export const plagaRecomendacion = sqliteTable(
    'plaga_recomendacion',
    {
        plaga_id: integer('plaga_id').notNull(),
        recomendacion_id: integer('recomendacion_id').notNull(),
        updated_at: text('updated_at'),
    },
    (tabla) => [
        primaryKey({
            columns: [
                tabla.plaga_id,
                tabla.recomendacion_id,
            ],
        }),
    ]
);

// ============================================
// TABLAS DE SEGUIMIENTO POR ETAPAS
// ============================================

export const etapasCultivo = sqliteTable('etapas_cultivo', {
    id: integer('id').primaryKey(),
    cultivo_id: integer('cultivo_id'),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion'),
    orden: integer('orden').notNull(),
    duracion_dias_estimada: integer('duracion_dias_estimada'),
    indicadores_clave: text('indicadores_clave'),
    estado: text('estado').default('activo'),
    updated_at: text('updated_at'),
});

export const etapaRecomendacion = sqliteTable(
    'etapa_recomendacion',
    {
        etapa_cultivo_id: integer('etapa_cultivo_id').notNull(),
        recomendacion_id: integer('recomendacion_id').notNull(),
        updated_at: text('updated_at'),
    },
    (tabla) => [
        primaryKey({
            columns: [
                tabla.etapa_cultivo_id,
                tabla.recomendacion_id,
            ],
        }),
    ]
);

export const etapaEnfermedad = sqliteTable(
    'etapa_enfermedad',
    {
        etapa_cultivo_id: integer('etapa_cultivo_id').notNull(),
        enfermedad_id: integer('enfermedad_id').notNull(),
        nivel_riesgo: text('nivel_riesgo').default('medio'),
        updated_at: text('updated_at'),
    },
    (tabla) => [
        primaryKey({
            columns: [
                tabla.etapa_cultivo_id,
                tabla.enfermedad_id,
            ],
        }),
    ]
);

export const etapaPlaga = sqliteTable(
    'etapa_plaga',
    {
        etapa_cultivo_id: integer('etapa_cultivo_id').notNull(),
        plaga_id: integer('plaga_id').notNull(),
        nivel_riesgo: text('nivel_riesgo').default('medio'),
        updated_at: text('updated_at'),
    },
    (tabla) => [
        primaryKey({
            columns: [
                tabla.etapa_cultivo_id,
                tabla.plaga_id,
            ],
        }),
    ]
);

export const seguimientos = sqliteTable('seguimientos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    server_id: integer('server_id'),
    uuid_movil: text('uuid_movil').unique(),
    proyecto_uuid: text('proyecto_uuid').notNull(),
    etapa_cultivo_id: integer('etapa_cultivo_id').notNull(),
    fecha_inicio: text('fecha_inicio').notNull(),
    fecha_fin: text('fecha_fin'),
    estado: text('estado').default('en_progreso'),
    observaciones: text('observaciones'),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

export const eventosSeguimiento = sqliteTable('eventos_seguimiento', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    server_id: integer('server_id'),
    uuid_movil: text('uuid_movil').unique(),
    seguimiento_uuid: text('seguimiento_uuid').notNull(),
    tipo_evento: text('tipo_evento').notNull(),
    titulo: text('titulo').notNull(),
    descripcion: text('descripcion'),
    fecha_evento: text('fecha_evento').notNull(),
    enfermedad_id: integer('enfermedad_id'),
    plaga_id: integer('plaga_id'),
    recomendacion_id: integer('recomendacion_id'),
    severidad: text('severidad'),
    datos_adicionales: text('datos_adicionales'),
    sync_status: text('sync_status').default(SYNC_STATUS.DRAFT),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

export const catalogosSyncControl = sqliteTable(
    'catalogos_sync_control',
    {
        clave: text('clave').primaryKey(),
        ultima_sincronizacion: text(
            'ultima_sincronizacion'
        ),
        servidor_fecha: text('servidor_fecha'),
        estado: text('estado').default('pendiente'),
        ultimo_error: text('ultimo_error'),
        updated_at: text('updated_at'),
    }
);
// ============================================
// CONFIGURACIÓN
// ============================================

export const configuracion = sqliteTable('configuracion', {
    id: integer('id').primaryKey(),
    usuario_id: integer('usuario_id'),
    es_invitado: integer('es_invitado', { mode: 'boolean' }).default(false),
    dispositivo_id: text('dispositivo_id'),
    ultimo_sync: text('ultimo_sync'),
});
