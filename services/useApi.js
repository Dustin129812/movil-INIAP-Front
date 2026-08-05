import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

const URL_API = process.env.EXPO_PUBLIC_API_URL;

const CLAVES = {
  TOKEN: 'token_acceso',
  USUARIO: 'datos_usuario',
};

// ============================================================
// VALIDACIÓN ESTRICTA DEL TOKEN
// ============================================================
const validarToken = (token) => {
  if (token === null || token === undefined) {
    return { valido: false, razon: 'Token es null/undefined' };
  }
  if (typeof token !== 'string') {
    return { valido: false, razon: 'Token no es string' };
  }
  if (token === '[object Object]') {
    return { valido: false, razon: 'Token tiene formato inválido [object Object]' };
  }
  if (token.trim() === '') {
    return { valido: false, razon: 'Token está vacío' };
  }
  // JWT típicos tienen 3 partes separadas por punto, largo mínimo ~50 chars
  if (token.length < 20) {
    return { valido: false, razon: 'Token muy corto' };
  }
  return { valido: true };
};

// ============================================================
// LIMPIEZA DE SESIÓN CORRECTA (solo elimina el token, no todo)
// ============================================================
const limpiarSesionCompleta = async () => {
  try {
    await AsyncStorage.removeItem(CLAVES.TOKEN);
    await AsyncStorage.removeItem(CLAVES.USUARIO);
  } catch (e) {
    console.warn('Error limpiando sesion:', e);
  }
};

// ============================================================
// FETCH CON MANEJO DE 401 (token expirado/inválido)
// ============================================================
const fetchConAuth = async (url, opciones = {}) => {
  const token = await AsyncStorage.getItem(CLAVES.TOKEN);
  const validacion = validarToken(token);

  if (!validacion.valido) {
    console.warn('Token inválido detected:', validacion.razon);
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

  // Si el backend responde 401, el token fue rechazado
  if (respuesta.status === 401) {
    console.warn('Backend rechazó el token (401) - limpiando sesion');
    await limpiarSesionCompleta();
    throw new Error('TOKEN_RECHAZADO');
  }

  return respuesta;
};

// ============================================================
// FUNCIÓN AUXILIAR: Verificar y limpiar token corrupto al iniciar
// SOLO se llama desde useAuth, NO desde useApi
// ============================================================
export const verificarTokenAlIniciar = async () => {
  try {
    const token = await AsyncStorage.getItem(CLAVES.TOKEN);

    // Token null/undefined es normal para invitados - NO es error
    if (!token) {
      return false;
    }

    // Token existe pero es inválido - warning y limpiar
    if (typeof token !== 'string' || token === '[object Object]' || token.length < 20) {
      console.warn('Token corrupto detectado, limpiando...');
      await limpiarSesionCompleta();
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Error verificando token al iniciar:', error);
    await limpiarSesionCompleta();
    return false;
  }
};

export function useApi() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const guardarSesion = useCallback(async (token, usuario) => {
    try {
      // Validar que el token sea string antes de guardar
      if (!token || typeof token !== 'string') {
        console.warn('Intento de guardar token inválido:', typeof token);
        return false;
      }
      await AsyncStorage.setItem(CLAVES.TOKEN, token);
      await AsyncStorage.setItem(CLAVES.USUARIO, JSON.stringify(usuario));
      return true;
    } catch (e) {
      console.warn('Error guardando sesion:', e);
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
          correo_institucional: credenciales.email,
          password: credenciales.password,
        }),
      });

      const datos = await respuesta.json();

      if (datos.success && datos.data?.token) {
        const token = datos.data.token;
        const user = datos.data.user;
        const guardado = await guardarSesion(token, {
          ID: user.id,
          NOMBRE: user.nombre,
          CORREO: user.correo_institucional,
        });
        if (!guardado) {
          setCargando(false);
          return { success: false, message: 'Error al guardar sesion' };
        }
        setCargando(false);
        return { success: true, ID: user.id, NOMBRE: user.nombre, CORREO: user.correo_institucional };
      }

      setCargando(false);
      return { success: false, message: datos.message || 'Credenciales incorrectas' };
    } catch (error) {
      const mensajeError = 'Error de red';
      setError(mensajeError);
      setCargando(false);
      return { success: false, message: mensajeError };
    }
  }, [guardarSesion]);

  const registrar = useCallback(async (datosRegistro) => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro),
      });

      const datos = await respuesta.json();

      if (datos.success && datos.TOKEN) {
        const guardado = await guardarSesion(datos.TOKEN, {
          ID: datos.ID,
          NOMBRE: datos.NOMBRE,
          CORREO: datos.CORREO,
        });
        if (!guardado) {
          setCargando(false);
          return { success: false, message: 'Error al guardar sesion' };
        }
      }

      setCargando(false);
      return datos;
    } catch (error) {
      const mensajeError = 'Error de red';
      setError(mensajeError);
      setCargando(false);
      return { success: false, message: mensajeError };
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
        });
        if (!guardado) {
          setCargando(false);
          return { success: false, message: 'Error al guardar sesion' };
        }
        setCargando(false);
        return { success: true, TOKEN: token };
      }

      setCargando(false);
      return { success: false, message: datos.message || 'No se pudo iniciar como invitado' };
    } catch (error) {
      const mensajeError = 'Error de red';
      setError(mensajeError);
      setCargando(false);
      return { success: false, message: mensajeError };
    }
  }, [guardarSesion]);

  const cerrarSesion = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(CLAVES.TOKEN);
      if (token) {
        // Intentar logout en backend (puede fallar si el endpoint no existe)
        try {
          await fetch(`${URL_API}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (e) {
          // Endpoint de logout no existe en AgroDecide, continuar con limpieza local
        }
      }
    } catch (error) {
      console.warn('Error en logout:', error);
    } finally {
      await limpiarSesionCompleta();
    }
  }, []);

  const estaAutenticado = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(CLAVES.TOKEN);
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

  // Petición autenticada protegida (para usar en componentes)
  const peticionAutenticada = useCallback(async (url, opciones = {}) => {
    try {
      const respuesta = await fetchConAuth(`${URL_API}${url}`, opciones);
      return await respuesta.json();
    } catch (error) {
      if (error.message === 'TOKEN_INVALIDO' || error.message === 'TOKEN_RECHAZADO') {
        // Notificar a la app que debe redirigir al login
        return { success: false, requireLogin: true };
      }
      throw error;
    }
  }, []);

  return {
    cargando,
    error,
    login,
    registrar,
    loginInvitado,
    cerrarSesion,
    estaAutenticado,
    obtenerUsuarioGuardado,
    peticionAutenticada,
  };
}
