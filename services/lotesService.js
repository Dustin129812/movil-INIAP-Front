import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

const obtenerToken = async () => {
  try {
    return await AsyncStorage.getItem('token_acceso');
  } catch {
    return null;
  }
};

export const lotesService = {
  async obtenerLotes() {
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
      console.error('Error obteniendo lotes:', error);
      return [];
    }
  },

  async obtenerLote(id) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/lotes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const datos = await respuesta.json();
      return datos.success ? datos.lote : null;
    } catch (error) {
      console.error('Error obteniendo lote:', error);
      return null;
    }
  },

  async crearLote(datosLote) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/lotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosLote),
      });
      return await respuesta.json();
    } catch (error) {
      console.error('Error creando lote:', error);
      return { success: false, message: 'Error de red' };
    }
  },

  async actualizarLote(id, datosLote) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/lotes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosLote),
      });
      return await respuesta.json();
    } catch (error) {
      console.error('Error actualizando lote:', error);
      return { success: false, message: 'Error de red' };
    }
  },

  async eliminarLote(id) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/lotes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return await respuesta.json();
    } catch (error) {
      console.error('Error eliminando lote:', error);
      return { success: false, message: 'Error de red' };
    }
  },

  async obtenerProvincias() {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/ubicacion/provincias`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const datos = await respuesta.json();
      return datos.success ? datos.provincias || [] : [];
    } catch (error) {
      console.error('Error obteniendo provincias:', error);
      return [];
    }
  },

  async obtenerCantones(provinciaId) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/ubicacion/cantones/${provinciaId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const datos = await respuesta.json();
      return datos.success ? datos.cantones || [] : [];
    } catch (error) {
      console.error('Error obteniendo cantones:', error);
      return [];
    }
  },

  async obtenerEstaciones() {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/ubicacion/estaciones`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const datos = await respuesta.json();
      return datos.success ? datos.estaciones || [] : [];
    } catch (error) {
      console.error('Error obteniendo estaciones:', error);
      return [];
    }
  },
};
