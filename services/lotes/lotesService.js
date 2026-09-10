import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  actualizarEstadoLoteLocal,
  actualizarLoteLocalPorId,
  crearLoteLocal,
  guardarCatalogosLocales,
  obtenerCantonesLocales,
  obtenerCultivosLocales,
  obtenerEstacionesLocales,
  obtenerLoteLocal,
  obtenerLotesEliminados,
  obtenerLotesLocales,
  obtenerProvinciasLocales,
  softDeleteLote,
} from '../../db/client';

// ============================================================
// CONFIG
// ============================================================

const URL_API = process.env.EXPO_PUBLIC_API_URL;
const CATALOGOS_CACHE_KEY = '@iniap_catalogos_cache_v1';
const TIEMPO_MAX_FETCH_MS = 4000;
const TIEMPO_CACHE_MEMORIA_MS = 60_000;

// Catálogo "vacío" seguro: se usa como último recurso para que la app
// nunca truene por falta de datos, solo se vean listas vacías.
const CATALOGOS_VACIOS = { provincias: [], cantones: [], estaciones: [], cultivos: [] };

// Caché en memoria para no pegarle a SQLite/AsyncStorage en cada render.
let catalogosEnMemoria = null;
let ultimaCargaMemoria = 0;

// ============================================================
// AUTENTICACIÓN
// ============================================================

const obtenerToken = async () => {
  try {
    const t = await SecureStore.getItemAsync('userToken');
    if (t) return t;
  } catch {}

  const claves = ['token_acceso', 'access_token', 'token', 'userToken'];
  for (const clave of claves) {
    try {
      const t = await AsyncStorage.getItem(clave);
      if (t) return t;
    } catch {}
  }
  return null;
};

// ============================================================
// HELPERS DE RED / NORMALIZACIÓN
// ============================================================

const fetchConTimeout = async (url, opciones) => {
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), TIEMPO_MAX_FETCH_MS);
  try {
    const res = await fetch(url, { ...opciones, signal: controlador.signal });
    clearTimeout(timeout);
    return res;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
};

const extraerDatosApi = (respuesta) => {
  if (!respuesta) return [];
  if (respuesta.data && Array.isArray(respuesta.data)) return respuesta.data;
  if (respuesta.lotes && Array.isArray(respuesta.lotes)) return respuesta.lotes;
  if (respuesta.result && Array.isArray(respuesta.result)) return respuesta.result;
  return [];
};

const alNombre = (item) => item?.name || item?.nombre || item?.label || '';

// Deja provincias/cantones/estaciones/cultivos en un formato consistente
// sin importar si vinieron de la API, de SQLite o del caché en disco.
const normalizarProvinciaOCanton = (items, camposRel = {}) => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    if (!item || typeof item !== 'object') return item;
    const base = { ...item };
    const nombre = alNombre(item);
    base.nombre = nombre;
    base.name = nombre;
    if (camposRel.provincia) {
      const pid = item.provincia_id ?? item.province_id ?? item.provinciaId ?? item.codigo_provincia;
      if (pid !== undefined && pid !== null) base.provincia_id = Number(pid);
    }
    if (camposRel.canton) {
      const cid = item.canton_id ?? item.cantonId ?? item.codigo_canton;
      if (cid !== undefined && cid !== null) base.canton_id = Number(cid);
    }
    if (item.id !== undefined && item.id !== null) base.id = Number(item.id);
    return base;
  });
};

const extraerCatalogosApi = (respuesta) => {
  if (!respuesta || !respuesta.data) return { ...CATALOGOS_VACIOS };
  const d = respuesta.data;
  return {
    provincias: normalizarProvinciaOCanton(d.provincias || d.province || []),
    cantones: normalizarProvinciaOCanton(d.cantones || d.cantons || d.cities || [], { provincia: true }),
    estaciones: normalizarProvinciaOCanton(d.estaciones || d.stations || [], { canton: true }),
    cultivos: normalizarProvinciaOCanton(d.cultivos || d.crops || []),
  };
};

// ============================================================
// CACHÉ DE CATÁLOGOS (memoria + disco)
// ============================================================
// Tres niveles, del más rápido al más confiable:
//   1) memoria (dura 60s, se pierde al cerrar la app)
//   2) AsyncStorage (sobrevive cierres de la app, es el respaldo offline)
//   3) SQLite (fuente "de verdad" para trabajar sin conexión)

