// ============================================
// ESTILOS DEL TAB BAR - Liquid Glass
// ============================================
// Origen: app/(tabs)/_layout.js - CleanLiquidGlassTabBar
// Dependencias: TAB_BAR_DIMENSIONS, TAB_BAR_COLORS de tabBarTheme.js

import { StyleSheet, Platform } from 'react-native';
import { TAB_BAR_DIMENSIONS as DIMS, TAB_BAR_COLORS } from '../../services/theme/tabBarTheme';

export const tabBarStyles = StyleSheet.create({
  // --- CONTENEDOR PRINCIPAL ---
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  tabBarWrapper: {
    position: 'absolute',
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- PILL PRINCIPAL (glass container) ---
  mainPillContainer: {
    height: DIMS.PILL_HEIGHT,
    borderRadius: DIMS.PILL_RADIUS,
    shadowColor: DIMS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  glassContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: DIMS.PILL_RADIUS,
    padding: DIMS.CONTAINER_PADDING,
    borderWidth: 0.5,
    overflow: 'hidden',
  },

  // --- BUBBLE INDICATOR ---
  activeBlobShadowWrapper: {
    position: 'absolute',
    top: DIMS.CONTAINER_PADDING,
    bottom: DIMS.CONTAINER_PADDING,
    left: DIMS.CONTAINER_PADDING,
    width: DIMS.TAB_WIDTH,
    borderRadius: DIMS.BUBBLE_RADIUS,
  },
  activeBlobShadowLight: {
    shadowColor: DIMS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  activeBlobBubble: {
    flex: 1,
    borderRadius: DIMS.BUBBLE_RADIUS,
    overflow: 'hidden',
  },
  activeBlobBlur: {
    flex: 1,
    borderRadius: DIMS.BUBBLE_RADIUS,
  },

  // --- TAB ITEMS ---
  tabItem: {
    width: DIMS.TAB_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0,
  },

  // --- FAB (Floating Action Button) ---
  fabContainer: {
    position: 'absolute',
    bottom: 76,
    alignSelf: 'center',
    width: DIMS.FAB_SIZE,
    height: DIMS.FAB_SIZE,
    shadowColor: DIMS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 10,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: DIMS.FAB_SIZE / 2,
  },
  fabGlass: {
    flex: 1,
    borderRadius: DIMS.FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  fabIcon: {
    fontSize: DIMS.FAB_ICON_SIZE,
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // --- CATALOG BUTTON (Nuevo - Icono de libro) ---
  catalogBtnWrapper: {
    height: DIMS.SEARCH_BTN_SIZE || 44,
    borderRadius: (DIMS.SEARCH_BTN_SIZE || 44) / 2,
    shadowColor: DIMS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  catalogGlass: {
    width: '100%',
    height: '100%',
    borderRadius: (DIMS.SEARCH_BTN_SIZE || 44) / 2,
    borderWidth: 0.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  catalogBtnIconWrapper: {
    width: DIMS.SEARCH_BTN_SIZE || 44,
    height: DIMS.SEARCH_BTN_SIZE || 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },

  // --- SEARCH BUTTON (Unificado) ---
  searchBtnWrapper: {
    height: DIMS.SEARCH_BTN_SIZE,
    borderRadius: DIMS.SEARCH_BTN_SIZE / 2,
    shadowColor: DIMS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  searchGlass: {
    width: '100%',
    height: '100%',
    borderRadius: DIMS.SEARCH_BTN_SIZE / 2,
    borderWidth: 0.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInnerRow: {
    width: '100%',
    height: DIMS.SEARCH_BTN_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  textInputStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 0,
  },
  closeIconBtn: {
    padding: 6,
  },
  searchBtnIconWrapper: {
    width: DIMS.SEARCH_BTN_SIZE,
    height: DIMS.SEARCH_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- FULL WIDTH SEARCH (Integrado con la barra) ---
  fullWidthSearchContainer: {
    position: 'absolute',
    alignSelf: 'center',
    left: DIMS.SIDE_MARGIN,
    right: DIMS.SIDE_MARGIN,
    zIndex: 1000,
    shadowColor: DIMS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  fullWidthSearchGlass: {
    borderRadius: DIMS.FULL_WIDTH_SEARCH_RADIUS,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  fullWidthSearchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: DIMS.FULL_WIDTH_SEARCH_HEIGHT,
    paddingHorizontal: 12,
  },
  searchIconWrapper: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  fullWidthSearchInput: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 0,
  },
});