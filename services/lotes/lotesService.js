import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerLotesLocales } from '../../db/client';

const URL_API = process.env.EXPO_PUBLIC_API_URL;

const obtenerToken = async () => {
  try {
    let token = await AsyncStorage.getItem('token_acceso');
    if (!token) token = await AsyncStorage.getItem('token');
    if (!token) token = await AsyncStorage.getItem('access_token');
    if (!token) token = await AsyncStorage.getItem('userToken');
    // console.log removed
    return token;
  } catch (error) {
    // console removed
    return null;
  }
};

export const lotesService = {
  async obtenerLotes() {
    try {
      // Obtener datos locales primero (fuente de verdad offline)
      const lotesLocales = await obtenerLotesLocales();
      const localesMap = new Map(
        lotesLocales.map(l => [l.uuid_movil, l])
      );

      const token = await obtenerToken();

      // Si no hay token, retornar locales
      if (!token) {
        return lotesLocales;
      }

      let datosApi = [];
      try {
        const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos.data && datos.data.length > 0) {
            datosApi = datos.data;
          } else if (datos.lotes && datos.lotes.length > 0) {
            datosApi = datos.lotes;
          } else if (datos.result && datos.result.length > 0) {
            datosApi = datos.result;
          }
        }
      } catch (apiErr) {
        // Ignorar errores de API
      }

      // Si no hay datos de API, retornar locales
      if (datosApi.length === 0) {
        return lotesLocales;
      }

      // UNIÓN de ambas fuentes:
      // 1. Empezar con mapa vacío
      // 2. Agregar todos los de API
      // 3. Para cada local, si existe en API → sobrescribir con versión combinada
      //    si NO existe en API → agregar tal cual (lote local pendiente de sync)
      const mergedMap = new Map();

      // Primero, agregar todos los de API (solo si tienen uuid_movil válido)
      for (const loteApi of datosApi) {
        if (loteApi.uuid_movil) {
          mergedMap.set(loteApi.uuid_movil, loteApi);
        }
      }

      // Luego, agregar/sobrescribir con datos locales
      for (const [uuid, loteLocal] of localesMap) {
        if (uuid) {
          if (mergedMap.has(uuid)) {
            // Existe en API: combinar API + estado local preservado
            const loteApi = mergedMap.get(uuid);
            mergedMap.set(uuid, {
              ...loteApi,
              estado_verificacion: loteLocal.estado_verificacion || loteApi.estado_verificacion || 'pendiente',
            });
          } else {
            // NO existe en API: lote local pendiente de sync, agregar tal cual
            mergedMap.set(uuid, loteLocal);
          }
        }
      }

      // Filtrar cualquier entrada con key inválida y convertir a array
      const result = Array.from(mergedMap.values()).filter(l => l && (l.uuid_movil || l.id));

      return result;
    } catch (error) {
      // En caso de error, retornar datos locales
      const lotesLocales = await obtenerLotesLocales();
      return lotesLocales;
    }
  },

  async obtenerLote(id) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const datos = await respuesta.json();
      return datos.data || null;
    } catch (error) {
      // console removed
      return null;
    }
  },

  async crearLote(datosLote) {
    try {
      const token = await obtenerToken();

      const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(datosLote),
      });

      const contentType = respuesta.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const texto = await respuesta.text();
        // console removed
        return { success: false, message: 'Respuesta no válida del servidor' };
      }

      const datos = await respuesta.json();

      if (respuesta.status === 201 || respuesta.status === 200) {
        return { success: true, data: datos.data, message: datos.message };
      }
      return { success: false, message: datos.message || 'Error desconocido' };
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
    }
  },

  async actualizarLote(id, datosLote) {
    try {
      const token = await obtenerToken();

      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(datosLote),
      });

      const contentType = respuesta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // console removed
        return { success: false, message: 'Respuesta no válida del servidor' };
      }

      const datos = await respuesta.json();

      if (respuesta.ok && datos.data) {
        return { success: true, data: datos.data, message: datos.message };
      }
      return { success: false, message: datos.message || 'Error al actualizar' };
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
    }
  },

  async cambiarEstadoLote(id, nuevoEstado) {
    return this.actualizarLote(id, { estado_verificacion: nuevoEstado });
  },

  async eliminarLote(uuid_movil) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${uuid_movil}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (respuesta.ok) {
        return { success: true, message: 'Lote eliminado' };
      } else {
        return { success: false, message: 'No se pudo eliminar el lote' };
      }
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red al eliminar lote' };
    }
  },

  async obtenerCatalogos() {
    try {
      const token = await obtenerToken();
      const url = `${URL_API}/agrodecide/catalogosMobile`;
      // console.log removed
      // console.log removed

      let respuesta;
      try {
        respuesta = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
      } catch (fetchError) {
        // console removed
        return { provincias: [], cantones: [], estaciones: [], cultivos: [] };
      }

      // console.log removed

      if (!respuesta.ok) {
        // console removed
        return { provincias: [], cantones: [], estaciones: [], cultivos: [] };
      }

      let datos;
      try {
        datos = await respuesta.json();
      } catch (jsonError) {
        const text = await respuesta.text().catch(() => 'No text');
        // console removed);
        return { provincias: [], cantones: [], estaciones: [], cultivos: [] };
      }

      // console.log removed

      if (datos && datos.success && datos.data) {
        return {
          provincias: datos.data.provincias || [],
          cantones: datos.data.cantones || [],
          estaciones: datos.data.estaciones || [],
          cultivos: datos.data.cultivos || [],
        };
      }
      // console removed
      return { provincias: [], cantones: [], estaciones: [], cultivos: [] };
    } catch (error) {
      // console removed
      return { provincias: [], cantones: [], estaciones: [], cultivos: [] };
    }
  },

  async obtenerProvincias() {
    const catalogos = await this.obtenerCatalogos();
    return catalogos.provincias;
  },

  async obtenerCantones(provinciaId) {
    const catalogos = await this.obtenerCatalogos();
    if (!provinciaId) {
      return catalogos.cantones;
    }
    const filtrados = catalogos.cantones.filter(c => c.provincia_id === provinciaId);
    return filtrados.length > 0 ? filtrados : catalogos.cantones;
  },

  async obtenerEstaciones() {
    const catalogos = await this.obtenerCatalogos();
    return catalogos.estaciones;
  },
};
