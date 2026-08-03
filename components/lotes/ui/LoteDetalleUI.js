import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Alert,
    Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { lotesService } from '../../../services/lotesService';
import { useTheme } from '../../../services/ThemeContext';

const ESTILOS_STATUS = {
    PENDING: { color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.12)', text: 'Pendiente' },
    SYNCED: { color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.12)', text: 'Activo' },
    DRAFT: { color: '#8E8E93', bgColor: 'rgba(142, 142, 147, 0.12)', text: 'Borrador' },
};

function VerticeItem({ vertice, index, isDark }) {
    const bg = isDark ? '#2C2C2E' : '#F5F5F7';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#98989F' : '#8E8E93';

    return (
        <View style={[styles.verticeItem, { backgroundColor: bg }]}>
            <View style={styles.verticeNumber}>
                <Text style={[styles.verticeNumberText, { color: '#34C759' }]}>{index + 1}</Text>
            </View>
            <View style={styles.verticeCoords}>
                <Text style={[styles.coordLabel, { color: textSecondary }]}>Lng</Text>
                <Text style={[styles.coordValue, { color: textPrimary }]}>{vertice[0]?.toFixed(6)}</Text>
            </View>
            <View style={styles.verticeCoords}>
                <Text style={[styles.coordLabel, { color: textSecondary }]}>Lat</Text>
                <Text style={[styles.coordValue, { color: textPrimary }]}>{vertice[1]?.toFixed(6)}</Text>
            </View>
        </View>
    );
}

