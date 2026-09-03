import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { db } from '../../db/client';
import {
    lotes, ciclos_cultivo, visitas, hojas_datos, proyectos, proyecto_lotes, configuracion, SYNC_STATUS
} from '../../db/schema';
import { eq, inArray, isNull, and } from 'drizzle-orm';
import { fetchApi } from '../api/apiClient';

/**
 * Valida si las coordenadas de un lote tienen al menos 3 puntos únicos.
 * @param {array} coordenadas - Array de puntos {latitude, longitude}
 * @returns {boolean} true si son válidas, false si son inválidas
 */
const validarCoordenadasLote = (coordenadas) => {
    if (!coordenadas || !Array.isArray(coordenadas) || coordenadas.length < 3) {
        return false;
    }
    // Filtrar puntos sin lat/lng válidos
    const puntosValidos = coordenadas.filter(p =>
        p && typeof p.latitude === 'number' && typeof p.longitude === 'number' &&
        !isNaN(p.latitude) && !isNaN(p.longitude) &&
        Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180
    );
    if (puntosValidos.length < 3) {
        return false;
    }
    // Verificar que haya al menos 3 puntos únicos
    const uniqueKeys = new Set();
    puntosValidos.forEach(p => {
        uniqueKeys.add(`${p.latitude.toFixed(7)},${p.longitude.toFixed(7)}`);
    });
    return uniqueKeys.size >= 3;
};

/**
 * Obtiene los lotes pendientes de sync que tienen coordenadas válidas.
 * Los lotes con coordenadas inválidas se marcan como 'error_geometria'.
 */
const obtenerLotesValidosParaSync = async () => {
    const [lotesDraft, lotesPending] = await Promise.all([
        db.select().from(lotes).where(eq(lotes.sync_status, SYNC_STATUS.DRAFT)),
        db.select().from(lotes).where(eq(lotes.sync_status, SYNC_STATUS.PENDING)),
    ]);

    const allLotes = [...(lotesDraft || []), ...(lotesPending || [])];
    const lotesValidos = [];
    const lotesInvalidos = [];

    for (const lote of allLotes) {
        // Parsear coordenadas si es string JSON
        let coordenadas = lote.coordenadas;
        if (typeof coordenadas === 'string') {
            try {
                coordenadas = JSON.parse(coordenadas);
            } catch {
                coordenadas = null;
            }
        }

        if (validarCoordenadasLote(coordenadas)) {
            lotesValidos.push(lote);
        } else {
            lotesInvalidos.push(lote);
        }
    }

    // Marcar lotes inválidos para que el usuario los corrija
    for (const lote of lotesInvalidos) {
        try {
            await db.update(lotes)
                .set({
                    sync_status: 'error_geometria',
                    updated_at: new Date().toISOString(),
                })
                .where(eq(lotes.uuid_movil, lote.uuid_movil));
        } catch (e) {
            // Error silencioso
        }
    }

    return { lotesValidos, lotesInvalidos };
};

/**
 * Construye el payload anidado de sincronización.
 * El backend espera: { lotes: [{ proyectos: [{ ciclos: [{ visitas: [{ hojas_datos: [] }] }] }] }] }
 *
 * NOTA: Incluye tanto DRAFT como PENDING para asegurar que todos los
 * registros pendientes se sincronicen. Los DRAFT se marcan como PENDING
 * antes de incluirse en el payload.
 *
 * IMPORTANTE: Los lotes con coordenadas inválidas (menos de 3 puntos únicos)
 * son marcados como 'error_geometria' y NO se incluyen en el payload.
 */
