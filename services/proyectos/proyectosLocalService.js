import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    db,
    initDb,
    crearProyectoLocal as crearProyectoLocalDb,
    obtenerProyectosLocales,
    obtenerProyectosEliminados,
    marcarProyectoComoSincronizado,
    softDeleteProyecto,
    crearCicloLocal as crearCicloLocalDb,
    crearVisitaLocal as crearVisitaLocalDb,
    crearHojaDatosLocal as crearHojaDatosLocalDb,
    obtenerVisitasPorProyecto,
    obtenerCiclosPorProyecto,
    obtenerHojaDatosPorVisita,
    actualizarProyectoLocal,
    crearProyectoLoteRelacion,
    crearProyectoColaboradorRelacion,
    registrarColaboradorExternoLocal,
    crearProyectoColaboradorExternoRelacion,
    obtenerColaboradoresExternosPorProyecto,
    marcarColaboradorExternoComoSincronizado,
    marcarProyectoColaboradorExternoRelacionComoSincronizada,
    SYNC_STATUS,
    proyectos,
    proyecto_colaboradores,
} from '../../db';
import { eq } from 'drizzle-orm';
import { colaboradoresExternosService } from '../colaboradoresExternos/colaboradoresExternosService';

const URL_API = process.env.EXPO_PUBLIC_API_URL;
const CI_REGEX = /^\d{10}$/;

const obtenerToken = async () => {
    try {
        const usuarioRaw = await AsyncStorage.getItem('datos_usuario');
        const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

        if (usuario?.esInvitado) {
            return null;
        }

        return (
            await AsyncStorage.getItem('token_acceso') ||
            await AsyncStorage.getItem('token') ||
            await AsyncStorage.getItem('access_token') ||
            await AsyncStorage.getItem('userToken')
        );
    } catch {
        return null;
    }
};

const normalizarColaboradoresExternos = (colaboradoresExternos = []) => {
    if (!Array.isArray(colaboradoresExternos)) return [];

    const unicosPorCi = new Map();

    for (const colaborador of colaboradoresExternos) {
        const ci = String(colaborador?.ci || '').trim();
        const nombreCompleto = String(
            colaborador?.nombre_completo ||
            colaborador?.nombre ||
            ''
        ).trim();
        const participacion = String(colaborador?.participacion || '').trim();

        if (!CI_REGEX.test(ci) || !nombreCompleto || !participacion || unicosPorCi.has(ci)) {
            continue;
        }

        unicosPorCi.set(ci, {
            ...colaborador,
            ci,
            nombre_completo: nombreCompleto,
            participacion,
            server_id: colaborador?.server_id ??
                (colaborador?.origen === 'server' ? colaborador?.id : null),
            local_id: colaborador?.local_id ??
                (colaborador?.origen === 'local' ? colaborador?.id : null),
        });
    }

    return Array.from(unicosPorCi.values());
};

const extraerColaboradorExternoIdServidor = (registro) => (
    registro?.server_id ??
    registro?.colaborador_externo_id ??
    registro?.id ??
    registro?.data?.server_id ??
    registro?.data?.colaborador_externo_id ??
    registro?.data?.id ??
    registro?.data?.colaborador_externo?.id ??
    null
);

const buscarColaboradorExternoServidorPorCi = async (ci) => {
    const resultados = await colaboradoresExternosService.buscarColaboradoresExternos(ci);
    if (!Array.isArray(resultados)) return null;

    return resultados.find((item) => String(item?.ci || '').trim() === ci) || null;
};

const resolverColaboradorExternoServidor = async (colaborador) => {
    const serverIdExistente = colaborador?.server_id ??
        (colaborador?.origen === 'server' ? colaborador?.id : null);

    if (serverIdExistente) {
        return serverIdExistente;
    }

    const registro = await colaboradoresExternosService.registrarColaboradorExterno({
        ci: colaborador.ci,
        nombre_completo: colaborador.nombre_completo,
    });

    if (registro.success) {
        const idRegistro = extraerColaboradorExternoIdServidor(registro);
        if (idRegistro) return idRegistro;
    }

    const colaboradorExistente = await buscarColaboradorExternoServidorPorCi(colaborador.ci);
    return extraerColaboradorExternoIdServidor(colaboradorExistente);
};

const guardarColaboradoresExternosLocales = async (proyectoUuid, colaboradoresExternos = []) => {
    const guardados = [];

    for (const colaborador of colaboradoresExternos) {
        const colaboradorLocal = await registrarColaboradorExternoLocal({
            ci: colaborador.ci,
            nombre_completo: colaborador.nombre_completo,
            server_id: colaborador.server_id || null,
        });

        await crearProyectoColaboradorExternoRelacion(
            proyectoUuid,
            colaboradorLocal.id,
            colaborador.participacion
        );

        guardados.push({
            ...colaborador,
            id: colaboradorLocal.id,
            local_id: colaboradorLocal.id,
            server_id: colaboradorLocal.server_id || colaborador.server_id || null,
        });
    }

    return guardados;
};

