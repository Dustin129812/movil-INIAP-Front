import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    ImageBackground,
    Image,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { useSearch } from '../context/SearchContext';
import { useTheme } from '../../../services/ThemeContext';
import { lotesService } from '../../../services/lotesService';

import {
    ESTILOS_STATUS,
    ESTADO_OPCIONES,
    getColores,
} from './lotesDashboardColors';

import {
    useCardAnimations,
    useSkeletonAnimations,
} from './lotesDashboardAnimations';

import VerticesMap from './VerticesMap';

// ============================================
// COMPONENTE: Modal Selector de Estado
// ============================================
function StatusPickerModal({ visible, currentStatus, onSelect, onClose, isDark }) {
    const colores = getColores(isDark);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.statusPickerCard, { backgroundColor: colores.statusPickerCard }]}>
                    <Text style={[styles.statusPickerTitle, { color: colores.textPrimary }]}>Cambiar Estado</Text>
                    {ESTADO_OPCIONES.map((op) => (
                        <TouchableOpacity
                            key={op.value}
                            style={[
                                styles.statusOption,
                                currentStatus === op.value && styles.statusOptionActive,
                                { borderColor: colores.statusPickerBorder },
                            ]}
                            onPress={() => onSelect(op.value)}
                        >
                            <View style={[styles.statusDot, { backgroundColor: op.color }]} />
                            <Text style={[styles.statusOptionText, { color: colores.textPrimary }]}>{op.label}</Text>
                            {currentStatus === op.value && (
                                <MaterialCommunityIcons name="check" size={20} color={op.color} />
                            )}
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.statusCancelBtn, { backgroundColor: colores.cancelBtnBg }]}
                        onPress={onClose}
                    >
                        <Text style={styles.statusCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

// ============================================
// COMPONENTE: Tarjeta Animada de Lote
// ============================================
function AnimatedCard({ item, index, getStatusConfig, isDark, onPress, onStatusChange }) {
    const colores = getColores(isDark);
    const statusConfig = getStatusConfig(item.estado_verificacion);
    const shortUuid = item.uuid_movil ? item.uuid_movil.substring(0, 8).toUpperCase() : 'N/A';

    // Obtener vértices reales del item
    const vertices = item.vertices || item.coordenadas || item.puntos || null;
    const verticesCount = vertices
        ? (Array.isArray(vertices) ? vertices.length : 0)
        : (item.vertices_count || 0);

    // Determinar si tiene croquis o imagen
    const hasImage = !!(item.croquis_url || item.imagen_url);
    const hasVertices = verticesCount > 0;

    // Obtener coordenadas de inicio y fin
    const getFirstVertex = () => {
        if (!vertices || !Array.isArray(vertices) || vertices.length === 0) return null;
        const first = vertices[0];
        return Array.isArray(first) ? { lng: first[0], lat: first[1] } : first;
    };

    const getLastVertex = () => {
        if (!vertices || !Array.isArray(vertices) || vertices.length < 2) return null;
        const last = vertices[vertices.length - 1];
        return Array.isArray(last) ? { lng: last[0], lat: last[1] } : last;
    };

    const firstVertex = getFirstVertex();
    const lastVertex = getLastVertex();

    // Cultivo del proyecto asociado
    const cultivo = item.proyectos?.[0]?.cultivo || item.cultivo || null;

    // Formatear coordenada
    const formatCoord = (val) => {
        if (val == null) return '-';
        return val.toFixed(6);
    };

    const { animateIn, handlePressIn, handlePressOut, containerAnimatedStyle } = useCardAnimations(index);

    const defaultImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop';

    useEffect(() => {
        animateIn();
    }, []);

    return (
        <Animated.View style={containerAnimatedStyle}>
            <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={[styles.figmaCardContainer, { backgroundColor: colores.cardBg }]}
            >
                {/* SECCIÓN SUPERIOR: IMAGEN */}
                <ImageBackground
                    source={{ uri: item.imagen_url || defaultImage }}
                    style={styles.figmaImageSection}
                    imageStyle={styles.figmaImageStyle}
                >
                    <View style={styles.imageOverlay} />

                    {/* Fila superior: Estado y Botón Editar */}
                    <View style={styles.figmaTopRow}>
                        <TouchableOpacity
                            onPress={(e) => { e.stopPropagation(); onStatusChange(item); }}
                            activeOpacity={0.8}
                        >
                            <BlurView intensity={60} tint="light" style={styles.figmaPopularBadge}>
                                <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                                <Text style={styles.figmaPopularText}>{statusConfig.text}</Text>
                            </BlurView>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={(e) => { e.stopPropagation(); onPress(); }}
                            activeOpacity={0.8}
                        >
                            <BlurView intensity={60} tint="light" style={styles.figmaHeartBtn}>
                                <MaterialCommunityIcons name="pencil-outline" size={18} color="#111111" />
                            </BlurView>
                        </TouchableOpacity>
                    </View>

                    {/* Fila inferior: Título y Ubicación */}
                    <View style={styles.figmaImageBottomRow}>
                        <View style={styles.figmaTitleArea}>
                            <Text style={styles.figmaCardTitle} numberOfLines={1}>
                                {item.nombre_lote || 'Lote sin nombre'}
                            </Text>
                            <View style={styles.figmaLocationWrapper}>
                                <MaterialCommunityIcons name="map-marker" size={13} color="#FFFFFF" />
                                <Text style={styles.figmaLocationText} numberOfLines={1}>
                                    {item.ubicacion_manual || item.canton || 'Ubicación no definida'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.figmaStartRouteBtn}
                            onPress={(e) => { e.stopPropagation(); onPress(); }}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.figmaStartRouteText}>Editar</Text>
                            <MaterialCommunityIcons name="arrow-right" size={14} color="#111111" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                {/* SECCIÓN INFERIOR: Información detallada */}
                <View style={styles.infoBottomSection}>
                    {/* Fila 1: Ubicación */}
                    <View style={styles.infoRowGrid}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="map-marker-radius" size={14} color={colores.textSecondary} />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Provincia</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.provincia || '-'}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="map-marker-multiple" size={14} color={colores.textSecondary} />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Cantón</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.canton || '-'}
                            </Text>
                        </View>
                    </View>

                    {/* Fila 2: Características */}
                    <View style={styles.infoRowGrid}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="water" size={14} color="#0A84FF" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Riego</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.tipo_riego?.replace(/_/g, ' ') || '-'}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="seed" size={14} color="#34C759" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Cultivo</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {cultivo || '-'}
                            </Text>
                        </View>
                    </View>

                    {/* Fila 3: Vértices y Estación */}
                    <View style={styles.infoRowGrid}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="vector-polygon" size={14} color="#FF9500" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Vértices</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]}>
                                {verticesCount}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="broadcast" size={14} color="#8E8E93" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Estación</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.estacion || '-'}
                            </Text>
                        </View>
                    </View>

                    {/* Fila 4: Coordenadas (solo si hay vértices) */}
                    {hasVertices && firstVertex && (
                        <View style={[styles.coordsRow, { backgroundColor: colores.subCardBg }]}>
                            <View style={styles.coordItem}>
                                <Text style={[styles.coordLabel, { color: colores.textSecondary }]}>Inicio</Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lng: {formatCoord(firstVertex.lng)}
                                </Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lat: {formatCoord(firstVertex.lat)}
                                </Text>
                            </View>
                            <View style={styles.coordDivider} />
                            <View style={styles.coordItem}>
                                <Text style={[styles.coordLabel, { color: colores.textSecondary }]}>Fin</Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lng: {formatCoord(lastVertex?.lng)}
                                </Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lat: {formatCoord(lastVertex?.lat)}
                                </Text>
                            </View>
                            {/* Mini mapa con croquis */}
                            <View style={[styles.miniMapContainer, { backgroundColor: colores.cardBg }]}>
                                <VerticesMap vertices={vertices} color={statusConfig.color} />
                            </View>
                        </View>
                    )}

                    {/* Si no hay vértices, mostrar placeholder del mapa */}
                    {!hasVertices && (
                        <View style={[styles.noVerticesPlaceholder, { backgroundColor: colores.subCardBg }]}>
                            <MaterialCommunityIcons name="vector-polyline" size={24} color={colores.textSecondary} />
                            <Text style={[styles.noVerticesText, { color: colores.textSecondary }]}>
                                Sin vértices capturados
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ============================================
// COMPONENTE: Tarjeta Skeleton (Loading)
// ============================================
function SkeletonCard({ isDark }) {
    const colores = getColores(isDark);
    const { startPulse, animatedStyle } = useSkeletonAnimations();

    useEffect(() => {
        startPulse();
    }, []);

    return (
        <Animated.View style={[styles.skeletonCard, animatedStyle, { backgroundColor: colores.skeletonBg }]}>
            <View style={styles.skeletonHeader}>
                <View style={[styles.skeletonBadge, { backgroundColor: colores.skeletonBadgeBg }]} />
                <View style={[styles.skeletonStatus, { backgroundColor: colores.skeletonBadgeBg }]} />
            </View>
            <View style={[styles.skeletonBlock, { backgroundColor: colores.skeletonBadgeBg }]} />
            <View style={[styles.skeletonMetrics, { backgroundColor: colores.skeletonBadgeBg }]} />
        </Animated.View>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function LotesDashboardUI() {
    const router = useRouter();
    const { isLoading, error, recargar, lotesFiltrados, filtroEstado, setFiltroEstado, searchText, listaLotes } = useSearch();
    const { isDark } = useTheme();

    const colores = getColores(isDark);

    const [statusPickerVisible, setStatusPickerVisible] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const getStatusConfig = (syncStatus) => {
        return ESTILOS_STATUS[syncStatus] || ESTILOS_STATUS.borrador;
    };

    const handlePressLote = (lote) => {
        router.push(`/lotes/${lote.id}?edit=${lote.id}`);
    };

    const handleStatusChange = (lote) => {
        setLoteSeleccionado(lote);
        setStatusPickerVisible(true);
    };

    const handleSelectStatus = async (nuevoEstado) => {
        if (!loteSeleccionado) return;
        setStatusPickerVisible(false);
        setIsUpdatingStatus(true);

        try {
            const result = await lotesService.cambiarEstadoLote(loteSeleccionado.id, nuevoEstado);
            if (result && result.data) {
                Alert.alert('Éxito', 'Estado actualizado correctamente');
                recargar();
            } else {
                Alert.alert('Error', result?.message || 'No se pudo actualizar el estado');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo actualizar el estado');
        } finally {
            setIsUpdatingStatus(false);
            setLoteSeleccionado(null);
        }
    };

    const renderItem = ({ item, index }) => (
        <AnimatedCard
            item={item}
            index={index}
            getStatusConfig={getStatusConfig}
            isDark={isDark}
            onPress={() => handlePressLote(item)}
            onStatusChange={handleStatusChange}
        />
    );

    const renderEmptyState = () => {
        const hasSearch = searchText && searchText.trim().length > 0;
        const hasFilter = filtroEstado !== 'TODOS';
        const isFiltered = hasSearch || hasFilter;

        let title = 'Sin Lotes Encontrados';
        let message = 'Tus registros aparecerán aquí una vez comiences a sincronizar o trazar lotes.';

        if (isFiltered) {
            if (hasSearch && hasFilter) {
                title = 'Sin resultados';
                message = `No se encontraron lotes para "${searchText}" con filtro ${filtroEstado}`;
            } else if (hasSearch) {
                title = 'Sin resultados';
                message = `No se encontraron lotes para "${searchText}"`;
            } else {
                title = 'Sin lotes';
                message = `No hay lotes ${filtroEstado === 'ACTIVOS' ? 'activos' : 'pendientes'}`;
            }
        }

        return (
            <View style={styles.emptyState}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colores.emptyIconBg }]}>
                    <MaterialCommunityIcons
                        name={isFiltered ? "magnify-close" : "map-search-outline"}
                        size={44}
                        color={colores.textSecondary}
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colores.textPrimary }]}>{title}</Text>
                <Text style={[styles.emptyText, { color: colores.textSecondary }]}>{message}</Text>
            </View>
        );
    };

    const renderLoading = () => (
        <View style={styles.skeletonListContainer}>
            <SkeletonCard isDark={isDark} />
            <SkeletonCard isDark={isDark} />
            <SkeletonCard isDark={isDark} />
        </View>
    );

    const renderError = () => (
        <View style={styles.centered}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#FF3B30" />
            <Text style={[styles.errorText, { color: colores.textSecondary }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={recargar} activeOpacity={0.8}>
                <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colores.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <StatusPickerModal
                visible={statusPickerVisible}
                currentStatus={loteSeleccionado?.estado_verificacion}
                onSelect={handleSelectStatus}
                onClose={() => setStatusPickerVisible(false)}
                isDark={isDark}
            />

            <View style={[styles.header, { backgroundColor: colores.bg }]}>
                <View style={styles.headerTopRow}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, { color: colores.textPrimary }]}>Lotes</Text>
                        <View style={[styles.headerDividerVertical, { backgroundColor: colores.dividerColor }]} />
                        <Text style={[styles.headerSubtitle, { color: colores.textSecondary }]}>Gestión y control</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={[styles.counterBadge, { backgroundColor: colores.counterBg }]}>
                            <Text style={[styles.counterText, { color: colores.counterText }]}>{lotesFiltrados.length}</Text>
                        </View>
                    </View>
                </View>

                {/* TABS DE FILTRO */}
                <View style={styles.filterTabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
                        {['TODOS', 'ACTIVOS', 'PENDIENTES'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                activeOpacity={0.7}
                                onPress={() => setFiltroEstado(tab)}
                                style={[
                                    styles.filterTab,
                                    { backgroundColor: colores.badgeBg },
                                    filtroEstado === tab && { backgroundColor: colores.textPrimary },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterTabText,
                                        { color: colores.textSecondary },
                                        filtroEstado === tab && { color: colores.bg },
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {isLoading ? renderLoading() : error ? renderError() : (
                <>
                    {listaLotes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: colores.emptyIconBg }]}>
                                <MaterialCommunityIcons name="folder-open-outline" size={44} color={colores.textSecondary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colores.textPrimary }]}>Sin Registros</Text>
                            <Text style={[styles.emptyText, { color: colores.textSecondary }]}>
                                No hay lotes registrados. Toca el botón + para crear uno nuevo.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={lotesFiltrados}
                            keyExtractor={(item) => item.id?.toString() || item.uuid_movil?.toString()}
                            renderItem={renderItem}
                            ListEmptyComponent={renderEmptyState}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </>
            )}

            {isUpdatingStatus && (
                <View style={styles.updatingOverlay}>
                    <ActivityIndicator size="large" color="#34C759" />
                </View>
            )}
        </View>
    );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { marginTop: 12, fontWeight: '500', fontSize: 15, textAlign: 'center' },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#34C759',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    retryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },

    header: {
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 4,
        paddingHorizontal: 16,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 34,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    headerDividerVertical: { width: 1.5, height: 16 },
    headerSubtitle: { fontSize: 14, fontWeight: '500' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    counterBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    counterText: { fontWeight: '700', fontSize: 13 },

    filterTabsContainer: { marginTop: 16, marginBottom: 8 },
    filterTabsScroll: { flexDirection: 'row', gap: 8 },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterTabText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

    listContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },

    skeletonListContainer: { paddingHorizontal: 16, paddingTop: 12 },
    skeletonCard: {
        borderRadius: 32,
        padding: 16,
        marginBottom: 20,
        height: 340,
        justifyContent: 'space-between',
    },
    skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    skeletonBadge: { width: 80, height: 28, borderRadius: 14 },
    skeletonStatus: { width: 36, height: 36, borderRadius: 18 },
    skeletonBlock: { width: '75%', height: 40, borderRadius: 12 },
    skeletonMetrics: { width: '100%', height: 80, borderRadius: 20 },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 30 },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 },
    emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '400' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusPickerCard: { borderRadius: 24, padding: 24, width: '90%', maxWidth: 340 },
    statusPickerTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 20, letterSpacing: -0.5 },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: 10,
    },
    statusOptionActive: { backgroundColor: 'rgba(52, 199, 89, 0.1)' },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    statusOptionText: { flex: 1, fontSize: 17, fontWeight: '600' },
    statusCancelBtn: { marginTop: 12, padding: 16, alignItems: 'center', borderRadius: 16 },
    statusCancelText: { color: '#FF3B30', fontSize: 17, fontWeight: '700' },

    updatingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Estilos Figma Card
    figmaCardContainer: {
        marginBottom: 24,
        borderRadius: 36,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 6,
    },
    figmaImageSection: {
        height: 240,
        borderRadius: 28,
        padding: 16,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    figmaImageStyle: { borderRadius: 28 },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 28,
    },
    figmaTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    figmaPopularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    figmaPopularText: { color: '#111111', fontSize: 13, fontWeight: '700' },
    figmaHeartBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    figmaImageBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 2,
    },
    figmaTitleArea: { flex: 1, marginRight: 10 },
    figmaCardTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginBottom: 4 },
    figmaLocationWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    figmaLocationText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13, fontWeight: '500' },
    figmaStartRouteBtn: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    figmaStartRouteText: { color: '#111111', fontSize: 13, fontWeight: '700' },

    // Nueva sección de información detallada
    infoBottomSection: {
        paddingTop: 12,
        gap: 8,
    },
    infoRowGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    infoItemLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    infoItemValue: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'right',
    },

    // Coordenadas y mini mapa
    coordsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        gap: 8,
    },
    coordItem: {
        flex: 1,
    },
    coordLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 2,
    },
    coordValue: {
        fontSize: 10,
        fontWeight: '500',
    },
    coordDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(128,128,128,0.2)',
    },
    miniMapContainer: {
        width: 70,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    // Placeholder sin vértices
    noVerticesPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    noVerticesText: {
        fontSize: 12,
        fontWeight: '500',
    },

    // Estilos anteriores (mantenidos por compatibilidad)
    figmaMapImage: { width: '100%', height: '100%', resizeMode: 'cover' },
});
