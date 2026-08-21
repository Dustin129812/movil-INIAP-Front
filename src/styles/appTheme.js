export const APP_THEME = {
    light: {
        background: '#FCF8F0',
        card: '#E5EBD3',
        quickCard: '#C9E28D',
        quickIcon: '#A9D266',
        quickArrow: '#6FAF32',
        primary: '#0B3D24',
        forest: '#174D2E',
        accent: '#6FAF32',
        mint: '#75CFA3',
        state: '#E5EBD3',
        stateIcon: 'rgba(111,175,50,0.16)',
        secondary: '#477442',
        text: '#0B3D24',
        textMuted: '#477442',
        white: '#FFFFFF',
        border: 'rgba(23, 77, 46, 0.12)',
    },
    dark: {
        background: '#101510',
        card: '#1E261F',
        quickCard: '#263127',
        quickIcon: 'rgba(167, 201, 87, 0.22)',
        quickArrow: '#A7C957',
        primary: '#F5F8F4',
        forest: '#A7C957',
        accent: '#A7C957',
        mint: '#75CFA3',
        state: '#1E261F',
        stateIcon: 'rgba(167, 201, 87, 0.16)',
        secondary: '#A8B5A9',
        text: '#F5F8F4',
        textMuted: '#A8B5A9',
        white: '#FFFFFF',
        border: 'rgba(167, 201, 87, 0.18)',
    },
};

export const getAppTheme = (isDark) => (isDark ? APP_THEME.dark : APP_THEME.light);

export const APP_LAYOUT = {
    horizontalPadding: 16,
    cardRadius: 24,
    sectionGap: 14,
    shadow: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
};