import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    interpolate,
    useAnimatedReaction,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../services/theme';
import NotificationsCenter from '../../notifications/ui/NotificationsCenter';
import { useHomeDashboard } from '../hooks/useHomeDashboard';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QUICK_CARDS = [
    {
        id: 3,
        title: 'Calculadora',
        subtitle: 'Fertilizantes',
        route: '/calculadora/calculadora',
        icon: 'calculator',
        color: '#FF9500',
        bg: 'rgba(255, 149, 0, 0.1)',
        info: 'Calculadora de fertilizantes y nutrientes para tus cultivos.'
    },
];

export default function HomeDashboard() {
    const router = useRouter();
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    
    const {
        usuario,
        totalLotes,
        isSyncing,
        syncMessage,
        sincronizar,
        limpiarSyncMessage,
        pendingCount,
        pendingCounts,
        verificarPendientes,
    } = useHomeDashboard();

    const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
    const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

    // Animaciones del Modal de Sincronización
    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);

    useEffect(() => {
        if (isSyncModalVisible) {
            anim1.value = 0;
            anim2.value = 0;
            anim1.value = withRepeat(
                withTiming(1, { duration: 5000, easing: Easing.linear }),
                -1,
                false
            );
            anim2.value = withRepeat(
                withTiming(1, { duration: 5000, easing: Easing.linear }),
                -1,
                false
            );
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

    // Animaciones de Scroll y Header
    const HEADER_ROW_HEIGHT = 54; 
    const HEADER_ROW_GAP = 10;    
    const headerContentHeight = insets.top + 2 + HEADER_ROW_HEIGHT + HEADER_ROW_GAP;
    const scrollTopPadding = headerContentHeight + 6;

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });
    
    const TOP_REVEAL_THRESHOLD = 12; 
    const HIDE_DURATION = 160;
    const REVEAL_DURATION = 260;
    const STAGGER = 70; 

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

    // Variables de estilo adaptativas
    const bg = isDark ? '#000000' : '#F2F2F7';
    const cardBg = isDark ? '#1E1E24' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#98989F' : '#8E8E93';
    const dividerLine = isDark ? '#3A3A3C' : '#F2F2F7';

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

            <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
                <View style={styles.headerTopRow}>
                    <Animated.Text style={[styles.headerHomeTitle, { color: textPrimary }, homeTitleAnimatedStyle]}>Home</Animated.Text>

                    <AnimatedTouchable
                        style={[styles.notifTouchable, notifAnimatedStyle]}
                        activeOpacity={0.75}
                        onPress={() => setIsNotificationsVisible(true)}
                    >
                        <BlurView
                            intensity={isDark ? 55 : 80}
                            tint={isDark ? 'dark' : 'light'}
                            style={styles.notifPill}
                        >
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
                                name={pendingCount > 0 ? "bell-badge-outline" : "bell-outline"}
                                size={22}
                                color={pendingCount > 0 ? '#FF9500' : (isDark ? '#30D158' : '#34C759')}
                            />
                            {pendingCount > 0 && (
                                <View style={styles.notifBadge}>
                                    <Text style={styles.notifBadgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
                                </View>
                            )}
                        </BlurView>
                    </AnimatedTouchable>
                </View>
            </View>

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={[styles.scrollContent, { paddingTop: scrollTopPadding }]}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO CARD */}
                <View style={styles.heroCard}>
                    <MaterialCommunityIcons
                        name="sprout"
                        size={110}
                        color="rgba(255,255,255,0.05)"
                        style={styles.heroDecorIcon}
                    />

                    <View style={styles.heroTopRow}>
                        <View>
                            <Text style={styles.heroGreeting}>Bienvenido</Text>
                            <Text style={styles.heroName} numberOfLines={1}>{usuario?.NOMBRE || 'Invitado: Técnico Especialista'}</Text>
                        </View>
                        <View style={styles.heroAvatarWrap}>
                            <MaterialCommunityIcons name="leaf" size={22} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.heroStatsGrid}>
                        <View style={styles.heroStatItemRow}>
                            <View style={styles.heroStatIconWrap}>
                                <MaterialCommunityIcons name="map-marker-radius" size={16} color="#34C759" />
                            </View>
                            <Text style={[styles.heroStatValue, { color: '#FFFFFF' }]}>{totalLotes}</Text>
                            <Text style={styles.heroStatLabel}>Lotes Activos</Text>
                        </View>
                    </View>

                    {pendingCount > 0 && (
                        <TouchableOpacity
                            style={styles.pendingSyncAlert}
                            activeOpacity={0.8}
                            onPress={() => { setIsSyncModalVisible(true); sincronizar(); }}
                        >
                            <MaterialCommunityIcons name="cloud-upload-outline" size={18} color="#FF9500" />
                            <Text style={styles.pendingSyncText}>
                                Tienes {pendingCount} cambio{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} de sincronizar
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={16} color="#FF9500" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* SINCRONIZAR SECCIÓN */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>Herramienta Destacada</Text>
                    
                    <View style={[styles.card, { backgroundColor: cardBg, paddingVertical: 28, alignItems: 'center' }]}>
                        <TouchableOpacity
                            style={styles.uiverseBtn}
                            activeOpacity={0.8}
                            onPress={() => { setIsSyncModalVisible(true); sincronizar(); }}
                        >
                            <MaterialCommunityIcons name="cloud-sync" size={24} color="#FFFFFF" />
                            <Text style={styles.uiverseText}>Sincronizar </Text>
                        </TouchableOpacity>

                        <View style={[styles.prefDivider, { backgroundColor: dividerLine, width: '100%', marginVertical: 16 }]} />

                        <View style={styles.syncInfoBox}>
                            <MaterialCommunityIcons name="cloud-sync-outline" size={18} color="#34C759" style={{ marginTop: 2 }} />
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={[styles.syncInfoTitle, { color: textPrimary }]}>¿Qué información se va a sincronizar?</Text>
                                <Text style={[styles.syncInfoDesc, { color: textSecondary }]}>
                                    Se transferirán a la nube los registros guardados localmente: delimitaciones de lotes, parcelas georreferenciadas y catálogos de ensayos agrícolas pendientes.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View> 

                {/* ACCESO RÁPIDO */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>Acceso Rápido</Text>
                    
                    <TouchableOpacity
                        style={[styles.card, { 
                            backgroundColor: cardBg, 
                            padding: 20, 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            marginHorizontal: 4 
                        }]}
                        activeOpacity={0.8}
                        onPress={() => router.push(QUICK_CARDS[0].route)}
                    >
                        <View style={[styles.metricIconWrap, { backgroundColor: QUICK_CARDS[0].bg, marginRight: 15 }]}>
                            <MaterialCommunityIcons name={QUICK_CARDS[0].icon} size={24} color={QUICK_CARDS[0].color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: textPrimary }}>{QUICK_CARDS[0].title}</Text>
                            <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>{QUICK_CARDS[0].subtitle}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={textSecondary} />
                    </TouchableOpacity>
                </View>

            </Animated.ScrollView>

            {/* MODAL DE SINCRONIZACIÓN (Earth Loading) */}
            <Modal
                visible={isSyncModalVisible}
                transparent={true}
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
                                        fill="#7CC133"
                                    />
                                </Svg>
                            </Animated.View>
                            <Animated.View style={[styles.earthSvgWrapper2, svgStyle2]}>
                                <Svg height="100%" width="100%" viewBox="0 0 200 200">
                                    <Path
                                        transform="translate(100 100)"
                                        d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                                        fill="#7CC133"
                                    />
                                </Svg>
                            </Animated.View>
                        </View>
                        <Text style={styles.earthText}>
                            {isSyncing ? 'Sincronizando...' : (syncMessage ? syncMessage.text : 'Listo')}
                        </Text>
                        {syncMessage && !isSyncing && (
                            <TouchableOpacity
                                style={[styles.closeSyncBtn, { backgroundColor: syncMessage.type === 'error' ? '#FF453A' : '#34C759' }]}
                                onPress={() => { setIsSyncModalVisible(false); limpiarSyncMessage(); }}
                            >
                                <Text style={styles.closeSyncBtnText}>Cerrar</Text>
                            </TouchableOpacity>
                        )}
                        {isSyncing && (
                            <TouchableOpacity
                                style={styles.closeSyncBtn}
                                onPress={() => { setIsSyncModalVisible(false); }}
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
        paddingBottom: 120,
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
    heroCard: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    heroDecorIcon: {
        position: 'absolute',
        right: -22,
        bottom: -26,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroGreeting: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    heroName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 2,
        maxWidth: 240,
    },
    heroAvatarWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroStatsGrid: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    heroStatItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heroStatIconWrap: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: 'rgba(52, 199, 89, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    heroStatLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    pendingSyncAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 149, 0, 0.15)',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 10,
        gap: 8,
    },
    pendingSyncText: {
        flex: 1,
        color: '#FF9500',
        fontSize: 13,
        fontWeight: '600',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    metricIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    prefDivider: {
        height: 1,
    },
    uiverseBtn: {
        height: 60,
        width: '90%',
        borderRadius: 16,
        backgroundColor: '#34C759', 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6, 
    },
    uiverseText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '700',
        marginLeft: 10,
    },
    syncInfoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 4,
    },
    syncInfoTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    syncInfoDesc: {
        fontSize: 11,
        lineHeight: 15,
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
        backgroundColor: '#34C759',
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