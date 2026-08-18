import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Platform,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../services/theme';
import { obtenerConteoPendientes } from '../../../services/sync/uploadService';

// Tipos de notificaciones
const TIPO_NOTIFICACION = {
    SYNC_SUCCESS: 'sync_success',
    SYNC_ERROR: 'sync_error',
    CAMBIOS_GUARDADOS: 'cambios_guardados',
    PENDIENTE: 'pendiente',
    COLABORADOR: 'colaborador',
    INFO: 'info',
};

const ICONOS_NOTIFICACION = {
    [TIPO_NOTIFICACION.SYNC_SUCCESS]: { name: 'cloud-check-outline', color: '#34C759' },
    [TIPO_NOTIFICACION.SYNC_ERROR]: { name: 'cloud-alert-outline', color: '#FF3B30' },
    [TIPO_NOTIFICACION.CAMBIOS_GUARDADOS]: { name: 'content-save-outline', color: '#007AFF' },
    [TIPO_NOTIFICACION.PENDIENTE]: { name: 'clock-outline', color: '#FF9500' },
    [TIPO_NOTIFICACION.COLABORADOR]: { name: 'account-multiple-outline', color: '#AF52DE' },
    [TIPO_NOTIFICACION.INFO]: { name: 'information-outline', color: '#5AC8FA' },
};

