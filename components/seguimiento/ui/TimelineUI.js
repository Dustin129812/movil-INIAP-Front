import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../services/theme';
import { createSeguimientoStyles, TIPO_EVENTO_STYLES } from './seguimientoStyles';

const ProgressBar = ({ completadas, total, isDark }) => {
    const progress = total > 0 ? completadas / total : 0;
    const { styles } = createSeguimientoStyles(isDark);

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.progressLabel}>Progreso del cultivo</Text>
                <Text style={styles.progressText}>
                    {completadas}/{total} etapas ({Math.round(progress * 100)}%)
                </Text>
            </View>
            <View style={styles.progressBarTrack}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${Math.min(100, Math.round(progress * 100))}%` },
                    ]}
                />
            </View>
        </View>
    );
};

const TimelineNode = ({ seguimiento, etapa, isLast, onPress, isDark }) => {
    const { styles, estadoColors } = createSeguimientoStyles(isDark);
    const estado = seguimiento?.estado || 'pendiente';
    const colorSet = estadoColors[estado] || estadoColors.pendiente;
    const eventos = seguimiento?.eventos || [];

    const calcDias = () => {
        if (!seguimiento?.fecha_inicio) return null;
        const inicio = new Date(seguimiento.fecha_inicio);
        const fin = seguimiento.fecha_fin ? new Date(seguimiento.fecha_fin) : new Date();
        const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff : 0;
    };

    const dias = calcDias();
    const estadoLabel = {
        completada: 'Completada',
        en_progreso: 'En progreso',
        pendiente: 'Pendiente',
        omitida: 'Omitida',
    };

    return (
        <TouchableOpacity
            style={styles.timelineItem}
            onPress={() => onPress?.(seguimiento, etapa)}
            activeOpacity={0.7}
        >
            <View style={styles.timelineLeft}>
                <View
                    style={[
                        estado === 'en_progreso' ? styles.timelineDotActive : styles.timelineDot,
                        {
                            backgroundColor: estado === 'en_progreso' ? 'transparent' : colorSet.dot,
                            borderColor: colorSet.dot,
                        },
                    ]}
                />
                {!isLast && <View style={styles.timelineLine} />}
            </View>

            <View style={styles.timelineContent}>
                <View style={styles.timelineCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.timelineEtapaName}>
                                {etapa?.nombre || seguimiento?.etapa_nombre || 'Etapa'}
                            </Text>
                            <Text style={styles.timelineEtapaMeta}>
                                Etapa {etapa?.orden || seguimiento?.etapa_orden || '?'}
                                {dias != null ? ` · ${dias} día${dias !== 1 ? 's' : ''}` : ''}
                                {etapa?.duracion_dias_estimada
                                    ? ` (est. ~${etapa.duracion_dias_estimada}d)`
                                    : ''}
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={isDark ? '#636366' : '#C7C7CC'}
                        />
                    </View>

                    <View style={[styles.estadoBadge, { backgroundColor: colorSet.bg }]}>
                        <Text style={[styles.estadoBadgeText, { color: colorSet.text }]}>
                            {estadoLabel[estado] || estado}
                        </Text>
                    </View>

                    {eventos.length > 0 && (
                        <View style={styles.eventosPreview}>
                            {eventos.slice(0, 3).map((evento, i) => {
                                const tipoStyle = TIPO_EVENTO_STYLES[evento.tipo_evento] || TIPO_EVENTO_STYLES.observacion;
                                return (
                                    <View key={evento.uuid_movil || i} style={styles.eventoMini}>
                                        <MaterialCommunityIcons
                                            name={tipoStyle.icon}
                                            size={14}
                                            color={tipoStyle.color}
                                        />
                                        <Text style={styles.eventoMiniText} numberOfLines={1}>
                                            {evento.titulo}
                                        </Text>
                                    </View>
                                );
                            })}
                            {eventos.length > 3 && (
                                <Text style={[styles.eventoMiniText, { fontStyle: 'italic' }]}>
                                    +{eventos.length - 3} evento{eventos.length - 3 !== 1 ? 's' : ''} más
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const EmptySeguimiento = ({ onIniciar, isDark }) => {
    const { styles } = createSeguimientoStyles(isDark);
    return (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
                name="sprout"
                size={64}
                color={isDark ? '#48484A' : '#C7C7CC'}
            />
            <Text style={styles.emptyTitle}>Sin seguimiento iniciado</Text>
            <Text style={styles.emptySubtitle}>
                Inicia el seguimiento para registrar avances y eventos en cada etapa del cultivo.
            </Text>
            <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 22, paddingHorizontal: 32 }]}
                onPress={onIniciar}
            >
                <Text style={styles.primaryButtonText}>Iniciar Seguimiento</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function TimelineUI({
    etapas = [],
    seguimientos = [],
    resumen,
    isLoading = false,
    proyecto,
    onIniciarSeguimiento,
    onRefresh,
}) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const { styles, colors } = createSeguimientoStyles(isDark);
    const bottomSheetRef = useRef(null);
    const [etapaSeleccionada, setEtapaSeleccionada] = useState(null);
    const snapPoints = useMemo(() => ['55%'], []);

    const handleEtapaPress = useCallback((seguimiento, etapa) => {
        if (!seguimiento?.uuid_movil) return;
        const id = proyecto?.uuid_movil || proyecto?.id;
        router.push({
            pathname: `/proyectos/${id}/seguimiento/etapa`,
            params: {
                seguimientoUuid: seguimiento.uuid_movil,
                etapaCultivoId: seguimiento.etapa_cultivo_id || etapa?.id,
            },
        });
    }, [proyecto]);

    const handleRegistrarEvento = useCallback(() => {
        const enProgreso = seguimientos.find((s) => s.estado === 'en_progreso');
        const activo = enProgreso || seguimientos[seguimientos.length - 1];
        if (!activo) return;
        const id = proyecto?.uuid_movil || proyecto?.id;
        router.push({
            pathname: `/proyectos/${id}/seguimiento/evento`,
            params: {
                seguimientoUuid: activo.uuid_movil,
                etapaCultivoId: activo.etapa_cultivo_id,
            },
        });
    }, [seguimientos, proyecto]);

    const handleAbrirIniciar = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    const handleSeleccionarEtapa = useCallback((etapa) => {
        setEtapaSeleccionada(etapa);
    }, []);

    const handleConfirmarInicio = useCallback(async () => {
        if (!etapaSeleccionada) return;
        bottomSheetRef.current?.close();
        await onIniciarSeguimiento(etapaSeleccionada.id);
        setEtapaSeleccionada(null);
    }, [etapaSeleccionada, onIniciarSeguimiento]);

    const renderBackdrop = useCallback(
        (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
        []
    );

    const timelineData = useMemo(() => {
        if (seguimientos.length > 0) {
            return seguimientos.map((seg) => {
                const etapa = etapas.find((e) => e.id === seg.etapa_cultivo_id);
                return { seguimiento: seg, etapa };
            });
        }
        return [];
    }, [etapas, seguimientos]);

    const tieneEnProgreso = seguimientos.some((s) => s.estado === 'en_progreso');

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0A84FF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={onRefresh}
                        tintColor="#0A84FF"
                    />
                }
            >
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                            <MaterialCommunityIcons
                                name="arrow-left"
                                size={24}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Seguimiento</Text>
                            <Text style={styles.headerSubtitle} numberOfLines={1}>
                                {proyecto?.titulo || 'Proyecto'}
                                {proyecto?.variedad ? ` · ${proyecto.variedad}` : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                {seguimientos.length > 0 && resumen && (
                    <View style={styles.progressCard}>
                        <ProgressBar
                            completadas={resumen.completadas}
                            total={resumen.total}
                            isDark={isDark}
                        />
                    </View>
                )}

                <View style={styles.timelineSection}>
                    <Text style={styles.sectionTitle}>Línea de Tiempo</Text>

                    {timelineData.length > 0 ? (
                        timelineData.map((item, index) => (
                            <TimelineNode
                                key={item.seguimiento.uuid_movil || index}
                                seguimiento={item.seguimiento}
                                etapa={item.etapa}
                                isLast={index === timelineData.length - 1}
                                onPress={handleEtapaPress}
                                isDark={isDark}
                            />
                        ))
                    ) : (
                        <EmptySeguimiento onIniciar={handleAbrirIniciar} isDark={isDark} />
                    )}
                </View>

                {seguimientos.length > 0 && (
                    <TouchableOpacity
                        style={[styles.primaryButton, { marginBottom: 12 }]}
                        onPress={handleAbrirIniciar}
                    >
                        <Text style={styles.primaryButtonText}>+ Iniciar Nueva Etapa</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {tieneEnProgreso && (
                <TouchableOpacity style={styles.fab} onPress={handleRegistrarEvento}>
                    <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {/* Bottom Sheet: Seleccionar Etapa para Iniciar */}
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: colors.cardBg }}
                handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
            >
                <BottomSheetView style={{ flex: 1, paddingBottom: 20 }}>
                    <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
                        <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>
                            Seleccionar Etapa
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                            Selecciona en qué etapa se encuentra actualmente la plantación
                        </Text>
                    </View>

                    <ScrollView style={{ flex: 1 }}>
                        {etapas.map((etapa) => {
                            const yaIniciada = seguimientos.some(
                                (s) => s.etapa_cultivo_id === etapa.id
                            );
                            const isSelected = etapaSeleccionada?.id === etapa.id;

                            return (
                                <TouchableOpacity
                                    key={etapa.id}
                                    style={[
                                        styles.selectorItem,
                                        isSelected && styles.selectorItemActive,
                                    ]}
                                    onPress={() => !yaIniciada && handleSeleccionarEtapa(etapa)}
                                    disabled={yaIniciada}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.selectorNumber,
                                        yaIniciada && { backgroundColor: '#30D158' },
                                    ]}>
                                        {yaIniciada ? (
                                            <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                                        ) : (
                                            <Text style={styles.selectorNumberText}>{etapa.orden}</Text>
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.selectorName,
                                        yaIniciada && { color: colors.textTertiary },
                                    ]}>
                                        {etapa.nombre}
                                    </Text>
                                    {etapa.duracion_dias_estimada ? (
                                        <Text style={styles.selectorDuration}>
                                            ~{etapa.duracion_dias_estimada}d
                                        </Text>
                                    ) : null}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {etapaSeleccionada && (
                        <TouchableOpacity
                            style={[styles.primaryButton, { marginVertical: 10 }]}
                            onPress={handleConfirmarInicio}
                        >
                            <Text style={styles.primaryButtonText}>
                                Iniciar en: {etapaSeleccionada.nombre}
                            </Text>
                        </TouchableOpacity>
                    )}
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}