const guardarCacheMemoriaYDisco = async (catalogos) => {
  catalogosEnMemoria = catalogos;
  ultimaCargaMemoria = Date.now();
  try {
    await AsyncStorage.setItem(CATALOGOS_CACHE_KEY, JSON.stringify(catalogos));
  } catch (e) {
    console.warn('[lotesService] no se pudo guardar cache AsyncStorage:', e.message);
  }
};

const leerCacheDisco = async () => {
  try {
    const raw = await AsyncStorage.getItem(CATALOGOS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Combina lo que hay en SQLite con lo que hay en el caché de disco,
// priorizando SQLite pero sin perder nada que solo esté en el disco.
const mergearPorId = (principal, secundaria) => {
  if (!principal || !secundaria) return principal || secundaria;
  const mapa = new Map();
  [...(secundaria || []), ...(principal || [])].forEach(item => {
    if (item?.id != null) mapa.set(Number(item.id), item);
  });
  return Array.from(mapa.values());
};

/**
 * Junta todo lo que hay guardado localmente (SQLite + caché de disco),
 * sin tocar la red. Esto es lo que se le entrega al usuario cuando no
 * hay conexión.
 */
const construirCatalogosLocales = async () => {
  const [provinciasL, cantonesL, estacionesL, cultivosL, cacheDisco] = await Promise.all([
    obtenerProvinciasLocales(),
    obtenerCantonesLocales(),
    obtenerEstacionesLocales(),
    obtenerCultivosLocales(),
    leerCacheDisco(),
  ]);

  const catalogosSqlite = {
    provincias: normalizarProvinciaOCanton(provinciasL),
    cantones: normalizarProvinciaOCanton(cantonesL, { provincia: true }),
    estaciones: normalizarProvinciaOCanton(estacionesL, { canton: true }),
    cultivos: normalizarProvinciaOCanton(cultivosL),
  };

  // cacheDisco puede no existir, o existir pero venir incompleto (versiones
  // viejas del caché). Siempre se accede con "?." + fallback a [] para que
  // esto nunca tire una excepción y rompa el modo offline.
  const catalogosDisco = cacheDisco ? {
    provincias: normalizarProvinciaOCanton(cacheDisco.provincias || []),
    cantones: normalizarProvinciaOCanton(cacheDisco.cantones || [], { provincia: true }),
    estaciones: normalizarProvinciaOCanton(cacheDisco.estaciones || [], { canton: true }),
    cultivos: normalizarProvinciaOCanton(cacheDisco.cultivos || []),
  } : null;

  const catalogosLocales = {
    provincias: mergearPorId(catalogosSqlite.provincias, catalogosDisco?.provincias),
    cantones: mergearPorId(catalogosSqlite.cantones, catalogosDisco?.cantones),
    estaciones: mergearPorId(catalogosSqlite.estaciones, catalogosDisco?.estaciones),
    cultivos: mergearPorId(catalogosSqlite.cultivos, catalogosDisco?.cultivos),
  };

  console.log(
    `[lotesService][catalogos] SQLITE: P=${catalogosSqlite.provincias.length} C=${catalogosSqlite.cantones.length} E=${catalogosSqlite.estaciones.length}` +
    ` | DISCO: P=${catalogosDisco?.provincias?.length || 0} C=${catalogosDisco?.cantones?.length || 0} E=${catalogosDisco?.estaciones?.length || 0}` +
    ` | MERGE: P=${catalogosLocales.provincias.length} C=${catalogosLocales.cantones.length} E=${catalogosLocales.estaciones.length}`
  );

  return catalogosLocales;
};

/**
 * Intenta traer los catálogos actualizados del servidor. Si algo falla
 * (sin red, timeout, respuesta rara) devuelve null y quien llama debe
 * quedarse con los catálogos locales.
 */
const descargarCatalogosDeApi = async () => {
  if (!URL_API) return null;

  const token = await obtenerToken();

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const respuesta = await fetchConTimeout(`${URL_API}/agrodecide/catalogosMobile`, { headers });
    console.log(`[lotesService][catalogos] fetch HTTP ${respuesta.status}`);
    if (!respuesta.ok) return null;

    const json = await respuesta.json();
    const catalogosApi = extraerCatalogosApi(json);

    const totalApi = catalogosApi.provincias.length + catalogosApi.cantones.length + catalogosApi.estaciones.length;
    console.log(`[lotesService][catalogos] API: P=${catalogosApi.provincias.length} C=${catalogosApi.cantones.length} E=${catalogosApi.estaciones.length}`);
    if (totalApi === 0) return null;

    try {
      await guardarCatalogosLocales(catalogosApi);
    } catch (e) {
      console.error('[lotesService][catalogos] ERROR guardando en SQLite:', e.message || e);
    }

    return catalogosApi;
  } catch (e) {
    console.warn(`[lotesService][catalogos] fetch falló (posiblemente offline): ${e.name || 'Error'} - ${e.message || ''}`);
    return null;
  }
};

/**
 * Punto único para obtener los catálogos (provincias, cantones, estaciones,
 * cultivos). Funciona tanto online como offline:
 *   1. Si hay un caché en memoria reciente, se usa (rápido).
 *   2. Se arma la versión local (SQLite + disco) como respaldo garantizado.
 *   3. Si hay red, se intenta traer la versión fresca del servidor y
 *      reemplaza a la local; si no, se usa la local sin más drama.
 * Nunca lanza una excepción hacia afuera: en el peor de los casos devuelve
 * catálogos vacíos en vez de romper la pantalla.
 */
const obtenerCatalogosInterno = async () => {
  const ahora = Date.now();
  if (catalogosEnMemoria && (ahora - ultimaCargaMemoria) < TIEMPO_CACHE_MEMORIA_MS) {
    return catalogosEnMemoria;
  }

  const catalogosLocales = await construirCatalogosLocales();
  const catalogosApi = await descargarCatalogosDeApi();

  const catalogosFinales = catalogosApi || catalogosLocales;
  await guardarCacheMemoriaYDisco(catalogosFinales);
  return catalogosFinales;
};

const obtenerCatalogosSeguro = async () => {
  try {
    return await obtenerCatalogosInterno();
  } catch (e) {
    console.error('[lotesService][catalogos] ERROR inesperado, devolviendo catálogos vacíos:', e.message || e);
    return catalogosEnMemoria || CATALOGOS_VACIOS;
  }
};

// ============================================================
// SERVICIO PÚBLICO
// ============================================================

export const lotesService = {
  async obtenerLotes() {
    const lotesLocales = await obtenerLotesLocales();

    const token = await obtenerToken();
    if (!token || !URL_API) return lotesLocales;

    const lotesEliminados = await obtenerLotesEliminados();
    const eliminadosSet = new Set(
      lotesEliminados.map(l => l.uuid_movil).filter(Boolean)
    );

    try {
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) return lotesLocales;

      const json = await respuesta.json();
      const datosApi = extraerDatosApi(json);

      if (datosApi.length === 0) return lotesLocales;

      const mergedMap = new Map();

      for (const loteApi of datosApi) {
        if (loteApi.uuid_movil && !eliminadosSet.has(loteApi.uuid_movil)) {
          mergedMap.set(loteApi.uuid_movil, loteApi);
        }
      }

      for (const loteLocal of lotesLocales) {
        const uuid = loteLocal.uuid_movil;
        if (!uuid || eliminadosSet.has(uuid)) continue;

        if (mergedMap.has(uuid)) {
          const loteApi = mergedMap.get(uuid);
          mergedMap.set(uuid, {
            ...loteApi,
            estado_verificacion: loteLocal.estado_verificacion || loteApi.estado_verificacion || 'pendiente',
          });
        } else {
          mergedMap.set(uuid, loteLocal);
        }
      }

      return Array.from(mergedMap.values()).filter(l => l && (l.uuid_movil || l.id));
    } catch {
      return lotesLocales;
    }
  },

  async obtenerLote(idOrUuid) {
    const local = await obtenerLoteLocal(idOrUuid);
    if (local) return local;

    const token = await obtenerToken();
    if (!token || !URL_API) return null;

    try {
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${idOrUuid}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) return null;
      const datos = await respuesta.json();
      return datos.data || null;
    } catch {
      return null;
    }
  },

  async crearLote(datosLote) {
    let loteLocal;
    if (datosLote.uuid_movil) {
      loteLocal = await obtenerLoteLocal(datosLote.uuid_movil);
    }
    if (!loteLocal) {
      loteLocal = await crearLoteLocal(datosLote);
    }

    const token = await obtenerToken();
    if (!token || !URL_API) {
      return { success: true, data: loteLocal, offline: true, message: 'Guardado localmente' };
    }

    try {
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosLote),
      });

      const contentType = respuesta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: true, data: loteLocal, offline: true, message: 'Guardado localmente, sincronización pendiente' };
      }

      const datos = await respuesta.json();

      if (respuesta.status === 201 || respuesta.status === 200) {
        return { success: true, data: datos.data || loteLocal, message: datos.message || 'Lote creado' };
      }

      return { success: true, data: loteLocal, offline: true, message: datos.message || 'Guardado localmente, sincronización pendiente' };
    } catch {
      return { success: true, data: loteLocal, offline: true, message: 'Guardado localmente, sincronización pendiente' };
    }
  },

  async actualizarLote(idOrUuid, datosLote) {
    const loteActualizado = await actualizarLoteLocalPorId(idOrUuid, datosLote);
    const loteRef = loteActualizado || await obtenerLoteLocal(idOrUuid);
    const uuidParaApi = loteRef?.uuid_movil || idOrUuid;

    const token = await obtenerToken();
    if (!token || !URL_API) {
      return { success: true, data: loteActualizado, offline: true, message: 'Actualizado localmente' };
    }

    try {
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${uuidParaApi}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosLote),
      });

      if (!respuesta.ok) {
        return { success: true, data: loteActualizado, offline: true, message: 'Actualizado localmente, sincronización pendiente' };
      }

      const contentType = respuesta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { success: true, data: loteActualizado, offline: true, message: 'Actualizado localmente, sincronización pendiente' };
      }

      const datos = await respuesta.json();
      return { success: true, data: datos.data || loteActualizado, message: datos.message || 'Lote actualizado' };
    } catch {
      return { success: true, data: loteActualizado, offline: true, message: 'Actualizado localmente, sincronización pendiente' };
    }
  },

  async cambiarEstadoLote(idOrUuid, nuevoEstado) {
    const lote = await obtenerLoteLocal(idOrUuid);
    if (lote && lote.uuid_movil) {
      await actualizarEstadoLoteLocal(lote.uuid_movil, nuevoEstado);
    }
    return { success: true, message: 'Estado actualizado localmente' };
  },

  async eliminarLote(idOrUuid) {
    const lote = await obtenerLoteLocal(idOrUuid);
    const uuidParaApi = lote?.uuid_movil || idOrUuid;

    if (lote && lote.uuid_movil) {
      await softDeleteLote(lote.uuid_movil);
    }

    const token = await obtenerToken();
    if (!token || !URL_API) {
      return { success: true, message: 'Eliminado localmente, sincronización pendiente' };
    }

    try {
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${uuidParaApi}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (respuesta.ok) {
        return { success: true, message: 'Lote eliminado' };
      }
      return { success: true, message: 'Eliminado localmente, sincronización pendiente' };
    } catch {
      return { success: true, message: 'Eliminado localmente, sincronización pendiente' };
    }
  },

  // --- Catálogos (provincias / cantones / estaciones / cultivos) ---

  async obtenerCatalogos() {
    return obtenerCatalogosSeguro();
  },

  async obtenerProvincias() {
    const catalogos = await this.obtenerCatalogos();
    return catalogos.provincias;
  },

  async obtenerCantones(provinciaId) {
    const catalogos = await this.obtenerCatalogos();
    if (!provinciaId) return catalogos.cantones;

    const pid = Number(provinciaId);
    const filtrados = catalogos.cantones.filter(c => {
      const cid = Number(c.provincia_id ?? c.province_id ?? c.provinciaId);
      return cid === pid;
    });

    // Si no hay coincidencias exactas (por ejemplo, datos viejos con otro
    // formato de id) se devuelve la lista completa en vez de una vacía,
    // para que el usuario nunca se quede sin poder elegir nada.
    return filtrados.length > 0 ? filtrados : catalogos.cantones;
  },

  async obtenerEstaciones() {
    const catalogos = await this.obtenerCatalogos();
    return catalogos.estaciones;
  },
};

export default lotesService;