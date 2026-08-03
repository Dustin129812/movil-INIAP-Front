import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, initDb, crearLoteLocal as crearLoteLocalDb, obtenerLotesLocales, marcarLoteComoSincronizado, SYNC_STATUS, lotes } from '../db';
import { eq } from 'drizzle-orm';

const URL_API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

const obtenerToken = async () => {
    try {
        return await AsyncStorage.getItem('token_acceso');
    } catch {
        return null;
    }
};

// Inicializar base de datos local
export const inicializarBaseDatosLocal = async () => {
    try {
        await initDb();
        console.log('[LocalLotes] Base de datos local lista');
    } catch (error) {
        console.error('[LocalLotes] Error inicializando DB local:', error);
    }
};

// Obtener lotes - primero intenta API, si falla usa local
export const obtenerLotes = async () => {
    try {
        const token = await obtenerToken();
        const respuesta = await fetch(`${URL_API}/lotes`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const datos = await respuesta.json();
        return datos.success ? datos.lotes || [] : [];
    } catch (error) {
        console.warn('[LocalLotes] Error conectando al servidor, usando datos locales');
        const lotesLocales = await obtenerLotesLocales();
        return lotesLocales;
    }
};

// Crear lote - guarda localmente y marca para sincronizar
export const crearLoteLocal = async (datosLote) => {
    try {
        const token = await obtenerToken();
        const uuid = crypto.randomUUID();

        // Primero guardar localmente
        const loteLocal = await crearLoteLocalDb({
            ...datosLote,
            uuid_movil: uuid,
        });

        // Intentar guardar en servidor
        try {
            const respuesta = await fetch(`${URL_API}/lotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...datosLote,
                    uuid_movil: uuid,
                }),
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                if (datos.success) {
                    await marcarLoteComoSincronizado(uuid);
                    return { success: true, lote: datos.lote || loteLocal };
                }
            }
        } catch (serverError) {
            console.warn('[LocalLotes] Guardado solo localmente, pendiente sincronización');
        }

        return { success: true, lote: loteLocal, pendingSync: true };
    } catch (error) {
        console.error('[LocalLotes] Error creando lote:', error);
        return { success: false, message: 'Error al crear lote' };
    }
};

// Sincronizar lotes pendientes con el servidor
export const sincronizarLotesPendientes = async () => {
    try {
        const token = await obtenerToken();
        if (!token) return { success: false, message: 'No autenticado' };

        const lotesPendientes = await db
            .select()
            .from(lotes)
            .where(eq(lotes.sync_status, SYNC_STATUS.PENDING));

        let sincronizados = 0;
        let errores = 0;

        for (const lote of lotesPendientes) {
            try {
                const respuesta = await fetch(`${URL_API}/lotes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(lote),
                });

                if (respuesta.ok) {
                    await marcarLoteComoSincronizado(lote.uuid_movil);
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
        console.error('[LocalLotes] Error en sincronización:', error);
        return { success: false, message: 'Error en sincronización' };
    }
};

export default {
    inicializarBaseDatosLocal,
    obtenerLotes,
    crearLoteLocal,
    sincronizarLotesPendientes,
};
