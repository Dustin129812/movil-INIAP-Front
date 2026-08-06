// export const API_BASE_URL = 'http://172.18.101.50:8000/api/kopia';

// /**
//  * Cliente HTTP general para la aplicación.
//  * @param {string} endpoint - La ruta específica (ej. '/login' o '/catalogosMobile')
//  * @param {object} options - Opciones nativas de fetch (method, body, headers extras)
//  */
// export const fetchApi = async (endpoint, options = {}) => {
//     const url = `${API_BASE_URL}${endpoint}`;

//     const defaultHeaders = {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     };

//     const response = await fetch(url, {
//         ...options,
//         headers: {
//             ...defaultHeaders,
//             ...(options.headers || {}),
//         },
//     });

//     return response;
// };