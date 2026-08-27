import { db } from '../../db/client';
import { eq, and, desc } from 'drizzle-orm';
import {
    etapasCultivo,
    etapaRecomendacion,
    etapaEnfermedad,
    etapaPlaga,
    seguimientos,
    eventosSeguimiento,
    enfermedades,
    plagas,
    recomendaciones,
    SYNC_STATUS,
} from '../../db/schema';
import * as Crypto from 'expo-crypto';

// ==============================
// CATÁLOGO: Etapas
// ==============================

export async function guardarEtapasCatalogo(etapasData) {
    if (!Array.isArray(etapasData) || etapasData.length === 0) return;

    await db.transaction(async (tx) => {
        for (const etapa of etapasData) {
            const datos = {
                id: Number(etapa.id),
                cultivo_id: Number(etapa.cultivo_id),
                nombre: etapa.nombre,
                descripcion: etapa.descripcion || null,
                orden: Number(etapa.orden),
                duracion_dias_estimada: etapa.duracion_dias_estimada
                    ? Number(etapa.duracion_dias_estimada)
                    : null,
                indicadores_clave: typeof etapa.indicadores_clave === 'string'
                    ? etapa.indicadores_clave
                    : JSON.stringify(etapa.indicadores_clave || []),
                estado: etapa.estado || 'activo',
                updated_at: etapa.updated_at || null,
            };

            const { id, ...datosActualizables } = datos;

            await tx
                .insert(etapasCultivo)
                .values(datos)
                .onConflictDoUpdate({
                    target: etapasCultivo.id,
                    set: datosActualizables,
                });
        }
    });
}

export async function guardarRelacionesEtapas(relaciones) {
    await db.transaction(async (tx) => {
        await tx.delete(etapaRecomendacion);
        await tx.delete(etapaEnfermedad);
        await tx.delete(etapaPlaga);

        const etapaRec = relaciones.etapa_recomendacion || [];
        if (etapaRec.length > 0) {
            await tx.insert(etapaRecomendacion).values(
                etapaRec.map((r) => ({
                    etapa_cultivo_id: Number(r.etapa_cultivo_id),
                    recomendacion_id: Number(r.recomendacion_id),
                    updated_at: r.updated_at || null,
                }))
            );
        }

        const etapaEnf = relaciones.etapa_enfermedad || [];
        if (etapaEnf.length > 0) {
            await tx.insert(etapaEnfermedad).values(
                etapaEnf.map((r) => ({
                    etapa_cultivo_id: Number(r.etapa_cultivo_id),
                    enfermedad_id: Number(r.enfermedad_id),
                    nivel_riesgo: r.nivel_riesgo || 'medio',
                    updated_at: r.updated_at || null,
                }))
            );
        }

        const etapaPla = relaciones.etapa_plaga || [];
        if (etapaPla.length > 0) {
            await tx.insert(etapaPlaga).values(
                etapaPla.map((r) => ({
                    etapa_cultivo_id: Number(r.etapa_cultivo_id),
                    plaga_id: Number(r.plaga_id),
                    nivel_riesgo: r.nivel_riesgo || 'medio',
                    updated_at: r.updated_at || null,
                }))
            );
        }
    });
}

export async function obtenerEtapasLocal(cultivoId) {
    if (!cultivoId) {
        return db
            .select()
            .from(etapasCultivo)
            .where(eq(etapasCultivo.estado, 'activo'))
            .orderBy(etapasCultivo.orden);
    }

    return db
        .select()
        .from(etapasCultivo)
        .where(
            and(
                eq(etapasCultivo.cultivo_id, Number(cultivoId)),
                eq(etapasCultivo.estado, 'activo')
            )
        )
        .orderBy(etapasCultivo.orden);
}

export async function obtenerRelacionesEtapa(etapaId) {
    const id = Number(etapaId);

    const [recs, enfs, plas] = await Promise.all([
        db
            .select({
                etapa_cultivo_id: etapaRecomendacion.etapa_cultivo_id,
                recomendacion_id: etapaRecomendacion.recomendacion_id,
                titulo: recomendaciones.titulo,
                descripcion: recomendaciones.descripcion,
                tipo: recomendaciones.tipo,
            })
            .from(etapaRecomendacion)
            .innerJoin(
                recomendaciones,
                eq(etapaRecomendacion.recomendacion_id, recomendaciones.id)
            )
            .where(eq(etapaRecomendacion.etapa_cultivo_id, id)),

        db
            .select({
                etapa_cultivo_id: etapaEnfermedad.etapa_cultivo_id,
                enfermedad_id: etapaEnfermedad.enfermedad_id,
                nivel_riesgo: etapaEnfermedad.nivel_riesgo,
                nombre: enfermedades.nombre,
                nombre_cientifico: enfermedades.nombre_cientifico,
            })
            .from(etapaEnfermedad)
            .innerJoin(
                enfermedades,
                eq(etapaEnfermedad.enfermedad_id, enfermedades.id)
            )
            .where(eq(etapaEnfermedad.etapa_cultivo_id, id)),

        db
            .select({
                etapa_cultivo_id: etapaPlaga.etapa_cultivo_id,
                plaga_id: etapaPlaga.plaga_id,
                nivel_riesgo: etapaPlaga.nivel_riesgo,
                nombre: plagas.nombre,
                nombre_cientifico: plagas.nombre_cientifico,
            })
            .from(etapaPlaga)
            .innerJoin(
                plagas,
                eq(etapaPlaga.plaga_id, plagas.id)
            )
            .where(eq(etapaPlaga.etapa_cultivo_id, id)),
    ]);

    return {
        recomendaciones: recs,
        enfermedades: enfs,
        plagas: plas,
    };
}