function StatusPickerModal({ visible, currentStatus, onSelect, onClose, isDark }) {
    const opciones = [
        { value: 'pendiente', label: 'Pendiente', color: '#FF9500' },
        { value: 'verificado', label: 'Activo', color: '#34C759' },
    ];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.statusPickerCard, isDark && styles.statusPickerCardDark]}>
                    <Text style={[styles.statusPickerTitle, isDark && { color: '#fff' }]}>Cambiar Estado</Text>
                    {opciones.map((op) => (
                        <TouchableOpacity
                            key={op.value}
                            style={[
                                styles.statusOption,
                                currentStatus === op.value && styles.statusOptionActive,
                                { borderColor: op.color }
                            ]}
                            onPress={() => onSelect(op.value)}
                        >
                            <View style={[styles.statusDot, { backgroundColor: op.color }]} />
                            <Text style={[styles.statusOptionText, isDark && { color: '#fff' }]}>{op.label}</Text>
                            {currentStatus === op.value && (
                                <MaterialCommunityIcons name="check" size={20} color={op.color} />
                            )}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.statusCancelBtn} onPress={onClose}>
                        <Text style={styles.statusCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

export default function LoteDetalleUI() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();

    const [loteData, setLoteData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusPickerVisible, setStatusPickerVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const bg = isDark ? '#121212' : '#F2F2F7';
    const cardBg = isDark ? '#1E1E24' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#98989F' : '#8E8E93';
    const dividerColor = isDark ? '#3A3A3C' : '#E5E5EA';
    const badgeBg = isDark ? '#2C2C2E' : '#F2F2F7';
    const metricsBg = isDark ? '#2C2C2E' : '#F9F9FB';

    useEffect(() => {
        if (id) {
            cargarLote();
        }
    }, [id]);

    const cargarLote = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await lotesService.obtenerLote(id);
            if (data) {
                setLoteData(data);
            } else {
                setError('Lote no encontrado');
            }
        } catch (err) {
            setError('Error al cargar el lote');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (nuevoEstado) => {
        setStatusPickerVisible(false);
        setIsUpdating(true);
        try {
            const result = await lotesService.cambiarEstadoLote(id, nuevoEstado);
            if (result.success) {
                setLoteData(prev => ({
                    ...prev,
                    estado_verificacion: nuevoEstado,
                    sync_status: nuevoEstado === 'verificado' ? 'SYNCED' : 'PENDING',
                }));
                Alert.alert('Éxito', 'Estado actualizado correctamente');
            } else {
                Alert.alert('Error', result.message || 'No se pudo actualizar');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo actualizar el estado');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: bg }]}>
                <ActivityIndicator size="large" color="#34C759" />
                <Text style={[styles.loadingText, { color: textSecondary }]}>Cargando lote...</Text>
            </View>
        );
    }

    if (error || !loteData) {
        return (
            <View style={[styles.centered, { backgroundColor: bg }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF3B30" />
                <Text style={[styles.errorText, { color: textSecondary }]}>{error || 'Lote no encontrado'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                    <Text style={styles.retryText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusConfig = ESTILOS_STATUS[loteData.sync_status] || ESTILOS_STATUS.DRAFT;
    const shortUuid = loteData.uuid_movil ? loteData.uuid_movil.substring(0, 8).toUpperCase() : 'N/A';
    const vertices = loteData.vertices || [];

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <StatusPickerModal
                visible={statusPickerVisible}
                currentStatus={loteData.estado_verificacion}
                onSelect={handleStatusChange}
                onClose={() => setStatusPickerVisible(false)}
                isDark={isDark}
            />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: cardBg }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalle del Lote</Text>
                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: 'rgba(10, 132, 255, 0.15)' }]}
                    onPress={() => router.push(`/lotes/nuevo?edit=${id}`)}
                >
                    <MaterialCommunityIcons name="pencil-outline" size={20} color="#0A84FF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* UUID Card */}
                <View style={[styles.uuidCard, { backgroundColor: cardBg }]}>
                    <MaterialCommunityIcons name="barcode-scan" size={24} color="#34C759" />
                    <Text style={styles.uuidText}>{shortUuid}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.text}</Text>
                    </View>
                </View>

                {/* Nombre y Estado */}
                <View style={[styles.nameCard, { backgroundColor: cardBg }]}>
                    <Text style={[styles.loteNombre, { color: textPrimary }]}>{loteData.nombre_lote}</Text>
                    <TouchableOpacity
                        style={[styles.changeStatusBtn, { backgroundColor: badgeBg }]}
                        onPress={() => setStatusPickerVisible(true)}
                    >
                        <MaterialCommunityIcons name="swap-horizontal" size={16} color={statusConfig.color} />
                        <Text style={[styles.changeStatusText, { color: statusConfig.color }]}>Cambiar Estado</Text>
                    </TouchableOpacity>
                </View>

                {/* Ubicación */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>UBICACIÓN</Text>
                    <View style={[styles.card, { backgroundColor: cardBg }]}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLabelContainer}>
                                <MaterialCommunityIcons name="map-marker-outline" size={18} color="#34C759" />
                                <Text style={[styles.infoLabel, { color: textSecondary }]}>Ubicación</Text>
                            </View>
                            <Text style={[styles.infoValue, { color: textPrimary }]}>
                                {loteData.ubicacion_manual || 'No asignada'}
                            </Text>
                        </View>
                        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: dividerColor }]}>
                            <View style={styles.infoLabelContainer}>
                                <MaterialCommunityIcons name="map-outline" size={18} color="#34C759" />
                                <Text style={[styles.infoLabel, { color: textSecondary }]}>Provincia</Text>
                            </View>
                            <Text style={[styles.infoValue, { color: textPrimary }]}>{loteData.provincia || '-'}</Text>
                        </View>
                        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: dividerColor }]}>
                            <View style={styles.infoLabelContainer}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color="#34C759" />
                                <Text style={[styles.infoLabel, { color: textSecondary }]}>Cantón</Text>
                            </View>
                            <Text style={[styles.infoValue, { color: textPrimary }]}>{loteData.canton || '-'}</Text>
                        </View>
                        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: dividerColor }]}>
                            <View style={styles.infoLabelContainer}>
                                <MaterialCommunityIcons name="terrain" size={18} color="#34C759" />
                                <Text style={[styles.infoLabel, { color: textSecondary }]}>Altitud</Text>
                            </View>
                            <Text style={[styles.infoValue, { color: textPrimary }]}>
                                {loteData.altitud ? `${loteData.altitud} m` : '-'}
                            </Text>
                        </View>
                        {loteData.parroquia && (
                            <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: dividerColor }]}>
                                <View style={styles.infoLabelContainer}>
                                    <MaterialCommunityIcons name="home-city-outline" size={18} color="#34C759" />
                                    <Text style={[styles.infoLabel, { color: textSecondary }]}>Parroquia</Text>
                                </View>
                                <Text style={[styles.infoValue, { color: textPrimary }]}>{loteData.parroquia}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Geometría / Vértices */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>GEOMETRÍA</Text>
                    <View style={[styles.card, { backgroundColor: cardBg }]}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLabelContainer}>
                                <MaterialCommunityIcons name="vector-polygon" size={18} color="#34C759" />
                                <Text style={[styles.infoLabel, { color: textSecondary }]}>Total Vértices</Text>
                            </View>
                            <Text style={[styles.infoValueLarge, { color: textPrimary }]}>{vertices.length}</Text>
                        </View>
                    </View>

                    {/* Lista de Vértices */}
                    {vertices.length > 0 && (
                        <View style={[styles.verticesCard, { backgroundColor: cardBg }]}>
                            <Text style={[styles.verticesTitle, { color: textPrimary }]}>Coordenadas</Text>
                            {vertices.map((v, i) => (
                                <VerticeItem key={i} vertice={v} index={i} isDark={isDark} />
                            ))}
                        </View>
                    )}
                </View>

                {/* Tipo de Riego */}
                {loteData.tipo_riego && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textSecondary }]}>CARACTERÍSTICAS</Text>
                        <View style={[styles.card, { backgroundColor: cardBg }]}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoLabelContainer}>
                                    <MaterialCommunityIcons name="water-outline" size={18} color="#0A84FF" />
                                    <Text style={[styles.infoLabel, { color: textSecondary }]}>Tipo Riego</Text>
                                </View>
                                <Text style={[styles.infoValue, { color: textPrimary }]}>
                                    {loteData.tipo_riego?.replace('_', ' ') || '-'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Proyectos */}
                {loteData.proyectos && loteData.proyectos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: textSecondary }]}>PROYECTOS</Text>
                        {loteData.proyectos.map((proyecto) => (
                            <View key={proyecto.id} style={[styles.card, { backgroundColor: cardBg, marginBottom: 8 }]}>
                                <Text style={[styles.proyectoTitulo, { color: textPrimary }]}>{proyecto.titulo}</Text>
                                <Text style={[styles.proyectoInfo, { color: textSecondary }]}>
                                    Cultivo: {proyecto.cultivo || 'Sin asignar'}
                                </Text>
                                <Text style={[styles.proyectoInfo, { color: textSecondary }]}>
                                    Variedades: {proyecto.variedades_ids?.length || 0}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Fecha Creación */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>INFORMACIÓN</Text>
                    <View style={[styles.card, { backgroundColor: cardBg }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: textSecondary }]}>Fecha Creación</Text>
                            <Text style={[styles.infoValue, { color: textPrimary }]}>
                                {loteData.fecha_creacion ? new Date(loteData.fecha_creacion).toLocaleDateString('es-EC') : '-'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {isUpdating && (
                <View style={styles.updatingOverlay}>
                    <ActivityIndicator size="large" color="#34C759" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 16, color: '#8E8E93', fontWeight: '600', fontSize: 16 },
    errorText: { marginTop: 16, color: '#8E8E93', fontWeight: '600', fontSize: 16, textAlign: 'center' },
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
    editButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },

    uuidCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    uuidText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 16,
        fontWeight: '900',
        color: '#34C759',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

    nameCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    loteNombre: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 12,
    },
    changeStatusBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    changeStatusText: { fontSize: 12, fontWeight: '600' },

    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: { fontSize: 14, color: '#8E8E93' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#000' },
    infoValueLarge: { fontSize: 22, fontWeight: '900', color: '#000' },

    verticesCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
    },
    verticesTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
    },
    verticeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        marginBottom: 6,
    },
    verticeNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(52, 199, 89, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    verticeNumberText: { fontSize: 12, fontWeight: '800' },
    verticeCoords: { flex: 1 },
    coordLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    coordValue: { fontSize: 13, fontWeight: '700' },

    proyectoTitulo: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    proyectoInfo: { fontSize: 13, marginTop: 2 },

    updatingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Status Picker Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusPickerCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        maxWidth: 320,
    },
    statusPickerCardDark: { backgroundColor: '#2C2C2E' },
    statusPickerTitle: { fontSize: 18, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 16 },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        marginBottom: 8,
        borderColor: '#E5E5EA',
    },
    statusOptionActive: { backgroundColor: 'rgba(52, 199, 89, 0.08)' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    statusOptionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#000' },
    statusCancelBtn: { marginTop: 8, padding: 14, alignItems: 'center' },
    statusCancelText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
});
