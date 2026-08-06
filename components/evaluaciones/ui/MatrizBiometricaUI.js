import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useLocalSearchParams } from 'expo-router';
import { useMatrizBiometrica } from '../hooks/useMatrizBiometrica';

export default function MatrizBiometricaUI() {
    const params = useLocalSearchParams();
    const {
        isLoading, isSaving, isReadOnly,
        muestras, filas, valores,
        agregarMuestra, agregarFila, eliminarFila, actualizarFila, actualizarValor,
        guardarEvaluacionFinal, router
    } = useMatrizBiometrica(params);

    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        /* 1. Usamos SafeAreaView para respetar los bordes físicos del dispositivo (notches) */
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>

                {/* 2. Header Ajustado */}
                <View style={styles.headerLandscape}>
                    <View style={styles.headerSide}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#0f172a" />
                            <Text style={styles.backText}>Volver</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerCenter}>
                        <Text style={styles.title} numberOfLines={1}>Matriz de Evaluación</Text>
                    </View>

                    <View style={styles.headerSideRight}>
                        {!isReadOnly && (
                            <TouchableOpacity
                                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                                onPress={guardarEvaluacionFinal}
                                disabled={isSaving}
                            >
                                {isSaving ? <ActivityIndicator color="#fff" size="small" /> : (
                                    <>
                                        <MaterialCommunityIcons name="content-save-check" size={18} color="#fff" />
                                        <Text style={styles.saveBtnText}>Guardar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 3. Contenedor de la tabla restringido al ancho de la pantalla */}
                <View style={styles.tableWrapper}>
                    {!isReadOnly && (
                        <View style={styles.toolbar}>
                            <TouchableOpacity style={styles.actionBtn} onPress={agregarFila}>
                                <MaterialCommunityIcons name="table-row-plus-after" size={16} color="#059669" />
                                <Text style={styles.actionText}>Nueva Fila</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={agregarMuestra}>
                                <MaterialCommunityIcons name="table-column-plus-after" size={16} color="#059669" />
                                <Text style={styles.actionText}>Añadir Planta</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        style={styles.horizontalScroll}
                        contentContainerStyle={styles.horizontalScrollContent} // Clave para el scroll interno
                    >
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.th, { width: 80 }]}>Parcela</Text>
                                <Text style={[styles.th, { width: 100 }]}>Tratamiento</Text>
                                <Text style={[styles.th, { width: 90 }]}>Repetición</Text>
                                <Text style={[styles.th, { width: 140, textAlign: 'left', paddingLeft: 12 }]}>Variable</Text>

                                {muestras.map((muestra, idx) => (
                                    <Text key={idx} style={[styles.th, styles.thDataCol]}>{muestra}</Text>
                                ))}
                                {!isReadOnly && filas.length > 1 && <View style={{ width: 44 }} />}
                            </View>

                            <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.verticalScrollContent}>
                                {filas.map((fila, index) => (
                                    <View key={fila.id} style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                                        <TextInput
                                            style={[styles.tdInput, { width: 80 }]}
                                            value={fila.parcela}
                                            onChangeText={(val) => actualizarFila(fila.id, 'parcela', val)}
                                            placeholder="P1"
                                        />
                                        <TextInput
                                            style={[styles.tdInput, { width: 100 }]}
                                            value={fila.tratamiento}
                                            onChangeText={(val) => actualizarFila(fila.id, 'tratamiento', val)}
                                            placeholder="Testigo"
                                        />
                                        <TextInput
                                            style={[styles.tdInput, { width: 90 }]}
                                            value={fila.repeticion}
                                            onChangeText={(val) => actualizarFila(fila.id, 'repeticion', val)}
                                            placeholder="R1"
                                        />
                                        <View style={[styles.tdInput, { width: 140, paddingHorizontal: 4 }]}>
                                            <TextInput
                                                style={styles.variableInput}
                                                value={fila.variable}
                                                onChangeText={(val) => actualizarFila(fila.id, 'variable', val)}
                                                placeholder="Altura (cm)"
                                            />
                                        </View>

                                        {muestras.map((_, mIdx) => (
                                            <TextInput
                                                key={`${fila.id}-${mIdx}`}
                                                style={[styles.tdInput, styles.tdDataCol]}
                                                value={valores[`${fila.id}-${mIdx}`] || ''}
                                                onChangeText={(val) => actualizarValor(fila.id, mIdx, val)}
                                                placeholder="-"
                                            />
                                        ))}

                                        {!isReadOnly && filas.length > 1 && (
                                            <TouchableOpacity onPress={() => eliminarFila(fila.id)} style={styles.deleteIconCell}>
                                                <MaterialCommunityIcons name="minus-circle" size={22} color="#ef4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
    container: { flex: 1, width: '100%' }, // Asegura que el contenedor respete el ancho de pantalla

    // Header flexbox corregido
    headerLandscape: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', width: '100%' },
    headerSide: { flex: 1, alignItems: 'flex-start' },
    headerCenter: { flex: 2, alignItems: 'center' },
    headerSideRight: { flex: 1, alignItems: 'flex-end' },

    backBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 6, borderRadius: 8 },
    backText: { color: '#0f172a', fontWeight: '700', marginLeft: 2, marginRight: 6 },
    title: { fontSize: 15, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 },
    saveBtn: { flexDirection: 'row', backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
    saveBtnDisabled: { backgroundColor: '#94a3b8' },
    saveBtnText: { color: '#fff', fontWeight: '900', marginLeft: 4 },

    tableWrapper: { flex: 1, padding: 12, width: '100%' }, // Ancho estricto
    toolbar: { flexDirection: 'row', marginBottom: 8, gap: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#a7f3d0' },
    actionText: { fontWeight: '800', fontSize: 13, color: '#059669', marginLeft: 6 },

    // ScrollView constraints
    horizontalScroll: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
    horizontalScrollContent: { flexGrow: 1 }, // Permite que el contenido se expanda
    tableContainer: { alignSelf: 'flex-start', minWidth: '100%' },

    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f8fafc', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    th: { fontSize: 11, fontWeight: '900', color: '#64748b', textAlign: 'center', textTransform: 'uppercase', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
    thDataCol: { width: 90 },

    verticalScrollContent: { flexGrow: 1, paddingBottom: 20 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    rowEven: { backgroundColor: '#ffffff' },
    rowOdd: { backgroundColor: '#fafaf9' },

    tdInput: { paddingVertical: 12, paddingHorizontal: 8, fontSize: 14, color: '#0f172a', borderRightWidth: 1, borderRightColor: '#e2e8f0', backgroundColor: '#f8fafc' },
    tdDataCol: { width: 90, textAlign: 'center', fontWeight: '800' },
    variableInput: { flex: 1, fontSize: 13, fontWeight: '800', color: '#334155', paddingVertical: 0 },
    deleteIconCell: { width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fef2f2' }
});