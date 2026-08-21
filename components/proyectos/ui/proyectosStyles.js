import { StyleSheet } from 'react-native';
import { APP_THEME } from '../../../src/styles/appTheme';

const COLORS = {
    cream: APP_THEME.light.background,

    darkGreen: APP_THEME.light.primary,
    forestGreen: APP_THEME.light.forest,
    green: APP_THEME.light.accent,
    brightGreen: APP_THEME.light.accent,

    quickCard: APP_THEME.light.quickCard,
    quickIcon: APP_THEME.light.quickIcon,

    calculator: APP_THEME.light.mint,

    state: APP_THEME.light.state,
    stateIcon: APP_THEME.light.stateIcon,

    secondaryGreen: APP_THEME.light.secondary,

    white: '#FFFFFF',

    orange: '#F59E0B',
    error: '#E5484D',
};

const glassCardDark = {

    backgroundColor: '#1E261F',

    borderRadius: 36,

    borderWidth: 1,

    borderColor: 'rgba(120, 184, 50, 0.18)',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 8 },

    shadowOpacity: 0.35,

    shadowRadius: 16,

    elevation: 8,

};

const glassCardLight = {

    backgroundColor: '#E5EBD3',

    borderRadius: 36,

    borderWidth: 1,

    borderColor: 'rgba(23, 77, 46, 0.12)',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 8 },

    shadowOpacity: 0.12,

    shadowRadius: 16,

    elevation: 8,

};

const cardBase = {

    marginHorizontal: 16,

    marginVertical: 8,

    padding: 20,

    overflow: 'hidden',

};

