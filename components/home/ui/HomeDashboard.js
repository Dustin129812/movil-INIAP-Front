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
    cancelAnimation,
    Easing,
    useAnimatedReaction,
    withDelay,
    withRepeat,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '../../../services/theme';
import NotificationsCenter from '../../notifications/ui/NotificationsCenter';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useRouter } from 'expo-router';

const AnimatedTouchable =
    Animated.createAnimatedComponent(TouchableOpacity);

const CALC_ROUTE = '/calculadora/calculadora';
const CATALOGOS_ROUTE = '/catalogos';
const INFOGRAFIAS_ROUTE = '/infografias';

const REVEAL_DURATION = 260;
const HIDE_DURATION = 160;
const STAGGER = 70;

// Altura de la imagen principal (Cotopaxi) que actúa como "pantalla" de bienvenida
const HERO_HEIGHT = 420;
// Cuánto hay que desplazar el scroll (tras salir del hero) para revelar el header flotante
const HERO_REVEAL_OFFSET = 150;

// Botón de notificaciones "glass" — optimizado para mayor nitidez y contraste
function NotifBell({ isDark, pendingCount, onPress, style }) {
    return (
        <AnimatedTouchable
            style={[styles.notifTouchable, style]}
            activeOpacity={0.75}
            onPress={onPress}
        >
            <BlurView intensity={isDark ? 85 : 95} tint={isDark ? 'dark' : 'light'} style={styles.notifPill}>
                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        { backgroundColor: isDark ? 'rgba(20,20,22,0.75)' : 'rgba(255,255,255,0.85)' },
                    ]}
                />
                <LinearGradient
                    colors={
                        isDark
                            ? ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
                            : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)']
                    }
                    start={{ x: 0.15, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
                <View
                    style={[
                        styles.notifSpecular,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,1)' },
                    ]}
                />
                <View
                    style={[
                        styles.notifGlassBorder,
                        { borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)' },
                    ]}
                />

                <MaterialCommunityIcons
                    name={pendingCount > 0 ? 'bell-badge-outline' : 'bell-outline'}
                    size={22}
                    color={pendingCount > 0 ? '#FF9500' : (isDark ? '#D0E17D' : '#4C8C2B')}
                />
                {pendingCount > 0 && (
                    <View style={styles.notifBadge}>
                        <Text style={styles.notifBadgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
                    </View>
                )}
            </BlurView>
        </AnimatedTouchable>
    );
}

