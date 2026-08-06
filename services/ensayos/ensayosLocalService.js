import { db } from '../../db/client';
import { proyectos, lotes, ciclos, configuracion, cultivos, variedades, SYNC_STATUS, visitas, hojas_datos } from '../../db/schema';
import { desc, eq, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const obtenerListaEnsayosCruzada = async () => {
    const configRecord = await db.select().from(configuracion).where(eq(configuracion.id, 1));
    const tId = configRecord[0]?.tecnico_id || null;

    let resProyectos, resLotes, resCiclos;

    if (tId) {
        resProyectos = await db.select().from(proyectos).where(eq(proyectos.usuario_id, tId));
        resLotes = await db.select().from(lotes).where(eq(lotes.usuario_id, tId));
        resCiclos = await db.select().from(ciclos).where(eq(ciclos.usuario_id, tId));
    } else {
        resProyectos = await db.select().from(proyectos).where(isNull(proyectos.usuario_id));
        resLotes = await db.select().from(lotes).where(isNull(lotes.usuario_id));
        resCiclos = await db.select().from(ciclos).where(isNull(ciclos.usuario_id));
    }

    return resProyectos.map(p => {
        const lote = resLotes.find(l => l.uuid_movil === p.lote_uuid);
        const ciclo = resCiclos.find(c => c.proyecto_uuid === p.uuid_movil);
        return {
            ...p,
            loteNombre: lote ? lote.nombre_lote : 'Desconocido',
            cultivo: ciclo ? ciclo.cultivo_variedad : 'Sin definir',
            fecha: p.fecha_siembra || (ciclo ? ciclo.fecha_siembra : 'S/F'), // Prioriza la fecha del ensayo
            distancia: ciclo ? ciclo.distancia_siembra : '—',
        };
    }).reverse();
};

export const obtenerCatalogosBaseParaEnsayo = async () => {
    const configRecord = await db.select().from(configuracion).where(eq(configuracion.id, 1));
    const tId = configRecord[0]?.tecnico_id || null;

    const misLotes = tId
        ? await db.select().from(lotes).where(eq(lotes.usuario_id, tId))
        : await db.select().from(lotes).where(isNull(lotes.usuario_id));

    const misCultivos = await db.select().from(cultivos);

    return { tecnicoId: tId, lotes: misLotes, cultivos: misCultivos };
};

export const obtenerDetalleProyectoYVisitas = async (proyectoUuid) => {
    const [proy] = await db.select().from(proyectos).where(eq(proyectos.uuid_movil, proyectoUuid));
    const visitasRelacionadas = await db.select()
        .from(visitas)
        .where(eq(visitas.proyecto_uuid, proyectoUuid))
        .orderBy(desc(visitas.fecha_visita));

    return { proyecto: proy, historial: visitasRelacionadas };
};

export const eliminarVisitaLocalBd = async (visitaUuid) => {
    await db.delete(hojas_datos).where(eq(hojas_datos.visita_uuid, visitaUuid));
    await db.delete(visitas).where(eq(visitas.uuid_movil, visitaUuid));
};

/**
 * Guarda el Lote y el Ensayo en una sola transacción SQLite (Drizzle)
 * (Firma actualizada: se removió el cuarto parámetro 'variedades')
 */
export const guardarLoteYEnsayoIntegrado = async (loteDraft, formEnsayo, tecnicoId) => {
    const loteUuid = loteDraft.isExisting ? loteDraft.uuid_movil : uuidv4();
    const proyectoUuid = uuidv4();
    const cicloUuid = uuidv4();

    await db.transaction(async (tx) => {

        if (!loteDraft.isExisting) {
            await tx.insert(lotes).values({
                uuid_movil: loteUuid,
                usuario_id: tecnicoId,
                nombre_lote: loteDraft.nombre_lote,
                ubicacion_manual: "Asignación Manual",
                coordenadas: loteDraft.coordenadas,
                condiciones_terreno: loteDraft.condiciones_terreno,
                province_id: loteDraft.ubicacion.provincia.id,
                canton_id: loteDraft.ubicacion.canton.id,
                location_id: loteDraft.ubicacion.estacion ? loteDraft.ubicacion.estacion.id : null,
                sync_status: SYNC_STATUS.PENDING,
            });
        }
        
        await tx.insert(proyectos).values({
            uuid_movil: proyectoUuid,
            lote_uuid: loteUuid,
            usuario_id: tecnicoId,
            responsable_id: tecnicoId,

            titulo: formEnsayo.titulo,
            descripcion: formEnsayo.descripcion,

            variedad: formEnsayo.variedad,
            fecha_siembra: formEnsayo.fechaSiembra,
            tipo_acolchado: formEnsayo.tipoAcolchado,
            tipo_ensayo: formEnsayo.tipoEnsayo,
            diseno_experimental: formEnsayo.disenoExperimental,
            
            financiamiento: formEnsayo.financiamiento,
            colaborador_nombre: formEnsayo.colNombre,
            colaborador_celular: formEnsayo.colCelular,
            sync_status: SYNC_STATUS.PENDING,
        });

        await tx.insert(ciclos).values({
            uuid_movil: cicloUuid,
            lote_uuid: loteUuid,
            proyecto_uuid: proyectoUuid,
            usuario_id: tecnicoId,
            cultivo_variedad: formEnsayo.variedad,
            distancia_siembra: formEnsayo.distanciaSiembra,
            fecha_siembra: formEnsayo.fechaSiembra || new Date().toISOString().split('T')[0],
            sync_status: SYNC_STATUS.PENDING,
        });
    });
};