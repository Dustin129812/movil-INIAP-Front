import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    StatusBar,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {hojas_datos, SYNC_STATUS, visitas} from '../../../db/schema';
import { useProyectoDetalle } from '../hooks/useProyectoDetalle';
import {db} from "../../../db/client";
import {eq} from "drizzle-orm";

export default function ProyectoDetalleUI({ proyecto_uuid }) {
    const router = useRouter();
    const { proyectoData, historial, isLoading, eliminarVisita } = useProyectoDetalle(proyecto_uuid);

    if (isLoading && !proyectoData) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* --- Fondo Degradado Integrado --- */}
            <LinearGradient colors={['#0f172a', '#064e3b']} style={styles.headerBackground}>
                <View style={styles.glowCircle} />

                {/* Navbar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitles}>
                        <Text style={styles.headerSubtitle}>Bitácora de Ensayo</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* Título Principal */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle} numberOfLines={3}>
                        {proyectoData?.titulo || 'Ensayo Experimental'}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.bentoCard, styles.overlappingCard]}>
                    <View style={styles.metaRow}>
                        <View style={styles.metaIconBox}>
                            <MaterialCommunityIcons name="account-tie" size={20} color="#0f172a" />
                        </View>
                        <View style={styles.metaTextWrap}>
                            <Text style={styles.metaLabel}>Colaborador Externo</Text>
                            <Text style={styles.metaValue}>{proyectoData?.colaborador_nombre || 'No asignado'}</Text>
                        </View>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaRow}>
                        <View style={[styles.metaIconBox, { backgroundColor: '#dbeafe' }]}>
                            <MaterialCommunityIcons name="bank-outline" size={20} color="#2563eb" />
                        </View>
                        <View style={styles.metaTextWrap}>
                            <Text style={styles.metaLabel}>Fuente de Financiamiento</Text>
                            <Text style={styles.metaValue}>{proyectoData?.financiamiento || 'Fondos Propios INIAP'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Línea de Tiempo</Text>
                </View>

                {/* --- Línea de Tiempo de Visitas --- */}
                {historial.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#94a3b8" />
                        </View>
                        <Text style={styles.emptyStateTitle}>Bitácora en blanco</Text>
                        <Text style={styles.emptyStateText}>No hay evaluaciones fenológicas ni métricas registradas todavía.</Text>
                    </View>
                ) : (
                    <View style={styles.timelineWrapper}>
                        {historial.map((visita, index) => {
                            const isPending = visita.sync_status === SYNC_STATUS.PENDING;
                            const dotColor = isPending ? '#ea580c' : '#059669'; 
                            const dotBorderColor = isPending ? '#fed7aa' : '#a7f3d0';
                            const badgeBg = isPending ? '#fff7ed' : '#ecfdf5';
                            const badgeBorder = isPending ? '#fed7aa' : '#a7f3d0';
                            const badgeText = isPending ? 'Pendiente' : 'En Nube';

                            return (
                                <View key={visita.uuid_movil || `visita-${index}`} style={styles.timelineNode}>

                                    <View style={styles.timelineAxis}>
                                        <View style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: dotBorderColor }]} />
                                        {index !== historial.length - 1 && <View style={styles.timelineLine} />}
                                    </View>

                                    <View style={styles.timelineCard}>
                                        <View style={styles.visitHeader}>
                                            <View style={styles.dateWrap}>
                                                <MaterialCommunityIcons name="calendar-month-outline" size={16} color="#64748b" style={{marginRight: 6}} />
                                                <Text style={styles.visitDate}>{visita.fecha_visita}</Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                                                <Text style={[styles.statusText, { color: dotColor }]}>{badgeText}</Text>
                                            </View>
                                        </View>

                                        <Text style={styles.visitTecnico}>
                                            <Text style={{fontWeight: '500', color: '#94a3b8'}}>Por:</Text> {visita.tecnico_nombre}
                                        </Text>

                                        <Text style={styles.visitObs} numberOfLines={3}>
                                            {visita.observaciones || "Sin novedades adicionales."}
                                        </Text>

                                        {/* La condicional que ya habíamos ajustado */}
                                        {isPending ? (
                                            <View style={styles.cardActions}>
                                                <TouchableOpacity
                                                    style={styles.actionBtnPrimary}
                                                    onPress={() => router.push(`/(superior)/ejecucion-campo/hoja-datos?proyecto_uuid=${proyecto_uuid}&visita_uuid=${visita.uuid_movil}`)}
                                                    activeOpacity={0.8}
                                                >
                                                    <MaterialCommunityIcons name="pencil-outline" size={16} color="#0f172a" />
                                                    <Text style={styles.actionBtnTextPrimary}>Modificar Datos</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={styles.actionBtnDelete}
                                                    onPress={() => eliminarVisitaLocal(visita.uuid_movil, visita.sync_status)}
                                                    activeOpacity={0.7}
                                                >
                                                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View style={styles.cardActions}>
                                                <TouchableOpacity
                                                    style={styles.actionBtnPrimary}
                                                    onPress={() => router.push(`/(superior)/ejecucion-campo/hoja-datos?proyecto_uuid=${proyecto_uuid}&visita_uuid=${visita.uuid_movil}`)}
                                                    activeOpacity={0.8}
                                                >
                                                    <MaterialCommunityIcons name="eye-outline" size={16} color="#0f172a" />
                                                    <Text style={styles.actionBtnTextPrimary}>Ver Evaluación</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* --- Footer de Acción Principal --- */}
            <View style={styles.floatingFooter}>
                <TouchableOpacity
                    style={styles.masterActionBtn}
                    onPress={() => router.push(`/(superior)/ejecucion-campo/hoja-datos?proyecto_uuid=${proyecto_uuid}`)}
                    activeOpacity={0.9}
                >
                    <MaterialCommunityIcons name="clipboard-check-outline" size={22} color="#fff" />
                    <Text style={styles.masterActionBtnText}>Registrar Evaluación Biométrica</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },

    // --- Header Inmersivo ---
    headerBackground: { paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
    glowCircle: { position: 'absolute', top: -30, left: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(56, 189, 248, 0.1)' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitles: { alignItems: 'center' },
    headerSubtitle: { fontSize: 11, fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 2 },

    heroSection: { paddingHorizontal: 24, marginTop: 10, paddingBottom: -5 },
    heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5, lineHeight: 34 },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },

    // --- Bento Card (Superpuesto) ---
    bentoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#e2e8f0', elevation: 8, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },
    overlappingCard: { marginTop: 10 },

    metaRow: { flexDirection: 'row', alignItems: 'center' },
    metaIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    metaTextWrap: { flex: 1 },
    metaLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    metaValue: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginTop: 2 },
    metaDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },

    // --- Títulos de Sección ---
    sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },

    // --- Timeline (Línea de Tiempo) ---
    timelineWrapper: { paddingTop: 10 },
    timelineNode: { flexDirection: 'row', marginBottom: 20 },
    timelineAxis: { width: 30, alignItems: 'center', marginRight: 12 },
    timelineDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, zIndex: 2 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginTop: -2, marginBottom: -24, zIndex: 1 },

    // --- Timeline Card (Bento) ---
    timelineCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
    visitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    dateWrap: { flexDirection: 'row', alignItems: 'center' },
    visitDate: { fontSize: 15, fontWeight: '900', color: '#0f172a' },

    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

    visitTecnico: { fontSize: 14, fontWeight: '800', color: '#334155', marginBottom: 8 },
    visitObs: { fontSize: 14, color: '#64748b', fontStyle: 'italic', lineHeight: 22 },

    cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    actionBtnPrimary: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f1f5f9', borderRadius: 12 },
    actionBtnTextPrimary: { fontSize: 13, color: '#0f172a', fontWeight: '800', marginLeft: 6 },
    actionBtnDelete: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 12 },

    // --- Empty State ---
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 30, paddingHorizontal: 30 },
    emptyIconContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyStateTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
    emptyStateText: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500' },

    // --- Footer Flotante Estilo Premium ---
    floatingFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: 'rgba(248, 250, 252, 0.85)', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.5)' },
    masterActionBtn: { flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    masterActionBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', marginLeft: 10, letterSpacing: 0.5 }
});