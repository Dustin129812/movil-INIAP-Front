import { useState, useCallback } from 'react';
import { proyectosLocalService } from '../../../services/proyectos';

export const useNuevaVisita = (proyectoId, onVisitaSaved = null) => {
    const [formData, setFormData] = useState({
        tecnico_nombre: '',
        fecha_visita: new Date().toISOString().split('T')[0],
        observaciones: '',
        recomendaciones: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const validar = useCallback(() => {
        if (!formData.fecha_visita) {
            setError('La fecha de visita es requerida');
            return false;
        }
        if (!formData.tecnico_nombre || formData.tecnico_nombre.trim() === '') {
            setError('El nombre del técnico es requerido');
            return false;
        }
        return true;
    }, [formData]);

    const guardarVisita = useCallback(async (cicloId = null) => {
        if (!validar()) return { success: false };

        setIsSaving(true);
        setError(null);

        try {
            const resultado = await proyectosLocalService.crearVisitaLocal({
                proyecto_id: proyectoId,
                ciclo_id: cicloId,
                tecnico_nombre: formData.tecnico_nombre.trim(),
                fecha_visita: formData.fecha_visita,
                observaciones: formData.observaciones?.trim() || null,
                recomendaciones: formData.recomendaciones?.trim() || null,
            });

            if (resultado.success) {
                // Limpiar formulario
                setFormData({
                    tecnico_nombre: '',
                    fecha_visita: new Date().toISOString().split('T')[0],
                    observaciones: '',
                    recomendaciones: '',
                });
                // Notificar si hay callback
                if (onVisitaSaved) {
                    onVisitaSaved(formData.fecha_visita);
                }
                return { success: true, visita: resultado.visita };
            }

            setError(resultado.message || 'Error al guardar');
            return { success: false };
        } catch (err) {
            // console removed
            setError('Error al guardar la visita');
            return { success: false };
        } finally {
            setIsSaving(false);
        }
    }, [formData, proyectoId, validar]);

    const limpiarFormulario = useCallback(() => {
        setFormData({
            tecnico_nombre: '',
            fecha_visita: new Date().toISOString().split('T')[0],
            observaciones: '',
            recomendaciones: '',
        });
        setError(null);
    }, []);

    return {
        formData,
        updateField,
        guardarVisita,
        limpiarFormulario,
        isSaving,
        error,
    };
};
