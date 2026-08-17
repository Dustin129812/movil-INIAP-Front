import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { proyectosService } from '../../../services/proyectos';
import { proyectosLocalService } from '../../../services/proyectos';

export const useListaProyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroActivo, setFiltroActivo] = useState('TODOS');

    const recargar = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Siempre obtener de local primero para tener datos actualizados
            const dataLocal = await proyectosLocalService.obtenerProyectos();
            setProyectos(Array.isArray(dataLocal) ? dataLocal : []);

            // Intentar API en segundo plano para sincronizar
            try {
                const dataApi = await proyectosService.obtenerProyectos();
                if (dataApi && Array.isArray(dataApi) && dataApi.length > 0) {
                    // Solo usar API si tiene datos (para no sobreescribir cambios locales)
                }
            } catch (apiErr) {
                // Ignorar errores de API, ya tenemos datos locales
            }
        } catch (err) {
            // console removed
            setError('Error al cargar los proyectos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            recargar();
        }, [recargar])
    );

    const proyectosFiltrados = useMemo(() => {
        if (filtroActivo === 'TODOS') return proyectos;
        if (filtroActivo === 'ACTIVOS') return proyectos.filter(p => p.estado === 'activo' && p.sync_status !== 'pending' && p.sync_status !== 'draft');
        if (filtroActivo === 'PENDIENTES') return proyectos.filter(p => p.estado === 'pendiente' || p.sync_status === 'pending' || p.sync_status === 'draft');
        if (filtroActivo === 'INACTIVOS') return proyectos.filter(p => p.estado === 'inactivo');
        return proyectos;
    }, [proyectos, filtroActivo]);

    const totalProyectos = proyectos.length;
    const proyectosActivos = proyectos.filter(p => p.estado === 'activo').length;
    const proyectosPendientes = proyectos.filter(p => p.estado === 'pendiente').length;
    const proyectosInactivos = proyectos.filter(p => p.estado === 'inactivo').length;

    return {
        proyectos,
        proyectosFiltrados,
        isLoading,
        error,
        filtroActivo,
        setFiltroActivo,
        recargar,
        totalProyectos,
        proyectosActivos,
        proyectosPendientes,
        proyectosInactivos,
    };
};
