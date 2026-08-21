import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_API = process.env.EXPO_PUBLIC_API_URL;

const obtenerToken = async () => {
  try {
    let token = await AsyncStorage.getItem('token_acceso');
    if (!token) token = await AsyncStorage.getItem('token');
    if (!token) token = await AsyncStorage.getItem('access_token');
    if (!token) token = await AsyncStorage.getItem('userToken');

    return token;
  } catch (error) {
    // console removed
    return null;
  }
};

export const proyectosService = {
  async obtenerProyectos() {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!respuesta.ok) {
        return null;
      }

      const datos = await respuesta.json();

      if (Array.isArray(datos)) return datos;
      if (datos.data) return datos.data;
      if (datos.proyectos) return datos.proyectos;
      if (datos.result) return datos.result;
      return datos;
    } catch (error) {
      return [];
    }
  },

  async obtenerProyecto(id) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!respuesta.ok) {
        // console removed
        return null;
      }

      const datos = await respuesta.json();
      return datos.data || datos;
    } catch (error) {
      // console removed
      return null;
    }
  },

  async crearProyecto(datosProyecto) {
    try {
      const token = await obtenerToken();

      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(datosProyecto),
      });

      const contentType = respuesta.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const texto = await respuesta.text();
        // console removed
        return { success: false, message: 'Respuesta no válida del servidor' };
      }

      const datos = await respuesta.json();

      if (respuesta.status === 201 || respuesta.status === 200) {
        return { success: true, data: datos.data || datos.proyecto, message: datos.message };
      }
      return { success: false, message: datos.message || 'Error desconocido' };
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
    }
  },

  async actualizarProyecto(id, datosProyecto) {
    try {
      const token = await obtenerToken();

      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(datosProyecto),
      });

      const contentType = respuesta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // console removed
        return { success: false, message: 'Respuesta no válida del servidor' };
      }

      const datos = await respuesta.json();

      if (respuesta.ok) {
        return { success: true, data: datos.data, message: datos.message };
      }
      return { success: false, message: datos.message || 'Error al actualizar' };
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
    }
  },

  async eliminarProyecto(id) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!respuesta.ok) {
        return { success: false, message: 'Error al eliminar' };
      }

      const datos = await respuesta.json();
      return { success: true, ...datos };
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
    }
  },

  async obtenerCatalogos() {
    try {
      const token = await obtenerToken();

      const respuesta = await fetch(`${URL_API}/agrodecide/catalogosMobile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!respuesta.ok) {
        // console removed
        return { cultivos: [], variedades: [], provincias: [], cantones: [], estaciones: [] };
      }

      const datos = await respuesta.json();

      if (datos.success && datos.data) {
        return {
          cultivos: datos.data.cultivos || [],
          variedades: datos.data.variedades || [],
          provincias: datos.data.provincias || [],
          cantones: datos.data.cantones || [],
          estaciones: datos.data.estaciones || [],
        };
      }
      return { cultivos: [], variedades: [], provincias: [], cantones: [], estaciones: [] };
    } catch (error) {
      // console removed
      return { cultivos: [], variedades: [], provincias: [], cantones: [], estaciones: [] };
    }
  },

  async obtenerCultivos() {
    const catalogos = await this.obtenerCatalogos();
    return catalogos.cultivos;
  },

  async obtenerVariedades(cultivoId) {
    const catalogos = await this.obtenerCatalogos();
    if (!cultivoId) {
      return catalogos.variedades;
    }
    const filtradas = catalogos.variedades.filter(v => v.cultivo_id === cultivoId);
    return filtradas.length > 0 ? filtradas : catalogos.variedades;
  },
};
