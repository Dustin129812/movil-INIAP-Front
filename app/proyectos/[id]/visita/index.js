import React, { useCallback } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NuevaVisitaForm } from '../../../../components/proyectos/ui';
import { useNuevaVisita } from '../../../../components/proyectos/hooks';
import { useLocalNotifications } from '../../../../components/notifications/hooks/useLocalNotifications';

export default function NuevaVisitaScreen() {
    const { id } = useLocalSearchParams();

    const { notifyVisitaGuardada } = useLocalNotifications();

    const handleVisitaSaved = useCallback((fecha) => {
        notifyVisitaGuardada(fecha);
    }, [notifyVisitaGuardada]);

    const {
        formData,
        updateField,
        guardarVisita,
        limpiarFormulario,
        isSaving,
        error,
    } = useNuevaVisita(id, handleVisitaSaved);

    return (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <NuevaVisitaForm
                formData={formData}
                updateField={updateField}
                guardarVisita={() => guardarVisita(null)}
                limpiarFormulario={limpiarFormulario}
                isSaving={isSaving}
                error={error}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
