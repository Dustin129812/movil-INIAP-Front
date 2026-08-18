import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";
import { eq } from "drizzle-orm";

import { fetchApi } from "./apiClient";
import {
    guardarCatalogosLocales,
    registrarErrorCatalogos,
} from "./catalogosLocalService";

import { db, initDb } from "../db/client";
import { catalogosSyncControl } from "../db/schema";

const TOKEN_SECURE_STORE = "userToken";
const TOKEN_ASYNC_STORAGE = "token_acceso";

/**
 * Obtiene el token usando el mismo orden de prioridad
 * que utiliza el sistema de autenticación.
 */
async function obtenerToken() {
    const tokenSeguro = await SecureStore.getItemAsync(
        TOKEN_SECURE_STORE
    );

    if (tokenSeguro) {
        return tokenSeguro;
    }

    return await AsyncStorage.getItem(
        TOKEN_ASYNC_STORAGE
    );
}

/**
 * Obtiene la fecha de la última sincronización exitosa.
 */
async function obtenerUltimaSincronizacion() {
    const resultados = await db
        .select()
        .from(catalogosSyncControl)
        .where(
            eq(
                catalogosSyncControl.clave,
                "catalogos"
            )
        )
        .limit(1);

    return resultados[0]?.ultima_sincronizacion || null;
}

/**
 * Descarga y guarda los catálogos.
 *
 * forzarCompleta:
 * - false: usa sincronización incremental cuando existe fecha.
 * - true: descarga todos los catálogos nuevamente.
 */
export async function sincronizarCatalogos({
    forzarCompleta = false,
} = {}) {
    try {
        /*
         * Garantiza que las tablas locales existan antes
         * de consultar o guardar datos.
         */
        await initDb();

        const estadoRed = await NetInfo.fetch();

        if (
            !estadoRed.isConnected ||
            estadoRed.isInternetReachable === false
        ) {
            return {
                success: false,
                offline: true,
                message: "No existe conexión a internet.",
            };
        }

        const token = await obtenerToken();

        if (!token) {
            return {
                success: false,
                requireLogin: true,
                message: "No existe una sesión válida.",
            };
        }

        let ultimaSincronizacion = null;

        if (!forzarCompleta) {
            ultimaSincronizacion =
                await obtenerUltimaSincronizacion();
        }

        let endpoint = "/catalogos/sync";

        if (ultimaSincronizacion) {
            endpoint +=
                `?actualizado_desde=${encodeURIComponent(
                    ultimaSincronizacion
                )}`;
        }

        const respuesta = await fetchApi(endpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const contenido = await respuesta.json();

        if (!respuesta.ok || !contenido.success) {
            throw new Error(
                contenido.message ||
                `Error del servidor: ${respuesta.status}`
            );
        }

        if (!contenido.data) {
            throw new Error(
                "El servidor no devolvió los catálogos."
            );
        }

        const resultadoLocal =
            await guardarCatalogosLocales(
                contenido.data
            );

        return {
            success: true,
            incremental:
                contenido.data.es_incremental === true,
            servidorFecha:
                resultadoLocal.servidorFecha,
            message:
                contenido.message ||
                "Catálogos sincronizados correctamente.",
        };
    } catch (error) {
        try {
            await registrarErrorCatalogos(error);
        } catch (errorLocal) {
            console.warn(
                "[Catálogos] No se pudo registrar el error:",
                errorLocal
            );
        }

        console.error(
            "[Catálogos] Error de sincronización:",
            error
        );

        return {
            success: false,
            message:
                error?.message ||
                "No fue posible sincronizar los catálogos.",
        };
    }
}

/**
 * Fuerza una descarga completa.
 */
export async function forzarSincronizacionCatalogos() {
    return await sincronizarCatalogos({
        forzarCompleta: true,
    });
}

export default {
    sincronizarCatalogos,
    forzarSincronizacionCatalogos,
};