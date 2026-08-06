import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../../services';
import { useSearch } from '../../lotes/context/SearchContext';

export const useHomeDashboard = () => {
    const { usuario } = useAuth();
    const { listaLotes } = useSearch();

    const [weatherExpanded, setWeatherExpanded] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // Sin efectos adicionales por ahora
        }, [])
    );

    const toggleWeatherDetails = useCallback(() => {
        setWeatherExpanded(prev => !prev);
    }, []);

    // Stats calculados basados en datos reales
    const totalLotes = listaLotes.length;
    const lotesActivos = listaLotes.filter(l => l.estado_verificacion === 'verificado').length;

    return {
        usuario,
        weatherExpanded,
        toggleWeatherDetails,
        // Stats
        totalLotes,
        lotesActivos,
        pendingCount: 0,
        syncPercentage: 100,
    };
};
