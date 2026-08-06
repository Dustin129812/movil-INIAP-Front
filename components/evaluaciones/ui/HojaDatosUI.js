import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHojaDatos } from '../hooks/useHojaDatos';

export default function HojaDatosUI() {
    const {
        isEditMode, isLoading, isReadOnly, form, updateForm,
        irAMatriz, router
    } = useHojaDatos();

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <StatusBar barStyle="light-content" />

            <LinearGradient colors={['#0f172a', '#064e3b']} style={styles.headerBackground}>
                <View style={styles.glowCircle} />
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitles}>
                        <Text style={styles.headerSubtitle}>
                            {isReadOnly ? 'Lectura - Sincronizado' : isEditMode ? 'Modificando Registro' : 'Libreta de Campo'}
                        </Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle} numberOfLines={1}>
                        {isReadOnly ? 'Expediente Cerrado' : isEditMode ? 'Edición de Datos' : 'Nueva Evaluación'}
                    </Text>
                    <View style={styles.badgeHero}>
                        <MaterialCommunityIcons name={isReadOnly ? "cloud-check" : "clipboard-text-outline"} size={14} color="#94a3b8" />
                        <Text style={styles.badgeHeroText}>{isReadOnly ? 'Sincronizado' : 'Ficha de Inspección'}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={[styles.bentoCard, styles.overlappingCard]}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Técnico Responsable <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="account-hard-hat" size={20} color="#64748b" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={form.tecnico}
                                onChangeText={(v) => updateForm('tecnico', v)}
                                placeholder="Nombre del evaluador"
                                placeholderTextColor="#cbd5e1"
                                editable={!isReadOnly}
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Novedades y Observaciones</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={form.observaciones}
                            onChangeText={(v) => updateForm('observaciones', v)}
                            multiline={true} textAlignVertical="top"
                            placeholder="Plagas, estado del clima..."
                            placeholderTextColor="#cbd5e1"
                            editable={!isReadOnly}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Recomendación Técnica</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={form.recomendaciones}
                            onChangeText={(v) => updateForm('recomendaciones', v)}
                            multiline={true} textAlignVertical="top"
                            placeholder="Acciones a tomar..."
                            placeholderTextColor="#cbd5e1"
                            editable={!isReadOnly}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.floatingFooter}>
                <TouchableOpacity style={styles.masterSaveBtn} onPress={irAMatriz} activeOpacity={0.9}>
                    <MaterialCommunityIcons name="table-large" size={22} color="#fff" />
                    <Text style={styles.masterSaveBtnText}>Continuar a Matriz</Text>
                    <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" style={{marginLeft: 10}} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#f1f5f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    headerBackground: { paddingBottom: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
    glowCircle: { position: 'absolute', top: -30, left: -30, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(56, 189, 248, 0.1)' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitles: { alignItems: 'center' },
    headerSubtitle: { fontSize: 11, fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 2 },
    heroSection: { paddingHorizontal: 24, marginTop: 10, paddingBottom: 20 },
    heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginBottom: 12 },
    badgeHero: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    badgeHeroText: { fontSize: 12, fontWeight: '900', color: '#cbd5e1', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },
    bentoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 4, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    overlappingCard: { marginTop: -40 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '800', color: '#64748b', marginBottom: 8 },
    required: { color: '#ef4444' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16 },
    inputIcon: { paddingHorizontal: 14 },
    textInput: { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 15, color: '#0f172a', fontWeight: '500' },
    textArea: { backgroundColor: '#f8fafc', padding: 16, minHeight: 120, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    floatingFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: 'rgba(248, 250, 252, 0.85)', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.5)' },
    masterSaveBtn: { flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    masterSaveBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', marginLeft: 10, letterSpacing: 0.5 }
});