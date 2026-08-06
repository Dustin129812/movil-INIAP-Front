// ============================================
// COLORES - LotesDashboardUI
// ============================================

// Estados de verificación
export const ESTILOS_STATUS = {
    pendiente: { color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.15)', text: 'Pendiente' },
    verificado: { color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.15)', text: 'Activo' },
    borrador: { color: '#8E8E93', bgColor: 'rgba(142, 142, 147, 0.15)', text: 'Borrador' },
};

// Opciones del selector de estado
export const ESTADO_OPCIONES = [
    { value: 'pendiente', label: 'Pendiente', color: '#FF9500' },
    { value: 'verificado', label: 'Activo', color: '#34C759' },
];

// Colores por modo (claro/oscuro)
export const COLORES_TEMA = {
    light: {
        bg: '#F2F2F7',
        textPrimary: '#111111',
        textSecondary: '#6E6E73',
        dividerColor: '#D1D1D6',
        badgeBg: '#E5E5EA',
        searchBarBg: 'rgba(255, 255, 255, 0.85)',
        searchBarBorder: 'rgba(255, 255, 255, 0.9)',
        counterBg: '#E5E5EA',
        counterText: '#3A3A3C',
        buttonBg: '#E5E5EA',
        emptyIconBg: '#E5E5EA',
        skeletonBg: '#FFFFFF',
        skeletonBadgeBg: '#F2F2F7',
        cardBg: '#FFFFFF',
        subCardBg: '#F4F4F6',
        cardFallbackBg: '#1C1C1E',
        statusPickerCard: '#FFFFFF',
        statusPickerBorder: '#E5E5EA',
        cancelBtnBg: 'rgba(255, 59, 48, 0.1)',
        blurTint: 'light',
    },
    dark: {
        bg: '#000000',
        textPrimary: '#FFFFFF',
        textSecondary: 'rgba(255,255,255,0.6)',
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
        cardBg: '#1C1C1E',
        subCardBg: '#2C2C2E',
        cardFallbackBg: '#1C1C1E',
        statusPickerCard: '#1C1C1E',
        statusPickerBorder: '#3A3A3C',
        cancelBtnBg: 'rgba(255, 59, 48, 0.1)',
        blurTint: 'dark',
    },
};

// Helper para obtener colores según el tema
export const getColores = (isDark) => {
    return isDark ? COLORES_TEMA.dark : COLORES_TEMA.light;
};
