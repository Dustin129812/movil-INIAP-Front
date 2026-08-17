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
    SYNC_STATUS,
    proyectos,
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

// Obtener proyectos - primero intenta API, si falla usa local
export const obtenerProyectos = async () => {
    try {
        const token = await obtenerToken();
        if (!token) {
            const proyectosLocales = await obtenerProyectosLocales();
            return proyectosLocales;
        }

        const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!respuesta.ok) {
            const proyectosLocales = await obtenerProyectosLocales();
            return proyectosLocales;
        }

        const datos = await respuesta.json();

        if (datos.success && datos.data && datos.data.length > 0) {
            return datos.data;
        }
        // Si el API no tiene datos, usar locales
        const proyectosLocales = await obtenerProyectosLocales();
        return proyectosLocales;
    } catch (error) {
        // console removed
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

        // Primero guardar localmente
        const proyectoLocal = await crearProyectoLocalDb(datosProyecto, { loteUuid: datosProyecto.lote_uuid || null });

        // Intentar guardar en servidor
        try {
            if (token) {
                const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...datosProyecto,
                        uuid_movil: proyectoLocal.uuid_movil,
                    }),
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
        return { success: false, message: 'Error al crear proyecto' };
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
                const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(proyecto),
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
};

export default proyectosLocalService;
