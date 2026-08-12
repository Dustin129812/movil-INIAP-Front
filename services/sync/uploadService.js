import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../db/client';
import {
    lotes, ciclos_cultivo, visitas, hojas_datos, proyectos, configuracion, SYNC_STATUS
} from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { fetchApi } from '../apiClient';

/**
 * Construye el payload anidado de sincronización.
 * El backend espera: { lotes: [{ proyectos: [{ ciclos: [{ visitas: [{ hojas_datos: [] }] }] }] }] }
 */
const construirPayloadSync = async () => {
    // Obtener todos los pendientes
    const [lotesPendientes] = await db.select().from(lotes).where(eq(lotes.sync_status, SYNC_STATUS.PENDING));
    const [proyectosPendientes] = await db.select().from(proyectos).where(eq(proyectos.sync_status, SYNC_STATUS.PENDING));
    const [ciclosPendientes] = await db.select().from(ciclos_cultivo).where(eq(ciclos_cultivo.sync_status, SYNC_STATUS.PENDING));
    const [visitasPendientes] = await db.select().from(visitas).where(eq(visitas.sync_status, SYNC_STATUS.PENDING));
    const [hojasPendientes] = await db.select().from(hojas_datos).where(eq(hojas_datos.sync_status, SYNC_STATUS.PENDING));

    const allLotes = Array.isArray(lotesPendientes) ? lotesPendientes : [];
    const allProyectos = Array.isArray(proyectosPendientes) ? proyectosPendientes : [];
    const allCiclos = Array.isArray(ciclosPendientes) ? ciclosPendientes : [];
    const allVisitas = Array.isArray(visitasPendientes) ? visitasPendientes : [];
    const allHojas = Array.isArray(hojasPendientes) ? hojasPendientes : [];

    // Indexar por uuid_movil para buscar rápido
    const hojasByVisitaUuid = {};
    allHojas.forEach(h => {
        if (h.visita_id) {
            if (!hojasByVisitaUuid[h.visita_id]) hojasByVisitaUuid[h.visita_id] = [];
            hojasByVisitaUuid[h.visita_id].push(h);
        }
    });

    const visitasByCicloUuid = {};
    allVisitas.forEach(v => {
        if (v.ciclo_id) {
            if (!visitasByCicloUuid[v.ciclo_id]) visitasByCicloUuid[v.ciclo_id] = [];
            visitasByCicloUuid[v.ciclo_id].push(v);
        }
    });

    const ciclosByProyectoUuid = {};
    allCiclos.forEach(c => {
        if (c.proyecto_id) {
            if (!ciclosByProyectoUuid[c.proyecto_id]) ciclosByProyectoUuid[c.proyecto_id] = [];
            ciclosByProyectoUuid[c.proyecto_id].push(c);
        }
    });

    // Los proyectos del frontend usan 'lote_id' (integer), no uuid de lote
    // Necesitamos buscar el uuid del lote asociado al proyecto
    // Para hacerlo simple: agrupar proyectos por lote_uuid cuando sea posible
    // El lote local tiene uuid_movil - los proyectos tienen lote_uuid (referencia al uuid_movil del lote)
    const lotesFlat = [];

    for (const lote of allLotes) {
        const loteUuid = lote.uuid_movil;

        // Proyectos de este lote (por lote_uuid en proyecto)
        const proyectosDelLote = allProyectos.filter(p => p.lote_uuid === loteUuid);

        const proyectosAnidados = proyectosDelLote.map(proyecto => {
            const proyectoUuid = proyecto.uuid_movil;

            // Ciclos de este proyecto (por proyecto_uuid)
            const ciclosDelProyecto = allCiclos.filter(c => c.proyecto_uuid === proyectoUuid);

            const ciclosAnidados = ciclosDelProyecto.map(ciclo => {
                const cicloUuid = ciclo.uuid_movil;

                // Visitas de este ciclo (por ciclo_uuid)
                const visitasDelCiclo = allVisitas.filter(v => v.ciclo_uuid === cicloUuid);

                const visitasAnidadas = visitasDelCiclo.map(visita => {
                    const visitaUuid = visita.uuid_movil;

                    // Hojas de esta visita (por visita_uuid)
                    const hojasDeVisita = allHojas.filter(h => h.visita_uuid === visitaUuid);

                    return {
                        uuid_movil: visitaUuid,
                        tecnico_nombre: visita.tecnico_nombre || '',
                        fecha_visita: visita.fecha_visita || new Date().toISOString().split('T')[0],
                        observaciones: visita.observaciones || '',
                        recomendaciones: visita.recomendaciones || '',
                        hojas_datos: hojasDeVisita.map(h => ({
                            uuid_movil: h.uuid_movil,
                            nombre_plantilla: h.nombre_plantilla || 'Bitácora',
                            datos_variables: typeof h.datos_variables === 'string'
                                ? JSON.parse(h.datos_variables)
                                : (h.datos_variables || {})
                        }))
                    };
                });

                return {
                    uuid_movil: cicloUuid,
                    cultivo_variedad: ciclo.cultivo_variedad || 'Evaluación',
                    distancia_siembra: ciclo.distancia_siembra || 'N/A',
                    fecha_siembra: ciclo.fecha_siembra || new Date().toISOString().split('T')[0],
                    metricas_siembra: ciclo.metricas_siembra || null,
                    visitas: visitasAnidadas
                };
            });

            return {
                uuid_movil: proyectoUuid,
                titulo: proyecto.titulo || 'Proyecto',
                descripcion: proyecto.descripcion || '',
                variedad: proyecto.variedad || 'Sin variedad',
                fecha_siembra: proyecto.fecha_siembra || null,
                tipo_acolchado: proyecto.tipo_acolchado || null,
                tipo_ensayo: proyecto.tipo_ensayo || null,
                diseno_experimental: proyecto.diseno_experimental || null,
                financiamiento: proyecto.financiamiento || null,
                colaborador_nombre: proyecto.colaborador_nombre || null,
                colaborador_telefono: proyecto.colaborador_telefono || null,
                colaborador_celular: proyecto.colaborador_celular || null,
                ciclos: ciclosAnidados
            };
        });

        lotesFlat.push({
            uuid_movil: loteUuid,
            nombre_lote: lote.nombre_lote || 'Lote',
            ubicacion_manual: lote.ubicacion_manual || '',
            coordenadas: lote.coordenadas || [],
            province_id: lote.provincia_id || 1,
            canton_id: lote.canton_id || 1,
            location_id: lote.estacion_id || null,
            parroquia: lote.parroquia || null,
            altitud: lote.altitud || null,
            tipo_riego: lote.tipo_riego || 'gravedad',
            proyectos: proyectosAnidados
        });
    }

    return { lotes: lotesFlat };
};

