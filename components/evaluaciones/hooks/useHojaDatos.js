import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { obtenerContextoEvaluacion } from '../../../services/evaluaciones/evaluacionLocalService';

export const useHojaDatos = () => {
    const router = useRouter();
    const { proyecto_uuid, visita_uuid } = useLocalSearchParams();
    const isEditMode = !!visita_uuid;

    const [isLoading, setIsLoading] = useState(true);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const [loteUuidReal, setLoteUuidReal] = useState(null);
    const [tecnicoId, setTecnicoId] = useState(null);
    const [form, setForm] = useState({ tecnico: '', observaciones: '', recomendaciones: '' });

    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    useEffect(() => {
        const inicializar = async () => {
            setIsLoading(true);
            try {
                const contexto = await obtenerContextoEvaluacion(proyecto_uuid, visita_uuid);
                setTecnicoId(contexto.tecnicoId);
                setLoteUuidReal(contexto.loteUuidReal);

                if (contexto.tecnico) updateForm('tecnico', contexto.tecnico);

                if (isEditMode && contexto.visita) {
                    updateForm('tecnico', contexto.visita.tecnico_nombre || '');
                    updateForm('observaciones', contexto.visita.observaciones || '');
                    updateForm('recomendaciones', contexto.visita.recomendaciones || '');

                    const estadoLimpio = (contexto.visita.estado || '').toString().trim().toUpperCase();
                    setIsReadOnly(estadoLimpio === 'EN NUBE' || estadoLimpio === 'SINCRONIZADO');
                }
            } catch (error) {
                console.log(error);
                Alert.alert('Error', 'No se pudieron cargar los datos de la evaluación.');
            } finally {
                setIsLoading(false);
            }
        };
        inicializar();
    }, [visita_uuid, proyecto_uuid]);

    const irAMatriz = () => {
        if (!form.tecnico.trim()) {
            return Alert.alert('Control de Calidad', 'La evaluación requiere la firma del técnico responsable.');
        }

        router.push({
            pathname: '/ejecucion-campo/matriz-biometrica',
            params: {
                proyecto_uuid,
                visita_uuid,
                loteUuidReal,
                tecnicoId,
                formData: JSON.stringify(form),
                isReadOnly: isReadOnly ? 'true' : 'false'
            }
        });
    };

    return {
        isEditMode, isLoading, isReadOnly, form, updateForm,
        irAMatriz, router
    };
};