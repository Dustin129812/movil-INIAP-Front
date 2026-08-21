import React, { useEffect, useState } from 'react';

import {
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    StatusBar,
    Modal,
} from 'react-native';

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

const AnimatedTouchable =
    Animated.createAnimatedComponent(TouchableOpacity);

const CALC_ROUTE = '/calculadora/calculadora';
const CATALOG_ROUTE = '/catalogos';

const REVEAL_DURATION = 260;
const HIDE_DURATION = 160;
const STAGGER = 70;
const TOP_REVEAL_THRESHOLD = 12;

// ============================================
// PALETA DE COLORES
// ============================================

const COLORS = {
    cream: '#FCF8F0',

    darkGreen: '#0B3D24',
    forestGreen: '#174D2E',
    green: '#6FAF32',
    brightGreen: '#78B832',

    quickCard: '#C9E28D',
    quickIcon: '#A9D266',
    quickArrow: '#6FAF32',

    calculator: '#75CFA3',
    calculatorArrow: '#6FAF32',

    // COLOR ORIGINAL DE ESTADO
    state: '#E5EBD3',
    stateIcon: 'rgba(111,175,50,0.16)',

    secondaryGreen: '#477442',
    white: '#FFFFFF',

    orange: '#F59E0B',
    error: '#E5484D',
};

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

    // ============================================
    // MODALES
    // ============================================

    const [
        isSyncModalVisible,
        setIsSyncModalVisible,
    ] = useState(false);

    const [
        isNotificationsVisible,
        setIsNotificationsVisible,
    ] = useState(false);

    const [
        isInfoModalVisible,
        setIsInfoModalVisible,
    ] = useState(false);

    // ============================================
    // ANIMACIÓN SINCRONIZACIÓN
    // ============================================

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

        const left = interpolate(
            progress,
            [0, 0.3, 0.31, 0.35, 0.45, 1],
            [-32, -96, -96, 112, 112, -32]
        );

        const opacity = interpolate(
            progress,
            [0, 0.3, 0.31, 0.35, 0.45, 1],
            [1, 1, 0, 0, 1, 1]
        );

        return {
            left,
            opacity,
        };
    });

    const svgStyle2 = useAnimatedStyle(() => {
        const progress = anim2.value;

        const left = interpolate(
            progress,
            [0, 0.75, 0.76, 0.77, 0.8, 1],
            [80, -112, -112, 128, 128, 80]
        );

        const opacity = interpolate(
            progress,
            [0, 0.75, 0.76, 0.77, 0.8, 1],
            [1, 1, 0, 0, 1, 1]
        );

        return {
            left,
            opacity,
        };
    });

    // ============================================
    // HEADER
    // ============================================

    const HEADER_ROW_HEIGHT = 54;
    const HEADER_ROW_GAP = 10;

    const headerContentHeight =
        insets.top +
        2 +
        HEADER_ROW_HEIGHT +
        HEADER_ROW_GAP;

    const scrollTopPadding =
        headerContentHeight + 6;

    // ============================================
    // SCROLL
    // ============================================

    const scrollY = useSharedValue(0);

    const scrollHandler =
        useAnimatedScrollHandler({
            onScroll: (event) => {
                scrollY.value =
                    event.contentOffset.y;
            },
        });

    const homeOpacity = useSharedValue(1);
    const homeTranslateY = useSharedValue(0);

    const notifOpacity = useSharedValue(1);
    const notifTranslateY = useSharedValue(0);

    useAnimatedReaction(
        () =>
            scrollY.value <=
            TOP_REVEAL_THRESHOLD,
        (isAtTop, wasAtTop) => {
            if (isAtTop === wasAtTop) {
                return;
            }

            if (isAtTop) {
                notifOpacity.value =
                    withTiming(1, {
                        duration:
                            REVEAL_DURATION,
                        easing:
                            Easing.out(
                                Easing.cubic
                            ),
                    });

                notifTranslateY.value =
                    withTiming(0, {
                        duration:
                            REVEAL_DURATION,
                        easing:
                            Easing.out(
                                Easing.cubic
                            ),
                    });

                homeOpacity.value =
                    withDelay(
                        STAGGER,
                        withTiming(1, {
                            duration:
                                REVEAL_DURATION,
                            easing:
                                Easing.out(
                                    Easing.cubic
                                ),
                        })
                    );

                homeTranslateY.value =
                    withDelay(
                        STAGGER,
                        withTiming(0, {
                            duration:
                                REVEAL_DURATION,
                            easing:
                                Easing.out(
                                    Easing.cubic
                                ),
                        })
                    );
            } else {
                homeOpacity.value =
                    withTiming(0, {
                        duration:
                            HIDE_DURATION,
                        easing:
                            Easing.in(
                                Easing.cubic
                            ),
                    });

                homeTranslateY.value =
                    withTiming(-6, {
                        duration:
                            HIDE_DURATION,
                        easing:
                            Easing.in(
                                Easing.cubic
                            ),
                    });

                notifOpacity.value =
                    withDelay(
                        STAGGER,
                        withTiming(0, {
                            duration:
                                HIDE_DURATION,
                            easing:
                                Easing.in(
                                    Easing.cubic
                                ),
                        })
                    );

                notifTranslateY.value =
                    withDelay(
                        STAGGER,
                        withTiming(-6, {
                            duration:
                                HIDE_DURATION,
                            easing:
                                Easing.in(
                                    Easing.cubic
                                ),
                        })
                    );
            }
        },
        [TOP_REVEAL_THRESHOLD]
    );

    const homeTitleAnimatedStyle =
        useAnimatedStyle(() => ({
            opacity:
                homeOpacity.value,
            transform: [
                {
                    translateY:
                        homeTranslateY.value,
                },
            ],
        }));

    const notifAnimatedStyle =
        useAnimatedStyle(() => ({
            opacity:
                notifOpacity.value,
            transform: [
                {
                    translateY:
                        notifTranslateY.value,
                },
            ],
        }));

    // ============================================
    // COLORES GENERALES
    // ============================================

    const bg =
        isDark
            ? '#101510'
            : COLORS.cream;

    const cardBg =
        isDark
            ? '#1E261F'
            : COLORS.state;

    const textPrimary =
        isDark
            ? COLORS.white
            : COLORS.darkGreen;

    const textSecondary =
        isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen;

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

            {/* ============================================ */}
            {/* SOMBRA SUPERIOR */}
            {/* ============================================ */}

            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? [
                            'rgba(0,0,0,0.55)',
                            'rgba(0,0,0,0.28)',
                            'rgba(0,0,0,0)',
                        ]
                        : [
                            'rgba(23,77,46,0.10)',
                            'rgba(23,77,46,0.04)',
                            'rgba(23,77,46,0)',
                        ]
                }
                style={[
                    styles.statusBarScrim,
                    {
                        height:
                            insets.top + 40,
                    },
                ]}
            />

            {/* ============================================ */}
            {/* HEADER */}
            {/* ============================================ */}

            <View
                style={[
                    styles.header,
                    {
                        paddingTop:
                            insets.top + 2,
                    },
                ]}
            >
                <View
                    style={
                        styles.headerTopRow
                    }
                >
                    <Animated.Text
                        style={[
                            styles.headerHomeTitle,
                            {
                                color:
                                    textPrimary,
                            },
                            homeTitleAnimatedStyle,
                        ]}
                    >
                        Home
                    </Animated.Text>

                    {!esInvitado && (
                        <AnimatedTouchable
                            style={[
                                styles.notifTouchable,
                                notifAnimatedStyle,
                            ]}
                            activeOpacity={0.75}
                            onPress={() =>
                                setIsNotificationsVisible(
                                    true
                                )
                            }
                        >
                            <BlurView
                                intensity={
                                    isDark
                                        ? 55
                                        : 80
                                }
                                tint={
                                    isDark
                                        ? 'dark'
                                        : 'light'
                                }
                                style={
                                    styles.notifPill
                                }
                            >
                                <View
                                    style={[
                                        StyleSheet.absoluteFillObject,
                                        {
                                            backgroundColor:
                                                isDark
                                                    ? 'rgba(30,38,31,0.35)'
                                                    : 'rgba(255,255,255,0.65)',
                                        },
                                    ]}
                                />

                                <LinearGradient
                                    colors={
                                        isDark
                                            ? [
                                                'rgba(255,255,255,0.22)',
                                                'rgba(255,255,255,0.04)',
                                                'rgba(255,255,255,0)',
                                            ]
                                            : [
                                                'rgba(255,255,255,0.95)',
                                                'rgba(255,255,255,0.25)',
                                                'rgba(255,255,255,0.05)',
                                            ]
                                    }
                                    start={{
                                        x: 0.15,
                                        y: 0,
                                    }}
                                    end={{
                                        x: 0.85,
                                        y: 1,
                                    }}
                                    style={
                                        StyleSheet.absoluteFillObject
                                    }
                                />

                                <View
                                    style={[
                                        styles.notifSpecular,
                                        {
                                            backgroundColor:
                                                isDark
                                                    ? 'rgba(255,255,255,0.5)'
                                                    : 'rgba(255,255,255,0.9)',
                                        },
                                    ]}
                                />

                                <View
                                    style={[
                                        styles.notifGlassBorder,
                                        {
                                            borderColor:
                                                isDark
                                                    ? 'rgba(255,255,255,0.22)'
                                                    : 'rgba(255,255,255,0.85)',
                                        },
                                    ]}
                                />

                                <MaterialCommunityIcons
                                    name={
                                        pendingCount > 0
                                            ? 'bell-badge-outline'
                                            : 'bell-outline'
                                    }
                                    size={22}
                                    color={
                                        pendingCount > 0
                                            ? COLORS.orange
                                            : isDark
                                                ? '#A7C957'
                                                : COLORS.green
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
                    )}
                </View>
            </View>

            {/* ============================================ */}
            {/* CONTENIDO */}
            {/* ============================================ */}

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop:
                            scrollTopPadding,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* ======================================== */}
                {/* DESCRIPCIÓN */}
                {/* ======================================== */}

                <Text
                    style={[
                        styles.welcomeSubtitle,
                        {
                            color:
                                textSecondary,
                        },
                    ]}
                >
                    Gestiona tus datos agrícolas
                    {'\n'}
                    de forma fácil y segura.
                </Text>

                {/* ======================================== */}
                {/* SINCRONIZAR + CATÁLOGO */}
                {/* ======================================== */}

                <View
                    style={
                        styles.quickActionsRow
                    }
                >
                    {/* ==================================== */}
                    {/* SINCRONIZAR */}
                    {/* ==================================== */}

                    {!esInvitado && (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                setIsSyncModalVisible(
                                    true
                                );
                                sincronizar();
                            }}
                            style={[
                                styles.quickActionCard,
                                styles.syncQuickCard,
                            ]}
                        >
                            <View
                                style={
                                    styles.quickActionIconCircle
                                }
                            >
                                <MaterialCommunityIcons
                                    name="sync"
                                    size={23}
                                    color={
                                        COLORS.darkGreen
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.quickActionTitleRow
                                }
                            >
                                <Text
                                    style={
                                        styles.quickActionTitle
                                    }
                                >
                                    Sincronizar
                                </Text>

                                <View
                                    style={
                                        styles.quickActionArrow
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="arrow-right"
                                        size={19}
                                        color={
                                            COLORS.white
                                        }
                                    />
                                </View>
                            </View>

                            <Text
                                style={
                                    styles.quickActionSubtitle
                                }
                            >
                                {isSyncing
                                    ? 'Sincronizando...'
                                    : pendingCount > 0
                                        ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`
                                        : 'Todo está al día'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* ==================================== */}
                    {/* CATÁLOGO */}
                    {/* ==================================== */}

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() =>
                            router.push(
                                CATALOG_ROUTE
                            )
                        }
                        style={
                            styles.quickActionCard
                        }
                    >
                        <View
                            style={
                                styles.quickActionIconCircle
                            }
                        >
                            <MaterialCommunityIcons
                                name="sprout-outline"
                                size={25}
                                color={
                                    COLORS.darkGreen
                                }
                            />
                        </View>

                        <View
                            style={
                                styles.quickActionTitleRow
                            }
                        >
                            <Text
                                style={
                                    styles.quickActionTitle
                                }
                            >
                                Catálogo
                            </Text>

                            <View
                                style={
                                    styles.quickActionArrow
                                }
                            >
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={19}
                                    color={
                                        COLORS.white
                                    }
                                />
                            </View>
                        </View>

                        <Text
                            style={
                                styles.quickActionSubtitle
                            }
                        >
                            Explora insumos y recursos disponibles.
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ======================================== */}
                {/* CALCULADORA */}
                {/* ======================================== */}

                <View
                    style={
                        styles.featureCardWrapper
                    }
                >
                    <View
                        style={
                            styles.featureCard
                        }
                    >
                        <View
                            style={
                                styles.featureIconBox
                            }
                        >
                            <MaterialCommunityIcons
                                name="calculator-variant-outline"
                                size={22}
                                color={
                                    COLORS.darkGreen
                                }
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                setIsInfoModalVisible(
                                    true
                                )
                            }
                            style={
                                styles.infoBadge
                            }
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="information-outline"
                                size={18}
                                color={
                                    COLORS.darkGreen
                                }
                            />
                        </TouchableOpacity>

                        <View
                            style={
                                styles.featureLabelRow
                            }
                        >
                            <Text
                                style={
                                    styles.featureTitle
                                }
                            >
                                Calculadora
                            </Text>

                            <Text
                                style={
                                    styles.featureSubtitle
                                }
                            >
                                Nutrientes y dosis
                            </Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                router.push(
                                    CALC_ROUTE
                                )
                            }
                            style={
                                styles.featureArrowBtn
                            }
                            hitSlop={{
                                top: 8,
                                bottom: 8,
                                left: 8,
                                right: 8,
                            }}
                        >
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color={
                                    COLORS.white
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ======================================== */}
                {/* ESTADO */}
                {/* ======================================== */}

                <View
                    style={[
                        styles.stateCard,
                        {
                            backgroundColor:
                                isDark
                                    ? cardBg
                                    : COLORS.state,
                        },
                    ]}
                >
                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        <View
                            style={
                                styles.stateLabelRow
                            }
                        >
                            <View
                                style={
                                    styles.stateDot
                                }
                            />

                            <Text
                                style={
                                    styles.stateLabel
                                }
                            >
                                ESTADO
                            </Text>
                        </View>

                        {/* TÍTULO + FLECHA */}
                        <View
                            style={
                                styles.stateTitleRow
                            }
                        >
                            <Text
                                style={[
                                    styles.stateTitle,
                                    {
                                        color:
                                            textPrimary,
                                    },
                                ]}
                                numberOfLines={2}
                            >
                                {pendingCount > 0
                                    ? `${pendingCount} cambio${pendingCount > 1 ? 's' : ''} sin sincronizar`
                                    : `Todo al día con ${totalLotes} lote${totalLotes === 1 ? '' : 's'} activo${totalLotes === 1 ? '' : 's'}`
                                }
                            </Text>

                            <View
                                style={
                                    styles.stateArrow
                                }
                            >
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={19}
                                    color={
                                        COLORS.white
                                    }
                                />
                            </View>
                        </View>

                        <Text
                            style={
                                styles.stateCaption
                            }
                        >
                            {pendingCount > 0
                                ? 'Toca sincronizar para actualizar'
                                : 'Última revisión hace 2h'}
                        </Text>
                    </View>

                    <View
                        style={
                            styles.stateImageCircle
                        }
                    >
                        <MaterialCommunityIcons
                            name="sprout-outline"
                            size={30}
                            color={
                                COLORS.green
                            }
                        />
                    </View>
                </View>
            </Animated.ScrollView>

            {/* ============================================ */}
            {/* MODAL INFORMACIÓN CALCULADORA */}
            {/* ============================================ */}

            <Modal
                visible={
                    isInfoModalVisible
                }
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setIsInfoModalVisible(
                        false
                    )
                }
            >
                <View
                    style={
                        styles.infoModalOverlay
                    }
                >
                    <View
                        style={[
                            styles.infoModalCard,
                            {
                                backgroundColor:
                                    cardBg,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.infoModalIconWrap
                            }
                        >
                            <MaterialCommunityIcons
                                name="help-circle-outline"
                                size={28}
                                color={
                                    COLORS.forestGreen
                                }
                            />
                        </View>

                        <Text
                            style={[
                                styles.infoModalTitle,
                                {
                                    color:
                                        textPrimary,
                                },
                            ]}
                        >
                            ¿Qué es la calculadora?
                        </Text>

                        <Text
                            style={[
                                styles.infoModalText,
                                {
                                    color:
                                        textSecondary,
                                },
                            ]}
                        >
                            Es la herramienta que estima la dosis de
                            fertilizantes y nutrientes que necesita tu
                            cultivo según el tipo de lote y las
                            condiciones registradas, para ayudarte a
                            aplicar la cantidad justa y evitar
                            desperdicio.
                        </Text>

                        <TouchableOpacity
                            style={
                                styles.infoModalBtn
                            }
                            activeOpacity={0.88}
                            onPress={() =>
                                setIsInfoModalVisible(
                                    false
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.infoModalBtnText
                                }
                            >
                                Entendido
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ============================================ */}
            {/* MODAL SINCRONIZACIÓN */}
            {/* ============================================ */}

            <Modal
                visible={
                    isSyncModalVisible
                }
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setIsSyncModalVisible(
                        false
                    )
                }
            >
                <View
                    style={
                        styles.modalOverlay
                    }
                >
                    <View
                        style={
                            styles.earthContainer
                        }
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
                                        fill="#A9D266"
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
                                        fill="#6FAF32"
                                    />
                                </Svg>
                            </Animated.View>
                        </View>

                        <Text
                            style={
                                styles.earthText
                            }
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
                                                    ? COLORS.error
                                                    : COLORS.green,
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

            {/* ============================================ */}
            {/* NOTIFICACIONES */}
            {/* ============================================ */}

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
                onSincronizar={
                    sincronizar
                }
                pendingCounts={
                    pendingCounts
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({

    // ============================================
    // GENERAL
    // ============================================

    container: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },

    // ============================================
    // HEADER
    // ============================================

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
        shadowOffset: {
            width: 0,
            height: 8,
        },
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
        transform: [
            {
                rotate: '-18deg',
            },
        ],
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
        backgroundColor:
            COLORS.orange,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },

    notifBadgeText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },

    welcomeSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        marginBottom: 18,
    },

    // ============================================
    // SINCRONIZAR + CATÁLOGO
    // ============================================

    quickActionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },

    quickActionCard: {
        flex: 1,
        minHeight: 125,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor:
            COLORS.quickCard,
        borderWidth: 1,
        borderColor:
            'rgba(23, 77, 46, 0.12)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },

    syncQuickCard: {
        backgroundColor:
            COLORS.quickCard,
    },

    quickActionIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor:
            COLORS.quickIcon,
        alignItems: 'center',
        justifyContent: 'center',
    },

    quickActionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingRight: 0,
    },

    quickActionTitle: {
        color:
            COLORS.darkGreen,
        fontSize: 17,
        fontWeight: '800',
        flex: 1,
    },

    quickActionSubtitle: {
        color:
            COLORS.secondaryGreen,
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        marginTop: 3,
        paddingRight: 2,
    },

    quickActionArrow: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor:
            COLORS.quickArrow,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    // ============================================
    // CALCULADORA
    // ============================================

    featureCardWrapper: {
        position: 'relative',
        marginBottom: 14,
    },

    featureCard: {
        borderRadius: 26,
        padding: 18,
        backgroundColor:
            COLORS.calculator,
        overflow: 'hidden',
    },

    featureIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor:
            COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    featureLabelRow: {
        marginTop: 22,
        marginBottom: 2,
    },

    featureTitle: {
        color:
            COLORS.darkGreen,
        fontSize: 20,
        fontWeight: '800',
    },

    featureSubtitle: {
        color:
            COLORS.secondaryGreen,
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
        backgroundColor:
            COLORS.calculatorArrow,
        alignItems: 'center',
        justifyContent: 'center',
    },

    infoBadge: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor:
            'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },

    // ============================================
    // ESTADO
    // ============================================

    stateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingVertical: 18,
        paddingHorizontal: 18,
        marginBottom: 14,

        // SE MANTIENE EL COLOR ORIGINAL
        backgroundColor:
            COLORS.state,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
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
        backgroundColor:
            COLORS.green,
    },

    stateLabel: {
        fontSize: 11,
        fontWeight: '700',
        color:
            COLORS.green,
        letterSpacing: 0.5,
    },

    // NUEVO: TÍTULO + FLECHA
    stateTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },

    stateTitle: {
        fontSize: 16,
        fontWeight: '800',
        lineHeight: 21,
        marginBottom: 4,
        flex: 1,
    },

    // NUEVO: FLECHA JUNTO AL TÍTULO
    stateArrow: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor:
            COLORS.quickArrow,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginBottom: 4,
    },

    stateCaption: {
        fontSize: 12,
        fontWeight: '500',
        color:
            COLORS.secondaryGreen,
    },

    stateImageCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor:
            COLORS.stateIcon,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },

    // ============================================
    // MODAL INFORMACIÓN
    // ============================================

    infoModalOverlay: {
        flex: 1,
        backgroundColor:
            'rgba(0,0,0,0.55)',
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
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },

    infoModalIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor:
            'rgba(111,175,50,0.14)',
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
        backgroundColor:
            COLORS.forestGreen,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 14,
    },

    infoModalBtnText: {
        color:
            COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },

    // ============================================
    // MODAL SINCRONIZACIÓN
    // ============================================

    modalOverlay: {
        flex: 1,
        backgroundColor:
            'rgba(0, 0, 0, 0.75)',
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
        backgroundColor:
            COLORS.forestGreen,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 60,
        borderWidth: 2,
        borderColor:
            COLORS.white,
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
        color:
            COLORS.white,
        marginTop: 16,
        fontSize: 18,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Gill Sans'
                : 'sans-serif',
        fontWeight: '600',
    },

    closeSyncBtn: {
        marginTop: 24,
        backgroundColor:
            COLORS.forestGreen,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },

    closeSyncBtnText: {
        color:
            COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
});