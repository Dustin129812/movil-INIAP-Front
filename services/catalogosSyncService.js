import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";
import { eq } from "drizzle-orm";

import { fetchApi } from "./api/apiClient";
import {
    guardarCatalogosLocales,
    registrarErrorCatalogos,
} from "./catalogosLocalService";

import { db, initDb } from "../db/client";
import {
    catalogosSyncControl,
    cultivos,
    enfermedades,
    etapasCultivo,
    plagas,
    recomendaciones,
} from "../db/schema";

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

function lista(payload, clave) {
    return Array.isArray(payload?.[clave]) ? payload[clave] : [];
}

function relaciones(payload, clave) {
    const relacionesPayload = payload?.relaciones || {};

    return Array.isArray(relacionesPayload[clave])
        ? relacionesPayload[clave]
        : [];
}

function normalizarId(valor) {
    const id = Number(valor);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function agregarIds(set, registros, campo) {
    for (const registro of registros) {
        const id = normalizarId(registro?.[campo]);

        if (id) {
            set.add(id);
        }
    }
}

function faltanIds(registros, campo, idsDisponibles) {
    return registros.some((registro) => {
        const id = normalizarId(registro?.[campo]);

        return id && !idsDisponibles.has(id);
    });
}

async function obtenerIdsLocales(tabla, columna) {
    const registros = await db.select({ id: columna }).from(tabla);

    return new Set(
        registros
            .map((registro) => normalizarId(registro.id))
            .filter(Boolean)
    );
}

async function crearMapaIdsDisponibles(payload) {
    const [
        cultivosLocales,
        enfermedadesLocales,
        plagasLocales,
        recomendacionesLocales,
        etapasLocales,
    ] = await Promise.all([
        obtenerIdsLocales(cultivos, cultivos.id),
        obtenerIdsLocales(enfermedades, enfermedades.id),
        obtenerIdsLocales(plagas, plagas.id),
        obtenerIdsLocales(recomendaciones, recomendaciones.id),
        obtenerIdsLocales(etapasCultivo, etapasCultivo.id),
    ]);

    agregarIds(cultivosLocales, lista(payload, "cultivos"), "id");
    agregarIds(enfermedadesLocales, lista(payload, "enfermedades"), "id");
    agregarIds(plagasLocales, lista(payload, "plagas"), "id");
    agregarIds(
        recomendacionesLocales,
        lista(payload, "recomendaciones"),
        "id"
    );
    agregarIds(etapasLocales, lista(payload, "etapas_cultivo"), "id");

    return {
        cultivos: cultivosLocales,
        enfermedades: enfermedadesLocales,
        plagas: plagasLocales,
        recomendaciones: recomendacionesLocales,
        etapas: etapasLocales,
    };
}

async function requiereSincronizacionCompleta(payload) {
    if (payload?.es_incremental !== true) {
        return false;
    }

    const disponibles = await crearMapaIdsDisponibles(payload);
    const etapasPayload = lista(payload, "etapas_cultivo");

    if (
        faltanIds(
            etapasPayload,
            "cultivo_id",
            disponibles.cultivos
        )
    ) {
        return true;
    }

    const checks = [
        [
            relaciones(payload, "cultivo_enfermedad"),
            "cultivo_id",
            disponibles.cultivos,
        ],
        [
            relaciones(payload, "cultivo_enfermedad"),
            "enfermedad_id",
            disponibles.enfermedades,
        ],
        [
            relaciones(payload, "cultivo_plaga"),
            "cultivo_id",
            disponibles.cultivos,
        ],
        [
            relaciones(payload, "cultivo_plaga"),
            "plaga_id",
            disponibles.plagas,
        ],
        [
            relaciones(payload, "enfermedad_recomendacion"),
            "enfermedad_id",
            disponibles.enfermedades,
        ],
        [
            relaciones(payload, "enfermedad_recomendacion"),
            "recomendacion_id",
            disponibles.recomendaciones,
        ],
        [
            relaciones(payload, "plaga_recomendacion"),
            "plaga_id",
            disponibles.plagas,
        ],
        [
            relaciones(payload, "plaga_recomendacion"),
            "recomendacion_id",
            disponibles.recomendaciones,
        ],
        [
            relaciones(payload, "etapa_recomendacion"),
            "etapa_cultivo_id",
            disponibles.etapas,
        ],
        [
            relaciones(payload, "etapa_recomendacion"),
            "recomendacion_id",
            disponibles.recomendaciones,
        ],
        [
            relaciones(payload, "etapa_enfermedad"),
            "etapa_cultivo_id",
            disponibles.etapas,
        ],
        [
            relaciones(payload, "etapa_enfermedad"),
            "enfermedad_id",
            disponibles.enfermedades,
        ],
        [
            relaciones(payload, "etapa_plaga"),
            "etapa_cultivo_id",
            disponibles.etapas,
        ],
        [
            relaciones(payload, "etapa_plaga"),
            "plaga_id",
            disponibles.plagas,
        ],
    ];

    return checks.some(([registros, campo, idsDisponibles]) =>
        faltanIds(registros, campo, idsDisponibles)
    );
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

        if (
            !forzarCompleta &&
            await requiereSincronizacionCompleta(contenido.data)
        ) {
            console.log(
                "[Catalogos] Incremental con relaciones sin base local. Ejecutando sincronizacion completa."
            );

            return await forzarSincronizacionCatalogos();
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
