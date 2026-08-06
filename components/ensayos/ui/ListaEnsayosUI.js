import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform,
    Modal,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useListaEnsayos } from '../hooks/useListaEnsayos'; // <-- El Hook

export default function ListaEnsayosUI() {
    const {
        filteredEnsayos, isLoading, activeTab, setActiveTab, ensayos,
        dbLotes, showLoteSelector, setShowLoteSelector, seleccionarLoteExistente
    } = useListaEnsayos();
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const router = useRouter();
    const TABS = ['TODOS', 'ACTIVOS', 'PENDIENTE'];
    
    const renderItem = ({ item, index }) => {
        const isPending = item.sync_status !== 'synced';
        const badgeColor = isPending ? '#ea580c' : '#059669';
        const badgeBg = isPending ? '#fff7ed' : '#ecfdf5';
        const badgeBorder = isPending ? '#fed7aa' : '#a7f3d0';
        const badgeText = isPending ? 'PENDIENTE' : 'NUBE OK';

        const idLabel = `ENS-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`;

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push(`/(superior)/ejecucion-campo/proyecto-detalle?proyecto_uuid=${item.uuid_movil}`)}
            >
                {/* Cabecera de la Tarjeta */}
                <View style={styles.cardHeader}>
                    <View style={styles.uuidBadge}>
                        <MaterialCommunityIcons name="flask-outline" size={14} color="#64748b" style={{marginRight: 6}} />
                        <Text style={styles.uuidText}>{idLabel}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                        <View style={[styles.statusDot, { backgroundColor: badgeColor }]} />
                        <Text style={[styles.statusText, { color: badgeColor }]}>{badgeText}</Text>
                    </View>
                </View>

                {/* Título */}
                <Text style={styles.cardTitle} numberOfLines={2}>{item.titulo}</Text>

                {/* Métricas Bento Grid */}
                <View style={styles.metricsContainer}>
                    <View style={styles.metricCell}>
                        <Text style={styles.metricLabel}>Terreno / Lote</Text>
                        <Text style={styles.metricValue} numberOfLines={1}>{item.loteNombre}</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricCell}>
                        <Text style={styles.metricLabel}>Cultivo</Text>
                        <Text style={styles.metricValue} numberOfLines={1}>{item.cultivo}</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricCell}>
                        <Text style={styles.metricLabel}>Siembra</Text>
                        <Text style={styles.metricValue}>{item.fecha}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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
                        <Text style={styles.headerSubtitle}>Lista de Ensayos</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Ensayos Activos</Text>
                    <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>{ensayos.length} Registros</Text>
                    </View>
                </View>

                {/* Segmented Control (Tabs flotantes) */}
                <View style={styles.tabContainer}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={filteredEnsayos}
                    keyExtractor={item => item.uuid_movil}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#94a3b8" />
                            </View>
                            <Text style={styles.emptyTitle}>Bitácora vacía</Text>
                            <Text style={styles.emptyBody}>No hay investigaciones que coincidan{'\n'}con este criterio.</Text>
                        </View>
                    }
                />
            )}

            {/* FAB Botón Oscuro Premium */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowCreateMenu(true)} // <-- Cambiado
                activeOpacity={0.9}
            >
                <MaterialCommunityIcons name="plus" size={28} color="#fff" />
                <Text style={styles.fabLabel}>NUEVO ENSAYO</Text>
            </TouchableOpacity>

            <Modal
                visible={showCreateMenu}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCreateMenu(false)}
            >
                <View style={styles.menuOverlay}>
                    <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setShowCreateMenu(false)} />
                    <View style={styles.menuSheet}>
                        <View style={styles.menuHandle} />
                        <Text style={styles.menuTitle}>¿Dónde se ejecutará el ensayo?</Text>

                        {/* Opción 1: Crear Lote Nuevo */}
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => {
                                setShowCreateMenu(false);
                                router.push('/(superior)/ejecucion-campo/croquis?origen=ensayo');
                            }}
                        >
                            <View style={[styles.menuIconWrap, { backgroundColor: '#ecfdf5' }]}>
                                <MaterialCommunityIcons name="vector-polygon" size={24} color="#059669" />
                            </View>
                            <View style={styles.menuTextWrap}>
                                <Text style={styles.menuOptionTitle}>Trazar Nuevo Lote</Text>
                                <Text style={styles.menuOptionDesc}>Delimitar un nuevo polígono en el mapa con el GPS.</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Opción 2: Usar Lote Existente */}
                        <TouchableOpacity
                            style={styles.menuOption}
                            onPress={() => {
                                setShowCreateMenu(false);
                                setShowLoteSelector(true); // <-- Abre el modal reutilizado
                            }}
                        >
                            <View style={[styles.menuIconWrap, { backgroundColor: '#f0f9ff' }]}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={24} color="#0284c7" />
                            </View>
                            <View style={styles.menuTextWrap}>
                                <Text style={styles.menuOptionTitle}>Usar Lote Existente</Text>
                                <Text style={styles.menuOptionDesc}>Asignar el ensayo a un territorio ya guardado en la app.</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuCancelBtn} onPress={() => setShowCreateMenu(false)}>
                            <Text style={styles.menuCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {showLoteSelector && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowLoteSelector(false)} />
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Seleccione un Terreno</Text>

                        <FlatList
                            data={dbLotes}
                            keyExtractor={item => item.uuid_movil}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.modalItemRow} onPress={() => seleccionarLoteExistente(item)}>
                                    <View>
                                        <Text style={styles.modalItemText}>{item.nombre_lote}</Text>
                                        <Text style={{fontSize: 12, color: '#64748b'}}>
                                            Geometría: {item.coordenadas?.length || 0} vértices
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.modalEmpty}>
                                    <MaterialCommunityIcons name="folder-open-outline" size={40} color="#cbd5e1" />
                                    <Text style={styles.modalEmptyText}>No hay lotes guardados.</Text>
                                </View>
                            }
                        />
                        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowLoteSelector(false)}>
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // --- Header Inmersivo ---
    headerBackground: { paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 5, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    glowCircle: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitles: { alignItems: 'center' },
    headerSubtitle: { fontSize: 11, fontWeight: '900', color: '#4ade80', textTransform: 'uppercase', letterSpacing: 2 },

    heroSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 10, marginBottom: 24 },
    heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    counterBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    counterText: { color: '#fff', fontWeight: '800', fontSize: 12 },

    // --- Tabs (Segmented Control) ---
    tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 20, padding: 4, borderRadius: 16 },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    tabText: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
    tabTextActive: { color: '#0f172a' },

    listContent: { padding: 20, paddingBottom: 120 },

    // --- Tarjeta Bento ---
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 4, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    uuidBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    uuidText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, fontWeight: '900', color: '#475569' },

    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

    cardTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 20, lineHeight: 26, letterSpacing: -0.5 },

    metricsContainer: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    metricCell: { flex: 1 },
    metricLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    metricValue: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
    metricDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 12 },

    // --- Empty State ---
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 30 },
    emptyIconContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
    emptyBody: { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500' },

    // --- FAB Premium ---
    fab: { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 32, elevation: 10, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
    fabLabel: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 1, marginLeft: 8 },

    menuOverlay: { flex: 1, justifyContent: 'flex-end', zIndex: 100 },
    menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
    menuSheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 40 : 24, elevation: 20 },
    menuHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#cbd5e1', alignSelf: 'center', marginBottom: 20 },
    menuTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 24, textAlign: 'center' },

    menuOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    menuIconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuTextWrap: { flex: 1 },
    menuOptionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
    menuOptionDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },

    menuCancelBtn: { backgroundColor: '#f1f5f9', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
    menuCancelText: { color: '#64748b', fontSize: 16, fontWeight: '800' },

    modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '80%', elevation: 20, shadowColor: '#000', shadowOffset: {width: 0, height: -10}, shadowOpacity: 0.2, shadowRadius: 20 },
    modalHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#cbd5e1', alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 16, textAlign: 'center' },
    modalItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalItemText: { fontSize: 16, fontWeight: '700', color: '#334155' },
    modalEmpty: { alignItems: 'center', paddingVertical: 40 },
    modalEmptyText: { marginTop: 12, color: '#94a3b8', fontSize: 15, fontWeight: '600' },
    modalCancelBtn: { backgroundColor: '#f1f5f9', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    modalCancelText: { color: '#64748b', fontSize: 16, fontWeight: '800' }
});