import React, { useState, useEffect, useRef } from 'react';
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
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedReaction,
    withTiming,
    withDelay,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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

const SCREEN_WIDTH = Dimensions.get('window').width;
const TABS = ['TODOS', 'ACTIVOS', 'PENDIENTES'];

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

    const vertices = item.vertices || item.coordenadas || item.puntos || null;
    const verticesCount = vertices
        ? (Array.isArray(vertices) ? vertices.length : 0)
        : (item.vertices_count || 0);

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
    const cultivo = item.proyectos?.[0]?.cultivo || item.cultivo || null;

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
                <ImageBackground
                    source={{ uri: item.imagen_url || defaultImage }}
                    style={styles.figmaImageSection}
                    imageStyle={styles.figmaImageStyle}
                >
                    <View style={styles.imageOverlay} />
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

                <View style={styles.infoBottomSection}>
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

                    {verticesCount > 0 && firstVertex && (
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
                            <View style={[styles.miniMapContainer, { backgroundColor: colores.cardBg }]}>
                                <VerticesMap vertices={vertices} color={statusConfig.color} />
                            </View>
                        </View>
                    )}

                    {verticesCount === 0 && (
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
// COMPONENTE: Tarjeta Skeleton Exacta Estilo YouTube
// ============================================
function SkeletonCard({ isDark }) {
    const colores = getColores(isDark);
    const { startPulse, animatedStyle } = useSkeletonAnimations();

    useEffect(() => {
        startPulse();
    }, []);

    return (
        <Animated.View style={[styles.figmaCardContainer, animatedStyle, { backgroundColor: colores.skeletonBg }]}>
            {/* Bloque grande superior simulando la imagen de la tarjeta */}
            <View style={[styles.figmaImageSection, { backgroundColor: colores.skeletonBadgeBg, height: 210, marginBottom: 12 }]} />
            
            {/* Bloques de líneas simulando los textos (estilo YouTube) */}
            <View style={{ gap: 8 }}>
                <View style={[styles.skeletonLine, { backgroundColor: colores.skeletonBadgeBg, width: '85%', height: 18, borderRadius: 6 }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colores.skeletonBadgeBg, width: '60%', height: 14, borderRadius: 6 }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colores.skeletonBadgeBg, width: '40%', height: 12, borderRadius: 6, marginTop: 4 }]} />
            </View>
        </Animated.View>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function LotesDashboardUI() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isLoading, error, recargar, lotesFiltrados, filtroEstado, setFiltroEstado, searchText, listaLotes } = useSearch();
    const { isDark } = useTheme();

    const colores = getColores(isDark);

    const [statusPickerVisible, setStatusPickerVisible] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const horizontalScrollRef = useRef(null);
    const scrollY = useSharedValue(0);

    // --- Header estilo Apple (mismo patrón que Home) ---
    // El título "Lotes", el contador Y los tabs (TODOS/ACTIVOS/PENDIENTES)
    // se ocultan TODOS juntos apenas se empieza a scrollear, y solo
    // reaparecen cuando el scroll vuelve arriba del todo — o al instante si
    // el usuario desliza el dedo para cambiar de tab (swipe horizontal).
    const TOP_REVEAL_THRESHOLD = 12;
    const HIDE_DURATION = 160;
    const REVEAL_DURATION = 260;
    const STAGGER = 70; // cuánto se retrasa el elemento que va "atrás" en cada dirección

    const titleOpacity = useSharedValue(1);
    const titleTranslateY = useSharedValue(0);
    const counterOpacity = useSharedValue(1);
    const counterTranslateY = useSharedValue(0);
    const tabsOpacity = useSharedValue(1);
    const tabsTranslateY = useSharedValue(0);

    useAnimatedReaction(
        () => scrollY.value <= TOP_REVEAL_THRESHOLD,
        (isAtTop, wasAtTop) => {
            if (isAtTop === wasAtTop) return;

            if (isAtTop) {
                // Reaparece: contador + tabs primero, título con un pequeño retraso
                counterOpacity.value = withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                counterTranslateY.value = withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                tabsOpacity.value = withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                tabsTranslateY.value = withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                titleOpacity.value = withDelay(STAGGER, withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) }));
                titleTranslateY.value = withDelay(STAGGER, withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) }));
            } else {
                // Desaparece: el título se va primero, el contador y los tabs aguantan un poco más
                titleOpacity.value = withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
                titleTranslateY.value = withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
                counterOpacity.value = withDelay(STAGGER, withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
                counterTranslateY.value = withDelay(STAGGER, withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
                tabsOpacity.value = withDelay(STAGGER, withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
                tabsTranslateY.value = withDelay(STAGGER, withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
            }
        },
        [TOP_REVEAL_THRESHOLD]
    );

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }));

    const counterAnimatedStyle = useAnimatedStyle(() => ({
        opacity: counterOpacity.value,
        transform: [{ translateY: counterTranslateY.value }],
    }));

    const tabsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: tabsOpacity.value,
        transform: [{ translateY: tabsTranslateY.value }],
    }));

    // Alturas reales del header, para reservar el espacio justo arriba del
    // contenido SIN dejar un hueco fijo: este padding vive DENTRO del
    // contentContainerStyle de cada lista, así que se scrollea junto con el
    // contenido en vez de quedar pegado como un tope permanente.
    const TITLE_ROW_HEIGHT = 40;
    const TITLE_ROW_MARGIN_TOP = 6;
    const TABS_ROW_HEIGHT = 40;
    const TABS_ROW_MARGIN_TOP = 14;
    const HEADER_BOTTOM_GAP = 10;
    const pinnedTabsHeight = insets.top + TITLE_ROW_MARGIN_TOP + TITLE_ROW_HEIGHT + TABS_ROW_MARGIN_TOP + TABS_ROW_HEIGHT + HEADER_BOTTOM_GAP;

    const handleScroll = (event) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
    };

    // Al deslizar el dedo para cambiar de tab (TODOS/ACTIVOS/PENDIENTES),
    // el header entero (título + contador + tabs) vuelve a aparecer al
    // instante, sin esperar a que el usuario scrollee la lista de vuelta
    // arriba. Como todas las listas comparten el mismo `scrollY`, esto
    // dispara automáticamente la animación de reaparición vía
    // useAnimatedReaction de arriba.
    const revealHeaderForTabChange = () => {
        scrollY.value = 0;
    };

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

    const handleTabPress = (tabName, index) => {
        setFiltroEstado(tabName);
        revealHeaderForTabChange();
        if (horizontalScrollRef.current) {
            horizontalScrollRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: false });
        }
    };

    const handleScrollEnd = (e) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        if (TABS[index] && TABS[index] !== filtroEstado) {
            setFiltroEstado(TABS[index]);
        }
        revealHeaderForTabChange();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await recargar();
        setRefreshing(false);
    };

    const renderEmptyState = (currentTab) => {
        const hasSearch = searchText && searchText.trim().length > 0;
        const hasFilter = currentTab !== 'TODOS';
        const isFiltered = hasSearch || hasFilter;

        let title = 'Sin Lotes Encontrados';
        let message = 'Tus registros aparecerán aquí una vez comiences a sincronizar o trazar lotes.';

        if (isFiltered) {
            if (hasSearch && hasFilter) {
                title = 'Sin resultados';
                message = `No se encontraron lotes para "${searchText}" con filtro ${currentTab}`;
            } else if (hasSearch) {
                title = 'Sin resultados';
                message = `No se encontraron lotes para "${searchText}"`;
            } else {
                title = 'Sin lotes';
                message = `No hay lotes ${currentTab === 'ACTIVOS' ? 'activos' : 'pendientes'}`;
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

    const renderLoadingSkeletons = () => (
        <View style={styles.skeletonListContainer}>
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
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

            <StatusPickerModal
                visible={statusPickerVisible}
                currentStatus={loteSeleccionado?.estado_verificacion}
                onSelect={handleSelectStatus}
                onClose={() => setStatusPickerVisible(false)}
                isDark={isDark}
            />

            {/* Scrim de legibilidad para el status bar: fijo, no se desvanece,
                para que la hora/batería/wifi se lean bien aunque la lista
                pase justo por debajo. */}
            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']
                        : ['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0)']
                }
                style={[styles.statusBarScrim, { height: insets.top + 40 }]}
            />

            {/* TÍTULO "Lotes" + CONTADOR — se ocultan por completo al scrollear
                y solo reaparecen arriba del todo, igual que "Home". */}
            <View style={[styles.header, { paddingTop: insets.top + TITLE_ROW_MARGIN_TOP }]}>
                <View style={styles.headerTopRow}>
                    <Animated.Text style={[styles.headerHomeTitle, { color: colores.textPrimary }, titleAnimatedStyle]}>
                        Lotes
                    </Animated.Text>

                    <Animated.View style={counterAnimatedStyle}>
                        <BlurView intensity={isDark ? 55 : 80} tint={isDark ? 'dark' : 'light'} style={styles.counterGlassPill}>
                            <View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    { backgroundColor: isDark ? 'rgba(30,30,32,0.35)' : 'rgba(255,255,255,0.45)' },
                                ]}
                            />
                            <LinearGradient
                                colors={
                                    isDark
                                        ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)']
                                        : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']
                                }
                                start={{ x: 0.15, y: 0 }}
                                end={{ x: 0.85, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <View
                                style={[
                                    styles.counterGlassSpecular,
                                    { backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)' },
                                ]}
                            />
                            <View
                                style={[
                                    styles.counterGlassBorder,
                                    { borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)' },
                                ]}
                            />
                            <MaterialCommunityIcons name="vector-square" size={16} color="#34C759" style={{ marginRight: 6 }} />
                            <Text style={[styles.counterGlassNumber, { color: colores.textPrimary }]}>{lotesFiltrados.length}</Text>
                        </BlurView>
                    </Animated.View>
                </View>
            </View>

            {/* TABS DE FILTRO — liquid glass; se ocultan y reaparecen JUNTO
                con "Lotes" y el contador (mismo trigger de scroll), y
                también reaparecen al instante al deslizar el dedo para
                cambiar de tab. */}
            <View style={[styles.pinnedTabsWrap, { paddingTop: insets.top + TITLE_ROW_MARGIN_TOP + TITLE_ROW_HEIGHT + TABS_ROW_MARGIN_TOP }]}>
                <Animated.View style={tabsAnimatedStyle}>
                    <BlurView intensity={isDark ? 45 : 65} tint={isDark ? 'dark' : 'light'} style={styles.tabsGlassContainer}>
                        <View
                            style={[
                                StyleSheet.absoluteFillObject,
                            { backgroundColor: isDark ? 'rgba(20,20,22,0.30)' : 'rgba(255,255,255,0.35)' },
                        ]}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
                        {TABS.map((tab, index) => {
                            const active = filtroEstado === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    activeOpacity={0.7}
                                    onPress={() => handleTabPress(tab, index)}
                                    style={styles.filterTabTouchable}
                                >
                                    {active ? (
                                        <BlurView intensity={isDark ? 60 : 85} tint={isDark ? 'dark' : 'light'} style={styles.filterTabActiveGlass}>
                                            <View
                                                style={[
                                                    StyleSheet.absoluteFillObject,
                                                    { backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.65)' },
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.counterGlassBorder,
                                                    { borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)' },
                                                ]}
                                            />
                                            <Text style={[styles.filterTabText, { color: colores.textPrimary, fontWeight: '800' }]}>
                                                {tab}
                                            </Text>
                                        </BlurView>
                                    ) : (
                                        <View style={styles.filterTabInactive}>
                                            <Text style={[styles.filterTabText, { color: colores.textSecondary }]}>{tab}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                    </BlurView>
                </Animated.View>
            </View>


            {/* CONTENIDO — sin padding fijo: el espacio para el header vive
                DENTRO de cada lista (contentContainerStyle), así que se
                scrollea junto con el contenido y no deja ningún tope. */}
            <View style={styles.contentWrapper}>
                {/* VISTA DESLIZABLE HORIZONTALMENTE ULTRA RÁPIDA Y FLUIDA */}
                {error ? (
                    renderError()
                ) : (
                    <ScrollView
                        ref={horizontalScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScrollBeginDrag={revealHeaderForTabChange}
                        onMomentumScrollEnd={handleScrollEnd}
                        scrollEventThrottle={16}
                        style={{ flex: 1 }}
                        contentInsetAdjustmentBehavior="never"
                        automaticallyAdjustContentInsets={false}
                    >
                        {TABS.map((tab) => (
                            <View key={tab} style={{ width: SCREEN_WIDTH, flex: 1 }}>
                                {isLoading && listaLotes.length === 0 ? (
                                    <View style={{ paddingTop: pinnedTabsHeight }}>
                                        {renderLoadingSkeletons()}
                                    </View>
                                ) : (
                                    <FlatList
                                        data={lotesFiltrados}
                                        keyExtractor={(item) => item.id?.toString() || item.uuid_movil?.toString()}
                                        renderItem={({ item, index }) => (
                                            <AnimatedCard
                                                item={item}
                                                index={index}
                                                getStatusConfig={getStatusConfig}
                                                isDark={isDark}
                                                onPress={() => handlePressLote(item)}
                                                onStatusChange={handleStatusChange}
                                            />
                                        )}
                                        ListEmptyComponent={() => (refreshing ? renderLoadingSkeletons() : renderEmptyState(tab))}
                                        contentContainerStyle={[styles.listContainer, { paddingTop: pinnedTabsHeight }]}
                                        showsVerticalScrollIndicator={false}
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        onScroll={handleScroll}
                                        scrollEventThrottle={16}
                                        removeClippedSubviews={Platform.OS === 'android'}
                                        maxToRenderPerBatch={10}
                                        windowSize={5}
                                        contentInsetAdjustmentBehavior="never"
                                        automaticallyAdjustContentInsets={false}
                                        automaticallyAdjustsScrollIndicatorInsets={false}
                                    />
                                )}
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 16,
    },
    statusBarScrim: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
    },
    contentWrapper: {
        flex: 1,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerHomeTitle: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -0.8,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    // Contador "liquid glass" grande, mismo lenguaje visual que el botón
    // de notificaciones de Home (blur + degradado + brillo especular + borde).
    counterGlassPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 6,
    },
    counterGlassSpecular: {
        position: 'absolute',
        top: 0,
        left: 8,
        right: 8,
        height: 1,
        borderRadius: 1,
        opacity: 0.6,
    },
    counterGlassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 22,
        borderWidth: 1,
    },
    counterGlassNumber: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.4,
    },

    // Barra de tabs "liquid glass", SIEMPRE fija/visible arriba (no se
    // desvanece con el scroll); el contenido pasa por debajo con blur.
    pinnedTabsWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 18,
        paddingHorizontal: 16,
    },
    tabsGlassContainer: {
        borderRadius: 22,
        overflow: 'hidden',
        paddingVertical: 6,
        paddingHorizontal: 6,
    },
    filterTabsScroll: { flexDirection: 'row', gap: 8 },
    filterTabTouchable: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    filterTabActiveGlass: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    filterTabInactive: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterTabText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

    listContainer: { paddingHorizontal: 16, paddingBottom: 120, width: SCREEN_WIDTH },

    skeletonListContainer: { paddingHorizontal: 16, width: SCREEN_WIDTH },
    skeletonLine: {},

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 30, width: SCREEN_WIDTH },
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
});