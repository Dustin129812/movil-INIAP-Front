import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useApi } from './useApi';
import { useDevice } from './useDevice';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const api = useApi();
  const deviceInfo = useDevice();

  // Inicializar auth
  useEffect(() => {
    let timeoutId;

    async function inicializarAuth() {
      try {
        const [usuarioGuardado, tieneAuth] = await Promise.all([
          api.obtenerUsuarioGuardado(),
          api.estaAutenticado(),
        ]);

        setUsuario(usuarioGuardado);
      } catch (error) {
        console.warn('Error inicializando auth:', error);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }

    // Timeout de seguridad
    timeoutId = setTimeout(() => {
      setCargando(false);
    }, 5000);

    inicializarAuth();

    return () => clearTimeout(timeoutId);
  }, []);

  const login = useCallback(async (email, password) => {
    // Obtener info actual del dispositivo justo antes del login
    const uuid = deviceInfo.dispositivoId || '';
    const modeloDispositivo = deviceInfo.modelo || undefined;
    const sisOp = deviceInfo.sistemaOperativo || undefined;

    const respuesta = await api.login(
      { email, password },
      uuid,
      modeloDispositivo,
      sisOp
    );

    if (respuesta.success && respuesta.ID) {
      setUsuario({ ID: respuesta.ID, NOMBRE: respuesta.NOMBRE, CORREO: respuesta.CORREO });
      return { success: true };
    }
    return { success: false, message: respuesta.message };
  }, [deviceInfo, api]);

  const registrar = useCallback(async (nombre, email, password) => {
    // Obtener info actual del dispositivo justo antes del registro
    const uuid = deviceInfo.dispositivoId || '';
    const modeloDispositivo = deviceInfo.modelo || undefined;
    const sisOp = deviceInfo.sistemaOperativo || undefined;

    const respuesta = await api.registrar({
      name: nombre,
      email,
      password,
      uuid,
      modelo: modeloDispositivo,
      sistema_operativo: sisOp,
    });

    if (respuesta.success && respuesta.ID) {
      setUsuario({ ID: respuesta.ID, NOMBRE: respuesta.NOMBRE, CORREO: respuesta.CORREO });
      return { success: true };
    }
    return { success: false, message: respuesta.message };
  }, [deviceInfo, api]);

  const cerrarSesion = useCallback(async () => {
    await api.cerrarSesion();
    setUsuario(null);
  }, [api]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        autenticado: !!usuario,
        dispositivoId: deviceInfo.dispositivoId,
        modelo: deviceInfo.modelo,
        sistemaOperativo: deviceInfo.sistemaOperativo,
        login,
        registrar,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}