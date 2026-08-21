// ============================================
// COLORES GLOBALES UNIFICADOS
// ============================================

import { APP_THEME } from './appTheme';

export const COLORS = {
  // Modo claro
  light: {
    bg: APP_THEME.light.background,
    textPrimary: APP_THEME.light.primary,
    textSecondary: APP_THEME.light.secondary,
    dividerColor: '#D1D1D6',
    badgeBg: '#E5E5EA',
    searchBarBg: 'rgba(255, 255, 255, 0.85)',
    searchBarBorder: 'rgba(255, 255, 255, 0.9)',
    counterBg: APP_THEME.light.state,
    counterText: APP_THEME.light.primary,
    buttonBg: APP_THEME.light.quickCard,
    emptyIconBg: APP_THEME.light.state,
    skeletonBg: '#FFFFFF',
    skeletonBadgeBg: '#F2F2F7',
    cardBg: APP_THEME.light.card,
    subCardBg: APP_THEME.light.background,
    cardFallbackBg: '#1C1C1E',
    statusPickerCard: '#FFFFFF',
    statusPickerBorder: APP_THEME.light.border,
    cancelBtnBg: 'rgba(255, 59, 48, 0.1)',
    blurTint: 'light',
    inputBg: APP_THEME.light.background,
    inputBorder: APP_THEME.light.border,
    inputText: APP_THEME.light.primary,
    inputPlaceholder: '#999999',
    glassBg: 'rgba(255, 255, 255, 0.32)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
  },

  // Modo oscuro
  dark: {
    bg: APP_THEME.dark.background,
    textPrimary: '#FFFFFF',
    textSecondary: APP_THEME.dark.secondary,
    dividerColor: '#3A3A3C',
    badgeBg: '#1C1C1E',
    searchBarBg: 'rgba(28, 28, 30, 0.9)',
    searchBarBorder: 'rgba(255, 255, 255, 0.1)',
    counterBg: '#1C1C1E',
    counterText: '#FFFFFF',
    buttonBg: '#1C1C1E',
    emptyIconBg: '#1C1C1E',
    skeletonBg: '#1C1C1E',
    skeletonBadgeBg: '#2C2C2E',
    cardBg: APP_THEME.dark.card,
    subCardBg: '#2C2C2E',
    cardFallbackBg: '#1C1C1E',
    statusPickerCard: '#1C1C1E',
    statusPickerBorder: APP_THEME.dark.border,
    cancelBtnBg: 'rgba(255, 59, 48, 0.1)',
    blurTint: 'dark',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputText: '#FFFFFF',
    inputPlaceholder: 'rgba(255,255,255,0.4)',
    glassBg: 'rgba(30, 30, 32, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
  },
};

// Estados de verificación
export const STATUS_STYLES = {
  pendiente: { color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.15)', text: 'Pendiente' },
  verificado: { color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.15)', text: 'Activo' },
  borrador: { color: '#8E8E93', bgColor: 'rgba(142, 142, 147, 0.15)', text: 'Borrador' },
};

export const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente', color: '#FF9500' },
  { value: 'verificado', label: 'Activo', color: '#34C759' },
];

// Helper para obtener colores según el tema
export const getColors = (isDark) => {
  return isDark ? COLORS.dark : COLORS.light;
};

// Colores para calculadora
export const CALC_COLORS = {
  ACTIVE_COLOR: '#10B981',

  light: {
    bg: APP_THEME.light.background,
    cardBg: APP_THEME.light.card,
    subCardBg: APP_THEME.light.background,
    textPrimary: APP_THEME.light.primary,
    textSecondary: APP_THEME.light.secondary,
    dividerColor: '#D1D1D6',
    badgeBg: '#E5E5EA',
    inputBg: APP_THEME.light.background,
    inputBorder: APP_THEME.light.border,
    inputText: APP_THEME.light.primary,
    inputPlaceholder: '#999999',
    iconBadgeMacro: '#e4f5ec',
    iconBadgeSec: '#fbf1dd',
    macroTint: '#e4f5ec',
    macroBorder: '#0b6b45',
    secTint: '#fbf1dd',
    secBorder: '#c8901f',
    ok: '#059669',
    okSoft: '#ecfdf5',
    warn: '#d97706',
    warnSoft: '#fff7ed',
    danger: '#c0392b',
    dangerSoft: '#fde8e4',
    gold: '#c8901f',
    goldDark: '#9b6b0f',
    goldSoft: '#fbf1dd',
    heroGradientStart: '#c8901f',
    heroGradientEnd: '#9b6b0f',
    glassBg: 'rgba(255, 255, 255, 0.32)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
    blurTint: 'light',
    dimGradientStart: '#0b6b45',
    dimGradientEnd: '#053b2a',
    dimIconBadge: 'rgba(255,255,255,0.18)',
    dimText: '#ffffff',
    dimTextSub: 'rgba(255,255,255,0.78)',
    dimInputBg: '#ffffff',
    dimInputText: '#111111',
    dimAreaPillBg: '#ffffff',
    dimAreaPillText: '#053b2a',
  },

  dark: {
    bg: '#000000',
    cardBg: '#1C1C1E',
    subCardBg: '#2C2C2E',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    dividerColor: '#3A3A3C',
    badgeBg: '#1C1C1E',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputText: '#FFFFFF',
    inputPlaceholder: 'rgba(255,255,255,0.4)',
    iconBadgeMacro: 'rgba(16, 185, 129, 0.15)',
    iconBadgeSec: 'rgba(200, 144, 31, 0.15)',
    macroTint: 'rgba(16, 185, 129, 0.12)',
    macroBorder: '#10B981',
    secTint: 'rgba(200, 144, 31, 0.12)',
    secBorder: '#c8901f',
    ok: '#34C759',
    okSoft: 'rgba(52, 199, 89, 0.15)',
    warn: '#FF9500',
    warnSoft: 'rgba(255, 149, 0, 0.15)',
    danger: '#FF3B30',
    dangerSoft: 'rgba(255, 59, 48, 0.15)',
    gold: '#c8901f',
    goldDark: '#e8a82e',
    goldSoft: 'rgba(200, 144, 31, 0.15)',
    heroGradientStart: '#c8901f',
    heroGradientEnd: '#9b6b0f',
    glassBg: 'rgba(30, 30, 32, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    blurTint: 'dark',
    dimGradientStart: '#0b6b45',
    dimGradientEnd: '#053b2a',
    dimIconBadge: 'rgba(255,255,255,0.12)',
    dimText: '#ffffff',
    dimTextSub: 'rgba(255,255,255,0.65)',
    dimInputBg: 'rgba(255,255,255,0.1)',
    dimInputText: '#FFFFFF',
    dimAreaPillBg: 'rgba(255,255,255,0.12)',
    dimAreaPillText: '#ffffff',
  },
};

export const getCalcColors = (isDark) => {
  return isDark ? CALC_COLORS.dark : CALC_COLORS.light;
};
