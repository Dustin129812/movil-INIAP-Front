import React, { useState, useEffect, useCallback } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
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

import { obtenerConteoPendientes } from '../../../services/sync/uploadService';


// ============================================================
// PALETA DEL HOME
// ============================================================

const COLORS = {
    green: '#34C759',
    greenDark: '#248A3D',
    greenLight: '#EAF7ED',

    darkBackground: '#000000',
    darkCard: '#101A12',
    darkCardSecondary: '#151F17',
    darkBorder: 'rgba(52,199,89,0.16)',

    lightBackground: '#F4F9F5',
    lightCard: '#FFFFFF',
    lightCardGreen: '#EEF8F0',
    lightBorder: 'rgba(52,199,89,0.14)',

    white: '#FFFFFF',
    black: '#000000',

    darkText: '#FFFFFF',
    darkSecondary: '#A7B0A9',

    lightText: '#172019',
    lightSecondary: '#68736B',

    error: '#FF3B30',
    errorLight: 'rgba(255,59,48,0.10)',
};


// ============================================================
// TIPOS DE NOTIFICACIONES
// ============================================================

const TIPO_NOTIFICACION = {
    SYNC_SUCCESS: 'sync_success',
    SYNC_ERROR: 'sync_error',
    CAMBIOS_GUARDADOS: 'cambios_guardados',
    PENDIENTE: 'pendiente',
    COLABORADOR: 'colaborador',
    INFO: 'info',
};


// ============================================================
// ICONOS
// ============================================================

const ICONOS_NOTIFICACION = {
    [TIPO_NOTIFICACION.SYNC_SUCCESS]: {
        name: 'cloud-check-outline',
        color: COLORS.green,
    },

    [TIPO_NOTIFICACION.SYNC_ERROR]: {
        name: 'cloud-alert-outline',
        color: COLORS.error,
    },

    [TIPO_NOTIFICACION.CAMBIOS_GUARDADOS]: {
        name: 'content-save-outline',
        color: COLORS.green,
    },

    [TIPO_NOTIFICACION.PENDIENTE]: {
        name: 'clock-outline',
        color: COLORS.green,
    },

    [TIPO_NOTIFICACION.COLABORADOR]: {
        name: 'account-multiple-outline',
        color: COLORS.green,
    },

    [TIPO_NOTIFICACION.INFO]: {
        name: 'information-outline',
        color: COLORS.green,
    },
};


// ============================================================
// NOTIFICACIÓN INDIVIDUAL
// ============================================================

