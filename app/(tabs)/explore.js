// ============================================
// EXPLORE - Pantalla de Ajustes
// ============================================
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DynamicIslandNotification } from '../../components/ui';
import { useAuth } from '../../services/auth';
import { useDeviceInfo } from '../../services/device';
import { useTheme } from '../../services/theme';

const HEADER_ANIMATION = {
  TOP_REVEAL_THRESHOLD: 12,
  HIDE_DURATION: 160,
  REVEAL_DURATION: 260,
  HEADER_ROW_HEIGHT: 42,
  HEADER_ROW_MARGIN_TOP: 2,
  HEADER_BOTTOM_GAP: 12,
};

export default function SettingsScreen() {
  const { usuario, cerrarSesion, esInvitado } = useAuth();
  const { deviceInfo } = useDeviceInfo();
  const { nombreDispositivo } = deviceInfo;
  const { theme, isDark, setTheme, setSystemTheme, isSystemTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [notificacion, setNotificacion] = useState({ tipo: 'despedida', mensaje: '' });

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const titleOpacity = useSharedValue(1);
  const titleTranslateY = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value <= HEADER_ANIMATION.TOP_REVEAL_THRESHOLD,
    (isAtTop, wasAtTop) => {
      if (isAtTop === wasAtTop) return;
      if (isAtTop) {
        titleOpacity.value = withTiming(1, { duration: HEADER_ANIMATION.REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
        titleTranslateY.value = withTiming(0, { duration: HEADER_ANIMATION.REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
      } else {
        titleOpacity.value = withTiming(0, { duration: HEADER_ANIMATION.HIDE_DURATION, easing: Easing.in(Easing.cubic) });
        titleTranslateY.value = withTiming(-6, { duration: HEADER_ANIMATION.HIDE_DURATION, easing: Easing.in(Easing.cubic) });
      }
    },
    [HEADER_ANIMATION.TOP_REVEAL_THRESHOLD]
  );

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const scrollTopPadding =
    insets.top +
    HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP +
    HEADER_ANIMATION.HEADER_ROW_HEIGHT +
    HEADER_ANIMATION.HEADER_BOTTOM_GAP;

  const ejecutarCierreSesion = () => {
    setNotificacion({ tipo: 'despedida', mensaje: '' });
    setMostrarNotificacion(true);
    setTimeout(() => {
      setMostrarNotificacion(false);
      cerrarSesion();
    }, 2500);
  };

  const handleCerrarSesion = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) ejecutarCierreSesion();
    } else {
      Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: ejecutarCierreSesion },
      ]);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FEF9ED' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Círculos decorativos de fondo */}
      <View style={styles.backgroundDecorContainer} pointerEvents="none">
        <View style={[styles.decorCircle, styles.circleOne, { backgroundColor: '#F9A825', opacity: isDark ? 0.08 : 0.12 }]} />
        <View style={[styles.decorCircle, styles.circleTwo, { backgroundColor: '#F9A825', opacity: isDark ? 0.05 : 0.08 }]} />
      </View>

      {/* Header Fijo */}
      <View style={[styles.header, { paddingTop: insets.top + HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP }]}>
        <Animated.View style={[styles.headerTopRow, titleAnimatedStyle]}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1F2A24' }]}>Ajustes</Text>
        </Animated.View>
      </View>

      {/* Contenido scrolleable */}
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingTop: scrollTopPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* PERFIL */}
        <View style={styles.appleProfileSection}>
          <View style={styles.appleAvatarWrap}>
            {usuario?.FOTO_URL ? (
              <Image source={{ uri: usuario.FOTO_URL }} style={styles.appleAvatarImage} />
            ) : (
              <LinearGradient colors={isDark ? ['#2E7D54', '#0F4C3A'] : ['#FDF3D8', '#FEF5E2']} style={styles.appleAvatarImage}>
                <Text style={[styles.appleAvatarInitials, { color: isDark ? '#A6D785' : '#0F4C3A' }]}>
                  {getInitials(usuario?.NOMBRE)}
                </Text>
              </LinearGradient>
            )}
          </View>
          <Text style={[styles.appleName, { color: isDark ? '#FFFFFF' : '#1F2A24' }]} numberOfLines={1}>
            {usuario?.NOMBRE || 'Invitado'}
          </Text>
          <Text style={[styles.appleEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>
            {usuario?.CORREO || 'usuario@iniap.gob.ec'}
          </Text>
          {esInvitado && (
            <View style={styles.appleGuestBadge}>
              <Text style={styles.appleGuestBadgeText}>INVITADO</Text>
            </View>
          )}
        </View>

        {/* APARIENCIA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>APARIENCIA</Text>
          <View style={styles.appearanceRow}>
            {/* Daylight */}
            <TouchableOpacity
              style={[
                styles.themeCard, 
                isDark && styles.cardDark, 
                !isSystemTheme && theme === 'light' && styles.themeCardActive
              ]}
              onPress={() => { setTheme('light'); setSystemTheme(false); }}
              activeOpacity={0.8}
            >
              <View style={[styles.themePreviewLight, { backgroundColor: '#FFF8EA', borderWidth: 1, borderColor: '#EBD2A3' }]}>
                <View style={styles.previewLine} />
                <View style={styles.previewDotRow}>
                  <View style={[styles.previewDot, { backgroundColor: '#0F4C3A' }]} />
                </View>
              </View>
              <View style={styles.themeDetails}>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>Daylight</Text>
                  <Text style={[styles.themeSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>Claro</Text>
                </View>
                <View style={[styles.radioOuter, theme === 'light' && styles.radioOuterActive]}>
                  {theme === 'light' && <View style={[styles.radioInner, { backgroundColor: '#0F4C3A' }]} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Midnight */}
            <TouchableOpacity
              style={[
                styles.themeCard, 
                isDark && styles.cardDark, 
                !isSystemTheme && theme === 'dark' && styles.themeCardActiveDark
              ]}
              onPress={() => { setTheme('dark'); setSystemTheme(false); }}
              activeOpacity={0.8}
            >
              <View style={[styles.themePreviewDark, { backgroundColor: '#252525' }]}>
                <View style={[styles.previewLine, { backgroundColor: '#3A3A3A' }]} />
                <View style={styles.previewDotRow}>
                  <View style={[styles.previewDot, { backgroundColor: '#2E7D54' }]} />
                </View>
              </View>
              <View style={styles.themeDetails}>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>Midnight</Text>
                  <Text style={[styles.themeSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>Oscuro</Text>
                </View>
                <View style={[styles.radioOuter, theme === 'dark' && styles.radioOuterActiveDark]}>
                  {theme === 'dark' && <View style={[styles.radioInner, { backgroundColor: '#2E7D54' }]} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Sistema */}
            <TouchableOpacity
              style={[styles.themeCard, isDark && styles.cardDark, isSystemTheme && styles.themeCardActive]}
              onPress={() => setSystemTheme(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.themePreviewSystem, { borderWidth: 1, borderColor: '#EBD2A3' }]}>
                <View style={styles.systemHalfLight} />
                <View style={styles.systemHalfDark} />
              </View>
              <View style={styles.themeDetails}>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>Sistema</Text>
                  <Text style={[styles.themeSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>Auto</Text>
                </View>
                <View style={[styles.radioOuter, isSystemTheme && styles.radioOuterActive]}>
                  {isSystemTheme && <View style={[styles.radioInner, { backgroundColor: '#0F4C3A' }]} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* COLABORADORES */}
        {!esInvitado && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>COLABORADORES DE PROYECTOS</Text>
            <View style={[styles.cardHomeStyle, isDark && styles.cardDark]}>
              <TouchableOpacity
                style={styles.rowInnerCustom}
                onPress={() => router.push('/configuracion/colaboradores')}
                activeOpacity={0.7}
              >
                <View style={styles.navRowLeft}>
                  <View style={[styles.navIconWrap, { backgroundColor: isDark ? '#2A2A2A' : '#FDF3D8' }]}>
                    <MaterialCommunityIcons name="account-group" size={20} color={isDark ? '#A6D785' : '#0F4C3A'} />
                  </View>
                  <Text style={[styles.rowLabel, isDark && styles.textWhite]}>Colaboradores</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* DISPOSITIVO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>INFORMACIÓN DEL DISPOSITIVO</Text>
          <View style={[styles.cardHomeStyle, isDark && styles.cardDark]}>
            <TouchableOpacity
              style={styles.rowInnerCustom}
              onPress={() => router.push('/configuracion/dispositivo')}
              activeOpacity={0.7}
            >
              <View style={styles.navRowLeft}>
                <View style={[styles.navIconWrap, { backgroundColor: isDark ? '#2A2A2A' : '#FDF3D8' }]}>
                  <MaterialCommunityIcons name="cellphone-cog" size={20} color={isDark ? '#A6D785' : '#0F4C3A'} />
                </View>
                <View>
                  <Text style={[styles.rowLabel, isDark && styles.textWhite]}>{nombreDispositivo || 'Este dispositivo'}</Text>
                  <Text style={[styles.navRowSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>UUID, modelo y sistema</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDark ? '#2A1A1A' : '#FFF0F0', borderColor: isDark ? '#4A2020' : '#FFD6D6' }]} onPress={handleCerrarSesion} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={18} color="#FF3B30" style={{ marginRight: 6 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={[styles.version, isDark && styles.versionDark]}>INIAP v1.0.0 • Gestión Agrícola</Text>
      </Animated.ScrollView>

      <DynamicIslandNotification tipo={notificacion.tipo} mensaje={notificacion.mensaje} visible={mostrarNotificacion} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundDecorContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleOne: {
    width: 320,
    height: 320,
    top: -60,
    right: -80,
  },
  circleTwo: {
    width: 260,
    height: 260,
    bottom: 80,
    left: -90,
  },
  header: { paddingHorizontal: 20, paddingBottom: 10, zIndex: 2 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', height: 42 },
  headerTitle: { fontSize: 36, fontWeight: '800', letterSpacing: -0.8, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  appleProfileSection: { alignItems: 'center', marginBottom: 24, marginTop: 10, zIndex: 2 },
  appleAvatarWrap: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', marginBottom: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  appleAvatarImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  appleAvatarInitials: { fontSize: 32, fontWeight: '800' },
  appleName: { fontSize: 22, fontWeight: '800', marginBottom: 4, letterSpacing: -0.4 },
  appleEmail: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  appleGuestBadge: { backgroundColor: '#0F4C3A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  appleGuestBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  section: { marginBottom: 20, zIndex: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 8, letterSpacing: 0.8 },
  sectionTitleDark: { color: '#9CA3AF' },
  appearanceRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  themeCard: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 8, 
    borderWidth: 1.5, 
    borderColor: '#EBD2A3', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 6 
  },
  themeCardActive: { borderColor: '#0F4C3A', backgroundColor: '#FFFFFF' },
  themeCardActiveDark: { borderColor: '#2E7D54', backgroundColor: '#1E1E1E' },
  cardDark: { backgroundColor: '#1E1E1E', borderColor: '#2C2C2C' },
  themePreviewLight: { height: 45, borderRadius: 12, marginBottom: 8, padding: 6, justifyContent: 'space-between' },
  themePreviewDark: { height: 45, borderRadius: 12, marginBottom: 8, padding: 6, justifyContent: 'space-between' },
  themePreviewSystem: { height: 45, borderRadius: 12, marginBottom: 8, flexDirection: 'row', overflow: 'hidden' },
  systemHalfLight: { flex: 1, backgroundColor: '#FFF8EA' },
  systemHalfDark: { flex: 1, backgroundColor: '#252525' },
  previewLine: { width: '60%', height: 4, backgroundColor: '#E3C999', borderRadius: 2 },
  previewDotRow: { flexDirection: 'row' },
  previewDot: { width: 6, height: 6, borderRadius: 3 },
  themeDetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeTextContainer: { flex: 1 },
  themeTitle: { fontSize: 13, fontWeight: '700', color: '#1F2A24' },
  themeSubtitle: { fontSize: 11 },
  radioOuter: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#D3B88C', alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: '#0F4C3A' },
  radioOuterActiveDark: { borderColor: '#2E7D54' },
  radioInner: { width: 8, height: 8, borderRadius: 4 },
  cardHomeStyle: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    paddingVertical: 4, 
    paddingHorizontal: 12, 
    borderWidth: 1.5, 
    borderColor: '#EBD2A3', 
    borderLeftWidth: 6, 
    borderLeftColor: '#0F4C3A', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10 
  },
  rowInnerCustom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  navIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '700', color: '#1F2A24' },
  navRowSub: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 18, marginTop: 10, marginBottom: 15, borderWidth: 1, zIndex: 2 },
  logoutText: { color: '#FF3B30', fontSize: 15, fontWeight: '800' },
  version: { textAlign: 'center', fontSize: 12, color: '#6B7280', marginBottom: 20, zIndex: 2, fontWeight: '500' },
  versionDark: { color: '#9CA3AF' },
  textWhite: { color: '#FFF' },
});