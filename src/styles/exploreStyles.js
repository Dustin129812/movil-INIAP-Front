// ============================================
// ESTILOS DE EXPLORE (Ajustes)
// ============================================

// Origen: app/(tabs)/explore.js
// Documentacion: Estilos para la pantalla de configuracion/Ajustes

import { StyleSheet } from 'react-native';
import { APP_THEME } from './appTheme';

// ============================================
// PALETA DE COLORES
// ============================================

const COLORS = {
    cream: APP_THEME.light.background,

    darkGreen: APP_THEME.light.primary,
    forestGreen: APP_THEME.light.forest,

    green: APP_THEME.light.accent,
    brightGreen: APP_THEME.light.accent,

    lightGreen: APP_THEME.light.quickCard,
    softGreen: APP_THEME.light.quickIcon,

    mintGreen: APP_THEME.light.mint,

    veryLightGreen: APP_THEME.light.state,

    secondaryGreen: APP_THEME.light.secondary,

    white: '#FFFFFF',

    darkBackground: APP_THEME.dark.background,
    darkCard: APP_THEME.dark.card,
    darkCardSecondary: '#263127',

    darkBorder: '#354238',

    darkText: '#F5F8F4',
    darkSecondary: '#A8B5A9',

    gray: '#8A958A',

    orange: '#E5A83B',
    red: '#D9534F',
};

// ============================================
// ESTILOS
// ============================================

export const exploreStyles = StyleSheet.create({

    // ============================================
    // CONTENEDORES PRINCIPALES
    // ============================================

    container: {
        flex: 1,
        backgroundColor: COLORS.cream,
    },

    containerDark: {
        backgroundColor: COLORS.darkBackground,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },

    textWhite: {
        color: COLORS.white,
    },

    // ============================================
    // SCROLL HEADER
    // ============================================

    statusBarScrim: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
    },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 16,
    },

    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 42,
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    headerTitle: {
        fontSize: 34,
        fontWeight: '700',
        color: COLORS.darkGreen,
        letterSpacing: -0.4,
    },

    // ============================================
    // PERFIL APPLE ACCOUNT
    // ============================================

    appleProfileSection: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 32,
    },

    appleAvatarWrap: {
        marginBottom: 18,
    },

    appleAvatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    appleAvatarInitials: {
        fontSize: 40,
        fontWeight: '600',
        color: COLORS.secondaryGreen,
        letterSpacing: 0.5,
    },

    appleAvatarInitialsDark: {
        color: COLORS.softGreen,
    },

    appleName: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.darkGreen,
        letterSpacing: -0.4,
        marginBottom: 4,
        textAlign: 'center',
    },

    appleEmail: {
        fontSize: 15,
        color: COLORS.secondaryGreen,
        fontWeight: '400',
        textAlign: 'center',
    },

    appleGuestBadge: {
        marginTop: 10,
        backgroundColor: 'rgba(111, 175, 50, 0.14)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },

    appleGuestBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.green,
        letterSpacing: 0.3,
    },

    // ============================================
    // SECCIONES
    // ============================================

    section: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.secondaryGreen,
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    sectionTitleDark: {
        color: COLORS.softGreen,
    },

    // ============================================
    // APARIENCIA
    // ============================================

    appearanceRow: {
        flexDirection: 'row',
        gap: 8,
    },

    themeCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 10,
        borderWidth: 1.5,
        borderColor: 'transparent',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },

    themeCardActive: {
        borderColor: COLORS.green,
    },

    themeCardActiveDark: {
        borderColor: COLORS.brightGreen,
        backgroundColor: COLORS.darkCard,
    },

    themePreviewLight: {
        height: 50,
        borderRadius: 10,
        marginBottom: 8,
        padding: 8,
        justifyContent: 'space-between',
        backgroundColor: COLORS.cream,
    },

    themePreviewDark: {
        height: 50,
        borderRadius: 10,
        marginBottom: 8,
        padding: 8,
        justifyContent: 'space-between',
        backgroundColor: COLORS.darkCard,
    },

    themePreviewSystem: {
        height: 50,
        borderRadius: 10,
        marginBottom: 8,
        flexDirection: 'row',
        overflow: 'hidden',
    },

    systemHalfLight: {
        flex: 1,
        backgroundColor: COLORS.cream,
        padding: 6,
    },

    systemHalfDark: {
        flex: 1,
        backgroundColor: COLORS.darkCardSecondary,
        padding: 6,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },

    previewLineSystemLight: {
        width: '80%',
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C9D4C4',
    },

    previewDotSystemDark: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.green,
    },

    previewLine: {
        width: '40%',
        height: 5,
        borderRadius: 3,
        backgroundColor: '#C9D4C4',
    },

    previewDotRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    previewDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    themeDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    themeTextContainer: {
        flex: 1,
        paddingRight: 4,
    },

    themeTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.darkGreen,
    },

    themeSubtitle: {
        fontSize: 10,
        color: COLORS.secondaryGreen,
        marginTop: 1,
    },

    radioOuter: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: '#B8C5B8',
        justifyContent: 'center',
        alignItems: 'center',
    },

    radioOuterDark: {
        borderColor: '#536055',
    },

    radioOuterActive: {
        borderColor: COLORS.green,
    },

    radioOuterActiveDark: {
        borderColor: COLORS.brightGreen,
    },

    radioInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.green,
    },

    // ============================================
    // CARDS GENERICAS
    // ============================================

    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingHorizontal: 16,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },

    cardDark: {
        backgroundColor: COLORS.darkCard,
        borderWidth: 1,
        borderColor: 'rgba(120, 184, 50, 0.12)',
    },

    dividerDark: {
        backgroundColor: COLORS.darkBorder,
    },

    lastRow: {
        borderBottomWidth: 0,
    },

    // ============================================
    // FILAS DE NAVEGACION
    // ============================================

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.veryLightGreen,
    },

    rowDark: {
        borderBottomColor: COLORS.darkBorder,
    },

    rowLabel: {
        fontSize: 14,
        color: COLORS.darkGreen,
        fontWeight: '500',
    },

    navRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },

    navIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(111, 175, 50, 0.13)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    navIconWrapDark: {
        backgroundColor: 'rgba(111, 175, 50, 0.18)',
    },

    navRowSub: {
        fontSize: 12,
        color: COLORS.secondaryGreen,
        marginTop: 1,
    },

    // ============================================
    // LOGOUT
    // ============================================

    logoutButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,

        borderWidth: 1,
        borderColor: 'rgba(217, 83, 79, 0.15)',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.03,
        shadowRadius: 6,
    },

    logoutButtonDark: {
        backgroundColor: COLORS.darkCard,
        borderColor: 'rgba(217, 83, 79, 0.25)',
    },

    logoutText: {
        color: COLORS.red,
        fontSize: 15,
        fontWeight: '600',
    },

    // ============================================
    // VERSION
    // ============================================

    version: {
        textAlign: 'center',
        color: '#A9B5A8',
        fontSize: 12,
        marginTop: 24,
    },

    versionDark: {
        color: '#657064',
    },

});