// Notificación individual
function NotificacionItem({ notificacion, onDismiss, isDark }) {
    const icono = ICONOS_NOTIFICACION[notificacion.tipo] || ICONOS_NOTIFICACION.INFO;

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        const ahora = new Date();
        const diffMs = ahora - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHoras < 24) return `Hace ${diffHoras}h`;
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[
                styles.notificacionItem,
                {
                    backgroundColor: isDark ? 'rgba(28,28,30,0.94)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                },
            ]}
        >
            <View style={[styles.notificacionIconWrap, { backgroundColor: `${icono.color}20` }]}>
                <MaterialCommunityIcons name={icono.name} size={19} color={icono.color} />
            </View>

            <View style={styles.notificacionContent}>
                <View style={styles.notificacionTitleRow}>
                    <Text
                        style={[styles.notificacionTitulo, { color: isDark ? '#FFFFFF' : '#000000' }]}
                        numberOfLines={1}
                    >
                        {notificacion.titulo}
                    </Text>
                    <Text style={[styles.notificacionFecha, { color: isDark ? '#636366' : '#AEAEB2' }]}>
                        {formatFecha(notificacion.fecha)}
                    </Text>
                </View>
                <Text
                    style={[styles.notificacionDescripcion, { color: isDark ? '#98989F' : '#8E8E93' }]}
                    numberOfLines={2}
                >
                    {notificacion.descripcion}
                </Text>
            </View>

            {notificacion.mostrarBadge && (
                <View style={[styles.notificacionBadge, { backgroundColor: icono.color }]}>
                    <Text style={styles.notificacionBadgeText}>{notificacion.badgeCount}</Text>
                </View>
            )}

            {onDismiss && (
                <TouchableOpacity
                    onPress={() => onDismiss(notificacion.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.dismissBtn}
                >
                    <MaterialCommunityIcons name="close" size={15} color={isDark ? '#8E8E93' : '#AEAEB2'} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

// Componente principal de bandeja de notificaciones
export default function NotificationsCenter({
    visible,
    onClose,
    isDark,
    isSyncing = false,
    syncMessage = null,
    onSincronizar = null,
    pendingCounts: initialPendingCounts = null,
}) {
    const insets = useSafeAreaInsets();
    const [notificaciones, setNotificaciones] = useState([]);
    const [pendingCounts, setPendingCounts] = useState({ total: 0, lotes: 0, proyectos: 0, visitas: 0 });

    // Cargar notificaciones y pendientes al abrir
    const cargarDatos = useCallback(async () => {
        try {
            const counts = initialPendingCounts || await obtenerConteoPendientes();
            setPendingCounts(counts || { total: 0, lotes: 0, proyectos: 0, visitas: 0 });

            // Generar notificaciones basadas en estado actual
            const nuevasNotificaciones = [];

            if (counts.total > 0) {
                nuevasNotificaciones.push({
                    id: 'pendiente_sync',
                    tipo: TIPO_NOTIFICACION.PENDIENTE,
                    titulo: 'Sincronización pendiente',
                    descripcion: `Tienes ${counts.total} elemento${counts.total > 1 ? 's' : ''} pendiente${counts.total > 1 ? 's' : ''} de sincronizar: ${counts.lotes} lote${counts.lotes > 1 ? 's' : ''}, ${counts.proyectos} proyecto${counts.proyectos > 1 ? 's' : ''}, ${counts.visitas} visita${counts.visitas > 1 ? 's' : ''}.`,
                    fecha: new Date().toISOString(),
                    mostrarBadge: true,
                    badgeCount: counts.total,
                });
            }

            // Notificación de último sync (si existe)
            const ultimoSync = await getUltimoSync();
            if (ultimoSync) {
                nuevasNotificaciones.push({
                    id: 'ultimo_sync',
                    tipo: TIPO_NOTIFICACION.SYNC_SUCCESS,
                    titulo: 'Última sincronización',
                    descripcion: `Sincronización completada exitosamente.`,
                    fecha: ultimoSync,
                    mostrarBadge: false,
                });
            }

            setNotificaciones(nuevasNotificaciones);
        } catch (error) {
            // console removed
        }
    }, [initialPendingCounts]);

    useEffect(() => {
        if (visible) {
            cargarDatos();
        }
    }, [visible, cargarDatos]);

    const dismissNotificacion = (id) => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
    };

    const handleLimpiarTodas = () => {
        setNotificaciones([]);
    };

    const bg = isDark ? '#000000' : '#F2F2F7';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#98989F' : '#8E8E93';

    const translateY = useSharedValue(500);
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            backdropOpacity.value = withTiming(1, { duration: 220 });
            translateY.value = withSpring(0, { damping: 20, stiffness: 240, mass: 0.9 });
        } else {
            backdropOpacity.value = withTiming(0, { duration: 160 });
            translateY.value = withTiming(500, { duration: 200, easing: Easing.in(Easing.cubic) });
        }
    }, [visible]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
            <View style={StyleSheet.absoluteFill}>
                <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                        <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.28)' }]} />
                    </Pressable>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sheetContainer,
                        sheetStyle,
                        {
                            backgroundColor: bg,
                            paddingBottom: insets.bottom + 14,
                        },
                    ]}
                >
                    <View style={styles.sheetHandle} />

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: textPrimary }]}>Notificaciones</Text>
                        {notificaciones.length > 0 && (
                            <TouchableOpacity onPress={handleLimpiarTodas} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Text style={[styles.limpiarBtn, { color: '#0A84FF' }]}>Limpiar todo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {pendingCounts.total > 0 && (
                        <View
                            style={[
                                styles.summaryCard,
                                {
                                    backgroundColor: isDark ? 'rgba(28,28,30,0.94)' : '#FFFFFF',
                                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                },
                            ]}
                        >
                            <View style={styles.summaryHeaderRow}>
                                <View style={styles.summaryHeaderLeft}>
                                    <View style={[styles.summaryIconWrap, { backgroundColor: isDark ? 'rgba(255,149,0,0.16)' : '#FFF3E0' }]}>
                                        <MaterialCommunityIcons name="cloud-sync-outline" size={22} color="#FF9500" />
                                    </View>
                                    <View>
                                        <Text style={[styles.summaryTitle, { color: textPrimary }]}>
                                            Pendiente de sincronizar
                                        </Text>
                                        <Text style={[styles.summarySubtitle, { color: textSecondary }]}>
                                            {pendingCounts.total} elemento{pendingCounts.total > 1 ? 's' : ''} en espera
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.summaryTotalPill}>
                                    <Text style={styles.summaryTotalPillText}>{pendingCounts.total}</Text>
                                </View>
                            </View>

                            <View
                                style={[
                                    styles.summaryDivider,
                                    { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)' },
                                ]}
                            />

                            <View style={styles.summaryStats}>
                                <View style={[styles.statPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F5F5F7' }]}>
                                    <Text style={[styles.statValue, { color: textPrimary }]}>{pendingCounts.lotes}</Text>
                                    <Text style={[styles.statLabel, { color: textSecondary }]}>Lotes</Text>
                                </View>
                                <View style={[styles.statPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F5F5F7' }]}>
                                    <Text style={[styles.statValue, { color: textPrimary }]}>{pendingCounts.proyectos}</Text>
                                    <Text style={[styles.statLabel, { color: textSecondary }]}>Proyectos</Text>
                                </View>
                                <View style={[styles.statPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F5F5F7' }]}>
                                    <Text style={[styles.statValue, { color: textPrimary }]}>{pendingCounts.visitas}</Text>
                                    <Text style={[styles.statLabel, { color: textSecondary }]}>Visitas</Text>
                                </View>
                            </View>

                            {onSincronizar && !isSyncing && (
                                <TouchableOpacity
                                    style={styles.syncButton}
                                    onPress={onSincronizar}
                                    activeOpacity={0.85}
                                >
                                    <MaterialCommunityIcons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.syncButtonText}>Sincronizar ahora</Text>
                                </TouchableOpacity>
                            )}

                            {isSyncing && (
                                <View style={styles.syncingContainer}>
                                    <View style={styles.syncingAnimation}>
                                        <View style={styles.syncingDot} />
                                        <View style={[styles.syncingDot, styles.syncingDotDelay]} />
                                        <View style={[styles.syncingDot, styles.syncingDotDelay2]} />
                                    </View>
                                    <Text style={[styles.syncingText, { color: textSecondary }]}>Sincronizando...</Text>
                                </View>
                            )}

                            {syncMessage && !isSyncing && (
                                <View style={[styles.syncResult, {
                                    backgroundColor: syncMessage.type === 'error' ? 'rgba(255,59,48,0.1)' : 'rgba(52,199,89,0.1)'
                                }]}>
                                    <MaterialCommunityIcons
                                        name={syncMessage.type === 'error' ? 'cloud-alert-outline' : 'cloud-check-outline'}
                                        size={18}
                                        color={syncMessage.type === 'error' ? '#FF3B30' : '#34C759'}
                                    />
                                    <Text style={[styles.syncResultText, {
                                        color: syncMessage.type === 'error' ? '#FF3B30' : '#34C759'
                                    }]}>
                                        {syncMessage.text}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    <ScrollView
                        style={styles.notificacionesList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {notificaciones.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="bell-off-outline" size={48} color={textSecondary} />
                                <Text style={[styles.emptyTitle, { color: textPrimary }]}>Sin notificaciones</Text>
                                <Text style={[styles.emptyDesc, { color: textSecondary }]}>
                                    No tienes notificaciones pendientes.{'\n'}Los cambios guardados aparecerán aquí.
                                </Text>
                            </View>
                        ) : (
                            notificaciones.map((notif) => (
                                <NotificacionItem
                                    key={notif.id}
                                    notificacion={notif}
                                    onDismiss={dismissNotificacion}
                                    isDark={isDark}
                                />
                            ))
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Helper para obtener último sync (usar desde storage real en producción)
async function getUltimoSync() {
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const fecha = await AsyncStorage.getItem('ultimoSync');
        return fecha ? new Date(fecha) : null;
    } catch {
        return null;
    }
}

const styles = StyleSheet.create({
    sheetContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 16,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
        maxHeight: '85%',
    },
    sheetHandle: {
        width: 36,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(120,120,128,0.35)',
        alignSelf: 'center',
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    limpiarBtn: {
        fontSize: 15,
        fontWeight: '600',
    },

    // ---- Summary card (Apple-style, roomy, no overlap) ----
    summaryCard: {
        padding: 18,
        borderRadius: 20,
        marginBottom: 18,
        borderWidth: StyleSheet.hairlineWidth,
    },
    summaryHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    summaryIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    summarySubtitle: {
        fontSize: 12.5,
        fontWeight: '500',
        marginTop: 2,
    },
    summaryTotalPill: {
        minWidth: 30,
        height: 30,
        paddingHorizontal: 8,
        borderRadius: 15,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    summaryTotalPillText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    summaryDivider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 16,
    },
    summaryStats: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    statPill: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 14,
    },
    statValue: {
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 11.5,
        fontWeight: '500',
        marginTop: 3,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#34C759',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
        width: '100%',
    },
    syncButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    syncingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        gap: 12,
    },
    syncingAnimation: {
        flexDirection: 'row',
        gap: 4,
    },
    syncingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#34C759',
    },
    syncingDotDelay: {
        opacity: 0.6,
    },
    syncingDotDelay2: {
        opacity: 0.3,
    },
    syncingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    syncResult: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        marginTop: 4,
        gap: 8,
    },
    syncResultText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // ---- Notification list items (Apple Notification Center style) ----
    notificacionesList: {
        flex: 1,
    },
    notificacionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 13,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: StyleSheet.hairlineWidth,
    },
    notificacionIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 1,
    },
    notificacionContent: {
        flex: 1,
        marginLeft: 11,
    },
    notificacionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    notificacionTitulo: {
        fontSize: 14.5,
        fontWeight: '700',
        flexShrink: 1,
        marginRight: 8,
    },
    notificacionDescripcion: {
        fontSize: 13,
        lineHeight: 17,
        marginTop: 2,
    },
    notificacionFecha: {
        fontSize: 11,
        flexShrink: 0,
    },
    notificacionBadge: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        borderRadius: 10,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 1,
    },
    notificacionBadgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    dismissBtn: {
        padding: 4,
        marginLeft: 4,
        marginTop: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 4,
    },
    emptyDesc: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});