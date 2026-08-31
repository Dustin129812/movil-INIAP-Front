import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const ESTADO_COLORS = {
    completada: { bg: '#1C3A2A', text: '#30D158', dot: '#30D158' },
    en_progreso: { bg: '#1A2A3A', text: '#0A84FF', dot: '#0A84FF' },
    pendiente: { bg: '#2C2C2E', text: '#636366', dot: '#48484A' },
    omitida: { bg: '#2C2C2E', text: '#8E8E93', dot: '#636366' },
};

export const ESTADO_COLORS_LIGHT = {
    completada: { bg: '#E8F5E9', text: '#2E7D32', dot: '#30D158' },
    en_progreso: { bg: '#E3F2FD', text: '#1565C0', dot: '#0A84FF' },
    pendiente: { bg: '#F5F5F5', text: '#9E9E9E', dot: '#BDBDBD' },
    omitida: { bg: '#EEEEEE', text: '#9E9E9E', dot: '#BDBDBD' },
};

export const TIPO_EVENTO_STYLES = {
    avance: { icon: 'trending-up', color: '#30D158', label: 'Avance' },
    observacion: { icon: 'eye', color: '#8E8E93', label: 'Observación' },
    incidencia_enfermedad: { icon: 'virus', color: '#FF9500', label: 'Enfermedad' },
    incidencia_plaga: { icon: 'bug', color: '#FF453A', label: 'Plaga' },
    tratamiento_aplicado: { icon: 'medical-bag', color: '#0A84FF', label: 'Tratamiento' },
};

export const SEVERIDAD_COLORS = {
    leve: '#30D158',
    moderada: '#FF9500',
    severa: '#FF453A',
};

