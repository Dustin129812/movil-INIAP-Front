import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useApi, verificarTokenAlIniciar } from './useApi';
import { useDeviceInfo } from './useDeviceInfo';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [esInvitado, setEsInvitado] = useState(false);
  const api = useApi();
  const { deviceInfo } = useDeviceInfo();

  // Verificar token UNA SOLA VEZ al montar el provider
  useEffect(() => {
    verificarTokenAlIniciar();
  }, []);

  // Inicializar auth
  useEffect(() => {
    let timeoutId;
    let mounted = true;

    async function inicializarAuth() {
      try {
        const [usuarioGuardado, tieneAuth] = await Promise.all([
          api.obtenerUsuarioGuardado(),
          api.estaAutenticado(),
        ]);

        if (mounted) {
          setUsuario(usuarioGuardado);
        }
      } catch (error) {
        console.warn('Error inicializando auth:', error);
        if (mounted) {
          setUsuario(null);
        }
      } finally {
        if (mounted) {
          setCargando(false);
        }
      }
    }

    // Timeout de seguridad - 8 segundos máximo esperando carga
    timeoutId = setTimeout(() => {
      if (mounted) {
        setCargando(false);
      }
    }, 8000);

    inicializarAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    // Obtener info actual del dispositivo justo antes del login
    const uuid = deviceInfo.uuid || '';
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
      setEsInvitado(false);
      return { success: true };
    }
    return { success: false, message: respuesta.message };
  }, [deviceInfo, api]);

  const loginInvitado = useCallback(async (uuid, modelo, sistemaOperativo, hardware) => {
    try {
      const respuesta = await api.loginInvitado(uuid, modelo, sistemaOperativo, hardware);

      if (respuesta.success && respuesta.TOKEN) {
        setUsuario({
          ID: uuid,
          NOMBRE: 'Invitado',
          CORREO: '',
          esInvitado: true,
        });
        setEsInvitado(true);
        return { success: true };
      }

      return { success: false, message: respuesta.message || 'No se pudo iniciar sesión como invitado' };
    } catch (error) {
      console.error('Error en login invitado:', error);
      return { success: false, message: 'Error al iniciar como invitado' };
    }
  }, [api]);

  const registrar = useCallback(async (nombre, email, password) => {
    // Obtener info actual del dispositivo justo antes del registro
    const uuid = deviceInfo.uuid || '';
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
      setEsInvitado(false);
      return { success: true };
    }
    return { success: false, message: respuesta.message };
  }, [deviceInfo, api]);

  const cerrarSesion = useCallback(async () => {
    await api.cerrarSesion();
    setUsuario(null);
    setEsInvitado(false);
  }, [api]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        autenticado: !!usuario,
        esInvitado,
        dispositivoId: deviceInfo.uuid,
        modelo: deviceInfo.modelo,
        sistemaOperativo: deviceInfo.sistemaOperativo,
        login,
        loginInvitado,
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