import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ColaboradoresModal from './ColaboradoresModal';
import { proyectosStyles } from './proyectosStyles';

const InfoItem = ({ icon, label, value }) => (
    <View style={[proyectosStyles.cardInfoItem, styles.customCardInfoItem]}>
        <MaterialCommunityIcons name={icon} size={16} color="#00875A" />
        <View>
            <Text style={proyectosStyles.cardInfoLabel}>{label}</Text>
            <Text style={[proyectosStyles.cardInfoValue, styles.textDark]}>{value || 'No especificado'}</Text>
        </View>
    </View>
);

const TimelineItem = ({ visita, index }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <View style={[proyectosStyles.timelineItem, styles.customCard]}>
            <View style={proyectosStyles.timelineDot} />
            <Text style={proyectosStyles.timelineDate}>{formatDate(visita.fecha_visita)}</Text>
            <Text style={[proyectosStyles.timelineTitle, styles.textDark]}>
                {visita.tecnico_nombre || 'Visita técnica'}
            </Text>
            {visita.observaciones && (
                <Text style={[proyectosStyles.timelineDescription, styles.textSecondary]} numberOfLines={2}>
                    {visita.observaciones}
                </Text>
            )}
            {visita.recomendaciones && (
                <View style={{ marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#30D158' }}>
                    <Text style={{ fontSize: 12, color: '#30D158', fontWeight: '600' }}>Recomendaciones</Text>
                    <Text style={[proyectosStyles.timelineDescription, styles.textSecondary]} numberOfLines={2}>
                        {visita.recomendaciones}
                    </Text>
                </View>
            )}
        </View>
    );
};

const EmptyTimeline = () => (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#C7C7CC" />
        <Text style={{ color: '#8E8E93', fontSize: 15, marginTop: 12, textAlign: 'center' }}>
            No hay visitas registradas
        </Text>
        <Text style={{ color: '#AEAEB2', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
            Agrega la primera visita de seguimiento
        </Text>
    </View>
);

export default function ProyectoDetalleUI({
    proyecto,
    visitas = [],
    isLoading = false,
}) {
    const [mostrarModalColaboradores, setMostrarModalColaboradores] = useState(false);

    const handleNuevaVisita = useCallback(() => {
        router.push(`/proyectos/${proyecto?.uuid_movil || proyecto?.id}/visita`);
    }, [proyecto]);

    const handleVerMatriz = useCallback((visitaId) => {
        router.push(`/proyectos/${proyecto?.uuid_movil || proyecto?.id}/matriz?visita=${visitaId}`);
    }, [proyecto]);

    const handleColaboradores = useCallback(() => {
        setMostrarModalColaboradores(true);
    }, []);

    if (isLoading) {
        return (
            <View style={[proyectosStyles.container, styles.centered, styles.screenBackground]}>
                <ActivityIndicator size="large" color="#00875A" />
            </View>
        );
    }

    if (!proyecto) {
        return (
            <View style={[proyectosStyles.container, styles.centered, styles.screenBackground]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FF3B30" />
                <Text style={{ color: '#8E8E93', fontSize: 17, marginTop: 16 }}>
                    No se pudo cargar el proyecto
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={[proyectosStyles.container, styles.screenBackground]} showsVerticalScrollIndicator={false}>
            <View style={proyectosStyles.header}>
                <Text style={[proyectosStyles.headerTitle, styles.textDark]}>{proyecto.titulo}</Text>
                {proyecto.descripcion && (
                    <Text style={[proyectosStyles.headerSubtitle, styles.textSecondary, { marginTop: 8 }]}>
                        {proyecto.descripcion}
                    </Text>
                )}
            </View>

            <View style={[proyectosStyles.card, styles.customCard]}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Información del Proyecto
                </Text>

                <View style={styles.infoGrid}>
                    <InfoItem icon="seed" label="Variedad" value={proyecto.variedad} />
                    <InfoItem icon="calendar" label="Fecha Siembra" value={proyecto.fecha_siembra ? new Date(proyecto.fecha_siembra).toLocaleDateString('es-EC') : null} />
                    <InfoItem icon="test-tube" label="Tipo Ensayo" value={proyecto.tipo_ensayo} />
                    <InfoItem icon="cash" label="Financiamiento" value={proyecto.financiamiento} />
                    <InfoItem icon="account-group" label="Colaborador" value={proyecto.colaborador_nombre} />
                    <InfoItem icon="phone" label="Contacto" value={proyecto.colaborador_celular} />
                </View>

                {proyecto.tipo_acolchado && (
                    <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E5EA' }}>
                        <Text style={{ fontSize: 13, color: '#8E8E93' }}>
                            <Text style={{ fontWeight: '600', color: '#1C1C1E' }}>Acolchado: </Text>
                            {proyecto.tipo_acolchado}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.visitasSection}>
                <View style={styles.visitasSectionHeader}>
                    <Text style={[styles.sectionTitle, styles.textDark]}>Visitas de Seguimiento</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleNuevaVisita}>
                        <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Nueva</Text>
                    </TouchableOpacity>
                </View>

                {visitas.length > 0 ? (
                    <View style={proyectosStyles.timelineContainer}>
                        {visitas.map((visita, index) => (
                            <TimelineItem key={visita.uuid_movil || visita.id || index} visita={visita} index={index} />
                        ))}
                    </View>
                ) : (
                    <EmptyTimeline />
                )}
            </View>

            <View style={{ height: 40 }} />

            <ColaboradoresModal
                visible={mostrarModalColaboradores}
                onClose={() => setMostrarModalColaboradores(false)}
                proyectoId={proyecto?.id}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screenBackground: {
        backgroundColor: '#FAF6EE',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    customCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: { ios: 0.05, android: 0.1 }[0],
        shadowRadius: 8,
        elevation: 2,
    },
    customCardInfoItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 10,
    },
    textDark: {
        color: '#1C1C1E',
    },
    textSecondary: {
        color: '#636366',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    visitasSection: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    visitasSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00875A',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});