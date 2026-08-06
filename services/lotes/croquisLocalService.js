// import { db } from '../../db/client';
// import { lotes, provinces, cantons, locations, configuracion, SYNC_STATUS } from '../../db/schema';
// import { eq } from 'drizzle-orm';
// import { v4 as uuidv4 } from 'uuid';

// export const obtenerConfiguracionUbicacion = async () => {
//     const configRecord = await db.select().from(configuracion).where(eq(configuracion.id, 1));
//     return configRecord[0] || null;
// };

// export const obtenerProvincias = async () => await db.select().from(provinces);
// export const obtenerCantones = async (provId) => await db.select().from(cantons).where(eq(cantons.provincia_id, provId));
// export const obtenerEstaciones = async () => {
//     return await db.select().from(locations);
// };
// export const guardarGeometriaLocal = async (tecnicoId, nombreLote, points, ubicacion, condiciones) => {
//     const nuevoUuid = uuidv4();

//     await db.insert(lotes).values({
//         uuid_movil: nuevoUuid,
//         usuario_id: tecnicoId,
//         nombre_lote: nombreLote,
//         ubicacion_manual: "Asignación Manual",
//         coordenadas: points, // La BD lo asimila directamente si está configurado como modo JSON
//         province_id: ubicacion.provincia.id,
//         canton_id: ubicacion.canton.id,
//         location_id: ubicacion.estacion ? ubicacion.estacion.id : null,
//         condiciones_terreno: JSON.stringify(condiciones),
//         sync_status: SYNC_STATUS.PENDING,
//     });
// };