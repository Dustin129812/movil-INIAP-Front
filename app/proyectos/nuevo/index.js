// ============================================
// NUEVO PROYECTO - Formulario de Creacion
// ============================================
// Diseño: Apple-style con header animado, secciones, verde (#34C759)
// Origen: app/proyectos/nuevo/index.js

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    FlatList,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { proyectosStyles } from '../../../components/proyectos/ui';
import { proyectosLocalService } from '../../../services/proyectos';
import { localLotesService } from '../../../services/lotes';
import { useTheme } from '../../../services/theme';
import { crearProyectoStyles as styles } from '../../../src/styles/crearProyectoStyles';
import DatePickerWheel from '../../../components/calendario/ui/DatePickerWheel';
import { useLocalNotifications } from '../../../components/notifications/hooks/useLocalNotifications';
import ColaboradoresModal from '../../../components/proyectos/ui/ColaboradoresModal';

const HEADER_ANIMATION = {
    TOP_REVEAL_THRESHOLD: 12,
    HIDE_DURATION: 160,
    REVEAL_DURATION: 260,
    HEADER_ROW_HEIGHT: 42,
    HEADER_ROW_MARGIN_TOP: 2,
};

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

export default function NuevoProyectoScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();

    const [isSaving, setIsSaving] = useState(false);
    const [lotes, setLotes] = useState([]);
    const [mostrarSelectorLote, setMostrarSelectorLote] = useState(false);
    const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [mostrarSelectorTipoEnsayo, setMostrarSelectorTipoEnsayo] = useState(false);
    const [mostrarSelectorTipoAcolchado, setMostrarSelectorTipoAcolchado] = useState(false);
    const [mostrarSelectorEstado, setMostrarSelectorEstado] = useState(false);
    const [mostrarColaboradoresModal, setMostrarColaboradoresModal] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        variedad: '',
        fecha_siembra: '',
        estado: 'pendiente',
        tipo_ensayo: '',
        tipo_acolchado: '',
        financiamiento: '',
        colaborador_nombre: '',
        colaborador_celular: '',
        lote_id: null,
    });

    // Notificaciones
    const { notifyProyectoGuardado } = useLocalNotifications();

    // Animacion del header
    const scrollY = useSharedValue(0);
    const titleOpacity = useSharedValue(1);
    const titleTranslateY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    useAnimatedReaction(
        () => scrollY.value <= HEADER_ANIMATION.TOP_REVEAL_THRESHOLD,
        (isAtTop, wasAtTop) => {
            if (isAtTop === wasAtTop) return;
            if (isAtTop) {
                titleOpacity.value = withTiming(1, { duration: HEADER_ANIMATION.REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                titleTranslateY.value = withTiming(0, { duration: HEADER_ANIMATION.REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
            } else {
                titleOpacity.value = withTiming(0, { duration: HEADER_ANIMATION.HIDE_DURATION, easing: Easing.in(Easing.cubic) });
                titleTranslateY.value = withTiming(-6, { duration: HEADER_ANIMATION.HIDE_DURATION, easing: Easing.in(Easing.cubic) });
            }
        },
        [HEADER_ANIMATION.TOP_REVEAL_THRESHOLD]
    );

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }));

    const scrollTopPadding = insets.top + HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP + HEADER_ANIMATION.HEADER_ROW_HEIGHT + 20;

    useEffect(() => {
        cargarLotes();
    }, []);

    const cargarLotes = async () => {
        try {
            await localLotesService.inicializarBaseDatosLocal();
            const lotesData = await localLotesService.obtenerLotes();
            setLotes(lotesData || []);
        } catch (error) {
            // console removed
        }
    };

    const seleccionarLote = (lote) => {
        setLoteSeleccionado(lote);
        setFormData(prev => ({ ...prev, lote_id: lote.id, lote_uuid: lote.uuid_movil }));
        setMostrarSelectorLote(false);
    };

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const validar = () => {
        if (!formData.titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return false;
        }
        if (!formData.lote_id) {
            Alert.alert('Error', 'Debes seleccionar un lote');
            return false;
        }
        if (!formData.variedad.trim()) {
            Alert.alert('Error', 'La variedad es requerida');
            return false;
        }
        return true;
    };

    const handleGuardar = async () => {
        if (!validar()) return;

        setIsSaving(true);
        try {
            const resultado = await proyectosLocalService.crearProyectoLocal(formData);
            if (resultado.success) {
                notifyProyectoGuardado(formData.titulo || 'Nuevo Proyecto');
                router.back();
            } else {
                Alert.alert('Error', resultado.message || 'No se pudo crear el proyecto');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error al crear el proyecto');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const month = months[parseInt(parts[1], 10) - 1];
        return `${parts[2]} ${month} ${parts[0]}`;
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Scrim de legibilidad */}
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
                        <MaterialCommunityIcons name="chevron-left" size={22} color="#34C759" />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, isDark && styles.textWhite]}>
                        Nuevo Proyecto
                    </Text>

                    <View style={{ width: 36 }} />
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
                        Lote *
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMostrarSelectorLote(true)}
                        >
                            <Text style={styles.inputLabel}>Seleccionar Lote</Text>
                            <View style={[styles.dateInput, isDark && styles.dateInputDark]}>
                                <Text style={[styles.dateText, !loteSeleccionado && styles.dateTextPlaceholder, isDark && styles.dateTextDark]}>
                                    {loteSeleccionado?.nombre_lote || 'Toca para seleccionar'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
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
                                placeholder="Describe el objetivo del proyecto"
                                placeholderTextColor={isDark ? '#636366' : '#999'}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                value={formData.descripcion}
                                onChangeText={(v) => updateField('descripcion', v)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Variedad *</Text>
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
                            <TouchableOpacity
                                style={[styles.dateInput, isDark && styles.dateInputDark]}
                                onPress={() => setMostrarSelectorFecha(true)}
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
                {/* SECCION: COLABORADOR */}
                {/* ============================================ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                        Información del Colaborador
                    </Text>
                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setMostrarColaboradoresModal(true)}
                        >
                            <Text style={styles.inputLabel}>Colaborador</Text>
                            <View style={[styles.dateInput, isDark && styles.dateInputDark]}>
                                <View style={styles.colaboradorRow}>
                                    <MaterialCommunityIcons name="account-multiple" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                                    <Text style={[styles.dateText, !formData.colaborador_nombre && styles.dateTextPlaceholder, isDark && styles.dateTextDark, { marginLeft: 8 }]}>
                                        {formData.colaborador_nombre || 'Toca para agregar'}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#8E8E93' : '#8E8E93'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ============================================ */}
                {/* BOTON CREAR */}
                {/* ============================================ */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, isSaving && styles.buttonDisabled]}
                        onPress={handleGuardar}
                        disabled={isSaving}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {isSaving ? 'Guardando...' : 'Crear Proyecto'}
                        </Text>
                    </TouchableOpacity>
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
                            <Text style={modalStyles.title}>Seleccionar Lote</Text>
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
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.loteItem,
                                            loteSeleccionado?.id === item.id && modalStyles.loteItemSelected,
                                        ]}
                                        onPress={() => seleccionarLote(item)}
                                    >
                                        <MaterialCommunityIcons
                                            name="map-marker-radius"
                                            size={22}
                                            color={loteSeleccionado?.id === item.id ? '#34C759' : '#34C759'}
                                        />
                                        <View style={modalStyles.loteInfo}>
                                            <Text style={modalStyles.loteName}>{item.nombre_lote}</Text>
                                            {item.ubicacion_manual && (
                                                <Text style={modalStyles.loteLocation}>{item.ubicacion_manual}</Text>
                                            )}
                                        </View>
                                        {loteSeleccionado?.id === item.id && (
                                            <MaterialCommunityIcons name="check-circle" size={22} color="#34C759" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Date Picker */}
            <DatePickerWheel
                visible={mostrarSelectorFecha}
                value={formData.fecha_siembra}
                onChange={(date) => updateField('fecha_siembra', date)}
                onClose={() => setMostrarSelectorFecha(false)}
                isDark={isDark}
            />

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
                proyectoId={null}
                onSelectSingle={(colaborador) => {
                    updateField('colaborador_nombre', colaborador.nombre || '');
                    updateField('colaborador_celular', colaborador.celular || '');
                    setMostrarColaboradoresModal(false);
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
});
