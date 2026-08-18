// ============================================
// ESTILOS DE DISPOSITIVO
// ============================================
// Origen: app/configuracion/dispositivo.js
// Documentacion: Estilos para la pantalla de informacion del dispositivo

import { StyleSheet, Platform } from 'react-native';

export const dispositivoStyles = StyleSheet.create({
  // --- CONTENEDORES PRINCIPALES ---
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  containerDark: { backgroundColor: '#121212' },
  textWhite: { color: '#FFFFFF' },

  // --- HEADER ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },

  // --- SCROLL CONTENT ---
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // --- HERO ---
  hero: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
    marginBottom: 14,
  },
  avatarRingDark: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },

  // --- SECCIONES ---
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupTitleDark: { color: '#98989F' },

  // --- CARDS ---
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
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

  // --- FILAS DE INFO ---
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  rowDark: { borderBottomColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  rowValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  rowValue: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },

  // --- FOOTNOTE ---
  footnote: {
    fontSize: 12,
    color: '#8E8E93',
    paddingHorizontal: 4,
    lineHeight: 17,
  },
  footnoteDark: { color: '#6E6E73' },
});
