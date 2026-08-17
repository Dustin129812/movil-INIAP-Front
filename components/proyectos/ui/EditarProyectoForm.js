// ============================================
// EDITAR PROYECTO - Formulario de Edicion
// ============================================
// Permite editar: nombre, fecha, estado, tipo ensayo, tipo acolchado, colaborador
// Diseño: Apple-style con header animado, secciones, verde (#34C759)
// Origen: app/proyectos/[id]/index.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    useAnimatedReaction,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../services/theme';

// --- ESTILOS ---
// Origen: app/styles/editarProyectoStyles.js
import { editarProyectoStyles as styles } from '../../../src/styles/editarProyectoStyles';

// --- Opciones para selectores ---
const TIPOS_ENSAAYO = [
    { value: 'investigacion', label: 'Investigación' },
    { value: 'validacion', label: 'Validación' },
    { value: 'produccion_semillas', label: 'Producción Semillas' },
    { value: 'multiplicacion_semillas', label: 'Multiplicación Semillas' },
    { value: 'refrescamiento', label: 'Refrescamiento' },
];

const TIPOS_ACOLCHADO = [
    { value: 'con_acolchado', label: 'Con Acolchado' },
    { value: 'parcialmente_acolchado', label: 'Parcial Acolchado' },
    { value: 'sin_acolchado', label: 'Sin Acolchado' },
];

const ESTADOS = [
    { value: 'activo', label: 'Activo' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'inactivo', label: 'Inactivo' },
];

// --- CONSTANTES DE ANIMACION DEL HEADER ---
const HEADER_ANIMATION = {
    TOP_REVEAL_THRESHOLD: 12,
    HIDE_DURATION: 160,
    REVEAL_DURATION: 260,
    HEADER_ROW_HEIGHT: 42,
    HEADER_ROW_MARGIN_TOP: 2,
};