/**
 * Obtiene el conteo de registros pendientes por sincronizar.
 */
export const obtenerConteoPendientes = async () => {
    try {
        const [lotesP] = await db.select().from(lotes).where(eq(lotes.sync_status, SYNC_STATUS.PENDING));
        const [proyectosP] = await db.select().from(proyectos).where(eq(proyectos.sync_status, SYNC_STATUS.PENDING));
        const [ciclosP] = await db.select().from(ciclos_cultivo).where(eq(ciclos_cultivo.sync_status, SYNC_STATUS.PENDING));
        const [visitasP] = await db.select().from(visitas).where(eq(visitas.sync_status, SYNC_STATUS.PENDING));
        const [hojasP] = await db.select().from(hojas_datos).where(eq(hojas_datos.sync_status, SYNC_STATUS.PENDING));

        const counts = {
            lotes: Array.isArray(lotesP) ? lotesP.length : 0,
            proyectos: Array.isArray(proyectosP) ? proyectosP.length : 0,
            ciclos: Array.isArray(ciclosP) ? ciclosP.length : 0,
            visitas: Array.isArray(visitasP) ? visitasP.length : 0,
            hojas: Array.isArray(hojasP) ? hojasP.length : 0,
        };
        counts.total = counts.lotes + counts.proyectos + counts.ciclos + counts.visitas + counts.hojas;
        return counts;
    } catch (error) {
        console.error('[Upload] Error contando pendientes:', error);
        return { lotes: 0, proyectos: 0, ciclos: 0, visitas: 0, hojas: 0, total: 0 };
    }
};

