import React, { useState, useEffect } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useAnimatedReaction,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DynamicIslandNotification } from '../../components/ui';
import { useAuth } from '../../services';
import { useDeviceInfo } from '../../services/useDeviceInfo';
import { useTheme } from '../../services/ThemeContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { usuario, cerrarSesion, esInvitado } = useAuth();
  const { deviceInfo } = useDeviceInfo();
  const { nombreDispositivo } = deviceInfo;
  const { theme, isDark, setTheme, setSystemTheme, isSystemTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [notificacion, setNotificacion] = useState({ tipo: 'despedida', mensaje: '' });

  // Estados de preferencias interactivas
  const [pushNotifications, setPushNotifications] = useState(true);
  const [unlockFaceId, setUnlockFaceId] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // Estado para el nombre del sistema biometrico
  const [biometricName, setBiometricName] = useState('Bloqueo Biométrico');

  // --- Header estilo Apple (mismo patrón que Home y Lotes) ---
  // "Ajustes" se oculta por completo apenas se empieza a scrollear y solo
  // reaparece cuando el scroll vuelve arriba del todo. No es un fade
  // continuo atado 1:1 al scroll, es una animación por ESTADO.
  const TOP_REVEAL_THRESHOLD = 12;
  const HIDE_DURATION = 160;
  const REVEAL_DURATION = 260;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const titleOpacity = useSharedValue(1);
  const titleTranslateY = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value <= TOP_REVEAL_THRESHOLD,
    (isAtTop, wasAtTop) => {
      if (isAtTop === wasAtTop) return;

      if (isAtTop) {
        titleOpacity.value = withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
        titleTranslateY.value = withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
      } else {
        titleOpacity.value = withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
        titleTranslateY.value = withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
      }
    },
    [TOP_REVEAL_THRESHOLD]
  );

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  // Alto real del header, para reservar el espacio justo arriba del
  // contenido SIN dejar un hueco fijo: este padding vive DENTRO del
  // contentContainerStyle del ScrollView, así que se scrollea junto con el
  // contenido en vez de quedar pegado como un tope permanente.
  const HEADER_ROW_HEIGHT = 42;
  const HEADER_ROW_MARGIN_TOP = 2;
  const HEADER_BOTTOM_GAP = 12;
  const scrollTopPadding = insets.top + HEADER_ROW_MARGIN_TOP + HEADER_ROW_HEIGHT + HEADER_BOTTOM_GAP;


  // Detectar el hardware biometrico disponible al cargar la pantalla
  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (hasHardware) {
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricName('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricName('Huella Dactilar');
        }
      }
    })();
  }, []);

  const handleBiometricToggle = async (newValue) => {
    if (newValue) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('No soportado', 'Tu dispositivo no cuenta con hardware biométrico.');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('No configurado', `No tienes ${biometricName} configurado en tu dispositivo.`);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Autentícate para activar ${biometricName}`,
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setUnlockFaceId(true);
      } else {
        setUnlockFaceId(false);
      }
    } else {
      setUnlockFaceId(false);
    }
  };

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
      const confirmado = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
      if (confirmado) {
        ejecutarCierreSesion();
      }
    } else {
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: ejecutarCierreSesion,
          },
        ]
      );
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Scrim de legibilidad para el status bar: fijo, no se desvanece. */}
      <LinearGradient
        pointerEvents="none"
        colors={
          isDark
            ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']
            : ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']
        }
        style={[styles.statusBarScrim, { height: insets.top + 40 }]}
      />

      {/* Header: se oculta al scrollear y reaparece solo arriba del todo */}
      <View style={[styles.header, { paddingTop: insets.top + HEADER_ROW_MARGIN_TOP }]}>
        <Animated.View style={[styles.headerTopRow, titleAnimatedStyle]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, isDark && styles.textWhite]}>Ajustes</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingTop: scrollTopPadding }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
      >

        {/* PERFIL - ESTILO "APPLE ACCOUNT" (sin tarjeta, avatar grande centrado) */}
        <View style={styles.appleProfileSection}>
          <View style={styles.appleAvatarWrap}>
            {usuario?.FOTO_URL ? (
              <Image source={{ uri: usuario.FOTO_URL }} style={styles.appleAvatarImage} />
            ) : (
              <LinearGradient
                colors={isDark ? ['#3A3A46', '#1C1C22'] : ['#E8E8ED', '#D1D1D8']}
                style={styles.appleAvatarImage}
              >
                <Text style={[styles.appleAvatarInitials, isDark && styles.appleAvatarInitialsDark]}>
                  {getInitials(usuario?.NOMBRE)}
                </Text>
              </LinearGradient>
            )}
          </View>

          <Text style={[styles.appleName, isDark && styles.textWhite]} numberOfLines={1}>
            {usuario?.NOMBRE || 'Usuario'}
          </Text>

          <Text style={styles.appleEmail} numberOfLines={1}>
            {usuario?.CORREO || 'usuario@iniap.gob.ec'}
          </Text>

          {esInvitado && (
            <View style={styles.appleGuestBadge}>
              <Text style={styles.appleGuestBadgeText}>INVITADO</Text>
            </View>
          )}
        </View>

        {/* SECCIÓN: APARIENCIA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Apariencia</Text>
          <View style={styles.appearanceRow}>

            <TouchableOpacity
              style={[styles.themeCard, isDark && styles.cardDark, !isSystemTheme && theme === 'light' && styles.themeCardActive]}
              onPress={() => { setTheme('light'); setSystemTheme(false); }}
              activeOpacity={0.8}
            >
              <View style={[styles.themePreviewLight, { backgroundColor: '#F2F2F7' }]}>
                <View style={styles.previewLine} />
                <View style={styles.previewDotRow}>
                  <View style={[styles.previewDot, { backgroundColor: '#34C759' }]} />
                  <View style={[styles.previewDot, { backgroundColor: '#E5E5EA' }]} />
                </View>
              </View>
              <View style={styles.themeDetails}>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>Daylight</Text>
                  <Text style={styles.themeSubtitle} numberOfLines={1}>Claro</Text>
                </View>
                <View style={[styles.radioOuter, theme === 'light' && styles.radioOuterActive]}>
                  {theme === 'light' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeCard, isDark && styles.cardDark, !isSystemTheme && theme === 'dark' && styles.themeCardActiveDark]}
              onPress={() => { setTheme('dark'); setSystemTheme(false); }}
              activeOpacity={0.8}
            >
              <View style={[styles.themePreviewDark, { backgroundColor: '#2C2C2E' }]}>
                <View style={[styles.previewLine, { backgroundColor: '#3A3A3C' }]} />
                <View style={styles.previewDotRow}>
                  <View style={[styles.previewDot, { backgroundColor: '#34C759' }]} />
                  <View style={[styles.previewDot, { backgroundColor: '#3A3A3C' }]} />
                </View>
              </View>
              <View style={styles.themeDetails}>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>Midnight</Text>
                  <Text style={styles.themeSubtitle} numberOfLines={1}>Oscuro</Text>
                </View>
                <View style={[styles.radioOuter, isDark && styles.radioOuterDark, theme === 'dark' && styles.radioOuterActiveDark]}>
                  {theme === 'dark' && <View style={[styles.radioInner, { backgroundColor: '#34C759' }]} />}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeCard, isDark && styles.cardDark, isSystemTheme && (isDark ? styles.themeCardActiveDark : styles.themeCardActive)]}
              onPress={() => setSystemTheme(true)}
              activeOpacity={0.8}
            >
              <View style={styles.themePreviewSystem}>
                <View style={styles.systemHalfLight}>
                  <View style={styles.previewLineSystemLight} />
                </View>
                <View style={styles.systemHalfDark}>
                  <View style={styles.previewDotSystemDark} />
                </View>
              </View>
              <View style={styles.themeDetails}>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>Sistema</Text>
                  <Text style={styles.themeSubtitle} numberOfLines={1}>Automático</Text>
                </View>
                <View style={[styles.radioOuter, isDark && styles.radioOuterDark, isSystemTheme && (isDark ? styles.radioOuterActiveDark : styles.radioOuterActive)]}>
                  {isSystemTheme && <View style={[styles.radioInner, isDark && { backgroundColor: '#34C759' }]} />}
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* SECCIÓN: PREFERENCIAS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Preferencias</Text>
          <View style={[styles.card, isDark && styles.cardDark]}>

            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <View style={[styles.metricIconWrap, isDark && styles.metricIconWrapDark]}>
                  <MaterialCommunityIcons name="bell-outline" size={16} color="#34C759" />
                </View>
                <Text style={[styles.prefText, isDark && styles.textWhite]}>Notificaciones</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            <View style={[styles.prefDivider, isDark && styles.dividerDark]} />

            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <View style={[styles.metricIconWrap, isDark && styles.metricIconWrapDark]}>
                  <MaterialCommunityIcons
                    name={biometricName === 'Face ID' ? "face-recognition" : "fingerprint"}
                    size={16}
                    color="#34C759"
                  />
                </View>
                <Text style={[styles.prefText, isDark && styles.textWhite]}>{biometricName}</Text>
              </View>
              <Switch
                value={unlockFaceId}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            <View style={[styles.prefDivider, isDark && styles.dividerDark]} />

            <View style={[styles.prefRow, styles.lastRow]}>
              <View style={styles.prefLeft}>
                <View style={[styles.metricIconWrap, isDark && styles.metricIconWrapDark]}>
                  <MaterialCommunityIcons name="vibrate" size={16} color="#34C759" />
                </View>
                <Text style={[styles.prefText, isDark && styles.textWhite]}>Vibración</Text>
              </View>
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

          </View>
        </View>

        {/* SECCIÓN: COLABORADORES DE PROYECTOS (fila única, estilo "Family" de Apple) */}
        {!esInvitado && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Colaboradores de Proyectos</Text>
            <View style={[styles.card, isDark && styles.cardDark]}>
              <TouchableOpacity
                style={[styles.row, styles.lastRow]}
                onPress={() => router.push('/configuracion/colaboradores')}
                activeOpacity={0.7}
              >
                <View style={styles.navRowLeft}>
                  <View style={[styles.navIconWrap, isDark && styles.navIconWrapDark]}>
                    <MaterialCommunityIcons name="account-group" size={16} color="#0A84FF" />
                  </View>
                  <Text style={[styles.rowLabel, isDark && styles.textWhite]}>Colaboradores</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SECCIÓN: INFORMACIÓN DE DISPOSITIVO (fila única, estilo Apple Account) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Información del Dispositivo</Text>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <TouchableOpacity
              style={[styles.row, styles.lastRow]}
              onPress={() => router.push('/configuracion/dispositivo')}
              activeOpacity={0.7}
            >
              <View style={styles.navRowLeft}>
                <View style={[styles.navIconWrap, isDark && styles.navIconWrapDark]}>
                  <MaterialCommunityIcons name="cellphone-cog" size={16} color="#34C759" />
                </View>
                <View>
                  <Text style={[styles.rowLabel, isDark && styles.textWhite]}>{nombreDispositivo || 'Este dispositivo'}</Text>
                  <Text style={styles.navRowSub} numberOfLines={1}>UUID, modelo y sistema</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
          onPress={handleCerrarSesion}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#FF3B30" style={{ marginRight: 6 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={[styles.version, isDark && styles.versionDark]}>INIAP v1.0.0 • Gestión Agrícola</Text>
      </Animated.ScrollView>

      <DynamicIslandNotification
        tipo={notificacion.tipo}
        mensaje={notificacion.mensaje}
        visible={mostrarNotificacion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  containerDark: { backgroundColor: '#121212' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  textWhite: { color: '#FFFFFF' },

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
    height: 42,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 34, fontWeight: '700', color: '#000000', letterSpacing: -0.4 },
  headerDividerVertical: { width: 1, height: 14, backgroundColor: '#D1D1D6' },
  headerDividerDark: { backgroundColor: '#3A3A3C' },
  headerSubtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },

  /* PERFIL ESTILO "APPLE ACCOUNT" */
  appleProfileSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 32,
  },
  appleAvatarWrap: {
    marginBottom: 18,
  },
  appleAvatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  appleAvatarInitials: {
    fontSize: 40,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  appleAvatarInitialsDark: {
    color: '#C7C7CC',
  },
  appleName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  appleEmail: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
    textAlign: 'center',
  },
  appleGuestBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  appleGuestBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9500',
    letterSpacing: 0.3,
  },

  /* NUEVOS ESTILOS DE PERFIL INVITADO (legado, ya no usados por appleProfileSection) */
  profileHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    position: 'relative',
    overflow: 'hidden',
  },
  profileHeroCardDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  profileWatermarkWrap: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileColumn: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  avatarRingDark: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  avatarInitials: {
    color: '#34C759',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  guestStatusDot: {
    position: 'absolute',
    bottom: 4,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF9500',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  guestStatusDotDark: {
    borderColor: '#1C1C1E',
  },
  profileDetailsCentered: {
    alignItems: 'center',
  },
  roleAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  heroName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  heroRole: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  heroRoleDark: {
    color: '#34C759',
  },
  guestBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  guestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9500',
  },
  heroEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroEmail: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },

  /* RESTO DE ESTILOS */
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitleDark: { color: '#98989F' },

  appearanceRow: { flexDirection: 'row', gap: 8 },
  themeCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 10, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  themeCardActive: { borderColor: '#34C759' },
  themeCardActiveDark: { borderColor: '#34C759', backgroundColor: '#1E1E24' },
  themePreviewLight: { height: 50, borderRadius: 10, marginBottom: 8, padding: 8, justifyContent: 'space-between' },
  themePreviewDark: { height: 50, borderRadius: 10, marginBottom: 8, padding: 8, justifyContent: 'space-between' },
  themePreviewSystem: { height: 50, borderRadius: 10, marginBottom: 8, flexDirection: 'row', overflow: 'hidden' },
  systemHalfLight: { flex: 1, backgroundColor: '#F2F2F7', padding: 6 },
  systemHalfDark: { flex: 1, backgroundColor: '#2C2C2E', padding: 6, alignItems: 'flex-end', justifyContent: 'flex-end' },
  previewLineSystemLight: { width: '80%', height: 4, borderRadius: 2, backgroundColor: '#D1D1D6' },
  previewDotSystemDark: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },
  previewLine: { width: '40%', height: 5, borderRadius: 3, backgroundColor: '#D1D1D6' },
  previewDotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewDot: { width: 6, height: 6, borderRadius: 3 },
  themeDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeTextContainer: { flex: 1, paddingRight: 4 },
  themeTitle: { fontSize: 12, fontWeight: '600', color: '#000000' },
  themeSubtitle: { fontSize: 10, color: '#8E8E93', marginTop: 1 },
  radioOuter: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#C7C7CC', justifyContent: 'center', alignItems: 'center' },
  radioOuterDark: { borderColor: '#48484A' },
  radioOuterActive: { borderColor: '#34C759' },
  radioOuterActiveDark: { borderColor: '#34C759' },
  radioInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardDark: { backgroundColor: '#1E1E24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(52, 199, 89, 0.1)', justifyContent: 'center', alignItems: 'center' },
  metricIconWrapDark: { backgroundColor: 'rgba(52, 199, 89, 0.15)' },
  prefText: { fontSize: 14, fontWeight: '500', color: '#000000' },
  prefDivider: { height: 1, backgroundColor: '#F2F2F7' },
  divider: { height: 1, backgroundColor: '#F2F2F7' },
  dividerDark: { backgroundColor: '#2C2C2E' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F2F2F7' },
  rowDark: { borderBottomColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 14, color: '#000000', fontWeight: '500' },
  rowValue: { fontSize: 14, color: '#8E8E93', maxWidth: '50%', textAlign: 'right' },
  deviceId: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  navIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(10, 132, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  navIconWrapDark: { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
  navRowSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },

  logoutButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  logoutButtonDark: { backgroundColor: '#1E1E24', borderColor: 'rgba(255, 59, 48, 0.25)' },
  logoutText: { color: '#FF3B30', fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', color: '#C7C7CC', fontSize: 12, marginTop: 24 },
  versionDark: { color: '#48484A' },
});