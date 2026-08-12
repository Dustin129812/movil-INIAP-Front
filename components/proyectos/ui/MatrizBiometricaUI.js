import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { proyectosStyles } from './proyectosStyles';

export default function MatrizBiometricaUI({
    datos = {},
    variables = [],
    numMuestras = 5,
    celdaActiva,
    setCeldaActiva,
    promedios = {},
    totales = {},
    actualizarCelda,
    agregarColumna,
    eliminarColumna,
    onGuardar,
    isSaving = false,
}) {
    const [mostrarPromedios, setMostrarPromedios] = useState(true);

    const handleCellChange = useCallback((variable, muestra, value) => {
        actualizarCelda(variable, muestra, value);
    }, [actualizarCelda]);

    const handleAgregarColumna = () => {
        agregarColumna();
    };

    const handleEliminarColumna = (index) => {
        Alert.alert(
            'Eliminar Muestra',
            '¿Estás seguro de eliminar esta muestra?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => eliminarColumna(index) },
            ]
        );
    };

    return (
        <View style={proyectosStyles.matrizContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Matriz Biométrica</Text>
                <TouchableOpacity onPress={onGuardar} disabled={isSaving} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={[styles.controlButton, mostrarPromedios && styles.controlButtonActive]}
                    onPress={() => setMostrarPromedios(!mostrarPromedios)}
                >
                    <MaterialCommunityIcons
                        name={mostrarPromedios ? 'eye' : 'eye-off'}
                        size={16}
                        color="#FFFFFF"
                    />
                    <Text style={styles.controlButtonText}>
                        {mostrarPromedios ? 'Ocultar' : 'Mostrar'} Promedios
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={handleAgregarColumna}>
                    <MaterialCommunityIcons name="plus" size={16} color="#30D158" />
                    <Text style={[styles.controlButtonText, { color: '#30D158' }]}>Agregar Muestra</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Header */}
                    <View style={proyectosStyles.matrizHeader}>
                        <View style={[proyectosStyles.matrizHeaderCell, { width: 120 }]}>
                            <Text style={[proyectosStyles.matrizHeaderText, { textAlign: 'left' }]}>Variable</Text>
                        </View>
                        {Array.from({ length: numMuestras }).map((_, i) => (
                            <View key={`header-${i}`} style={proyectosStyles.matrizHeaderCell}>
                                <Text style={proyectosStyles.matrizHeaderText}>M {i + 1}</Text>
                                <TouchableOpacity
                                    style={styles.deleteMuestraBtn}
                                    onPress={() => handleEliminarColumna(i)}
                                >
                                    <MaterialCommunityIcons name="close-circle" size={14} color="#FF453A" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {mostrarPromedios && (
                            <>
                                <View style={proyectosStyles.matrizHeaderCell}>
                                    <Text style={[proyectosStyles.matrizHeaderText, { color: '#30D158' }]}>Prom.</Text>
                                </View>
                                <View style={proyectosStyles.matrizHeaderCell}>
                                    <Text style={[proyectosStyles.matrizHeaderText, { color: '#0A84FF' }]}>Total</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Data Rows */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {variables.map((variable) => (
                            <View key={variable} style={proyectosStyles.matrizRow}>
                                <View style={[proyectosStyles.matrizVariableCell, { width: 120 }]}>
                                    <Text style={proyectosStyles.matrizVariableText} numberOfLines={2}>
                                        {variable}
                                    </Text>
                                </View>
                                {Array.from({ length: numMuestras }).map((_, i) => {
                                    const muestraKey = `muestra_${i}`;
                                    const value = datos[variable]?.[muestraKey] || '';
                                    const isActive = celdaActiva?.variable === variable && celdaActiva?.muestra === muestraKey;

                                    return (
                                        <View key={`${variable}-${i}`} style={proyectosStyles.matrizDataCell}>
                                            <TextInput
                                                style={proyectosStyles.matrizDataInput}
                                                value={value}
                                                onChangeText={(text) => handleCellChange(variable, muestraKey, text)}
                                                onFocus={() => setCeldaActiva({ variable, muestra: muestraKey })}
                                                onBlur={() => setCeldaActiva(null)}
                                                keyboardType="decimal-pad"
                                                placeholder="-"
                                                placeholderTextColor="#48484A"
                                            />
                                        </View>
                                    );
                                })}
                                {mostrarPromedios && (
                                    <>
                                        <View style={[proyectosStyles.matrizFooterCell, { backgroundColor: 'rgba(48, 209, 88, 0.1)' }]}>
                                            <Text style={[proyectosStyles.matrizFooterValue, { color: '#30D158' }]}>
                                                {promedios[variable] || '-'}
                                            </Text>
                                        </View>
                                        <View style={[proyectosStyles.matrizFooterCell, { backgroundColor: 'rgba(10, 132, 255, 0.1)' }]}>
                                            <Text style={[proyectosStyles.matrizFooterValue, { color: '#0A84FF' }]}>
                                                {totales[variable] || '-'}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {numMuestras} muestra{numMuestras !== 1 ? 's' : ''} • {variables.length} variable{variables.length !== 1 ? 's' : ''}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#1C1C1E',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#0A84FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    controlsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        backgroundColor: '#151718',
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    controlButtonActive: {
        backgroundColor: 'rgba(10, 132, 255, 0.3)',
    },
    controlButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
    },
    deleteMuestraBtn: {
        position: 'absolute',
        top: 2,
        right: 2,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1C1C1E',
        borderTopWidth: 1,
        borderTopColor: '#38383A',
    },
    footerText: {
        color: '#8E8E93',
        fontSize: 13,
        textAlign: 'center',
    },
});
