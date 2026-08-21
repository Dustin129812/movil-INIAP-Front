import React, { useCallback, useRef, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ScrollView,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withTiming,
    withDelay,
    Easing,
    useAnimatedReaction,
} from 'react-native-reanimated';

import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { createProyectosStyles } from './proyectosStyles';
import { useTheme } from '../../../services/theme';
import { SkeletonCard } from '../../../src/styles/global/SkeletonCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

const TABS = ['TODOS', 'ACTIVOS', 'PENDIENTES', 'INACTIVOS'];

const COLORS = {
    cream: '#FCF8F0',

    darkGreen: '#0B3D24',
    forestGreen: '#174D2E',
    green: '#6FAF32',
    brightGreen: '#78B832',

    quickCard: '#C9E28D',
    quickIcon: '#A9D266',

    calculator: '#75CFA3',

    state: '#E5EBD3',

    secondaryGreen: '#477442',

    white: '#FFFFFF',

    darkBackground: '#101510',
    darkCard: '#1E261F',
    darkBorder: '#354238',

    darkSecondary: '#A8B5A9',

    orange: '#F59E0B',
};

const EstadoBadge = ({ estado, syncStatus, estilos }) => {

    const isPending =
        syncStatus === 'pending' ||
        syncStatus === 'draft';

    const isInactivo =
        estado === 'inactivo';

    const getBadgeStyle = () => {

        if (isInactivo) {

            return [
                estilos.cardBadge,
                {
                    backgroundColor: 'rgba(120, 128, 120, 0.18)',
                },
            ];

        }

        if (isPending) {

            return [
                estilos.cardBadge,
                estilos.cardBadgePending,
            ];

        }

        return estilos.cardBadge;

    };

    const getTextStyle = () => {

        if (isInactivo) {

            return [
                estilos.cardBadgeText,
                {
                    color: '#7F8B80',
                },
            ];

        }

        if (isPending) {

            return [
                estilos.cardBadgeText,
                estilos.cardBadgeTextPending,
            ];

        }

        return estilos.cardBadgeText;

    };

    const getLabel = () => {

        if (isInactivo) return 'Inactivo';

        if (isPending) return 'Pendiente';

        return estado || 'Activo';

    };

    return (

        <View style={getBadgeStyle()}>

            <Text style={getTextStyle()}>
                {getLabel()}
            </Text>

        </View>

    );

};

const ProyectoCard = ({ proyecto, estilos }) => {

    const handlePress = useCallback(() => {

        router.push(
            `/proyectos/${proyecto.uuid_movil || proyecto.id}`
        );

    }, [proyecto]);

    return (

        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
        >

            <View style={estilos.card}>

                <View style={estilos.cardHeader}>

                    <Text
                        style={estilos.cardTitle}
                        numberOfLines={2}
                    >
                        {proyecto.titulo}
                    </Text>

                    <EstadoBadge
                        estado={proyecto.estado}
                        syncStatus={proyecto.sync_status}
                        estilos={estilos}
                    />

                </View>

                {proyecto.descripcion && (

                    <Text
                        style={estilos.cardDescription}
                        numberOfLines={2}
                    >
                        {proyecto.descripcion}
                    </Text>

                )}

                <View style={estilos.cardInfoRow}>

                    {proyecto.variedad && (

                        <View style={estilos.cardInfoItem}>

                            <MaterialCommunityIcons
                                name="seed"
                                size={14}
                                color={
                                    estilos.cardInfoIcon?.color ||
                                    COLORS.secondaryGreen
                                }
                            />

                            <Text style={estilos.cardInfoValue}>
                                {proyecto.variedad}
                            </Text>

                        </View>

                    )}

                    {proyecto.fecha_siembra && (

                        <View style={estilos.cardInfoItem}>

                            <MaterialCommunityIcons
                                name="calendar"
                                size={14}
                                color={
                                    estilos.cardInfoIcon?.color ||
                                    COLORS.secondaryGreen
                                }
                            />

                            <Text style={estilos.cardInfoValue}>

                                {new Date(
                                    proyecto.fecha_siembra
                                ).toLocaleDateString('es-EC')}

                            </Text>

                        </View>

                    )}

                    {proyecto.tipo_ensayo && (

                        <View style={estilos.cardInfoItem}>

                            <MaterialCommunityIcons
                                name="test-tube"
                                size={14}
                                color={
                                    estilos.cardInfoIcon?.color ||
                                    COLORS.secondaryGreen
                                }
                            />

                            <Text style={estilos.cardInfoValue}>
                                {proyecto.tipo_ensayo}
                            </Text>

                        </View>

                    )}

                </View>

                {proyecto.financiamiento && (

                    <View
                        style={[
                            estilos.cardInfoRow,
                            { marginTop: 8 },
                        ]}
                    >

                        <View style={estilos.cardInfoItem}>

                            <MaterialCommunityIcons
                                name="cash"
                                size={14}
                                color={
                                    estilos.cardInfoIcon?.color ||
                                    COLORS.secondaryGreen
                                }
                            />

                            <Text style={estilos.cardInfoValue}>
                                {proyecto.financiamiento}
                            </Text>

                        </View>

                    </View>

                )}

            </View>

        </TouchableOpacity>

    );

};

