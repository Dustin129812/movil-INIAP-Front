import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../services/auth';
import { useSearch } from '../../lotes/context/SearchContext';
import { descargarCatalogos, descargarMisDatos } from '../../../services/sync/downloadService';
import { syncEngine, obtenerConteoPendientes } from '../../../services/sync/uploadService';
import { useNotifications, TIPO_NOTIFICACION } from '../../notifications/context/NotificationContext';
import NetInfo from '@react-native-community/netinfo';

export const useHomeDashboard = () => {
    const { usuario, esInvitado } = useAuth();
    const { listaLotes } = useSearch();
    const {
        pendingCount,
        setPendingCount,
        agregarNotificacionSync,
        decrementarPendientes,
        guardarUltimoSync,
    } = useNotifications();

    const [weatherExpanded, setWeatherExpanded] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState(null);
    const [pendingCounts, setPendingCounts] = useState({ total: 0, lotes: 0, proyectos: 0, visitas: 0 });

    const toggleWeatherDetails = useCallback(() => {
        setWeatherExpanded(prev => !prev);
    }, []);

    // Verificar conteo de pendientes al iniciar
    const verificarPendientes = useCallback(async () => {
        try {
            const counts = await obtenerConteoPendientes();
            const total = counts.lotes + counts.proyectos + counts.visitas;
            setPendingCount(total);
            setPendingCounts({
                total,
                lotes: counts.lotes || 0,
                proyectos: counts.proyectos || 0,
                visitas: counts.visitas || 0,
            });
        } catch (error) {
            // console removed
        }
    }, [setPendingCount]);

    useEffect(() => {
        verificarPendientes();
    }, [verificarPendientes]);

    const sincronizar = useCallback(async () => {
        setIsSyncing(true);
        setSyncMessage(null);

        try {
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                setSyncMessage({ type: 'error', text: 'Sin conexión a internet' });
                agregarNotificacionSync(
                    TIPO_NOTIFICACION.SYNC_ERROR,
                    'Error de conexión',
                    'No hay conexión a internet. Los cambios se sincronizarán cuando vuelvas a conectarte.'
                );
                setIsSyncing(false);
                return;
            }

            // Subir datos locales al servidor
            const resultadoSubida = await syncEngine();
            if (!resultadoSubida.success) {
                setSyncMessage({ type: 'error', text: resultadoSubida.message });
                agregarNotificacionSync(
                    TIPO_NOTIFICACION.SYNC_ERROR,
                    'Error de sincronización',
                    resultadoSubida.message || 'No se pudieron subir los cambios al servidor.'
                );
                setIsSyncing(false);
                return;
            }

            // Marcar como sincronizados los pendientes
            const counts = await obtenerConteoPendientes();
            const sincronizados = counts.total;

            // Descargar catálogos
            await descargarCatalogos();

            // Descargar datos del servidor
            await descargarMisDatos();

            // Reset pending count
            setPendingCount(0);
            setPendingCounts({ total: 0, lotes: 0, proyectos: 0, visitas: 0 });
            await guardarUltimoSync();

            setSyncMessage({ type: 'success', text: resultadoSubida.message || 'Sincronización completada' });

            agregarNotificacionSync(
                TIPO_NOTIFICACION.SYNC_SUCCESS,
                'Sincronización completada',
                `Se sincronizaron ${sincronizados} elemento${sincronizados > 1 ? 's' : ''} correctamente.`
            );

        } catch (error) {
            // console removed
            setSyncMessage({ type: 'error', text: 'Error en la sincronización' });
            agregarNotificacionSync(
                TIPO_NOTIFICACION.SYNC_ERROR,
                'Error de sincronización',
                'Ocurrió un error inesperado durante la sincronización.'
            );
        } finally {
            setIsSyncing(false);
        }
    }, [setPendingCount, guardarUltimoSync, agregarNotificacionSync]);

    const limpiarSyncMessage = useCallback(() => {
        setSyncMessage(null);
    }, []);

    // Stats calculados basados en datos reales
    const totalLotes = listaLotes.length;
    const lotesActivos = listaLotes.filter(l => l.estado_verificacion === 'verificado').length;

    return {
        usuario,
        esInvitado,
        weatherExpanded,
        toggleWeatherDetails,
        isSyncing,
        syncMessage,
        sincronizar,
        limpiarSyncMessage,
        verificarPendientes,
        // Stats
        totalLotes,
        lotesActivos,
        pendingCount,
        pendingCounts,
        syncPercentage: 100,
        syncInProgress: isSyncing,
    };
};
