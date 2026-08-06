import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { obtenerContextoEvaluacion, guardarEvaluacionLocal } from '../../../services/evaluaciones/evaluacionLocalService';

export const useMatrizBiometrica = (params) => {
    const router = useRouter();
    const { proyecto_uuid, visita_uuid, loteUuidReal, tecnicoId, formData, isReadOnly: readOnlyParam } = params;

    const isEditMode = visita_uuid && visita_uuid !== 'undefined';
    const isReadOnly = readOnlyParam === 'true';
    const form = formData ? JSON.parse(formData) : {};

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [muestras, setMuestras] = useState(['Planta 1']);
    const [filas, setFilas] = useState([
        { id: uuidv4(), parcela: '', tratamiento: '', repeticion: '', variable: '' }
    ]);
    const [valores, setValores] = useState({});

    useEffect(() => {
        const cargarMatrizPrevia = async () => {
            if (isEditMode) {
                try {
                    const contexto = await obtenerContextoEvaluacion(proyecto_uuid, visita_uuid);
                    if (contexto.hoja?.datos_variables) {
                        const { muestras: m, filas: f, valores: val } = contexto.hoja.datos_variables;
                        if (m) setMuestras(m);
                        if (f) setFilas(f);
                        if (val) setValores(val);
                    }
                } catch (error) {
                    console.log('Error cargando matriz previa:', error);
                }
            }
            setIsLoading(false);
        };
        cargarMatrizPrevia();
    }, [proyecto_uuid, visita_uuid]);

    const agregarMuestra = () => setMuestras([...muestras, `Planta ${muestras.length + 1}`]);
    const agregarFila = () => setFilas([...filas, { id: uuidv4(), parcela: '', tratamiento: '', repeticion: '', variable: '' }]);
    const eliminarFila = (id) => { if (filas.length > 1) setFilas(filas.filter(f => f.id !== id)); };
    const actualizarFila = (id, campo, valor) => setFilas(filas.map(f => f.id === id ? { ...f, [campo]: valor } : f));
    const actualizarValor = (filaId, muestraIdx, val) => setValores({ ...valores, [`${filaId}-${muestraIdx}`]: val });

    const guardarEvaluacionFinal = async () => {
        if (isReadOnly) return Alert.alert('Error', 'Registro sincronizado de solo lectura.');

        setIsSaving(true);
        try {
            const matrizDatos = { muestras, filas, valores };

            await guardarEvaluacionLocal(
                isEditMode,
                visita_uuid,
                proyecto_uuid,
                loteUuidReal,
                tecnicoId,
                form,
                matrizDatos
            );

            Alert.alert('Éxito', isEditMode ? 'Registro actualizado correctamente.' : 'Evaluación capturada correctamente.');

            router.navigate({
                pathname: '/ejecucion-campo/proyecto-detalle',
                params: { proyecto_uuid: proyecto_uuid }
            });

        } catch (error) {
            console.log('Error guardando final:', error);
            Alert.alert('Error', 'No se pudo guardar la evaluación en el almacenamiento local.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading, isSaving, isReadOnly,
        muestras, filas, valores,
        agregarMuestra, agregarFila, eliminarFila, actualizarFila, actualizarValor,
        guardarEvaluacionFinal, router
    };
};