import { db } from "../db/client";
import {
    cultivos,
    enfermedades,
    plagas,
    recomendaciones,
    cultivoEnfermedad,
    cultivoPlaga,
    enfermedadRecomendacion,
    plagaRecomendacion,
    catalogosSyncControl,
} from "../db/schema";

/**
 * Inserta o actualiza los registros de un catálogo.
 */
async function guardarRegistros(
    transaccion,
    tabla,
    columnaId,
    registros,
    transformar
) {
    if (!Array.isArray(registros)) {
        return;
    }

    for (const registro of registros) {
        const datos = transformar(registro);

        if (!datos.id) {
            continue;
        }

        const { id, ...datosActualizables } = datos;

        await transaccion
            .insert(tabla)
            .values(datos)
            .onConflictDoUpdate({
                target: columnaId,
                set: datosActualizables,
            });
    }
}

/**
 * Guarda los catálogos y reemplaza sus relaciones locales.
 */
export async function guardarCatalogosLocales(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error(
            "La información recibida para los catálogos no es válida."
        );
    }

    const relaciones = payload.relaciones || {};
    const fechaActual = new Date().toISOString();

    console.log("[Catálogos] Datos recibidos:", {
    cultivos: payload.cultivos?.length || 0,
    enfermedades: payload.enfermedades?.length || 0,
    plagas: payload.plagas?.length || 0,
    recomendaciones:
        payload.recomendaciones?.length || 0,
    cultivo_enfermedad:
        relaciones.cultivo_enfermedad?.length || 0,
    cultivo_plaga:
        relaciones.cultivo_plaga?.length || 0,
    enfermedad_recomendacion:
        relaciones.enfermedad_recomendacion?.length || 0,
    plaga_recomendacion:
        relaciones.plaga_recomendacion?.length || 0,
});

    const resultado = await db.transaction(async (tx) => {
        await guardarRegistros(
            tx,
            cultivos,
            cultivos.id,
            payload.cultivos,
            (item) => ({
                id: Number(item.id),
                nombre: item.nombre,
                nombre_cientifico: item.nombre_cientifico || null,
                descripcion: item.descripcion || null,
                estado: item.estado || "activo",
                created_at: item.created_at || null,
                updated_at: item.updated_at || null,
                deleted_at: item.deleted_at || null,
            })
        );

        await guardarRegistros(
            tx,
            enfermedades,
            enfermedades.id,
            payload.enfermedades,
            (item) => ({
                id: Number(item.id),
                nombre: item.nombre,
                nombre_cientifico: item.nombre_cientifico || null,
                descripcion: item.descripcion || null,
                sintomas: item.sintomas || null,
                estado: item.estado || "activo",
                created_at: item.created_at || null,
                updated_at: item.updated_at || null,
                deleted_at: item.deleted_at || null,
            })
        );

        await guardarRegistros(
            tx,
            plagas,
            plagas.id,
            payload.plagas,
            (item) => ({
                id: Number(item.id),
                nombre: item.nombre,
                nombre_cientifico: item.nombre_cientifico || null,
                descripcion: item.descripcion || null,
                danos: item.danos || null,
                estado: item.estado || "activo",
                created_at: item.created_at || null,
                updated_at: item.updated_at || null,
                deleted_at: item.deleted_at || null,
            })
        );

        await guardarRegistros(
            tx,
            recomendaciones,
            recomendaciones.id,
            payload.recomendaciones,
            (item) => ({
                id: Number(item.id),
                titulo: item.titulo,
                descripcion: item.descripcion,
                tipo: item.tipo || "manejo",
                instrucciones: item.instrucciones || null,
                estado: item.estado || "activo",
                created_at: item.created_at || null,
                updated_at: item.updated_at || null,
                deleted_at: item.deleted_at || null,
            })
        );

        /*
         * El backend devuelve todas las relaciones.
         * Solamente procesamos si hay catálogos disponibles.
         * Si no hay cultivos/enfermedades/plagas/recomendaciones,
         * skip processing relationships to avoid FK constraint errors.
         */
        const hayCatalogos = payload.cultivos?.length > 0 ||
            payload.enfermedades?.length > 0 ||
            payload.plagas?.length > 0 ||
            payload.recomendaciones?.length > 0;

        if (!hayCatalogos) {
            console.log("[Catálogos] No hay catálogos disponibles, omitiendo relaciones");
            await tx
                .insert(catalogosSyncControl)
                .values({
                    clave: "catalogos",
                    ultima_sincronizacion:
                        payload.servidor_fecha || fechaActual,
                    servidor_fecha:
                        payload.servidor_fecha || fechaActual,
                    estado: "sincronizado",
                    ultimo_error: null,
                    updated_at: fechaActual,
                })
                .onConflictDoUpdate({
                    target: catalogosSyncControl.clave,
                    set: {
                        ultima_sincronizacion:
                            payload.servidor_fecha || fechaActual,
                        servidor_fecha:
                            payload.servidor_fecha || fechaActual,
                        estado: "sincronizado",
                        ultimo_error: null,
                        updated_at: fechaActual,
                    },
                });
            return {
                success: true,
                servidorFecha: payload.servidor_fecha || fechaActual,
            };
        }

        await tx.delete(cultivoEnfermedad);
        await tx.delete(cultivoPlaga);
        await tx.delete(enfermedadRecomendacion);
        await tx.delete(plagaRecomendacion);

        const relacionesCultivoEnfermedad =
            relaciones.cultivo_enfermedad || [];

        if (relacionesCultivoEnfermedad.length > 0) {
            await tx.insert(cultivoEnfermedad).values(
                relacionesCultivoEnfermedad.map((item) => ({
                    cultivo_id: Number(item.cultivo_id),
                    enfermedad_id: Number(item.enfermedad_id),
                    updated_at: item.updated_at || null,
                }))
            );
        }

        const relacionesCultivoPlaga =
            relaciones.cultivo_plaga || [];

        if (relacionesCultivoPlaga.length > 0) {
            await tx.insert(cultivoPlaga).values(
                relacionesCultivoPlaga.map((item) => ({
                    cultivo_id: Number(item.cultivo_id),
                    plaga_id: Number(item.plaga_id),
                    updated_at: item.updated_at || null,
                }))
            );
        }

        const relacionesEnfermedadRecomendacion =
            relaciones.enfermedad_recomendacion || [];

        if (relacionesEnfermedadRecomendacion.length > 0) {
            await tx.insert(enfermedadRecomendacion).values(
                relacionesEnfermedadRecomendacion.map((item) => ({
                    enfermedad_id: Number(item.enfermedad_id),
                    recomendacion_id: Number(
                        item.recomendacion_id
                    ),
                    updated_at: item.updated_at || null,
                }))
            );
        }

        const relacionesPlagaRecomendacion =
            relaciones.plaga_recomendacion || [];

        if (relacionesPlagaRecomendacion.length > 0) {
            await tx.insert(plagaRecomendacion).values(
                relacionesPlagaRecomendacion.map((item) => ({
                    plaga_id: Number(item.plaga_id),
                    recomendacion_id: Number(
                        item.recomendacion_id
                    ),
                    updated_at: item.updated_at || null,
                }))
            );
        }

        await tx
            .insert(catalogosSyncControl)
            .values({
                clave: "catalogos",
                ultima_sincronizacion:
                    payload.servidor_fecha || fechaActual,
                servidor_fecha:
                    payload.servidor_fecha || fechaActual,
                estado: "sincronizado",
                ultimo_error: null,
                updated_at: fechaActual,
            })
            .onConflictDoUpdate({
                target: catalogosSyncControl.clave,
                set: {
                    ultima_sincronizacion:
                        payload.servidor_fecha || fechaActual,
                    servidor_fecha:
                        payload.servidor_fecha || fechaActual,
                    estado: "sincronizado",
                    ultimo_error: null,
                    updated_at: fechaActual,
                },
            });

        const [
            cultivosLocales,
            enfermedadesLocales,
            plagasLocales,
            recomendacionesLocales,
            cultivoEnfermedadLocal,
            cultivoPlagaLocal,
            enfermedadRecomendacionLocal,
            plagaRecomendacionLocal,
        ] = await Promise.all([
            db.select().from(cultivos),
            db.select().from(enfermedades),
            db.select().from(plagas),
            db.select().from(recomendaciones),
            db.select().from(cultivoEnfermedad),
            db.select().from(cultivoPlaga),
            db.select().from(enfermedadRecomendacion),
            db.select().from(plagaRecomendacion),
        ]);

        console.log("[Catálogos] Datos guardados:", {
            cultivos: cultivosLocales.length,
            enfermedades: enfermedadesLocales.length,
            plagas: plagasLocales.length,
            recomendaciones: recomendacionesLocales.length,
            cultivo_enfermedad:
                cultivoEnfermedadLocal.length,
            cultivo_plaga:
                cultivoPlagaLocal.length,
            enfermedad_recomendacion:
                enfermedadRecomendacionLocal.length,
            plaga_recomendacion:
                plagaRecomendacionLocal.length,
        });

        return {
            success: true,
            servidorFecha: payload.servidor_fecha || fechaActual,
        };
    });

    return resultado;
}

/**
 * Registra un error de sincronización sin borrar datos locales.
 */
export async function registrarErrorCatalogos(error) {
    const fechaActual = new Date().toISOString();
    const mensaje = error?.message || "Error desconocido";

    await db
        .insert(catalogosSyncControl)
        .values({
            clave: "catalogos",
            estado: "error",
            ultimo_error: mensaje,
            updated_at: fechaActual,
        })
        .onConflictDoUpdate({
            target: catalogosSyncControl.clave,
            set: {
                estado: "error",
                ultimo_error: mensaje,
                updated_at: fechaActual,
            },
        });
}

export default {
    guardarCatalogosLocales,
    registrarErrorCatalogos,
};