// Mini-mockup 3D de la calculadora
function CalcMockup3D() {
    return (
        <View style={styles.calc3dOuter}>
            <View style={styles.calc3dGroundShadow} />
            <View style={styles.calc3dBody}>
                <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
                    style={styles.calc3dSheen}
                />
                <View style={[styles.calc3dScreen, { backgroundColor: '#101820' }]}>
                    <Text style={[styles.calc3dScreenText, { color: '#7CF29A' }]}>128.4</Text>
                </View>
                <View style={styles.calc3dKeys}>
                    <View style={styles.calc3dRow}>
                        <View style={[styles.calc3dKey, { backgroundColor: '#F4F2EE' }]}>
                            <Text style={styles.calc3dKeyText}>7</Text>
                        </View>
                        <View style={[styles.calc3dKey, { backgroundColor: '#F4F2EE' }]}>
                            <Text style={styles.calc3dKeyText}>8</Text>
                        </View>
                        <View style={[styles.calc3dKey, { backgroundColor: '#F4F2EE' }]}>
                            <Text style={styles.calc3dKeyText}>9</Text>
                        </View>
                    </View>
                    <View style={styles.calc3dRow}>
                        <View style={[styles.calc3dKey, { backgroundColor: '#F4F2EE' }]}>
                            <Text style={styles.calc3dKeyText}>4</Text>
                        </View>
                        <View style={[styles.calc3dKey, { backgroundColor: '#F4F2EE' }]}>
                            <Text style={styles.calc3dKeyText}>5</Text>
                        </View>
                        <View style={[styles.calc3dKey, styles.calc3dKeyAccent, { backgroundColor: '#E8A24B' }]}>
                            <Text style={[styles.calc3dKeyText, styles.calc3dKeyTextAccent]}>÷</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

// Mini-mockup 3D de un libro/catálogo
function BookMockup3D() {
    return (
        <View style={styles.book3dOuter}>
            <View style={styles.book3dGroundShadow} />
            <View style={styles.book3dPages} />
            <View style={styles.book3dCover}>
                <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                    style={styles.book3dSheen}
                />
                <MaterialCommunityIcons name="sprout" size={18} color="#8A431B" />
                <View>
                    <View style={styles.book3dLine} />
                    <View style={[styles.book3dLine, { width: '55%', marginTop: 4 }]} />
                </View>
            </View>
        </View>
    );
}

// Mini-mockup 3D de un documento/PDF
function DocMockup3D() {
    return (
        <View style={styles.doc3dOuter}>
            <View style={styles.doc3dGroundShadow} />
            <View style={styles.doc3dBody}>
                <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                    style={styles.doc3dSheen}
                />
                <View style={styles.doc3dFold} />
                <View style={styles.doc3dBars}>
                    <View style={[styles.doc3dBar, { height: 12, backgroundColor: '#BFE3F2' }]} />
                    <View style={[styles.doc3dBar, { height: 22, backgroundColor: '#2C86AE' }]} />
                    <View style={[styles.doc3dBar, { height: 8, backgroundColor: '#0B2C41' }]} />
                </View>
            </View>
            <View style={styles.doc3dPdfTag}>
                <Text style={styles.doc3dPdfTagText}>PDF</Text>
            </View>
        </View>
    );
}

// Placa "glass" con logo INIAP + título "Home" — alta nitidez y contraste mejorado
function BrandBadge({ isDark, textColor, titleStyle, style }) {
    return (
        <View style={[styles.brandTouchable, style]}>
            <BlurView intensity={isDark ? 85 : 95} tint={isDark ? 'dark' : 'light'} style={styles.brandPill}>
                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        { backgroundColor: isDark ? 'rgba(20,20,22,0.75)' : 'rgba(255,255,255,0.85)' },
                    ]}
                />
                <LinearGradient
                    colors={
                        isDark
                            ? ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
                            : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)']
                    }
                    start={{ x: 0.15, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
                <View
                    style={[
                        styles.brandGlassBorder,
                        { borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)' },
                    ]}
                />

                <View style={styles.brandLogoDisc}>
                    <Image
                        source={require('../../../assets/images/INIAP.png')}
                        style={styles.brandLogo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={[styles.brandPillTitle, titleStyle, { color: textColor }]}>Home</Text>
            </BlurView>
        </View>
    );
}

export default function HomeDashboard() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
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

    const GLOBE_SIZE = 120;
    const globeRotation = useSharedValue(0);

    useEffect(() => {
        if (isSyncModalVisible) {
            globeRotation.value = 0;
            globeRotation.value = withRepeat(
                withTiming(-GLOBE_SIZE, { duration: 4200, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            cancelAnimation(globeRotation);
        }
    }, [isSyncModalVisible]);

    const globeRotationStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: globeRotation.value }],
    }));

    const heroScrollThreshold = HERO_HEIGHT - insets.top - HERO_REVEAL_OFFSET;

    const [headerVisible, setHeaderVisible] = useState(false);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => { scrollY.value = event.contentOffset.y; },
    });

    const homeOpacity = useSharedValue(0);
    const homeTranslateY = useSharedValue(-6);

    const notifOpacity = useSharedValue(0);
    const notifTranslateY = useSharedValue(-6);

    useAnimatedReaction(
        () => scrollY.value > heroScrollThreshold,
        (isPastHero, wasPastHero) => {
            if (isPastHero === wasPastHero) return;
            if (isPastHero) {
                runOnJS(setHeaderVisible)(true);

                notifOpacity.value = withTiming(1, {
                    duration: REVEAL_DURATION,
                    easing: Easing.out(Easing.cubic),
                });

                notifTranslateY.value = withTiming(0, {
                    duration: REVEAL_DURATION,
                    easing: Easing.out(Easing.cubic),
                });

                homeOpacity.value = withDelay(
                    STAGGER,
                    withTiming(1, {
                        duration: REVEAL_DURATION,
                        easing: Easing.out(Easing.cubic),
                    })
                );

                homeTranslateY.value = withDelay(
                    STAGGER,
                    withTiming(0, {
                        duration: REVEAL_DURATION,
                        easing: Easing.out(Easing.cubic),
                    })
                );
            } else {
                homeOpacity.value = withTiming(0, {
                    duration: HIDE_DURATION,
                    easing: Easing.in(Easing.cubic),
                });

                homeTranslateY.value = withTiming(-6, {
                    duration: HIDE_DURATION,
                    easing: Easing.in(Easing.cubic),
                });

                notifOpacity.value = withDelay(
                    STAGGER,
                    withTiming(0, {
                        duration: HIDE_DURATION,
                        easing: Easing.in(Easing.cubic),
                    })
                );

                notifTranslateY.value = withDelay(
                    STAGGER,
                    withTiming(-6, {
                        duration: HIDE_DURATION,
                        easing: Easing.in(Easing.cubic),
                    })
                );

                runOnJS(setHeaderVisible)(false);
            }
        },
        [heroScrollThreshold]
    );

    const homeTitleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: homeOpacity.value,
        transform: [
            {
                translateY: homeTranslateY.value,
            },
        ],
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

            {/* Fondo superior oscurecido sutilmente para evitar mezcla difusa con el notch */}
            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? [
                            'rgba(0,0,0,0.65)',
                            'rgba(0,0,0,0.2)',
                            'rgba(0,0,0,0)',
                        ]
                        : [
                            'rgba(255,255,255,0.85)',
                            'rgba(255,255,255,0.4)',
                            'rgba(244,248,245,0)',
                        ]
                }
                style={[
                    styles.statusBarScrim,
                    {
                        height: insets.top + 55,
                    },
                ]}
            />

            {/* HEADER FLOTANTE — Aparece al hacer scroll con máxima nitidez */}
            <Animated.View
                pointerEvents={headerVisible ? 'auto' : 'none'}
                style={[styles.header, { paddingTop: insets.top + 2 }]}
            >
                <View style={styles.headerTopRow}>
                    <Animated.View style={homeTitleAnimatedStyle}>
                        <BrandBadge key={`brand-${theme}`} isDark={isDark} textColor={textPrimary} />
                    </Animated.View>

                    {!esInvitado && (
                        <NotifBell
                            key={`notif-${theme}`}
                            isDark={isDark}
                            pendingCount={pendingCount}
                            onPress={() => setIsNotificationsVisible(true)}
                            style={notifAnimatedStyle}
                        />
                    )}
                </View>
            </Animated.View>

            {/* CONTENIDO PRINCIPAL */}
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO — Imagen del Cotopaxi */}
                <View style={styles.heroWrapper}>
                    <Image
                        source={require('../../../assets/images/cotopaxi_2.jpg')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />

                    <LinearGradient
                        pointerEvents="none"
                        colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0)']}
                        locations={[0, 0.4]}
                        style={styles.heroTopScrim}
                    />

                    <LinearGradient
                        pointerEvents="none"
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
                        locations={[0.55, 1]}
                        style={StyleSheet.absoluteFillObject}
                    />

                    {/* Header estático sobre la foto */}
                    <View style={[styles.heroTopRow, { paddingTop: insets.top + 10 }]}>
                        <BrandBadge isDark={isDark} textColor={textPrimary} />

                        {!esInvitado && (
                            <NotifBell
                                isDark={isDark}
                                pendingCount={pendingCount}
                                onPress={() => setIsNotificationsVisible(true)}
                            />
                        )}
                    </View>

                    <View style={styles.heroBottomText}>
                        <Text style={styles.heroWelcome}>Bienvenido</Text>
                        <Text style={styles.heroCaption}>
                            {pendingCount > 0
                                ? `${pendingCount} cambio${pendingCount > 1 ? 's' : ''} sin sincronizar`
                                : `Todo al día con ${totalLotes} lote${totalLotes === 1 ? '' : 's'} activo${totalLotes === 1 ? '' : 's'}`}
                        </Text>
                    </View>
                </View>

                {/* SHEET — Tarjeta de contenido */}
                <View style={[styles.sheet, { backgroundColor: bg }]}>
                    <Text style={[styles.welcomeSubtitle, { color: textSecondary }]}>
                        Gestiona tus datos agrícolas{'\n'}de forma fácil y segura.
                    </Text>

                    {/* Sincronización */}
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

                    {/* HERRAMIENTAS */}
                    <Text style={[styles.toolsSectionTitle, { color: textPrimary }]}>Elige tu herramienta</Text>

                    {/* Banner Calculadora */}
                    <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={() => router.push(CALC_ROUTE)}
                        style={styles.toolBanner}
                    >
                        <View style={[StyleSheet.absoluteFillObject, styles.toolBannerClip]}>
                            <LinearGradient
                                colors={['#4B3B85', '#181330']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsInfoModalVisible(true)}
                            style={styles.toolInfoBadge}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialCommunityIcons name="information-outline" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.toolBannerTextCol}>
                            <Text style={styles.toolBannerTitle}>Calculadora</Text>
                            <Text style={styles.toolBannerSubtitle}>Dosis exacta de{'\n'}nutrientes para tu cultivo</Text>

                            <View style={styles.toolBannerArrowBtn}>
                                <MaterialCommunityIcons name="arrow-right" size={18} color="#181330" />
                            </View>
                        </View>

                        <View style={styles.toolBannerMockup} pointerEvents="none">
                            <CalcMockup3D />
                        </View>
                    </TouchableOpacity>

                    {/* Grid inferior */}
                    <View style={styles.toolsGrid}>
                        <TouchableOpacity
                            activeOpacity={0.92}
                            onPress={() => router.push(CATALOGOS_ROUTE)}
                            style={styles.toolGridCard}
                        >
                            <View style={[StyleSheet.absoluteFillObject, styles.toolGridClip]}>
                                <LinearGradient
                                    colors={['#E8A24B', '#7A3B12']}
                                    start={{ x: 0.15, y: 0 }}
                                    end={{ x: 0.85, y: 1 }}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            </View>
                            <View style={styles.toolGridMockup} pointerEvents="none">
                                <BookMockup3D />
                            </View>
                            <View style={styles.toolGridTextCol}>
                                <Text style={styles.toolGridTitle}>Catálogos</Text>
                                <Text style={styles.toolGridSubtitle}>Cultivos y plagas</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.92}
                            onPress={() => router.push(INFOGRAFIAS_ROUTE)}
                            style={styles.toolGridCard}
                        >
                            <View style={[StyleSheet.absoluteFillObject, styles.toolGridClip]}>
                                <LinearGradient
                                    colors={['#2C86AE', '#0B2C41']}
                                    start={{ x: 0.15, y: 0 }}
                                    end={{ x: 0.85, y: 1 }}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            </View>
                            <View style={styles.toolGridMockup} pointerEvents="none">
                                <DocMockup3D />
                            </View>
                            <View style={styles.toolGridTextCol}>
                                <Text style={styles.toolGridTitle}>Infografías y PDF</Text>
                                <Text style={styles.toolGridSubtitle}>Reportes offline</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Modal Info Calculadora */}
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

            {/* Modal Sincronización */}
            <Modal
                visible={isSyncModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsSyncModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.earthLoader}>
                        <Animated.View
                            style={[
                                styles.earthSvgStrip,
                                globeRotationStyle,
                            ]}
                        >
                            <Svg height="100%" width="100%" viewBox="0 0 240 120">
                                <Path
                                    transform="translate(58 96) scale(0.62)"
                                    d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
                                    fill="#A7C957"
                                />
                                <Path
                                    transform="translate(178 96) scale(0.62)"
                                    d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
                                    fill="#A7C957"
                                />
                                <Path
                                    transform="translate(28 22) scale(0.44)"
                                    d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                                    fill="#6A994E"
                                />
                                <Path
                                    transform="translate(148 22) scale(0.44)"
                                    d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                                    fill="#6A994E"
                                />
                            </Svg>
                        </Animated.View>

                        <LinearGradient
                            pointerEvents="none"
                            colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
                            start={{ x: 0.25, y: 0.1 }}
                            end={{ x: 0.7, y: 0.6 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                    </View>

                    <Text style={[styles.earthText, { color: '#FFFFFF' }]}>
                        {isSyncing
                            ? 'Sincronizando...'
                            : syncMessage
                                ? syncMessage.text
                                : 'Listo'}
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
            </Modal>

            {/* NOTIFICACIONES */}
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

/* ESTILOS */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    heroWrapper: {
        width: '100%',
        height: HERO_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000000',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    heroTopScrim: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 160,
    },
    heroTopRow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 5,
    },
    heroBottomText: {
        position: 'absolute',
        left: 24,
        bottom: 52,
        zIndex: 5,
    },
    heroWelcome: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.6,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    heroCaption: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
    },
    sheet: {
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 16,
        paddingTop: 24,
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
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
        paddingBottom: 10,
        paddingHorizontal: 20,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    brandTouchable: {
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 5,
    },
    brandPill: {
        height: 56,
        borderRadius: 28,
        paddingLeft: 10,
        paddingRight: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        overflow: 'hidden',
    },
    brandGlassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 28,
        borderWidth: 1.2,
    },
    brandLogoDisc: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandLogo: {
        width: 32,
        height: 32,
    },
    brandPillTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.4,
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    notifTouchable: {
        borderRadius: 26,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 5,
    },
    notifPill: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    notifGlassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 26,
        borderWidth: 1.2,
    },
    notifSpecular: {
        position: 'absolute',
        top: 0,
        left: 8,
        right: 8,
        height: 1,
        borderRadius: 1,
    },
    notifBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#FF9500',
        borderRadius: 10,
        minWidth: 19,
        height: 19,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    notifBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    welcomeSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 18,
    },
    toolsSectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.4,
        marginBottom: 12,
    },
    toolBanner: {
        borderRadius: 26,
        paddingVertical: 16,
        paddingLeft: 20,
        paddingRight: 4,
        minHeight: 132,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 4,
    },
    toolBannerClip: {
        borderRadius: 26,
        overflow: 'hidden',
    },
    toolInfoBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    toolBannerTextCol: {
        flex: 1,
        paddingRight: 8,
    },
    toolBannerTitle: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    toolBannerSubtitle: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 3,
        lineHeight: 16,
    },
    toolBannerArrowBtn: {
        marginTop: 12,
        alignSelf: 'flex-start',
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolBannerMockup: {
        width: 132,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    toolGridCard: {
        flex: 1,
        aspectRatio: 0.82,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 3,
    },
    toolGridClip: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    toolGridMockup: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolGridTextCol: {
        marginTop: 'auto',
    },
    toolGridTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    toolGridSubtitle: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 11.5,
        fontWeight: '600',
        marginTop: 2,
    },
    book3dOuter: {
        width: 90,
        height: 100,
    },
    book3dGroundShadow: {
        position: 'absolute',
        bottom: 4,
        left: 15,
        width: 60,
        height: 14,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.3)',
        transform: [{ scaleX: 1.3 }],
    },
    book3dPages: {
        position: 'absolute',
        top: 12,
        left: 22,
        width: 58,
        height: 74,
        borderRadius: 6,
        backgroundColor: '#F3ECDF',
        transform: [{ perspective: 600 }, { rotateY: '-16deg' }, { rotateZ: '-3deg' }],
    },
    book3dCover: {
        position: 'absolute',
        top: 5,
        left: 13,
        width: 58,
        height: 74,
        borderRadius: 6,
        backgroundColor: '#FBEEDD',
        padding: 8,
        justifyContent: 'space-between',
        overflow: 'hidden',
        transform: [{ perspective: 600 }, { rotateY: '-16deg' }, { rotateZ: '-3deg' }],
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 12 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
        elevation: 12,
    },
    book3dSheen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '55%',
    },
    book3dLine: {
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(122,59,18,0.35)',
        width: '75%',
    },
    doc3dOuter: {
        width: 90,
        height: 100,
    },
    doc3dGroundShadow: {
        position: 'absolute',
        bottom: 4,
        left: 14,
        width: 60,
        height: 14,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.3)',
        transform: [{ scaleX: 1.3 }],
    },
    doc3dBody: {
        position: 'absolute',
        top: 6,
        left: 12,
        width: 62,
        height: 78,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        padding: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        transform: [{ perspective: 600 }, { rotateY: '16deg' }, { rotateZ: '4deg' }],
        shadowColor: '#000',
        shadowOffset: { width: -6, height: 12 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
        elevation: 12,
    },
    doc3dSheen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '55%',
    },
    doc3dFold: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderTopWidth: 14,
        borderLeftWidth: 14,
        borderTopColor: '#D8D8D8',
        borderLeftColor: 'transparent',
    },
    doc3dBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    doc3dBar: {
        width: 8,
        borderRadius: 2,
    },
    doc3dPdfTag: {
        position: 'absolute',
        bottom: 2,
        left: 24,
        backgroundColor: '#E1432C',
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
    },
    doc3dPdfTagText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.3,
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
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earthLoader: {
        width: 120,
        height: 120,
        backgroundColor: '#3344C1',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    earthSvgStrip: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 240,
        height: 120,
    },
    earthText: {
        marginTop: 16,
        fontSize: 17,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Gill Sans'
                : 'sans-serif',
        fontWeight: '700',
        textAlign: 'center',
    },
    closeSyncBtn: {
        marginTop: 24,
        backgroundColor: '#386641',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    closeSyncBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
});