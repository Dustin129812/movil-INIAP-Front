import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity, StatusBar, Modal, ScrollView, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withTiming,
    withRepeat,
    withDelay,
    cancelAnimation,
    Easing,
    interpolate,
    useAnimatedReaction,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../services/theme';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import NotificationsCenter from '../../notifications/ui/NotificationsCenter';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const CALC_ROUTE = '/calculadora/calculadora';

const REVEAL_DURATION = 260;
const HIDE_DURATION = 160;
const STAGGER = 70;
const TOP_REVEAL_THRESHOLD = 12;

function Calculator3D() {
    const keys = [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['·', '0', '='],
    ];
    return (
        <View style={styles.calc3dOuter}>
            <View style={styles.calc3dGroundShadow} />
            <View style={styles.calc3dBody}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.7, y: 0.9 }}
                    style={styles.calc3dSheen}
                    pointerEvents="none"
                />
                <LinearGradient colors={['#3A3A42', '#151519']} style={styles.calc3dScreen}>
                    <MaterialCommunityIcons name="leaf" size={12} color="#A7C957" />
                    <Text style={styles.calc3dScreenText}>0.00</Text>
                </LinearGradient>

                <View style={styles.calc3dKeys}>
                    {keys.map((row, r) => (
                        <View key={r} style={styles.calc3dRow}>
                            {row.map((k) => {
                                const isEquals = k === '=';
                                return (
                                    <LinearGradient
                                        key={k}
                                        colors={isEquals ? ['#FFC300', '#FFC300'] : ['#FAFAF8', '#DEDCD6']}
                                        style={[styles.calc3dKey, isEquals && styles.calc3dKeyAccent]}
                                    >
                                        <Text style={[styles.calc3dKeyText, isEquals && styles.calc3dKeyTextAccent]}>
                                            {k}
                                        </Text>
                                    </LinearGradient>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

export default function HomeDashboard() {
    const router = useRouter();
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const {
        usuario,
        esInvitado,
        totalLotes,
        isSyncing,
        syncMessage,
        sincronizar,
        limpiarSyncMessage,
        pendingCount,
        pendingCounts,
        syncInProgress,
    } = useHomeDashboard();

    const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
    const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

    // Loader "mundo" — igual al original: dos manchas SVG desplazándose sobre la esfera
    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);

    useEffect(() => {
        if (isSyncModalVisible) {
            anim1.value = 0;
            anim2.value = 0;
            anim1.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1, false);
            anim2.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1, false);
        } else {
            cancelAnimation(anim1);
            cancelAnimation(anim2);
        }
    }, [isSyncModalVisible]);

    const svgStyle1 = useAnimatedStyle(() => {
        const progress = anim1.value;
        const left = interpolate(progress, [0, 0.3, 0.31, 0.35, 0.45, 1], [-32, -96, -96, 112, 112, -32]);
        const opacity = interpolate(progress, [0, 0.3, 0.31, 0.35, 0.45, 1], [1, 1, 0, 0, 1, 1]);
        return { left, opacity };
    });

    const svgStyle2 = useAnimatedStyle(() => {
        const progress = anim2.value;
        const left = interpolate(progress, [0, 0.75, 0.76, 0.77, 0.8, 1], [80, -112, -112, 128, 128, 80]);
        const opacity = interpolate(progress, [0, 0.75, 0.76, 0.77, 0.8, 1], [1, 1, 0, 0, 1, 1]);
        return { left, opacity };
    });

    // (Se quitó la animación de pulso: el componente de sincronizar ahora queda fijo)

    const HEADER_ROW_HEIGHT = 54;
    const HEADER_ROW_GAP = 10;
    const headerContentHeight = insets.top + 2 + HEADER_ROW_HEIGHT + HEADER_ROW_GAP;
    const scrollTopPadding = headerContentHeight + 6;

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => { scrollY.value = event.contentOffset.y; },
    });

    const homeOpacity = useSharedValue(1);
    const homeTranslateY = useSharedValue(0);
    const notifOpacity = useSharedValue(1);
    const notifTranslateY = useSharedValue(0);

    useAnimatedReaction(
        () => scrollY.value <= TOP_REVEAL_THRESHOLD,
        (isAtTop, wasAtTop) => {
            if (isAtTop === wasAtTop) return;
            if (isAtTop) {
                notifOpacity.value = withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                notifTranslateY.value = withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                homeOpacity.value = withDelay(STAGGER, withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) }));
                homeTranslateY.value = withDelay(STAGGER, withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) }));
            } else {
                homeOpacity.value = withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
                homeTranslateY.value = withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
                notifOpacity.value = withDelay(STAGGER, withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
                notifTranslateY.value = withDelay(STAGGER, withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
            }
        },
        [TOP_REVEAL_THRESHOLD]
    );

    const homeTitleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: homeOpacity.value,
        transform: [{ translateY: homeTranslateY.value }],
    }));
    const notifAnimatedStyle = useAnimatedStyle(() => ({
        opacity: notifOpacity.value,
        transform: [{ translateY: notifTranslateY.value }],
    }));

    const bg = isDark ? '#000000' : '#F2F2F7';
    const cardBg = isDark ? '#1E1E24' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#98989F' : '#8E8E93';

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']
                        : ['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0)']
                }
                style={[styles.statusBarScrim, { height: insets.top + 40 }]}
            />

            {/* Header — igual al original: título "Home" + bandeja de notificaciones glass */}
            <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
                <View style={styles.headerTopRow}>
                    <Animated.Text style={[styles.headerHomeTitle, { color: textPrimary }, homeTitleAnimatedStyle]}>
                        Home
                    </Animated.Text>

                    {!esInvitado && (
                        <AnimatedTouchable
                            style={[styles.notifTouchable, notifAnimatedStyle]}
                            activeOpacity={0.75}
                            onPress={() => setIsNotificationsVisible(true)}
                        >
                            <BlurView intensity={isDark ? 55 : 80} tint={isDark ? 'dark' : 'light'} style={styles.notifPill}>
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
                                        styles.notifSpecular,
                                        { backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)' },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.notifGlassBorder,
                                        { borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)' },
                                    ]}
                                />

                                <MaterialCommunityIcons
                                    name={pendingCount > 0 ? 'bell-badge-outline' : 'bell-outline'}
                                    size={22}
                                    color={pendingCount > 0 ? '#FF9500' : (isDark ? '#A7C957' : '#6A994E')}
                                />
                                {pendingCount > 0 && (
                                    <View style={styles.notifBadge}>
                                        <Text style={styles.notifBadgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
                                    </View>
                                )}
                            </BlurView>
                        </AnimatedTouchable>
                    )}
                </View>
            </View>

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={[styles.scrollContent, { paddingTop: scrollTopPadding }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.welcomeSubtitle, { color: textSecondary }]}>
                    Gestiona tus datos agrícolas{'\n'}de forma fácil y segura.
                </Text>

                {/* Barra de sincronizar — solo para usuarios registrados */}
                {!esInvitado && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => { setIsSyncModalVisible(true); sincronizar(); }}
                        style={styles.syncBar}
                    >
                        <View style={styles.syncIconCircle}>
                            <MaterialCommunityIcons name="sync" size={20} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.syncTitle}>Sincronizar datos</Text>
                            <Text style={styles.syncCaption}>
                                {isSyncing
                                    ? 'Sincronizando...'
                                    : pendingCount > 0
                                        ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`
                                        : 'Todo está al día'}
                            </Text>
                        </View>
                        <View style={styles.syncArrowBtn}>
                            <MaterialCommunityIcons name="arrow-right" size={18} color="#1B3A2A" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Tarjeta de la calculadora — verde claro, ícono + botón "?" + flecha de acceso */}
                <View style={styles.featureCardWrapper}>
                    <View style={styles.featureCard}>
                        <View style={styles.featureIconBox}>
                            <MaterialCommunityIcons name="calculator-variant-outline" size={22} color="#1B3A2A" />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsInfoModalVisible(true)}
                            style={styles.infoBadge}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialCommunityIcons name="information-outline" size={18} color="#1B3A2A" />
                        </TouchableOpacity>

                        <View style={styles.featureLabelRow}>
                            <Text style={styles.featureTitle}>Calculadora</Text>
                            <Text style={styles.featureSubtitle}>Nutrientes y dosis</Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => router.push(CALC_ROUTE)}
                            style={styles.featureArrowBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tarjeta de estado — resumen de lotes y última revisión */}
                <View style={[styles.stateCard, { backgroundColor: cardBg }]}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.stateLabelRow}>
                            <View style={styles.stateDot} />
                            <Text style={styles.stateLabel}>ESTADO</Text>
                        </View>
                        <Text style={[styles.stateTitle, { color: textPrimary }]} numberOfLines={2}>
                            {pendingCount > 0
                                ? `${pendingCount} cambio${pendingCount > 1 ? 's' : ''} sin sincronizar`
                                : `Todo al día con ${totalLotes} lote${totalLotes === 1 ? '' : 's'} activo${totalLotes === 1 ? '' : 's'}`}
                        </Text>
                        <Text style={styles.stateCaption}>
                            {pendingCount > 0 ? 'Toca sincronizar para actualizar' : 'Última revisión hace 2h'}
                        </Text>
                    </View>
                    <View style={styles.stateImageCircle}>
                        <MaterialCommunityIcons name="sprout-outline" size={30} color="#6A994E" />
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Modal "¿Qué es la calculadora?" — se abre sola al entrar y se cierra sola;
                también se puede reabrir con el ícono "?" o cerrar antes con el botón */}
            <Modal
                visible={isInfoModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsInfoModalVisible(false)}
            >
                <View style={styles.infoModalOverlay}>
                    <View style={[styles.infoModalCard, { backgroundColor: cardBg }]}>
                        <View style={styles.infoModalIconWrap}>
                            <MaterialCommunityIcons name="help-circle-outline" size={28} color="#386641" />
                        </View>
                        <Text style={[styles.infoModalTitle, { color: textPrimary }]}>¿Qué es la calculadora?</Text>
                        <Text style={[styles.infoModalText, { color: textSecondary }]}>
                            Es la herramienta que estima la dosis de fertilizantes y nutrientes que necesita tu
                            cultivo según el tipo de lote y las condiciones registradas, para ayudarte a aplicar
                            la cantidad justa y evitar desperdicio.
                        </Text>
                        <TouchableOpacity
                            style={styles.infoModalBtn}
                            activeOpacity={0.88}
                            onPress={() => setIsInfoModalVisible(false)}
                        >
                            <Text style={styles.infoModalBtnText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Pantalla de carga — el "mundo" de sincronización, igual al original */}
            <Modal
                visible={isSyncModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsSyncModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.earthContainer}>
                        <View style={styles.earthLoader}>
                            <Animated.View style={[styles.earthSvgWrapper1, svgStyle1]}>
                                <Svg height="100%" width="100%" viewBox="0 0 200 200">
                                    <Path
                                        transform="translate(100 100)"
                                        d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
                                        fill="#A7C957"
                                    />
                                </Svg>
                            </Animated.View>
                            <Animated.View style={[styles.earthSvgWrapper2, svgStyle2]}>
                                <Svg height="100%" width="100%" viewBox="0 0 200 200">
                                    <Path
                                        transform="translate(100 100)"
                                        d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                                        fill="#6A994E"
                                    />
                                </Svg>
                            </Animated.View>
                        </View>
                        <Text style={styles.earthText}>
                            {isSyncing ? 'Sincronizando...' : (syncMessage ? syncMessage.text : 'Listo')}
                        </Text>
                        {syncMessage && !isSyncing && (
                            <TouchableOpacity
                                style={[styles.closeSyncBtn, { backgroundColor: syncMessage.type === 'error' ? '#FF453A' : '#6A994E' }]}
                                onPress={() => { setIsSyncModalVisible(false); limpiarSyncMessage(); }}
                            >
                                <Text style={styles.closeSyncBtnText}>Cerrar</Text>
                            </TouchableOpacity>
                        )}
                        {isSyncing && (
                            <TouchableOpacity
                                style={styles.closeSyncBtn}
                                onPress={() => setIsSyncModalVisible(false)}
                            >
                                <Text style={styles.closeSyncBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            <NotificationsCenter
                visible={isNotificationsVisible}
                onClose={() => setIsNotificationsVisible(false)}
                isDark={isDark}
                isSyncing={isSyncing}
                syncMessage={syncMessage}
                onSincronizar={sincronizar}
                pendingCounts={pendingCounts}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
    statusBarScrim: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerHomeTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.9,
    },
    notifTouchable: {
        borderRadius: 27,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 6,
    },
    notifPill: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    notifSpecular: {
        position: 'absolute',
        top: 4,
        left: 9,
        width: 20,
        height: 9,
        borderRadius: 10,
        transform: [{ rotate: '-18deg' }],
    },
    notifGlassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 27,
        borderWidth: 1.25,
    },
    notifBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#FF9500',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    notifBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    welcomeSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 18,
    },
    featureCard: {
        borderRadius: 26,
        padding: 18,
        backgroundColor: '#DCEAC9',
        overflow: 'hidden',
    },
    featureIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    featureLabelRow: {
        marginTop: 22,
        marginBottom: 2,
    },
    featureTitle: {
        color: '#17331F',
        fontSize: 20,
        fontWeight: '800',
    },
    featureSubtitle: {
        color: '#5C7A4C',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    featureArrowBtn: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6A994E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calc3dOuter: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    calc3dGroundShadow: {
        position: 'absolute',
        bottom: 2,
        width: 110,
        height: 26,
        borderRadius: 55,
        backgroundColor: 'rgba(0,0,0,0.28)',
        transform: [{ scaleX: 1.3 }],
    },
    calc3dBody: {
        width: 132,
        borderRadius: 18,
        backgroundColor: '#EDEBE6',
        padding: 9,
        overflow: 'hidden',
        transform: [
            { perspective: 800 },
            { rotateX: '28deg' },
            { rotateY: '-10deg' },
            { rotateZ: '-5deg' },
        ],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 14,
    },
    calc3dSheen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60%',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
    },
    calc3dScreen: {
        height: 36,
        borderRadius: 9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        gap: 6,
        marginBottom: 9,
    },
    calc3dScreenText: {
        color: '#7CF29A',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    calc3dKeys: {
        gap: 6,
    },
    calc3dRow: {
        flexDirection: 'row',
        gap: 6,
    },
    calc3dKey: {
        flex: 1,
        height: 20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: 'rgba(0,0,0,0.12)',
    },
    calc3dKeyAccent: {
        borderBottomColor: 'rgba(0,0,0,0.22)',
        shadowColor: '#386641',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
    },
    calc3dKeyText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#3A3A42',
    },
    calc3dKeyTextAccent: {
        color: '#1B3A2A',
    },
    featureCardWrapper: {
        position: 'relative',
        marginBottom: 14,
    },
    infoBadge: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    infoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    infoModalCard: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    infoModalIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(106,153,78,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    infoModalTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    infoModalText: {
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
        marginBottom: 20,
    },
    infoModalBtn: {
        backgroundColor: '#1B3A2A',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 14,
    },
    infoModalBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    stateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingVertical: 18,
        paddingHorizontal: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    stateLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    stateDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#6A994E',
    },
    stateLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6A994E',
        letterSpacing: 0.5,
    },
    stateTitle: {
        fontSize: 16,
        fontWeight: '800',
        lineHeight: 21,
        marginBottom: 4,
    },
    stateCaption: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8DAE7B',
    },
    stateImageCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: 'rgba(106,153,78,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    syncBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 22,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#1B3A2A',
        marginBottom: 14,
    },
    syncIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.14)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 2,
    },
    syncCaption: {
        color: '#A7C957',
        fontSize: 12,
        fontWeight: '500',
    },
    syncArrowBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earthContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    earthLoader: {
        width: 120,
        height: 120,
        backgroundColor: '#3344c1',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 60,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    earthSvgWrapper1: {
        position: 'absolute',
        bottom: -32,
        width: 112,
        height: 112,
    },
    earthSvgWrapper2: {
        position: 'absolute',
        top: -48,
        width: 112,
        height: 112,
    },
    earthText: {
        color: 'white',
        marginTop: 16,
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'sans-serif',
        fontWeight: '600',
    },
    closeSyncBtn: {
        marginTop: 24,
        backgroundColor: '#386641',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    closeSyncBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
});