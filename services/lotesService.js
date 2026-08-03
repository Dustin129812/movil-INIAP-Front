import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

const obtenerToken = async () => {
  try {
    // Buscamos el token probando las claves más comunes para evitar fallos de coincidencia
    let token = await AsyncStorage.getItem('token_acceso');
    if (!token) token = await AsyncStorage.getItem('token');
    if (!token) token = await AsyncStorage.getItem('access_token');
    if (!token) token = await AsyncStorage.getItem('userToken');
    
    console.log('obtenerToken - Estado:', token ? 'ENCONTRADO' : 'NO ENCONTRADO');
    return token;
  } catch (error) {
    console.error('Error al obtener el token:', error);
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
      const datos = await respuesta.json();
      return datos.data || [];
    } catch (error) {
      console.error('Error obteniendo lotes:', error);
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
      console.error('Error obteniendo lote:', error);
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
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(datosLote),
      });
      const datos = await respuesta.json();
      console.log('crearLote - Status:', respuesta.status, 'Datos:', JSON.stringify(datos));
      
      if (respuesta.status === 201 || respuesta.status === 200) {
        return { success: true, data: datos.data, message: datos.message };
      }
      return { success: false, message: datos.message || 'Error desconocido', error: datos };
    } catch (error) {
      console.error('Error creando lote:', error);
      return { success: false, message: 'Error de red: ' + error.message };
    }
  },

  async actualizarLote(id, datosLote) {
    try {
      const token = await obtenerToken();
      console.log('actualizarLote - Enviando a:', `${URL_API}/agrodecide/lotes/${id}`);
      console.log('actualizarLote - Datos:', JSON.stringify(datosLote));

      const respuesta = await fetch(`${URL_API}/agrodecide/lotes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(datosLote),
      });

      // Verificar si la respuesta es JSON válido
      const contentType = respuesta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const texto = await respuesta.text();
        console.error('actualizarLote - Respuesta HTML (no JSON):', texto.substring(0, 500));
        return { success: false, message: 'El servidor devolvió una respuesta no válida (HTML)', error: texto };
      }

      const datos = await respuesta.json();
      console.log('actualizarLote - Respuesta:', respuesta.status, JSON.stringify(datos));

      if (respuesta.ok && datos.data) {
        return { success: true, data: datos.data, message: datos.message };
      }
      return { success: false, message: datos.message || 'Error al actualizar', error: datos };
    } catch (error) {
      console.error('Error actualizando lote:', error);
      return { success: false, message: 'Error de red: ' + error.message };
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
      console.error('Error eliminando lote:', error);
      return { success: false, message: 'Error de red' };
    }
  },

  // Obtiene todos los catálogos de ubicación de una vez (provincias, cantones, estaciones)
  async obtenerCatalogos() {
    try {
      const token = await obtenerToken();
      console.log('obtenerCatalogos - Token:', token ? 'EXISTS' : 'NULL/EMPTY');
      console.log('obtenerCatalogos - URL:', `${URL_API}/agrodecide/catalogosMobile`);

      const respuesta = await fetch(`${URL_API}/agrodecide/catalogosMobile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      console.log('obtenerCatalogos - Status:', respuesta.status);

      if (!respuesta.ok) {
        const texto = await respuesta.text();
        console.error('obtenerCatalogos - Error:', texto.substring(0, 500));
        return { provincias: [], cantones: [], estaciones: [] };
      }

      const datos = await respuesta.json();
      console.log('obtenerCatalogos - Datos success:', datos.success, 'provincias:', datos.data?.provincias?.length);

      if (datos.success && datos.data) {
        return {
          provincias: datos.data.provincias || [],
          cantones: datos.data.cantones || [],
          estaciones: datos.data.estaciones || [],
        };
      }
      return { provincias: [], cantones: [], estaciones: [] };
    } catch (error) {
      console.error('Error obteniendo catálogos:', error);
      return { provincias: [], cantones: [], estaciones: [] };
    }
  },

  async obtenerProvincias() {
    const catalogos = await this.obtenerCatalogos();
    return catalogos.provincias;
  },

  async obtenerCantones(provinciaId) {
    const catalogos = await this.obtenerCatalogos();
    // Si no hay provinciaId o el filtro devuelve vacío, devolver todos los cantones
    if (!provinciaId) {
      return catalogos.cantones;
    }
    const filtrados = catalogos.cantones.filter(c => c.provincia_id === provinciaId);
    // Si no hay cantones con ese provincia_id, devolver todos ( Workaround: datos sin provincia_id )
    return filtrados.length > 0 ? filtrados : catalogos.cantones;
  },

  async obtenerEstaciones() {
    const catalogos = await this.obtenerCatalogos();
    return catalogos.estaciones;
  },
};