// ============================================
// ESTILOS DE EXPLORE (Ajustes)
// ============================================
// Origen: app/(tabs)/explore.js
// Documentacion: Estilos para la pantalla de configuracion/Ajustes

import { StyleSheet, Platform } from 'react-native';

// --- COLORES (extraidos para referencia) ---
// Los colores se definen en app/styles/colors.js y se acceden via useTheme()
// Aqui solo se usan valores hardcodeados que corresponden al tema

export const exploreStyles = StyleSheet.create({
  // --- CONTENEDORES PRINCIPALES ---
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  containerDark: { backgroundColor: '#121212' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  textWhite: { color: '#FFFFFF' },

  // --- SCROLL HEADER (Apple-style hide/reveal) ---
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
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#000000', letterSpacing: -0.2 },

  // --- PERFIL APPLE ACCOUNT ---
  appleProfileSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 32,
  },
  appleAvatarWrap: { marginBottom: 18 },
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
  appleAvatarInitialsDark: { color: '#C7C7CC' },
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

  // --- SECCIONES ---
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleDark: { color: '#98989F' },

  // --- APARIENCIA (Theme Cards) ---
  appearanceRow: { flexDirection: 'row', gap: 8 },
  themeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  themeCardActive: { borderColor: '#34C759' },
  themeCardActiveDark: { borderColor: '#34C759', backgroundColor: '#1E1E24' },
  themePreviewLight: {
    height: 50,
    borderRadius: 10,
    marginBottom: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  themePreviewDark: {
    height: 50,
    borderRadius: 10,
    marginBottom: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  themePreviewSystem: {
    height: 50,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  systemHalfLight: { flex: 1, backgroundColor: '#F2F2F7', padding: 6 },
  systemHalfDark: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    padding: 6,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  previewLineSystemLight: { width: '80%', height: 4, borderRadius: 2, backgroundColor: '#D1D1D6' },
  previewDotSystemDark: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },
  previewLine: { width: '40%', height: 5, borderRadius: 3, backgroundColor: '#D1D1D6' },
  previewDotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewDot: { width: 6, height: 6, borderRadius: 3 },
  themeDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeTextContainer: { flex: 1, paddingRight: 4 },
  themeTitle: { fontSize: 12, fontWeight: '600', color: '#000000' },
  themeSubtitle: { fontSize: 10, color: '#8E8E93', marginTop: 1 },
  radioOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterDark: { borderColor: '#48484A' },
  radioOuterActive: { borderColor: '#34C759' },
  radioOuterActiveDark: { borderColor: '#34C759' },
  radioInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' },

  // --- CARDS GENÉRICAS ---
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dividerDark: { backgroundColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },

  // --- FILAS DE NAVEGACION ---
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  rowDark: { borderBottomColor: '#2C2C2E' },
  rowLabel: { fontSize: 14, color: '#000000', fontWeight: '500' },
  navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  navIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconWrapDark: { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
  navRowSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },

  // --- LOGOUT ---
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  logoutButtonDark: {
    backgroundColor: '#1E1E24',
    borderColor: 'rgba(255, 59, 48, 0.25)',
  },
  logoutText: { color: '#FF3B30', fontSize: 15, fontWeight: '600' },

  // --- VERSION ---
  version: { textAlign: 'center', color: '#C7C7CC', fontSize: 12, marginTop: 24 },
  versionDark: { color: '#48484A' },
});
