// import { db } from '../db/client';
// import { lotes, ciclos, visitas, hojas_datos, SYNC_STATUS,
//     provinces, cantons, locations, cultivos, variedades, proyectos, configuracion
// } from '../db/schema';
// import { eq, or, inArray} from 'drizzle-orm';
// import NetInfo from '@react-native-community/netinfo';
// import * as SecureStore from 'expo-secure-store';
// import { fetchApi } from './apiClient';

// export const descargarCatalogos = async () => {
//     const netInfo = await NetInfo.fetch();
//     if (!netInfo.isConnected) return;

//     const token = await SecureStore.getItemAsync('userToken');
//     if (!token) return;

//     try {
//         const response = await fetchApi('/catalogosMobile', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (!response.ok) throw new Error('Fallo al obtener catálogos');
//         const jsonResponse = await response.json();
//         const data = jsonResponse.data;

//         await db.delete(provinces);
//         await db.delete(cantons);
//         await db.delete(locations);
//         await db.delete(cultivos);
//         await db.delete(variedades);

//         if (data.provincias?.length) await db.insert(provinces).values(data.provincias);
//         if (data.cantones?.length) await db.insert(cantons).values(data.cantones);
//         if (data.estaciones?.length) await db.insert(locations).values(data.estaciones);
//         if (data.cultivos?.length) await db.insert(cultivos).values(data.cultivos);

//         if (data.variedades?.length) {
//             const varsLimpio = data.variedades.map(v => ({
//                 ...v,
//                 caracteristicas_base: typeof v.caracteristicas_base === 'object' ? JSON.stringify(v.caracteristicas_base) : v.caracteristicas_base
//             }));
//             await db.insert(variedades).values(varsLimpio);
//         }

//     } catch (error) {
//         console.error('[Sync] Error descargando catálogos:', error);
//     }
// };

// const ensureUuid = (id) => {
//     if (!id) return uuidv4();
//     const str = String(id);
//     if (str.length === 36 && str.includes('-')) return str;
//     const p = str.padStart(32, '0');
//     return `${p.slice(0,8)}-${p.slice(8,12)}-${p.slice(12,16)}-${p.slice(16,20)}-${p.slice(20)}`;
// };

// const marcarComoSincronizado = async (uuids) => {
//     if (!uuids || uuids.length === 0) return;
//     try {
//         await db.update(lotes)
//             .set({ sync_status: SYNC_STATUS.SYNCED })
//             .where(inArray(lotes.uuid_movil, uuids));

//     } catch (error) {
//         console.error('[Sync] Error al actualizar estado local:', error);
//     }
// };

// export const descargarMisDatos = async () => {
//     const netInfo = await NetInfo.fetch();
//     if (!netInfo.isConnected) return;

//     const token = await SecureStore.getItemAsync('userToken');
//     const userIdStr = await SecureStore.getItemAsync('offlineUserId');
//     if (!token || !userIdStr) return;

//     const currentUserId = Number(userIdStr);

//     try {
//         const response = await fetchApi('/sync/download', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`Fallo del servidor: ${response.status}`);
//         }

//         const jsonResponse = await response.json();
//         const lotesDescargados = jsonResponse.data?.lotes || jsonResponse.data || [];

//         if (!Array.isArray(lotesDescargados) || lotesDescargados.length === 0) {
//             return;
//         }

//         const lotesFlat = [];
//         const proyectosFlat = [];
//         const ciclosFlat = [];
//         const visitasFlat = [];
//         const hojasFlat = [];

//         lotesDescargados.forEach(lote => {
//             const loteUuid = lote.uuid_movil || lote.id;
//             if (!loteUuid) return;

//             lotesFlat.push({
//                 uuid_movil: loteUuid,
//                 usuario_id: currentUserId,
//                 nombre_lote: lote.nombre_lote || lote.nombre || 'Lote Asignado',
//                 ubicacion_manual: lote.jerarquia_ubicacion?.referencia_manual || '',
//                 coordenadas: typeof lote.geometria === 'string' ? lote.geometria : JSON.stringify(lote.geometria || []),
//                 province_id: lote.province_id || 1,
//                 canton_id: lote.canton_id || 1,
//                 sync_status: SYNC_STATUS.SYNCED
//             });

//             if (lote.proyectos && Array.isArray(lote.proyectos)) {
//                 lote.proyectos.forEach(proyecto => {
//                     const proyUuid = proyecto.uuid_movil || proyecto.id;
//                     if (!proyUuid) return;

