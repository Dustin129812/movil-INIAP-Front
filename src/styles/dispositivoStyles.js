// ============================================
// ESTILOS DE DISPOSITIVO
// ============================================

// Origen: app/configuracion/dispositivo.js
// Documentacion: Estilos para la pantalla de informacion del dispositivo

import { StyleSheet, Platform } from 'react-native';

// ============================================
// PALETA BASADA EN EL HOME
// ============================================

const HOME_COLORS = {
    // Fondo principal
    cream: '#FCF8F0',

    // Verdes principales
    darkGreen: '#0B3D24',
    forestGreen: '#174D2E',
    green: '#6FAF32',
    brightGreen: '#78B832',

    // Verdes claros
    quickCard: '#C9E28D',
    quickIcon: '#A9D266',

    // Menta
    mint: '#75CFA3',

    // Tarjetas y fondos suaves
    state: '#E5EBD3',
    stateIcon: 'rgba(111,175,50,0.16)',

    // Textos secundarios
    secondaryGreen: '#477442',

    // Blanco
    white: '#FFFFFF',
};

// ============================================
// ESTILOS
// ============================================

export const dispositivoStyles = StyleSheet.create({

    // ============================================
    // CONTENEDORES PRINCIPALES
    // ============================================

    container: {
        flex: 1,
        backgroundColor: HOME_COLORS.cream,
    },

    containerDark: {
        backgroundColor: '#101510',
    },

    textWhite: {
        color: HOME_COLORS.white,
    },

    // ============================================
    // HEADER
    // ============================================

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: HOME_COLORS.quickIcon,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: HOME_COLORS.darkGreen,
        letterSpacing: -0.5,
    },

    // ============================================
    // SCROLL CONTENT
    // ============================================

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
    },

    // ============================================
    // HERO
    // ============================================

    hero: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 30,
    },

    avatarRing: {
        width: 88,
        height: 88,
        borderRadius: 44,

        backgroundColor: HOME_COLORS.stateIcon,

        justifyContent: 'center',
        alignItems: 'center',

        borderWidth: 2,
        borderColor: HOME_COLORS.green,

        marginBottom: 14,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },

    avatarRingDark: {
        backgroundColor: 'rgba(111,175,50,0.18)',
        borderColor: HOME_COLORS.quickIcon,
    },

    heroName: {
        fontSize: 24,
        fontWeight: '800',
        color: HOME_COLORS.darkGreen,
        letterSpacing: -0.5,
    },

    heroSubtitle: {
        fontSize: 14,
        color: HOME_COLORS.secondaryGreen,
        marginTop: 4,
        fontWeight: '500',
    },

    // ============================================
    // SECCIONES
    // ============================================

    groupTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: HOME_COLORS.secondaryGreen,
        marginBottom: 10,
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    groupTitleDark: {
        color: '#A8B5A9',
    },

    // ============================================
    // CARDS
    // ============================================

    card: {
        backgroundColor: HOME_COLORS.state,
        borderRadius: 24,
        paddingHorizontal: 18,
        marginBottom: 20,

        borderWidth: 1,
        borderColor: 'rgba(23, 77, 46, 0.10)',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },

    cardDark: {
        backgroundColor: '#1E261F',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    // ============================================
    // FILAS DE INFORMACIÓN
    // ============================================

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,

        borderBottomWidth: 1,
        borderBottomColor: 'rgba(23, 77, 46, 0.08)',
    },

    rowDark: {
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },

    lastRow: {
        borderBottomWidth: 0,
    },

    rowLabel: {
        fontSize: 14,
        color: HOME_COLORS.darkGreen,
        fontWeight: '700',
    },

    rowValueWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '60%',
    },

    rowValue: {
        fontSize: 14,
        color: HOME_COLORS.secondaryGreen,
        textAlign: 'right',
        fontWeight: '500',
    },

    mono: {
        fontFamily:
            Platform.OS === 'ios'
                ? 'Menlo'
                : 'monospace',
        fontSize: 12,
    },

    // ============================================
    // FOOTNOTE
    // ============================================

    footnote: {
        fontSize: 12,
        color: HOME_COLORS.secondaryGreen,
        paddingHorizontal: 6,
        lineHeight: 18,
        fontWeight: '500',
    },

    footnoteDark: {
        color: '#A8B5A9',
    },

});