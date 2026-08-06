import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router'; // <-- Importa useRouter
import { obtenerListaEnsayosCruzada } from '../../../services/ensayos/ensayosLocalService';
import { obtenerLotesLocales } from '../../../services/lotes/lotesLocalService';

export const useListaEnsayos = () => {
    const router = useRouter();
    const [ensayos, setEnsayos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('TODOS');

    // --- NUEVO: Estados para los Lotes Existentes ---
    const [dbLotes, setDbLotes] = useState([]);
    const [showLoteSelector, setShowLoteSelector] = useState(false);

    useFocusEffect(useCallback(() => {
        cargarDatos();
        cargarLotes(); // <-- Cargar lotes en segundo plano
    }, []));

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerListaEnsayosCruzada();
            setEnsayos(data);
        } catch (err) {
            console.error('[Ensayos] Error cargando lista:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const cargarLotes = async () => {
        try {
            const lotesDb = await obtenerLotesLocales();
            setDbLotes(lotesDb);
        } catch (e) { console.error(e); }
    };

    const filteredEnsayos = ensayos.filter(e => {
        if (activeTab === 'TODOS') return true;
        if (activeTab === 'ACTIVOS') return e.sync_status === 'synced';
        if (activeTab === 'PENDIENTE') return e.sync_status !== 'synced';
        return true;
    });

    const seleccionarLoteExistente = (lote) => {
        setShowLoteSelector(false);

        const lotePayload = {
            isExisting: true, // <-- ¡CLAVE!
            uuid_movil: lote.uuid_movil,
            nombre_lote: lote.nombre_lote,
            coordenadas: lote.coordenadas,
            ubicacion: {
                provincia: { name: 'Registrado en BD' }
            }
        };

        router.push({
            pathname: '/(superior)/catalogos-ensayos/nuevo',
            params: { loteDraft: JSON.stringify(lotePayload) }
        });
    };

    return {
        ensayos, filteredEnsayos, isLoading, activeTab, setActiveTab,
        dbLotes, showLoteSelector, setShowLoteSelector, seleccionarLoteExistente
    };
};