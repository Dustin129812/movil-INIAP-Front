import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

const URL_API = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

const CLAVES = {
  TOKEN: 'token_acceso',
  USUARIO: 'datos_usuario',
};

export function useApi() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const guardarSesion = useCallback(async (token, usuario) => {
    try {
      await AsyncStorage.setItem(CLAVES.TOKEN, token);
      await AsyncStorage.setItem(CLAVES.USUARIO, JSON.stringify(usuario));
    } catch (e) {
      console.warn('Error guardando sesion:', e);
    }
  }, []);

  const limpiarSesion = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CLAVES.TOKEN);
      await AsyncStorage.removeItem(CLAVES.USUARIO);
    } catch (e) {
      console.warn('Error limpiando sesion:', e);
    }
  }, []);

  const login = useCallback(async (credenciales, uuid, modelo, sistemaOperativo) => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credenciales.email,
          password: credenciales.password,
          uuid,
          modelo: modelo || null,
          sistema_operativo: sistemaOperativo || null,
        }),
      });

      const datos = await respuesta.json();

      if (datos.success && datos.TOKEN) {
        await guardarSesion(datos.TOKEN, {
          ID: datos.ID,
          NOMBRE: datos.NOMBRE,
          CORREO: datos.CORREO,
        });
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

  const registrar = useCallback(async (datosRegistro) => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro),
      });

      const datos = await respuesta.json();

      if (datos.success && datos.TOKEN) {
        await guardarSesion(datos.TOKEN, {
          ID: datos.ID,
          NOMBRE: datos.NOMBRE,
          CORREO: datos.CORREO,
        });
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

  const cerrarSesion = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(CLAVES.TOKEN);
      if (token) {
        await fetch(`${URL_API}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn('Error en logout:', error);
    } finally {
      await limpiarSesion();
    }
  }, [limpiarSesion]);

  const estaAutenticado = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(CLAVES.TOKEN);
      return !!token;
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

  return {
    cargando,
    error,
    login,
    registrar,
    cerrarSesion,
    estaAutenticado,
    obtenerUsuarioGuardado,
  };
}