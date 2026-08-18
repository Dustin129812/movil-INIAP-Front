import { useState, useCallback, useMemo } from 'react';

const VARIABLES_DEFAULT = [
    'Altura planta (cm)',
    'Ancho hoja (cm)',
    'Numero hojas',
    'Largo hoja (cm)',
    'Diametro tallo (cm)',
    'Peso fresco (g)',
    'Peso seco (g)',
];

export const useMatrizBiometrica = (hojaDatosInicial = null) => {
    const [numMuestras, setNumMuestras] = useState(5);
    const [variables, setVariables] = useState(VARIABLES_DEFAULT);
    const [datos, setDatos] = useState(() => {
        if (hojaDatosInicial?.datos_variables) {
            try {
                const datosParse = typeof hojaDatosInicial.datos_variables === 'string'
                    ? JSON.parse(hojaDatosInicial.datos_variables)
                    : hojaDatosInicial.datos_variables;
                return datosParse;
            } catch {
                return inicializarMatriz();
            }
        }
        return inicializarMatriz();
    });
    const [celdaActiva, setCeldaActiva] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    function inicializarMatriz() {
        const matriz = {};
        VARIABLES_DEFAULT.forEach(variable => {
            matriz[variable] = {};
            for (let i = 0; i < numMuestras; i++) {
                matriz[variable][`muestra_${i}`] = '';
            }
        });
        return matriz;
    }

    const actualizarCelda = useCallback((variable, muestra, valor) => {
        setDatos(prev => ({
            ...prev,
            [variable]: {
                ...prev[variable],
                [muestra]: valor,
            },
        }));
    }, []);

    const agregarColumna = useCallback(() => {
        const nuevoNum = numMuestras + 1;
        setNumMuestras(nuevoNum);
        setDatos(prev => {
            const newDatos = { ...prev };
            Object.keys(newDatos).forEach(variable => {
                newDatos[variable][`muestra_${nuevoNum - 1}`] = '';
            });
            return newDatos;
        });
    }, [numMuestras]);

    const eliminarColumna = useCallback((muestraIndex) => {
        setDatos(prev => {
            const newDatos = { ...prev };
            Object.keys(newDatos).forEach(variable => {
                const newMuestras = {};
                Object.keys(newDatos[variable]).forEach((key, idx) => {
                    if (idx !== muestraIndex) {
                        const newKey = idx > muestraIndex ? `muestra_${idx - 1}` : key;
                        newMuestras[newKey] = newDatos[variable][key];
                    }
                });
                newDatos[variable] = newMuestras;
            });
            return newDatos;
        });
        setNumMuestras(prev => prev - 1);
    }, []);

    const promedios = useMemo(() => {
        const result = {};
        variables.forEach(variable => {
            const valores = Object.values(datos[variable] || {})
                .map(v => parseFloat(v))
                .filter(v => !isNaN(v));
            if (valores.length > 0) {
                result[variable] = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2);
            } else {
                result[variable] = '-';
            }
        });
        return result;
    }, [datos, variables]);

    const totales = useMemo(() => {
        const result = {};
        variables.forEach(variable => {
            const valores = Object.values(datos[variable] || {})
                .map(v => parseFloat(v))
                .filter(v => !isNaN(v));
            if (valores.length > 0) {
                result[variable] = valores.reduce((a, b) => a + b, 0).toFixed(2);
            } else {
                result[variable] = '-';
            }
        });
        return result;
    }, [datos, variables]);

    const obtenerDatosParaGuardar = useCallback(() => {
        return {
            datos_variables: datos,
            num_muestras: numMuestras,
            variables: variables,
        };
    }, [datos, numMuestras, variables]);

    return {
        datos,
        variables,
        numMuestras,
        celdaActiva,
        setCeldaActiva,
        promedios,
        totales,
        actualizarCelda,
        agregarColumna,
        eliminarColumna,
        obtenerDatosParaGuardar,
        isSaving,
        setIsSaving,
    };
};
