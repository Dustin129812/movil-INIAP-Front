import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLotesDashboard } from '../hooks/useLotesDashboard';

const ESTILOS_STATUS = {
    PENDING: { color: '#ea580c', bgColor: '#fff7ed', borderColor: '#fed7aa', text: 'Pendiente' },
    SYNCED: { color: '#059669', bgColor: '#ecfdf5', borderColor: '#a7f3d0', text: 'Sincronizado' },
    DRAFT: { color: '#64748b', bgColor: '#f8fafc', borderColor: '#e2e8f0', text: 'Borrador' },
};

export default function LotesDashboardUI() {
    const { listaLotes, isLoading, error } = useLotesDashboard();

    const getStatusConfig = (syncStatus) => {
        return ESTILOS_STATUS[syncStatus] || ESTILOS_STATUS.DRAFT;
    };

    const renderItem = ({ item }) => {
        const statusConfig = getStatusConfig(item.sync_status);
        const shortUuid = item.uuid_movil ? item.uuid_movil.substring(0, 8).toUpperCase() : 'N/A';
        const verticesCount = item.coordenadas ? item.coordenadas.length : 0;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.uuidBadge}>
                        <MaterialCommunityIcons name="barcode-scan" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                        <Text style={styles.uuidText}>{shortUuid}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor, borderColor: statusConfig.borderColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
                    </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>{item.nombre_lote}</Text>

                <View style={styles.metricsContainer}>
                    <View style={styles.metricBox}>
                        <View style={styles.metricIconWrap}>
                            <MaterialCommunityIcons name="vector-polygon" size={18} color="#059669" />
                        </View>
                        <View>
                            <Text style={styles.metricLabel}>Geometría</Text>
                            <Text style={styles.metricValue}>{verticesCount} Vértices</Text>
                        </View>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricBox}>
                        <View style={styles.metricIconWrap}>
                            <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color="#059669" />
                        </View>
                        <View>
                            <Text style={styles.metricLabel}>Ubicación</Text>
                            <Text style={styles.metricValue} numberOfLines={1}>
                                {item.ubicacion_manual || 'No asignada'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="map-search-outline" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>Sin Lotes Registrados</Text>
            <Text style={styles.emptyText}>
                Presiona el botón inferior para trazar un nuevo polígono en tu área de trabajo.
            </Text>
        </View>
    );

    const renderLoading = () => (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#34C759" />
            <Text style={styles.loadingText}>Cargando lotes...</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.centered}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton}>
                <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.headerBackground}>
                <View style={styles.topBar}>
                    <View style={{ width: 44 }} />
                    <View style={styles.headerTitles}>
                        <Text style={styles.headerTitle}>Lotes</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.controlPanel}>
                    <View>
                        <Text style={styles.panelTitle}>Mis Lotes</Text>
                        <Text style={styles.panelSubtitle}>Listado de lotes registrados</Text>
                    </View>
                    <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>{listaLotes.length}</Text>
                    </View>
                </View>
            </View>

            {isLoading ? renderLoading() : error ? renderError() : (
                <FlatList
                    data={listaLotes}
                    keyExtractor={(item) => item.id?.toString() || item.uuid_movil?.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 16, color: '#64748b', fontWeight: '600', fontSize: 16 },
    errorText: { marginTop: 16, color: '#64748b', fontWeight: '600', fontSize: 16, textAlign: 'center' },
    retryButton: { marginTop: 16, backgroundColor: '#34C759', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    retryText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    headerBackground: {
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 60,
        backgroundColor: '#34C759',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 20,
        marginTop: 20,
    },
    headerTitles: { alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

    controlPanel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 10,
    },
    panelTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
    panelSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
    counterBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    counterText: { color: '#fff', fontWeight: '900', fontSize: 16 },

    listContainer: { padding: 20, paddingTop: 20, paddingBottom: 100 },

    card: {
        backgroundColor: '#fff',
        marginBottom: 20,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 4,
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    uuidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    uuidText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 11,
        fontWeight: '900',
        color: '#64748b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

    cardTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 16,
        lineHeight: 26,
        letterSpacing: -0.5,
    },

    metricsContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    metricBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    metricIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    metricValue: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 2 },
    metricDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 16 },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 30,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 32,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
    emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
});
