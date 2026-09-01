import {
    and,
    asc,
    eq,
    isNull,
} from "drizzle-orm";

import { db } from "../db/client";

import {
    cultivos,
    variedades,
    enfermedades,
    plagas,
    recomendaciones,
    etapasCultivo,
    cultivoEnfermedad,
    cultivoPlaga,
    enfermedadRecomendacion,
    plagaRecomendacion,
    etapaRecomendacion,
    etapaEnfermedad,
    etapaPlaga,
    catalogosSyncControl,
} from "../db/schema";

/**
 * Comprueba y convierte un identificador.
 */
function normalizarId(valor) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

/**
 * Obtiene cultivos activos y no eliminados.
 */
export async function obtenerCultivosActivos() {
    return await db
        .select({
            id: cultivos.id,
            nombre: cultivos.nombre,
            nombre_cientifico:
                cultivos.nombre_cientifico,
            descripcion: cultivos.descripcion,
            estado: cultivos.estado,
        })
        .from(cultivos)
        .where(
            and(
                eq(cultivos.estado, "activo"),
                isNull(cultivos.deleted_at)
            )
        )
        .orderBy(asc(cultivos.nombre));
}

/**
 * Obtiene etapas fenologicas activas de un cultivo.
 */
export async function obtenerEtapasPorCultivo(cultivoId) {
    const id = normalizarId(cultivoId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: etapasCultivo.id,
            cultivo_id: etapasCultivo.cultivo_id,
            nombre: etapasCultivo.nombre,
            descripcion: etapasCultivo.descripcion,
            orden: etapasCultivo.orden,
            duracion_dias_estimada:
                etapasCultivo.duracion_dias_estimada,
            indicadores_clave:
                etapasCultivo.indicadores_clave,
            estado: etapasCultivo.estado,
        })
        .from(etapasCultivo)
        .where(
            and(
                eq(etapasCultivo.cultivo_id, id),
                eq(etapasCultivo.estado, "activo"),
                isNull(etapasCultivo.deleted_at)
            )
        )
        .orderBy(asc(etapasCultivo.orden));
}

/**
 * Obtiene una etapa fenologica activa por id.
 */
export async function obtenerEtapaPorId(etapaId) {
    const id = normalizarId(etapaId);

    if (!id) {
        return null;
    }

    const resultados = await db
        .select({
            id: etapasCultivo.id,
            cultivo_id: etapasCultivo.cultivo_id,
            nombre: etapasCultivo.nombre,
            descripcion: etapasCultivo.descripcion,
            orden: etapasCultivo.orden,
            duracion_dias_estimada:
                etapasCultivo.duracion_dias_estimada,
            indicadores_clave:
                etapasCultivo.indicadores_clave,
            estado: etapasCultivo.estado,
        })
        .from(etapasCultivo)
        .where(
            and(
                eq(etapasCultivo.id, id),
                eq(etapasCultivo.estado, "activo"),
                isNull(etapasCultivo.deleted_at)
            )
        )
        .limit(1);

    return resultados[0] || null;
}

/**
 * Obtiene enfermedades relacionadas con un cultivo.
 */
export async function obtenerEnfermedadesPorCultivo(
    cultivoId
) {
    const id = normalizarId(cultivoId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: enfermedades.id,
            nombre: enfermedades.nombre,
            nombre_cientifico:
                enfermedades.nombre_cientifico,
            descripcion: enfermedades.descripcion,
            sintomas: enfermedades.sintomas,
            estado: enfermedades.estado,
        })
        .from(enfermedades)
        .innerJoin(
            cultivoEnfermedad,
            eq(
                enfermedades.id,
                cultivoEnfermedad.enfermedad_id
            )
        )
        .where(
            and(
                eq(
                    cultivoEnfermedad.cultivo_id,
                    id
                ),
                eq(enfermedades.estado, "activo"),
                isNull(enfermedades.deleted_at)
            )
        )
        .orderBy(asc(enfermedades.nombre));
}

/**
 * Obtiene variedades activas de un cultivo específico.
 */
export async function obtenerVariedadesPorCultivo(cultivoId) {
    const id = normalizarId(cultivoId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: variedades.id,
            nombre: variedades.nombre,
            cultivo_id: variedades.cultivo_id,
            caracteristicas_base: variedades.caracteristicas_base,
        })
        .from(variedades)
        .where(eq(variedades.cultivo_id, id))
        .orderBy(asc(variedades.nombre));
}

/**
 * Obtiene plagas relacionadas con un cultivo.
 */
export async function obtenerPlagasPorCultivo(
    cultivoId
) {
    const id = normalizarId(cultivoId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: plagas.id,
            nombre: plagas.nombre,
            nombre_cientifico:
                plagas.nombre_cientifico,
            descripcion: plagas.descripcion,
            danos: plagas.danos,
            estado: plagas.estado,
        })
        .from(plagas)
        .innerJoin(
            cultivoPlaga,
            eq(
                plagas.id,
                cultivoPlaga.plaga_id
            )
        )
        .where(
            and(
                eq(cultivoPlaga.cultivo_id, id),
                eq(plagas.estado, "activo"),
                isNull(plagas.deleted_at)
            )
        )
        .orderBy(asc(plagas.nombre));
}

/**
 * Obtiene enfermedades relacionadas con una etapa.
 */
