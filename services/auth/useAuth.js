import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import localLotesService from '../lotes/localLotesService';
import { sincronizarCatalogos } from '../catalogosSyncService';
import { useApi, verificarTokenAlIniciar } from '../api/useApi';
import { useDeviceInfo } from '../device/useDeviceInfo';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [esInvitado, setEsInvitado] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
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
          if (usuarioGuardado || tieneAuth) {
            await localLotesService.inicializarBaseDatosLocal();
            const resultadoCatalogos = await sincronizarCatalogos();
            if (!resultadoCatalogos.success && !resultadoCatalogos.offline) {
              console.warn('[Auth] No se pudo sincronizar catálogos:', resultadoCatalogos.message);
            }
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

    timeoutId = setTimeout(() => {
      if (mounted) {
        inicializacionCompleta = true;
        setCargando(false);
      }
    }, 8000);

    inicializarAuth();

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

  // Cuando el video termina, ocultar el splash
  useEffect(() => {
    if (videoEnded) {
      setCargando(false);
      setCargandoLogin(false);
      setVideoEnded(false);
    }
  }, [videoEnded]);

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
        const resultadoCatalogos = await sincronizarCatalogos();
        if (!resultadoCatalogos.success && !resultadoCatalogos.offline) {
          console.warn('[Login] No se sincronizaron catálogos:', resultadoCatalogos.message);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
        return { success: true };
      }
      return { success: false, message: respuesta.message };
    } finally {
      setCargandoLogin(false);
    }
  }, [deviceInfo, api]);

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
        const resultadoCatalogos = await sincronizarCatalogos();
        if (!resultadoCatalogos.success && !resultadoCatalogos.offline) {
          console.warn('[LoginMerge] No se sincronizaron catálogos:', resultadoCatalogos.message);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
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
        const resultadoCatalogos = await sincronizarCatalogos();
        if (!resultadoCatalogos.success && !resultadoCatalogos.offline) {
          console.warn('[LoginInvitado] No se sincronizaron catálogos:', resultadoCatalogos.message);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
        return { success: true };
      }
      return { success: false, message: respuesta.message || 'No se pudo iniciar como invitado' };
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
        setVideoEnded,
        login,
        loginConMerge,
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
