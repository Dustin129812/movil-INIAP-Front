import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { proyectosService } from '../../../services/proyectos';
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
            let proyecto = await proyectosService.obtenerProyecto(proyectoUuid);

            if (!proyecto) {
                const { db } = await import('../../../db');
                const { eq } = await import('drizzle-orm');
                const { proyectos } = await import('../../../db/schema');
                const resultados = await db.select().from(proyectos).where(eq(proyectos.uuid_movil, proyectoUuid));
                proyecto = resultados[0] || null;
            }

            setProyectoData(proyecto);

            if (proyecto) {
                const ciclosData = await proyectosLocalService.obtenerCiclosDelProyecto(proyecto.id);
                setCiclos(ciclosData || []);

                const visitasData = await proyectosLocalService.obtenerVisitasDelProyecto(proyecto.id);
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
