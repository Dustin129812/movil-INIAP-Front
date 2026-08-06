import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { lotesService } from '../../../services/lotesService';

export const useLoteDetalle = (loteUuid) => {
    const [loteData, setLoteData] = useState(null);
    const [listaProyectos, setListaProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const cargar = async () => {
                if (!loteUuid) return;

                setIsLoading(true);
                setError(null);
                try {
                    const lote = await lotesService.obtenerLote(loteUuid);
                    setLoteData(lote);
                } catch (err) {
                    setError('Error al cargar los datos del lote');
                } finally {
                    setIsLoading(false);
                }
            };
            cargar();
        }, [loteUuid])
    );

    return { loteData, listaProyectos, isLoading, error };
};