//                     proyectosFlat.push({
//                         uuid_movil: proyUuid,
//                         usuario_id: currentUserId,
//                         lote_uuid: loteUuid,
//                         responsable_id: proyecto.responsable_id || currentUserId,

//                         variedad: proyecto.variedad || 'Desconocida',
//                         fecha_siembra: proyecto.fecha_siembra || null,
//                         tipo_acolchado: proyecto.tipo_acolchado || null,
//                         tipo_ensayo: proyecto.tipo_ensayo || null,
//                         financiamiento: proyecto.financiamiento || null,
//                         colaborador_nombre: proyecto.colaborador_nombre || null,
//                         colaborador_telefono: proyecto.colaborador_telefono || null,
//                         colaborador_celular: proyecto.colaborador_celular || null,
//                         titulo: proyecto.titulo || 'Proyecto Experimental',
//                         descripcion: proyecto.descripcion || '',
//                         sync_status: SYNC_STATUS.SYNCED
//                     });

//                     if (proyecto.ciclos && Array.isArray(proyecto.ciclos)) {
//                         proyecto.ciclos.forEach(ciclo => {
//                             const cicloUuid = ciclo.uuid_movil || ciclo.id;
//                             if (!cicloUuid) return;

//                             ciclosFlat.push({
//                                 uuid_movil: cicloUuid,
//                                 usuario_id: currentUserId,
//                                 lote_uuid: loteUuid,
//                                 proyecto_uuid: proyUuid,
//                                 cultivo_variedad: ciclo.cultivo_variedad || ciclo.cultivo || proyecto.variedad || 'Evaluación',
//                                 distancia_siembra: ciclo.distancia_siembra || 'N/A',
//                                 fecha_siembra: ciclo.fecha_siembra || ciclo.fechas?.siembra || proyecto.fecha_siembra || new Date().toISOString().split('T')[0],
//                                 sync_status: SYNC_STATUS.SYNCED
//                             });

//                             if (ciclo.visitas && Array.isArray(ciclo.visitas)) {
//                                 ciclo.visitas.forEach(visita => {
//                                     const visitaUuid = visita.uuid_movil || visita.id;
//                                     if (!visitaUuid) return;

//                                     visitasFlat.push({
//                                         uuid_movil: visitaUuid,
//                                         usuario_id: currentUserId,
//                                         proyecto_uuid: proyUuid,
//                                         ciclo_uuid: cicloUuid,
//                                         tecnico_nombre: visita.tecnico_nombre || visita.tecnico || 'Técnico',
//                                         fecha_visita: visita.fecha_visita || visita.fecha || new Date().toISOString().split('T')[0],
//                                         observaciones: visita.observaciones || '',
//                                         recomendaciones: visita.recomendaciones || '',
//                                         sync_status: SYNC_STATUS.SYNCED
//                                     });

//                                     const hojas = visita.hojasDatos || visita.hojas_datos || visita.datos_tecnicos || [];

//                                     if (Array.isArray(hojas)) {
//                                         hojas.forEach(hoja => {
//                                             hojasFlat.push({
//                                                 uuid_movil: hoja.uuid_movil || hoja.id,
//                                                 usuario_id: currentUserId,
//                                                 visita_uuid: visitaUuid,
//                                                 nombre_plantilla: hoja.nombre_plantilla || hoja.plantilla || 'Bitácora Científica',
//                                                 datos_variables: typeof hoja.datos_variables === 'object' ? hoja.datos_variables : (hoja.variables || {}),
//                                                 sync_status: SYNC_STATUS.SYNCED
//                                             });
//                                         });
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                 });
//             }
//         });

//         const upsertData = async (nombreTablaStr, tablaDb, dataArray) => {
//             if (dataArray.length === 0) return;
//             for (const item of dataArray) {
//                 try {
//                     await db.insert(tablaDb).values(item).onConflictDoUpdate({
//                         target: tablaDb.uuid_movil,
//                         set: item
//                     });
//                 } catch (e) {
//                     console.log(`[Sync] Error guardando en ${nombreTablaStr}:`, e.message);
//                 }
//             }
//         };

//         await upsertData('Lotes', lotes, lotesFlat);
//         await upsertData('Proyectos', proyectos, proyectosFlat);
//         await upsertData('Ciclos', ciclos, ciclosFlat);
//         await upsertData('Visitas', visitas, visitasFlat);
//         await upsertData('Hojas Datos', hojas_datos, hojasFlat);
        
//     } catch (error) {
//         console.error('[Sync] Error crítico en descargarMisDatos:', error);
//     }
// };