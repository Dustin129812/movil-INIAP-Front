import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!respuesta.ok) {
        // console removed
        return [];
      }

      const datos = await respuesta.json();

      // Manejar varios formatos de respuesta
      if (Array.isArray(datos)) return datos;
      if (datos.data) return datos.data;
      if (datos.lotes) return datos.lotes;
      if (datos.result) return datos.result;
      return datos;
    } catch (error) {
      // console removed
      return [];
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

  async eliminarLote(id) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return await respuesta.json();
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
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
