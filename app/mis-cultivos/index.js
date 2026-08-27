import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../services/theme';
import { db } from '../../db/client';
import { proyectos, lotes, proyecto_lotes } from '../../db/schema';
import { eq, and, isNotNull, desc, inArray, or } from 'drizzle-orm';

export default function MisCultivosScreen() {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const { proyectoId } = useLocalSearchParams();
    const [proyectosData, setProyectosData] = useState([]);
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
                // Filter by specific proyectoId
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
                // Get all synced proyectos with variety info
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

            // Get all lotes for reference
            const allLotes = await db.select().from(lotes);

            // Get proyecto-lotes relationships
            const proyectoLotesRows = await db.select().from(proyecto_lotes);

            // Build a map of proyecto_uuid -> array of lotes
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

            // Also check if proyecto has lote_uuid directly (legacy)
            const allProyectos = proyectosRows.map(p => {
                const lotesDelProyecto = lotesPorProyecto[p.uuid_movil] || [];
                // If no lotes from pivot, try to find by lote_uuid
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
    }, []);

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
            {/* Header con cultivo/variedad */}
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

            {/* Descripción */}
            {item.descripcion && (
                <Text style={[styles.descripcion, { color: textSecondary }]} numberOfLines={2}>
                    {item.descripcion}
                </Text>
            )}

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />

            {/* Lotes asociados */}
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

            {/* Info adicional */}
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

            {/* Botón ver proyecto */}
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
                        <Text style={[styles.headerTitle, { color: textPrimary }]}>Cultivo del Proyecto</Text>
                        <View style={styles.headerSpacer} />
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: textPrimary }]}>Mis Cultivos</Text>
                        <View style={styles.headerSpacer} />
                    </>
                )}
            </View>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    loader: {
        marginTop: 100,
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    emptyList: {
        flex: 1,
    },
    cultivoCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    cultivoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cultivoIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cultivoInfo: {
        flex: 1,
        marginLeft: 12,
    },
    cultivoNombre: {
        fontSize: 17,
        fontWeight: '700',
    },
    variedadNombre: {
        fontSize: 14,
        marginTop: 2,
    },
    proyectoCount: {
        alignItems: 'center',
    },
    countNumber: {
        fontSize: 22,
        fontWeight: '800',
    },
    countLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    proyectosLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    proyectoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 10,
    },
    proyectoTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    moreText: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
});
