// ============================================
// TEMA DEL TAB BAR - Liquid Glass
// ============================================
// Constantes de animacion y colores para el tab bar personalizado
// Origen: app/(tabs)/_layout.js - extraido para modularidad

// --- COLORES ---
export const TAB_BAR_COLORS = {
  ACTIVE_COLOR: '#10B981', // Verde esmeralda activo
  INACTIVE_COLOR_LIGHT: 'rgba(0,0,0,0.4)',
  INACTIVE_COLOR_DARK: 'rgba(255,255,255,0.55)',
  LABEL_COLOR_LIGHT: 'rgba(0,0,0,0.75)',
  LABEL_COLOR_DARK: 'rgba(255,255,255,0.85)',
  GLASS_BG_LIGHT: 'rgba(255, 255, 255, 0.32)',
  GLASS_BG_DARK: 'rgba(30, 30, 32, 0.25)',
  GLASS_BORDER_LIGHT: 'rgba(255, 255, 255, 0.35)',
  GLASS_BORDER_DARK: 'rgba(255, 255, 255, 0.10)',
  BUBBLE_OVERLAY_LIGHT: 'rgba(255, 255, 255, 0.30)',
  BUBBLE_OVERLAY_DARK: 'rgba(255, 255, 255, 0.12)',
  BUBBLE_BORDER_LIGHT: 'rgba(255, 255, 255, 0.4)',
  BUBBLE_BORDER_DARK: 'transparent',
  INPUT_TEXT_COLOR: '#FFFFFF',
  INPUT_PLACEHOLDER_LIGHT: 'rgba(0,0,0,0.45)',
  INPUT_PLACEHOLDER_DARK: 'rgba(255,255,255,0.7)',
  FAB_ICON_COLOR_LIGHT: '#000000',
  FAB_ICON_COLOR_DARK: '#FFFFFF',
  SHADOW_COLOR: '#000000',
};

// --- DIMENSIONES ---
export const TAB_BAR_DIMENSIONS = {
  TAB_WIDTH: 64,
  TOTAL_TABS: 4,
  CONTAINER_PADDING: 6,
  SEARCH_BTN_SIZE: 52,
  SEARCH_GAP: 12,
  FAB_SIZE: 52,
  SIDE_MARGIN: 20,
  ICON_SIZE: 24,
  PILL_HEIGHT: 64,
  PILL_RADIUS: 32,
  BUBBLE_RADIUS: 28,
  FAB_ICON_SIZE: 30,
  FULL_WIDTH_SEARCH_HEIGHT: 52,
  FULL_WIDTH_SEARCH_RADIUS: 24,
  GLASS_INTENSITY: 65,
  BUBBLE_INTENSITY: 85,
};

// --- ANIMACIONES (Springs) ---
export const TAB_BAR_SPRING_CONFIG = {
  // Apple-style spring para expansion/contraccion
  APPLE_SPRING: { damping: 24, stiffness: 280, mass: 0.8 },
  // Spring suave para el bubble indicator
  BUBBLE_SPRING: { damping: 16, stiffness: 180, mass: 0.7 },
  // Spring para gestures (drag/long press)
  DRAG_SPRING: { damping: 12, stiffness: 200 },
  // Spring para scale transforms
  SCALE_SPRING: { damping: 14, stiffness: 180 },
};

// --- HELPERS ---
// Obtiene colores del tab bar segun el tema
export const getTabBarColors = (isDark) => ({
  iconActiveColor: TAB_BAR_COLORS.ACTIVE_COLOR,
  iconInactiveColor: isDark ? TAB_BAR_COLORS.INACTIVE_COLOR_DARK : TAB_BAR_COLORS.INACTIVE_COLOR_LIGHT,
  labelColor: isDark ? TAB_BAR_COLORS.LABEL_COLOR_DARK : TAB_BAR_COLORS.LABEL_COLOR_LIGHT,
  glassBgColor: isDark ? TAB_BAR_COLORS.GLASS_BG_DARK : TAB_BAR_COLORS.GLASS_BG_LIGHT,
  glassBorderColor: isDark ? TAB_BAR_COLORS.GLASS_BORDER_DARK : TAB_BAR_COLORS.GLASS_BORDER_LIGHT,
  activeBubbleTint: isDark ? 'dark' : 'light',
  activeBubbleOverlay: isDark ? TAB_BAR_COLORS.BUBBLE_OVERLAY_DARK : TAB_BAR_COLORS.BUBBLE_OVERLAY_LIGHT,
  activeBubbleBorder: isDark ? TAB_BAR_COLORS.BUBBLE_BORDER_DARK : TAB_BAR_COLORS.BUBBLE_BORDER_LIGHT,
  activeBubbleBorderWidth: isDark ? 0 : 0.5,
  blurTint: isDark ? 'dark' : 'light',
});
