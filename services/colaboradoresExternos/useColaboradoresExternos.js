import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buscarColaboradoresExternosLocales,
  crearProyectoColaboradorExternoRelacion,
  eliminarProyectoColaboradorExternoRelacion,
  obtenerColaboradoresExternosPorProyecto,
  registrarColaboradorExternoLocal,
} from '../../db';
import { colaboradoresExternosService } from './colaboradoresExternosService';

const ESTADOS_PROYECTO_LOCAL = ['draft', 'pending'];
const MENSAJE_PROYECTO_PENDIENTE = 'El proyecto esta pendiente de sincronizacion.';

const esProyectoPendienteSincronizacion = (syncStatus) => (
  ESTADOS_PROYECTO_LOCAL.includes(String(syncStatus || '').toLowerCase())
);

const obtenerTokenAutenticado = async () => {
  try {
    const usuarioRaw = await AsyncStorage.getItem('datos_usuario');
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    if (usuario?.esInvitado) {
      return null;
    }

    return (
      await AsyncStorage.getItem('token_acceso') ||
      await AsyncStorage.getItem('token') ||
      await AsyncStorage.getItem('access_token') ||
      await AsyncStorage.getItem('userToken')
    );
  } catch (_err) {
    return null;
  }
};

const obtenerCatalogo = (item) => (
  item?.colaborador_externo ||
  item?.colaboradorExterno ||
  item?.colaborador ||
  {}
);

const normalizarParaCarga = (item, origen) => {
  const catalogo = obtenerCatalogo(item);
  const serverId = item?.server_id ??
    catalogo?.server_id ??
    catalogo?.id ??
    (origen === 'backend' ? item?.colaborador_externo_id ?? item?.id : null);

  return {
    ...item,
    id: serverId || item?.colaborador_externo_id || item?.id || item?.uuid,
    local_id: item?.local_id || (origen === 'local' ? item?.id : null),
    server_id: serverId || null,
    nombre_completo:
      item?.nombre_completo ||
      catalogo?.nombre_completo ||
      item?.nombre ||
      catalogo?.nombre ||
      'Sin nombre',
    ci: item?.ci || catalogo?.ci || item?.cedula || catalogo?.cedula || '',
    participacion:
      item?.participacion ||
      item?.pivot?.participacion ||
      catalogo?.participacion ||
      '',
    origen,
  };
};

const sonElMismoColaborador = (actual, nuevo) => {
  if (actual.ci && nuevo.ci && String(actual.ci) === String(nuevo.ci)) {
    return true;
  }

  if (actual.server_id && nuevo.server_id && String(actual.server_id) === String(nuevo.server_id)) {
    return true;
  }

  return Boolean(actual.id && nuevo.id && String(actual.id) === String(nuevo.id));
};

const combinarColaboradoresExternos = (locales = [], backend = []) => {
  const combinados = [];

  const agregar = (item, origen) => {
    const normalizado = normalizarParaCarga(item, origen);
    const indice = combinados.findIndex((actual) => sonElMismoColaborador(actual, normalizado));

    if (indice < 0) {
      combinados.push(normalizado);
      return;
    }

    const existente = combinados[indice];
    combinados[indice] = {
      ...existente,
      ...normalizado,
      id: normalizado.id || existente.id || null,
      participacion: normalizado.participacion || existente.participacion,
      local_id: existente.local_id || normalizado.local_id,
      server_id: normalizado.server_id || existente.server_id,
      origen: normalizado.origen,
    };
  };

  locales.forEach((item) => agregar(item, 'local'));
  backend.forEach((item) => agregar(item, 'backend'));

  return combinados;
};

