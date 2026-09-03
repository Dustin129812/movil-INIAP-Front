import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../services/theme';
import { db } from '../../db/client';
import { proyectos, lotes, proyecto_lotes, cultivos } from '../../db/schema';
import { eq, and, isNotNull, desc } from 'drizzle-orm';

export default function MisCultivosScreen() {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const { proyectoId } = useLocalSearchParams();
    const [proyectosData, setProyectosData] = useState([]);
    const [cultivoInfo, setCultivoInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const bg = isDark ? '#000000' : '#F2F2F7';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#8E8E93' : '#6E6E73';
    const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';

    const cargarMisCultivos = useCallback(async () => {
        try {
            let proyectosRows;

            if (proyectoId) {
                proyectosRows = await db
                    .select()
                    .from(proyectos)
                    .where(and(
                        eq(proyectos.sync_status, 'synced'),
                        eq(proyectos.uuid_movil, proyectoId)
                    ))
                    .orderBy(desc(proyectos.created_at));
            } else {
                proyectosRows = await db
                    .select()
                    .from(proyectos)
                    .where(and(
                        eq(proyectos.sync_status, 'synced'),
                        isNotNull(proyectos.variedad)
                    ))
                    .orderBy(desc(proyectos.created_at));
            }

            if (proyectosRows.length === 0) {
                setProyectosData([]);
                setIsLoading(false);
                return;
            }

            const allLotes = await db.select().from(lotes);
            const proyectoLotesRows = await db.select().from(proyecto_lotes);

            const lotesPorProyecto = {};
            proyectoLotesRows.forEach(pl => {
                if (!lotesPorProyecto[pl.proyecto_uuid]) {
                    lotesPorProyecto[pl.proyecto_uuid] = [];
                }
                const lote = allLotes.find(l => l.uuid_movil === pl.lote_uuid);
                if (lote) {
                    lotesPorProyecto[pl.proyecto_uuid].push(lote);
                }
            });

            const allProyectos = proyectosRows.map(p => {
                const lotesDelProyecto = lotesPorProyecto[p.uuid_movil] || [];
                if (lotesDelProyecto.length === 0 && p.lote_uuid) {
                    const loteDirecto = allLotes.find(l => l.uuid_movil === p.lote_uuid);
                    if (loteDirecto) {
                        lotesDelProyecto.push(loteDirecto);
                    }
                }
                return {
                    ...p,
                    lotes: lotesDelProyecto,
                };
            });

            setProyectosData(allProyectos);
        } catch (error) {
            // console removed
        } finally {
            setIsLoading(false);
        }
    }, [proyectoId]);

    useEffect(() => {
        cargarMisCultivos();
    }, [cargarMisCultivos]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await cargarMisCultivos();
        setIsRefreshing(false);
    };

    const renderProyectoDetalle = (proyecto) => (
        <View key={proyecto.uuid_movil || proyecto.id}>
            <View style={styles.etapaTag}>
                <View style={styles.etapaNumero}>
                    <Text style={styles.etapaNumeroText}>1</Text>
                </View>
                <Text style={styles.etapaTagText}>ETAPA 1 · INFORMATIVO</Text>
            </View>

            <View style={[styles.proyectoCard, { backgroundColor: cardBg }]}>
                <View style={styles.proyectoHeader}>
                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(106,153,78,0.15)' }]}>
                        <MaterialCommunityIcons name="leaf" size={24} color="#6A994E" />
                    </View>
                    <View style={styles.proyectoInfo}>
                        <Text style={[styles.proyectoNombre, { color: textPrimary }]}>{proyecto.titulo}</Text>
                        <Text style={[styles.variedadTexto, { color: textSecondary }]}>
                            {proyecto.variedad_nombre || proyecto.variedad || 'Sin variedad'}
                        </Text>
                    </View>
                    <View style={[styles.estadoBadge, {
                        backgroundColor: proyecto.estado === 'activo' ? 'rgba(52,199,89,0.15)' : proyecto.estado === 'pendiente' ? 'rgba(255,149,0,0.15)' : 'rgba(142,142,147,0.15)'
                    }]}>
                        <Text style={[styles.estadoTexto, {
                            color: proyecto.estado === 'activo' ? '#34C759' : proyecto.estado === 'pendiente' ? '#FF9500' : '#8E8E93'
                        }]}>
                            {proyecto.estado || 'activo'}
                        </Text>
                    </View>
                </View>

                {proyecto.descripcion && (
                    <Text style={[styles.descripcion, { color: textSecondary }]}>
                        {proyecto.descripcion}
                    </Text>
                )}

                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

                <View style={styles.infoRow}>
                    {proyecto.fecha_siembra && (
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="calendar" size={14} color={textSecondary} />
                            <Text style={[styles.infoText, { color: textSecondary }]}>
                                Siembra: {new Date(proyecto.fecha_siembra).toLocaleDateString('es-EC')}
                            </Text>
                        </View>
                    )}
                    {proyecto.tipo_ensayo && (
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="test-tube" size={14} color={textSecondary} />
                            <Text style={[styles.infoText, { color: textSecondary }]}>
                                {proyecto.tipo_ensayo}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {proyecto.lotes && proyecto.lotes.length > 0 && (
                <View style={[styles.proyectoCard, { backgroundColor: cardBg }]}>
                    <Text style={[styles.lotesLabel, { color: textSecondary }]}>
                        Lotes ({proyecto.lotes.length})
                    </Text>
                    <View style={styles.lotesContainer}>
                        {proyecto.lotes.map((lote, index) => (
                            <View
                                key={lote.uuid_movil || index}
                                style={[styles.loteChip, isDark && styles.loteChipDark]}
                            >
                                <MaterialCommunityIcons name="map-marker-radius" size={12} color="#34C759" />
                                <Text style={[styles.loteChipText, { color: textPrimary }]} numberOfLines={1}>
                                    {lote.nombre_lote}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[styles.verButton, { backgroundColor: 'rgba(10,132,255,0.12)', borderColor: 'rgba(10,132,255,0.3)', borderWidth: 1, marginTop: 12 }]}
                onPress={() => router.push(`/mis-cultivos?proyectoId=${proyecto.uuid_movil}`)}
                activeOpacity={0.7}
            >
                <MaterialCommunityIcons name="timeline-clock" size={20} color="#0A84FF" />
                <Text style={[styles.verButtonText, { color: '#0A84FF', fontWeight: '700' }]}>
                    Línea de Tiempo y Etapas
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#0A84FF" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.verButton}
                onPress={() => router.push(`/proyectos/${proyecto.uuid_movil || proyecto.id}`)}
            >
                <Text style={styles.verButtonText}>Ver Proyecto</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#34C759" />
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: bg }]}>
                <ActivityIndicator size="large" color="#6A994E" style={styles.loader} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textPrimary }]}>
                    {proyectoId ? 'Seguimiento del Proyecto' : 'Seguimiento'}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.detalleContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#6A994E"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {proyectosData.map(renderProyectoDetalle)}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: { padding: 8 },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSpacer: { width: 40 },
    loader: { marginTop: 100 },
    detalleContent: { padding: 16, paddingBottom: 60, gap: 0 },
    proyectoCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
    proyectoHeader: { flexDirection: 'row', alignItems: 'center' },
    iconWrap: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    proyectoInfo: { flex: 1, marginLeft: 12 },
    proyectoNombre: { fontSize: 17, fontWeight: '700' },
    variedadTexto: { fontSize: 13, marginTop: 2 },
    estadoBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    estadoTexto: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    descripcion: { fontSize: 13, lineHeight: 19, marginTop: 12 },
    divider: { height: 1, marginVertical: 12 },
    lotesLabel: {
        fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: 0.5, marginBottom: 8,
    },
    lotesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    loteChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(52,199,89,0.12)',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    },
    loteChipDark: { backgroundColor: 'rgba(52,199,89,0.18)' },
    loteChipText: { fontSize: 12, fontWeight: '600', maxWidth: 140 },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoText: { fontSize: 12 },
    verButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 4, paddingVertical: 10,
    },
    verButtonText: { color: '#34C759', fontSize: 14, fontWeight: '700' },
    etapaTag: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    etapaNumero: {
        width: 22, height: 22, borderRadius: 11, backgroundColor: '#6A994E',
        justifyContent: 'center', alignItems: 'center',
    },
    etapaNumeroText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
    etapaTagText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: '#6A994E' },
});
