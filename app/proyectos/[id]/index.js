// ============================================
// PROYECTO DETALLE - Pantalla de Edicion de Proyecto
// ============================================
// Navegacion: app/proyectos/[id]/index.js
// Muestra formulario para editar el proyecto seleccionado

import React from 'react';
import { View, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../services/theme';
import EditarProyectoForm from '../../../components/proyectos/ui/EditarProyectoForm';
import { useEditarProyecto } from '../../../components/proyectos/hooks/useEditarProyecto';

export default function ProyectoDetalleScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();

    const {
        proyecto,
        lotes,
        isLoading,
        isSaving,
        error,
        guardarProyecto,
        cargarLotes,
        colaboradores,
        isNewProject,
    } = useEditarProyecto(id);

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#F2F2F7' }}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                translucent
                backgroundColor="transparent"
            />
            <EditarProyectoForm
                proyecto={proyecto}
                lotes={lotes}
                isLoading={isLoading}
                isSaving={isSaving}
                error={error}
                onGuardar={guardarProyecto}
                cargarLotes={cargarLotes}
                colaboradores={colaboradores}
                isNewProject={isNewProject}
            />
        </View>
    );
}
