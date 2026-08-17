// ============================================
// COLORES GLOBALES PARA COMPONENTES COMPARTIDOS
// ============================================
// Uso: import { GLOBAL_COLORS } from '../global/colors';
// Estos colores son para componentes reutilizables (Button, Card, Input, etc.)
// Para colores de la app, usar: import { COLORS } from '../colors';

export const GLOBAL_COLORS = {
  // Colores principales
  primary: '#34C759',
  primaryDark: 'rgba(52, 199, 89, 0.15)',
  primaryLight: 'rgba(52, 199, 89, 0.1)',

  // Estados
  success: '#34C759',
  error: '#FF453A',
  warning: '#FF9500',
  info: '#0A84FF',

  // Fondos
  light: {
    bg: '#F2F2F7',
    card: '#FFFFFF',
    input: '#F2F2F7',
    border: '#D1D1D6',
  },
  dark: {
    bg: '#000000',
    card: '#1C1C1E',
    input: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.12)',
  },

  // Texto
  text: {
    primary: '#111111',
    secondary: '#8E8E93',
    placeholder: '#999999',
  },
  textDark: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.6)',
    placeholder: 'rgba(255,255,255,0.4)',
  },

  // Texto específico para modo oscuro
  textSecondaryDark: '#98989F',
};

// Alias para compatibilidad (evitar romper código existente que use COLORS de global)
export const COLORS = GLOBAL_COLORS;
export const THEME_COLORS = GLOBAL_COLORS;
