import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { proyectosService } from '@/services/proyectosService';
import { proyectosLocalService } from '@/services/proyectosLocalService';

export const useListaProyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroActivo, setFiltroActivo] = useState('TODOS');

    const recargar = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await proyectosService.obtenerProyectos();
            if (data !== null) {
                setProyectos(Array.isArray(data) ? data : []);
            } else {
                const dataLocal = await proyectosLocalService.obtenerProyectos();
                setProyectos(dataLocal || []);
            }
        } catch (err) {
            console.error('Error al recargar proyectos:', err);
            setError('Error al cargar los proyectos');
            const dataLocal = await proyectosLocalService.obtenerProyectos();
            setProyectos(dataLocal || []);
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
        if (filtroActivo === 'ACTIVOS') return proyectos.filter(p => p.estado === 'activo');
        if (filtroActivo === 'PENDIENTES') return proyectos.filter(p => p.sync_status === 'pending');
        return proyectos;
    }, [proyectos, filtroActivo]);

    const totalProyectos = proyectos.length;
    const proyectosActivos = proyectos.filter(p => p.estado === 'activo').length;
    const proyectosPendientes = proyectos.filter(p => p.sync_status === 'pending').length;

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
    };
};
