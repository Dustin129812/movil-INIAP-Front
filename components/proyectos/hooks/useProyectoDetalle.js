import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { proyectosService } from '@/services/proyectosService';
import  proyectosLocalService  from '@/services/proyectosLocalService';

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
            // Intentar obtener del API
            let proyecto = await proyectosService.obtenerProyecto(proyectoUuid);

            // Si no funciona, buscar en local
            if (!proyecto) {
                const { db } = await import('@/db');
                const { eq } = await import('drizzle-orm');
                const { proyectos } = await import('@/db/schema');
                const resultados = await db.select().from(proyectos).where(eq(proyectos.uuid_movil, proyectoUuid));
                proyecto = resultados[0] || null;
            }

            setProyectoData(proyecto);

            if (proyecto) {
                // Cargar ciclos y visitas
                const ciclosData = await proyectosLocalService.obtenerCiclosDelProyecto(proyecto.id);
                setCiclos(ciclosData || []);

                const visitasData = await proyectosLocalService.obtenerVisitasDelProyecto(proyecto.id);
                setVisitas(visitasData || []);
            }
        } catch (err) {
            console.error('Error al cargar detalle del proyecto:', err);
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
