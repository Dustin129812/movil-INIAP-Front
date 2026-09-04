import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { proyectosLocalService } from '../../../services/proyectos';

export const useProyectoDetalle = (proyectoUuid) => {
    const [proyectoData, setProyectoData] = useState(null);
    const [ciclos, setCiclos] = useState([]);
    const [visitas, setVisitas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        if (!proyectoUuid) return;
        setIsLoading(true);
        setError(null);

        try {
            // Buscar siempre en BD local por uuid_movil
            const proyecto = await proyectosLocalService.obtenerProyectoLocal(proyectoUuid);
            setProyectoData(proyecto);

            if (proyecto) {
                // Usar uuid_movil para las consultas
                const ciclosData = await proyectosLocalService.obtenerCiclosDelProyecto(proyectoUuid);
                setCiclos(ciclosData || []);

                const visitasData = await proyectosLocalService.obtenerVisitasDelProyecto(proyectoUuid);
                setVisitas(visitasData || []);
            }
        } catch (err) {
            // console removed
            setError('Error al cargar los datos del proyecto');
        } finally {
            setIsLoading(false);
        }
    }, [proyectoUuid]);

    useFocusEffect(
        useCallback(() => {
            cargar();
        }, [cargar])
    );

    const obtenerVisitasOrdenadas = useCallback(() => {
        return [...visitas].sort((a, b) => {
            const dateA = new Date(a.fecha_visita);
            const dateB = new Date(b.fecha_visita);
            return dateB - dateA;
        });
    }, [visitas]);

    return {
        proyectoData,
        ciclos,
        visitas,
        visitasOrdenadas: obtenerVisitasOrdenadas(),
        isLoading,
        error,
        recargar: cargar,
    };
};
