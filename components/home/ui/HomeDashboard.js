import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity, StatusBar, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    withSpring,
    withTiming,
    withRepeat,
    withDelay,
    cancelAnimation,
    Easing,
    interpolate,
    Extrapolation,
    useAnimatedReaction,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../services/ThemeContext';
import { useHomeDashboard } from '../hooks/useHomeDashboard';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QUICK_CARDS = [
    {
        id: 0,
        title: 'Ensayos',
        subtitle: 'Proyectos',
        route: '/proyectos/lista',
        icon: 'flask-outline',
        color: '#2563eb',
        bg: 'rgba(37, 99, 235, 0.1)',
        info: 'Gestión de proyectos y catálogos de ensayos agrícolas.'
    },
    {
        id: 1,
        title: 'Evaluaciones',
        subtitle: 'Campo',
        route: '/proyectos/lista',
        icon: 'clipboard-check-outline',
        color: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.1)',
        info: 'Registra y analiza las evaluaciones de campo.'
    },
    {
        id: 2,
        title: 'Lotes',
        subtitle: 'Dashboard',
        route: '/(tabs)/lotes',
        icon: 'vector-polygon',
        color: '#34C759',
        bg: 'rgba(52, 199, 89, 0.1)',
        info: 'Administración de geometría y delimitación de lotes.'
    },
    {
        id: 3,
        title: 'Calculadora',
        subtitle: 'Fertilizantes',
        route: '/(tabs)/calculadora',
        icon: 'calculator',
        color: '#FF9500',
        bg: 'rgba(255, 149, 0, 0.1)',
        info: 'Calculadora de fertilizantes y nutrientes para tus cultivos.'
    },

    {
        id: 4,
        title: 'Catálogos',
        subtitle: 'Agrícolas',
        route: '/catalogos',
        icon: 'sprout-outline',
        color: '#8B5CF6',
        bg: 'rgba(139, 92, 246, 0.1)',
        info: 'Consulta cultivos, enfermedades, plagas y recomendaciones relacionadas.'
    }
];

const AUTO_ROTATE_DURATION = 20000;
const SELECT_ANIM_DURATION = 280;
const SELECT_ANIM_EASING = Easing.out(Easing.cubic);
const getShortestTarget = (current, targetLogical) => {
    const currentMod = current % 360;
    let delta = (targetLogical - currentMod) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return current + delta;
};

function QuickAccessCard({ item, index, carouselRotation, isExpanded, anyExpanded, cardBg, textPrimary, textSecondary, onPress, router }) {
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
        if (isExpanded) {
            contentOpacity.value = withDelay(SELECT_ANIM_DURATION - 60, withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }));
        } else {
            contentOpacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.ease) });
        }
    }, [isExpanded, contentOpacity]);

    const cardAnimatedStyle = useAnimatedStyle(() => {
        const angleDeg = carouselRotation.value + index * 90;
        const angleRad = (angleDeg * Math.PI) / 180;
        const radius = 120;

        const tx = Math.sin(angleRad) * radius;
        const cos = Math.cos(angleRad);

        const scale = interpolate(cos, [-1, 1], [0.75, 1], 'clamp');
        const opacity = interpolate(cos, [-1, 1], [0.35, 1], 'clamp');
        const zIndex = isExpanded ? 50 : Math.round(cos * 10);
        const sizeConfig = { duration: SELECT_ANIM_DURATION, easing: SELECT_ANIM_EASING };

        return {
            transform: [
                { translateX: tx },
                { scale: isExpanded ? withTiming(1.12, sizeConfig) : scale }
            ],
            opacity: isExpanded ? 1 : opacity,
            zIndex,
            elevation: isExpanded ? 50 : 1,
            height: withTiming(isExpanded ? 175 : 120, sizeConfig),
            width: withTiming(isExpanded ? 160 : 130, sizeConfig),
        };
    });

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: interpolate(contentOpacity.value, [0, 1], [8, 0]) }]
    }));

    const subtitleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: isExpanded ? 0 : 1,
    }));

    const combinedStyle = [
        styles.quickCarouselCard,
        { backgroundColor: cardBg },
        cardAnimatedStyle
    ];

    if (isExpanded) {
        return (
            <Animated.View style={combinedStyle}>
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="close" size={16} color={textSecondary} />
                </TouchableOpacity>

                <View style={[styles.metricIconWrap, { backgroundColor: item.bg, marginBottom: 4 }]}>
                    <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={[styles.quickCardTitle, { color: textPrimary, marginTop: 2 }]}>{item.title}</Text>

                <Animated.View style={[styles.expandedContentBox, contentAnimatedStyle]}>
                    <Text style={[styles.quickCardInfo, { color: textSecondary }]} numberOfLines={2}>{item.info}</Text>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: item.color }]}
                        onPress={() => router.push(item.route)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionBtnText}>Ingresar</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        );
    }

    return (
        <AnimatedTouchable
            style={combinedStyle}
            activeOpacity={0.9}
            onPress={onPress}
            pointerEvents={anyExpanded ? 'none' : 'auto'}
        >
            <View style={[styles.metricIconWrap, { backgroundColor: item.bg, marginBottom: 4 }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.quickCardTitle, { color: textPrimary, marginTop: 2 }]}>{item.title}</Text>
            <Animated.Text style={[styles.quickCardSubtitle, { color: textSecondary }, subtitleAnimatedStyle]}>
                {item.subtitle}
            </Animated.Text>
        </AnimatedTouchable>
    );
}

