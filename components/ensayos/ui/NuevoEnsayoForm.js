import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useNuevoEnsayo } from '../hooks/useNuevoEnsayo';

export default function NuevoEnsayoForm() {
    const router = useRouter();

    const {
        form, updateForm, isSaving, isSelectorVisible, setIsSelectorVisible, selectorOptions,
        abrirSelector, manejarSeleccionModal, confirmarGuardado, loteBorrador, TIPO_ENSAYO_LABELS, DISENO_LABELS
    } = useNuevoEnsayo();

    
    
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
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
                        <Text style={styles.headerSubtitle}>Registro de Operaciones</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Nuevo Ensayo</Text>
                    <Text style={styles.heroDescription}>Apertura de un nuevo cuaderno de campo para la investigación.</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* --- SECCIÓN 1: IDENTIDAD --- */}
                <View style={[styles.bentoCard, styles.overlappingCard]}>
                    <Text style={styles.sectionHeading}>Identidad del Ensayo</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Título del Ensayo <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="format-title" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={form.titulo}
                                onChangeText={(val) => updateForm('titulo', val)}
                                placeholder="Ej. Rendimiento F1..."
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Propósito / Tipo de Ensayo <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity style={styles.selectorWrapper} onPress={() => abrirSelector('tipo_ensayo')} activeOpacity={0.7}>
                            <MaterialCommunityIcons name="flask-outline" size={20} color="#0f172a" style={styles.inputIcon} />
                            <Text style={styles.selectorText}>
                                {TIPO_ENSAYO_LABELS[form.tipoEnsayo] || 'Seleccionar...'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#94a3b8" style={{marginRight: 12}} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descripción y Objetivos</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={form.descripcion}
                            onChangeText={(val) => updateForm('descripcion', val)}
                            multiline
                            placeholder="Detalles, variables de interés, metodología..."
                            placeholderTextColor="#cbd5e1"
                        />
                    </View>
                </View>

                {/* --- SECCIÓN 2: UBICACIÓN (Lectura del Lote en Memoria) --- */}
                <View style={styles.bentoCard}>
                    <Text style={styles.sectionHeading}>Asignación Geográfica</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Polígono Delimitado <Text style={styles.required}>*</Text></Text>

                        {/* Tarjeta de resumen del lote en lugar del selector */}
                        <View style={{ backgroundColor: '#ecfdf5', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#a7f3d0', flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 12, marginRight: 12 }}>
                                <MaterialCommunityIcons name="map-check" size={24} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#064e3b', marginBottom: 2 }}>
                                    {loteBorrador?.nombre_lote || 'Lote Pendiente'}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#047857', fontWeight: '600' }}>
                                    {loteBorrador?.ubicacion?.provincia?.name} - {loteBorrador?.coordenadas?.length || 0} Vértices
                                </Text>
                            </View>
                        </View>

                    </View>
                </View>

                {/* --- SECCIÓN 3: BIOLOGÍA --- */}
                <View style={styles.bentoCard}>
                    <Text style={styles.sectionHeading}>Parámetros de Cultivo</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Variedad <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="sprout" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={form.variedad}
                                onChangeText={(val) => updateForm('variedad', val)}
                                placeholder="Escriba la variedad..."
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Fecha de Siembra (Opcional)</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={form.fechaSiembra}
                                onChangeText={(val) => updateForm('fechaSiembra', val)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Distancia de Siembra <Text style={styles.required}>*</Text></Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.inputWrapper, { flex: 1, paddingLeft: 0 }]}>
                                <TextInput
                                    style={[styles.textInput, { textAlign: 'center', paddingRight: 0 }]}
                                    value={form.distanciaLargo}
                                    onChangeText={(val) => updateForm('distanciaLargo', val.replace(/[^0-9.]/g, ''))}
                                    keyboardType="numeric"
                                    placeholder="Surcos"
                                    placeholderTextColor="#cbd5e1"
                                />
                            </View>
                            <Text style={{ marginHorizontal: 12, fontWeight: '900', color: '#94a3b8' }}>X</Text>
                            <View style={[styles.inputWrapper, { flex: 1, paddingLeft: 0 }]}>
                                <TextInput
                                    style={[styles.textInput, { textAlign: 'center', paddingRight: 0 }]}
                                    value={form.distanciaAncho}
                                    onChangeText={(val) => updateForm('distanciaAncho', val.replace(/[^0-9.]/g, ''))}
                                    keyboardType="numeric"
                                    placeholder="Entre Plantas"
                                    placeholderTextColor="#cbd5e1"
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.selectorWrapper, { marginLeft: 12, paddingVertical: 14, paddingHorizontal: 12, width: 80, justifyContent: 'center' }]}
                                onPress={() => abrirSelector('unidad_medida')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.selectorText, { textAlign: 'center' }]}>{form.distanciaUnidad}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo de Tratamiento (Opcional)</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="test-tube" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={form.tipoTratamiento}
                                onChangeText={(val) => updateForm('tipoTratamiento', val)}
                                placeholder="Ej. Control químico, orgánico..."
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    {form.tipoTratamiento.trim() !== '' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Uso de Acolchado (Opcional)</Text>
                            <TouchableOpacity style={styles.selectorWrapper} onPress={() => abrirSelector('tipo_acolchado')} activeOpacity={0.7}>
                                <MaterialCommunityIcons name="layers-outline" size={20} color="#0f172a" style={styles.inputIcon} />
                                <Text style={styles.selectorText}>
                                    {form.tipoAcolchado === 'con_acolchado' ? 'Con Acolchado'
                                        : form.tipoAcolchado === 'parcialmente_acolchado' ? 'Parcialmente Acolchado'
                                            : form.tipoAcolchado === 'sin_acolchado' ? 'Sin Acolchado'
                                                : 'Seleccionar...'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={24} color="#94a3b8" style={{marginRight: 12}} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* --- SECCIÓN 4: ADMINISTRACIÓN (NUEVO CONTENEDOR) --- */}
                <View style={styles.bentoCard}>
                    <Text style={styles.sectionHeading}>Gestión Administrativa</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Diseño Experimental <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity style={styles.selectorWrapper} onPress={() => abrirSelector('diseno_experimental')} activeOpacity={0.7}>
                            <MaterialCommunityIcons name="ruler-square-compass" size={20} color="#0f172a" style={styles.inputIcon} />
                            <Text style={styles.selectorText}>
                                {DISENO_LABELS[form.disenoExperimental] || 'Seleccionar...'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#94a3b8" style={{marginRight: 12}} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* FINANCIAMIENTO */}
                    <View style={styles.inputGroup}>
                        <View style={styles.switchHeader}>
                            <Text style={styles.label}>¿Requiere Financiamiento Externo?</Text>
                            <TouchableOpacity
                                style={[styles.switchBtn, form.requiereFinanciamiento ? styles.switchActive : styles.switchInactive]}
                                onPress={() => updateForm('requiereFinanciamiento', !form.requiereFinanciamiento)}
                            >
                                <Text style={[styles.switchText, form.requiereFinanciamiento ? styles.switchTextActive : styles.switchTextInactive]}>
                                    {form.requiereFinanciamiento ? 'SÍ' : 'NO'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {form.requiereFinanciamiento && (
                            <View style={[styles.inputWrapper, { marginTop: 12 }]}>
                                <MaterialCommunityIcons name="bank-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={form.financiamiento}
                                    onChangeText={(val) => updateForm('financiamiento', val)}
                                    placeholder="Ej. INIAP, Proyecto Semilla..."
                                    placeholderTextColor="#cbd5e1"
                                />
                            </View>
                        )}
                    </View>

                    {/* COLABORADOR */}
                    <View style={styles.inputGroup}>
                        <View style={styles.switchHeader}>
                            <Text style={styles.label}>¿Tiene Colaborador Externo?</Text>
                            <TouchableOpacity
                                style={[styles.switchBtn, form.tieneColaborador ? styles.switchActive : styles.switchInactive]}
                                onPress={() => updateForm('tieneColaborador', !form.tieneColaborador)}
                            >
                                <Text style={[styles.switchText, form.tieneColaborador ? styles.switchTextActive : styles.switchTextInactive]}>
                                    {form.tieneColaborador ? 'SÍ' : 'NO'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {form.tieneColaborador && (
                            <View style={{ marginTop: 12 }}>
                                <View style={[styles.inputWrapper, { marginBottom: 12 }]}>
                                    <MaterialCommunityIcons name="account-tie" size={20} color="#94a3b8" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.colNombre}
                                        onChangeText={(val) => updateForm('colNombre', val)}
                                        placeholder="Nombre completo"
                                        placeholderTextColor="#cbd5e1"
                                    />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="phone-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        value={form.colCelular}
                                        onChangeText={(val) => updateForm('colCelular', val.replace(/[^0-9]/g, ''))} // Solo números
                                        keyboardType="phone-pad"
                                        placeholder="Celular (09XXXXXXXX)"
                                        placeholderTextColor="#cbd5e1"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>

            {/* --- FOOTER DE ACCIÓN --- */}
            <View style={styles.floatingFooter}>
                <TouchableOpacity
                    style={[styles.masterActionBtn, isSaving && { backgroundColor: '#94a3b8' }]} // Color bloqueado si guarda
                    onPress={confirmarGuardado}
                    disabled={isSaving}
                    activeOpacity={0.9}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="content-save-check" size={22} color="#fff" />
                            <Text style={styles.masterActionBtnText}>Guardar Ensayo</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* --- MODAL SELECTOR (Bottom Sheet Style) --- */}
            {isSelectorVisible && (
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsSelectorVisible(false)} />
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Seleccione una opción</Text>

                        <FlatList
                            data={selectorOptions}
                            keyExtractor={(item, index) => (item.id ?? item.uuid_movil ?? index).toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.modalItemRow} onPress={() => manejarSeleccionModal(item)}>
                                    <Text style={styles.modalItemText}>{item.nombre || item.nombre_lote}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.modalEmpty}>
                                    <MaterialCommunityIcons name="folder-open-outline" size={40} color="#cbd5e1" />
                                    <Text style={styles.modalEmptyText}>Catálogo vacío.</Text>
                                </View>
                            }
                        />
                        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsSelectorVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },

    // --- Header Inmersivo ---
    headerBackground: { paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden', elevation: 5, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    glowCircle: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(56, 189, 248, 0.1)' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitles: { alignItems: 'center' },
    headerSubtitle: { fontSize: 11, fontWeight: '900', color: '#4ade80', textTransform: 'uppercase', letterSpacing: 2 },

    heroSection: { paddingHorizontal: 24, marginTop: 10, paddingBottom: 10 },
    heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginBottom: 8 },
    heroDescription: { fontSize: 14, color: '#94a3b8', fontWeight: '500', lineHeight: 20 },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },

    // --- Bento Cards ---
    bentoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 4, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    overlappingCard: { marginTop: -40 },
    sectionHeading: { fontSize: 14, fontWeight: '900', color: '#64748b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },

    // --- Formularios & Inputs ---
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
    required: { color: '#ef4444' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16 },
    inputIcon: { paddingHorizontal: 14 },
    textInput: { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 15, color: '#0f172a', fontWeight: '600' },
    textArea: { backgroundColor: '#f8fafc', padding: 16, minHeight: 100 },

    // --- Selectores ---
    selectorWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingVertical: 14 },
    selectorWrapperDashed: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', borderWidth: 1.5, borderColor: '#bae6fd', borderRadius: 16, paddingVertical: 14, borderStyle: 'dashed' },
    selectorText: { flex: 1, fontSize: 15, color: '#0f172a', fontWeight: '600' },
    switchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    switchBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
    switchActive: { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
    switchInactive: { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' },
    switchText: { fontSize: 12, fontWeight: '900' },
    switchTextActive: { color: '#059669' },
    switchTextInactive: { color: '#64748b' },
    placeholderText: { color: '#94a3b8', fontWeight: '500' },

    // --- Chips (Variedades) ---
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    chipItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
    chipText: { fontSize: 13, fontWeight: '800', color: '#059669', marginLeft: 6, marginRight: 8 },
    chipClose: { padding: 2 },

    // --- Footer Flotante Estilo iOS ---
    floatingFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: 'rgba(248, 250, 252, 0.9)', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.5)' },
    masterActionBtn: { flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    masterActionBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', marginLeft: 10, letterSpacing: 0.5 },

    // --- Modal (Bottom Sheet Style) ---
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