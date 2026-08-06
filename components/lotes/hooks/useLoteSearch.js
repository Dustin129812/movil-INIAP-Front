import { useState, useMemo } from 'react';
import { lotesService } from '../../../services/lotesService';

export const useLoteSearch = (listaLotes = []) => {
    const [searchText, setSearchText] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    const lotesFiltrados = useMemo(() => {
        return listaLotes.filter(lote => {
            const query = searchText.toLowerCase();
            const nameMatch = lote.nombre_lote?.toLowerCase().includes(query);
            const uuidMatch = lote.uuid_movil?.toLowerCase().includes(query);
            const locationMatch = (lote.ubicacion_manual || '').toLowerCase().includes(query);
            const cantonMatch = (lote.canton || '').toLowerCase().includes(query);
            const matchesSearch = nameMatch || uuidMatch || locationMatch || cantonMatch;

            let matchesStatus = true;
            if (filtroEstado === 'PENDIENTES') {
                matchesStatus = lote.estado_verificacion === 'pendiente';
            } else if (filtroEstado === 'ACTIVOS') {
                matchesStatus = lote.estado_verificacion === 'verificado';
            }

            return matchesSearch && matchesStatus;
        });
    }, [listaLotes, searchText, filtroEstado]);

    const limpiarFiltros = () => {
        setSearchText('');
        setFiltroEstado('TODOS');
    };

    return {
        searchText,
        setSearchText,
        filtroEstado,
        setFiltroEstado,
        lotesFiltrados,
        limpiarFiltros,
    };
};
