import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos de notificación
export const TIPO_NOTIFICACION = {
    SYNC_SUCCESS: 'sync_success',
    SYNC_ERROR: 'sync_error',
    CAMBIOS_GUARDADOS: 'cambios_guardados',
    LOTE_GUARDADO: 'lote_guardado',
    PROYECTO_GUARDADO: 'proyecto_guardado',
    VISITA_GUARDADA: 'visita_guardada',
    COLABORADOR_AGREGADO: 'colaborador_agregado',
    PENDIENTE: 'pendiente',
    INFO: 'info',
};

const ICONOS_NOTIFICACION = {
    [TIPO_NOTIFICACION.SYNC_SUCCESS]: { name: 'cloud-check-outline', color: '#34C759' },
    [TIPO_NOTIFICACION.SYNC_ERROR]: { name: 'cloud-alert-outline', color: '#FF3B30' },
    [TIPO_NOTIFICACION.LOTE_GUARDADO]: { name: 'map-marker-plus-outline', color: '#007AFF' },
    [TIPO_NOTIFICACION.PROYECTO_GUARDADO]: { name: 'flask-plus-outline', color: '#AF52DE' },
    [TIPO_NOTIFICACION.VISITA_GUARDADA]: { name: 'clipboard-check-outline', color: '#5AC8FA' },
    [TIPO_NOTIFICACION.COLABORADOR_AGREGADO]: { name: 'account-plus-outline', color: '#FF9500' },
    [TIPO_NOTIFICACION.PENDIENTE]: { name: 'clock-outline', color: '#FF9500' },
    [TIPO_NOTIFICACION.INFO]: { name: 'information-outline', color: '#5AC8FA' },
};

const NotificationContext = createContext(undefined);

const STORAGE_KEY = 'notificaciones_app';
const ULTIMO_SYNC_KEY = 'ultimoSync';

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);

    // Cargar notificaciones guardadas al iniciar
    useEffect(() => {
        cargarNotificacionesGuardadas();
    }, []);

    const cargarNotificacionesGuardadas = async () => {
        try {
            const guardadas = await AsyncStorage.getItem(STORAGE_KEY);
            if (guardadas) {
                const parsed = JSON.parse(guardadas);
                // Filtrar solo las últimas 50 notificaciones
                if (Array.isArray(parsed) && parsed.length > 50) {
                    setNotifications(parsed.slice(-50));
                } else if (Array.isArray(parsed)) {
                    setNotifications(parsed);
                }
            }
        } catch (error) {
            // console removed
        }
    };

    const guardarNotificaciones = async (notifs) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
        } catch (error) {
            // console removed
        }
    };

    const agregarNotificacion = useCallback((tipo, titulo, descripcion, metadata = {}) => {
        const nueva = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tipo,
            titulo,
            descripcion,
            fecha: new Date().toISOString(),
            leida: false,
            metadata,
        };

        setNotifications(prev => {
            const actualizadas = [nueva, ...prev].slice(0, 50); // Máximo 50 notificaciones
            guardarNotificaciones(actualizadas);
            return actualizadas;
        });

        // Si es un cambio guardado localmente, incrementar pending count
        if (tipo === TIPO_NOTIFICACION.LOTE_GUARDADO ||
            tipo === TIPO_NOTIFICACION.PROYECTO_GUARDADO ||
            tipo === TIPO_NOTIFICACION.VISITA_GUARDADA ||
            tipo === TIPO_NOTIFICACION.COLABORADOR_AGREGADO) {
            setPendingCount(prev => prev + 1);
        }

        return nueva;
    }, []);

    const marcarLeida = useCallback((id) => {
        setNotifications(prev => {
            const actualizadas = prev.map(n =>
                n.id === id ? { ...n, leida: true } : n
            );
            guardarNotificaciones(actualizadas);
            return actualizadas;
        });
    }, []);

    const limpiarNotificaciones = useCallback(() => {
        setNotifications([]);
        guardarNotificaciones([]);
    }, []);

    const limpiarNotificacion = useCallback((id) => {
        setNotifications(prev => {
            const actualizadas = prev.filter(n => n.id !== id);
            guardarNotificaciones(actualizadas);
            return actualizadas;
        });
    }, []);

    const agregarNotificacionSync = useCallback((tipo, titulo, descripcion) => {
        agregarNotificacion(tipo, titulo, descripcion);
    }, [agregarNotificacion]);

    const decrementarPendientes = useCallback((cantidad = 1) => {
        setPendingCount(prev => Math.max(0, prev - cantidad));
    }, []);

    const establecerPendientes = useCallback((count) => {
        setPendingCount(count);
    }, []);

    const guardarUltimoSync = async () => {
        try {
            await AsyncStorage.setItem(ULTIMO_SYNC_KEY, new Date().toISOString());
        } catch (error) {
            // console removed
        }
    };

    const obtenerUltimoSync = async () => {
        try {
            const fecha = await AsyncStorage.getItem(ULTIMO_SYNC_KEY);
            return fecha ? new Date(fecha) : null;
        } catch {
            return null;
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                pendingCount,
                setPendingCount: establecerPendientes,
                agregarNotificacion,
                agregarNotificacionSync,
                marcarLeida,
                limpiarNotificaciones,
                limpiarNotificacion,
                decrementarPendientes,
                guardarUltimoSync,
                obtenerUltimoSync,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

export { ICONOS_NOTIFICACION };
