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
    Modal,
    FlatList,
    Pressable,
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
import DateTimePicker from '@react-native-community/datetimepicker';
import ColaboradoresModal from './ColaboradoresModal';
import SelectorCultivoVariedad from './SelectorCultivoVariedad';

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
    lotes = [],
    isLoading,
    isSaving,
    error,
    onGuardar,
    isNewProject = false,
    cargarLotes,
    colaboradores = [],
}) {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const [mostrarSelectorLote, setMostrarSelectorLote] = useState(false);
    const [lotesSeleccionados, setLotesSeleccionados] = useState([]); // Array of selected lots
    const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
    const [mostrarColaboradoresModal, setMostrarColaboradoresModal] = useState(false);
    const [mostrarSelectorTipoEnsayo, setMostrarSelectorTipoEnsayo] = useState(false);
    const [mostrarSelectorTipoAcolchado, setMostrarSelectorTipoAcolchado] = useState(false);
    const [mostrarSelectorEstado, setMostrarSelectorEstado] = useState(false);
    const [mostrarSelectorCultivoVariedad, setMostrarSelectorCultivoVariedad] = useState(false);
    const [cultivoSeleccionado, setCultivoSeleccionado] = useState(null);
    const [variedadSeleccionada, setVariedadSeleccionada] = useState(null);
    const [colaboradoresSeleccionados, setColaboradoresSeleccionados] = useState([]);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        cultivo_id: null,
        cultivo_nombre: '',
        variedad_id: null,
        variedad_nombre: '',
        fecha_siembra: '',
        estado: 'activo',
        tipo_ensayo: '',
        tipo_acolchado: '',
        financiamiento: '',
        lotes_ids: [],
        colaboradores_ids: [],
    });

    // Cargar lotes al inicio
    useEffect(() => {
        if (cargarLotes) {
            cargarLotes();
        }
    }, [cargarLotes]);

    // Inicializar form cuando cambia el proyecto
    useEffect(() => {
        if (proyecto) {
            setFormData({
                titulo: proyecto.titulo || '',
                descripcion: proyecto.descripcion || '',
                cultivo_id: proyecto.cultivo_id || null,
                cultivo_nombre: proyecto.cultivo_nombre || '',
                variedad_id: null,
                variedad_nombre: proyecto.variedad || '',
                fecha_siembra: proyecto.fecha_siembra || '',
                estado: proyecto.estado || 'activo',
                tipo_ensayo: proyecto.tipo_ensayo || '',
                tipo_acolchado: proyecto.tipo_acolchado || '',
                financiamiento: proyecto.financiamiento || '',
                lotes_ids: proyecto.lotes_ids || [],
                colaboradores_ids: proyecto.colaboradores_ids || [],
            });
            // Set selected cultivo/variedad
            if (proyecto.cultivo_id) {
                setCultivoSeleccionado({ id: proyecto.cultivo_id, nombre: proyecto.cultivo_nombre });
            }
            if (proyecto.variedad) {
                setVariedadSeleccionada({ id: null, nombre: proyecto.variedad });
            } else {
                setVariedadSeleccionada(null);
            }
            // Buscar lotes seleccionados en la lista
            if ((proyecto.lotes_ids || proyecto.lote_uuid) && lotes.length > 0) {
                const ids = proyecto.lotes_ids || (proyecto.lote_uuid ? [proyecto.lote_uuid] : []);
                const selected = lotes.filter(l => ids.includes(l.uuid_movil) || ids.includes(l.id));
                setLotesSeleccionados(selected);
            }
        }
    }, [proyecto, lotes]);

    // Inicializar colaboradores cuando cambia el proyecto o los colaboradores del hook
    useEffect(() => {
        if (!proyecto) return;
        // Solo cargar si hay colaboradores del hook Y aun no se han seleccionado
        if (Array.isArray(colaboradores) && colaboradores.length > 0 && colaboradoresSeleccionados.length === 0) {
            // Los colaboradores del hook pueden tener { id, usuario_id } de la BD local
            // o { id, nombre, correo } del API. Usar tal como vienen.
            setColaboradoresSeleccionados(colaboradores.map(c => ({
                id: c.usuario_id || c.id,
                nombre: c.nombre || c.name || null,
                correo: c.correo || c.email || null,
            })));
        }
        // Si colaboradoresSeleccionados ya tiene datos, no sobreescribir
    }, [proyecto, colaboradores]);

    const seleccionarLote = (lote) => {
        const isAlreadySelected = lotesSeleccionados.some(l => l.uuid_movil === lote.uuid_movil);
        let newSelected;
        if (isAlreadySelected) {
            newSelected = lotesSeleccionados.filter(l => l.uuid_movil !== lote.uuid_movil);
        } else {
            newSelected = [...lotesSeleccionados, lote];
        }
        setLotesSeleccionados(newSelected);
        setFormData(prev => ({ ...prev, lotes_ids: newSelected.map(l => l.uuid_movil) }));
    };

    const agregarLote = (lote) => {
        if (!lotesSeleccionados.some(l => l.uuid_movil === lote.uuid_movil)) {
            const newSelected = [...lotesSeleccionados, lote];
            setLotesSeleccionados(newSelected);
            setFormData(prev => ({ ...prev, lotes_ids: newSelected.map(l => l.uuid_movil) }));
        }
        setMostrarSelectorLote(false);
    };

    const quitarLote = (loteUuid) => {
        const newSelected = lotesSeleccionados.filter(l => l.uuid_movil !== loteUuid);
        setLotesSeleccionados(newSelected);
        setFormData(prev => ({ ...prev, lotes_ids: newSelected.map(l => l.uuid_movil) }));
    };

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
    // HELPERS
    // ============================================
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const month = months[parseInt(parts[1], 10) - 1];
        return `${parts[2]} ${month} ${parts[0]}`;
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
                {/* SECCION: LOTE */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Lotes ({lotesSeleccionados.length})
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        {/* Lotes seleccionados como chips */}
                        {lotesSeleccionados.length > 0 && (
                            <View style={styles.selectedLotesContainer}>
                                {lotesSeleccionados.map((lote) => (
                                    <View
                                        key={lote.uuid_movil || lote.id}
                                        style={[styles.loteChip, isDark && styles.loteChipDark]}
                                    >
                                        <MaterialCommunityIcons name="map-marker-radius" size={14} color="#34C759" />
                                        <Text style={[styles.loteChipText, isDark && styles.loteChipTextDark]} numberOfLines={1}>
                                            {lote.nombre_lote}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => quitarLote(lote.uuid_movil)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <MaterialCommunityIcons name="close-circle" size={16} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Botón para agregar más lotes */}
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMostrarSelectorLote(true)}
                        >
                            <Text style={styles.inputLabel}>
                                {lotesSeleccionados.length === 0 ? 'Seleccionar Lotes' : 'Agregar más lotes'}
                            </Text>
                            <View style={[styles.dateInput, isDark && styles.dateInputDark]}>
                                <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                                    {lotesSeleccionados.length === 0 ? 'Toca para seleccionar' : `${lotesSeleccionados.length} lote${lotesSeleccionados.length > 1 ? 's' : ''} seleccionado${lotesSeleccionados.length > 1 ? 's' : ''}`}
                                </Text>
                                <MaterialCommunityIcons name={lotesSeleccionados.length === 0 ? 'chevron-down' : 'plus'} size={20} color="#34C759" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

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
                            <Text style={styles.inputLabel}>Cultivo y Variedad</Text>
                            <TouchableOpacity
                                style={[styles.dateInput, isDark && styles.dateInputDark]}
                                onPress={() => setMostrarSelectorCultivoVariedad(true)}
                            >
                                <View style={styles.cultivoVariedadRow}>
                                    <MaterialCommunityIcons name="leaf" size={18} color={isDark ? '#8E8E93' : '#8E8E93'} />
                                    {cultivoSeleccionado ? (
                                        <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                                            {cultivoSeleccionado.nombre}
                                            {variedadSeleccionada ? ` → ${variedadSeleccionada.nombre}` : ' → Sin variedad'}
                                        </Text>
                                    ) : (
                                        <Text style={[styles.dateText, styles.dateTextPlaceholder, isDark && styles.dateTextDark]}>
                                            Toca para seleccionar
                                        </Text>
                                    )}
                                </View>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Fecha de Siembra</Text>
                            <TouchableOpacity
                                style={[styles.dateInput, isDark && styles.dateInputDark]}
                                onPress={() => setMostrarDatePicker(true)}
                            >
                                <Text style={[styles.dateText, !formData.fecha_siembra && styles.dateTextPlaceholder, isDark && styles.dateTextDark]}>
                                    {formData.fecha_siembra ? formatDisplayDate(formData.fecha_siembra) : 'Seleccionar fecha'}
                                </Text>
                                <MaterialCommunityIcons name="calendar" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                            </TouchableOpacity>
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
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMostrarSelectorEstado(true)}
                        >
                            <Text style={styles.inputLabel}>Seleccionar Estado</Text>
                            <View style={[styles.dateInput, isDark && styles.dateInputDark]}>
                                <Text style={[styles.dateText, !formData.estado && styles.dateTextPlaceholder, isDark && styles.dateTextDark]}>
                                    {ESTADOS.find(e => e.value === formData.estado)?.label || 'Toca para seleccionar'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                            </View>
                        </TouchableOpacity>
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
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMostrarSelectorTipoEnsayo(true)}
                        >
                            <Text style={styles.inputLabel}>Seleccionar Tipo</Text>
                            <View style={[styles.dateInput, isDark && styles.dateInputDark]}>
                                <Text style={[styles.dateText, !formData.tipo_ensayo && styles.dateTextPlaceholder, isDark && styles.dateTextDark]}>
                                    {TIPOS_ENSAAYO.find(t => t.value === formData.tipo_ensayo)?.label || 'Toca para seleccionar'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                            </View>
                        </TouchableOpacity>
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
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMostrarSelectorTipoAcolchado(true)}
                        >
                            <Text style={styles.inputLabel}>Seleccionar Tipo</Text>
                            <View style={[styles.dateInput, isDark && styles.dateInputDark]}>
                                <Text style={[styles.dateText, !formData.tipo_acolchado && styles.dateTextPlaceholder, isDark && styles.dateTextDark]}>
                                    {TIPOS_ACOLCHADO.find(t => t.value === formData.tipo_acolchado)?.label || 'Toca para seleccionar'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ============================================ */}
                {/* SECCION: COLABORADORES */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Colaboradores ({colaboradoresSeleccionados.length})
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        {/* Lista de colaboradores seleccionados */}
                        {colaboradoresSeleccionados.length > 0 && (
                            <View style={styles.selectedLotesContainer}>
                                {colaboradoresSeleccionados.map((colab) => (
                                    <View
                                        key={colab.id}
                                        style={[styles.loteChip, isDark && styles.loteChipDark]}
                                    >
                                        <MaterialCommunityIcons name="account" size={14} color="#34C759" />
                                        <Text style={[styles.loteChipText, isDark && styles.loteChipTextDark]} numberOfLines={1}>
                                            {colab.nombre || `Usuario ${colab.id}`}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const newSelected = colaboradoresSeleccionados.filter(c => c.id !== colab.id);
                                                setColaboradoresSeleccionados(newSelected);
                                                updateField('colaboradores_ids', newSelected.map(c => c.id));
                                            }}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <MaterialCommunityIcons name="close-circle" size={16} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMostrarColaboradoresModal(true)}
                        >
                            <Text style={styles.inputLabel}>
                                {colaboradoresSeleccionados.length === 0 ? 'Agregar Colaboradores' : 'Agregar más'}
                            </Text>
                            <View style={[styles.dateInput, isDark && styles.dateInputDark]}>
                                <View style={styles.colaboradorRow}>
                                    <MaterialCommunityIcons name="account-multiple" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                                    <Text style={[styles.dateText, isDark && styles.dateTextDark, { marginLeft: 8 }]}>
                                        {colaboradoresSeleccionados.length === 0 ? 'Toca para seleccionar' : `${colaboradoresSeleccionados.length} seleccionado${colaboradoresSeleccionados.length > 1 ? 's' : ''}`}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="plus" size={20} color="#34C759" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Modal Selector de Lote */}
            <Modal
                visible={mostrarSelectorLote}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMostrarSelectorLote(false)}
            >
                <View style={modalStyles.overlay}>
                    <View style={[modalStyles.content, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>Seleccionar Lotes</Text>
                            <TouchableOpacity onPress={() => setMostrarSelectorLote(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                            </TouchableOpacity>
                        </View>
                        {lotes.length === 0 ? (
                            <View style={modalStyles.emptyState}>
                                <MaterialCommunityIcons name="map-marker-off" size={48} color="#636366" />
                                <Text style={modalStyles.emptyText}>No hay lotes disponibles</Text>
                                <Text style={modalStyles.emptySubtext}>Crea un lote primero</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={lotes}
                                keyExtractor={(item) => item.uuid_movil || item.id?.toString()}
                                renderItem={({ item }) => {
                                    const isSelected = lotesSeleccionados.some(l => l.uuid_movil === item.uuid_movil);
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                modalStyles.loteItem,
                                                isSelected && modalStyles.loteItemSelected,
                                            ]}
                                            onPress={() => seleccionarLote(item)}
                                        >
                                            <MaterialCommunityIcons
                                                name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                                                size={22}
                                                color={isSelected ? '#34C759' : '#8E8E93'}
                                            />
                                            <View style={modalStyles.loteInfo}>
                                                <Text style={modalStyles.loteName}>{item.nombre_lote}</Text>
                                                {item.ubicacion_manual && (
                                                    <Text style={modalStyles.loteLocation}>{item.ubicacion_manual}</Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
                            />
                        )}
                        {lotesSeleccionados.length > 0 && (
                            <View style={modalStyles.footer}>
                                <TouchableOpacity
                                    style={modalStyles.doneButton}
                                    onPress={() => setMostrarSelectorLote(false)}
                                >
                                    <Text style={modalStyles.doneButtonText}>
                                        Listo ({lotesSeleccionados.length} seleccionado{lotesSeleccionados.length > 1 ? 's' : ''})
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Date Picker - Android native picker (ya es un dialogo del sistema, no necesita wrapper) */}
            {Platform.OS === 'android' && mostrarDatePicker && (
                <DateTimePicker
                    value={formData.fecha_siembra ? new Date(formData.fecha_siembra.split('-')[0], formData.fecha_siembra.split('-')[1] - 1, formData.fecha_siembra.split('-')[2]) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setMostrarDatePicker(false);
                        if (date) {
                            const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            updateField('fecha_siembra', formatted);
                        }
                    }}
                />
            )}

            {/* Date Picker - iOS: spinner envuelto en bottom sheet propio, sin huecos en blanco */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={mostrarDatePicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setMostrarDatePicker(false)}
                >
                    <View style={modalStyles.overlay}>
                        <Pressable style={{ flex: 1 }} onPress={() => setMostrarDatePicker(false)} />
                        <View style={[modalStyles.content, modalStyles.datePickerContent, { paddingBottom: insets.bottom + 16 }]}>
                            <View style={modalStyles.header}>
                                <Text style={modalStyles.title}>Fecha de Siembra</Text>
                                <TouchableOpacity onPress={() => setMostrarDatePicker(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={formData.fecha_siembra ? new Date(formData.fecha_siembra.split('-')[0], formData.fecha_siembra.split('-')[1] - 1, formData.fecha_siembra.split('-')[2]) : new Date()}
                                mode="date"
                                display="spinner"
                                textColor="#FFFFFF"
                                style={modalStyles.datePicker}
                                onChange={(event, date) => {
                                    if (date) {
                                        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                        updateField('fecha_siembra', formatted);
                                    }
                                }}
                            />
                            <View style={modalStyles.footer}>
                                <TouchableOpacity
                                    style={modalStyles.doneButton}
                                    onPress={() => setMostrarDatePicker(false)}
                                >
                                    <Text style={modalStyles.doneButtonText}>Listo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Modal Selector Tipo Ensayo */}
            <Modal
                visible={mostrarSelectorTipoEnsayo}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMostrarSelectorTipoEnsayo(false)}
            >
                <View style={modalStyles.overlay}>
                    <View style={[modalStyles.content, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>Tipo de Ensayo</Text>
                            <TouchableOpacity onPress={() => setMostrarSelectorTipoEnsayo(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={TIPOS_ENSAAYO}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[modalStyles.loteItem, formData.tipo_ensayo === item.value && modalStyles.loteItemSelected]}
                                    onPress={() => {
                                        updateField('tipo_ensayo', item.value);
                                        setMostrarSelectorTipoEnsayo(false);
                                    }}
                                >
                                    <Text style={modalStyles.loteName}>{item.label}</Text>
                                    {formData.tipo_ensayo === item.value && (
                                        <MaterialCommunityIcons name="check-circle" size={22} color="#34C759" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal Selector Tipo Acolchado */}
            <Modal
                visible={mostrarSelectorTipoAcolchado}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMostrarSelectorTipoAcolchado(false)}
            >
                <View style={modalStyles.overlay}>
                    <View style={[modalStyles.content, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>Tipo de Acolchado</Text>
                            <TouchableOpacity onPress={() => setMostrarSelectorTipoAcolchado(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={TIPOS_ACOLCHADO}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[modalStyles.loteItem, formData.tipo_acolchado === item.value && modalStyles.loteItemSelected]}
                                    onPress={() => {
                                        updateField('tipo_acolchado', item.value);
                                        setMostrarSelectorTipoAcolchado(false);
                                    }}
                                >
                                    <Text style={modalStyles.loteName}>{item.label}</Text>
                                    {formData.tipo_acolchado === item.value && (
                                        <MaterialCommunityIcons name="check-circle" size={22} color="#34C759" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal Selector Estado */}
            <Modal
                visible={mostrarSelectorEstado}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMostrarSelectorEstado(false)}
            >
                <View style={modalStyles.overlay}>
                    <View style={[modalStyles.content, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>Estado del Proyecto</Text>
                            <TouchableOpacity onPress={() => setMostrarSelectorEstado(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={ESTADOS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[modalStyles.loteItem, formData.estado === item.value && modalStyles.loteItemSelected]}
                                    onPress={() => {
                                        updateField('estado', item.value);
                                        setMostrarSelectorEstado(false);
                                    }}
                                >
                                    <Text style={modalStyles.loteName}>{item.label}</Text>
                                    {formData.estado === item.value && (
                                        <MaterialCommunityIcons name="check-circle" size={22} color="#34C759" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal Colaboradores */}
            <ColaboradoresModal
                visible={mostrarColaboradoresModal}
                onClose={() => setMostrarColaboradoresModal(false)}
                proyectoId={proyecto?.uuid_movil}
                onSelectMultiple={(colaboradores) => {
                    setColaboradoresSeleccionados(colaboradores);
                    updateField('colaboradores_ids', colaboradores.map(c => c.id));
                    setMostrarColaboradoresModal(false);
                }}
            />

            {/* Modal Selector Cultivo/Variedad */}
            <SelectorCultivoVariedad
                visible={mostrarSelectorCultivoVariedad}
                onClose={() => setMostrarSelectorCultivoVariedad(false)}
                cultivo_seleccionado={cultivoSeleccionado}
                variedad_seleccionada={variedadSeleccionada}
                onSelect={({ cultivo_id, cultivo_nombre, variedad_id, variedad_nombre }) => {
                    setCultivoSeleccionado(cultivo_id ? { id: cultivo_id, nombre: cultivo_nombre } : null);
                    setVariedadSeleccionada(variedad_nombre ? { id: null, nombre: variedad_nombre } : null);
                    updateField('cultivo_id', cultivo_id);
                    updateField('cultivo_nombre', cultivo_nombre);
                    updateField('variedad_id', null);
                    updateField('variedad_nombre', variedad_nombre);
                }}
            />
        </KeyboardAvoidingView>
    );
}

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    datePickerContent: {
        paddingTop: 0,
    },
    datePicker: {
        alignSelf: 'stretch',
        height: 216,
        marginTop: 4,
        marginBottom: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3A3A3C',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#636366',
        textAlign: 'center',
        marginTop: 4,
    },
    loteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 12,
    },
    loteItemSelected: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
    },
    loteInfo: {
        flex: 1,
    },
    loteName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    loteLocation: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#3A3A3C',
        marginLeft: 54,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#3A3A3C',
    },
    doneButton: {
        backgroundColor: '#34C759',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});