export async function obtenerEnfermedadesPorEtapa(
    etapaId
) {
    const id = normalizarId(etapaId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: enfermedades.id,
            nombre: enfermedades.nombre,
            nombre_cientifico:
                enfermedades.nombre_cientifico,
            descripcion: enfermedades.descripcion,
            sintomas: enfermedades.sintomas,
            estado: enfermedades.estado,
            nivel_riesgo: etapaEnfermedad.nivel_riesgo,
        })
        .from(enfermedades)
        .innerJoin(
            etapaEnfermedad,
            eq(
                enfermedades.id,
                etapaEnfermedad.enfermedad_id
            )
        )
        .where(
            and(
                eq(
                    etapaEnfermedad.etapa_cultivo_id,
                    id
                ),
                eq(enfermedades.estado, "activo"),
                isNull(enfermedades.deleted_at)
            )
        )
        .orderBy(asc(enfermedades.nombre));
}

/**
 * Obtiene plagas relacionadas con una etapa.
 */
export async function obtenerPlagasPorEtapa(etapaId) {
    const id = normalizarId(etapaId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: plagas.id,
            nombre: plagas.nombre,
            nombre_cientifico:
                plagas.nombre_cientifico,
            descripcion: plagas.descripcion,
            danos: plagas.danos,
            estado: plagas.estado,
            nivel_riesgo: etapaPlaga.nivel_riesgo,
        })
        .from(plagas)
        .innerJoin(
            etapaPlaga,
            eq(plagas.id, etapaPlaga.plaga_id)
        )
        .where(
            and(
                eq(etapaPlaga.etapa_cultivo_id, id),
                eq(plagas.estado, "activo"),
                isNull(plagas.deleted_at)
            )
        )
        .orderBy(asc(plagas.nombre));
}

/**
 * Obtiene recomendaciones de una enfermedad.
 */
export async function obtenerRecomendacionesPorEnfermedad(
    enfermedadId
) {
    const id = normalizarId(enfermedadId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: recomendaciones.id,
            titulo: recomendaciones.titulo,
            descripcion: recomendaciones.descripcion,
            tipo: recomendaciones.tipo,
            instrucciones:
                recomendaciones.instrucciones,
            estado: recomendaciones.estado,
        })
        .from(recomendaciones)
        .innerJoin(
            enfermedadRecomendacion,
            eq(
                recomendaciones.id,
                enfermedadRecomendacion.recomendacion_id
            )
        )
        .where(
            and(
                eq(
                    enfermedadRecomendacion.enfermedad_id,
                    id
                ),
                eq(recomendaciones.estado, "activo"),
                isNull(recomendaciones.deleted_at)
            )
        )
        .orderBy(asc(recomendaciones.titulo));
}

/**
 * Obtiene recomendaciones de una plaga.
 */
export async function obtenerRecomendacionesPorPlaga(
    plagaId
) {
    const id = normalizarId(plagaId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: recomendaciones.id,
            titulo: recomendaciones.titulo,
            descripcion: recomendaciones.descripcion,
            tipo: recomendaciones.tipo,
            instrucciones:
                recomendaciones.instrucciones,
            estado: recomendaciones.estado,
        })
        .from(recomendaciones)
        .innerJoin(
            plagaRecomendacion,
            eq(
                recomendaciones.id,
                plagaRecomendacion.recomendacion_id
            )
        )
        .where(
            and(
                eq(
                    plagaRecomendacion.plaga_id,
                    id
                ),
                eq(recomendaciones.estado, "activo"),
                isNull(recomendaciones.deleted_at)
            )
        )
        .orderBy(asc(recomendaciones.titulo));
}

/**
 * Obtiene el estado de la última sincronización.
 */
export async function obtenerRecomendacionesPorEtapa(
    etapaId
) {
    const id = normalizarId(etapaId);

    if (!id) {
        return [];
    }

    return await db
        .select({
            id: recomendaciones.id,
            titulo: recomendaciones.titulo,
            descripcion: recomendaciones.descripcion,
            tipo: recomendaciones.tipo,
            instrucciones:
                recomendaciones.instrucciones,
            estado: recomendaciones.estado,
        })
        .from(recomendaciones)
        .innerJoin(
            etapaRecomendacion,
            eq(
                recomendaciones.id,
                etapaRecomendacion.recomendacion_id
            )
        )
        .where(
            and(
                eq(
                    etapaRecomendacion.etapa_cultivo_id,
                    id
                ),
                eq(recomendaciones.estado, "activo"),
                isNull(recomendaciones.deleted_at)
            )
        )
        .orderBy(asc(recomendaciones.titulo));
}

export async function obtenerEstadoCatalogos() {
    const resultados = await db
        .select()
        .from(catalogosSyncControl)
        .where(
            eq(
                catalogosSyncControl.clave,
                "catalogos"
            )
        )
        .limit(1);

    return resultados[0] || {
        clave: "catalogos",
        ultima_sincronizacion: null,
        servidor_fecha: null,
        estado: "pendiente",
        ultimo_error: null,
        updated_at: null,
    };
}

export default {
    obtenerCultivosActivos,
    obtenerEtapasPorCultivo,
    obtenerEtapaPorId,
    obtenerVariedadesPorCultivo,
    obtenerEnfermedadesPorCultivo,
    obtenerPlagasPorCultivo,
    obtenerEnfermedadesPorEtapa,
    obtenerPlagasPorEtapa,
    obtenerRecomendacionesPorEnfermedad,
    obtenerRecomendacionesPorPlaga,
    obtenerRecomendacionesPorEtapa,
    obtenerEstadoCatalogos,
};
