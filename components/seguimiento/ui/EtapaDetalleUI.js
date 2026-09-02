import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../services/theme';
import {
    createSeguimientoStyles,
    TIPO_EVENTO_STYLES,
} from './seguimientoStyles';

export default function EtapaDetalleUI({
    seguimiento,
    etapa,
    eventos = [],
    recomendaciones = [],
    onFinalizarEtapa,
    proyectoId,
}) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const { styles, colors, estadoColors } = createSeguimientoStyles(isDark);

    const handleRegistrarEvento = useCallback(() => {
        router.push({
            pathname: `/proyectos/${proyectoId}/seguimiento/evento`,
            params: {
                seguimientoUuid: seguimiento?.uuid_movil,
                etapaCultivoId: etapa?.id || seguimiento?.etapa_cultivo_id,
            },
        });
    }, [seguimiento, etapa, proyectoId]);

    const handleFinalizarEtapa = useCallback(() => {
        const nombreEtapa = etapa?.nombre || seguimiento?.etapa_nombre || 'esta etapa';
        Alert.alert(
            'Finalizar Etapa',
            `¿Deseas marcar "${nombreEtapa}" como finalizada/completada?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Finalizar',
                    onPress: () => onFinalizarEtapa?.(seguimiento?.uuid_movil),
                },
            ]
        );
    }, [seguimiento, etapa, onFinalizarEtapa]);

    const indicadores = (() => {
        const raw = etapa?.indicadores_clave || seguimiento?.etapa_indicadores;
        if (!raw) return [];
        try {
            return typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
            return [];
        }
    })();

    const estado = seguimiento?.estado || 'pendiente';
    const colorSet = estadoColors[estado] || estadoColors.pendiente;
    const nombre = etapa?.nombre || seguimiento?.etapa_nombre || 'Etapa';
    const orden = etapa?.orden || seguimiento?.etapa_orden;
    const descripcion = etapa?.descripcion || seguimiento?.etapa_descripcion;

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={24}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '500' }}>
                            Etapa {orden || '?'}
                        </Text>
                    </View>
                    <Text style={styles.headerTitle}>{nombre}</Text>
                    {etapa?.duracion_dias_estimada ? (
                        <Text style={styles.headerSubtitle}>
                            Duración estimada: ~{etapa.duracion_dias_estimada} días
                        </Text>
                    ) : null}

                    <View style={[styles.estadoBadge, { backgroundColor: colorSet.bg, marginTop: 10 }]}>
                        <Text style={[styles.estadoBadgeText, { color: colorSet.text }]}>
                            {estado === 'completada' ? '✅ Finalizada / Completada' :
                             estado === 'en_progreso' ? '🔄 En progreso' :
                             estado === 'pendiente' ? '⏳ Pendiente' : '⏭️ Omitida'}
                        </Text>
                    </View>
                </View>

                {/* Fechas de inicio y fin */}
                <View style={styles.detalleCard}>
                    <Text style={styles.detalleSeccionTitulo}>🗓️ Período de la Etapa</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <View>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Fecha de Inicio</Text>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginTop: 2 }}>
                                {seguimiento?.fecha_inicio
                                    ? new Date(seguimiento.fecha_inicio).toLocaleDateString('es-EC')
                                    : 'No iniciada'}
                            </Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Fecha de Fin</Text>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginTop: 2 }}>
                                {seguimiento?.fecha_fin
                                    ? new Date(seguimiento.fecha_fin).toLocaleDateString('es-EC')
                                    : estado === 'en_progreso' ? 'En curso' : 'Pendiente'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Descripción */}
                {descripcion ? (
                    <View style={styles.detalleCard}>
                        <Text style={styles.detalleSeccionTitulo}>📋 Descripción</Text>
                        <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textSecondary }}>
                            {descripcion}
                        </Text>
                    </View>
                ) : null}

                {/* Indicadores Clave */}
                {indicadores.length > 0 ? (
                    <View style={styles.detalleCard}>
                        <Text style={styles.detalleSeccionTitulo}>📌 Indicadores Clave</Text>
                        {indicadores.map((ind, i) => (
                            <View key={i} style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                                <Text style={{ color: '#30D158', fontSize: 14 }}>•</Text>
                                <Text style={{ fontSize: 14, color: colors.textPrimary, flex: 1, lineHeight: 20 }}>
                                    {ind}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Recomendaciones Agronómicas */}
                {recomendaciones.length > 0 ? (
                    <View style={styles.detalleCard}>
                        <Text style={styles.detalleSeccionTitulo}>💡 Recomendaciones Agronómicas</Text>
                        {recomendaciones.map((rec, i) => (
                            <View key={rec.recomendacion_id || i} style={styles.recomendacionItem}>
                                <Text style={styles.recomendacionTitulo}>{rec.titulo}</Text>
                                {rec.tipo ? (
                                    <Text style={styles.recomendacionTipo}>
                                        Tipo: {rec.tipo}
                                    </Text>
                                ) : null}
                                {rec.descripcion ? (
                                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 19 }}>
                                        {rec.descripcion}
                                    </Text>
                                ) : null}
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Historial de eventos ocurridos */}
                <View style={styles.detalleCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={styles.detalleSeccionTitulo}>📅 Eventos y Observaciones</Text>
                        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                            {eventos.length} registrado{eventos.length !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {eventos.length > 0 ? (
                        eventos.map((evento, i) => {
                            const tipoStyle = TIPO_EVENTO_STYLES[evento.tipo_evento] || TIPO_EVENTO_STYLES.observacion;
                            const fechaStr = evento.fecha_evento
                                ? new Date(evento.fecha_evento).toLocaleDateString('es-EC', {
                                      day: 'numeric',
                                      month: 'short',
                                  })
                                : '';

                            return (
                                <View
                                    key={evento.uuid_movil || i}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'flex-start',
                                        paddingVertical: 10,
                                        borderBottomWidth: i < eventos.length - 1 ? StyleSheet.hairlineWidth : 0,
                                        borderBottomColor: colors.separator,
                                        gap: 10,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={tipoStyle.icon}
                                        size={20}
                                        color={tipoStyle.color}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                                            {evento.titulo}
                                        </Text>
                                        {evento.descripcion ? (
                                            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                                                {evento.descripcion}
                                            </Text>
                                        ) : null}
                                        <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>
                                            {fechaStr} · {tipoStyle.label}
                                            {evento.severidad ? ` · Severidad: ${evento.severidad}` : ''}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', paddingVertical: 16 }}>
                            No hay eventos registrados en esta etapa
                        </Text>
                    )}
                </View>

                {/* Botones de acción */}
                {estado === 'en_progreso' ? (
                    <View style={{ marginTop: 8 }}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleRegistrarEvento}>
                            <Text style={styles.primaryButtonText}>📝 Registrar Evento / Avance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dangerButton} onPress={handleFinalizarEtapa}>
                            <Text style={styles.dangerButtonText}>✅ Finalizar Etapa</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}
