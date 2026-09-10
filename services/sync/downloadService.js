import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { fetchApi } from '../api/apiClient';
import { db, guardarCatalogosLocales } from '../../db/client';
import {
    lotes, proyectos, ciclos_cultivo, visitas, hojas_datos,
    variedades, SYNC_STATUS
} from '../../db/schema';
import { eq } from 'drizzle-orm';

const obtenerToken = async () => {
    try {
        const t = await SecureStore.getItemAsync('userToken');
        if (t) return t;
    } catch {}

    const claves = ['token_acceso', 'access_token', 'token', 'userToken'];
    for (const clave of claves) {
        try {
            const t = await AsyncStorage.getItem(clave);
            if (t) return t;
        } catch {}
    }
    return null;
};

const hayConexion = async () => {
    const netInfo = await NetInfo.fetch();
    return !!netInfo.isConnected;
};


const guardarVariedadesLocales = async (variedadesApi) => {
    if (!Array.isArray(variedadesApi) || variedadesApi.length === 0) return;

    const filas = variedadesApi
        .map(v => ({
            id: v.id,
            cultivo_id: v.cultivo_id ?? null,
            nombre: v.nombre || v.name || '',
            caracteristicas_base: typeof v.caracteristicas_base === 'object'
                ? JSON.stringify(v.caracteristicas_base)
                : (v.caracteristicas_base ?? null),
        }))
        .filter(v => v.id !== undefined && v.id !== null && v.nombre.trim());

    if (filas.length === 0) {
        console.warn('[downloadService] variedades: la API no trajo filas válidas, se conserva lo local existente');
        return;
    }

    try {
        await db.delete(variedades);
        await db.insert(variedades).values(filas);
    } catch (e) {
        console.error('[downloadService] ERROR guardando variedades:', e.message || e);
    }
};

export const descargarCatalogos = async () => {
    if (!(await hayConexion())) return;

    const token = await obtenerToken();
    if (!token) return;

    try {
        const response = await fetchApi('/catalogosMobile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Fallo al obtener catálogos');
        const jsonResponse = await response.json();
        const data = jsonResponse.data || {};

        await guardarCatalogosLocales({
            provincias: data.provincias || [],
            cantones: data.cantones || [],
            estaciones: data.estaciones || [],
            cultivos: data.cultivos || [],
        });

        await guardarVariedadesLocales(data.variedades || []);
    } catch (error) {
        console.error('[downloadService] descargarCatalogos falló:', error.message || error);
    }
};

