import { StyleSheet } from 'react-native';

const glassCardDark = {
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
};

const glassCardLight = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
        backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '700',
        color: isDark ? '#FFFFFF' : '#000000',
        letterSpacing: 0.37,
    },
    headerSubtitle: {
        fontSize: 15,
        color: isDark ? '#8E8E93' : '#6E6E73',
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
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    tabActive: {
        backgroundColor: '#0A84FF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: isDark ? '#8E8E93' : '#8E8E93',
    },
    tabTextActive: {
        color: '#FFFFFF',
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
        color: isDark ? '#FFFFFF' : '#000000',
        flex: 1,
    },
    cardBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: isDark ? 'rgba(48, 209, 88, 0.2)' : 'rgba(48, 209, 88, 0.15)',
    },
    cardBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: isDark ? '#30D158' : '#34C759',
    },
    cardBadgePending: {
        backgroundColor: isDark ? 'rgba(255, 159, 10, 0.2)' : 'rgba(255, 159, 10, 0.15)',
    },
    cardBadgeTextPending: {
        color: isDark ? '#FF9F0A' : '#FF9500',
    },
    cardDescription: {
        fontSize: 14,
        color: isDark ? '#8E8E93' : '#6E6E73',
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
        color: isDark ? '#8E8E93' : '#8E8E93',
    },
    cardInfoValue: {
        fontSize: 12,
        color: isDark ? '#FFFFFF' : '#3A3A3C',
        fontWeight: '500',
    },
    cardInfoIcon: {
        color: isDark ? '#8E8E93' : '#8E8E93',
    },
    timelineContainer: {
        paddingLeft: 20,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(10, 132, 255, 0.3)',
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
        backgroundColor: '#0A84FF',
    },
    timelineDate: {
        fontSize: 12,
        color: isDark ? '#8E8E93' : '#8E8E93',
        marginBottom: 4,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: isDark ? '#FFFFFF' : '#000000',
    },
    timelineDescription: {
        fontSize: 14,
        color: isDark ? '#ABABAB' : '#636366',
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
        color: isDark ? '#38383A' : '#C7C7CC',
    },
    emptyText: {
        fontSize: 17,
        color: isDark ? '#8E8E93' : '#8E8E93',
        textAlign: 'center',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: isDark ? '#636366' : '#AEAEB2',
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
        backgroundColor: '#0A84FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0A84FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: '300',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: isDark ? '#8E8E93' : '#8E8E93',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: isDark ? '#FFFFFF' : '#000000',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    inputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#0A84FF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonSecondary: {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    buttonSecondaryText: {
        color: '#0A84FF',
    },
    matrizContainer: {
        flex: 1,
        backgroundColor: isDark ? '#000' : '#F2F2F7',
    },
    matrizHeader: {
        flexDirection: 'row',
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    matrizHeaderCell: {
        width: 100,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRightWidth: 1,
        borderRightColor: isDark ? '#38383A' : '#E5E5EA',
    },
    matrizHeaderText: {
        fontSize: 11,
        fontWeight: '600',
        color: isDark ? '#8E8E93' : '#8E8E93',
        textAlign: 'center',
    },
    matrizRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#38383A' : '#E5E5EA',
    },
    matrizVariableCell: {
        width: 100,
        paddingVertical: 14,
        paddingHorizontal: 8,
        backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
        justifyContent: 'center',
    },
    matrizVariableText: {
        fontSize: 12,
        color: isDark ? '#FFFFFF' : '#000000',
        fontWeight: '500',
    },
    matrizDataCell: {
        width: 100,
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: isDark ? '#38383A' : '#E5E5EA',
    },
    matrizDataInput: {
        backgroundColor: 'transparent',
        fontSize: 14,
        color: isDark ? '#FFFFFF' : '#000000',
        textAlign: 'center',
        padding: 0,
    },
    matrizFooter: {
        flexDirection: 'row',
        backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
    },
    matrizFooterCell: {
        width: 100,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRightWidth: 1,
        borderRightColor: isDark ? '#38383A' : '#E5E5EA',
    },
    matrizFooterLabel: {
        fontSize: 10,
        color: isDark ? '#8E8E93' : '#8E8E93',
        textAlign: 'center',
    },
    matrizFooterValue: {
        fontSize: 14,
        fontWeight: '600',
        color: isDark ? '#30D158' : '#34C759',
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