const EmptyState = ({ estilos, filtroActivo }) => (

    <View style={estilos.emptyContainer}>

        <MaterialCommunityIcons
            name="folder-open-outline"
            size={64}
            color={
                estilos.emptyIcon?.color ||
                COLORS.secondaryGreen
            }
        />

        <Text style={estilos.emptyText}>

            {filtroActivo === 'TODOS'
                ? 'No hay proyectos registrados'
                : filtroActivo === 'ACTIVOS'
                    ? 'No hay proyectos activos'
                    : filtroActivo === 'PENDIENTES'
                        ? 'No hay proyectos pendientes'
                        : 'No hay proyectos inactivos'}

        </Text>

        <Text style={estilos.emptySubtext}>

            Presiona el botón + para crear tu primer proyecto

        </Text>

    </View>

);

export default function ListaProyectosUI({

    proyectos = [],

    isLoading = false,

    filtroActivo = 'TODOS',

    onFiltroChange,

    onRefresh,

}) {

    const insets = useSafeAreaInsets();

    const { isDark } = useTheme();

    const estilos = createProyectosStyles(isDark);

    const horizontalScrollRef = useRef(null);

    const isProgrammaticRef = useRef(false);

    const scrollY = useSharedValue(0);

    const [refreshing, setRefreshing] = useState(false);

    const TOP_REVEAL_THRESHOLD = 12;

    const HIDE_DURATION = 160;

    const REVEAL_DURATION = 260;

    const STAGGER = 70;

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

                counterOpacity.value = withTiming(
                    1,
                    {
                        duration: REVEAL_DURATION,
                        easing: Easing.out(Easing.cubic),
                    }
                );

                counterTranslateY.value = withTiming(
                    0,
                    {
                        duration: REVEAL_DURATION,
                        easing: Easing.out(Easing.cubic),
                    }
                );

                tabsOpacity.value = withTiming(
                    1,
                    {
                        duration: REVEAL_DURATION,
                        easing: Easing.out(Easing.cubic),
                    }
                );

                tabsTranslateY.value = withTiming(
                    0,
                    {
                        duration: REVEAL_DURATION,
                        easing: Easing.out(Easing.cubic),
                    }
                );

                titleOpacity.value = withDelay(
                    STAGGER,
                    withTiming(
                        1,
                        {
                            duration: REVEAL_DURATION,
                            easing: Easing.out(Easing.cubic),
                        }
                    )
                );

                titleTranslateY.value = withDelay(
                    STAGGER,
                    withTiming(
                        0,
                        {
                            duration: REVEAL_DURATION,
                            easing: Easing.out(Easing.cubic),
                        }
                    )
                );

            } else {

                titleOpacity.value = withTiming(
                    0,
                    {
                        duration: HIDE_DURATION,
                        easing: Easing.in(Easing.cubic),
                    }
                );

                titleTranslateY.value = withTiming(
                    -6,
                    {
                        duration: HIDE_DURATION,
                        easing: Easing.in(Easing.cubic),
                    }
                );

                counterOpacity.value = withDelay(
                    STAGGER,
                    withTiming(
                        0,
                        {
                            duration: HIDE_DURATION,
                            easing: Easing.in(Easing.cubic),
                        }
                    )
                );

                counterTranslateY.value = withDelay(
                    STAGGER,
                    withTiming(
                        -6,
                        {
                            duration: HIDE_DURATION,
                            easing: Easing.in(Easing.cubic),
                        }
                    )
                );

                tabsOpacity.value = withDelay(
                    STAGGER,
                    withTiming(
                        0,
                        {
                            duration: HIDE_DURATION,
                            easing: Easing.in(Easing.cubic),
                        }
                    )
                );

                tabsTranslateY.value = withDelay(
                    STAGGER,
                    withTiming(
                        -6,
                        {
                            duration: HIDE_DURATION,
                            easing: Easing.in(Easing.cubic),
                        }
                    )
                );

            }

        },

        [TOP_REVEAL_THRESHOLD]

    );

    const titleAnimatedStyle = useAnimatedStyle(() => ({

        opacity: titleOpacity.value,

        transform: [
            {
                translateY: titleTranslateY.value,
            },
        ],

    }));

    const counterAnimatedStyle = useAnimatedStyle(() => ({

        opacity: counterOpacity.value,

        transform: [
            {
                translateY: counterTranslateY.value,
            },
        ],

    }));

    const tabsAnimatedStyle = useAnimatedStyle(() => ({

        opacity: tabsOpacity.value,

        transform: [
            {
                translateY: tabsTranslateY.value,
            },
        ],

    }));

    const handleScroll = (event) => {

        scrollY.value =
            event.nativeEvent.contentOffset.y;

    };

    const revealHeaderForTabChange = () => {

        scrollY.value = 0;

    };

    const handleTabPress = (tab, index) => {

        onFiltroChange(tab);

        revealHeaderForTabChange();

        if (horizontalScrollRef.current) {

            isProgrammaticRef.current = true;

            horizontalScrollRef.current.scrollTo({
                x: index * SCREEN_WIDTH,
                animated: false,
            });

        }

    };

    const handleScrollEnd = (e) => {

        const offsetX =
            e.nativeEvent.contentOffset.x;

        const index =
            Math.round(offsetX / SCREEN_WIDTH);

        const tab = TABS[index];

        if (
            tab &&
            tab !== filtroActivo &&
            !isProgrammaticRef.current
        ) {

            onFiltroChange(tab);

        }

        isProgrammaticRef.current = false;

        revealHeaderForTabChange();

    };

    const handleRefresh = async () => {

        setRefreshing(true);

        await onRefresh();

        setRefreshing(false);

    };

    const TITLE_ROW_HEIGHT = 40;

    const TITLE_ROW_MARGIN_TOP = 6;

    const TABS_ROW_HEIGHT = 40;

    const TABS_ROW_MARGIN_TOP = 14;

    const HEADER_BOTTOM_GAP = 10;

    const pinnedTabsHeight =
        insets.top +
        TITLE_ROW_MARGIN_TOP +
        TITLE_ROW_HEIGHT +
        TABS_ROW_MARGIN_TOP +
        TABS_ROW_HEIGHT +
        HEADER_BOTTOM_GAP;

    const getProyectosPorFiltro = (tab) => {

        if (tab === 'TODOS') return proyectos;

        if (tab === 'ACTIVOS') {

            return proyectos.filter(
                p =>
                    p.estado === 'activo' &&
                    p.sync_status !== 'pending' &&
                    p.sync_status !== 'draft'
            );

        }

        if (tab === 'PENDIENTES') {

            return proyectos.filter(
                p =>
                    p.estado === 'pendiente' ||
                    p.sync_status === 'pending' ||
                    p.sync_status === 'draft'
            );

        }

        if (tab === 'INACTIVOS') {

            return proyectos.filter(
                p => p.estado === 'inactivo'
            );

        }

        return proyectos;

    };

    const textPrimary = isDark
        ? COLORS.white
        : COLORS.darkGreen;

    const textSecondary = isDark
        ? COLORS.darkSecondary
        : COLORS.secondaryGreen;

    return (

        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDark
                        ? COLORS.darkBackground
                        : COLORS.cream,
                },
            ]}
        >

            {isDark && (

                <LinearGradient
                    pointerEvents="none"
                    colors={[
                        'rgba(11,61,36,0.55)',
                        'rgba(11,61,36,0.20)',
                        'rgba(11,61,36,0)',
                    ]}
                    style={[
                        styles.statusBarScrim,
                        {
                            height: insets.top + 40,
                        },
                    ]}
                />

            )}

            <View
                style={[
                    styles.header,
                    {
                        paddingTop:
                            insets.top +
                            TITLE_ROW_MARGIN_TOP,
                    },
                ]}
            >

                <View style={styles.headerTopRow}>

                    <Animated.Text
                        style={[
                            styles.headerHomeTitle,
                            {
                                color: textPrimary,
                            },
                            titleAnimatedStyle,
                        ]}
                    >
                        Proyectos
                    </Animated.Text>

                    <Animated.View
                        style={counterAnimatedStyle}
                    >

                        <BlurView
                            intensity={isDark ? 55 : 80}
                            tint={isDark ? 'dark' : 'light'}
                            style={[
                                styles.counterGlassPill,
                                {
                                    borderColor: isDark
                                        ? 'rgba(120,184,50,0.25)'
                                        : 'rgba(23,77,46,0.10)',
                                },
                            ]}
                        >

                            <View
                                style={[
                                    StyleSheet.absoluteFill,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(30,38,31,0.65)'
                                            : 'rgba(201,226,141,0.35)',
                                    },
                                ]}
                            />

                            <LinearGradient
                                colors={
                                    isDark
                                        ? [
                                            'rgba(120,184,50,0.25)',
                                            'rgba(120,184,50,0.08)',
                                            'rgba(120,184,50,0)',
                                        ]
                                        : [
                                            'rgba(255,255,255,0.95)',
                                            'rgba(201,226,141,0.35)',
                                            'rgba(201,226,141,0.10)',
                                        ]
                                }
                                start={{ x: 0.15, y: 0 }}
                                end={{ x: 0.85, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />

                            <View
                                style={[
                                    styles.counterGlassSpecular,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(120,184,50,0.45)'
                                            : 'rgba(255,255,255,0.9)',
                                    },
                                ]}
                            />

                            <View
                                style={[
                                    styles.counterGlassBorder,
                                    {
                                        borderColor: isDark
                                            ? 'rgba(120,184,50,0.30)'
                                            : 'rgba(23,77,46,0.12)',
                                    },
                                ]}
                            />

                            <MaterialCommunityIcons
                                name="flask-outline"
                                size={16}
                                color={COLORS.green}
                                style={{ marginRight: 6 }}
                            />

                            <Text
                                style={[
                                    styles.counterGlassNumber,
                                    {
                                        color: textPrimary,
                                    },
                                ]}
                            >
                                {proyectos.length}
                            </Text>

                        </BlurView>

                    </Animated.View>

                </View>

            </View>

            <View
                style={[
                    styles.pinnedTabsWrap,
                    {
                        paddingTop:
                            insets.top +
                            TITLE_ROW_MARGIN_TOP +
                            TITLE_ROW_HEIGHT +
                            TABS_ROW_MARGIN_TOP,
                    },
                ]}
            >

                <Animated.View
                    style={tabsAnimatedStyle}
                >

                    <BlurView
                        intensity={isDark ? 45 : 65}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.tabsGlassContainer}
                    >

                        <View
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(30,38,31,0.65)'
                                        : 'rgba(201,226,141,0.22)',
                                },
                            ]}
                        />

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={
                                styles.filterTabsScroll
                            }
                        >

                            {TABS.map((tab, index) => {

                                const active =
                                    filtroActivo === tab;

                                return (

                                    <TouchableOpacity
                                        key={tab}
                                        activeOpacity={0.7}
                                        onPress={() =>
                                            handleTabPress(
                                                tab,
                                                index
                                            )
                                        }
                                        style={
                                            styles.filterTabTouchable
                                        }
                                    >

                                        {active ? (

                                            <BlurView
                                                intensity={
                                                    isDark
                                                        ? 60
                                                        : 85
                                                }
                                                tint={
                                                    isDark
                                                        ? 'dark'
                                                        : 'light'
                                                }
                                                style={
                                                    styles.filterTabActiveGlass
                                                }
                                            >

                                                <View
                                                    style={[
                                                        StyleSheet.absoluteFill,
                                                        {
                                                            backgroundColor:
                                                                isDark
                                                                    ? 'rgba(111,175,50,0.30)'
                                                                    : 'rgba(201,226,141,0.75)',
                                                        },
                                                    ]}
                                                />

                                                <View
                                                    style={[
                                                        styles.filterTabBorder,
                                                        {
                                                            borderColor:
                                                                isDark
                                                                    ? 'rgba(120,184,50,0.45)'
                                                                    : 'rgba(23,77,46,0.15)',
                                                        },
                                                    ]}
                                                />

                                                <Text
                                                    style={[
                                                        styles.filterTabText,
                                                        {
                                                            color: isDark
                                                                ? COLORS.white
                                                                : COLORS.darkGreen,
                                                            fontWeight: '800',
                                                        },
                                                    ]}
                                                >
                                                    {tab}
                                                </Text>

                                            </BlurView>

                                        ) : (

                                            <View
                                                style={
                                                    styles.filterTabInactive
                                                }
                                            >

                                                <Text
                                                    style={[
                                                        styles.filterTabText,
                                                        {
                                                            color:
                                                                textSecondary,
                                                        },
                                                    ]}
                                                >
                                                    {tab}
                                                </Text>

                                            </View>

                                        )}

                                    </TouchableOpacity>

                                );

                            })}

                        </ScrollView>

                    </BlurView>

                </Animated.View>

            </View>

            <View style={styles.contentWrapper}>

                <ScrollView
                    ref={horizontalScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScrollBeginDrag={
                        revealHeaderForTabChange
                    }
                    onMomentumScrollEnd={
                        handleScrollEnd
                    }
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                    contentInsetAdjustmentBehavior="never"
                    automaticallyAdjustContentInsets={false}
                >

                    {TABS.map((tab) => {

                        const datos =
                            getProyectosPorFiltro(tab);

                        return (

                            <View
                                key={tab}
                                style={{
                                    width: SCREEN_WIDTH,
                                    flex: 1,
                                }}
                            >

                                <FlatList
                                    data={datos}
                                    keyExtractor={(item) =>
                                        item.uuid_movil ||
                                        item.id?.toString() ||
                                        `proyecto-${item.titulo}-${item.estado}`
                                    }
                                    renderItem={({ item }) => (
                                        <ProyectoCard
                                            proyecto={item}
                                            estilos={estilos}
                                        />
                                    )}
                                    ListEmptyComponent={
                                        isLoading
                                            ? (
                                                <SkeletonCard
                                                    isDark={isDark}
                                                />
                                            )
                                            : (
                                                <EmptyState
                                                    estilos={estilos}
                                                    filtroActivo={tab}
                                                />
                                            )
                                    }
                                    contentContainerStyle={
                                        datos.length === 0
                                            ? [
                                                estilos.emptyList,
                                                {
                                                    paddingTop:
                                                        pinnedTabsHeight,
                                                },
                                            ]
                                            : [
                                                estilos.list,
                                                {
                                                    paddingTop:
                                                        pinnedTabsHeight,
                                                },
                                            ]
                                    }
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={
                                                handleRefresh
                                            }
                                            tintColor={
                                                COLORS.green
                                            }
                                        />
                                    }
                                    showsVerticalScrollIndicator={
                                        false
                                    }
                                    contentInsetAdjustmentBehavior="never"
                                    automaticallyAdjustContentInsets={
                                        false
                                    }
                                    automaticallyAdjustsScrollIndicatorInsets={
                                        false
                                    }
                                />

                            </View>

                        );

                    })}

                </ScrollView>

            </View>

        </View>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    statusBarScrim: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
    },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 16,
    },

    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
    },

    headerHomeTitle: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -0.8,
    },

    counterGlassPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
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

    filterTabsScroll: {
        flexDirection: 'row',
        gap: 8,
    },

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

    filterTabBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 18,
        borderWidth: 1,
    },

    filterTabText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    contentWrapper: {
        flex: 1,
    },

});