// ==============================
// SEGUIMIENTOS
// ==============================

export async function guardarSeguimientoLocal(datos) {
    const uuid = Crypto.randomUUID();
    const ahora = new Date().toISOString();

    const valores = {
        uuid_movil: uuid,
        proyecto_uuid: datos.proyecto_uuid,
        etapa_cultivo_id: Number(datos.etapa_cultivo_id),
        fecha_inicio: datos.fecha_inicio || ahora.split('T')[0],
        fecha_fin: datos.fecha_fin || null,
        estado: datos.estado || 'en_progreso',
        observaciones: datos.observaciones || null,
        sync_status: SYNC_STATUS.DRAFT,
        created_at: ahora,
        updated_at: ahora,
    };

    await db.insert(seguimientos).values(valores);
    return { ...valores };
}

export async function obtenerSeguimientosLocal(proyectoUuid) {
    const segs = await db
        .select({
            id: seguimientos.id,
            server_id: seguimientos.server_id,
            uuid_movil: seguimientos.uuid_movil,
            proyecto_uuid: seguimientos.proyecto_uuid,
            etapa_cultivo_id: seguimientos.etapa_cultivo_id,
            fecha_inicio: seguimientos.fecha_inicio,
            fecha_fin: seguimientos.fecha_fin,
            estado: seguimientos.estado,
            observaciones: seguimientos.observaciones,
            sync_status: seguimientos.sync_status,
            etapa_nombre: etapasCultivo.nombre,
            etapa_orden: etapasCultivo.orden,
            etapa_duracion: etapasCultivo.duracion_dias_estimada,
            etapa_descripcion: etapasCultivo.descripcion,
            etapa_indicadores: etapasCultivo.indicadores_clave,
        })
        .from(seguimientos)
        .leftJoin(
            etapasCultivo,
            eq(seguimientos.etapa_cultivo_id, etapasCultivo.id)
        )
        .where(eq(seguimientos.proyecto_uuid, proyectoUuid))
        .orderBy(etapasCultivo.orden);

    return segs;
}

export async function actualizarEstadoSeguimiento(uuid, estado) {
    const ahora = new Date().toISOString();
    const updates = {
        estado,
        updated_at: ahora,
        sync_status: SYNC_STATUS.DRAFT,
    };

    if (estado === 'completada') {
        updates.fecha_fin = ahora.split('T')[0];
    }

    await db
        .update(seguimientos)
        .set(updates)
        .where(eq(seguimientos.uuid_movil, uuid));
}

// ==============================
// EVENTOS
// ==============================

export async function guardarEventoLocal(datos) {
    const uuid = Crypto.randomUUID();
    const ahora = new Date().toISOString();

    const valores = {
        uuid_movil: uuid,
        seguimiento_uuid: datos.seguimiento_uuid,
        tipo_evento: datos.tipo_evento,
        titulo: datos.titulo,
        descripcion: datos.descripcion || null,
        fecha_evento: datos.fecha_evento || ahora,
        enfermedad_id: datos.enfermedad_id ? Number(datos.enfermedad_id) : null,
        plaga_id: datos.plaga_id ? Number(datos.plaga_id) : null,
        recomendacion_id: datos.recomendacion_id ? Number(datos.recomendacion_id) : null,
        severidad: datos.severidad || null,
        datos_adicionales: datos.datos_adicionales
            ? JSON.stringify(datos.datos_adicionales)
            : null,
        sync_status: SYNC_STATUS.DRAFT,
        created_at: ahora,
        updated_at: ahora,
    };

    await db.insert(eventosSeguimiento).values(valores);
    return { ...valores };
}

export async function obtenerEventosLocal(seguimientoUuid) {
    return db
        .select()
        .from(eventosSeguimiento)
        .where(eq(eventosSeguimiento.seguimiento_uuid, seguimientoUuid))
        .orderBy(desc(eventosSeguimiento.fecha_evento));
}

export async function obtenerTodosEventosProyecto(proyectoUuid) {
    const segs = await db
        .select({ uuid_movil: seguimientos.uuid_movil })
        .from(seguimientos)
        .where(eq(seguimientos.proyecto_uuid, proyectoUuid));

    if (segs.length === 0) return [];

    const allEventos = [];
    for (const seg of segs) {
        const eventos = await obtenerEventosLocal(seg.uuid_movil);
        allEventos.push(...eventos.map((e) => ({ ...e, seguimiento_uuid: seg.uuid_movil })));
    }

    return allEventos.sort(
        (a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento)
    );
}

export async function obtenerResumenSeguimiento(proyectoUuid) {
    const segs = await obtenerSeguimientosLocal(proyectoUuid);

    if (segs.length === 0) return null;

    const enProgreso = segs.find((s) => s.estado === 'en_progreso');
    const completadas = segs.filter((s) => s.estado === 'completada').length;
    const total = segs.length;

    return {
        etapaActual: enProgreso
            ? {
                  nombre: enProgreso.etapa_nombre,
                  orden: enProgreso.etapa_orden,
                  uuid_movil: enProgreso.uuid_movil,
              }
            : null,
        completadas,
        total,
        progreso: total > 0 ? completadas / total : 0,
    };
}

export default {
    guardarEtapasCatalogo,
    guardarRelacionesEtapas,
    obtenerEtapasLocal,
    obtenerRelacionesEtapa,
    guardarSeguimientoLocal,
    obtenerSeguimientosLocal,
    actualizarEstadoSeguimiento,
    guardarEventoLocal,
    obtenerEventosLocal,
    obtenerTodosEventosProyecto,
    obtenerResumenSeguimiento,
};
