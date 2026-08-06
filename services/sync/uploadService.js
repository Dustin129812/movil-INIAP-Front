// ============================================================================
// UPLOAD SERVICE - TEMPORALMENTE FUERA DE SERVICIO
// ============================================================================
// Este módulo está temporalmente deshabilitado debido a dependencias faltantes:
// - expo-secure-store
// - @react-native-community/netinfo
//
// Pendiente: implementar funcionalidad de sincronización offline cuando
// se resuelvan las dependencias necesarias.
// ============================================================================

// import NetInfo from '@react-native-community/netinfo';
// import * as SecureStore from 'expo-secure-store';
// import { db } from '../../db/client';
// import { lotes, ciclos, visitas, hojas_datos, proyectos, configuracion, SYNC_STATUS } from '../../db/schema';
// import { eq, or, inArray, and, isNull } from 'drizzle-orm';
// import { v4 as uuidv4 } from 'uuid';
// import { fetchApi } from '../apiClient';

/**
 * Obtiene el conteo de registros pendientes por sincronizar.
 * TEMPORAL: Retorna 0 mientras el módulo de sync está deshabilitado.
 */
export const obtenerConteoPendientes = async () => {
    // TODO: Implementar cuando estén disponibles las dependencias de sync
    return 0;
};

/**
 * Motor de sincronización principal.
 * TEMPORAL: Función deshabilitada mientras no estén las dependencias.
 */
export const syncEngine = async () => {
    // TODO: Implementar cuando estén disponibles las dependencias de sync
    // - Verificar conexión de red con NetInfo
    // - Obtener token de SecureStore
    // - Sincronizar lotes, proyectos, ciclos, visitas con el servidor
    console.log('[SyncEngine] Sincronización temporalmente deshabilitada');
};
