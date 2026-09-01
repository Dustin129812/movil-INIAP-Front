import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    db,
    initDb,
    crearProyectoLocal as crearProyectoLocalDb,
    obtenerProyectosLocales,
    marcarProyectoComoSincronizado,
    crearCicloLocal as crearCicloLocalDb,
    crearVisitaLocal as crearVisitaLocalDb,
    crearHojaDatosLocal as crearHojaDatosLocalDb,
    obtenerVisitasPorProyecto,
    obtenerCiclosPorProyecto,
    obtenerHojaDatosPorVisita,
    actualizarProyectoLocal,
    actualizarLotesDelProyecto,
    crearProyectoLoteRelacion,
    crearProyectoColaboradorRelacion,
    obtenerLotesPorProyecto,
    SYNC_STATUS,
    proyectos,
    proyecto_colaboradores,
} from '../../db';
import { eq } from 'drizzle-orm';

const URL_API = process.env.EXPO_PUBLIC_API_URL;

const obtenerToken = async () => {
    try {
        return await AsyncStorage.getItem('token_acceso');
    } catch {
        return null;
    }
};

// Inicializar base de datos local
export const inicializarBaseDatosProyectos = async () => {
    try {
        await initDb();
    } catch (error) {
        // console removed
    }
};

// Obtener proyectos - siempre priorizar datos locales con cambios pendientes
export const obtenerProyectos = async () => {
    try {
        // Siempre obtener datos locales primero (son la fuente de verdad offline)
        const proyectosLocales = await obtenerProyectosLocales();

        // Crear mapa de proyectos locales por uuid para fácil acceso
        const localesMap = new Map(
            proyectosLocales.map(p => [p.uuid_movil, p])
        );

        // Si no hay token, retornar locales
        const token = await obtenerToken();
        if (!token) {
            return proyectosLocales;
        }

        // Intentar obtener datos de API
        let datosApi = [];
        try {
            const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                if (datos.success && datos.data && datos.data.length > 0) {
                    datosApi = datos.data;
                }
            }
        } catch (apiErr) {
            // Ignorar errores de API
        }

        // Si no hay datos de API, retornar locales
        if (datosApi.length === 0) {
            return proyectosLocales;
        }

        // UNIÓN de ambas fuentes:
        // 1. Empezar con mapa vacío
        // 2. Agregar todos los de API
        // 3. Para cada local, si existe en API → sobrescribir con versión combinada (API + estado local)
        //    si NO existe en API → agregar tal cual (proyecto local pendiente de sync)
        const mergedMap = new Map();

        // Primero, agregar todos los de API
        for (const proyApi of datosApi) {
            mergedMap.set(proyApi.uuid_movil, proyApi);
        }

        // Luego, agregar/sobrescribir con datos locales
        for (const [uuid, proyLocal] of localesMap) {
            if (mergedMap.has(uuid)) {
                // Existe en API: combinar API + estado local preservado
                const proyApi = mergedMap.get(uuid);
                mergedMap.set(uuid, {
                    ...proyApi,
                    estado: proyLocal.estado || proyApi.estado || 'activo',
                });
            } else {
                // NO existe en API: proyecto local pendiente de sync, agregar tal cual
                mergedMap.set(uuid, proyLocal);
            }
        }

        return Array.from(mergedMap.values());
    } catch (error) {
        // En caso de error, siempre retornar datos locales
        const proyectosLocales = await obtenerProyectosLocales();
        return proyectosLocales;
    }
};

// Crear proyecto - guarda localmente y marca para sincronizar
export const crearProyectoLocal = async (datosProyecto) => {
    try {
        const token = await obtenerToken();

        // Asegurar que la BD local esté inicializada
        await initDb();

        // Obtener lote_uuid del primer lote de lotes_ids para backward compatibility
        const loteUuidPrincipal = datosProyecto.lote_uuid ||
            (datosProyecto.lotes_ids && datosProyecto.lotes_ids.length > 0 ? datosProyecto.lotes_ids[0] : null);

        // Primero guardar localmente
        const proyectoLocal = await crearProyectoLocalDb(datosProyecto, { loteUuid: loteUuidPrincipal });

        // Crear relaciones N:M con lotes si hay múltiples lotes
        const lotesUuids = datosProyecto.lotes_uuids || datosProyecto.lotes_ids || [];
        if (Array.isArray(lotesUuids) && lotesUuids.length > 0) {
            for (const loteUuid of lotesUuids) {
                await crearProyectoLoteRelacion(proyectoLocal.uuid_movil, loteUuid);
            }
        }

        // Crear relaciones N:M con colaboradores si hay múltiples
        const colaboradoresIds = datosProyecto.colaboradores_ids || [];
        if (Array.isArray(colaboradoresIds) && colaboradoresIds.length > 0) {
            for (const usuarioId of colaboradoresIds) {
                await crearProyectoColaboradorRelacion(proyectoLocal.uuid_movil, usuarioId);
            }
        }

        // Intentar guardar en servidor
        try {
            if (token) {
                // Preparar datos para el servidor (sin variedad_id, con variedad como texto)
                const { variedad_id, colaboradores_ids, ...datosSinVariedadId } = datosProyecto;
                const datosParaServidor = {
                    ...datosSinVariedadId,
                    uuid_movil: proyectoLocal.uuid_movil,
                    lote_uuid: loteUuidPrincipal,
                    variedad: datosProyecto.variedad_nombre || datosProyecto.variedad || null,
                    // Backend espera 'colaboradores', no 'colaboradores_ids'
                    colaboradores: colaboradores_ids || [],
                };

                const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(datosParaServidor),
                });

                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    if (datos.success || respuesta.status === 201) {
                        await marcarProyectoComoSincronizado(proyectoLocal.uuid_movil);
                        return { success: true, proyecto: datos.data || proyectoLocal };
                    }
                    // console removed
                } else {
                    const texto = await respuesta.text();
                    // console removed
                }
            }
        } catch (serverError) {
            // console.log removed
        }

        return { success: true, proyecto: proyectoLocal, pendingSync: true };
    } catch (error) {
        // console removed
        return { success: false, message: 'Error al crear proyecto: ' + (error.message || error.toString()) };
    }
};

