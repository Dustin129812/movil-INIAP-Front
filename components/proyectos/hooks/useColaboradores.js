import { useState, useCallback } from 'react';
import { colaboradoresService } from '@/services/colaboradoresService';

export const useColaboradores = (proyectoId) => {
  const [colaboradores, setColaboradores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarColaboradores = useCallback(async () => {
    if (!proyectoId) return;
    setIsLoading(true);
    setError(null);

    try {
      const datos = await colaboradoresService.obtenerColaboradores(proyectoId);
      setColaboradores(datos);
    } catch (err) {
      console.error('Error al cargar colaboradores:', err);
      setError('Error al cargar colaboradores');
    } finally {
      setIsLoading(false);
    }
  }, [proyectoId]);

  const agregarColaboradores = useCallback(async (userIds) => {
    if (!proyectoId || !userIds?.length) return { success: false };

    try {
      const resultado = await colaboradoresService.agregarColaboradores(proyectoId, userIds);
      if (resultado.success) {
        await cargarColaboradores();
        return { success: true, data: resultado.data };
      }
      return { success: false, message: resultado.message };
    } catch (err) {
      console.error('Error al agregar colaboradores:', err);
      return { success: false, message: 'Error de red' };
    }
  }, [proyectoId, cargarColaboradores]);

  const eliminarColaborador = useCallback(async (userId) => {
    if (!proyectoId || !userId) return { success: false };

    try {
      const resultado = await colaboradoresService.eliminarColaborador(proyectoId, userId);
      if (resultado.success) {
        await cargarColaboradores();
        return { success: true };
      }
      return { success: false, message: resultado.message };
    } catch (err) {
      console.error('Error al eliminar colaborador:', err);
      return { success: false, message: 'Error de red' };
    }
  }, [proyectoId, cargarColaboradores]);

  const buscarUsuarios = useCallback(async (termino) => {
    if (!termino || termino.length < 2) return [];

    try {
      return await colaboradoresService.buscarUsuarios(termino);
    } catch (err) {
      console.error('Error buscando usuarios:', err);
      return [];
    }
  }, []);

  return {
    colaboradores,
    isLoading,
    error,
    cargarColaboradores,
    agregarColaboradores,
    eliminarColaborador,
    buscarUsuarios,
  };
};
