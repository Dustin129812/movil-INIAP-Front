import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { lotesService } from '../../../services/lotesService';

export const useLotesDashboard = () => {
    const [listaLotes, setListaLotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const recargar = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await lotesService.obtenerLotes();
            setListaLotes(data);
        } catch (err) {
            setError('Error al recargar los lotes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            recargar();
        }, [recargar])
    );

    return { listaLotes, isLoading, error, recargar };
};
