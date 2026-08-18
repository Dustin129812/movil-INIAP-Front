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

export const colaboradoresService = {
  async obtenerColaboradores(proyectoId) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${proyectoId}/colaboradores`, {
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
      return datos.data || [];
    } catch (error) {
      // console removed
      return [];
    }
  },

  async agregarColaboradores(proyectoId, userIds) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${proyectoId}/colaboradores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ user_ids: userIds }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.success) {
        return { success: true, data: datos.data };
      }
      return { success: false, message: datos.message || 'Error al agregar colaboradores' };
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
    }
  },

  async eliminarColaborador(proyectoId, userId) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${proyectoId}/colaboradores/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.success) {
        return { success: true };
      }
      return { success: false, message: datos.message || 'Error al eliminar colaborador' };
    } catch (error) {
      // console removed
      return { success: false, message: 'Error de red' };
    }
  },

  async buscarUsuarios(termino) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/colaboradores/buscar?termino=${encodeURIComponent(termino)}`, {
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
      return datos.data || [];
    } catch (error) {
      // console removed
      return [];
    }
  },
};
