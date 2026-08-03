import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    StatusBar,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useLotesDashboard } from '../hooks/useLotesDashboard';
import { useTheme } from '../../../services/ThemeContext';
import { lotesService } from '../../../services/lotesService';

const ESTILOS_STATUS = {
    PENDING: { color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.15)', text: 'Pendiente' },
    SYNCED: { color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.15)', text: 'Activo' },
    DRAFT: { color: '#8E8E93', bgColor: 'rgba(142, 142, 147, 0.15)', text: 'Borrador' },
};

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

function AnimatedCard({ item, index, getStatusConfig, isDark, onPress, onStatusChange }) {
    const statusConfig = getStatusConfig(item.sync_status);
    const shortUuid = item.uuid_movil ? item.uuid_movil.substring(0, 8).toUpperCase() : 'N/A';
    const verticesCount = item.vertices_count || 0;

    const cardScale = useSharedValue(1);
    const translateY = useSharedValue(30);
    const opacity = useSharedValue(0);

    // Imagen por defecto (puedes cambiarla si guardas fotos del croquis en tu BD)
    const defaultImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop';

    useEffect(() => {
        const delay = index * 50;
        translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 100 }));
        opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    }, []);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: cardScale.value }
        ],
        opacity: opacity.value,
    }));

    const handlePressIn = () => {
        cardScale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
    };

    const handlePressOut = () => {
        cardScale.value = withSpring(1, { damping: 20, stiffness: 400 });
    };

    return (
        <Animated.View style={animatedContainerStyle}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={styles.glassCardContainer}
            >
                <ImageBackground
                    source={{ uri: item.imagen_url || defaultImage }}
                    style={styles.cardImageBackground}
                    imageStyle={styles.cardImageStyle}
                >
                    {/* Capa de oscurecimiento suave para que el texto resalte */}
                    <View style={styles.imageOverlay} />

                    {/* --- PARTE SUPERIOR --- */}
                    <View style={styles.glassTopRow}>
                        {/* Píldora Superior Izquierda (Estado) */}
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onStatusChange(item); }}>
                            <BlurView intensity={50} tint="light" style={styles.glassPill}>
                                <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                                <Text style={styles.glassPillText}>{statusConfig.text}</Text>
                            </BlurView>
                        </TouchableOpacity>

                        {/* Botón Circular Superior Derecho (Editar) */}
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onPress(); }}>
                            <BlurView intensity={50} tint="light" style={styles.glassCircleBtn}>
                                <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFFFFF" />
                            </BlurView>
                        </TouchableOpacity>
                    </View>

                    {/* --- PARTE INFERIOR --- */}
                    <View style={styles.glassBottomArea}>
                        {/* Título sobre la imagen */}
                        <Text style={styles.glassTitle} numberOfLines={2}>
                            {item.nombre_lote}
                        </Text>
                        <Text style={styles.glassSubtitle}>
                            {verticesCount} vértices • ID: {shortUuid}
                        </Text>

                        {/* Barra Inferior (Estilo del precio en la foto) */}
                        <BlurView intensity={50} tint="dark" style={styles.glassBottomBar}>
                            <View style={styles.glassBarIcon}>
                                <MaterialCommunityIcons name="map-marker" size={20} color="#FFFFFF" />
                            </View>

                            <Text style={styles.glassBarText} numberOfLines={1}>
                                {item.ubicacion_manual || item.canton || 'Ubicación no definida'}
                            </Text>

                            <View style={styles.glassBarIcon}>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                            </View>
                        </BlurView>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
}

function SkeletonCard({ isDark }) {
  const opacity = useSharedValue(0.3);
  const skeletonBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const skeletonBadgeBg = isDark ? '#2C2C2E' : '#F2F2F7';

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 700 }),
        withTiming(0.2, { duration: 700 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.skeletonCard, animatedStyle, { backgroundColor: skeletonBg }]}>
      <View style={styles.skeletonHeader}>
        <View style={[styles.skeletonBadge, { backgroundColor: skeletonBadgeBg }]} />
        <View style={[styles.skeletonStatus, { backgroundColor: skeletonBadgeBg }]} />
      </View>
      <View style={[styles.skeletonBlock, { backgroundColor: skeletonBadgeBg }]} />
      <View style={[styles.skeletonMetrics, { backgroundColor: skeletonBadgeBg }]} />
    </Animated.View>
  );
}

