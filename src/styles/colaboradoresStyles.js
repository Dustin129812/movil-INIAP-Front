// ============================================
// ESTILOS DE COLABORADORES
// ============================================
// Origen: app/configuracion/colaboradores.js
// Documentacion: Estilos para la pantalla de gestion de colaboradores
//
// PALETA ALINEADA CON HOME
// ============================================

import { StyleSheet } from 'react-native';

export const colaboradoresStyles = StyleSheet.create({

  // ============================================
  // PALETA DE COLORES
  // ============================================

  cream: '#FCF8F0',

  darkGreen: '#0B3D24',

  forestGreen: '#174D2E',

  green: '#6FAF32',

  brightGreen: '#78B832',

  quickCard: '#C9E28D',

  quickIcon: '#A9D266',

  secondaryGreen: '#477442',

  mintGreen: '#75CFA3',

  white: '#FFFFFF',

  // ============================================
  // CONTENEDORES PRINCIPALES
  // ============================================

  container: {
    flex: 1,

    backgroundColor: '#FCF8F0',
  },

  containerDark: {
    flex: 1,

    // Verde oscuro profundo.
    // Evita que el modo oscuro se vea gris.
    backgroundColor: '#0B1711',
  },

  textWhite: {
    color: '#FFFFFF',
  },

  // ============================================
  // HEADER
  // ============================================

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

    borderRadius: 18,
  },

  headerTitle: {
    fontSize: 17,

    fontWeight: '700',

    color: '#0B3D24',
  },

  // ============================================
  // SCROLL CONTENT
  // ============================================

  scrollContent: {
    paddingHorizontal: 16,

    paddingTop: 8,

    paddingBottom: 100,
  },

  // ============================================
  // HERO
  // ============================================

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

    backgroundColor: '#6FAF32',

    justifyContent: 'center',

    alignItems: 'center',

    // En modo claro combina con el fondo crema.
    // En modo oscuro el componente puede sobrescribirlo
    // si utiliza un estilo específico.
    borderWidth: 2,

    borderColor: '#FCF8F0',
  },

  heroTitle: {
    fontSize: 20,

    fontWeight: '800',

    color: '#0B3D24',

    textAlign: 'center',

    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 14,

    color: '#477442',

    textAlign: 'center',

    lineHeight: 19,
  },

  // ============================================
  // SECCIONES
  // ============================================

  groupTitle: {
    fontSize: 13,

    fontWeight: '700',

    color: '#477442',

    marginBottom: 8,

    marginLeft: 4,

    textTransform: 'uppercase',

    letterSpacing: 0.5,
  },

  groupTitleDark: {
    color: '#A9D266',
  },

  // ============================================
  // CARDS — MODO CLARO
  // ============================================

  card: {
    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    paddingHorizontal: 16,

    shadowColor: '#0B3D24',

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity: 0.06,

    shadowRadius: 10,

    elevation: 2,
  },

  // ============================================
  // CARDS — MODO OSCURO
  // ============================================

  cardDark: {
    // Verde oscuro, no gris.
    backgroundColor: '#1B2B21',

    borderWidth: 1,

    borderColor: 'rgba(169,210,102,0.20)',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,

      height: 4,
    },

    shadowOpacity: 0.20,

    shadowRadius: 10,

    elevation: 3,
  },

  // ============================================
  // FILAS DE LISTA
  // ============================================

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

  // ============================================
  // ICONOS — MODO CLARO
  // ============================================

  rowIconWrap: {
    width: 34,

    height: 34,

    borderRadius: 10,

    // Verde claro del Home
    backgroundColor: 'rgba(169,210,102,0.28)',

    justifyContent: 'center',

    alignItems: 'center',
  },

  // ============================================
  // ICONOS — MODO OSCURO
  // ============================================

  rowIconWrapDark: {
    backgroundColor: 'rgba(111,175,50,0.22)',
  },

  // ============================================
  // NOMBRES
  // ============================================

  rowNombre: {
    fontSize: 14,

    fontWeight: '700',

    color: '#0B3D24',
  },

  // ============================================
  // SUBTEXTOS
  // ============================================

  rowSub: {
    fontSize: 12,

    color: '#477442',

    marginTop: 1,
  },

  // ============================================
  // DIVISORES
  // ============================================

  divider: {
    height: 1,

    backgroundColor: 'rgba(23,77,46,0.10)',
  },

  dividerDark: {
    height: 1,

    backgroundColor: 'rgba(169,210,102,0.14)',
  },

  // ============================================
  // EMPTY STATE
  // ============================================

  empty: {
    alignItems: 'center',

    paddingVertical: 24,

    gap: 8,
  },

  emptyText: {
    fontSize: 13,

    color: '#477442',

    textAlign: 'center',
  },

});