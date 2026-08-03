import React, { useState, useEffect } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DynamicIslandNotification } from '../../components/ui';
import { useAuth } from '../../services';
import { useDeviceInfo } from '../../services/useDeviceInfo';
import { useTheme } from '../../services/ThemeContext';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SettingsScreen() {
  const { usuario, dispositivoId, cerrarSesion, esInvitado } = useAuth();
  const { deviceInfo } = useDeviceInfo();
  const { nombreDispositivo, modelo, sistemaOperativo, versionSistema, hardware } = deviceInfo;
  const { theme, isDark, setTheme, setSystemTheme, isSystemTheme } = useTheme();
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [notificacion, setNotificacion] = useState({ tipo: 'despedida', mensaje: '' });

  // Estados de preferencias interactivas
  const [pushNotifications, setPushNotifications] = useState(true);
  const [unlockFaceId, setUnlockFaceId] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // Estado para el nombre del sistema biometrico
  const [biometricName, setBiometricName] = useState('Bloqueo Biométrico');

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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, isDark && styles.textWhite]}>Ajustes</Text>
            <View style={[styles.headerDividerVertical, isDark && styles.headerDividerDark]} />
            <Text style={styles.headerSubtitle}>Preferencias y cuenta</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PERFIL REDISEÑADO - MODO INVITADO */}
        <View style={[styles.profileHeroCard, isDark && styles.profileHeroCardDark]}>
          
          {/* Fondo decorativo (marca de agua) */}
          <MaterialCommunityIcons
            name="card-account-details-outline" 
            size={140}
            color={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
            style={styles.profileWatermark}
          />

          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarRing, isDark && styles.avatarRingDark]}>
                <Text style={styles.avatarInitials}>{getInitials(usuario?.NOMBRE)}</Text>
              </View>
              {/* Indicador de estado (Naranja para Invitado) */}
              <View style={[styles.guestStatusDot, isDark && styles.guestStatusDotDark]} />
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.nameAndTagRow}>
                <View style={styles.nameContainer}>
                  <Text style={[styles.heroName, isDark && styles.textWhite]} numberOfLines={1}>
                    {usuario?.NOMBRE || 'Usuario'}
                  </Text>
                  <Text style={[styles.heroRole, isDark && styles.heroRoleDark]} numberOfLines={1}>
                    Técnico Especialista
                  </Text>
                </View>
                {esInvitado && (
                  <View style={styles.guestBadge}>
                    <Text style={styles.guestBadgeText}>INVITADO</Text>
                  </View>
                )}
                {!esInvitado && (
                  <View style={[styles.guestBadge, styles.registeredBadge]}>
                    <Text style={[styles.guestBadgeText, styles.registeredBadgeText]}>REGISTRADO</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.heroEmailRow}>
                <MaterialCommunityIcons name="email-outline" size={14} color="#8E8E93" />
                <Text style={styles.heroEmail} numberOfLines={1}>
                  {usuario?.CORREO || 'usuario@iniap.gob.ec'}
                </Text>
              </View>
            </View>
          </View>
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

        {/* SECCIÓN: INFORMACIÓN DE DISPOSITIVO */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Información del Dispositivo</Text>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={[styles.row, isDark && styles.rowDark]}>
              <Text style={[styles.rowLabel, isDark && styles.textWhite]}>Dispositivo</Text>
              <Text style={styles.rowValue}>{nombreDispositivo || '-'}</Text>
            </View>
            <View style={[styles.row, isDark && styles.rowDark]}>
              <Text style={[styles.rowLabel, isDark && styles.textWhite]}>Modelo</Text>
              <Text style={styles.rowValue}>{modelo || '-'}</Text>
            </View>
            <View style={[styles.row, isDark && styles.rowDark]}>
              <Text style={[styles.rowLabel, isDark && styles.textWhite]}>Sistema</Text>
              <Text style={styles.rowValue}>{sistemaOperativo || '-'} {versionSistema || ''}</Text>
            </View>
            <View style={[styles.row, isDark && styles.rowDark]}>
              <Text style={[styles.rowLabel, isDark && styles.textWhite]}>Hardware</Text>
              <Text style={[styles.rowValue, styles.deviceId]} numberOfLines={1}>
                {hardware || '-'}
              </Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={[styles.rowLabel, isDark && styles.textWhite]}>ID Dispositivo</Text>
              <Text style={[styles.rowValue, styles.deviceId]} numberOfLines={1}>
                {dispositivoId ? dispositivoId : '-'}
              </Text>
            </View>
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
      </ScrollView>

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
  scrollContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 120 },
  textWhite: { color: '#FFFFFF' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    overflow: 'hidden',
  },
  headerDark: { backgroundColor: '#121212' },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#000000', letterSpacing: -0.3 },
  headerDividerVertical: { width: 1, height: 14, backgroundColor: '#D1D1D6' },
  headerDividerDark: { backgroundColor: '#3A3A3C' },
  headerSubtitle: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },

  /* NUEVOS ESTILOS DE PERFIL INVITADO */
  profileHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
  profileWatermark: {
    position: 'absolute',
    right: -25,
    bottom: -30,
    transform: [{ rotate: '-15deg' }],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 18,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  guestStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 0,
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
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameAndTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  heroRole: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginTop: 1,
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
  registeredBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  guestBadgeText: {
    color: '#FF9500',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  registeredBadgeText: {
    color: '#34C759',
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
    flex: 1,
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
  dividerDark: { backgroundColor: '#2C2C2E' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F2F2F7' },
  rowDark: { borderBottomColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 14, color: '#000000', fontWeight: '500' },
  rowValue: { fontSize: 14, color: '#8E8E93', maxWidth: '50%', textAlign: 'right' },
  deviceId: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  logoutButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  logoutButtonDark: { backgroundColor: '#1E1E24', borderColor: 'rgba(255, 59, 48, 0.25)' },
  logoutText: { color: '#FF3B30', fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', color: '#C7C7CC', fontSize: 12, marginTop: 24 },
  versionDark: { color: '#48484A' },
});