import React, { useCallback, useState } from 'react';
import { StyleSheet, View, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MatrizBiometricaUI } from '@/components/proyectos/ui';
import { useMatrizBiometrica } from '@/components/proyectos/hooks';
import proyectosLocalService from '@/services/proyectosLocalService';

export default function MatrizBiometricaScreen() {
    const { id, visita: visitaId } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [isSaving, setIsSaving] = useState(false);

    const {
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
    } = useMatrizBiometrica();

    const handleGuardar = useCallback(async () => {
        setIsSaving(true);
        try {
            const datosGuardar = obtenerDatosParaGuardar();
            const resultado = await proyectosLocalService.crearHojaDatosLocal({
                visita_id: visitaId ? parseInt(visitaId) : null,
                nombre_plantilla: 'Evaluación Biométrica',
                datos_variables: datosGuardar.datos_variables,
            });

            if (resultado.success) {
                Alert.alert('Éxito', 'Datos guardados correctamente');
            } else {
                Alert.alert('Error', 'No se pudieron guardar los datos');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error al guardar');
        } finally {
            setIsSaving(false);
        }
    }, [obtenerDatosParaGuardar, visitaId]);

    return (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <View style={{ paddingTop: insets.top }}>
                <MatrizBiometricaUI
                    datos={datos}
                    variables={variables}
                    numMuestras={numMuestras}
                    celdaActiva={celdaActiva}
                    setCeldaActiva={setCeldaActiva}
                    promedios={promedios}
                    totales={totales}
                    actualizarCelda={actualizarCelda}
                    agregarColumna={agregarColumna}
                    eliminarColumna={eliminarColumna}
                    onGuardar={handleGuardar}
                    isSaving={isSaving}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
