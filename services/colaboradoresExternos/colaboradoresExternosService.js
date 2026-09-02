import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_API = process.env.EXPO_PUBLIC_API_URL;

const obtenerToken = async () => {
  try {
    let token = await AsyncStorage.getItem('token_acceso');
    if (!token) token = await AsyncStorage.getItem('token');
    if (!token) token = await AsyncStorage.getItem('access_token');
    if (!token) token = await AsyncStorage.getItem('userToken');

    return token;
  } catch (_error) {
    return null;
  }
};

const leerJsonSeguro = async (respuesta) => {
  try {
    return await respuesta.json();
  } catch (_error) {
    return null;
  }
};

const extraerLista = (datos) => {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.data)) return datos.data;
  if (Array.isArray(datos?.data?.data)) return datos.data.data;
  return [];
};

const obtenerMensajeError = (datos, fallback) => {
  if (datos?.message) return datos.message;
  if (datos?.error) return datos.error;
  if (datos?.errors) {
    const primeraClave = Object.keys(datos.errors)[0];
    const primerError = datos.errors[primeraClave];
    if (Array.isArray(primerError) && primerError.length > 0) return primerError[0];
  }
  return fallback;
};

const headersJson = (token) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': token ? `Bearer ${token}` : '',
});

export const colaboradoresExternosService = {
  async obtenerColaboradoresExternos(proyectoId) {
    if (!proyectoId) return [];

    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${proyectoId}/colaboradores-externos`, {
        headers: headersJson(token),
      });

      if (!respuesta.ok) {
        return [];
      }

      const datos = await leerJsonSeguro(respuesta);
      return extraerLista(datos);
    } catch (_error) {
      return [];
    }
  },

  async buscarColaboradoresExternos(termino) {
    try {
      const token = await obtenerToken();
      const terminoLimpio = termino?.trim();
      const url = terminoLimpio
        ? `${URL_API}/agrodecide/colaboradores-externos/buscar?termino=${encodeURIComponent(terminoLimpio)}`
        : `${URL_API}/agrodecide/colaboradores-externos/buscar`;

      const respuesta = await fetch(url, {
        headers: headersJson(token),
      });

      if (!respuesta.ok) {
        return [];
      }

      const datos = await leerJsonSeguro(respuesta);
      return extraerLista(datos);
    } catch (_error) {
      return [];
    }
  },

  async registrarColaboradorExterno({ ci, nombre_completo }) {
    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/colaboradores-externos`, {
        method: 'POST',
        headers: headersJson(token),
        body: JSON.stringify({ ci, nombre_completo }),
      });

      const datos = await leerJsonSeguro(respuesta);

      if (respuesta.ok) {
        return { success: true, data: datos?.data || datos };
      }

      return {
        success: false,
        message: obtenerMensajeError(datos, 'Error al registrar colaborador externo'),
      };
    } catch (_error) {
      return { success: false, message: 'Error de red' };
    }
  },

  async asociarColaboradorExterno(proyectoId, { colaborador_externo_id, participacion }) {
    if (!proyectoId) {
      return { success: false, message: 'No hay proyecto' };
    }

    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${proyectoId}/colaboradores-externos`, {
        method: 'POST',
        headers: headersJson(token),
        body: JSON.stringify({ colaborador_externo_id, participacion }),
      });

      const datos = await leerJsonSeguro(respuesta);

      if (respuesta.ok) {
        return { success: true, data: datos?.data || datos };
      }

      return {
        success: false,
        message: obtenerMensajeError(datos, 'Error al asociar colaborador externo'),
      };
    } catch (_error) {
      return { success: false, message: 'Error de red' };
    }
  },

  async eliminarColaboradorExterno(proyectoId, colaboradorExternoId) {
    if (!proyectoId) {
      return { success: false, message: 'No hay proyecto' };
    }

    try {
      const token = await obtenerToken();
      const respuesta = await fetch(`${URL_API}/agrodecide/proyectos/${proyectoId}/colaboradores-externos/${colaboradorExternoId}`, {
        method: 'DELETE',
        headers: headersJson(token),
      });

      const datos = await leerJsonSeguro(respuesta);

      if (respuesta.ok) {
        return { success: true, data: datos?.data || datos };
      }

      return {
        success: false,
        message: obtenerMensajeError(datos, 'Error al eliminar colaborador externo'),
      };
    } catch (_error) {
      return { success: false, message: 'Error de red' };
    }
  },
};