const construirPayloadSync = async () => {
    // Obtener DRAFT y PENDING por separado (excluyendo eliminados para lotes y proyectos)
    const [lotesDraft, lotesPending] = await Promise.all([
        db.select().from(lotes).where(and(eq(lotes.sync_status, SYNC_STATUS.DRAFT), isNull(lotes.deleted_at))),
        db.select().from(lotes).where(and(eq(lotes.sync_status, SYNC_STATUS.PENDING), isNull(lotes.deleted_at))),
    ]);
    const [proyectosDraft, proyectosPending] = await Promise.all([
        db.select().from(proyectos).where(and(eq(proyectos.sync_status, SYNC_STATUS.DRAFT), isNull(proyectos.deleted_at))),
        db.select().from(proyectos).where(and(eq(proyectos.sync_status, SYNC_STATUS.PENDING), isNull(proyectos.deleted_at))),
    ]);
    const [ciclosDraft, ciclosPending] = await Promise.all([
        db.select().from(ciclos_cultivo).where(eq(ciclos_cultivo.sync_status, SYNC_STATUS.DRAFT)),
        db.select().from(ciclos_cultivo).where(eq(ciclos_cultivo.sync_status, SYNC_STATUS.PENDING)),
    ]);
    const [visitasDraft, visitasPending] = await Promise.all([
        db.select().from(visitas).where(eq(visitas.sync_status, SYNC_STATUS.DRAFT)),
        db.select().from(visitas).where(eq(visitas.sync_status, SYNC_STATUS.PENDING)),
    ]);
    const [hojasDraft, hojasPending] = await Promise.all([
        db.select().from(hojas_datos).where(eq(hojas_datos.sync_status, SYNC_STATUS.DRAFT)),
        db.select().from(hojas_datos).where(eq(hojas_datos.sync_status, SYNC_STATUS.PENDING)),
    ]);

    // Combinar DRAFT + PENDING
    const allLotes = [...(lotesDraft || []), ...(lotesPending || [])];
    const allProyectos = [...(proyectosDraft || []), ...(proyectosPending || [])];
    const allCiclos = [...(ciclosDraft || []), ...(ciclosPending || [])];
    const allVisitas = [...(visitasDraft || []), ...(visitasPending || [])];
    const allHojas = [...(hojasDraft || []), ...(hojasPending || [])];

    // Obtener relaciones N:M de proyecto_lotes
    const proyectoLotesRelaciones = await db.select().from(proyecto_lotes);
    const lotesPorProyectoMap = {};
    proyectoLotesRelaciones.forEach(pl => {
        if (!lotesPorProyectoMap[pl.proyecto_uuid]) {
            lotesPorProyectoMap[pl.proyecto_uuid] = [];
        }
        lotesPorProyectoMap[pl.proyecto_uuid].push(pl.lote_uuid);
    });

    // FILTRAR LOTES CON COORDENADAS INVÁLIDAS
    // Los lotes con coordenadas inválidas se marcan como 'error_geometria'
    // para que el usuario los corrija antes de sincronizar
    const allLotesValidos = [];
    for (const lote of allLotes) {
        // Parsear coordenadas si es string JSON
        let coordenadas = lote.coordenadas;
        if (typeof coordenadas === 'string') {
            try {
                coordenadas = JSON.parse(coordenadas);
            } catch {
                coordenadas = null;
            }
        }

        if (!validarCoordenadasLote(coordenadas)) {
            // Marcar lote con error de geometría para que el usuario lo corrija
            try {
                await db.update(lotes)
                    .set({
                        sync_status: 'error_geometria',
                        updated_at: new Date().toISOString(),
                    })
                    .where(eq(lotes.uuid_movil, lote.uuid_movil));
            } catch (e) {
                // Error silencioso
            }
            continue; // Skip this lote, don't add to payload
        }
        allLotesValidos.push(lote);
    }

    // Los proyectos del frontend usan 'lote_uuid', no lote_id
    // Agrupar proyectos por lote_uuid cuando sea posible
    // El lote local tiene uuid_movil - los proyectos tienen lote_uuid (referencia al uuid_movil del lote)
    const lotesFlat = [];

    for (const lote of allLotesValidos) {
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
                variedad: proyecto.variedad || proyecto.variedad_nombre || 'Sin variedad',
                variedad_id: proyecto.variedad_id || null,
                cultivo_id: proyecto.cultivo_id || null,
                // Include lotes_ids from N:M relationship
                lotes_ids: lotesPorProyectoMap[proyectoUuid] || [],
                // Validar fecha: solo enviar si es una fecha válida YYYY-MM-DD
                fecha_siembra: (() => {
                    const fs = proyecto.fecha_siembra;
                    if (!fs) return null;
                    // Si ya es string YYYY-MM-DD válido, retornar
                    if (typeof fs === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fs)) {
                        return fs;
                    }
                    // Si es fecha ISO u otro formato, intentar parsear
                    const date = new Date(fs);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                    return null;
                })(),
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
            // Parsear coordenadas de vuelta a array (SQLite guarda como JSON string)
            coordenadas: (() => {
                if (!lote.coordenadas) return [];
                if (Array.isArray(lote.coordenadas)) return lote.coordenadas;
                try {
                    const parsed = JSON.parse(lote.coordenadas);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            })(),
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
 *
 * NOTA: `total` refleja únicamente las 3 categorías que se muestran en la
 * bandeja de notificaciones (lotes, proyectos, visitas). `ciclos` y `hojas`
 * se siguen contando por separado (útiles para depuración/otros usos),
 * pero deliberadamente NO se suman a `total` para que el número del badge
 * siempre coincida con la suma de lo que el usuario ve en pantalla.
 *
 * NOTA: Los lotes con sync_status 'error_geometria' NO se cuentan como pendientes
 * porque requieren corrección manual del usuario, no sincronización.
 */
export const obtenerConteoPendientes = async () => {
    try {
        // Contar tanto DRAFT como PENDING (excluyendo error_geometria)
        const [lotesD, lotesP, proyectosD, proyectosP, ciclosD, ciclosP, visitasD, visitasP, hojasD, hojasP] = await Promise.all([
            db.select().from(lotes).where(eq(lotes.sync_status, SYNC_STATUS.DRAFT)),
            db.select().from(lotes).where(eq(lotes.sync_status, SYNC_STATUS.PENDING)),
            db.select().from(proyectos).where(eq(proyectos.sync_status, SYNC_STATUS.DRAFT)),
            db.select().from(proyectos).where(eq(proyectos.sync_status, SYNC_STATUS.PENDING)),
            db.select().from(ciclos_cultivo).where(eq(ciclos_cultivo.sync_status, SYNC_STATUS.DRAFT)),
            db.select().from(ciclos_cultivo).where(eq(ciclos_cultivo.sync_status, SYNC_STATUS.PENDING)),
            db.select().from(visitas).where(eq(visitas.sync_status, SYNC_STATUS.DRAFT)),
            db.select().from(visitas).where(eq(visitas.sync_status, SYNC_STATUS.PENDING)),
            db.select().from(hojas_datos).where(eq(hojas_datos.sync_status, SYNC_STATUS.DRAFT)),
            db.select().from(hojas_datos).where(eq(hojas_datos.sync_status, SYNC_STATUS.PENDING)),
        ]);

        const counts = {
            lotes: (lotesD?.length || 0) + (lotesP?.length || 0),
            proyectos: (proyectosD?.length || 0) + (proyectosP?.length || 0),
            ciclos: (ciclosD?.length || 0) + (ciclosP?.length || 0),
            visitas: (visitasD?.length || 0) + (visitasP?.length || 0),
            hojas: (hojasD?.length || 0) + (hojasP?.length || 0),
        };
        // Solo lotes + proyectos + visitas, para que coincida con la UI
        counts.total = counts.lotes + counts.proyectos + counts.visitas;
        return counts;
    } catch (error) {
        // console removed
        return { lotes: 0, proyectos: 0, ciclos: 0, visitas: 0, hojas: 0, total: 0 };
    }
};

/**
 * Obtiene el conteo de lotes que necesitan corrección de geometría.
 * Estos lotes tienen coordenadas inválidas y no pueden sincronizarse.
 */
export const obtenerConteoLotesConErrorGeometria = async () => {
    try {
        const lotesError = await db
            .select()
            .from(lotes)
            .where(eq(lotes.sync_status, 'error_geometria'));
        return lotesError?.length || 0;
    } catch (error) {
        return 0;
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
            let errorDetail = `Error del servidor: ${response.status}`;
            try {
                const errorBody = await response.text();
                console.log('[SyncEngine] Error 422 response body:', errorBody);
                // Try to parse as JSON for structured errors
                try {
                    const errorJson = JSON.parse(errorBody);
                    if (errorJson.message) {
                        errorDetail = errorJson.message;
                    }
                    if (errorJson.errors) {
                        errorDetail += ' | ' + JSON.stringify(errorJson.errors);
                    }
                } catch {
                    // Not JSON, use raw text
                    if (errorBody) {
                        errorDetail = `Error ${response.status}: ${errorBody.substring(0, 500)}`;
                    }
                }
            } catch (e) {
                // Couldn't read error body
            }
            throw new Error(errorDetail);
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
        // console removed
        return { success: false, message: error.message };
    }
};