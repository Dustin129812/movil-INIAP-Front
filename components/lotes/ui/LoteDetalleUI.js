import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLoteDetalle } from '../hooks/useLoteDetalle';

export default function LoteDetalleUI({ loteUuid }) {
    const router = useRouter();
    const { loteData, listaProyectos, isLoading, error } = useLoteDetalle(loteUuid);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#34C759" />
                <Text style={styles.loadingText}>Cargando detalles...</Text>
            </View>
        );
    }

    if (error || !loteData) {
        return (
            <View style={styles.centered}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF3B30" />
                <Text style={styles.errorText}>{error || 'Lote no encontrado'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                    <Text style={styles.retryText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const shortUuid = loteData.uuid_movil ? loteData.uuid_movil.substring(0, 8).toUpperCase() : 'N/A';
    const verticesCount = loteData.coordenadas ? loteData.coordenadas.length : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalle del Lote</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.uuidCard}>
                    <MaterialCommunityIcons name="barcode-scan" size={24} color="#34C759" />
                    <Text style={styles.uuidText}>{shortUuid}</Text>
                </View>

                <Text style={styles.loteNombre}>{loteData.nombre_lote}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Geometría</Text>
                    <View style={styles.card}>
                        <View style={styles.metricRow}>
                            <MaterialCommunityIcons name="vector-polygon" size={22} color="#34C759" />
                            <Text style={styles.metricLabel}>Vértices</Text>
                            <Text style={styles.metricValue}>{verticesCount}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ubicación</Text>
                    <View style={styles.card}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Ubicación</Text>
                            <Text style={styles.infoValue}>{loteData.ubicacion_manual || 'No asignada'}</Text>
                        </View>
                    </View>
                </View>

                {loteData.condiciones_terreno && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Condiciones del Terreno</Text>
                        <View style={styles.card}>
                            {loteData.condiciones_terreno.cultivo_anterior && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Cultivo Anterior</Text>
                                    <Text style={styles.infoValue}>{loteData.condiciones_terreno.cultivo_anterior}</Text>
                                </View>
                            )}
                            {loteData.condiciones_terreno.tipo_riego && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Tipo de Riego</Text>
                                    <Text style={styles.infoValue}>{loteData.condiciones_terreno.tipo_riego}</Text>
                                </View>
                            )}
                            {loteData.condiciones_terreno.topografia && (
                                <View style={[styles.infoRow, styles.lastRow]}>
                                    <Text style={styles.infoLabel}>Topografía</Text>
                                    <Text style={styles.infoValue}>{loteData.condiciones_terreno.topografia}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 16, color: '#64748b', fontWeight: '600', fontSize: 16 },
    errorText: { marginTop: 16, color: '#64748b', fontWeight: '600', fontSize: 16, textAlign: 'center' },
    retryButton: { marginTop: 16, backgroundColor: '#34C759', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    retryText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#34C759',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },

    uuidCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    uuidText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 18,
        fontWeight: '900',
        color: '#34C759',
        marginLeft: 12,
    },

    loteNombre: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 24,
        textAlign: 'center',
    },

    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metricLabel: { flex: 1, fontSize: 16, color: '#64748b' },
    metricValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E5EA',
    },
    lastRow: { borderBottomWidth: 0 },
    infoLabel: { fontSize: 16, color: '#64748b' },
    infoValue: { fontSize: 16, fontWeight: '600', color: '#0f172a', maxWidth: '50%', textAlign: 'right' },
});
