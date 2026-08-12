// ============================================
// COLORES - Calculadora de Fertilizantes
// ============================================
// Sistema unificado con el resto de la app (lotesDashboardColors)
// Modo oscuro: fondo #000000, cards #1C1C1E, texto blanco
// Modo claro: fondo #F2F2F7, cards #FFFFFF, texto oscuro

export const COLORS_CALC = {
  // --- Tokens compartidos (usados en ambas pantallas) ---
  ACTIVE_COLOR: '#10B981', // Verde activo (igual que tab bar)

  // --- Tokens modo claro ---
  light: {
    bg: '#F2F2F7',
    cardBg: '#FFFFFF',
    subCardBg: '#F4F4F6',
    textPrimary: '#111111',
    textSecondary: '#6E6E73',
    dividerColor: '#D1D1D6',
    badgeBg: '#E5E5EA',

    // Inputs
    inputBg: '#F2F2F7',
    inputBorder: '#D1D1D6',
    inputText: '#111111',
    inputPlaceholder: '#999999',

    // Icon badges
    iconBadgeMacro: '#e4f5ec',
    iconBadgeSec: '#fbf1dd',

    // Nutrient boxes
    macroTint: '#e4f5ec',
    macroBorder: '#0b6b45',
    secTint: '#fbf1dd',
    secBorder: '#c8901f',

    // Status
    ok: '#059669',
    okSoft: '#ecfdf5',
    warn: '#d97706',
    warnSoft: '#fff7ed',
    danger: '#c0392b',
    dangerSoft: '#fde8e4',

    // Gold
    gold: '#c8901f',
    goldDark: '#9b6b0f',
    goldSoft: '#fbf1dd',

    // Hero gradient
    heroGradientStart: '#c8901f',
    heroGradientEnd: '#9b6b0f',

    // Glass
    glassBg: 'rgba(255, 255, 255, 0.32)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
    blurTint: 'light',

    // Dimensiones card (gradiente verde)
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

  // --- Tokens modo oscuro ---
  dark: {
    bg: '#000000',
    cardBg: '#1C1C1E',
    subCardBg: '#2C2C2E',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    dividerColor: '#3A3A3C',
    badgeBg: '#1C1C1E',

    // Inputs
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputText: '#FFFFFF',
    inputPlaceholder: 'rgba(255,255,255,0.4)',

    // Icon badges
    iconBadgeMacro: 'rgba(16, 185, 129, 0.15)',
    iconBadgeSec: 'rgba(200, 144, 31, 0.15)',

    // Nutrient boxes
    macroTint: 'rgba(16, 185, 129, 0.12)',
    macroBorder: '#10B981',
    secTint: 'rgba(200, 144, 31, 0.12)',
    secBorder: '#c8901f',

    // Status
    ok: '#34C759',
    okSoft: 'rgba(52, 199, 89, 0.15)',
    warn: '#FF9500',
    warnSoft: 'rgba(255, 149, 0, 0.15)',
    danger: '#FF3B30',
    dangerSoft: 'rgba(255, 59, 48, 0.15)',

    // Gold
    gold: '#c8901f',
    goldDark: '#e8a82e',
    goldSoft: 'rgba(200, 144, 31, 0.15)',

    // Hero gradient
    heroGradientStart: '#c8901f',
    heroGradientEnd: '#9b6b0f',

    // Glass
    glassBg: 'rgba(30, 30, 32, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    blurTint: 'dark',

    // Dimensiones card (gradiente verde oscuro)
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

// Helper para obtener colores según el tema
export const getCalcColors = (isDark) => {
  return isDark ? COLORS_CALC.dark : COLORS_CALC.light;
};

// Función helper para status (mantiene compatibilidad)
export const getStatusColor = (estado) => {
  if (estado === 'Completo' || estado === 'Activo') return COLORS_CALC.light.ok;
  if (estado === 'Exceso') return COLORS_CALC.light.danger;
  return COLORS_CALC.light.warn;
};