export function createSeguimientoStyles(isDark) {
    const colors = {
        background: isDark ? '#000000' : '#F2F2F7',
        cardBg: isDark ? 'rgba(28, 28, 30, 0.85)' : 'rgba(255, 255, 255, 0.92)',
        cardBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        textPrimary: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#8E8E93' : '#6C6C70',
        textTertiary: isDark ? '#636366' : '#8E8E93',
        timelineLine: isDark ? '#38383A' : '#D1D1D6',
        separator: isDark ? '#38383A' : '#E5E5EA',
        inputBg: isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(239, 239, 244, 0.85)',
        accent: '#0A84FF',
        success: '#30D158',
    };

    const estadoColors = isDark ? ESTADO_COLORS : ESTADO_COLORS_LIGHT;

    return {
        colors,
        estadoColors,
        styles: StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: colors.background,
            },
            scrollContent: {
                paddingBottom: 110,
            },
            header: {
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 8,
            },
            headerTitle: {
                fontSize: 26,
                fontWeight: '700',
                color: colors.textPrimary,
            },
            headerSubtitle: {
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 4,
            },

            // Progress Card
            progressCard: {
                marginHorizontal: 16,
                marginTop: 14,
                backgroundColor: colors.cardBg,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 18,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.08,
                shadowRadius: 10,
                elevation: 4,
            },
            progressLabel: {
                fontSize: 13,
                fontWeight: '600',
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
            },
            progressBarTrack: {
                height: 8,
                backgroundColor: isDark ? '#38383A' : '#E5E5EA',
                borderRadius: 4,
                marginTop: 10,
                overflow: 'hidden',
            },
            progressBarFill: {
                height: '100%',
                borderRadius: 4,
                backgroundColor: '#30D158',
            },
            progressText: {
                fontSize: 14,
                fontWeight: '600',
                color: colors.textPrimary,
            },

            // Timeline
            timelineSection: {
                paddingHorizontal: 16,
                marginTop: 20,
            },
            sectionTitle: {
                fontSize: 20,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 14,
            },
            timelineItem: {
                flexDirection: 'row',
                marginBottom: 0,
            },
            timelineLeft: {
                alignItems: 'center',
                width: 36,
            },
            timelineDot: {
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 3,
                zIndex: 1,
            },
            timelineDotActive: {
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 3,
                borderColor: '#0A84FF',
                backgroundColor: 'transparent',
            },
            timelineLine: {
                width: 2,
                flex: 1,
                backgroundColor: colors.timelineLine,
            },
            timelineContent: {
                flex: 1,
                paddingLeft: 10,
                paddingBottom: 20,
            },
            timelineCard: {
                backgroundColor: colors.cardBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.2 : 0.05,
                shadowRadius: 6,
                elevation: 2,
            },
            timelineEtapaName: {
                fontSize: 16,
                fontWeight: '600',
                color: colors.textPrimary,
            },
            timelineEtapaMeta: {
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
            },
            estadoBadge: {
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                alignSelf: 'flex-start',
                marginTop: 8,
            },
            estadoBadgeText: {
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
            },
            eventosPreview: {
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: colors.separator,
            },
            eventoMini: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
                gap: 8,
            },
            eventoMiniText: {
                fontSize: 13,
                color: colors.textSecondary,
                flex: 1,
            },

            // Detalle Etapa
            detalleCard: {
                marginHorizontal: 16,
                marginTop: 12,
                backgroundColor: colors.cardBg,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                padding: 18,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.25 : 0.08,
                shadowRadius: 10,
                elevation: 4,
            },
            detalleSeccionTitulo: {
                fontSize: 15,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 12,
            },
            riesgoItem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.separator,
            },
            riesgoNombre: {
                fontSize: 14,
                color: colors.textPrimary,
                flex: 1,
            },
            riesgoBadge: {
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
            },
            riesgoBadgeText: {
                fontSize: 11,
                fontWeight: '600',
            },
            recomendacionItem: {
                paddingVertical: 10,
                paddingLeft: 12,
                borderLeftWidth: 3,
                borderLeftColor: '#30D158',
                marginBottom: 8,
            },
            recomendacionTitulo: {
                fontSize: 14,
                fontWeight: '600',
                color: colors.textPrimary,
            },
            recomendacionTipo: {
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
            },

            // Formulario Evento
            inputContainer: {
                marginBottom: 18,
            },
            inputLabel: {
                fontSize: 13,
                fontWeight: '600',
                color: colors.textSecondary,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
            },
            input: {
                backgroundColor: colors.inputBg,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: colors.textPrimary,
                borderWidth: 1,
                borderColor: colors.cardBorder,
            },
            textArea: {
                minHeight: 100,
                textAlignVertical: 'top',
            },
            chipRow: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
            },
            chip: {
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                backgroundColor: colors.inputBg,
            },
            chipActive: {
                borderColor: '#0A84FF',
                backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : 'rgba(10, 132, 255, 0.1)',
            },
            chipText: {
                fontSize: 13,
                fontWeight: '500',
                color: colors.textSecondary,
            },
            chipTextActive: {
                color: '#0A84FF',
                fontWeight: '600',
            },

            // Botones
            primaryButton: {
                backgroundColor: '#0A84FF',
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
                marginHorizontal: 16,
                marginTop: 16,
            },
            primaryButtonDisabled: {
                opacity: 0.4,
            },
            primaryButtonText: {
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
            },
            dangerButton: {
                backgroundColor: isDark ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 69, 58, 0.1)',
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
                marginHorizontal: 16,
                marginTop: 8,
                borderWidth: 1,
                borderColor: 'rgba(255, 69, 58, 0.3)',
            },
            dangerButtonText: {
                color: '#FF453A',
                fontSize: 16,
                fontWeight: '600',
            },

            // FAB
            fab: {
                position: 'absolute',
                bottom: 30,
                right: 20,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#0A84FF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#0A84FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
            },

            // Empty State
            emptyContainer: {
                alignItems: 'center',
                paddingVertical: 50,
                paddingHorizontal: 28,
            },
            emptyTitle: {
                fontSize: 19,
                fontWeight: '600',
                color: colors.textPrimary,
                marginTop: 14,
                textAlign: 'center',
            },
            emptySubtitle: {
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 6,
                textAlign: 'center',
                lineHeight: 20,
            },

            // Selector Item (Bottom Sheet)
            selectorItem: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.separator,
                gap: 14,
            },
            selectorItemActive: {
                backgroundColor: isDark ? 'rgba(10, 132, 255, 0.12)' : 'rgba(10, 132, 255, 0.08)',
            },
            selectorNumber: {
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
            },
            selectorNumberText: {
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: '700',
            },
            selectorName: {
                fontSize: 15,
                fontWeight: '500',
                color: colors.textPrimary,
                flex: 1,
            },
            selectorDuration: {
                fontSize: 13,
                color: colors.textSecondary,
            },
        }),
    };
}