export default function LotesDashboardUI() {
    const router = useRouter();
    const { listaLotes, isLoading, error, recargar } = useLotesDashboard();
    const { isDark } = useTheme();

    const bg = isDark ? '#000000' : '#F2F2F7'; // Fondo más inmersivo
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const dividerColor = isDark ? '#3A3A3C' : '#D1D1D6';
    const badgeBg = isDark ? '#1C1C1E' : '#E5E5EA';
    const searchBarBg = isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.85)';
    const searchBarBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)';
    const counterBg = isDark ? '#1C1C1E' : '#E5E5EA';
    const counterText = isDark ? '#FFFFFF' : '#3A3A3C';
    const buttonBg = isDark ? '#1C1C1E' : '#E5E5EA';
    const emptyIconBg = isDark ? '#1C1C1E' : '#E5E5EA';

    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [statusPickerVisible, setStatusPickerVisible] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const searchProgress = useSharedValue(0);

    const toggleSearch = () => {
        const nextState = !isSearching;
        setIsSearching(nextState);

        searchProgress.value = withTiming(nextState ? 1 : 0, {
            duration: 300, 
            easing: Easing.inOut(Easing.quad), 
        });
        
        if (!nextState) setSearchText('');
    };

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(searchProgress.value, [0, 1], [0, -30]) }],
        opacity: interpolate(searchProgress.value, [0, 1], [1, 0]),
    }));

    const searchBarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(searchProgress.value, [0, 1], [10, 0]) }],
        opacity: searchProgress.value,
        maxHeight: interpolate(searchProgress.value, [0, 1], [0, 50]),
    }));

    const lotesFiltrados = listaLotes.filter(lote => {
        const query = searchText.toLowerCase();
        const nameMatch = lote.nombre_lote?.toLowerCase().includes(query);
        const uuidMatch = lote.uuid_movil?.toLowerCase().includes(query);
        const locationMatch = (lote.ubicacion_manual || '').toLowerCase().includes(query);
        const cantonMatch = (lote.canton || '').toLowerCase().includes(query);
        const matchesSearch = nameMatch || uuidMatch || locationMatch || cantonMatch;

        let matchesStatus = true;
        if (filtroEstado === 'PENDIENTES') {
            matchesStatus = lote.sync_status === 'PENDING';
        } else if (filtroEstado === 'ACTIVOS') {
            matchesStatus = lote.sync_status === 'SYNCED';
        }

        return matchesSearch && matchesStatus;
    });

    const getStatusConfig = (syncStatus) => {
        return ESTILOS_STATUS[syncStatus] || ESTILOS_STATUS.DRAFT;
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
        } catch (error) {
            console.error('handleSelectStatus - Error:', error);
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

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: emptyIconBg }]}>
                <MaterialCommunityIcons name="map-search-outline" size={44} color={textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>Sin Lotes Encontrados</Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
                {searchText || filtroEstado !== 'TODOS'
                    ? 'No hay resultados que coincidan con tus filtros.'
                    : 'Tus registros aparecerán aquí una vez comiences a sincronizar o trazar lotes.'}
            </Text>
        </View>
    );

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
            <Text style={[styles.errorText, { color: textSecondary }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={recargar} activeOpacity={0.8}>
                <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <StatusPickerModal
                visible={statusPickerVisible}
                currentStatus={loteSeleccionado?.estado_verificacion}
                onSelect={handleSelectStatus}
                onClose={() => setStatusPickerVisible(false)}
                isDark={isDark}
            />

            <View style={[styles.header, { backgroundColor: bg }]}>
                <View style={styles.headerTopRow}>
                    <Animated.View style={[styles.headerLeft, titleAnimatedStyle]}>
                        <Text style={[styles.headerTitle, { color: textPrimary }]}>Lotes</Text>
                        <View style={[styles.headerDividerVertical, { backgroundColor: dividerColor }]} />
                        <Text style={[styles.headerSubtitle, { color: textSecondary }]}>Gestión y control</Text>
                    </Animated.View>

                    <View style={styles.headerRight}>
                        <View style={[styles.counterBadge, { backgroundColor: counterBg }]}>
                            <Text style={[styles.counterText, { color: counterText }]}>{lotesFiltrados.length}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.actionIconButton, { backgroundColor: buttonBg }, isSearching && styles.actionButtonActive]}
                            activeOpacity={0.7}
                            onPress={toggleSearch}
                        >
                            <MaterialCommunityIcons
                                name={isSearching ? "close" : "filter-variant"}
                                size={18}
                                color={isSearching ? "#FFFFFF" : (isDark ? '#FFFFFF' : '#3A3A3C')}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <Animated.View style={[styles.liquidSearchBarContainer, searchBarAnimatedStyle]}>
                    <View style={[styles.liquidGlassInputWrapper, { backgroundColor: searchBarBg, borderColor: searchBarBorder }]}>
                        <MaterialCommunityIcons name="magnify" size={18} color={textSecondary} style={{ marginRight: 8 }} />
                        <TextInput
                            style={[styles.liquidInput, { color: textPrimary }]}
                            placeholder="Buscar por nombre, UUID o ubicación..."
                            placeholderTextColor={textSecondary}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus={isSearching}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <MaterialCommunityIcons name="close-circle" size={16} color={textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>

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
                                    { backgroundColor: badgeBg },
                                    filtroEstado === tab && { backgroundColor: textPrimary }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterTabText,
                                        { color: textSecondary },
                                        filtroEstado === tab && { color: bg }
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
                <FlatList
                    data={lotesFiltrados}
                    keyExtractor={(item) => item.id?.toString() || item.uuid_movil?.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {isUpdatingStatus && (
                <View style={styles.updatingOverlay}>
                    <ActivityIndicator size="large" color="#34C759" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        marginTop: 12,
        fontWeight: '500',
        fontSize: 15,
        textAlign: 'center'
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#34C759',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15
    },

    header: {
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 4,
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 34,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        position: 'absolute',
        left: 0,
    },
    headerTitle: {
        fontSize: 28, // Más grande, estilo Apple
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerDividerVertical: {
        width: 1.5,
        height: 16,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500'
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        position: 'absolute',
        right: 0,
    },
    counterBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    counterText: {
        fontWeight: '700',
        fontSize: 13
    },
    actionIconButton: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonActive: {
        backgroundColor: '#34C759', // Apple green para activo
    },

    liquidSearchBarContainer: {
        overflow: 'hidden',
        marginTop: 10,
    },
    liquidGlassInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    liquidInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        padding: 0,
    },

    filterTabsContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    filterTabsScroll: {
        flexDirection: 'row',
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 120
    },

    /* --- NUEVOS ESTILOS DE LA TARJETA (APPLE STYLE) --- */
    appleCard: {
        marginBottom: 16,
        padding: 20,
        borderRadius: 24, // Bordes muy redondeados (App Store style)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    uuidBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    uuidText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    appleCardTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 20,
        letterSpacing: -0.5,
        lineHeight: 28,
    },

    /* Estilo de lista interior (iOS Settings Style) */
    appleRowsContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    appleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    appleIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    appleRowTextContent: {
        flex: 1,
        justifyContent: 'center',
    },
    appleRowTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    appleRowSubtitle: {
        fontSize: 13,
        fontWeight: '400',
    },
    appleRowDivider: {
        height: 1,
        marginLeft: 60, // Para que la línea empiece después del ícono
    },

    /* Botones de acción inferiores */
    appleActions: {
        flexDirection: 'row',
        gap: 10,
    },
    appleActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 6,
    },
    appleActionText: {
        fontSize: 14,
        fontWeight: '700',
    },

    skeletonListContainer: { paddingHorizontal: 16, paddingTop: 12 },
    skeletonCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        height: 220,
        justifyContent: 'space-between',
    },
    skeletonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skeletonBadge: {
        width: 80,
        height: 24,
        borderRadius: 8,
    },
    skeletonStatus: {
        width: 70,
        height: 24,
        borderRadius: 8,
    },
    skeletonBlock: {
        width: '75%',
        height: 28,
        borderRadius: 8,
        marginTop: 10,
    },
    skeletonMetrics: {
        width: '100%',
        height: 60,
        borderRadius: 16,
        marginTop: 20,
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 30,
    },
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

    // Status Picker Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusPickerCard: {
        backgroundColor: '#fff',
        borderRadius: 24, // Bordes consistentes con la tarjeta
        padding: 24,
        width: '90%',
        maxWidth: 340,
    },
    statusPickerCardDark: {
        backgroundColor: '#1C1C1E',
    },
    statusPickerTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: 10,
        borderColor: '#E5E5EA',
    },
    statusOptionActive: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    statusOptionText: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
    },
    statusCancelBtn: {
        marginTop: 12,
        padding: 16,
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: 'rgba(255, 59, 48, 0.1)', // Fondo rojizo sutil para cancelar
    },
    statusCancelText: {
        color: '#FF3B30',
        fontSize: 17,
        fontWeight: '700',
    },

    updatingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- ESTILOS INSPIRADOS EN LA IMAGEN (GLASSMORPHISM) ---

    glassCardContainer: {
        height: 380, // Tarjeta alta para lucir la imagen
        marginBottom: 24,
        borderRadius: 36, // Bordes muy redondeados como en la imagen
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 5,
        backgroundColor: '#1C1C1E', // Fondo por si la imagen tarda en cargar
    },
    cardImageBackground: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
    },
    cardImageStyle: {
        borderRadius: 36,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)', // Oscurece un poco la foto para legibilidad
        borderRadius: 36,
    },

    // Elementos superiores
    glassTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 2,
    },
    glassPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        overflow: 'hidden',
    },
    glassPillText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    glassCircleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    // Elementos inferiores
    glassBottomArea: {
        zIndex: 2,
    },
    glassTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 4,
    },
    glassSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 16,
    },
    glassBottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderRadius: 32,
        overflow: 'hidden',
    },
    glassBarIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassBarText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
});