const aplanarDatosDescargados = (lotesDescargados, userIdStr) => {
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
            provincia_id: lote.province_id || lote.provincia_id || null,
            canton_id: lote.canton_id || null,
            estacion_id: lote.location_id || lote.estacion_id || null,
            sync_status: SYNC_STATUS.SYNCED,
        });

        const proyectosDelLote = Array.isArray(lote.proyectos) ? lote.proyectos : [];
        proyectosDelLote.forEach(proyecto => {
            const proyUuid = proyecto.uuid_movil || proyecto.id;
            if (!proyUuid) return;

            proyectosFlat.push({
                uuid_movil: proyUuid,
                lote_uuid: loteUuid,
                titulo: proyecto.titulo || 'Proyecto Experimental',
                descripcion: proyecto.descripcion || '',
                variedad_id: proyecto.variedad_id || null,
                variedad: proyecto.variedad || proyecto.variedad_nombre || null,
                variedad_nombre: proyecto.variedad || proyecto.variedad_nombre || null,
                cultivo_id: proyecto.cultivo_id || null,
                cultivo_nombre: proyecto.cultivo || null,
                fecha_siembra: proyecto.fecha_siembra || null,
                tipo_acolchado: proyecto.tipo_acolchado || null,
                tipo_ensayo: proyecto.tipo_ensayo || null,
                diseno_experimental: proyecto.diseno_experimental || null,
                financiamiento: proyecto.financiamiento || null,
                colaborador_nombre: proyecto.colaborador_nombre || null,
                colaborador_telefono: proyecto.colaborador_telefono || null,
                colaborador_celular: proyecto.colaborador_celular || null,
                sync_status: SYNC_STATUS.SYNCED,
            });

            const ciclosDelProyecto = Array.isArray(proyecto.ciclos) ? proyecto.ciclos : [];
            ciclosDelProyecto.forEach(ciclo => {
                const cicloUuid = ciclo.uuid_movil || ciclo.id;
                if (!cicloUuid) return;

                ciclosFlat.push({
                    uuid_movil: cicloUuid,
                    lote_uuid: loteUuid,
                    proyecto_uuid: proyUuid,
                    cultivo_variedad: ciclo.cultivo_variedad || ciclo.cultivo || proyecto.variedad || 'Evaluación',
                    distancia_siembra: ciclo.distancia_siembra || 'N/A',
                    fecha_siembra: ciclo.fecha_siembra || ciclo.fechas?.siembra || proyecto.fecha_siembra || new Date().toISOString().split('T')[0],
                    sync_status: SYNC_STATUS.SYNCED,
                });

                const visitasDelCiclo = Array.isArray(ciclo.visitas) ? ciclo.visitas : [];
                visitasDelCiclo.forEach(visita => {
                    const visitaUuid = visita.uuid_movil || visita.id;
                    if (!visitaUuid) return;

                    visitasFlat.push({
                        uuid_movil: visitaUuid,
                        lote_uuid: loteUuid,
                        proyecto_uuid: proyUuid,
                        ciclo_uuid: cicloUuid,
                        tecnico_nombre: visita.tecnico_nombre || visita.tecnico || 'Técnico',
                        fecha_visita: visita.fecha_visita || visita.fecha || new Date().toISOString().split('T')[0],
                        observaciones: visita.observaciones || '',
                        recomendaciones: visita.recomendaciones || '',
                        sync_status: SYNC_STATUS.SYNCED,
                    });

                    const hojas = visita.hojasDatos || visita.hojas_datos || [];
                    if (Array.isArray(hojas)) {
                        hojas.forEach(hoja => {
                            const hojaUuid = hoja.uuid_movil || hoja.id;
                            if (!hojaUuid) return;

                            hojasFlat.push({
                                uuid_movil: hojaUuid,
                                lote_uuid: loteUuid,
                                proyecto_uuid: proyUuid,
                                ciclo_uuid: cicloUuid,
                                visita_uuid: visitaUuid,
                                nombre_plantilla: hoja.nombre_plantilla || 'Bitácora Científica',
                                datos_variables: typeof hoja.datos_variables === 'object'
                                    ? JSON.stringify(hoja.datos_variables)
                                    : (hoja.variables || '{}'),
                                sync_status: SYNC_STATUS.SYNCED,
                            });
                        });
                    }
                });
            });
        });
    });

    return { lotesFlat, proyectosFlat, ciclosFlat, visitasFlat, hojasFlat };
};

const upsertData = async (tablaDb, dataArray) => {
    if (dataArray.length === 0) return;

    for (const item of dataArray) {
        try {
            const existentes = await db
                .select({ sync_status: tablaDb.sync_status })
                .from(tablaDb)
                .where(eq(tablaDb.uuid_movil, item.uuid_movil));

            if (existentes[0]?.sync_status === SYNC_STATUS.PENDING) {
                console.warn(`[downloadService] ${item.uuid_movil} tiene cambios locales pendientes, no se sobrescribe con la versión del servidor`);
                continue;
            }

            await db.insert(tablaDb).values(item).onConflictDoUpdate({
                target: tablaDb.uuid_movil,
                set: item,
            });
        } catch (e) {
            console.error('[downloadService] ERROR en upsert:', e.message || e);
        }
    }
};

export const descargarMisDatos = async () => {
    if (!(await hayConexion())) return;

    const token = await obtenerToken();
    const userIdStr = await SecureStore.getItemAsync('offlineUserId');
    if (!token) return;

    try {
        const response = await fetchApi('/sync/download', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Fallo del servidor: ${response.status}`);
        }

        const jsonResponse = await response.json();
        const lotesDescargados = jsonResponse.data?.lotes || jsonResponse.data || [];

        if (!Array.isArray(lotesDescargados) || lotesDescargados.length === 0) {
            return;
        }

        const { lotesFlat, proyectosFlat, ciclosFlat, visitasFlat, hojasFlat } =
            aplanarDatosDescargados(lotesDescargados, userIdStr);

        await upsertData(lotes, lotesFlat);
        await upsertData(proyectos, proyectosFlat);
        await upsertData(ciclos_cultivo, ciclosFlat);
        await upsertData(visitas, visitasFlat);
        await upsertData(hojas_datos, hojasFlat);

        console.log('[downloadService] descargarMisDatos:', {
            lotes: lotesFlat.length,
            proyectos: proyectosFlat.length,
            ciclos: ciclosFlat.length,
            visitas: visitasFlat.length,
            hojas: hojasFlat.length,
        });
    } catch (error) {
        console.error('[downloadService] descargarMisDatos falló:', error.message || error);
    }
};