const sincronizarColaboradoresExternosServidor = async (proyectoUuid, colaboradoresExternos = []) => {
    let sincronizados = true;

    for (const colaborador of colaboradoresExternos) {
        const colaboradorExternoId = await resolverColaboradorExternoServidor(colaborador);

        if (!colaboradorExternoId) {
            sincronizados = false;
            continue;
        }

        const asociacion = await colaboradoresExternosService.asociarColaboradorExterno(
            proyectoUuid,
            {
                colaborador_externo_id: colaboradorExternoId,
                participacion: colaborador.participacion,
            }
        );

        if (!asociacion.success) {
            sincronizados = false;
            continue;
        }

        await marcarColaboradorExternoComoSincronizado(
            colaborador.local_id || colaborador.id,
            colaboradorExternoId
        );
        await marcarProyectoColaboradorExternoRelacionComoSincronizada(
            proyectoUuid,
            colaborador.local_id || colaborador.id
        );
    }

    return sincronizados;
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
        // Obtener UUIDs de proyectos eliminados localmente para excluirlos
        const proyectosEliminados = await obtenerProyectosEliminados();
        const eliminadosSet = new Set(proyectosEliminados.map(p => p.uuid_movil).filter(Boolean));

        // Siempre obtener datos locales primero (son la fuente de verdad offline)
        const proyectosLocales = await obtenerProyectosLocales();

        // Crear mapa de proyectos locales por uuid para fácil acceso
        const localesMap = new Map(
            proyectosLocales.map(p => [p.uuid_movil, p])
        );

        // Si no hay token, retornar locales (ya filtrados por deleted_at IS NULL)
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

        // Si no hay datos de API, retornar locales (ya filtrados por deleted_at IS NULL)
        if (datosApi.length === 0) {
            return proyectosLocales;
        }

        // UNIÓN de ambas fuentes:
        // 1. Empezar con mapa vacío
        // 2. Agregar todos los de API (excluyendo eliminados localmente)
        // 3. Para cada local, si existe en API → sobrescribir con versión combinada (API + estado local)
        //    si NO existe en API → agregar tal cual (proyecto local pendiente de sync)
        const mergedMap = new Map();

        // Primero, agregar todos los de API (excluyendo UUIDs eliminados localmente)
        for (const proyApi of datosApi) {
            if (proyApi.uuid_movil && !eliminadosSet.has(proyApi.uuid_movil)) {
                mergedMap.set(proyApi.uuid_movil, proyApi);
            }
        }

        // Luego, agregar/sobrescribir con datos locales (ya excluidos por deleted_at IS NULL)
        for (const [uuid, proyLocal] of localesMap) {
            if (uuid && !eliminadosSet.has(uuid)) {
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
        }

        return Array.from(mergedMap.values()).filter(p => p && (p.uuid_movil || p.id));
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
        const colaboradoresExternos = normalizarColaboradoresExternos(
            datosProyecto.colaboradores_externos || []
        );

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
        const colaboradoresExternosLocales = await guardarColaboradoresExternosLocales(
            proyectoLocal.uuid_movil,
            colaboradoresExternos
        );

        // Intentar guardar en servidor
        try {
            if (token) {
                // Preparar datos para el servidor (sin variedad_id, con variedad como texto)
                const { variedad_id, colaboradores_ids, colaboradores_externos, ...datosSinVariedadId } = datosProyecto;
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
                        const externosSincronizados = await sincronizarColaboradoresExternosServidor(
                            proyectoLocal.uuid_movil,
                            colaboradoresExternosLocales
                        );

                        if (externosSincronizados) {
                            await marcarProyectoComoSincronizado(proyectoLocal.uuid_movil);
                        }

                        return {
                            success: true,
                            proyecto: datos.data || proyectoLocal,
                            pendingSync: !externosSincronizados,
                            externalSyncPending: !externosSincronizados,
                        };
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

        const proyectosLocales = await db
            .select()
            .from(proyectos);
        const proyectosPendientes = proyectosLocales.filter((proyecto) =>
            [SYNC_STATUS.DRAFT, SYNC_STATUS.PENDING].includes(proyecto.sync_status)
        );

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
                    const colaboradoresExternos = await obtenerColaboradoresExternosPorProyecto(
                        proyecto.uuid_movil
                    );
                    const externosSincronizados = await sincronizarColaboradoresExternosServidor(
                        proyecto.uuid_movil,
                        colaboradoresExternos
                    );

                    if (externosSincronizados) {
                        await marcarProyectoComoSincronizado(proyecto.uuid_movil);
                        sincronizados++;
                    } else {
                        errores++;
                    }
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

// Eliminar proyecto (soft delete local + API)
export const eliminarProyecto = async (uuid_movil) => {
    try {
        // 1. Marcar como eliminado LOCAL primero (respuesta inmediata al usuario)
        await softDeleteProyecto(uuid_movil);

        // 2. Sincronizar con el API en segundo plano
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
            return { success: true, message: 'Proyecto eliminado localmente, sincronización pendiente' };
        }
    } catch (error) {
        return { success: true, message: 'Proyecto eliminado localmente, sincronización pendiente' };
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
