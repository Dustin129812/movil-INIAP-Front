import { useCallback } from 'react';
import { useNotifications, TIPO_NOTIFICACION } from '../context/NotificationContext';

/**
 * Hook para notificar cambios guardados localmente.
 * Usar en: localLotesService, localProyectosService, etc.
 *
 * Ejemplo:
 *   const { notifyLoteGuardado } = useLocalNotifications();
 *   await crearLoteLocal(data);
 *   notifyLoteGuardado('Mi Lote');
 */
export function useLocalNotifications() {
    const { agregarNotificacion } = useNotifications();

    const notifyLoteGuardado = useCallback((nombreLote) => {
        return agregarNotificacion(
            TIPO_NOTIFICACION.LOTE_GUARDADO,
            'Lote guardado localmente',
            `"${nombreLote}" se guardó en el dispositivo. Se sincronizará cuando haya conexión a internet.`
        );
    }, [agregarNotificacion]);

    const notifyProyectoGuardado = useCallback((titulo) => {
        return agregarNotificacion(
            TIPO_NOTIFICACION.PROYECTO_GUARDADO,
            'Proyecto guardado localmente',
            `"${titulo}" se guardó en el dispositivo. Se sincronizará cuando haya conexión a internet.`
        );
    }, [agregarNotificacion]);

    const notifyVisitaGuardada = useCallback((nombreLote) => {
        return agregarNotificacion(
            TIPO_NOTIFICACION.VISITA_GUARDADA,
            'Visita guardada localmente',
            `Visita del lote "${nombreLote}" guardada. Se sincronizará cuando haya conexión a internet.`
        );
    }, [agregarNotificacion]);

    const notifyColaboradorAgregado = useCallback((nombreColaborador) => {
        return agregarNotificacion(
            TIPO_NOTIFICACION.COLABORADOR_AGREGADO,
            'Colaborador agregado',
            `"${nombreColaborador}" fue agregado al proyecto. Se sincronizará cuando haya conexión a internet.`
        );
    }, [agregarNotificacion]);

    return {
        notifyLoteGuardado,
        notifyProyectoGuardado,
        notifyVisitaGuardada,
        notifyColaboradorAgregado,
    };
}
