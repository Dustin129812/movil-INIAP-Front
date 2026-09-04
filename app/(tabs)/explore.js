// ============================================
// EXPLORE - Pantalla de Ajustes
// ============================================
// Navegacion: Tab "Ajustes" - configuracion de usuario y app
// Estructura: Perfil + Apariencia + Navegacion + Logout

import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
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
import { BlurView } from 'expo-blur';
import { DynamicIslandNotification } from '../../components/ui';
import { useAuth } from '../../services/auth';
import { useDeviceInfo } from '../../services/device';
import { useTheme } from '../../services/theme';
import { useRouter } from 'expo-router';

// --- ESTILOS ---
// Origen: app/styles/exploreStyles.js
import { exploreStyles as styles } from '../../src/styles/exploreStyles';

// --- CONSTANTES DE ANIMACION (Header hide/reveal) ---
// Origen: extraido de explore.js para modularidad
const HEADER_ANIMATION = {
  TOP_REVEAL_THRESHOLD: 12,
  HIDE_DURATION: 160,
  REVEAL_DURATION: 260,
  HEADER_ROW_HEIGHT: 42,
  HEADER_ROW_MARGIN_TOP: 2,
  HEADER_BOTTOM_GAP: 12,
};

// Cápsula glass con logo INIAP + título de sección
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
            source={require('../../assets/images/INIAP.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.brandPillTitle, titleStyle, { color: textColor }]}>Ajustes</Text>
      </BlurView>
    </View>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SettingsScreen() {
  // --- HOOKS ---
  const { usuario, cerrarSesion, esInvitado } = useAuth();
  const { deviceInfo } = useDeviceInfo();
  const { nombreDispositivo } = deviceInfo;
  const { theme, isDark, setTheme, setSystemTheme, isSystemTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- ESTADO LOCAL ---
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [notificacion, setNotificacion] = useState({ tipo: 'despedida', mensaje: '' });

  // ============================================
  // ANIMACION DEL HEADER (Apple-style hide/reveal)
  // El titulo "Ajustes" se oculta al scrollear y reaparece solo arriba
  // ============================================
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
        titleOpacity.value = withTiming(1, {
          duration: HEADER_ANIMATION.REVEAL_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        titleTranslateY.value = withTiming(0, {
          duration: HEADER_ANIMATION.REVEAL_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        titleOpacity.value = withTiming(0, {
          duration: HEADER_ANIMATION.HIDE_DURATION,
          easing: Easing.in(Easing.cubic),
        });
        titleTranslateY.value = withTiming(-6, {
          duration: HEADER_ANIMATION.HIDE_DURATION,
          easing: Easing.in(Easing.cubic),
        });
      }
    },
    [HEADER_ANIMATION.TOP_REVEAL_THRESHOLD]
  );

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  // Padding para el contenido scrolleable (reserva espacio del header fijo)
  const scrollTopPadding =
    insets.top +
    HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP +
    HEADER_ANIMATION.HEADER_ROW_HEIGHT +
    HEADER_ANIMATION.HEADER_BOTTOM_GAP;

  // ============================================
  // HANDLERS
  // ============================================

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

  // ============================================
  // HELPERS
  // ============================================

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Scrim de legibilidad para el status bar: fijo */}
      <LinearGradient
        pointerEvents="none"
        colors={
          isDark
            ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']
            : ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']
        }
        style={[styles.statusBarScrim, { height: insets.top + 40 }]}
      />

      {/* Header: se oculta al scrollear y reaparece solo arriba */}
      <View style={[styles.header, { paddingTop: insets.top + HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP }]}>
        <Animated.View style={[styles.headerTopRow, titleAnimatedStyle]}>
          <BrandBadge isDark={isDark} textColor={isDark ? '#FFFFFF' : '#000000'} />
        </Animated.View>
      </View>

      {/* Contenido scrolleable */}
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

        {/* ============================================ */}
        {/* PERFIL - ESTILO "APPLE ACCOUNT" */}
        {/* Avatar grande centrado, sin tarjeta */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* SECCION: APARIENCIA */}
        {/* Selector de tema: Daylight / Midnight / Sistema */}
        {/* ============================================ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Apariencia</Text>
          <View style={styles.appearanceRow}>

            {/* Daylight - Tema Claro */}
            <TouchableOpacity
              style={[
                styles.themeCard,
                isDark && styles.cardDark,
                !isSystemTheme && theme === 'light' && styles.themeCardActive,
              ]}
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
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>
                    Daylight
                  </Text>
                  <Text style={styles.themeSubtitle} numberOfLines={1}>Claro</Text>
                </View>
                <View style={[styles.radioOuter, theme === 'light' && styles.radioOuterActive]}>
                  {theme === 'light' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Midnight - Tema Oscuro */}
            <TouchableOpacity
              style={[
                styles.themeCard,
                isDark && styles.cardDark,
                !isSystemTheme && theme === 'dark' && styles.themeCardActiveDark,
              ]}
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
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>
                    Midnight
                  </Text>
                  <Text style={styles.themeSubtitle} numberOfLines={1}>Oscuro</Text>
                </View>
                <View style={[
                  styles.radioOuter,
                  isDark && styles.radioOuterDark,
                  theme === 'dark' && styles.radioOuterActiveDark,
                ]}>
                  {theme === 'dark' && <View style={[styles.radioInner, { backgroundColor: '#34C759' }]} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Sistema - Auto */}
            <TouchableOpacity
              style={[
                styles.themeCard,
                isDark && styles.cardDark,
                isSystemTheme && (isDark ? styles.themeCardActiveDark : styles.themeCardActive),
              ]}
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
                  <Text style={[styles.themeTitle, isDark && styles.textWhite]} numberOfLines={1}>
                    Sistema
                  </Text>
                  <Text style={styles.themeSubtitle} numberOfLines={1}>Automático</Text>
                </View>
                <View style={[
                  styles.radioOuter,
                  isDark && styles.radioOuterDark,
                  isSystemTheme && (isDark ? styles.radioOuterActiveDark : styles.radioOuterActive),
                ]}>
                  {isSystemTheme && <View style={[styles.radioInner, isDark && { backgroundColor: '#34C759' }]} />}
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* ============================================ */}
        {/* SECCION: COLABORADORES DE PROYECTOS */}
        {/* Solo visible para usuarios no invitados */}
        {/* ============================================ */}
        {!esInvitado && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Colaboradores de Proyectos
            </Text>
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

        {/* ============================================ */}
        {/* SECCION: INFORMACION DEL DISPOSITIVO */}
        {/* ============================================ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Información del Dispositivo
          </Text>
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
                  <Text style={[styles.rowLabel, isDark && styles.textWhite]}>
                    {nombreDispositivo || 'Este dispositivo'}
                  </Text>
                  <Text style={styles.navRowSub} numberOfLines={1}>
                    UUID, modelo y sistema
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================ */}
        {/* BOTON CERRAR SESION */}
        {/* ============================================ */}
        <TouchableOpacity
          style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
          onPress={handleCerrarSesion}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#FF3B30" style={{ marginRight: 6 }} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={[styles.version, isDark && styles.versionDark]}>
          INIAP v1.0.0 • Gestión Agrícola
        </Text>
      </Animated.ScrollView>

      {/* Notificacion de despedida */}
      <DynamicIslandNotification
        tipo={notificacion.tipo}
        mensaje={notificacion.mensaje}
        visible={mostrarNotificacion}
      />
    </View>
  );
}
