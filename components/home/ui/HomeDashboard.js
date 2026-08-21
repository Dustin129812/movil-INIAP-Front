import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '../../../services/theme';
import NotificationsCenter from '../../notifications/ui/NotificationsCenter';
import { useHomeDashboard } from '../hooks/useHomeDashboard';

const { width, height } = Dimensions.get('window');

// Paleta actualizada: Fondo claro basado en el tono secundario (#F9A825) adaptado para interfaz suave
const THEMES = {
    light: {
        fondo: '#FEF9ED',                  // Fondo crema/dorado muy suave derivado de #F9A825
        tarjetas: '#FFFFFF',               // Tarjetas blancas limpias
        verdeAccionPrincipal: '#0F4C3A',   // Verde oscuro elegante para el botón de sincronizar
        verdeMedio: '#2E7D54',
        verdeClaroDetalle: '#6BA368',
        verdeSuaveBoton: '#A6D785',
        fondoTarjetaEstado: '#FDF3D8',     // Tono dorado muy suave para acentos
        fondoTarjetaCalc: '#FDF8EC',
        fondoTarjetaCat: '#FEF5E2',
        textoPrincipal: '#1F2A24',
        textoSecundario: '#6B7280',
        bordeSuave: '#F3E5C8',             // Borde sutil acorde a la paleta dorada
        dorado: '#F9A825',                 // Color exacto proporcionado en la paleta
        doradoSecundario: '#C67C00',
        azulInstitucional: '#1B3A6B',
        blurTint: 'light',
        modalOverlay: 'rgba(0,0,0,0.72)',
        circuloColor: '#1976D2',
    },
    dark: {
        fondo: '#121212',          // Fondo negro elegante
        tarjetas: '#1E1E1E',       // Tarjetas oscuras
        verdeAccionPrincipal: '#2E7D54',
        verdeMedio: '#6BA368',
        verdeClaroDetalle: '#A6D785',
        verdeSuaveBoton: '#0F4C3A',
        fondoTarjetaEstado: '#2A2A2A',
        fondoTarjetaCalc: '#252525',
        fondoTarjetaCat: '#222222',
        textoPrincipal: '#FFFFFF',
        textoSecundario: '#9CA3AF',
        bordeSuave: '#2C2C2C',
        dorado: '#F9A825',
        doradoSecundario: '#C67C00',
        azulInstitucional: '#1B3A6B',
        blurTint: 'dark',
        modalOverlay: 'rgba(0,0,0,0.85)',
        circuloColor: '#115AA3',
    }
};

