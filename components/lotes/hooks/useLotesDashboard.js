import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { lotesService } from '../../../services/lotesService';

export const useLotesDashboard = () => {
    const [listaLotes, setListaLotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const cargarLotes = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await lotesService.obtenerLotes();
                    setListaLotes(data);
                } catch (err) {
                    console.error('Error al cargar lotes:', err);
                    setError('Error al cargar los lotes');
                } finally {
                    setIsLoading(false);
                }
            };
            cargarLotes();
        }, [])
    );

    return { listaLotes, isLoading, error };
};
