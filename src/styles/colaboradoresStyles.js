// ============================================
// ESTILOS DE COLABORADORES
// ============================================
// Origen: app/configuracion/colaboradores.js
// Documentacion: Estilos para la pantalla de gestion de colaboradores

import { StyleSheet } from 'react-native';

export const colaboradoresStyles = StyleSheet.create({
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

  // --- HERO (Patron Apple "Invite Family") ---
  hero: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  iconStack: {
    position: 'relative',
    marginBottom: 16,
  },
  plusBadge: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 19,
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

  // --- FILAS DE LISTA ---
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIconWrapDark: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
  },
  rowNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  rowSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  divider: { height: 1, backgroundColor: '#F2F2F7' },
  dividerDark: { backgroundColor: '#2C2C2E' },

  // --- CARD DISABLED ---
  cardDisabled: {
    opacity: 0.6,
  },

  // --- ROW DISABLED ---
  rowDisabled: {
    opacity: 0.7,
  },
  rowNombreDisabled: {
    color: '#8E8E93',
  },

  // --- PENDING BADGE ---
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pendingBadgeText: {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: '500',
  },

  // --- LEGEND (estado info) ---
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
  },
  legendTextDark: {
    color: '#FFB340',
  },
  legendSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  legendSubtextDark: {
    color: '#98989F',
  },

  // --- EMPTY STATE ---
  empty: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
