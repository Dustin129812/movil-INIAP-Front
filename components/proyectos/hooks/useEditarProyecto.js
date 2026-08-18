// ============================================
// HOOK: useEditarProyecto
// ============================================
// Maneja la carga y actualizacion de un proyecto para edicion
// Origen: app/proyectos/[id]/index.js

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { proyectosLocalService } from '../../../services/proyectos';

export const useEditarProyecto = (proyectoUuid) => {
    const [proyecto, setProyecto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isNewProject, setIsNewProject] = useState(false);

    const cargarProyecto = useCallback(async () => {
        if (!proyectoUuid) return;

        setIsLoading(true);
        setError(null);

        try {
            // 1. Buscar en BD local por uuid_movil
            const resultado = await proyectosLocalService.obtenerProyectoLocal(proyectoUuid);

            if (resultado) {
                setProyecto(resultado);
                setIsNewProject(false);
            } else {
                // 2. No existe localmente - puede ser un proyecto "Por definir" o no existe
                // Verificar si tiene datos que indican que debe existir pero no se guardó localmente
                // Por ahora, marcar como nuevo proyecto para que el formulario permita definirlo
                setIsNewProject(true);
                setProyecto({
                    uuid_movil: proyectoUuid,
                    titulo: '',
                    descripcion: '',
                    variedad: 'Por definir',
                    fecha_siembra: null,
                    estado: 'pendiente',
                    tipo_acolchado: null,
                    tipo_ensayo: null,
                    diseno_experimental: null,
                    financiamiento: null,
                    colaborador_nombre: null,
                    colaborador_telefono: null,
                    colaborador_celular: null,
                    lote_uuid: null,
                });
            }
        } catch (err) {
            // console removed
            setError('Error al cargar el proyecto');
        } finally {
            setIsLoading(false);
        }
    }, [proyectoUuid]);

    useFocusEffect(
        useCallback(() => {
            cargarProyecto();
        }, [cargarProyecto])
    );

    const guardarProyecto = useCallback(async (datosActualizados) => {
        if (!proyectoUuid) return { success: false, message: 'No hay proyecto' };

        setIsSaving(true);
        setError(null);

        try {
            if (isNewProject) {
                // Es un proyecto nuevo que no existía localmente
                const resultado = await proyectosLocalService.crearProyectoLocal({
                    ...datosActualizados,
                    uuid_movil: proyectoUuid,
                });
                if (resultado.success) {
                    await cargarProyecto();
                    setIsNewProject(false);
                    return { success: true };
                }
                return { success: false, message: resultado.message || 'Error al crear proyecto' };
            } else {
                // Proyecto existente - actualizar
                await proyectosLocalService.actualizarProyectoLocal(proyectoUuid, datosActualizados);
                await cargarProyecto();
                return { success: true };
            }
        } catch (err) {
            // console removed
            setError('Error al guardar los cambios');
            return { success: false, message: 'Error al guardar' };
        } finally {
            setIsSaving(false);
        }
    }, [proyectoUuid, isNewProject, cargarProyecto]);

    return {
        proyecto,
        isLoading,
        isSaving,
        error,
        guardarProyecto,
        recargar: cargarProyecto,
        isNewProject,
    };
};

export default useEditarProyecto;
