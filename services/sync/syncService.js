import { db } from '../../db/client';
import {
    lotes, ciclos_cultivo, visitas, hojas_datos, SYNC_STATUS,
    provincias, cantones, estaciones, cultivos, variedades, proyectos
} from '../../db/schema';
import { inArray } from 'drizzle-orm';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { fetchApi } from '../api/apiClient';

export const descargarCatalogos = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return;

    try {
        const response = await fetchApi('/catalogosMobile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Fallo al obtener catálogos');
        const jsonResponse = await response.json();
        const data = jsonResponse.data;

        await db.delete(provincias);
        await db.delete(cantones);
        await db.delete(estaciones);
        await db.delete(cultivos);
        await db.delete(variedades);

        if (data.provincias?.length) await db.insert(provincias).values(data.provincias);
        if (data.cantones?.length) await db.insert(cantones).values(data.cantones);
        if (data.estaciones?.length) await db.insert(estaciones).values(data.estaciones);
        if (data.cultivos?.length) await db.insert(cultivos).values(data.cultivos);

        if (data.variedades?.length) {
            const varsLimpio = data.variedades.map(v => ({
                ...v,
                caracteristicas_base: typeof v.caracteristicas_base === 'object' ? JSON.stringify(v.caracteristicas_base) : v.caracteristicas_base
            }));
            await db.insert(variedades).values(varsLimpio);
        }

    } catch (error) {
        // console removed
    }
};

const marcarComoSincronizado = async (uuids) => {
    if (!uuids || uuids.length === 0) return;
    try {
        await db.update(lotes)
            .set({ sync_status: SYNC_STATUS.SYNCED })
            .where(inArray(lotes.uuid_movil, uuids));

    } catch (error) {
        // console removed
    }
};

export const descargarMisDatos = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    const token = await SecureStore.getItemAsync('userToken');
    const userIdStr = await SecureStore.getItemAsync('offlineUserId');
    if (!token) return;

    try {
        const response = await fetchApi('/sync/download', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Fallo del servidor: ${response.status}`);
        }

        const jsonResponse = await response.json();
        const lotesDescargados = jsonResponse.data?.lotes || jsonResponse.data || [];

        if (!Array.isArray(lotesDescargados) || lotesDescargados.length === 0) {
            return;
        }

        const lotesFlat = [];
        const proyectosFlat = [];
        const ciclosFlat = [];
        const visitasFlat = [];
        const hojasFlat = [];

        lotesDescargados.forEach(lote => {
            const loteUuid = lote.uuid_movil || lote.id;
            if (!loteUuid) return;

            lotesFlat.push({
                uuid_movil: loteUuid,
                user_id: userIdStr ? Number(userIdStr) : null,
                nombre_lote: lote.nombre_lote || lote.nombre || 'Lote Asignado',
                ubicacion_manual: lote.ubicacion_manual || '',
                coordenadas: typeof lote.geometria === 'string' ? lote.geometria : JSON.stringify(lote.geometria || []),
                provincia_id: lote.province_id || 1,
                canton_id: lote.canton_id || 1,
                estacion_id: lote.location_id || null,
                sync_status: SYNC_STATUS.SYNCED
            });

            if (lote.proyectos && Array.isArray(lote.proyectos)) {
                lote.proyectos.forEach(proyecto => {
                    const proyUuid = proyecto.uuid_movil || proyecto.id;
                    if (!proyUuid) return;

                    proyectosFlat.push({
                        uuid_movil: proyUuid,
                        lote_id: null, // se resuelve después con uuid matching
                        titulo: proyecto.titulo || 'Proyecto Experimental',
                        descripcion: proyecto.descripcion || '',
                        variedad: proyecto.variedad || 'Desconocida',
                        fecha_siembra: proyecto.fecha_siembra || null,
                        estado: proyecto.estado || 'activo',
                        tipo_acolchado: proyecto.tipo_acolchado || null,
                        tipo_ensayo: proyecto.tipo_ensayo || null,
                        diseno_experimental: proyecto.diseno_experimental || null,
                        financiamiento: proyecto.financiamiento || null,
                        colaborador_nombre: proyecto.colaborador_nombre || null,
                        colaborador_telefono: proyecto.colaborador_telefono || null,
                        colaborador_celular: proyecto.colaborador_celular || null,
                        sync_status: SYNC_STATUS.SYNCED
                    });

                    if (proyecto.ciclos && Array.isArray(proyecto.ciclos)) {
                        proyecto.ciclos.forEach(ciclo => {
                            const cicloUuid = ciclo.uuid_movil || ciclo.id;
                            if (!cicloUuid) return;

                            ciclosFlat.push({
                                uuid_movil: cicloUuid,
                                proyecto_id: null,
                                cultivo_variedad: ciclo.cultivo_variedad || ciclo.cultivo || proyecto.variedad || 'Evaluación',
                                distancia_siembra: ciclo.distancia_siembra || 'N/A',
                                fecha_siembra: ciclo.fecha_siembra || ciclo.fechas?.siembra || proyecto.fecha_siembra || new Date().toISOString().split('T')[0],
                                sync_status: SYNC_STATUS.SYNCED
                            });

                            if (ciclo.visitas && Array.isArray(ciclo.visitas)) {
                                ciclo.visitas.forEach(visita => {
                                    const visitaUuid = visita.uuid_movil || visita.id;
                                    if (!visitaUuid) return;

                                    visitasFlat.push({
                                        uuid_movil: visitaUuid,
                                        ciclo_id: null,
                                        proyecto_id: null,
                                        tecnico_nombre: visita.tecnico_nombre || visita.tecnico || 'Técnico',
                                        fecha_visita: visita.fecha_visita || visita.fecha || new Date().toISOString().split('T')[0],
                                        observaciones: visita.observaciones || '',
                                        recomendaciones: visita.recomendaciones || '',
                                        sync_status: SYNC_STATUS.SYNCED
                                    });

                                    const hojas = visita.hojasDatos || visita.hojas_datos || visita.datos_tecnicos || [];

                                    if (Array.isArray(hojas)) {
                                        hojas.forEach(hoja => {
                                            hojasFlat.push({
                                                uuid_movil: hoja.uuid_movil || hoja.id,
                                                visita_id: null,
                                                nombre_plantilla: hoja.nombre_plantilla || hoja.plantilla || 'Bitácora Científica',
                                                datos_variables: typeof hoja.datos_variables === 'object' ? JSON.stringify(hoja.datos_variables) : (hoja.variables || '{}'),
                                                sync_status: SYNC_STATUS.SYNCED
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        const upsertData = async (nombreTablaStr, tablaDb, dataArray) => {
            if (dataArray.length === 0) return;
            for (const item of dataArray) {
                try {
                    await db.insert(tablaDb).values(item).onConflictDoUpdate({
                        target: tablaDb.uuid_movil,
                        set: item
                    });
                } catch (e) {
                    // console.log removed
                }
            }
        };

        await upsertData('Lotes', lotes, lotesFlat);
        await upsertData('Proyectos', proyectos, proyectosFlat);
        await upsertData('Ciclos', ciclos_cultivo, ciclosFlat);
        await upsertData('Visitas', visitas, visitasFlat);
        await upsertData('Hojas Datos', hojas_datos, hojasFlat);

    } catch (error) {
        // console removed
    }
};