/**
 * Motor de sincronización principal — sube datos pendientes al servidor.
 */
export const syncEngine = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
        return { success: false, message: 'Sin conexión' };
    }

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
        return { success: false, message: 'No autenticado' };
    }

    try {
        const payload = await construirPayloadSync();
        const totalLotes = payload.lotes.length;

        if (totalLotes === 0) {
            return { success: true, message: 'Nada que sincronizar' };
        }

        const response = await fetchApi('/sync', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const jsonResponse = await response.json();

        // Marcar lotes como sincronizados
        const loteUuids = payload.lotes.map(l => l.uuid_movil).filter(Boolean);
        if (loteUuids.length > 0) {
            await db.update(lotes)
                .set({ sync_status: SYNC_STATUS.SYNCED })
                .where(inArray(lotes.uuid_movil, loteUuids));
        }

        // Marcar proyectos como sincronizados
        const proyectoUuids = payload.lotes
            .flatMap(l => l.proyectos || [])
            .map(p => p.uuid_movil)
            .filter(Boolean);
        if (proyectoUuids.length > 0) {
            await db.update(proyectos)
                .set({ sync_status: SYNC_STATUS.SYNCED })
                .where(inArray(proyectos.uuid_movil, proyectoUuids));
        }

        // Marcar ciclos como sincronizados
        const cicloUuids = payload.lotes
            .flatMap(l => l.proyectos || [])
            .flatMap(p => p.ciclos || [])
            .map(c => c.uuid_movil)
            .filter(Boolean);
        if (cicloUuids.length > 0) {
            await db.update(ciclos_cultivo)
                .set({ sync_status: SYNC_STATUS.SYNCED })
                .where(inArray(ciclos_cultivo.uuid_movil, cicloUuids));
        }

        // Marcar visitas como sincronizadas
        const visitaUuids = payload.lotes
            .flatMap(l => l.proyectos || [])
            .flatMap(p => p.ciclos || [])
            .flatMap(c => c.visitas || [])
            .map(v => v.uuid_movil)
            .filter(Boolean);
        if (visitaUuids.length > 0) {
            await db.update(visitas)
                .set({ sync_status: SYNC_STATUS.SYNCED })
                .where(inArray(visitas.uuid_movil, visitaUuids));
        }

        // Marcar hojas como sincronizadas
        const hojaUuids = payload.lotes
            .flatMap(l => l.proyectos || [])
            .flatMap(p => p.ciclos || [])
            .flatMap(c => c.visitas || [])
            .flatMap(v => v.hojas_datos || [])
            .map(h => h.uuid_movil)
            .filter(Boolean);
        if (hojaUuids.length > 0) {
            await db.update(hojas_datos)
                .set({ sync_status: SYNC_STATUS.SYNCED })
                .where(inArray(hojas_datos.uuid_movil, hojaUuids));
        }

        // Actualizar último sync
        try {
            await db.update(configuracion)
                .set({ ultimo_sync: new Date().toISOString() })
                .where(eq(configuracion.id, 1));
        } catch (e) {
            // configuracion puede no existir
        }

        return { success: true, message: `Sincronizados ${totalLotes} lotes` };

    } catch (error) {
        console.error('[SyncEngine] Error:', error);
        return { success: false, message: error.message };
    }
};