export default function HomeDashboard() {
    const router = useRouter();
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    
    const COLORS = isDark ? THEMES.dark : THEMES.light;

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

    const [isSyncModalVisible, setIsSyncModalVisible] = useState(false);
    const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

    /* =====================================================
       ANIMACIONES DEL MODAL DE SINCRONIZACIÓN
    ===================================================== */
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
        return {
            left: interpolate(progress, [0, 0.3, 0.31, 0.35, 0.45, 1], [-32, -96, -96, 112, 112, -32]),
            opacity: interpolate(progress, [0, 0.3, 0.31, 0.35, 0.45, 1], [1, 1, 0, 0, 1, 1]),
        };
    });

    const svgStyle2 = useAnimatedStyle(() => {
        const progress = anim2.value;
        return {
            left: interpolate(progress, [0, 0.75, 0.76, 0.77, 0.8, 1], [80, -112, -112, 128, 128, 80]),
            opacity: interpolate(progress, [0, 0.75, 0.76, 0.77, 0.8, 1], [1, 1, 0, 0, 1, 1]),
        };
    });

    /* =====================================================
       ANIMACIÓN DE SCROLL
    ===================================================== */
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => { scrollY.value = event.contentOffset.y; },
    });

    const subGreetingStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, 60], [1, 0], Extrapolation.CLAMP),
            transform: [{ translateY: interpolate(scrollY.value, [0, 60], [0, -10], Extrapolation.CLAMP) }]
        };
    });

    const displayName = usuario?.NOMBRE || 'Invitado';

    const showCalculatorInfo = () => {
        Alert.alert(
            '¿Qué es la calculadora?',
            'Es la herramienta que estima la dosis de fertilizantes y nutrientes que necesita tu cultivo según el tipo de lote y las condiciones registradas.',
            [{ text: 'Entendido', style: 'default' }]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: COLORS.fondo }]}>
            <StatusBar 
                barStyle={isDark ? "light-content" : "dark-content"} 
                translucent 
                backgroundColor="transparent" 
            />

            {/* FIGURAS GEOMÉTRICAS DE FONDO SUTILES */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg height="100%" width="100%">
                    <Circle cx={width * 0.9} cy={height * 0.12} r={140} fill={COLORS.circuloColor} opacity={isDark ? 0.15 : 0.12} />
                    <Circle cx={0} cy={height * 0.28} r={100} fill={COLORS.circuloColor} opacity={isDark ? 0.1 : 0.08} />
                </Svg>
            </View>

            {/* CONTENIDO SCROLLABLE */}
            <Animated.ScrollView 
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                style={StyleSheet.absoluteFill}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 90 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* TEXTO DESCRIPTIVO */}
                <Animated.View style={subGreetingStyle}>
                    <Text style={[styles.subGreetingText, { color: COLORS.textoSecundario }]}>
                        Gestiona tus datos agrícolas{'\n'}de forma fácil y segura.
                    </Text>
                </Animated.View>

                {/* TARJETA 1: ESTADO (Con borde izquierdo verde medio) */}
                <View style={[styles.card, { backgroundColor: COLORS.tarjetas, borderColor: COLORS.bordeSuave, borderLeftWidth: 6 ,borderLeftWidth: 0, borderRadius: 0}]}>
                    <View style={styles.stateCardContent}>
                        <View style={styles.stateCardLeft}>
                            <View style={styles.stateStatusRow}>
                                <Text style={[styles.stateStatusText, { color: COLORS.verdeMedio }]}>ESTADO</Text>
                                <View style={[styles.statusDot, { backgroundColor: COLORS.verdeMedio }]} />
                            </View>
                            <Text style={[styles.stateTitle, { color: COLORS.textoPrincipal }]}>
                                Todo al día con {totalLotes} lotes activos
                            </Text>
                           
                        </View>
                        <View style={[styles.stateImagePlaceholder, { backgroundColor: COLORS.fondoTarjetaEstado }]}>
                            <MaterialCommunityIcons name="flower" size={40} color={COLORS.verdeMedio} />
                        </View>
                    </View>
                </View>

                {/* BOTÓN SINCRONIZAR DATOS */}
                <TouchableOpacity
                    style={[styles.syncMainButton, { backgroundColor: COLORS.verdeAccionPrincipal }]}
                    activeOpacity={0.85}
                    onPress={() => {
                        setIsSyncModalVisible(true);
                        sincronizar();
                    }}
                >
                    <View style={styles.syncLeftSection}>
                        <View style={[styles.syncIconBox, { backgroundColor: COLORS.verdeMedio }]}>
                            <MaterialCommunityIcons name="sync" size={22} color={COLORS.dorado} />
                        </View>
                        <View style={styles.syncTextContainer}>
                            <Text style={[styles.syncBtnTitle, { color: '#FFFFFF' }]}>Sincronizar datos</Text>
                            <Text style={[styles.syncBtnSubtitle, { color: '#E8F3EA' }]}>Todo está al día</Text>
                        </View>
                    </View>
                    <View style={[styles.syncBtnArrowBox, { backgroundColor: COLORS.tarjetas }]}>
                        <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.textoPrincipal} />
                    </View>
                </TouchableOpacity>

                {/* TARJETA 2: CALCULADORA (Con borde izquierdo verde claro) */}
                <View style={[styles.toolCard, { backgroundColor: COLORS.tarjetas, borderColor: COLORS.bordeSuave, borderLeftWidth: 6, borderLeftColor: COLORS.verdeClaroDetalle }]}>
                    <View style={styles.toolHeaderRow}>
                        <View style={[styles.toolIconBox, { backgroundColor: COLORS.tarjetas }]}>
                            <MaterialCommunityIcons name="calculator" size={24} color={COLORS.verdeMedio} />
                        </View>
                        <TouchableOpacity onPress={showCalculatorInfo} style={styles.infoBtn}>
                            <MaterialCommunityIcons name="information-outline" size={22} color={COLORS.textoSecundario} />
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.toolBodyRow}
                        activeOpacity={0.7}
                        onPress={() => router.push('/calculadora/calculadora')}
                    >
                        <View style={styles.toolTextContainer}>
                            <Text style={[styles.toolTitle, { color: COLORS.textoPrincipal }]}>Calculadora</Text>
                            <Text style={[styles.toolSubtitle, { color: COLORS.textoSecundario }]}>Nutrientes y dosis</Text>
                        </View>
                        <View style={[styles.actionCircleBtn, { backgroundColor: COLORS.verdeClaroDetalle }]}>
                            <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.modalOverlay} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* TARJETA 3: CATÁLOGOS (Con borde izquierdo dorado exacto #F9A825) */}
                <View style={[styles.toolCard, { backgroundColor: COLORS.tarjetas, borderColor: COLORS.bordeSuave, borderLeftWidth: 6, borderLeftColor: COLORS.dorado }]}>
                    <View style={styles.toolHeaderRow}>
                        <View style={[styles.toolIconBox, { backgroundColor: COLORS.tarjetas }]}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={COLORS.doradoSecundario} />
                        </View>
                        
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.toolBodyRow}
                        activeOpacity={0.7}
                        onPress={() => router.push('/catalogos')}
                    >
                        <View style={styles.toolTextContainer}>
                            <Text style={[styles.toolTitle, { color: COLORS.textoPrincipal }]}>Catálogos</Text>
                            <Text style={[styles.toolSubtitle, { color: COLORS.textoSecundario }]}>Explora nuestras guías y recursos</Text>
                        </View>
                        <View style={[styles.actionCircleBtn, { backgroundColor: COLORS.dorado }]}>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#1F2A24" />
                        </View>
                    </TouchableOpacity>
                </View>
                
            </Animated.ScrollView>

            {/* ENCABEZADO FIJO CON EFECTO BLUR */}
            <BlurView
                intensity={isDark ? 90 : 50}
                tint={COLORS.blurTint}
                style={[styles.stickyHeader, { paddingTop: insets.top + 15, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
            >
                <View style={styles.headerRow}>
                    <View style={styles.greetingContainer}>
                        <View style={[styles.leafIconBox, { backgroundColor: COLORS.fondoTarjetaEstado }]}>
                            <MaterialCommunityIcons name="leaf" size={24} color={COLORS.verdeMedio} />
                        </View>
                        <Text style={[styles.greetingText, { color: COLORS.textoPrincipal }]}>
                            Hola {displayName}
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.notifBtn, { backgroundColor: COLORS.fondoTarjetaEstado }]} 
                        activeOpacity={0.7}
                        onPress={() => setIsNotificationsVisible(true)}
                    >
                        <MaterialCommunityIcons 
                            name={pendingCount > 0 ? "bell-badge-outline" : "bell-outline"} 
                            size={24} 
                            color={pendingCount > 0 ? '#E76F51' : COLORS.verdeMedio} 
                        />
                    </TouchableOpacity>
                </View>
            </BlurView>

            {/* MODAL DE SINCRONIZACIÓN */}
            <Modal visible={isSyncModalVisible} transparent animationType="fade" onRequestClose={() => setIsSyncModalVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: COLORS.modalOverlay }]}>
                    <View style={[styles.earthContainer, { backgroundColor: COLORS.tarjetas }]}>
                        <View style={[styles.earthLoader, { backgroundColor: COLORS.azulInstitucional }]}>
                            <Animated.View style={[styles.earthSvgWrapper1, svgStyle1]}>
                                <Svg height="100%" width="100%" viewBox="0 0 200 200"><Path transform="translate(100 100)" d="M29.4,-17.4C33.1,1.8,27.6,16.1,11.5,31.6C-4.7,47,-31.5,63.6,-43,56C-54.5,48.4,-50.7,16.6,-41,-10.9C-31.3,-38.4,-15.6,-61.5,-1.4,-61C12.8,-60.5,25.7,-36.5,29.4,-17.4Z" fill={COLORS.dorado} /></Svg>
                            </Animated.View>
                            <Animated.View style={[styles.earthSvgWrapper2, svgStyle2]}>
                                <Svg height="100%" width="100%" viewBox="0 0 200 200"><Path transform="translate(100 100)" d="M31.7,-55.8C40.3,-50,45.9,-39.9,49.7,-29.8C53.5,-19.8,55.5,-9.9,53.1,-1.4C50.6,7.1,43.6,14.1,41.8,27.6C40.1,41.1,43.4,61.1,37.3,67C31.2,72.9,15.6,64.8,1.5,62.2C-12.5,59.5,-25,62.3,-31.8,56.7C-38.5,51.1,-39.4,37.2,-49.3,26.3C-59.1,15.5,-78,7.7,-77.6,0.2C-77.2,-7.2,-57.4,-14.5,-49.3,-28.4C-41.2,-42.4,-44.7,-63,-38.5,-70.1C-32.2,-77.2,-16.1,-70.8,-2.3,-66.9C11.6,-63,23.1,-61.5,31.7,-55.8Z" fill={COLORS.dorado} /></Svg>
                            </Animated.View>
                        </View>
                        <Text style={[styles.earthText, { color: COLORS.textoPrincipal }]}>
                            {isSyncing ? 'Sincronizando...' : syncMessage ? syncMessage.text : 'Listo'}
                        </Text>
                        {syncMessage && !isSyncing && (
                            <TouchableOpacity style={[styles.closeSyncBtn, { backgroundColor: syncMessage.type === 'error' ? '#E76F51' : COLORS.verdeAccionPrincipal }]} onPress={() => { setIsSyncModalVisible(false); limpiarSyncMessage(); }}>
                                <Text style={styles.closeSyncBtnText}>Cerrar</Text>
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

/* =====================================================
   ESTILOS
===================================================== */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 15,
        zIndex: 10,
        borderBottomWidth: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    greetingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leafIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    greetingText: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subGreetingText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
        marginBottom: 20,
        marginTop: 5,
    },
    syncMainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    syncLeftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    syncTextContainer: {
        justifyContent: 'center',
    },
    syncBtnTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    syncBtnSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    syncBtnArrowBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: 24,
        borderWidth: 1.5,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    stateCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stateCardLeft: {
        flex: 1,
        paddingRight: 10,
    },
    stateStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stateStatusText: {
        fontSize: 12,
        fontWeight: '700',
        marginRight: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    stateTitle: {
        fontSize: 20,
        fontWeight: '800',
        lineHeight: 26,
        marginBottom: 6,
    },
    stateSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    stateImagePlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolCard: {
        borderRadius: 24,
        borderWidth: 1.5,
        padding: 20,
        marginBottom: 16,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    toolHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    toolIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    toolBodyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    toolTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    toolTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    toolSubtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    actionCircleBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    earthContainer: {
        width: 245,
        minHeight: 245,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    earthLoader: {
        width: 120,
        height: 120,
        overflow: 'hidden',
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earthSvgWrapper1: { position: 'absolute', bottom: -32, width: 112, height: 112 },
    earthSvgWrapper2: { position: 'absolute', top: -48, width: 112, height: 112 },
    earthText: {
        marginTop: 16,
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
    },
    closeSyncBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    closeSyncBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});