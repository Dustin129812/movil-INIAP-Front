import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { lotesService } from '../../../services/lotesService';

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

    const cargarLotes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await lotesService.obtenerLotes();
            if (Array.isArray(data)) {
                setListaLotes(data);
            } else if (data && Array.isArray(data.data)) {
                setListaLotes(data.data);
            } else if (data && Array.isArray(data.lotes)) {
                setListaLotes(data.lotes);
            } else {
                setListaLotes([]);
            }
        } catch (err) {
            setError('Error al cargar lotes');
            setListaLotes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const recargar = useCallback(() => {
        cargarLotes();
    }, [cargarLotes]);
    useFocusEffect(
        useCallback(() => {
            cargarLotes();
        }, [cargarLotes])
    );

    const lotesFiltrados = useMemo(() => {
        if (!searchText.trim()) {
            if (filtroEstado === 'TODOS') {
                return listaLotes;
            }
            return listaLotes.filter(lote => {
                if (filtroEstado === 'PENDIENTES') {
                    return lote.estado_verificacion === 'pendiente';
                } else if (filtroEstado === 'ACTIVOS') {
                    return lote.estado_verificacion === 'verificado';
                }
                return true;
            });
        }
        const query = searchText.toLowerCase().trim();

        return listaLotes.filter(lote => {
            const searchableFields = [
                lote.nombre_lote,
                lote.uuid_movil,
                lote.ubicacion_manual,
                lote.canton,
                lote.provincia,
                lote.descripcion,
            ].map(field => (field || '').toLowerCase());

            const matchesSearch = searchableFields.some(field =>
                field.includes(query) || field.startsWith(query)
            );

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
                recargar,
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