export const useColaboradoresExternos = (proyectoId, syncStatus = null) => {
  const [colaboradoresExternos, setColaboradoresExternos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const proyectoPendienteSincronizacion = esProyectoPendienteSincronizacion(syncStatus);

  const cargarColaboradoresExternos = useCallback(async () => {
    if (!proyectoId) return;

    setIsLoading(true);
    setError(null);
    try {
      const locales = await obtenerColaboradoresExternosPorProyecto(proyectoId);
      const token = await obtenerTokenAutenticado();

      if (!token || proyectoPendienteSincronizacion) {
        setColaboradoresExternos(Array.isArray(locales) ? locales : []);
        return;
      }

      const data = await colaboradoresExternosService.obtenerColaboradoresExternos(proyectoId);
      setColaboradoresExternos(
        combinarColaboradoresExternos(
          Array.isArray(locales) ? locales : [],
          Array.isArray(data) ? data : []
        )
      );
    } catch (_err) {
      setError('Error al cargar personal externo');
      try {
        const locales = await obtenerColaboradoresExternosPorProyecto(proyectoId);
        setColaboradoresExternos(Array.isArray(locales) ? locales : []);
      } catch (_localErr) {
        setColaboradoresExternos([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [proyectoId, proyectoPendienteSincronizacion]);

  const buscarColaboradoresExternos = useCallback(async (termino) => {
    setIsSearching(true);
    try {
      const token = await obtenerTokenAutenticado();

      if (!token || proyectoPendienteSincronizacion) {
        return await buscarColaboradoresExternosLocales(termino);
      }

      return await colaboradoresExternosService.buscarColaboradoresExternos(termino);
    } catch (_err) {
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [proyectoPendienteSincronizacion]);

  const registrarColaboradorExterno = useCallback(async (datos) => {
    setIsSaving(true);
    try {
      const token = await obtenerTokenAutenticado();

      if (!token || proyectoPendienteSincronizacion) {
        const colaboradorLocal = await registrarColaboradorExternoLocal(datos);
        return { success: true, data: colaboradorLocal };
      }

      return await colaboradoresExternosService.registrarColaboradorExterno(datos);
    } catch (_err) {
      return { success: false, message: 'Error de red' };
    } finally {
      setIsSaving(false);
    }
  }, [proyectoPendienteSincronizacion]);

  const asociarColaboradorExterno = useCallback(async (colaboradorExternoId, participacion) => {
    if (!proyectoId) return { success: false, message: 'No hay proyecto' };

    setIsSaving(true);
    try {
      const token = await obtenerTokenAutenticado();

      if (!token || proyectoPendienteSincronizacion) {
        const relacionLocal = await crearProyectoColaboradorExternoRelacion(
          proyectoId,
          colaboradorExternoId,
          participacion
        );

        await cargarColaboradoresExternos();
        return {
          success: true,
          data: relacionLocal,
          pendingSync: Boolean(token && proyectoPendienteSincronizacion),
          message: token && proyectoPendienteSincronizacion ? MENSAJE_PROYECTO_PENDIENTE : undefined,
        };
      }

      const resultado = await colaboradoresExternosService.asociarColaboradorExterno(proyectoId, {
        colaborador_externo_id: colaboradorExternoId,
        participacion,
      });

      if (resultado.success) {
        await cargarColaboradoresExternos();
      }

      return resultado;
    } catch (_err) {
      return { success: false, message: 'Error de red' };
    } finally {
      setIsSaving(false);
    }
  }, [proyectoId, proyectoPendienteSincronizacion, cargarColaboradoresExternos]);

  const eliminarColaboradorExterno = useCallback(async (colaboradorExternoId) => {
    if (!proyectoId) return { success: false, message: 'No hay proyecto' };

    setIsDeleting(true);
    try {
      const token = await obtenerTokenAutenticado();

      if (!token || proyectoPendienteSincronizacion) {
        const eliminado = await eliminarProyectoColaboradorExternoRelacion(
          proyectoId,
          colaboradorExternoId
        );

        await cargarColaboradoresExternos();

        return {
          success: Boolean(eliminado),
          pendingSync: Boolean(eliminado && token && proyectoPendienteSincronizacion),
          message: eliminado ? 'Asociación eliminada' : 'No se encontró la asociación',
        };
      }

      const resultado = await colaboradoresExternosService.eliminarColaboradorExterno(proyectoId, colaboradorExternoId);

      if (resultado.success) {
        await cargarColaboradoresExternos();
      }

      return resultado;
    } catch (_err) {
      return { success: false, message: 'Error de red' };
    } finally {
      setIsDeleting(false);
    }
  }, [proyectoId, proyectoPendienteSincronizacion, cargarColaboradoresExternos]);

  return {
    colaboradoresExternos,
    isLoading,
    isSearching,
    isSaving,
    isDeleting,
    error,
    cargarColaboradoresExternos,
    buscarColaboradoresExternos,
    registrarColaboradorExterno,
    asociarColaboradorExterno,
    eliminarColaboradorExterno,
  };
};
