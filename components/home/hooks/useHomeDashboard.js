import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../services';
import { useSearch } from '../../lotes/context/SearchContext';
import { descargarCatalogos, descargarMisDatos } from '../../../services/sync/downloadService';
import { syncEngine } from '../../../services/sync/uploadService';
import NetInfo from '@react-native-community/netinfo';

export const useHomeDashboard = () => {
    const { usuario } = useAuth();
    const { listaLotes } = useSearch();

    const [weatherExpanded, setWeatherExpanded] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState(null);

    useFocusEffect(
        useCallback(() => {
            // Sin efectos adicionales por ahora
        }, [])
    );

    const toggleWeatherDetails = useCallback(() => {
        setWeatherExpanded(prev => !prev);
    }, []);

    const sincronizar = useCallback(async () => {
        setIsSyncing(true);
        setSyncMessage(null);

        try {
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
                setSyncMessage({ type: 'error', text: 'Sin conexión a internet' });
                setIsSyncing(false);
                return;
            }

            // 1. Subir datos locales al servidor
            const resultadoSubida = await syncEngine();
            if (!resultadoSubida.success) {
                setSyncMessage({ type: 'error', text: resultadoSubida.message });
                setIsSyncing(false);
                return;
            }

            // 2. Descargar catálogos
            await descargarCatalogos();

            // 3. Descargar datos del servidor
            await descargarMisDatos();

            setSyncMessage({ type: 'success', text: resultadoSubida.message || 'Sincronización completada' });
        } catch (error) {
            console.error('[Sync] Error:', error);
            setSyncMessage({ type: 'error', text: 'Error en la sincronización' });
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const limpiarSyncMessage = useCallback(() => {
        setSyncMessage(null);
    }, []);

    // Stats calculados basados en datos reales
    const totalLotes = listaLotes.length;
    const lotesActivos = listaLotes.filter(l => l.estado_verificacion === 'verificado').length;

    return {
        usuario,
        weatherExpanded,
        toggleWeatherDetails,
        isSyncing,
        syncMessage,
        sincronizar,
        limpiarSyncMessage,
        // Stats
        totalLotes,
        lotesActivos,
        pendingCount: 0,
        syncPercentage: 100,
    };
};
