// ============================================
// ESTILOS COMPARTIDOS PARA PROYECTOS
// ============================================

// Uso: crear/editar proyectos - estilos comunes a ambos
// Origen: src/styles/sharedProyectoStyles.js

import { StyleSheet } from 'react-native';

import { COLORS } from './global/colors';

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

    // Estados
    error: '#E5484D',
};

// ============================================
// ESTILOS COMPARTIDOS
// ============================================

export const sharedProyectoStyles = StyleSheet.create({

    // ============================================
    // CONTENEDORES PRINCIPALES
    // ============================================

    container: {
        flex: 1,
    },

    // MODO CLARO - MISMO FONDO DEL HOME
    containerLight: {
        backgroundColor: HOME_COLORS.cream,
    },

    // MODO OSCURO
    containerDark: {
        backgroundColor: '#101510',
    },

    textWhite: {
        color: HOME_COLORS.white,
    },

    // ============================================
    // SCROLL VIEW
    // ============================================

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    // ============================================
    // STATUS BAR
    // ============================================

    statusBarScrim: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
    },

    // ============================================
    // HEADER
    // ============================================

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
        gap: 8,
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    // TÍTULO PRINCIPAL
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: HOME_COLORS.darkGreen,
        letterSpacing: -0.5,
    },

    // ============================================
    // BOTONES DEL HEADER
    // ============================================

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

    backButtonDark: {
        backgroundColor: '#1E261F',
    },

    saveButton: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        backgroundColor: HOME_COLORS.forestGreen,
        borderRadius: 20,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },

    saveButtonDisabled: {
        backgroundColor: 'rgba(23, 77, 46, 0.30)',
    },

    saveButtonText: {
        color: HOME_COLORS.white,
        fontSize: 15,
        fontWeight: '700',
    },

    // ============================================
    // SECCIONES
    // ============================================

    section: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: HOME_COLORS.secondaryGreen,
        marginBottom: 10,
        marginLeft: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    sectionTitleDark: {
        color: '#A8B5A9',
    },

    // ============================================
    // CARDS
    // ============================================

    card: {
        backgroundColor: HOME_COLORS.state,
        borderRadius: 24,
        padding: 18,

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
    // INPUTS
    // ============================================

    inputContainer: {
        marginBottom: 16,
    },

    inputLabel: {
        fontSize: 13,
        fontWeight: '800',
        color: HOME_COLORS.secondaryGreen,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    input: {
        backgroundColor: HOME_COLORS.white,
        borderRadius: 16,

        paddingHorizontal: 16,
        paddingVertical: 14,

        fontSize: 16,
        color: HOME_COLORS.darkGreen,

        borderWidth: 1,
        borderColor: 'rgba(23, 77, 46, 0.08)',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },

    inputDark: {
        backgroundColor: '#283129',
        color: HOME_COLORS.white,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },

    // ============================================
    // OPTIONS CHIPS
    // BOTONES DE SELECCIÓN
    // ============================================

    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    // OPCIÓN NORMAL
    optionChip: {
        paddingHorizontal: 18,
        paddingVertical: 11,
        borderRadius: 22,

        backgroundColor: HOME_COLORS.white,

        borderWidth: 1,
        borderColor: 'rgba(23, 77, 46, 0.10)',
    },

    optionChipDark: {
        backgroundColor: '#283129',
        borderColor: 'rgba(255,255,255,0.08)',
    },

    // OPCIÓN SELECCIONADA
    optionChipActive: {
        backgroundColor: HOME_COLORS.quickCard,
        borderColor: HOME_COLORS.green,
    },

    optionChipText: {
        fontSize: 14,
        color: HOME_COLORS.secondaryGreen,
        fontWeight: '600',
    },

    optionChipTextActive: {
        color: HOME_COLORS.darkGreen,
        fontWeight: '800',
    },

    // ============================================
    // BOTÓN CREAR
    // ============================================

    buttonContainer: {
        marginTop: 8,
        marginHorizontal: 16,
    },

    button: {
        backgroundColor: HOME_COLORS.forestGreen,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 3,
    },

    buttonDisabled: {
        backgroundColor: 'rgba(23, 77, 46, 0.35)',
    },

    buttonText: {
        color: HOME_COLORS.white,
        fontSize: 17,
        fontWeight: '800',
    },

    // ============================================
    // ESTADOS ESPECIALES
    // ============================================

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },

    errorText: {
        color: HOME_COLORS.error,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
    },

    emptyText: {
        color: HOME_COLORS.secondaryGreen,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
    },

    volverText: {
        color: HOME_COLORS.green,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
    },

});