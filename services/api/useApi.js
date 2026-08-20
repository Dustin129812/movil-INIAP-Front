import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';

const URL_API = process.env.EXPO_PUBLIC_API_URL;

const CLAVES = {
  TOKEN: 'token_acceso',
  USUARIO: 'datos_usuario',
};

// SecureStore keys (used by sync services for consistency)
export const SECURE_STORE_KEYS = {
  TOKEN: 'userToken',
  USER_ID: 'offlineUserId',
};

const validarToken = (token) => {
  if (token === null || token === undefined) {
    return { valido: false, razon: 'Token null/undefined' };
  }
  if (typeof token !== 'string') {
    return { valido: false, razon: 'Token no es string' };
  }
  if (token === '[object Object]') {
    return { valido: false, razon: 'Token formato inválido' };
  }
  if (token.trim() === '') {
    return { valido: false, razon: 'Token vacío' };
  }
  if (token.length < 20) {
    return { valido: false, razon: 'Token muy corto' };
  }
  return { valido: true };
};

/**
 * Obtiene token de SecureStore (preferido) o AsyncStorage (legacy).
 * Si lo encuentra en AsyncStorage, lo migra a SecureStore.
 */
const obtenerTokenFlexible = async () => {
  try {
    // Primero SecureStore
    let token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.TOKEN);
    if (token && validarToken(token).valido) {
      return { token, source: 'secure' };
    }
    // Fallback AsyncStorage (legacy)
    token = await AsyncStorage.getItem(CLAVES.TOKEN);
    if (token && validarToken(token).valido) {
      // Migrar a SecureStore
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.TOKEN, token);
      return { token, source: 'async' };
    }
    return { token: null, source: null };
  } catch (e) {
    return { token: null, source: null };
  }
};

const guardarSesionSegura = async (token, usuario) => {
  try {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.TOKEN, token);
    if (usuario?.ID) {
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.USER_ID, String(usuario.ID));
    }
    return true;
  } catch (e) {
    // console removed
    return false;
  }
};

const limpiarSesionCompleta = async () => {
  try {
    await AsyncStorage.removeItem(CLAVES.TOKEN);
    await AsyncStorage.removeItem(CLAVES.USUARIO);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.TOKEN);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_ID);
  } catch (e) {
    // console removed
  }
};

const fetchConAuth = async (url, opciones = {}) => {
  const { token } = await obtenerTokenFlexible();
  const validacion = validarToken(token);

  if (!validacion.valido) {
    await limpiarSesionCompleta();
    throw new Error('TOKEN_INVALIDO');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...opciones.headers,
  };

  const respuesta = await fetch(url, {
    ...opciones,
    headers,
  });

  if (respuesta.status === 401) {
    await limpiarSesionCompleta();
    throw new Error('TOKEN_RECHAZADO');
  }

  return respuesta;
};

export const verificarTokenAlIniciar = async () => {
  try {
    const { token } = await obtenerTokenFlexible();

    if (!token) {
      return false;
    }

    if (typeof token !== 'string' || token === '[object Object]' || token.length < 20) {
      await limpiarSesionCompleta();
      return false;
    }

    return true;
  } catch (error) {
    await limpiarSesionCompleta();
    return false;
  }
};

export function useApi() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const guardarSesion = useCallback(async (token, usuario) => {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }
      // AsyncStorage (for auth context compatibility)
      await AsyncStorage.setItem(CLAVES.TOKEN, token);
      await AsyncStorage.setItem(CLAVES.USUARIO, JSON.stringify(usuario));
      // SecureStore (for sync services)
      await guardarSesionSegura(token, usuario);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const limpiarSesion = useCallback(async () => {
    await limpiarSesionCompleta();
  }, []);

  const login = useCallback(async (credenciales, uuid, modelo, sistemaOperativo) => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_API}/agrodecide/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credenciales.email,
          password: credenciales.password,
          device_uuid: uuid || null,
        }),
      });

      const datos = await respuesta.json();

      if (datos.success && datos.data?.token) {
        const token = datos.data.token;
        const user = datos.data.user;
        const datosReasignados = datos.data.datos_reasignados || 0;
        const guardado = await guardarSesion(token, {
          ID: user.id,
          NOMBRE: user.name,
          CORREO: user.email,
          DNI: user.dni,
        });
        if (!guardado) {
          setCargando(false);
          return { success: false, message: 'Error al guardar sesión' };
        }
        setCargando(false);
        return { success: true, ID: user.id, NOMBRE: user.name, CORREO: user.email, DNI: user.dni, datos_reasignados: datosReasignados };
      }

      setCargando(false);
      return { success: false, message: datos.message || 'Credenciales incorrectas' };
    } catch (error) {
      setError('Error de red');
      setCargando(false);
      return { success: false, message: 'Error de red' };
    }
  }, [guardarSesion]);

  const loginInvitado = useCallback(async (uuid, modelo, sistemaOperativo, hardware) => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_API}/agrodecide/guest/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_uuid: uuid,
          modelo: modelo || null,
          sistema_operativo: sistemaOperativo || null,
          hardware: hardware || null,
        }),
      });

      const datos = await respuesta.json();

      if (datos.access_token) {
        const token = datos.access_token;
        const guardado = await guardarSesion(token, {
          ID: uuid,
          NOMBRE: 'Invitado',
          CORREO: '',
          esInvitado: true,
        });
        if (!guardado) {
          setCargando(false);
          return { success: false, message: 'Error al guardar sesión' };
        }
        setCargando(false);
        return { success: true, TOKEN: token };
      }

      setCargando(false);
      return { success: false, message: datos.message || 'No se pudo iniciar como invitado' };
    } catch (error) {
      setError('Error de red');
      setCargando(false);
      return { success: false, message: 'Error de red' };
    }
  }, [guardarSesion]);

  const cerrarSesion = useCallback(async () => {
    try {
      const { token } = await obtenerTokenFlexible();
      if (token) {
        try {
          await fetch(`${URL_API}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (e) {
          // Endpoint de logout no existe, continuar con limpieza local
        }
      }
    } catch (error) {
      // Ignorar errores en logout
    } finally {
      await limpiarSesionCompleta();
    }
  }, []);

  const estaAutenticado = useCallback(async () => {
    try {
      const { token } = await obtenerTokenFlexible();
      const validacion = validarToken(token);
      return validacion.valido;
    } catch {
      return false;
    }
  }, []);

  const obtenerUsuarioGuardado = useCallback(async () => {
    try {
      const datos = await AsyncStorage.getItem(CLAVES.USUARIO);
      if (datos) {
        return JSON.parse(datos);
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const peticionAutenticada = useCallback(async (url, opciones = {}) => {
    try {
      const respuesta = await fetchConAuth(`${URL_API}${url}`, opciones);
      return await respuesta.json();
    } catch (error) {
      if (error.message === 'TOKEN_INVALIDO' || error.message === 'TOKEN_RECHAZADO') {
        return { success: false, requireLogin: true };
      }
      throw error;
    }
  }, []);

  return {
    cargando,
    error,
    login,
    loginInvitado,
    cerrarSesion,
    estaAutenticado,
    obtenerUsuarioGuardado,
    peticionAutenticada,
  };
}
