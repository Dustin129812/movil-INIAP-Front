import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '../../../services/theme';
import NotificationsCenter from '../../notifications/ui/NotificationsCenter';
import { useHomeDashboard } from '../hooks/useHomeDashboard';

const AnimatedTouchable =
    Animated.createAnimatedComponent(TouchableOpacity);

const QUICK_CARDS = [
    {
        id: 3,
        title: 'Calculadora',
        subtitle: 'Fertilizantes',
        route: '/calculadora/calculadora',
        icon: 'calculator',
        color: '#FFCC00',
        bg: 'rgba(255,204,0,0.14)',
        info: 'Calculadora de fertilizantes y nutrientes para tus cultivos.',
    },
    //BOTON DE CATALOGOS
    {
    id: 4,
    title: 'Catálogos',
    subtitle: 'Agrícolas',
    route: '/catalogos',                    //RUTA QUE NAVEGA
    icon: 'sprout-outline',                //ICONO
    color: '#8B5CF6',                      //COLOR PÚRPURA
    bg: 'rgba(139, 92, 246, 0.1)',        //FONDO
    info: 'Consulta cultivos, enfermedades, plagas y recomendaciones relacionadas.'
    }
];

/* ILUSTRACIÓN AGRÍCOLA MEJORADA */

function FarmIllustration({ isDark }) {
    return (
        <View
            pointerEvents="none"
            style={styles.farmIllustration}
        >
            <Svg
                width="100%"
                height="100%"
                viewBox="0 0 420 150"
            >
                {/* ===== ESTRELLAS (solo en modo oscuro) ===== */}
                {isDark && (
                    <>
                        <Circle cx="25" cy="15" r="1.2" fill="#F5E6A8" opacity="0.8" />
                        <Circle cx="85" cy="10" r="0.8" fill="#F5E6A8" opacity="0.6" />
                        <Circle cx="160" cy="8" r="1" fill="#F5E6A8" opacity="0.7" />
                        <Circle cx="220" cy="12" r="1.3" fill="#F5E6A8" opacity="0.75" />
                        <Circle cx="300" cy="20" r="0.9" fill="#F5E6A8" opacity="0.65" />
                        <Circle cx="370" cy="18" r="1.1" fill="#F5E6A8" opacity="0.7" />
                        <Circle cx="50" cy="5" r="0.7" fill="#F5E6A8" opacity="0.5" />
                        <Circle cx="310" cy="8" r="0.6" fill="#F5E6A8" opacity="0.55" />
                    </>
                )}

                {/* ===== AVES EN EL CIELO (más definidas) ===== */}
                {/* Pájaro 1 */}
                <Path
                    d="M65 28 Q68 24 72 28 M65 28 L63 30 M72 28 L74 30"
                    stroke={isDark ? '#A7C9B3' : '#5C7264'}
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isDark ? 0.7 : 0.6}
                />
                {/* Pájaro 2 */}
                <Path
                    d="M105 18 Q108 14 112 18 M105 18 L103 20 M112 18 L114 20"
                    stroke={isDark ? '#A7C9B3' : '#5C7264'}
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isDark ? 0.65 : 0.55}
                />
                {/* Pájaro 3 */}
                <Path
                    d="M145 30 Q148 26 152 30 M145 30 L143 32 M152 30 L154 32"
                    stroke={isDark ? '#A7C9B3' : '#5C7264'}
                    strokeWidth="1.7"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isDark ? 0.68 : 0.58}
                />

                {/* ===== SOL o LUNA ===== */}
                {!isDark ? (
                    <>
                        {/* Sol brillante modo claro */}
                        <Circle
                            cx="330"
                            cy="45"
                            r="20"
                            fill="#FFE680"
                            opacity="0.7"
                        />
                        <Circle
                            cx="330"
                            cy="45"
                            r="16"
                            fill="#FFD700"
                        />
                        <Circle
                            cx="330"
                            cy="45"
                            r="13"
                            fill="#FFED4E"
                        />
                    </>
                ) : (
                    <>
                        {/* Luna en modo oscuro */}
                        <Circle
                            cx="330"
                            cy="45"
                            r="20"
                            fill="#F5E6A8"
                            opacity="0.3"
                        />
                        <Circle
                            cx="330"
                            cy="45"
                            r="16"
                            fill="#F5E6A8"
                        />
                        {/* Cráteres de la luna */}
                        <Circle cx="324" cy="40" r="2.2" fill="#D4C58A" opacity="0.8" />
                        <Circle cx="337" cy="48" r="1.8" fill="#D4C58A" opacity="0.75" />
                        <Circle cx="322" cy="51" r="1.4" fill="#D4C58A" opacity="0.7" />
                        <Circle cx="335" cy="38" r="1" fill="#D4C58A" opacity="0.65" />
                    </>
                )}

                {/*  COLINAS  */}
                {/* Colina trasera (más oscura) */}
                <Path
                    d="M0 110 C70 84 120 92 175 105 C235 120 290 95 345 80 C375 73 400 76 420 82 L420 150 L0 150 Z"
                    fill={isDark ? '#1F4A33' : '#A8DCB6'}
                />

                {/* Colina delantera */}
                <Path
                    d="M0 130 C70 110 130 120 190 130 C245 138 305 110 360 100 C390 95 410 98 420 102 L420 150 L0 150 Z"
                    fill={isDark ? '#2A6B45' : '#BFE6CB'}
                />

                {/* CASA (más detalles)  */}
                {/* Cuerpo de la casa */}
                <Path
                    d="M338 80 L388 80 L388 102 L338 102 Z"
                    fill={isDark ? '#8C5A3F' : '#D9A982'}
                />

                {/* Sombra en la pared derecha */}
                <Path
                    d="M380 80 L388 80 L388 102 L380 102 Z"
                    fill={isDark ? '#6B4430' : '#C4956F'}
                    opacity="0.6"
                />

                {/* Techo triangular */}
                <Path
                    d="M333 80 L363 58 L393 80 Z"
                    fill={isDark ? '#5C3A28' : '#8B4513'}
                />

                {/* Sombreado del techo */}
                <Path
                    d="M363 58 L393 80 L363 80 Z"
                    fill={isDark ? '#3D2418' : '#6B3A1F'}
                    opacity="0.5"
                />

                {/* Puerta */}
                <Path
                    d="M358 90 H368 V102 H358 Z"
                    fill={isDark ? '#3D2418' : '#6B3A1F'}
                />

                {/* Manija de puerta */}
                <Circle
                    cx="367"
                    cy="96"
                    r="1.2"
                    fill={isDark ? '#8C5A3F' : '#A68472'}
                />

                {/* VENTANA ILUMINADA */}
                {isDark && (
                    <>
                        {/* Halo de luz alrededor */}
                        <Path
                            d="M375 84 H384 V93 H375 Z"
                            fill="#FFE066"
                            opacity="0.4"
                        />
                        {/* Ventana encendida */}
                        <Path
                            d="M376 85 H383 V92 H376 Z"
                            fill="#FFD24A"
                        />
                        {/* Cruceta de la ventana (vertical) */}
                        <Path
                            d="M379.3 85 H379.7 V92 H379.3 Z"
                            fill="#5C3A28"
                            strokeWidth="0.3"
                        />
                        {/* Cruceta de la ventana (horizontal) */}
                        <Path
                            d="M376 88.3 H383 V88.7 H376 Z"
                            fill="#5C3A28"
                            strokeWidth="0.3"
                        />
                    </>
                )}

                {/* ===== PLANTAS Y ÁRBOLES ===== */}
                {/* Arbusto pequeño izquierda */}
                <Path
                    d="M310 110 Q308 100 312 92 Q316 100 314 110 Z"
                    fill={isDark ? '#3D8C5F' : '#4FA070'}
                />
                <Path
                    d="M310 110 Q302 102 300 96 Q308 98 310 110 Z"
                    fill={isDark ? '#4FA572' : '#6BBF8A'}
                />
                <Path
                    d="M310 110 Q318 102 320 96 Q312 98 310 110 Z"
                    fill={isDark ? '#2D7A50' : '#5FA978'}
                    opacity="0.8"
                />

                {/* Planta grande derecha */}
                <Path
                    d="M400 115 Q396 102 400 92 Q404 102 400 115 Z"
                    fill={isDark ? '#3D8C5F' : '#4FA070'}
                />
                <Path
                    d="M400 115 Q388 104 386 95 Q396 100 400 115 Z"
                    fill={isDark ? '#4FA572' : '#6BBF8A'}
                />
                <Path
                    d="M400 115 Q412 104 414 95 Q404 100 400 115 Z"
                    fill={isDark ? '#4FA572' : '#6BBF8A'}
                />

                {/* Árbol grande izquierda (tronco) */}
                <Path
                    d="M50 110 C50 90 50 75 50 65"
                    stroke={isDark ? '#5B4229' : '#6D5232'}
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                {/* Árbol grande izquierda (copa) */}
                <Path
                    d="M30 65 C35 45 60 42 72 58 C88 53 100 65 95 78 C90 92 75 96 60 92 C45 97 28 86 30 65 Z"
                    fill={isDark ? '#1D7A29' : '#6EC44C'}
                />
                {/* Sombreado de la copa */}
                <Path
                    d="M60 65 C70 58 88 53 95 78 C90 92 75 96 60 92 Z"
                    fill={isDark ? '#0F5A1C' : '#4FA030'}
                    opacity="0.6"
                />
            </Svg>
        </View>
    );
}

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
    } = useHomeDashboard();

    const [isSyncModalVisible, setIsSyncModalVisible] =
        useState(false);

    const [isNotificationsVisible, setIsNotificationsVisible] =
        useState(false);

    /* =====================================================
       ANIMACIONES DEL MODAL
    ===================================================== */

    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);

    useEffect(() => {
        if (isSyncModalVisible) {
            anim1.value = 0;
            anim2.value = 0;

            anim1.value = withRepeat(
                withTiming(1, {
                    duration: 5000,
                    easing: Easing.linear,
                }),
                -1,
                false
            );

            anim2.value = withRepeat(
                withTiming(1, {
                    duration: 5000,
                    easing: Easing.linear,
                }),
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

        return {
            left: interpolate(
                progress,
                [0, 0.3, 0.31, 0.35, 0.45, 1],
                [-32, -96, -96, 112, 112, -32]
            ),
            opacity: interpolate(
                progress,
                [0, 0.3, 0.31, 0.35, 0.45, 1],
                [1, 1, 0, 0, 1, 1]
            ),
        };
    });

    const svgStyle2 = useAnimatedStyle(() => {
        const progress = anim2.value;

        return {
            left: interpolate(
                progress,
                [0, 0.75, 0.76, 0.77, 0.8, 1],
                [80, -112, -112, 128, 128, 80]
            ),
            opacity: interpolate(
                progress,
                [0, 0.75, 0.76, 0.77, 0.8, 1],
                [1, 1, 0, 0, 1, 1]
            ),
        };
    });

    /* HEADER / SCROLL  */

    const HEADER_ROW_HEIGHT = 54;
    const HEADER_ROW_GAP = 10;

    const headerContentHeight =
        insets.top +
        2 +
        HEADER_ROW_HEIGHT +
        HEADER_ROW_GAP;

    const scrollTopPadding = headerContentHeight + 8;

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
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
            }
        },
        [TOP_REVEAL_THRESHOLD]
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
        transform: [
            {
                translateY: notifTranslateY.value,
            },
        ],
    }));

    /* COLORES DEL TEMA */

    const bg = isDark
        ? '#061116'
        : '#F4F8F5';

    const cardBg = isDark
        ? '#0B1C20'
        : '#FFFFFF';

    const textPrimary = isDark
        ? '#F8FFFA'
        : '#101513';

    const textSecondary = isDark
        ? '#91A6A0'
        : '#727C76';

    const mutedText = isDark
        ? '#6E8580'
        : '#8A938E';

    const green = '#31C653';
    const greenDark = '#0A8F43';

    const displayName =
        usuario?.NOMBRE || 'Invitado';

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: bg,
                },
            ]}
        >
            <StatusBar
                barStyle={
                    isDark
                        ? 'light-content'
                        : 'dark-content'
                }
                translucent
                backgroundColor="transparent"
            />

            {/* FONDO SUPERIOR */}

            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? [
                            'rgba(16,52,57,0.75)',
                            'rgba(6,17,22,0.18)',
                            'rgba(6,17,22,0)',
                        ]
                        : [
                            'rgba(255,255,255,0.98)',
                            'rgba(237,248,238,0.65)',
                            'rgba(244,248,245,0)',
                        ]
                }
                style={[
                    styles.statusBarScrim,
                    {
                        height: insets.top + 205,
                    },
                ]}
            />

            {/* HEADER  */}

            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 8,
                    },
                ]}
            >
                <View style={styles.headerTopRow}>
                    <Animated.View
                        style={homeTitleAnimatedStyle}
                    >
                        <View style={styles.greetingRow}>
                            <Text
                                style={[
                                    styles.headerHomeTitle,
                                    {
                                        color: textPrimary,
                                    },
                                ]}
                            >
                                Home
                            </Text>

                            <MaterialCommunityIcons
                                name="leaf"
                                size={17}
                                color={green}
                                style={{
                                    marginLeft: 5,
                                }}
                            />
                        </View>
                    </Animated.View>

                    <AnimatedTouchable
                        style={[
                            styles.notifTouchable,
                            notifAnimatedStyle,
                        ]}
                        activeOpacity={0.78}
                        onPress={() =>
                            setIsNotificationsVisible(true)
                        }
                    >
                        <BlurView
                            intensity={
                                isDark ? 45 : 80
                            }
                            tint={
                                isDark
                                    ? 'dark'
                                    : 'light'
                            }
                            style={styles.notifPill}
                        >
                            <View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    {
                                        backgroundColor:
                                            isDark
                                                ? 'rgba(12,31,34,0.72)'
                                                : 'rgba(255,255,255,0.78)',
                                    },
                                ]}
                            />

                            <View
                                style={[
                                    styles.notifGlassBorder,
                                    {
                                        borderColor:
                                            isDark
                                                ? 'rgba(104,151,135,0.28)'
                                                : 'rgba(255,255,255,0.95)',
                                    },
                                ]}
                            />

                            <MaterialCommunityIcons
                                name={
                                    pendingCount > 0
                                        ? 'bell-badge-outline'
                                        : 'bell-outline'
                                }
                                size={24}
                                color={
                                    pendingCount > 0
                                        ? '#FF9500'
                                        : green
                                }
                            />

                            {pendingCount > 0 && (
                                <View
                                    style={
                                        styles.notifBadge
                                    }
                                >
                                    <Text
                                        style={
                                            styles.notifBadgeText
                                        }
                                    >
                                        {pendingCount > 99
                                            ? '99+'
                                            : pendingCount}
                                    </Text>
                                </View>
                            )}
                        </BlurView>
                    </AnimatedTouchable>
                </View>
            </View>

            {/*CONTENIDO */}

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: scrollTopPadding,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* INTRO */}

                <View style={styles.introBlock}>
                    {/* Texto a la izquierda */}
                    <View style={styles.introTextCol}>
                        <View style={styles.greetingRow}>
                            <Text
                                style={[
                                    styles.introHello,
                                    {
                                        color: textPrimary,
                                    },
                                ]}
                            >
                                ¡Hola!
                            </Text>

                            <MaterialCommunityIcons
                                name="leaf"
                                size={22}
                                color={green}
                                style={{
                                    marginLeft: 6,
                                }}
                            />
                        </View>

                        <Text
                            style={[
                                styles.introName,
                                {
                                    color: green,
                                },
                            ]}
                        >
                            {displayName}
                        </Text>

                        <Text
                            style={[
                                styles.introDescription,
                                {
                                    color: textSecondary,
                                },
                            ]}
                        >
                            Gestiona tus datos agrícolas
                            {'\n'}
                            de forma fácil y segura
                        </Text>
                    </View>

                    {/* Ilustración a la derecha */}
                    <FarmIllustration
                        isDark={isDark}
                    />
                </View>

                {/*RESUMEN / LOTES */}

                <View
                    style={[
                        styles.heroCard,
                        {
                            borderColor: isDark
                                ? 'rgba(85,155,112,0.38)'
                                : 'rgba(16,120,60,0.14)',
                        },
                    ]}
                >
                    <LinearGradient
                        colors={
                            isDark
                                ? [
                                    '#0C432A',
                                    '#071E1C',
                                    '#071417',
                                ]
                                : [
                                    '#15974A',
                                    '#07813E',
                                    '#056C39',
                                ]
                        }
                        start={{
                            x: 0,
                            y: 0,
                        }}
                        end={{
                            x: 1,
                            y: 1,
                        }}
                        style={
                            StyleSheet.absoluteFillObject
                        }
                    />

                    <MaterialCommunityIcons
                        name="leaf"
                        size={118}
                        color="rgba(109,225,84,0.15)"
                        style={
                            styles.heroDecorIcon
                        }
                    />

                    <View
                        style={styles.heroTopRow}
                    >
                        <View
                            style={{
                                flex: 1,
                            }}
                        >
                            <Text
                                style={
                                    styles.heroGreeting
                                }
                            >
                                RESUMEN
                            </Text>

                            <Text
                                style={
                                    styles.heroTitle
                                }
                            >
                                Lotes activos
                            </Text>
                        </View>

                        <View
                            style={
                                styles.heroAvatarWrap
                            }
                        >
                            <MaterialCommunityIcons
                                name="leaf"
                                size={28}
                                color="#FFFFFF"
                            />
                        </View>
                    </View>

                    <View
                        style={
                            styles.heroStatsGrid
                        }
                    >
                        <View
                            style={
                                styles.heroStatIconWrap
                            }
                        >
                            <MaterialCommunityIcons
                                name="map-marker-radius"
                                size={23}
                                color={green}
                            />
                        </View>

                        <View>
                            <Text
                                style={
                                    styles.heroStatValue
                                }
                            >
                                {totalLotes}
                            </Text>

                            <Text
                                style={
                                    styles.heroStatLabel
                                }
                            >
                                lotes registrados
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={
                            styles.heroFooterText
                        }
                    >
                        {totalLotes > 0
                            ? 'Tus lotes están listos para ser gestionados.'
                            : 'Aún no tienes lotes sincronizados.'}
                    </Text>

                    {pendingCount > 0 && (
                        <TouchableOpacity
                            style={
                                styles.pendingSyncAlert
                            }
                            activeOpacity={0.8}
                            onPress={() => {
                                setIsSyncModalVisible(
                                    true
                                );
                                sincronizar();
                            }}
                        >
                            <MaterialCommunityIcons
                                name="cloud-upload-outline"
                                size={18}
                                color="#FFB340"
                            />

                            <Text
                                style={
                                    styles.pendingSyncText
                                }
                            >
                                Tienes {pendingCount}{' '}
                                cambio
                                {pendingCount > 1
                                    ? 's'
                                    : ''}{' '}
                                pendiente
                                {pendingCount > 1
                                    ? 's'
                                    : ''}{' '}
                                de sincronizar
                            </Text>

                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={18}
                                color="#FFB340"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* =================================================
                    HERRAMIENTA DESTACADA
                ================================================= */}

                <View style={styles.section}>
                    <View
                        style={
                            styles.sectionHeader
                        }
                    >
                        <View
                            style={
                                styles.sectionIconCircle
                            }
                        >
                            <MaterialCommunityIcons
                                name="star"
                                size={13}
                                color="#FFFFFF"
                            />
                        </View>

                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: greenDark,
                                },
                            ]}
                        >
                            HERRAMIENTA DESTACADA
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.featureCard,
                            {
                                backgroundColor:
                                    cardBg,
                                borderColor:
                                    isDark
                                        ? '#214044'
                                        : '#E4ECE7',
                            },
                        ]}
                    >
                        {/* BOTÓN SINCRONIZAR */}

                        <TouchableOpacity
                            style={
                                styles.syncFeatureButton
                            }
                            activeOpacity={0.84}
                            onPress={() => {
                                setIsSyncModalVisible(
                                    true
                                );
                                sincronizar();
                            }}
                        >
                            <LinearGradient
                                colors={
                                    isDark
                                        ? [
                                            '#4ED43D',
                                            '#0B9345',
                                        ]
                                        : [
                                            '#62D43D',
                                            '#08A34A',
                                        ]
                                }
                                start={{
                                    x: 0.1,
                                    y: 0,
                                }}
                                end={{
                                    x: 0.9,
                                    y: 1,
                                }}
                                style={
                                    StyleSheet.absoluteFillObject
                                }
                            />

                            <MaterialCommunityIcons
                                name="cloud-sync"
                                size={43}
                                color="#FFFFFF"
                            />

                            <Text
                                style={
                                    styles.syncFeatureTitle
                                }
                            >
                                Sincronizar
                            </Text>

                            <Text
                                style={
                                    styles.syncFeatureSubtitle
                                }
                            >
                                Mantén tu información
                                {'\n'}
                                siempre al día
                            </Text>

                            <View
                                style={
                                    styles.syncFeatureArrow
                                }
                            >
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={25}
                                    color={
                                        isDark
                                            ? '#07351D'
                                            : '#0B8A3F'
                                    }
                                />
                            </View>

                            <MaterialCommunityIcons
                                name="leaf"
                                size={70}
                                color="rgba(255,255,255,0.13)"
                                style={
                                    styles.syncLeafDecor
                                }
                            />
                        </TouchableOpacity>

                        {/* INFORMACIÓN */}

                        <View
                            style={
                                styles.syncInfoBox
                            }
                        >
                            <View
                                style={[
                                    styles.syncInfoIconWrap,
                                    {
                                        backgroundColor:
                                            isDark
                                                ? 'rgba(49,198,83,0.14)'
                                                : '#EAF9EE',
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="cloud-sync-outline"
                                    size={22}
                                    color={green}
                                />
                            </View>

                            <Text
                                style={[
                                    styles.syncInfoTitle,
                                    {
                                        color: textPrimary,
                                    },
                                ]}
                            >
                                ¿Qué información
                                {'\n'}
                                se va a sincronizar?
                            </Text>

                            <Text
                                style={[
                                    styles.syncInfoDesc,
                                    {
                                        color: textSecondary,
                                    },
                                ]}
                            >
                                Se transferirán a la nube
                                los registros guardados
                                localmente:
                                delimitaciones de lotes,
                                parcelas
                                georreferenciadas y
                                catálogos de ensayos
                                agrícolas pendientes.
                            </Text>

                            <View
                                style={
                                    styles.syncSparkles
                                }
                            >
                                <Text
                                    style={[
                                        styles.sparkle,
                                        {
                                            color: green,
                                        },
                                    ]}
                                >
                                    ✦
                                </Text>

                                <Text
                                    style={[
                                        styles.sparkleSmall,
                                        {
                                            color: green,
                                        },
                                    ]}
                                >
                                    ✦
                                </Text>
                            </View>

                            {/* Decoración inferior */}

                            <View
                                pointerEvents="none"
                                style={
                                    styles.cloudDecoration
                                }
                            >
                                <MaterialCommunityIcons
                                    name="cloud"
                                    size={62}
                                    color={
                                        isDark
                                            ? 'rgba(75,138,139,0.28)'
                                            : 'rgba(128,196,208,0.30)'
                                    }
                                />

                                <MaterialCommunityIcons
                                    name="database"
                                    size={37}
                                    color={
                                        isDark
                                            ? 'rgba(46,181,90,0.42)'
                                            : 'rgba(53,157,74,0.35)'
                                    }
                                    style={
                                        styles.databaseIcon
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* ACCESO RÁPIDO*/}

                <View style={styles.section}>
                    <View
                        style={
                            styles.sectionHeader
                        }
                    >
                        <View
                            style={[
                                styles.sectionIconCircle,
                                {
                                    backgroundColor:
                                        isDark
                                            ? '#0D4B29'
                                            : '#EAF9EE',
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="flash"
                                size={14}
                                color={
                                    isDark
                                        ? '#70E75D'
                                        : greenDark
                                }
                            />
                        </View>

                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: greenDark,
                                },
                            ]}
                        >
                            ACCESO RÁPIDO
                        </Text>
                    </View>
                    {QUICK_CARDS.map((card, idx) => (
                        <TouchableOpacity
                            key={card.id}
                            style={[
                                styles.quickCard,
                                {
                                    backgroundColor:
                                        cardBg,
                                    borderColor:
                                        isDark
                                            ? '#21383B'
                                            : '#E7ECE9',
                                    marginTop:
                                        idx === 0
                                            ? 0
                                            : 12,
                                },
                            ]}
                            activeOpacity={0.82}
                            onPress={() =>
                                router.push(
                                    card.route
                                )
                            }
                        >
                            <View
                                style={[
                                    styles.metricIconWrap,
                                    {
                                        backgroundColor:
                                            card.bg,
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={
                                        card.icon
                                    }
                                    size={25}
                                    color={
                                        card.color
                                    }
                                />
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text
                                    style={[
                                        styles.quickTitle,
                                        {
                                            color: textPrimary,
                                        },
                                    ]}
                                >
                                    {
                                        card.title
                                    }
                                </Text>

                                <Text
                                    style={[
                                        styles.quickSubtitle,
                                        {
                                            color: textSecondary,
                                        },
                                    ]}
                                >
                                    {
                                        card.subtitle
                                    }
                                </Text>
                            </View>

                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={23}
                                color={mutedText}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </Animated.ScrollView>

            {/*MODAL DE SINCRONIZACIÓN ESTA PARTE CONSERVA LA FUNCIONALIDAD ORIGINAL*/}

            <Modal
                visible={isSyncModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setIsSyncModalVisible(false)
                }
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={[
                            styles.earthContainer,
                            {
                                backgroundColor:
                                    isDark
                                        ? '#102020'
                                        : '#FFFFFF',
                                borderColor:
                                    isDark
                                        ? '#28513D'
                                        : '#E4ECE7',
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.earthLoader
                            }
                        >
                            <Animated.View
                                style={[
                                    styles.earthSvgWrapper1,
                                    svgStyle1,
                                ]}
                            >
                                <Svg
                                    height="100%"
                                    width="100%"
                                    viewBox="0 0 200 200"
                                >
                                    <Path
                                        transform="translate(100 100)"
                                        d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z"
                                        fill="#7CC133"
                                    />
                                </Svg>
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.earthSvgWrapper2,
                                    svgStyle2,
                                ]}
                            >
                                <Svg
                                    height="100%"
                                    width="100%"
                                    viewBox="0 0 200 200"
                                >
                                    <Path
                                        transform="translate(100 100)"
                                        d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z"
                                        fill="#7CC133"
                                    />
                                </Svg>
                            </Animated.View>
                        </View>

                        <Text
                            style={[
                                styles.earthText,
                                {
                                    color: textPrimary,
                                },
                            ]}
                        >
                            {isSyncing
                                ? 'Sincronizando...'
                                : syncMessage
                                    ? syncMessage.text
                                    : 'Listo'}
                        </Text>

                        {syncMessage &&
                            !isSyncing && (
                                <TouchableOpacity
                                    style={[
                                        styles.closeSyncBtn,
                                        {
                                            backgroundColor:
                                                syncMessage.type ===
                                                'error'
                                                    ? '#FF453A'
                                                    : '#34C759',
                                        },
                                    ]}
                                    onPress={() => {
                                        setIsSyncModalVisible(
                                            false
                                        );
                                        limpiarSyncMessage();
                                    }}
                                >
                                    <Text
                                        style={
                                            styles.closeSyncBtnText
                                        }
                                    >
                                        Cerrar
                                    </Text>
                                </TouchableOpacity>
                            )}

                        {isSyncing && (
                            <TouchableOpacity
                                style={
                                    styles.closeSyncBtn
                                }
                                onPress={() =>
                                    setIsSyncModalVisible(
                                        false
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.closeSyncBtnText
                                    }
                                >
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            {/*NOTIFICACIONES */}

            <NotificationsCenter
                visible={
                    isNotificationsVisible
                }
                onClose={() =>
                    setIsNotificationsVisible(
                        false
                    )
                }
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
        paddingHorizontal: 16,
        paddingBottom: 120,
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

    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerHomeTitle: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -1.2,
        lineHeight: 35,
    },

    notifTouchable: {
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 5,
    },

    notifPill: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    notifGlassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 27,
        borderWidth: 1,
    },

    notifBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
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

    /* INTRO */

    introBlock: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minHeight: 180,
        paddingTop: 4,
        paddingLeft: 4,
        paddingRight: 0,
        marginBottom: 12,
        position: 'relative',
    },

    introTextCol: {
        flex: 1,
        paddingRight: 8,
        paddingBottom: 6,
    },

    introHello: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -1.0,
        lineHeight: 36,
    },

    introName: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.8,
        lineHeight: 36,
        marginTop: -2,
    },

    introDescription: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
        maxWidth: 200,
        marginTop: 8,
    },

    farmIllustration: {
        width: '52%',
        height: 150,
    },

    /* HERO */

    heroCard: {
        minHeight: 192,
        borderRadius: 20,
        padding: 17,
        marginBottom: 23,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        shadowColor: '#063C20',
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 4,
    },

    heroDecorIcon: {
        position: 'absolute',
        right: 6,
        bottom: -17,
        transform: [
            {
                rotate: '-12deg',
            },
        ],
    },

    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    heroGreeting: {
        fontSize: 11,
        color: '#62E579',
        fontWeight: '700',
        letterSpacing: 0.6,
        marginBottom: 4,
    },

    heroTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },

    heroAvatarWrap: {
        width: 46,
        height: 46,
        borderRadius: 13,
        backgroundColor: '#20C94D',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0DFF54',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },

    heroStatsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        minWidth: 154,
        backgroundColor: 'rgba(255,255,255,0.09)',
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 11,
    },

    heroStatIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(53,214,88,0.17)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    heroStatValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 22,
    },

    heroStatLabel: {
        fontSize: 10,
        color: '#D4E4DC',
        fontWeight: '500',
        marginTop: 1,
    },

    heroFooterText: {
        fontSize: 11,
        color: '#C9DAD2',
        marginTop: 12,
        fontWeight: '500',
    },

    pendingSyncAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,149,0,0.14)',
        borderRadius: 10,
        paddingHorizontal: 11,
        paddingVertical: 8,
        marginTop: 10,
    },

    pendingSyncText: {
        flex: 1,
        color: '#FFB340',
        fontSize: 12,
        fontWeight: '600',
        marginHorizontal: 7,
    },

    /* SECCIONES */

    section: {
        marginBottom: 21,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2,
        marginBottom: 9,
    },

    sectionIconCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#159C48',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.25,
    },

    /* SINCRONIZACIÓN */

    featureCard: {
        minHeight: 284,
        borderRadius: 19,
        borderWidth: 1,
        overflow: 'hidden',
        flexDirection: 'row',
        padding: 13,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 2,
    },

    syncFeatureButton: {
        width: '43%',
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 29,
        paddingHorizontal: 9,
        position: 'relative',
    },

    syncFeatureTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 12,
        textAlign: 'center',
        letterSpacing: -0.3,
    },

    syncFeatureSubtitle: {
        color: 'rgba(255,255,255,0.88)',
        fontSize: 10,
        lineHeight: 15,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 5,
    },

    syncFeatureArrow: {
        position: 'absolute',
        right: 10,
        bottom: 34,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.16,
        shadowRadius: 5,
        elevation: 3,
    },

    syncLeafDecor: {
        position: 'absolute',
        bottom: -7,
        left: -8,
        transform: [
            {
                rotate: '-25deg',
            },
        ],
    },

    syncInfoBox: {
        flex: 1,
        paddingLeft: 12,
        paddingTop: 8,
        position: 'relative',
        overflow: 'hidden',
    },

    syncInfoIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },

    syncInfoTitle: {
        fontSize: 12,
        fontWeight: '800',
        lineHeight: 16,
        marginBottom: 8,
    },

    syncInfoDesc: {
        fontSize: 10.5,
        lineHeight: 16,
        fontWeight: '500',
    },

    syncSparkles: {
        position: 'absolute',
        right: 7,
        top: 55,
    },

    sparkle: {
        fontSize: 16,
        fontWeight: '700',
    },

    sparkleSmall: {
        fontSize: 9,
        position: 'absolute',
        right: -6,
        top: 12,
    },

    cloudDecoration: {
        position: 'absolute',
        right: -3,
        bottom: -7,
        width: 88,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
    },

    databaseIcon: {
        position: 'absolute',
        bottom: 3,
        left: 24,
    },

    /* ACCESO RÁPIDO */

    quickCard: {
        minHeight: 76,
        borderRadius: 17,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.045,
        shadowRadius: 8,
        elevation: 1,
    },

    metricIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 13,
    },

    quickTitle: {
        fontSize: 16,
        fontWeight: '800',
    },

    quickSubtitle: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '500',
    },

    /* MODAL */

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    earthContainer: {
        width: 245,
        minHeight: 245,
        borderRadius: 26,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.28,
        shadowRadius: 25,
        elevation: 10,
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
        marginTop: 20,
        backgroundColor: '#34C759',
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