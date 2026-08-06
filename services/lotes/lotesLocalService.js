// import { db } from '../../db/client';
// import { lotes, proyectos, configuracion } from '../../db/schema';
// import { eq, isNull, and } from 'drizzle-orm';

// // 1. Función para listar todos los lotes (Usada por LotesDashboard)
// export const obtenerLotesLocales = async () => {
//     const configRecord = await db.select().from(configuracion).where(eq(configuracion.id, 1));
//     const tId = configRecord[0]?.tecnico_id || null;

//     if (tId) {
//         return await db.select().from(lotes).where(eq(lotes.usuario_id, tId));
//     } else {
//         return await db.select().from(lotes).where(isNull(lotes.usuario_id));
//     }
// };

// // 2. Función para obtener un lote y sus ensayos (Usada por LoteDetalle)
// export const obtenerDetalleLoteConProyectos = async (loteUuid) => {
//     const configRecord = await db.select().from(configuracion).where(eq(configuracion.id, 1));
//     const tId = configRecord[0]?.tecnico_id || null;

//     const [lote] = await db.select().from(lotes).where(eq(lotes.uuid_movil, loteUuid));

//     const proyectosRelacionados = await db.select()
//         .from(proyectos)
//         .where(
//             and(
//                 eq(proyectos.lote_uuid, loteUuid),
//                 tId ? eq(proyectos.usuario_id, tId) : isNull(proyectos.usuario_id)
//             )
//         );

//     return { lote, proyectos: proyectosRelacionados };
// };