// ============================================
// COMPONENTE: OptionChip
// ============================================
const OptionChip = ({ label, isActive, onPress, dark }) => (
    <TouchableOpacity
        style={[
            styles.optionChip,
            dark && styles.optionChipDark,
            isActive && styles.optionChipActive,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text
            style={[
                styles.optionChipText,
                dark && { color: '#C7C7CC' },
                isActive && styles.optionChipTextActive,
            ]}
        >
            {label}
        </Text>
    </TouchableOpacity>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function EditarProyectoForm({
    proyecto,
    isLoading,
    isSaving,
    error,
    onGuardar,
    isNewProject = false,
}) {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        variedad: '',
        fecha_siembra: '',
        estado: 'activo',
        tipo_ensayo: '',
        tipo_acolchado: '',
        financiamiento: '',
        colaborador_nombre: '',
        colaborador_celular: '',
    });

    // Inicializar form cuando cambia el proyecto
    useEffect(() => {
        if (proyecto) {
            setFormData({
                titulo: proyecto.titulo || '',
                descripcion: proyecto.descripcion || '',
                variedad: proyecto.variedad || '',
                fecha_siembra: proyecto.fecha_siembra || '',
                estado: proyecto.estado || 'activo',
                tipo_ensayo: proyecto.tipo_ensayo || '',
                tipo_acolchado: proyecto.tipo_acolchado || '',
                financiamiento: proyecto.financiamiento || '',
                colaborador_nombre: proyecto.colaborador_nombre || '',
                colaborador_celular: proyecto.colaborador_celular || '',
                lote_uuid: proyecto.lote_uuid || null,
            });
        }
    }, [proyecto]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGuardar = async () => {
        if (!formData.titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return;
        }

        const resultado = await onGuardar(formData);
        if (resultado.success) {
            Alert.alert('Éxito', 'Proyecto actualizado correctamente');
            router.back();
        } else {
            Alert.alert('Error', resultado.message || 'No se pudo guardar');
        }
    };

    // ============================================
    // ANIMACION DEL HEADER (Apple-style hide/reveal)
    // ============================================
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const titleOpacity = useSharedValue(1);
    const titleTranslateY = useSharedValue(0);

    useAnimatedReaction(
        () => scrollY.value <= HEADER_ANIMATION.TOP_REVEAL_THRESHOLD,
        (isAtTop, wasAtTop) => {
            if (isAtTop === wasAtTop) return;

            if (isAtTop) {
                titleOpacity.value = withTiming(1, {
                    duration: HEADER_ANIMATION.REVEAL_DURATION,
                    easing: Easing.out(Easing.cubic),
                });
                titleTranslateY.value = withTiming(0, {
                    duration: HEADER_ANIMATION.REVEAL_DURATION,
                    easing: Easing.out(Easing.cubic),
                });
            } else {
                titleOpacity.value = withTiming(0, {
                    duration: HEADER_ANIMATION.HIDE_DURATION,
                    easing: Easing.in(Easing.cubic),
                });
                titleTranslateY.value = withTiming(-6, {
                    duration: HEADER_ANIMATION.HIDE_DURATION,
                    easing: Easing.in(Easing.cubic),
                });
            }
        },
        [HEADER_ANIMATION.TOP_REVEAL_THRESHOLD]
    );

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }));

    // Padding para el contenido scrolleable
    const scrollTopPadding =
        insets.top +
        HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP +
        HEADER_ANIMATION.HEADER_ROW_HEIGHT +
        20;

    // ============================================
    // RENDER: LOADING
    // ============================================
    if (isLoading) {
        return (
            <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#34C759" />
                </View>
            </View>
        );
    }

    // ============================================
    // RENDER: ERROR
    // ============================================
    if (error || !proyecto) {
        return (
            <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FF453A" />
                    <Text style={styles.errorText}>
                        {error || 'No se pudo cargar el proyecto'}
                    </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.volverText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ============================================
    // RENDER: FORMULARIO
    // ============================================
    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Scrim de legibilidad para el status bar */}
            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']
                        : ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']
                }
                style={[styles.statusBarScrim, { height: insets.top + 40 }]}
            />

            {/* Header con titulo animado */}
            <View style={[styles.header, { paddingTop: insets.top + HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP }]}>
                <Animated.View style={[styles.headerTopRow, titleAnimatedStyle]}>
                    <TouchableOpacity
                        style={[styles.backButton, isDark && styles.backButtonDark]}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={22}
                            color={isDark ? '#34C759' : '#34C759'}
                        />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, isDark && styles.textWhite]}>
                        {isNewProject ? 'Definir Proyecto' : 'Editar Proyecto'}
                    </Text>

                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleGuardar}
                        disabled={isSaving}
                        activeOpacity={0.7}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Contenido scrolleable */}
            <Animated.ScrollView
                style={styles.scrollView}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={[styles.scrollContent, { paddingTop: scrollTopPadding }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ============================================ */}
                {/* SECCION: DATOS BASICOS */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Datos del Proyecto
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre *</Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Nombre del proyecto"
                                placeholderTextColor={isDark ? '#636366' : '#999'}
                                value={formData.titulo}
                                onChangeText={(v) => updateField('titulo', v)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.inputMultiline, isDark && styles.inputDark]}
                                placeholder="Descripción del proyecto"
                                placeholderTextColor={isDark ? '#636366' : '#999'}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                value={formData.descripcion}
                                onChangeText={(v) => updateField('descripcion', v)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Variedad</Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Ej: INIAP-123, Shelli"
                                placeholderTextColor={isDark ? '#636366' : '#999'}
                                value={formData.variedad}
                                onChangeText={(v) => updateField('variedad', v)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Fecha de Siembra</Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={isDark ? '#636366' : '#999'}
                                value={formData.fecha_siembra}
                                onChangeText={(v) => updateField('fecha_siembra', v)}
                            />
                        </View>
                    </View>
                </View>

                {/* ============================================ */}
                {/* SECCION: ESTADO */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Estado
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <View style={styles.optionsRow}>
                            {ESTADOS.map((op) => (
                                <OptionChip
                                    key={op.value}
                                    label={op.label}
                                    isActive={formData.estado === op.value}
                                    onPress={() => updateField('estado', op.value)}
                                    dark={isDark}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* ============================================ */}
                {/* SECCION: TIPO DE ENSAYO */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Tipo de Ensayo
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <View style={styles.optionsRow}>
                            {TIPOS_ENSAAYO.map((op) => (
                                <OptionChip
                                    key={op.value}
                                    label={op.label}
                                    isActive={formData.tipo_ensayo === op.value}
                                    onPress={() => updateField('tipo_ensayo', op.value)}
                                    dark={isDark}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* ============================================ */}
                {/* SECCION: TIPO DE ACOLCHADO */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Tipo de Acolchado
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <View style={styles.optionsRow}>
                            {TIPOS_ACOLCHADO.map((op) => (
                                <OptionChip
                                    key={op.value}
                                    label={op.label}
                                    isActive={formData.tipo_acolchado === op.value}
                                    onPress={() => updateField('tipo_acolchado', op.value)}
                                    dark={isDark}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* ============================================ */}
                {/* SECCION: COLABORADOR */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Información del Colaborador
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre</Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Nombre completo"
                                placeholderTextColor={isDark ? '#636366' : '#999'}
                                value={formData.colaborador_nombre}
                                onChangeText={(v) => updateField('colaborador_nombre', v)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Celular</Text>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Ej: 0991234567"
                                placeholderTextColor={isDark ? '#636366' : '#999'}
                                keyboardType="phone-pad"
                                value={formData.colaborador_celular}
                                onChangeText={(v) => updateField('colaborador_celular', v)}
                            />
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>
        </KeyboardAvoidingView>
    );
}
