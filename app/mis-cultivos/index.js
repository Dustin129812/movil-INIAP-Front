import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
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
import { eq, and, isNotNull, desc, inArray, or } from 'drizzle-orm';

export default function MisCultivosScreen() {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const { proyectoId } = useLocalSearchParams();
    const [proyectosData, setProyectosData] = useState([]);
    const [proyectoDetalle, setProyectoDetalle] = useState(null);
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
                        isNotNull(proyectos.variedad),
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
                setProyectoDetalle(null);
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

            if (proyectoId && allProyectos.length > 0) {
                const proyecto = allProyectos[0];
                setProyectoDetalle(proyecto);

                if (proyecto.cultivo_id) {
                    const cultivoRows = await db
                        .select()
                        .from(cultivos)
                        .where(eq(cultivos.id, proyecto.cultivo_id));
                    setCultivoInfo(cultivoRows[0] || null);
                } else {
                    setCultivoInfo(null);
                }
            }
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

    const handleProyectoPress = (proyecto) => {
        router.push(`/proyectos/${proyecto.uuid_movil || proyecto.id}`);
    };

    const renderProyectoCard = ({ item }) => (
        <View style={[styles.proyectoCard, { backgroundColor: cardBg }]}>
            <View style={styles.proyectoHeader}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(106,153,78,0.15)' }]}>
                    <MaterialCommunityIcons name="leaf" size={24} color="#6A994E" />
                </View>
                <View style={styles.proyectoInfo}>
                    <Text style={[styles.proyectoNombre, { color: textPrimary }]}>{item.titulo}</Text>
                    <Text style={[styles.variedadTexto, { color: textSecondary }]}>
                        {item.variedad_nombre || item.variedad || 'Sin variedad'}
                        {item.cultivo_nombre ? ` • ${item.cultivo_nombre}` : ''}
                    </Text>
                </View>
                <View style={styles.estadoBadge}>
                    <Text style={[styles.estadoTexto, {
                        color: item.estado === 'activo' ? '#34C759' : item.estado === 'pendiente' ? '#FF9500' : '#8E8E93'
                    }]}>
                        {item.estado || 'activo'}
                    </Text>
                </View>
            </View>

            {item.descripcion && (
                <Text style={[styles.descripcion, { color: textSecondary }]} numberOfLines={2}>
                    {item.descripcion}
                </Text>
            )}

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

            <Text style={[styles.lotesLabel, { color: textSecondary }]}>
                Lotes ({item.lotes?.length || 0})
            </Text>
            {item.lotes && item.lotes.length > 0 ? (
                <View style={styles.lotesContainer}>
                    {item.lotes.map((lote, index) => (
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
            ) : (
                <Text style={[styles.sinLotes, { color: textSecondary }]}>
                    Sin lotes asociados
                </Text>
            )}

            <View style={styles.infoRow}>
                {item.fecha_siembra && (
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="calendar" size={14} color={textSecondary} />
                        <Text style={[styles.infoText, { color: textSecondary }]}>
                            Siembra: {new Date(item.fecha_siembra).toLocaleDateString('es-EC')}
                        </Text>
                    </View>
                )}
                {item.tipo_ensayo && (
                    <View style={styles.infoItem}>
                        <MaterialCommunityIcons name="test-tube" size={14} color={textSecondary} />
                        <Text style={[styles.infoText, { color: textSecondary }]}>
                            {item.tipo_ensayo}
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={styles.verButton}
                onPress={() => handleProyectoPress(item)}
            >
                <Text style={styles.verButtonText}>Ver Proyecto</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#34C759" />
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="leaf-off" size={64} color={textSecondary} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>Sin cultivos registrados</Text>
            <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                Los proyectos con variedades aparecerán aquí
            </Text>
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
                {proyectoId ? (
                    <>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: textPrimary }]}>Seguimiento del Proyecto</Text>
                        <View style={styles.headerSpacer} />
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: textPrimary }]}>Seguimiento</Text>
                        <View style={styles.headerSpacer} />
                    </>
                )}
            </View>

            {proyectoId ? (
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
                    {proyectoDetalle && (
                        <>
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
                                        <Text style={[styles.proyectoNombre, { color: textPrimary }]}>{proyectoDetalle.titulo}</Text>
                                        <Text style={[styles.variedadTexto, { color: textSecondary }]}>
                                            {proyectoDetalle.variedad_nombre || proyectoDetalle.variedad || 'Sin variedad'}
                                        </Text>
                                    </View>
                                    <View style={[styles.estadoBadge, {
                                        backgroundColor: proyectoDetalle.estado === 'activo' ? 'rgba(52,199,89,0.15)' : proyectoDetalle.estado === 'pendiente' ? 'rgba(255,149,0,0.15)' : 'rgba(142,142,147,0.15)'
                                    }]}>
                                        <Text style={[styles.estadoTexto, {
                                            color: proyectoDetalle.estado === 'activo' ? '#34C759' : proyectoDetalle.estado === 'pendiente' ? '#FF9500' : '#8E8E93'
                                        }]}>
                                            {proyectoDetalle.estado || 'activo'}
                                        </Text>
                                    </View>
                                </View>

                                {proyectoDetalle.descripcion && (
                                    <Text style={[styles.descripcion, { color: textSecondary }]}>
                                        {proyectoDetalle.descripcion}
                                    </Text>
                                )}

                                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

                                <View style={styles.infoRow}>
                                    {proyectoDetalle.fecha_siembra && (
                                        <View style={styles.infoItem}>
                                            <MaterialCommunityIcons name="calendar" size={14} color={textSecondary} />
                                            <Text style={[styles.infoText, { color: textSecondary }]}>
                                                Siembra: {new Date(proyectoDetalle.fecha_siembra).toLocaleDateString('es-EC')}
                                            </Text>
                                        </View>
                                    )}
                                    {proyectoDetalle.tipo_ensayo && (
                                        <View style={styles.infoItem}>
                                            <MaterialCommunityIcons name="test-tube" size={14} color={textSecondary} />
                                            <Text style={[styles.infoText, { color: textSecondary }]}>
                                                {proyectoDetalle.tipo_ensayo}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {cultivoInfo && (
                                <View style={[styles.proyectoCard, { backgroundColor: cardBg }]}>
                                    <Text style={[styles.lotesLabel, { color: textSecondary }]}>Cultivo</Text>
                                    <Text style={[styles.cultivoNombreGrande, { color: textPrimary }]}>{cultivoInfo.nombre}</Text>
                                    {cultivoInfo.nombre_cientifico && (
                                        <Text style={[styles.cultivoCientifico, { color: textSecondary }]}>
                                            {cultivoInfo.nombre_cientifico}
                                        </Text>
                                    )}
                                    {cultivoInfo.descripcion && (
                                        <Text style={[styles.descripcion, { color: textSecondary, marginTop: 8 }]}>
                                            {cultivoInfo.descripcion}
                                        </Text>
                                    )}
                                </View>
                            )}

                            <View style={[styles.proyectoCard, { backgroundColor: cardBg }]}>
                                <Text style={[styles.lotesLabel, { color: textSecondary }]}>
                                    Lotes ({proyectoDetalle.lotes?.length || 0})
                                </Text>
                                {proyectoDetalle.lotes && proyectoDetalle.lotes.length > 0 ? (
                                    <View style={styles.lotesContainer}>
                                        {proyectoDetalle.lotes.map((lote, index) => (
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
                                ) : (
                                    <Text style={[styles.sinLotes, { color: textSecondary }]}>
                                        Sin lotes asociados
                                    </Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.verButton}
                                onPress={() => router.push(`/proyectos/${proyectoDetalle.uuid_movil || proyectoDetalle.id}`)}
                            >
                                <Text style={styles.verButtonText}>Ver Proyecto</Text>
                                <MaterialCommunityIcons name="chevron-right" size={18} color="#34C759" />
                            </TouchableOpacity>
                        </>
                    )}
                    {!proyectoDetalle && !isLoading && renderEmpty()}
                </ScrollView>
            ) : (
                <FlatList
                    data={proyectosData}
                    keyExtractor={(item) => item.uuid_movil || item.id?.toString()}
                    renderItem={renderProyectoCard}
                    contentContainerStyle={[
                        styles.listContent,
                        proyectosData.length === 0 && styles.emptyList
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#6A994E"
                        />
                    }
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    listContent: { padding: 16, gap: 16 },
    emptyList: { flex: 1 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },

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
    sinLotes: { fontSize: 13, fontStyle: 'italic' },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoText: { fontSize: 12 },
    verButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 4, paddingVertical: 10,
    },
    verButtonText: { color: '#34C759', fontSize: 14, fontWeight: '700' },

    detalleContent: { padding: 16, paddingBottom: 60 },
    etapaTag: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    etapaNumero: {
        width: 22, height: 22, borderRadius: 11, backgroundColor: '#6A994E',
        justifyContent: 'center', alignItems: 'center',
    },
    etapaNumeroText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
    etapaTagText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: '#6A994E' },
    cultivoNombreGrande: { fontSize: 19, fontWeight: '800', marginTop: 4 },
    cultivoCientifico: { fontSize: 13, fontStyle: 'italic', marginTop: 2 },
});