export const createProyectosStyles = (isDark) => StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: isDark
            ? '#101510'
            : COLORS.cream,

    },

    header: {

        paddingHorizontal: 20,

        paddingTop: 16,

        paddingBottom: 8,

    },

    headerTitle: {

        fontSize: 34,

        fontWeight: '700',

        color: isDark
            ? COLORS.white
            : COLORS.darkGreen,

        letterSpacing: 0.37,

    },

    headerSubtitle: {

        fontSize: 15,

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

        marginTop: 4,

    },

    tabsContainer: {

        flexDirection: 'row',

        paddingHorizontal: 20,

        paddingVertical: 12,

        gap: 8,

    },

    tab: {

        paddingHorizontal: 16,

        paddingVertical: 8,

        borderRadius: 20,

        backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.07)'
            : 'rgba(23, 77, 46, 0.08)',

    },

    tabActive: {

        backgroundColor: COLORS.green,

    },

    tabText: {

        fontSize: 14,

        fontWeight: '600',

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

    },

    tabTextActive: {

        color: COLORS.white,

    },

    card: {

        ...(isDark ? glassCardDark : glassCardLight),

        ...cardBase,

    },

    cardHeader: {

        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'flex-start',

        marginBottom: 12,

    },

    cardTitle: {

        fontSize: 18,

        fontWeight: '600',

        color: isDark
            ? COLORS.white
            : COLORS.darkGreen,

        flex: 1,

    },

    cardBadge: {

        paddingHorizontal: 10,

        paddingVertical: 4,

        borderRadius: 12,

        backgroundColor: isDark
            ? 'rgba(111, 175, 50, 0.20)'
            : 'rgba(111, 175, 50, 0.16)',

    },

    cardBadgeText: {

        fontSize: 12,

        fontWeight: '600',

        color: COLORS.green,

    },

    cardBadgePending: {

        backgroundColor: isDark
            ? 'rgba(245, 158, 11, 0.20)'
            : 'rgba(245, 158, 11, 0.14)',

    },

    cardBadgeTextPending: {

        color: COLORS.orange,

    },

    cardDescription: {

        fontSize: 14,

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

        marginBottom: 12,

    },

    cardInfoRow: {

        flexDirection: 'row',

        flexWrap: 'wrap',

        gap: 12,

    },

    cardInfoItem: {

        flexDirection: 'row',

        alignItems: 'center',

        gap: 6,

    },

    cardInfoLabel: {

        fontSize: 12,

        color: isDark
            ? '#89988B'
            : COLORS.secondaryGreen,

    },

    cardInfoValue: {

        fontSize: 12,

        color: isDark
            ? COLORS.white
            : COLORS.darkGreen,

        fontWeight: '500',

    },

    cardInfoIcon: {

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

    },

    timelineContainer: {

        paddingLeft: 20,

        borderLeftWidth: 2,

        borderLeftColor: isDark
            ? 'rgba(111, 175, 50, 0.30)'
            : 'rgba(111, 175, 50, 0.35)',

        marginLeft: 20,

    },

    timelineItem: {

        paddingLeft: 20,

        paddingBottom: 20,

        position: 'relative',

    },

    timelineDot: {

        position: 'absolute',

        left: -25,

        top: 4,

        width: 10,

        height: 10,

        borderRadius: 5,

        backgroundColor: COLORS.green,

    },

    timelineDate: {

        fontSize: 12,

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

        marginBottom: 4,

    },

    timelineTitle: {

        fontSize: 16,

        fontWeight: '600',

        color: isDark
            ? COLORS.white
            : COLORS.darkGreen,

    },

    timelineDescription: {

        fontSize: 14,

        color: isDark
            ? '#89988B'
            : '#477442',

        marginTop: 4,

    },

    emptyContainer: {

        flex: 1,

        justifyContent: 'center',

        alignItems: 'center',

        paddingHorizontal: 40,

        paddingVertical: 60,

    },

    emptyIcon: {

        color: isDark
            ? '#354238'
            : '#C9D8B5',

    },

    emptyText: {

        fontSize: 17,

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

        textAlign: 'center',

        marginTop: 16,

    },

    emptySubtext: {

        fontSize: 14,

        color: isDark
            ? '#6F7D72'
            : '#8CA080',

        textAlign: 'center',

        marginTop: 8,

    },

    fab: {

        position: 'absolute',

        bottom: 100,

        right: 20,

        width: 56,

        height: 56,

        borderRadius: 28,

        backgroundColor: COLORS.green,

        justifyContent: 'center',

        alignItems: 'center',

        shadowColor: COLORS.green,

        shadowOffset: { width: 0, height: 4 },

        shadowOpacity: 0.4,

        shadowRadius: 8,

        elevation: 8,

    },

    fabText: {

        fontSize: 28,

        color: COLORS.white,

        fontWeight: '300',

    },

    inputContainer: {

        marginBottom: 16,

    },

    inputLabel: {

        fontSize: 13,

        fontWeight: '600',

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

        marginBottom: 8,

        textTransform: 'uppercase',

        letterSpacing: 0.5,

    },

    input: {

        backgroundColor: isDark
            ? '#1E261F'
            : COLORS.white,

        borderRadius: 12,

        paddingHorizontal: 16,

        paddingVertical: 14,

        fontSize: 16,

        color: isDark
            ? COLORS.white
            : COLORS.darkGreen,

        borderWidth: 1,

        borderColor: isDark
            ? 'rgba(120, 184, 50, 0.16)'
            : 'rgba(23, 77, 46, 0.12)',

    },

    inputMultiline: {

        minHeight: 100,

        textAlignVertical: 'top',

    },

    button: {

        backgroundColor: COLORS.forestGreen,

        borderRadius: 12,

        paddingVertical: 16,

        alignItems: 'center',

        marginTop: 20,

    },

    buttonText: {

        fontSize: 17,

        fontWeight: '600',

        color: COLORS.white,

    },

    buttonSecondary: {

        backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(23, 77, 46, 0.08)',

    },

    buttonSecondaryText: {

        color: COLORS.forestGreen,

    },

    matrizContainer: {

        flex: 1,

        backgroundColor: isDark
            ? '#101510'
            : COLORS.cream,

    },

    matrizHeader: {

        flexDirection: 'row',

        backgroundColor: isDark
            ? '#1E261F'
            : COLORS.white,

        borderTopLeftRadius: 20,

        borderTopRightRadius: 20,

    },

    matrizHeaderCell: {

        width: 100,

        paddingVertical: 12,

        paddingHorizontal: 8,

        borderRightWidth: 1,

        borderRightColor: isDark
            ? '#354238'
            : '#DCE5D2',

    },

    matrizHeaderText: {

        fontSize: 11,

        fontWeight: '600',

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

        textAlign: 'center',

    },

    matrizRow: {

        flexDirection: 'row',

        borderBottomWidth: 1,

        borderBottomColor: isDark
            ? '#354238'
            : '#DCE5D2',

    },

    matrizVariableCell: {

        width: 100,

        paddingVertical: 14,

        paddingHorizontal: 8,

        backgroundColor: isDark
            ? '#1E261F'
            : '#F2F5EA',

        justifyContent: 'center',

    },

    matrizVariableText: {

        fontSize: 12,

        color: isDark
            ? COLORS.white
            : COLORS.darkGreen,

        fontWeight: '500',

    },

    matrizDataCell: {

        width: 100,

        paddingVertical: 8,

        paddingHorizontal: 4,

        borderRightWidth: 1,

        borderRightColor: isDark
            ? '#354238'
            : '#DCE5D2',

    },

    matrizDataInput: {

        backgroundColor: 'transparent',

        fontSize: 14,

        color: isDark
            ? COLORS.white
            : COLORS.darkGreen,

        textAlign: 'center',

        padding: 0,

    },

    matrizFooter: {

        flexDirection: 'row',

        backgroundColor: isDark
            ? '#263128'
            : COLORS.state,

    },

    matrizFooterCell: {

        width: 100,

        paddingVertical: 12,

        paddingHorizontal: 8,

        borderRightWidth: 1,

        borderRightColor: isDark
            ? '#354238'
            : '#DCE5D2',

    },

    matrizFooterLabel: {

        fontSize: 10,

        color: isDark
            ? '#A8B5A9'
            : COLORS.secondaryGreen,

        textAlign: 'center',

    },

    matrizFooterValue: {

        fontSize: 14,

        fontWeight: '600',

        color: COLORS.green,

        textAlign: 'center',

        marginTop: 2,

    },

    list: {

        paddingBottom: 120,

        paddingTop: 8,

    },

    emptyList: {

        flex: 1,

    },

});

export const proyectosStyles = createProyectosStyles(true);