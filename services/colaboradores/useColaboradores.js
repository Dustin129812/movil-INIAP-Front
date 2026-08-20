import { useState, useCallback } from 'react';
import { colaboradoresService } from './colaboradoresService';

export const useColaboradores = (proyectoId) => {
    const [colaboradores, setColaboradores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargarColaboradores = useCallback(async () => {
        if (!proyectoId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await colaboradoresService.obtenerColaboradores(proyectoId);
            setColaboradores(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Error al cargar colaboradores');
            setColaboradores([]);
        } finally {
            setIsLoading(false);
        }
    }, [proyectoId]);

    const agregarColaboradores = useCallback(async (userIds) => {
        if (!proyectoId) return { success: false, message: 'No hay proyecto' };
        try {
            const resultado = await colaboradoresService.agregarColaboradores(proyectoId, userIds);
            if (resultado.success) {
                await cargarColaboradores();
            }
            return resultado;
        } catch (err) {
            return { success: false, message: 'Error de red' };
        }
    }, [proyectoId, cargarColaboradores]);

    const eliminarColaborador = useCallback(async (userId) => {
        if (!proyectoId) return;
        try {
            await colaboradoresService.eliminarColaborador(proyectoId, userId);
            await cargarColaboradores();
        } catch (err) {
            // console removed
        }
    }, [proyectoId, cargarColaboradores]);

    const buscarUsuarios = useCallback(async (termino) => {
        try {
            return await colaboradoresService.buscarUsuarios(termino);
        } catch (err) {
            // console removed
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