function NotificacionItem({
    notificacion,
    onDismiss,
    isDark,
}) {
    const icono =
        ICONOS_NOTIFICACION[notificacion.tipo] ||
        ICONOS_NOTIFICACION.INFO;

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

        return d.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
        });
    };

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[
                styles.notificacionItem,
                {
                    backgroundColor: isDark
                        ? COLORS.darkCard
                        : COLORS.lightCard,

                    borderColor: isDark
                        ? COLORS.darkBorder
                        : COLORS.lightBorder,
                },
            ]}
        >

            <View
                style={[
                    styles.notificacionIconWrap,
                    {
                        backgroundColor: isDark
                            ? 'rgba(52,199,89,0.14)'
                            : COLORS.greenLight,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={icono.name}
                    size={19}
                    color={icono.color}
                />
            </View>


            <View style={styles.notificacionContent}>

                <View style={styles.notificacionTitleRow}>

                    <Text
                        style={[
                            styles.notificacionTitulo,
                            {
                                color: isDark
                                    ? COLORS.darkText
                                    : COLORS.lightText,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {notificacion.titulo}
                    </Text>

                    <Text
                        style={[
                            styles.notificacionFecha,
                            {
                                color: isDark
                                    ? '#667068'
                                    : '#8A958D',
                            },
                        ]}
                    >
                        {formatFecha(notificacion.fecha)}
                    </Text>

                </View>


                <Text
                    style={[
                        styles.notificacionDescripcion,
                        {
                            color: isDark
                                ? COLORS.darkSecondary
                                : COLORS.lightSecondary,
                        },
                    ]}
                    numberOfLines={2}
                >
                    {notificacion.descripcion}
                </Text>

            </View>


            {notificacion.mostrarBadge && (
                <View
                    style={[
                        styles.notificacionBadge,
                        {
                            backgroundColor: COLORS.green,
                        },
                    ]}
                >
                    <Text style={styles.notificacionBadgeText}>
                        {notificacion.badgeCount}
                    </Text>
                </View>
            )}


            {onDismiss && (
                <TouchableOpacity
                    onPress={() => onDismiss(notificacion.id)}
                    hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                    }}
                    style={styles.dismissBtn}
                >
                    <MaterialCommunityIcons
                        name="close"
                        size={15}
                        color={isDark ? '#7F8A82' : '#9BA49E'}
                    />
                </TouchableOpacity>
            )}

        </Animated.View>
    );
}


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

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

    const [pendingCounts, setPendingCounts] = useState({
        total: 0,
        lotes: 0,
        proyectos: 0,
        visitas: 0,
    });


    // ========================================================
    // CARGAR DATOS
    // ========================================================

    const cargarDatos = useCallback(async () => {
        try {
            const counts =
                initialPendingCounts ||
                await obtenerConteoPendientes();

            setPendingCounts(
                counts || {
                    total: 0,
                    lotes: 0,
                    proyectos: 0,
                    visitas: 0,
                }
            );


            const nuevasNotificaciones = [];


            if (counts.total > 0) {
                nuevasNotificaciones.push({
                    id: 'pendiente_sync',

                    tipo: TIPO_NOTIFICACION.PENDIENTE,

                    titulo: 'Sincronización pendiente',

                    descripcion:
                        `Tienes ${counts.total} elemento${counts.total > 1 ? 's' : ''} ` +
                        `pendiente${counts.total > 1 ? 's' : ''} de sincronizar: ` +
                        `${counts.lotes} lote${counts.lotes > 1 ? 's' : ''}, ` +
                        `${counts.proyectos} proyecto${counts.proyectos > 1 ? 's' : ''}, ` +
                        `${counts.visitas} visita${counts.visitas > 1 ? 's' : ''}.`,

                    fecha: new Date().toISOString(),

                    mostrarBadge: true,

                    badgeCount: counts.total,
                });
            }


            const ultimoSync = await getUltimoSync();

            if (ultimoSync) {
                nuevasNotificaciones.push({
                    id: 'ultimo_sync',

                    tipo: TIPO_NOTIFICACION.SYNC_SUCCESS,

                    titulo: 'Última sincronización',

                    descripcion:
                        'Sincronización completada exitosamente.',

                    fecha: ultimoSync,

                    mostrarBadge: false,
                });
            }


            setNotificaciones(nuevasNotificaciones);

        } catch (error) {
            // Error controlado
        }
    }, [initialPendingCounts]);


    useEffect(() => {
        if (visible) {
            cargarDatos();
        }
    }, [visible, cargarDatos]);


    // ========================================================
    // ACCIONES
    // ========================================================

    const dismissNotificacion = (id) => {
        setNotificaciones((prev) =>
            prev.filter((n) => n.id !== id)
        );
    };


    const handleLimpiarTodas = () => {
        setNotificaciones([]);
    };


    // ========================================================
    // COLORES SEGÚN TEMA
    // ========================================================

    const bg = isDark
        ? COLORS.darkBackground
        : COLORS.lightBackground;

    const textPrimary = isDark
        ? COLORS.darkText
        : COLORS.lightText;

    const textSecondary = isDark
        ? COLORS.darkSecondary
        : COLORS.lightSecondary;


    // ========================================================
    // ANIMACIONES
    // ========================================================

    const translateY = useSharedValue(500);

    const backdropOpacity = useSharedValue(0);


    useEffect(() => {
        if (visible) {
            backdropOpacity.value = withTiming(1, {
                duration: 220,
            });

            translateY.value = withSpring(0, {
                damping: 20,
                stiffness: 240,
                mass: 0.9,
            });

        } else {
            backdropOpacity.value = withTiming(0, {
                duration: 160,
            });

            translateY.value = withTiming(500, {
                duration: 200,
                easing: Easing.in(Easing.cubic),
            });
        }
    }, [visible]);


    const sheetStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: translateY.value,
            },
        ],
    }));


    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >

            <View style={StyleSheet.absoluteFill}>

                {/* FONDO BORROSO */}

                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        backdropStyle,
                    ]}
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={onClose}
                    >
                        <BlurView
                            intensity={30}
                            tint={isDark ? 'dark' : 'light'}
                            style={StyleSheet.absoluteFill}
                        />

                        <View
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    backgroundColor:
                                        'rgba(0,0,0,0.28)',
                                },
                            ]}
                        />
                    </Pressable>
                </Animated.View>


                {/* PANEL */}

                <Animated.View
                    style={[
                        styles.sheetContainer,
                        sheetStyle,
                        {
                            backgroundColor: bg,
                            paddingBottom:
                                insets.bottom + 14,
                        },
                    ]}
                >

                    <View style={styles.sheetHandle} />


                    {/* HEADER */}

                    <View style={styles.header}>

                        <Text
                            style={[
                                styles.title,
                                {
                                    color: textPrimary,
                                },
                            ]}
                        >
                            Notificaciones
                        </Text>


                        {notificaciones.length > 0 && (
                            <TouchableOpacity
                                onPress={handleLimpiarTodas}
                                hitSlop={{
                                    top: 8,
                                    bottom: 8,
                                    left: 8,
                                    right: 8,
                                }}
                            >
                                <Text
                                    style={[
                                        styles.limpiarBtn,
                                        {
                                            color: COLORS.green,
                                        },
                                    ]}
                                >
                                    Limpiar todo
                                </Text>
                            </TouchableOpacity>
                        )}

                    </View>


                    {/* RESUMEN DE SINCRONIZACIÓN */}

                    {pendingCounts.total > 0 && (

                        <View
                            style={[
                                styles.summaryCard,
                                {
                                    backgroundColor: isDark
                                        ? COLORS.darkCard
                                        : COLORS.lightCard,

                                    borderColor: isDark
                                        ? COLORS.darkBorder
                                        : COLORS.lightBorder,
                                },
                            ]}
                        >

                            {/* CABECERA */}

                            <View style={styles.summaryHeaderRow}>

                                <View
                                    style={styles.summaryHeaderLeft}
                                >

                                    <View
                                        style={[
                                            styles.summaryIconWrap,
                                            {
                                                backgroundColor:
                                                    isDark
                                                        ? 'rgba(52,199,89,0.14)'
                                                        : COLORS.greenLight,
                                            },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="cloud-sync-outline"
                                            size={22}
                                            color={COLORS.green}
                                        />
                                    </View>


                                    <View>

                                        <Text
                                            style={[
                                                styles.summaryTitle,
                                                {
                                                    color: textPrimary,
                                                },
                                            ]}
                                        >
                                            Pendiente de sincronizar
                                        </Text>

                                        <Text
                                            style={[
                                                styles.summarySubtitle,
                                                {
                                                    color: textSecondary,
                                                },
                                            ]}
                                        >
                                            {pendingCounts.total} elemento
                                            {pendingCounts.total > 1
                                                ? 's'
                                                : ''}{' '}
                                            en espera
                                        </Text>

                                    </View>

                                </View>


                                <View
                                    style={[
                                        styles.summaryTotalPill,
                                        {
                                            backgroundColor:
                                                COLORS.green,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={
                                            styles.summaryTotalPillText
                                        }
                                    >
                                        {pendingCounts.total}
                                    </Text>
                                </View>

                            </View>


                            {/* DIVISOR */}

                            <View
                                style={[
                                    styles.summaryDivider,
                                    {
                                        backgroundColor:
                                            isDark
                                                ? 'rgba(52,199,89,0.14)'
                                                : 'rgba(52,199,89,0.15)',
                                    },
                                ]}
                            />


                            {/* ESTADÍSTICAS */}

                            <View style={styles.summaryStats}>

                                <View
                                    style={[
                                        styles.statPill,
                                        {
                                            backgroundColor:
                                                isDark
                                                    ? COLORS.darkCardSecondary
                                                    : COLORS.lightCardGreen,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statValue,
                                            {
                                                color: COLORS.green,
                                            },
                                        ]}
                                    >
                                        {pendingCounts.lotes}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.statLabel,
                                            {
                                                color: textSecondary,
                                            },
                                        ]}
                                    >
                                        Lotes
                                    </Text>
                                </View>


                                <View
                                    style={[
                                        styles.statPill,
                                        {
                                            backgroundColor:
                                                isDark
                                                    ? COLORS.darkCardSecondary
                                                    : COLORS.lightCardGreen,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statValue,
                                            {
                                                color: COLORS.green,
                                            },
                                        ]}
                                    >
                                        {pendingCounts.proyectos}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.statLabel,
                                            {
                                                color: textSecondary,
                                            },
                                        ]}
                                    >
                                        Proyectos
                                    </Text>
                                </View>


                                <View
                                    style={[
                                        styles.statPill,
                                        {
                                            backgroundColor:
                                                isDark
                                                    ? COLORS.darkCardSecondary
                                                    : COLORS.lightCardGreen,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statValue,
                                            {
                                                color: COLORS.green,
                                            },
                                        ]}
                                    >
                                        {pendingCounts.visitas}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.statLabel,
                                            {
                                                color: textSecondary,
                                            },
                                        ]}
                                    >
                                        Visitas
                                    </Text>
                                </View>

                            </View>


                            {/* BOTÓN SINCRONIZAR */}

                            {onSincronizar && !isSyncing && (
                                <TouchableOpacity
                                    style={[
                                        styles.syncButton,
                                        {
                                            backgroundColor:
                                                COLORS.green,
                                        },
                                    ]}
                                    onPress={onSincronizar}
                                    activeOpacity={0.85}
                                >
                                    <MaterialCommunityIcons
                                        name="cloud-upload-outline"
                                        size={18}
                                        color={COLORS.white}
                                    />

                                    <Text
                                        style={
                                            styles.syncButtonText
                                        }
                                    >
                                        Sincronizar ahora
                                    </Text>
                                </TouchableOpacity>
                            )}


                            {/* SINCRONIZANDO */}

                            {isSyncing && (
                                <View
                                    style={
                                        styles.syncingContainer
                                    }
                                >

                                    <View
                                        style={
                                            styles.syncingAnimation
                                        }
                                    >
                                        <View
                                            style={
                                                styles.syncingDot
                                            }
                                        />

                                        <View
                                            style={[
                                                styles.syncingDot,
                                                styles.syncingDotDelay,
                                            ]}
                                        />

                                        <View
                                            style={[
                                                styles.syncingDot,
                                                styles.syncingDotDelay2,
                                            ]}
                                        />
                                    </View>

                                    <Text
                                        style={[
                                            styles.syncingText,
                                            {
                                                color: textSecondary,
                                            },
                                        ]}
                                    >
                                        Sincronizando...
                                    </Text>

                                </View>
                            )}


                            {/* RESULTADO */}

                            {syncMessage && !isSyncing && (
                                <View
                                    style={[
                                        styles.syncResult,
                                        {
                                            backgroundColor:
                                                syncMessage.type ===
                                                'error'
                                                    ? COLORS.errorLight
                                                    : 'rgba(52,199,89,0.10)',
                                        },
                                    ]}
                                >

                                    <MaterialCommunityIcons
                                        name={
                                            syncMessage.type ===
                                            'error'
                                                ? 'cloud-alert-outline'
                                                : 'cloud-check-outline'
                                        }
                                        size={18}
                                        color={
                                            syncMessage.type ===
                                            'error'
                                                ? COLORS.error
                                                : COLORS.green
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.syncResultText,
                                            {
                                                color:
                                                    syncMessage.type ===
                                                    'error'
                                                        ? COLORS.error
                                                        : COLORS.green,
                                            },
                                        ]}
                                    >
                                        {syncMessage.text}
                                    </Text>

                                </View>
                            )}

                        </View>
                    )}


                    {/* LISTA */}

                    <ScrollView
                        style={styles.notificacionesList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 20,
                        }}
                    >

                        {notificaciones.length === 0 ? (

                            <View style={styles.emptyState}>

                                <View
                                    style={[
                                        styles.emptyIconWrap,
                                        {
                                            backgroundColor:
                                                isDark
                                                    ? 'rgba(52,199,89,0.12)'
                                                    : COLORS.greenLight,
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="bell-off-outline"
                                        size={42}
                                        color={COLORS.green}
                                    />
                                </View>


                                <Text
                                    style={[
                                        styles.emptyTitle,
                                        {
                                            color: textPrimary,
                                        },
                                    ]}
                                >
                                    Sin notificaciones
                                </Text>


                                <Text
                                    style={[
                                        styles.emptyDesc,
                                        {
                                            color: textSecondary,
                                        },
                                    ]}
                                >
                                    No tienes notificaciones pendientes.
                                    {'\n'}
                                    Los cambios guardados aparecerán aquí.
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


// ============================================================
// ÚLTIMA SINCRONIZACIÓN
// ============================================================

async function getUltimoSync() {
    try {
        const AsyncStorage =
            require('@react-native-async-storage/async-storage')
                .default;

        const fecha =
            await AsyncStorage.getItem('ultimoSync');

        return fecha ? new Date(fecha) : null;

    } catch {
        return null;
    }
}


// ============================================================
// ESTILOS
// ============================================================

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
        shadowOffset: {
            width: 0,
            height: -6,
        },
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


    // ========================================================
    // SUMMARY
    // ========================================================

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

        justifyContent: 'center',
        alignItems: 'center',

        marginLeft: 10,
    },


    summaryTotalPillText: {
        color: COLORS.white,

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


    // ========================================================
    // BOTÓN SINCRONIZAR
    // ========================================================

    syncButton: {
        flexDirection: 'row',

        alignItems: 'center',
        justifyContent: 'center',

        paddingVertical: 14,

        borderRadius: 14,

        gap: 8,

        width: '100%',
    },


    syncButtonText: {
        color: COLORS.white,

        fontSize: 15,

        fontWeight: '700',
    },


    // ========================================================
    // SINCRONIZANDO
    // ========================================================

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

        backgroundColor: COLORS.green,
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


    // ========================================================
    // RESULTADO DE SINCRONIZACIÓN
    // ========================================================

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


    // ========================================================
    // LISTA DE NOTIFICACIONES
    // ========================================================

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
        color: COLORS.white,

        fontSize: 11,

        fontWeight: '700',
    },


    dismissBtn: {
        padding: 4,

        marginLeft: 4,

        marginTop: 1,
    },


    // ========================================================
    // ESTADO VACÍO
    // ========================================================

    emptyState: {
        alignItems: 'center',

        justifyContent: 'center',

        paddingVertical: 60,

        paddingHorizontal: 30,
    },


    emptyIconWrap: {
        width: 76,
        height: 76,

        borderRadius: 24,

        justifyContent: 'center',
        alignItems: 'center',

        marginBottom: 4,
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