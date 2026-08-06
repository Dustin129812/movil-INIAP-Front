import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

// ============================================================================
// MENU DASHBOARD HOOK - TEMPORALMENTE SIMPLIFICADO
// ============================================================================
// Las funciones de sincronización offline están deshabilitadas temporalmente
// debido a dependencias faltantes (expo-secure-store, netinfo)
// ============================================================================

export const useMenuDashboard = () => {
    const [conteo, setConteo] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // TODO: Implementar conteo de pendientes cuando sync esté disponible
            setConteo(0);
        }, [])
    );

    const ejecutarSync = async () => {
        setIsSyncing(true);
        try {
            // TODO: Habilitar cuando estén las dependencias de sincronización
            // await syncEngine();
            // await descargarCatalogos();
            // await descargarMisDatos();

            Alert.alert(
                "Sincronización",
                "El módulo de sincronización está temporalmente fuera de servicio. Próximamente disponible."
            );
        } catch (e) {
            console.error("Error de sincronización:", e);
            Alert.alert("Error", "No se pudo completar la sincronización.");
        } finally {
            setIsSyncing(false);
        }
    };

    return { conteo, isSyncing, ejecutarSync };
};