// Crear ciclo de cultivo
export const crearCicloLocal = async (datosCiclo) => {
    try {
        const ciclo = await crearCicloLocalDb(datosCiclo);
        return { success: true, ciclo };
    } catch (error) {
        // console removed
        return { success: false, message: 'Error al crear ciclo' };
    }
};

// Crear visita
export const crearVisitaLocal = async (datosVisita) => {
    try {
        const visita = await crearVisitaLocalDb(datosVisita);
        return { success: true, visita };
    } catch (error) {
        // console removed
        return { success: false, message: 'Error al crear visita' };
    }
};

// Crear hoja de datos
export const crearHojaDatosLocal = async (datosHoja) => {
    try {
        const hoja = await crearHojaDatosLocalDb(datosHoja);
        return { success: true, hoja };
    } catch (error) {
        // console removed
        return { success: false, message: 'Error al crear hoja de datos' };
    }
};

// Obtener visitas de un proyecto
export const obtenerVisitasDelProyecto = async (proyectoId) => {
    try {
        return await obtenerVisitasPorProyecto(proyectoId);
    } catch (error) {
        // console removed
        return [];
    }
};

// Obtener ciclos de un proyecto
export const obtenerCiclosDelProyecto = async (proyectoId) => {
    try {
        return await obtenerCiclosPorProyecto(proyectoId);
    } catch (error) {
        // console removed
        return [];
    }
};

// Obtener hojas de datos de una visita
export const obtenerHojasDeVisita = async (visitaId) => {
    try {
        return await obtenerHojaDatosPorVisita(visitaId);
    } catch (error) {
        // console removed
        return [];
    }
};

// Sincronizar proyectos pendientes con el servidor
export const sincronizarProyectosPendientes = async () => {
    try {
        const token = await obtenerToken();
        if (!token) return { success: false, message: 'No autenticado' };

        const proyectosPendientes = await db
            .select()
            .from(proyectos)
            .where(eq(proyectos.sync_status, SYNC_STATUS.PENDING));

        let sincronizados = 0;
        let errores = 0;

        for (const proyecto of proyectosPendientes) {
            try {
                // Obtener colaboradores del proyecto desde la BD local
                const colaboradoresIds = await db
                    .select()
                    .from(proyecto_colaboradores)
                    .where(eq(proyecto_colaboradores.proyecto_uuid, proyecto.uuid_movil));

                const colaboradores = colaboradoresIds.map(c => c.usuario_id);

                // Preparar datos para el servidor (excluir variedad_id que ya no existe en backend)
                const { variedad_id, ...datosParaServidor } = proyecto;
                const datosCompletos = {
                    ...datosParaServidor,
                    colaboradores: colaboradores,
                };

                const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(datosCompletos),
                });

                if (respuesta.ok) {
                    await marcarProyectoComoSincronizado(proyecto.uuid_movil);
                    sincronizados++;
                } else {
                    errores++;
                }
            } catch {
                errores++;
            }
        }

        return { success: true, sincronizados, errores };
    } catch (error) {
        // console removed
        return { success: false, message: 'Error en sincronización' };
    }
};

// Obtener un proyecto especifico por UUID
export const obtenerProyectoLocal = async (uuid_movil) => {
    try {
        const resultados = await db
            .select()
            .from(proyectos)
            .where(eq(proyectos.uuid_movil, uuid_movil));
        return resultados[0] || null;
    } catch (error) {
        // console removed
        return null;
    }
};

// Eliminar proyecto (llama al API - soft delete en backend)
export const eliminarProyecto = async (uuid_movil) => {
    try {
        const token = await obtenerToken();
        const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${uuid_movil}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        if (respuesta.ok) {
            return { success: true, message: 'Proyecto eliminado' };
        } else {
            return { success: false, message: 'No se pudo eliminar el proyecto' };
        }
    } catch (error) {
        // console removed
        return { success: false, message: 'Error de red al eliminar proyecto' };
    }
};

export const proyectosLocalService = {
    inicializarBaseDatosProyectos,
    obtenerProyectos,
    crearProyectoLocal,
    crearCicloLocal,
    crearVisitaLocal,
    crearHojaDatosLocal,
    obtenerVisitasDelProyecto,
    obtenerCiclosDelProyecto,
    obtenerHojasDeVisita,
    sincronizarProyectosPendientes,
    obtenerProyectoLocal,
    actualizarProyectoLocal,
    eliminarProyecto,
};

export default proyectosLocalService;
