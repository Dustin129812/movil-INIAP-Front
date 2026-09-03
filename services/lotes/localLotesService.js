import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { db, initDb, crearLoteLocal as crearLoteLocalDb, obtenerLotesLocales, marcarLoteComoSincronizado, SYNC_STATUS, lotes } from '../../db';
import { eq, isNull, and } from 'drizzle-orm';

const URL_API = process.env.EXPO_PUBLIC_API_URL;

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
    } catch (error) {
        // console removed
    }
};

// Obtener lotes - primero intenta API, si falla usa local
export const obtenerLotes = async () => {
    try {
        const token = await obtenerToken();
        const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const datos = await respuesta.json();

        // Manejar varios formatos de respuesta igual que lotesService
        if (Array.isArray(datos)) return datos;
        if (datos.data) return datos.data;
        if (datos.lotes) return datos.lotes;
        if (datos.result) return datos.result;
        if (datos.success && Array.isArray(datos.lotes)) return datos.lotes;
        if (datos.success && Array.isArray(datos.data)) return datos.data;
        return [];
    } catch (error) {
        const lotesLocales = await obtenerLotesLocales();
        return lotesLocales;
    }
};

// Crear lote - guarda localmente y marca para sincronizar
export const crearLoteLocal = async (datosLote) => {
    try {
        const token = await obtenerToken();
        const uuid = Crypto.randomUUID();

        // Primero guardar localmente
        const loteLocal = await crearLoteLocalDb({
            ...datosLote,
            uuid_movil: uuid,
        });

        // Intentar guardar en servidor
        try {
            const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
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
        }

        return { success: true, lote: loteLocal, pendingSync: true };
    } catch (error) {
        // console removed
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
            .where(and(
                eq(lotes.sync_status, SYNC_STATUS.PENDING),
                isNull(lotes.deleted_at)
            ));

        let sincronizados = 0;
        let errores = 0;

        for (const lote of lotesPendientes) {
            try {
                const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
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
        // console removed
        return { success: false, message: 'Error en sincronización' };
    }
};

export const localLotesService = {
    inicializarBaseDatosLocal,
    obtenerLotes,
    crearLoteLocal,
    sincronizarLotesPendientes,
};

export default localLotesService;
