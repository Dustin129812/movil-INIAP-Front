import { useCallback, useState } from 'react';
import { colaboradoresExternosService } from './colaboradoresExternosService';

export const useColaboradoresExternos = (proyectoId) => {
  const [colaboradoresExternos, setColaboradoresExternos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const cargarColaboradoresExternos = useCallback(async () => {
    if (!proyectoId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await colaboradoresExternosService.obtenerColaboradoresExternos(proyectoId);
      setColaboradoresExternos(Array.isArray(data) ? data : []);
    } catch (_err) {
      setError('Error al cargar personal externo');
      setColaboradoresExternos([]);
    } finally {
      setIsLoading(false);
    }
  }, [proyectoId]);

  const buscarColaboradoresExternos = useCallback(async (termino) => {
    setIsSearching(true);
    try {
      return await colaboradoresExternosService.buscarColaboradoresExternos(termino);
    } catch (_err) {
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const registrarColaboradorExterno = useCallback(async (datos) => {
    setIsSaving(true);
    try {
      return await colaboradoresExternosService.registrarColaboradorExterno(datos);
    } catch (_err) {
      return { success: false, message: 'Error de red' };
    } finally {
      setIsSaving(false);
    }
  }, []);

  const asociarColaboradorExterno = useCallback(async (colaboradorExternoId, participacion) => {
    if (!proyectoId) return { success: false, message: 'No hay proyecto' };

    setIsSaving(true);
    try {
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
  }, [proyectoId, cargarColaboradoresExternos]);

  const eliminarColaboradorExterno = useCallback(async (colaboradorExternoId) => {
    if (!proyectoId) return { success: false, message: 'No hay proyecto' };

    setIsDeleting(true);
    try {
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
  }, [proyectoId, cargarColaboradoresExternos]);

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
