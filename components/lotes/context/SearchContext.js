import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { lotesService } from '../../../services/lotes';

const SearchContext = createContext({
    searchText: '',
    setSearchText: () => {},
    filtroEstado: 'TODOS',
    setFiltroEstado: () => {},
    lotesFiltrados: [],
    limpiarFiltros: () => {},
    listaLotes: [],
    isLoading: false,
    error: null,
    recargar: () => {},
});

export function SearchProvider({ children }) {
    const [searchText, setSearchText] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [listaLotes, setListaLotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarLotes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await lotesService.obtenerLotes();
            setListaLotes(data);
        } catch (err) {
            setError('Error al cargar lotes');
            setListaLotes([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarLotes();
    }, []);

    const lotesFiltrados = useMemo(() => {
        if (!Array.isArray(listaLotes)) return [];

        return listaLotes.filter(lote => {
            let matchesStatus = true;
            if (filtroEstado === 'PENDIENTES') matchesStatus = lote.estado_verificacion === 'pendiente';
            else if (filtroEstado === 'ACTIVOS') matchesStatus = lote.estado_verificacion === 'verificado';
            else if (filtroEstado === 'ERROR') matchesStatus = lote.sync_status === 'error_geometria';

            if (!matchesStatus) return false;
            if (!searchText.trim()) return true;

            const query = searchText.toLowerCase().trim();
            const searchableFields = [
                lote.nombre_lote,
                lote.uuid_movil,
                lote.ubicacion_manual,
                lote.canton,
                lote.provincia,
                lote.descripcion,
            ];

            return searchableFields.some(field => 
                field && String(field).toLowerCase().includes(query)
            );
        });
    }, [listaLotes, searchText, filtroEstado]);

    const limpiarFiltros = () => {
        setSearchText('');
        setFiltroEstado('TODOS');
    };

    return (
        <SearchContext.Provider
            value={{
                searchText,
                setSearchText,
                filtroEstado,
                setFiltroEstado,
                lotesFiltrados,
                limpiarFiltros,
                listaLotes,
                isLoading,
                error,
                recargar: cargarLotes,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}