import { fetchApi } from '../api/apiClient';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_SECURE_STORE = 'userToken';
const TOKEN_ASYNC_STORAGE = 'token_acceso';

async function obtenerToken() {
    const tokenSeguro = await SecureStore.getItemAsync(TOKEN_SECURE_STORE);
    if (tokenSeguro) return tokenSeguro;
    return await AsyncStorage.getItem(TOKEN_ASYNC_STORAGE);
}

async function fetchConAuth(endpoint, options = {}) {
    const token = await obtenerToken();
    if (!token) throw new Error('No hay sesión activa');

    const response = await fetchApi(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
    }

    return data;
}

export async function obtenerEtapasCultivo(cultivoId) {
    return fetchConAuth(`/cultivos/${cultivoId}/etapas`);
}

export async function obtenerTimeline(proyectoId) {
    return fetchConAuth(`/proyectos/${proyectoId}/timeline`);
}

export async function obtenerEtapaActual(proyectoId) {
    return fetchConAuth(`/proyectos/${proyectoId}/etapa-actual`);
}

export async function obtenerSeguimientos(proyectoId) {
    return fetchConAuth(`/proyectos/${proyectoId}/seguimientos`);
}

export async function iniciarSeguimiento(datos) {
    return fetchConAuth('/seguimientos', {
        method: 'POST',
        body: JSON.stringify(datos),
    });
}

export async function avanzarEtapa(seguimientoId) {
    return fetchConAuth(`/seguimientos/${seguimientoId}/avanzar`, {
        method: 'PUT',
    });
}

export async function registrarEvento(seguimientoId, datos) {
    return fetchConAuth(`/seguimientos/${seguimientoId}/eventos`, {
        method: 'POST',
        body: JSON.stringify(datos),
    });
}

export default {
    obtenerEtapasCultivo,
    obtenerTimeline,
    obtenerEtapaActual,
    obtenerSeguimientos,
    iniciarSeguimiento,
    avanzarEtapa,
    registrarEvento,
};
