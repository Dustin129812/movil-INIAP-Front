import { db } from '../../db/client';
import { ciclos, visitas, hojas_datos, lotes, proyectos, configuracion, SYNC_STATUS } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const obtenerContextoEvaluacion = async (proyecto_uuid, visita_uuid) => {
    let contexto = { tecnico: '', tecnicoId: null, loteUuidReal: null, visita: null, hoja: null };

    const configRecord = await db.select().from(configuracion).where(eq(configuracion.id, 1));
    if (configRecord.length > 0) {
        contexto.tecnico = configRecord[0].tecnico_nombre || '';
        contexto.tecnicoId = configRecord[0].tecnico_id || null;
    }

    if (proyecto_uuid) {
        const [proyLocal] = await db.select().from(proyectos).where(eq(proyectos.uuid_movil, proyecto_uuid));
        if (proyLocal) contexto.loteUuidReal = proyLocal.lote_uuid;
    }

    if (visita_uuid) {
        const [visitaLocal] = await db.select().from(visitas).where(eq(visitas.uuid_movil, visita_uuid));
        const [hojaLocal] = await db.select().from(hojas_datos).where(eq(hojas_datos.visita_uuid, visita_uuid));
        contexto.visita = visitaLocal;
        contexto.hoja = hojaLocal;
    }

    return contexto;
};

export const guardarEvaluacionLocal = async (isEditMode, visita_uuid, proyecto_uuid, loteUuidReal, tecnicoId, formDatos, matrizDatos) => {
    if (isEditMode) {
        await db.update(visitas).set({
            tecnico_nombre: formDatos.tecnico,
            observaciones: formDatos.observaciones,
            recomendaciones: formDatos.recomendaciones,
            sync_status: SYNC_STATUS.PENDING
        }).where(eq(visitas.uuid_movil, visita_uuid));

        await db.update(hojas_datos).set({
            datos_variables: matrizDatos,
            sync_status: SYNC_STATUS.PENDING
        }).where(eq(hojas_datos.visita_uuid, visita_uuid));
    } else {
        const cicloUuid = uuidv4();
        await db.insert(ciclos).values({
            uuid_movil: cicloUuid, usuario_id: tecnicoId, lote_uuid: loteUuidReal, proyecto_uuid: proyecto_uuid,
            cultivo_variedad: 'Evaluación de Ensayo', distancia_siembra: 'Según diseño', fecha_siembra: new Date().toISOString().split('T')[0],
            sync_status: SYNC_STATUS.PENDING,
        });

        const nuevoVisitaUuid = uuidv4();
        await db.insert(visitas).values({
            uuid_movil: nuevoVisitaUuid, usuario_id: tecnicoId, proyecto_uuid: proyecto_uuid, ciclo_uuid: cicloUuid,
            tecnico_nombre: formDatos.tecnico, fecha_visita: new Date().toISOString().split('T')[0], observaciones: formDatos.observaciones, recomendaciones: formDatos.recomendaciones,
            sync_status: SYNC_STATUS.PENDING,
        });

        await db.insert(hojas_datos).values({
            uuid_movil: uuidv4(), usuario_id: tecnicoId, visita_uuid: nuevoVisitaUuid, nombre_plantilla: 'Matriz Libre', datos_variables: matrizDatos,
            sync_status: SYNC_STATUS.PENDING,
        });
    }

    if (loteUuidReal) {
        await db.update(lotes).set({ sync_status: SYNC_STATUS.PENDING }).where(eq(lotes.uuid_movil, loteUuidReal));
    }
};