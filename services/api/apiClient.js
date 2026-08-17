const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL + '/agrodecide';

/**
 * Cliente HTTP centralizado para sync services.
 */
export const fetchApi = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    });

    return response;
};
