import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import localLotesService from './localLotesService';
import { useApi, verificarTokenAlIniciar } from './useApi';
import { useDeviceInfo } from './useDeviceInfo';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [esInvitado, setEsInvitado] = useState(false);
  const api = useApi();
  const { deviceInfo } = useDeviceInfo();

  // Verificar token UNA SOLA VEZ al montar el provider
  useEffect(() => {
    verificarTokenAlIniciar();
  }, []);

  // Inicializar auth y base de datos local
  useEffect(() => {
    let timeoutId;
    let hideTimeoutId;
    let mounted = true;
    let inicializacionCompleta = false;
    
    // ⏱️ Aumentado a 3.5 segundos para que la animación se luzca por completo al iniciar
    const TIEMPO_MINIMO_CARGA = 3500; 

    function verificarOCultar() {
      if (mounted && inicializacionCompleta) {
        setCargando(false);
      }
    }

    async function inicializarAuth() {
      try {
        const [usuarioGuardado, tieneAuth] = await Promise.all([
          api.obtenerUsuarioGuardado(),
          api.estaAutenticado(),
        ]);

        if (mounted) {
          setUsuario(usuarioGuardado);
          // Inicializar base de datos local si hay usuario autenticado
          if (usuarioGuardado || tieneAuth) {
            await localLotesService.inicializarBaseDatosLocal();
          }
        }
      } catch (error) {
        if (mounted) {
          setUsuario(null);
        }
      } finally {
        if (mounted) {
          inicializacionCompleta = true;
          verificarOCultar();
        }
      }
    }

    // Timeout de seguridad - 8 segundos máximo esperando carga
    timeoutId = setTimeout(() => {
      if (mounted) {
        inicializacionCompleta = true;
        setCargando(false);
      }
    }, 8000);

    inicializarAuth();

    // Tiempo mínimo de carga ampliado para apreciar la animación
    hideTimeoutId = setTimeout(() => {
      if (mounted) {
        inicializacionCompleta = true;
        verificarOCultar();
      }
    }, TIEMPO_MINIMO_CARGA);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      clearTimeout(hideTimeoutId);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setCargandoLogin(true);
    try {
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
        await localLotesService.inicializarBaseDatosLocal();
        await new Promise(resolve => setTimeout(resolve, 3000));//Tiempo de carga
        return { success: true };
      }
      return { success: false, message: respuesta.message };
    } finally {
      setCargandoLogin(false);
    }
  }, [deviceInfo, api]);

  // También se usa para login con merge (device_uuid)
  const loginConMerge = useCallback(async (email, password, deviceUuid) => {
    setCargandoLogin(true);
    try {
      const respuesta = await api.login(
        { email, password },
        deviceUuid,
        null,
        null
      );

      if (respuesta.success && respuesta.ID) {
        setUsuario({ ID: respuesta.ID, NOMBRE: respuesta.NOMBRE, CORREO: respuesta.CORREO });
        setEsInvitado(false);
        await localLotesService.inicializarBaseDatosLocal();
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Retornar info de merge si la hay
        const datosReasignados = respuesta.datos_reasignados || 0;
        return { success: true, datosReasignados };
      }
      return { success: false, message: respuesta.message };
    } finally {
      setCargandoLogin(false);
    }
  }, [api]);

  const loginInvitado = useCallback(async (uuid, modelo, sistemaOperativo, hardware) => {
    setCargandoLogin(true);
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
        await localLotesService.inicializarBaseDatosLocal();
        // Esperar un poco más para que se vea la animación
        await new Promise(resolve => setTimeout(resolve, 3000));
        return { success: true };
      }

      return { success: false, message: respuesta.message || 'No se pudo iniciar sesión como invitado' };
    } catch (error) {
      return { success: false, message: 'Error al iniciar como invitado' };
    } finally {
      setCargandoLogin(false);
    }
  }, [api]);

  const registrar = useCallback(async (nombre, email, password) => {
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
        cargandoLogin,
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