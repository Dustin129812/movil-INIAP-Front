import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { obtenerDetalleProyectoYVisitas, eliminarVisitaLocalBd } from '../../../services/ensayos/ensayosLocalService';
import { SYNC_STATUS } from '../../../db/schema';

export const useProyectoDetalle = (proyecto_uuid) => {
    const [proyectoData, setProyectoData] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const cargar = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerDetalleProyectoYVisitas(proyecto_uuid);
            setProyectoData(data.proyecto);
            setHistorial(data.historial);
        } catch (error) {
            console.error("Error al cargar proyecto:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { if(proyecto_uuid) cargar(); }, [proyecto_uuid]));

    const eliminarVisita = (visitaUuid, syncStatus) => {
        Alert.alert(
            'Confirmar Eliminación',
            syncStatus === SYNC_STATUS.SYNCED
                ? 'Este registro ya fue sincronizado. Eliminarlo aquí solo lo quitará del dispositivo. ¿Continuar?'
                : '¿Está seguro de eliminar esta evaluación local de forma permanente?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive',
                    onPress: async () => {
                        try {
                            await eliminarVisitaLocalBd(visitaUuid);
                            cargar(); // Recargamos la lista
                        } catch (error) { Alert.alert('Error', 'No se pudo eliminar el registro local.'); }
                    }
                }
            ]
        );
    };

    return { proyectoData, historial, isLoading, eliminarVisita };
};