export default function HomeDashboard() {
    const router = useRouter();
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const {
        usuario,
        weatherExpanded,
        toggleWeatherDetails,
        totalLotes,
        isSyncing,
        syncMessage,
        sincronizar,
        limpiarSyncMessage,
    } = useHomeDashboard();

    const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);

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

    const weatherHeight = useSharedValue(0);
    const weatherRotate = useSharedValue(0);

    const carouselRotation = useSharedValue(0);
    const rotationOffset = useSharedValue(0);
    const [activeAccessIndex, setActiveAccessIndex] = useState(null);
    const startAutoRotation = useCallback((fromDeg = 0) => {
        'worklet';
        const base = fromDeg % 360;
        carouselRotation.value = base;
        carouselRotation.value = withRepeat(
            withTiming(base + 360, { duration: AUTO_ROTATE_DURATION, easing: Easing.linear }),
            -1,
            false
        );
    }, [carouselRotation]);

    useEffect(() => {
        startAutoRotation(0);
    }, [startAutoRotation]);

    const gesture = Gesture.Pan()
        .enabled(activeAccessIndex === null)
        .onStart(() => {
            cancelAnimation(carouselRotation);
        })
        .onUpdate((event) => {
            carouselRotation.value = rotationOffset.value + (event.translationX / 2);
        })
        .onEnd(() => {
            rotationOffset.value = carouselRotation.value;
            startAutoRotation(carouselRotation.value);
        });

    const handleSelectCard = (index) => {
        setActiveAccessIndex(index);
        cancelAnimation(carouselRotation);

        const targetRotLocal = -index * 90;
        const shortestTarget = getShortestTarget(carouselRotation.value, targetRotLocal);
        rotationOffset.value = shortestTarget;
        carouselRotation.value = withTiming(shortestTarget, {
            duration: SELECT_ANIM_DURATION,
            easing: SELECT_ANIM_EASING,
        });
    };

    const handleCloseExpanded = () => {
        setActiveAccessIndex(null);
        startAutoRotation(carouselRotation.value);
    };

    const handleToggleWeather = () => {
        const nextState = !weatherExpanded;
        toggleWeatherDetails();
        weatherHeight.value = withSpring(nextState ? 1 : 0, { damping: 14, stiffness: 120 });
        weatherRotate.value = withSpring(nextState ? 180 : 0, { damping: 14, stiffness: 120 });
    };

    const animatedWeatherStyle = useAnimatedStyle(() => ({
        maxHeight: interpolate(weatherHeight.value, [0, 1], [0, 90]),
        opacity: weatherHeight.value,
        transform: [{ translateY: interpolate(weatherHeight.value, [0, 1], [-10, 0]) }]
    }));

    const animatedChevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${weatherRotate.value}deg` }]
    }));

    const bg = isDark ? '#000000' : '#F2F2F7';
    const statusBarBg = isDark ? '#000000' : '#F2F2F7';
    const cardBg = isDark ? '#1E1E24' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#98989F' : '#8E8E93';
    const dividerLine = isDark ? '#3A3A3C' : '#F2F2F7';

    return (
        <View
            style={[styles.container, { backgroundColor: bg }]}
        >
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

                    <AnimatedTouchable style={[styles.notifTouchable, notifAnimatedStyle]} activeOpacity={0.75}>
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
                                name="bell-badge-outline"
                                size={22}
                                color={isDark ? '#30D158' : '#34C759'}
                            />
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
                </View>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>Herramienta Destacada</Text>
                    
                    <View style={[styles.card, { backgroundColor: cardBg, paddingVertical: 28, alignItems: 'center' }]}>
                        <TouchableOpacity
                            style={styles.uiverseBtn}
                            activeOpacity={0.9}
                            onPress={() => { setIsSyncModalVisible(true); sincronizar(); }}
                        >
                            <View style={styles.uiverseWrapper}>
                                <Text style={styles.uiverseText}>Sincronizar</Text>

                                <View style={[styles.flower, styles.flower1]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower2]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower3]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower4]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower5]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower6]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower7]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower8]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower9]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                                <View style={[styles.flower, styles.flower10]}>
                                    <View style={[styles.petal, styles.one]} /><View style={[styles.petal, styles.two]} />
                                    <View style={[styles.petal, styles.three]} /><View style={[styles.petal, styles.four]} />
                                </View>
                            </View>
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

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>Condiciones Ambientales</Text>
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: cardBg }]}
                        activeOpacity={0.9}
                        onPress={handleToggleWeather}
                    >
                        <View style={styles.weatherMainRow}>
                            <View style={styles.statusLeft}>
                                <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
                                    <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color="#007AFF" />
                                </View>
                                <View>
                                    <Text style={[styles.statusTextPrimary, { color: textPrimary }]}>Estación Pichincha - INIAP</Text>
                                    <Text style={[styles.statusTextSecondary, { color: textSecondary }]}>Humedad óptima • 22°C</Text>
                                </View>
                            </View>
                            <Animated.View style={animatedChevronStyle}>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={textSecondary} />
                            </Animated.View>
                        </View>

                        <Animated.View style={[styles.weatherExpandableContent, animatedWeatherStyle]}>
                            <View style={[styles.prefDivider, { backgroundColor: dividerLine }]} />
                            <View style={styles.weatherSubMetrics}>
                                <View style={styles.subMetricBox}>
                                    <Text style={[styles.subMetricLabel, { color: textSecondary }]}>Precipitación</Text>
                                    <Text style={[styles.subMetricVal, { color: textPrimary }]}>1.2 mm</Text>
                                </View>
                                <View style={styles.subMetricBox}>
                                    <Text style={[styles.subMetricLabel, { color: textSecondary }]}>Viento</Text>
                                    <Text style={[styles.subMetricVal, { color: textPrimary }]}>8 km/h</Text>
                                </View>
                                <View style={styles.subMetricBox}>
                                    <Text style={[styles.subMetricLabel, { color: textSecondary }]}>Radiación UV</Text>
                                    <Text style={[styles.subMetricVal, { color: '#FF9500' }]}>Moderada</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>Acceso Rápido</Text>

                    <GestureDetector gesture={gesture}>
                        <View style={styles.carouselContainer}>
                            {QUICK_CARDS.map((item, index) => {
                                const isExpanded = activeAccessIndex === index;
                                return (
                                    <QuickAccessCard
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        carouselRotation={carouselRotation}
                                        isExpanded={isExpanded}
                                        anyExpanded={activeAccessIndex !== null}
                                        cardBg={cardBg}
                                        textPrimary={textPrimary}
                                        textSecondary={textSecondary}
                                        onPress={() => {
                                            if (isExpanded) {
                                                handleCloseExpanded();
                                            } else {
                                                handleSelectCard(index);
                                            }
                                        }}
                                        router={router}
                                    />
                                );
                            })}
                        </View>
                    </GestureDetector>
                </View>

            </Animated.ScrollView>

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

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 40,
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
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.3,
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
    weatherMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statusTextPrimary: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusTextSecondary: {
        fontSize: 11,
        marginTop: 1,
    },
    metricIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weatherExpandableContent: {
        overflow: 'hidden',
    },
    weatherSubMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    subMetricBox: {
        alignItems: 'center',
    },
    subMetricLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    subMetricVal: {
        fontSize: 13,
        fontWeight: '600',
    },
    prefDivider: {
        height: 1,
    },
    carouselContainer: {
        height: 210,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    quickCarouselCard: {
        position: 'absolute',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 5,
    },
    quickCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    quickCardSubtitle: {
        fontSize: 11,
        marginTop: 2,
    },
    expandedContentBox: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
        marginTop: 4,
        width: '100%',
    },
    quickCardInfo: {
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 13,
        paddingHorizontal: 2,
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 2,
    },
    actionBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    closeBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uiverseBtn: {
        height: 76,
        width: 220,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    uiverseWrapper: {
        height: 36,
        width: 140,
        position: 'relative',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uiverseText: {
        fontSize: 17,
        zIndex: 2,
        color: '#000',
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
        fontWeight: '700',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.85)',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 4,
    },
    flower: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 32,
        height: 32,
        position: 'absolute',
        zIndex: 1,
    },
    flower1: {
        top: -16,
        left: -22,
        transform: [{ rotate: '5deg' }],
    },
    flower2: {
        bottom: -10,
        left: -6,
        transform: [{ rotate: '35deg' }],
    },
    flower3: {
        bottom: -18,
        left: 36,
        transform: [{ rotate: '0deg' }],
    },
    flower4: {
        top: -18,
        left: 22,
        transform: [{ rotate: '15deg' }],
    },
    flower5: {
        right: -8,
        top: -14,
        transform: [{ rotate: '25deg' }],
    },
    flower6: {
        right: -24,
        bottom: -12,
        transform: [{ rotate: '30deg' }],
    },
    flower7: {
        top: -16,
        left: 70,
        transform: [{ rotate: '45deg' }],
    },
    flower8: {
        bottom: -16,
        right: 32,
        transform: [{ rotate: '12deg' }],
    },
    flower9: {
        left: -26,
        top: 4,
        transform: [{ rotate: '60deg' }],
    },
    flower10: {
        right: -28,
        top: 2,
        transform: [{ rotate: '75deg' }],
    },
    petal: {
        height: 16,
        width: 16,
        borderTopLeftRadius: '40%',
        borderTopRightRadius: '70%',
        borderBottomRightRadius: '7%',
        borderBottomLeftRadius: '90%',
        backgroundColor: 'violet',
        borderWidth: 0.5,
        borderColor: 'purple',
        zIndex: 0,
        margin: 0,
    },
    one: {},
    two: {
        transform: [{ rotate: '90deg' }],
    },
    three: {
        transform: [{ rotate: '270deg' }],
    },
    four: {
        transform: [{ rotate: '180deg' }],
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