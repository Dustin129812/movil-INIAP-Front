import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { proyectosStyles } from './proyectosStyles';
import ColaboradoresModal from './ColaboradoresModal';

const InfoItem = ({ icon, label, value }) => (
    <View style={proyectosStyles.cardInfoItem}>
        <MaterialCommunityIcons name={icon} size={16} color="#8E8E93" />
        <View>
            <Text style={proyectosStyles.cardInfoLabel}>{label}</Text>
            <Text style={proyectosStyles.cardInfoValue}>{value || 'No especificado'}</Text>
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
        <View style={proyectosStyles.timelineItem}>
            <View style={proyectosStyles.timelineDot} />
            <Text style={proyectosStyles.timelineDate}>{formatDate(visita.fecha_visita)}</Text>
            <Text style={proyectosStyles.timelineTitle}>
                {visita.tecnico_nombre || 'Visita técnica'}
            </Text>
            {visita.observaciones && (
                <Text style={proyectosStyles.timelineDescription} numberOfLines={2}>
                    {visita.observaciones}
                </Text>
            )}
            {visita.recomendaciones && (
                <View style={{ marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#30D158' }}>
                    <Text style={{ fontSize: 12, color: '#30D158', fontWeight: '600' }}>Recomendaciones</Text>
                    <Text style={proyectosStyles.timelineDescription} numberOfLines={2}>
                        {visita.recomendaciones}
                    </Text>
                </View>
            )}
        </View>
    );
};

const EmptyTimeline = () => (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#38383A" />
        <Text style={{ color: '#636366', fontSize: 15, marginTop: 12, textAlign: 'center' }}>
            No hay visitas registradas
        </Text>
        <Text style={{ color: '#48484A', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
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
            <View style={[proyectosStyles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#0A84FF" />
            </View>
        );
    }

    if (!proyecto) {
        return (
            <View style={[proyectosStyles.container, styles.centered]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FF453A" />
                <Text style={{ color: '#8E8E93', fontSize: 17, marginTop: 16 }}>
                    No se pudo cargar el proyecto
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={proyectosStyles.container} showsVerticalScrollIndicator={false}>
            <View style={proyectosStyles.header}>
                <Text style={proyectosStyles.headerTitle}>{proyecto.titulo}</Text>
                {proyecto.descripcion && (
                    <Text style={[proyectosStyles.headerSubtitle, { marginTop: 8 }]}>
                        {proyecto.descripcion}
                    </Text>
                )}
            </View>

            <View style={proyectosStyles.card}>
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
                    <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#38383A' }}>
                        <Text style={{ fontSize: 13, color: '#8E8E93' }}>
                            <Text style={{ fontWeight: '600' }}>Acolchado: </Text>
                            {proyecto.tipo_acolchado}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.card}>
                <View style={styles.visitasSectionHeader}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Colaboradores
                    </Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleColaboradores}>
                        <MaterialCommunityIcons name="account-group" size={20} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Gestionar</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 14, color: '#8E8E93' }}>
                    Agrega colaboradores para compartir este proyecto
                </Text>
            </View>

            <View style={styles.visitasSection}>
                <View style={styles.visitasSectionHeader}>
                    <Text style={styles.sectionTitle}>Visitas de Seguimiento</Text>
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
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
        color: '#FFFFFF',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A84FF',
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
