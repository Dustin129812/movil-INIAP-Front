import React from 'react';
import { ScrollView, StyleSheet, Text, View, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../services/ThemeContext';
import { useHomeDashboard } from '../hooks/useHomeDashboard';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeDashboard() {
    const router = useRouter();
    const { isDark } = useTheme();
    const {
        usuario,
        weatherExpanded,
        toggleWeatherDetails,
        totalLotes,
        syncPercentage,
        pendingCount,
    } = useHomeDashboard();

    const weatherHeight = useSharedValue(0);
    const weatherRotate = useSharedValue(0);

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

    const bg = isDark ? '#121212' : '#F2F2F7';
    const cardBg = isDark ? '#1E1E24' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#98989F' : '#8E8E93';
    const dividerColor = isDark ? '#3A3A3C' : '#D1D1D6';
    const badgeBg = isDark ? '#2C2C2E' : '#E5E5EA';
    const dividerLine = isDark ? '#3A3A3C' : '#F2F2F7';

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={[styles.header, { backgroundColor: bg }]}>
                <View style={styles.headerTopRow}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, { color: textPrimary }]}>INIAP</Text>
                        <View style={[styles.headerDividerVertical, { backgroundColor: dividerColor }]} />
                        <Text style={[styles.headerSubtitle, { color: textSecondary }]}>Panel Principal</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity style={[styles.counterBadge, { backgroundColor: badgeBg }]} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="bell-badge-outline" size={16} color="#34C759" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.heroCard}>
                    <View style={styles.heroTopRow}>
                        <View>
                            <Text style={styles.heroGreeting}>Bienvenido de nuevo,</Text>
                            <Text style={styles.heroName} numberOfLines={1}>{usuario?.NOMBRE || 'Técnico Agrícola'}</Text>
                        </View>
                        <View style={styles.heroAvatarWrap}>
                            <MaterialCommunityIcons name="leaf" size={22} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.heroStatsGrid}>
                        <View style={styles.heroStatItem}>
                            <Text style={[styles.heroStatValue, { color: '#FFFFFF' }]}>{totalLotes}</Text>
                            <Text style={styles.heroStatLabel}>Lotes Activos</Text>
                        </View>
                        <View style={styles.heroStatDivider} />
                        <View style={styles.heroStatItem}>
                            <Text style={[styles.heroStatValue, { color: '#FFFFFF' }]}>{syncPercentage}%</Text>
                            <Text style={styles.heroStatLabel}>Sincronizados</Text>
                        </View>
                        <View style={styles.heroStatDivider} />
                        <View style={styles.heroStatItem}>
                            <Text style={[styles.heroStatValue, { color: pendingCount > 0 ? '#FF9500' : '#34C759' }]}>
                                {pendingCount > 0 ? '!' : 'OK'}
                            </Text>
                            <Text style={styles.heroStatLabel}>Estado Cloud</Text>
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
                    <View style={styles.quickAccessGrid}>
                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: cardBg }]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/(superior)/catalogos-ensayos')}
                        >
                            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                                <MaterialCommunityIcons name="flask-outline" size={18} color="#2563eb" />
                            </View>
                            <Text style={[styles.quickCardTitle, { color: textPrimary }]}>Ensayos</Text>
                            <Text style={[styles.quickCardSubtitle, { color: textSecondary }]}>Proyectos experimentales</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: cardBg }]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/(superior)/ejecucion-campo')}
                        >
                            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                                <MaterialCommunityIcons name="clipboard-check-outline" size={18} color="#a855f7" />
                            </View>
                            <Text style={[styles.quickCardTitle, { color: textPrimary }]}>Evaluaciones</Text>
                            <Text style={[styles.quickCardSubtitle, { color: textSecondary }]}>Campo y biométricas</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.quickAccessGrid, { marginTop: 12 }]}>
                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: cardBg }]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/lotes')}
                        >
                            <View style={styles.metricIconWrap}>
                                <MaterialCommunityIcons name="vector-polygon" size={18} color="#34C759" />
                            </View>
                            <Text style={[styles.quickCardTitle, { color: textPrimary }]}>Lotes</Text>
                            <Text style={[styles.quickCardSubtitle, { color: textSecondary }]}>Vértices y áreas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickCard, { backgroundColor: cardBg }]}
                            activeOpacity={0.8}
                            onPress={() => router.push('/menu')}
                        >
                            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                                <MaterialCommunityIcons name="qrcode-scan" size={18} color="#FF9500" />
                            </View>
                            <Text style={[styles.quickCardTitle, { color: textPrimary }]}>QR Scanner</Text>
                            <Text style={[styles.quickCardSubtitle, { color: textSecondary }]}>Libro de campo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: textSecondary }]}>Herramienta Destacada</Text>
                    <View style={[styles.card, { backgroundColor: cardBg }]}>
                        <View style={styles.tipContainer}>
                            <View style={styles.metricIconWrap}>
                                <MaterialCommunityIcons name="cloud-sync" size={18} color="#34C759" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.tipTitle, { color: textPrimary }]}>Sincronización Offline</Text>
                                <Text style={[styles.tipText, { color: textSecondary }]}>
                                    Tus registros de campo se guardan de forma segura localmente hasta restablecer la conexión de red.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 120,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F2F2F7',
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000000',
        letterSpacing: -0.3,
    },
    headerDividerVertical: {
        width: 1,
        height: 14,
        backgroundColor: '#D1D1D6',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500'
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    heroStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    heroStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    heroStatLabel: {
        fontSize: 10,
        color: '#8E8E93',
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    heroStatDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFFFFF',
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
        color: '#000000',
    },
    statusTextSecondary: {
        fontSize: 11,
        color: '#8E8E93',
        marginTop: 1,
    },
    metricIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
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
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    subMetricVal: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3A3A3C',
    },
    prefDivider: {
        height: 1,
        backgroundColor: '#F2F2F7',
    },
    quickAccessGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    quickCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginTop: 10,
        marginBottom: 2,
    },
    quickCardSubtitle: {
        fontSize: 11,
        color: '#8E8E93',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 2,
    },
    tipText: {
        fontSize: 12,
        color: '#8E8E93',
        lineHeight: 16,
    },
});