import React, { useState, useCallback, useEffect, useRef } from 'react';
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
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { SelectorCultivoVariedad } from '../../../components/proyectos/ui';
import { proyectosLocalService } from '../../../services/proyectos';
import { localLotesService } from '../../../services/lotes';
import { useTheme } from '../../../services/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalNotifications } from '../../../components/notifications/hooks/useLocalNotifications';
import ColaboradoresModal from '../../../components/proyectos/ui/ColaboradoresModal';

const ACCENT = '#34C759';
const DANGER = '#FF3B30';

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

const STEPS = [
    { key: 'lotes', title: 'Lotes', icon: 'map-marker-radius' },
    { key: 'datos', title: 'Datos', icon: 'file-document-edit-outline' },
    { key: 'config', title: 'Config', icon: 'tune-variant' },
    { key: 'equipo', title: 'Equipo', icon: 'account-group-outline' },
];

const SectionCard = ({ icon, title, subtitle, children, isDark }) => (
    <View style={[wiz.card, isDark && wiz.cardDark]}>
        <View style={wiz.cardHeaderRow}>
            <View style={[wiz.cardIconCircle, isDark && wiz.cardIconCircleDark]}>
                <MaterialCommunityIcons name={icon} size={18} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[wiz.cardTitle, isDark && wiz.textWhite]}>{title}</Text>
                {subtitle ? (
                    <Text style={[wiz.cardSubtitle, isDark && wiz.cardSubtitleDark]}>{subtitle}</Text>
                ) : null}
            </View>
        </View>
        {children}
    </View>
);

const SelectorField = ({ label, value, placeholder, icon, onPress, isDark, required }) => (
    <TouchableOpacity style={wiz.selectorField} onPress={onPress} activeOpacity={0.7}>
        <View style={{ flex: 1 }}>
            <Text style={[wiz.fieldLabel, isDark && wiz.fieldLabelDark]}>
                {label}{required ? ' *' : ''}
            </Text>
            <View style={wiz.selectorValueRow}>
                {icon && (
                    <MaterialCommunityIcons
                        name={icon}
                        size={16}
                        color={isDark ? '#8E8E93' : '#8E8E93'}
                        style={{ marginRight: 6 }}
                    />
                )}
                <Text
                    numberOfLines={1}
                    style={[
                        wiz.selectorValueText,
                        !value && wiz.selectorPlaceholder,
                        isDark && wiz.textWhite,
                        !value && isDark && { color: '#636366' },
                    ]}
                >
                    {value || placeholder}
                </Text>
            </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#48484A' : '#C7C7CC'} />
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
    const [tempDate, setTempDate] = useState(new Date());
    const [lotesSeleccionados, setLotesSeleccionados] = useState([]);
    const [mostrarSelectorTipoEnsayo, setMostrarSelectorTipoEnsayo] = useState(false);
    const [mostrarSelectorTipoAcolchado, setMostrarSelectorTipoAcolchado] = useState(false);
    const [mostrarSelectorEstado, setMostrarSelectorEstado] = useState(false);
    const [mostrarColaboradoresModal, setMostrarColaboradoresModal] = useState(false);
    const [mostrarSelectorCultivoVariedad, setMostrarSelectorCultivoVariedad] = useState(false);
    const [cultivoSeleccionado, setCultivoSeleccionado] = useState(null);
    const [variedadSeleccionada, setVariedadSeleccionada] = useState(null);
    const [colaboradoresSeleccionados, setColaboradoresSeleccionados] = useState([]);

    const [currentStep, setCurrentStep] = useState(0);
    const [maxReachedStep, setMaxReachedStep] = useState(0);
    const contentOpacity = useSharedValue(1);
    const contentTranslate = useSharedValue(0);
    const scrollRef = useRef(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        cultivo_id: null,
        cultivo_nombre: '',
        variedad_id: null,
        variedad_nombre: '',
        fecha_siembra: '',
        estado: 'pendiente',
        tipo_ensayo: '',
        tipo_acolchado: '',
        financiamiento: '',
        lotes_ids: [],
        colaboradores_ids: [],
    });

    const { notifyProyectoGuardado } = useLocalNotifications();

    useEffect(() => {
        cargarLotes();
    }, []);

    const cargarLotes = async () => {
        try {
            await localLotesService.inicializarBaseDatosLocal();
            const lotesData = await localLotesService.obtenerLotes();
            setLotes(lotesData || []);
        } catch (error) {
            // silencio
        }
    };

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

    const quitarLote = (loteUuid) => {
        const newSelected = lotesSeleccionados.filter(l => l.uuid_movil !== loteUuid);
        setLotesSeleccionados(newSelected);
        setFormData(prev => ({ ...prev, lotes_ids: newSelected.map(l => l.uuid_movil) }));
    };

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const validar = () => {
        if (!formData.titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return false;
        }
        if (!formData.lotes_ids || formData.lotes_ids.length === 0) {
            Alert.alert('Error', 'Debes seleccionar al menos un lote');
            return false;
        }
        if (!formData.cultivo_id) {
            Alert.alert('Error', 'Debes seleccionar un cultivo');
            return false;
        }
        return true;
    };

    const validarPaso = (step) => {
        if (step === 0) {
            if (lotesSeleccionados.length === 0) {
                Alert.alert('Falta información', 'Selecciona al menos un lote para continuar');
                return false;
            }
        }
        if (step === 1) {
            if (!formData.titulo.trim()) {
                Alert.alert('Falta información', 'El nombre del proyecto es requerido');
                return false;
            }
            if (!formData.cultivo_id) {
                Alert.alert('Falta información', 'Selecciona un cultivo y variedad');
                return false;
            }
        }
        return true;
    };

    const animateToStep = (nextStep) => {
        contentOpacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.cubic) }, (finished) => {
            if (finished) {
                contentOpacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
            }
        });
        contentTranslate.value = 8;
        contentTranslate.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
        setCurrentStep(nextStep);
        setMaxReachedStep(prev => Math.max(prev, nextStep));
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    };

    const irSiguiente = () => {
        if (!validarPaso(currentStep)) return;
        if (currentStep < STEPS.length - 1) {
            animateToStep(currentStep + 1);
        }
    };

    const irAtras = () => {
        if (currentStep === 0) {
            router.back();
            return;
        }
        animateToStep(currentStep - 1);
    };

    const irAPaso = (index) => {
        animateToStep(index);
    };

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslate.value }],
    }));

    const handleGuardar = async () => {
        if (!validar()) return;

        setIsSaving(true);
        try {
            const datosParaGuardar = {
                ...formData,
                lotes_uuids: formData.lotes_ids,
            };
            const resultado = await proyectosLocalService.crearProyectoLocal(datosParaGuardar);
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

    const isLastStep = currentStep === STEPS.length - 1;

    return (
        <KeyboardAvoidingView
            style={[wiz.container, isDark && wiz.containerDark]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.0)']
                        : ['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.0)']
                }
                style={[wiz.statusBarScrim, { height: insets.top + 24 }]}
            />
            {isDark && (
                <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']}
                    style={[wiz.statusBarScrimDark, { height: insets.top + 52 }]}
                />
            )}

            {/* HEADER CON STEPPER */}
            <View style={[wiz.header, isDark && wiz.headerDark, { paddingTop: insets.top + 12 }]}>
                <View style={wiz.headerTopRow}>
                    <TouchableOpacity
                        style={[wiz.backButton, isDark && wiz.backButtonDark]}
                        onPress={irAtras}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={22} color={ACCENT} />
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={[wiz.headerTitle, isDark && wiz.textWhite]}>Nuevo Proyecto</Text>
                        <Text style={[wiz.headerStepLabel, isDark && wiz.headerStepLabelDark]}>
                            Paso {currentStep + 1} de {STEPS.length} · {STEPS[currentStep].title}
                        </Text>
                    </View>

                    <View style={{ width: 36 }} />
                </View>

                <View style={wiz.stepperWrap}>
                    <View style={wiz.stepperRow}>
                        {STEPS.map((step, index) => {
                            const isDone = index < currentStep;
                            const isActive = index === currentStep;
                            const isReachable = index <= maxReachedStep;
                            return (
                                <React.Fragment key={step.key}>
                                    <TouchableOpacity
                                        style={wiz.stepItem}
                                        activeOpacity={isReachable ? 0.7 : 1}
                                        disabled={!isReachable}
                                        onPress={() => isReachable && irAPaso(index)}
                                    >
                                        <View style={[wiz.stepCircle, isDark && wiz.stepCircleDark, (isDone || isActive) && wiz.stepCircleFilled]}>
                                            {isDone ? (
                                                <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                                            ) : (
                                                <Text style={[wiz.stepNumber, isDark && wiz.stepNumberDark, isActive && wiz.stepNumberActive]}>
                                                    {index + 1}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={[wiz.stepLabel, isDark && wiz.stepLabelDark, isActive && wiz.stepLabelActive]}>{step.title}</Text>
                                    </TouchableOpacity>
                                    {index < STEPS.length - 1 && (
                                        <View style={[wiz.stepConnector, isDark && wiz.stepConnectorDark, isDone && wiz.stepConnectorDone]} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* CONTENIDO DEL WIZARD */}
            <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
                <ScrollView
                    ref={scrollRef}
                    style={wiz.scrollView}
                    contentContainerStyle={wiz.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* PASO 1: LOTES */}
                    {currentStep === 0 && (
                        <SectionCard
                            icon="map-marker-radius"
                            title="Lotes del proyecto"
                            subtitle="Selecciona uno o más lotes donde se ejecutará"
                            isDark={isDark}
                        >
                            {lotesSeleccionados.length > 0 ? (
                                <View style={wiz.selectedLotesList}>
                                    {lotesSeleccionados.map((lote) => (
                                        <View 
                                            key={lote.uuid_movil || lote.id} 
                                            style={[wiz.selectedLoteCard, isDark && wiz.selectedLoteCardDark]}
                                        >
                                            <View style={[wiz.loteIconBox, isDark && wiz.loteIconBoxDark]}>
                                                <MaterialCommunityIcons name="map-marker" size={20} color={ACCENT} />
                                            </View>
                                            <View style={{ flex: 1, marginHorizontal: 10 }}>
                                                <Text numberOfLines={1} style={[wiz.selectedLoteTitle, isDark && wiz.textWhite]}>
                                                    {lote.nombre_lote}
                                                </Text>
                                                <Text numberOfLines={1} style={[wiz.selectedLoteSubtitle, isDark && wiz.selectedLoteSubtitleDark]}>
                                                    {lote.ubicacion_manual || 'Lote vinculado al proyecto'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity 
                                                onPress={() => quitarLote(lote.uuid_movil)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <MaterialCommunityIcons name="close-circle-outline" size={20} color={DANGER} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : null}

                            <TouchableOpacity
                                style={[
                                    wiz.selectorLoteBox, 
                                    isDark && wiz.selectorLoteBoxDark,
                                    lotesSeleccionados.length > 0 && wiz.selectorLoteBoxActive
                                ]}
                                onPress={() => setMostrarSelectorLote(true)}
                                activeOpacity={0.75}
                            >
                                <View style={[wiz.selectorIconCircle, isDark && wiz.selectorIconCircleDark]}>
                                    <MaterialCommunityIcons name="map-marker-plus" size={24} color={ACCENT} />
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={[wiz.selectorMainText, isDark && wiz.textWhite]}>
                                        {lotesSeleccionados.length === 0 ? 'Seleccionar lotes' : 'Añadir más lotes'}
                                    </Text>
                                    <Text style={wiz.selectorSubText}>
                                        {lotesSeleccionados.length === 0 ? 'Toca aquí para elegir de la lista' : 'Vincular otro terreno al proyecto'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {lotesSeleccionados.length === 0 && (
                                <View style={wiz.hintRow}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#8E8E93" />
                                    <Text style={wiz.hintText}>Es obligatorio seleccionar al menos un lote</Text>
                                </View>
                            )}
                        </SectionCard>
                    )}

                    {/* PASO 2: DATOS */}
                    {currentStep === 1 && (
                        <SectionCard
                            icon="file-document-edit-outline"
                            title="Datos del proyecto"
                            subtitle="Información básica y de siembra"
                            isDark={isDark}
                        >
                            <View style={wiz.inputBlock}>
                                <Text style={[wiz.fieldLabel, isDark && wiz.fieldLabelDark]}>Nombre *</Text>
                                <TextInput
                                    style={[wiz.textInput, isDark && wiz.textInputDark]}
                                    placeholder="Nombre del proyecto"
                                    placeholderTextColor={isDark ? '#636366' : '#A0A0A5'}
                                    value={formData.titulo}
                                    onChangeText={(v) => updateField('titulo', v)}
                                />
                            </View>

                            <View style={wiz.inputBlock}>
                                <Text style={[wiz.fieldLabel, isDark && wiz.fieldLabelDark]}>Descripción</Text>
                                <TextInput
                                    style={[wiz.textInput, wiz.textArea, isDark && wiz.textInputDark]}
                                    placeholder="Describe el objetivo del proyecto"
                                    placeholderTextColor={isDark ? '#636366' : '#A0A0A5'}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    value={formData.descripcion}
                                    onChangeText={(v) => updateField('descripcion', v)}
                                />
                            </View>

                            <SelectorField
                                label="Cultivo y variedad"
                                required
                                icon="leaf"
                                isDark={isDark}
                                placeholder="Toca para seleccionar"
                                value={
                                    cultivoSeleccionado
                                        ? `${cultivoSeleccionado.nombre}${variedadSeleccionada ? ` → ${variedadSeleccionada.nombre}` : ' → Sin variedad'}`
                                        : null
                                }
                                onPress={() => setMostrarSelectorCultivoVariedad(true)}
                            />

                            <SelectorField
                                label="Fecha de siembra"
                                icon="calendar"
                                isDark={isDark}
                                placeholder="Seleccionar fecha"
                                value={formData.fecha_siembra ? formatDisplayDate(formData.fecha_siembra) : null}
                                onPress={() => {
                                    if (formData.fecha_siembra) {
                                        const p = formData.fecha_siembra.split('-');
                                        setTempDate(new Date(p[0], p[1] - 1, p[2]));
                                    } else {
                                        setTempDate(new Date());
                                    }
                                    setMostrarSelectorFecha(true);
                                }}
                            />
                        </SectionCard>
                    )}

                    {/* PASO 3: CONFIGURACIÓN */}
                    {currentStep === 2 && (
                        <SectionCard
                            icon="tune-variant"
                            title="Configuración"
                            subtitle="Estado y tipo del ensayo"
                            isDark={isDark}
                        >
                            <SelectorField
                                label="Estado"
                                icon="flag-outline"
                                isDark={isDark}
                                placeholder="Toca para seleccionar"
                                value={ESTADOS.find(e => e.value === formData.estado)?.label}
                                onPress={() => setMostrarSelectorEstado(true)}
                            />
                            <SelectorField
                                label="Tipo de ensayo"
                                icon="flask-outline"
                                isDark={isDark}
                                placeholder="Toca para seleccionar"
                                value={TIPOS_ENSAAYO.find(t => t.value === formData.tipo_ensayo)?.label}
                                onPress={() => setMostrarSelectorTipoEnsayo(true)}
                            />
                            <SelectorField
                                label="Tipo de acolchado"
                                icon="layers-outline"
                                isDark={isDark}
                                placeholder="Toca para seleccionar"
                                value={TIPOS_ACOLCHADO.find(t => t.value === formData.tipo_acolchado)?.label}
                                onPress={() => setMostrarSelectorTipoAcolchado(true)}
                            />
                        </SectionCard>
                    )}

                    {/* PASO 4: EQUIPO (COLABORADORES REDISEÑADO) + RESUMEN */}
                    {currentStep === 3 && (
                        <>
                            <SectionCard
                                icon="account-group-outline"
                                title="Colaboradores"
                                subtitle="Agrega al equipo que participará"
                                isDark={isDark}
                            >
                                {colaboradoresSeleccionados.length > 0 ? (
                                    <View style={wiz.selectedLotesList}>
                                        {colaboradoresSeleccionados.map((colab) => (
                                            <View 
                                                key={colab.id} 
                                                style={[wiz.selectedLoteCard, isDark && wiz.selectedLoteCardDark]}
                                            >
                                                <View style={[wiz.loteIconBox, isDark && wiz.loteIconBoxDark]}>
                                                    <MaterialCommunityIcons name="account" size={20} color={ACCENT} />
                                                </View>
                                                <View style={{ flex: 1, marginHorizontal: 10 }}>
                                                    <Text numberOfLines={1} style={[wiz.selectedLoteTitle, isDark && wiz.textWhite]}>
                                                        {colab.nombre}
                                                    </Text>
                                                    <Text numberOfLines={1} style={[wiz.selectedLoteSubtitle, isDark && wiz.selectedLoteSubtitleDark]}>
                                                        {colab.email || 'Colaborador del proyecto'}
                                                    </Text>
                                                </View>
                                                <TouchableOpacity 
                                                    onPress={() => {
                                                        const newSelected = colaboradoresSeleccionados.filter(c => c.id !== colab.id);
                                                        setColaboradoresSeleccionados(newSelected);
                                                        updateField('colaboradores_ids', newSelected.map(c => c.id));
                                                    }}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <MaterialCommunityIcons name="close-circle-outline" size={20} color={DANGER} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                ) : null}

                                <TouchableOpacity
                                    style={[
                                        wiz.selectorLoteBox, 
                                        isDark && wiz.selectorLoteBoxDark,
                                        colaboradoresSeleccionados.length > 0 && wiz.selectorLoteBoxActive
                                    ]}
                                    onPress={() => setMostrarColaboradoresModal(true)}
                                    activeOpacity={0.75}
                                >
                                    <View style={[wiz.selectorIconCircle, isDark && wiz.selectorIconCircleDark]}>
                                        <MaterialCommunityIcons name="account-plus" size={24} color={ACCENT} />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={[wiz.selectorMainText, isDark && wiz.textWhite]}>
                                            {colaboradoresSeleccionados.length === 0 ? 'Agregar colaboradores' : 'Agregar más'}
                                        </Text>
                                        <Text style={wiz.selectorSubText}>
                                            {colaboradoresSeleccionados.length === 0 ? 'Toca aquí para invitar al equipo' : 'Vincular otro miembro al proyecto'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </SectionCard>

                            <SectionCard
                                icon="clipboard-check-outline"
                                title="Resumen"
                                subtitle="Revisa antes de crear el proyecto"
                                isDark={isDark}
                            >
                                <SummaryRow label="Nombre" value={formData.titulo || '—'} isDark={isDark} />
                                <SummaryRow
                                    label="Cultivo"
                                    value={cultivoSeleccionado ? cultivoSeleccionado.nombre : '—'}
                                    isDark={isDark}
                                />
                                <SummaryRow
                                    label="Lotes"
                                    value={lotesSeleccionados.length ? `${lotesSeleccionados.length} seleccionado(s)` : '—'}
                                    isDark={isDark}
                                />
                                <SummaryRow
                                    label="Estado"
                                    value={ESTADOS.find(e => e.value === formData.estado)?.label || '—'}
                                    isDark={isDark}
                                />
                                <SummaryRow
                                    label="Fecha siembra"
                                    value={formData.fecha_siembra ? formatDisplayDate(formData.fecha_siembra) : '—'}
                                    isDark={isDark}
                                    last
                                />
                            </SectionCard>
                        </>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </Animated.View>

            {/* FOOTER FLOTANTE */}
            <View style={[wiz.floatingFooterWrap, { paddingBottom: insets.bottom + 16 }]}>
                <View style={wiz.pillButtonsRow}>
                    <TouchableOpacity
                        style={[wiz.pillBackButton, isDark ? wiz.pillBackButtonDark : wiz.pillBackButtonLight]}
                        onPress={irAtras}
                        activeOpacity={0.7}
                        disabled={currentStep === 0 && isSaving}
                    >
                        <MaterialCommunityIcons 
                            name={currentStep === 0 ? "close" : "chevron-left"} 
                            size={24} 
                            color={isDark ? "#FFFFFF" : "#1C1C1E"} 
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[wiz.pillNextButton, isSaving && wiz.footerBtnDisabled]}
                        onPress={isLastStep ? handleGuardar : irSiguiente}
                        disabled={isSaving}
                        activeOpacity={0.85}
                    >
                        <Text style={wiz.pillNextButtonText}>
                            {isLastStep ? (isSaving ? 'Guardando...' : 'Crear Proyecto') : 'Siguiente'}
                        </Text>
                        {!isLastStep && <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />}
                        {isLastStep && !isSaving && <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modales */}
            <Modal visible={mostrarSelectorLote} transparent={true} animationType="slide" onRequestClose={() => setMostrarSelectorLote(false)}>
                <View style={modalStyles.overlay}>
                    <View style={[modalStyles.content, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={modalStyles.grabber} />
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>Seleccionar Lotes</Text>
                            <TouchableOpacity onPress={() => setMostrarSelectorLote(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
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
                                            style={[modalStyles.optionRow, isSelected && modalStyles.optionRowSelected]}
                                            onPress={() => seleccionarLote(item)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[modalStyles.radioOuter, isSelected && modalStyles.radioOuterActive]}>
                                                {isSelected && <View style={modalStyles.radioInner} />}
                                            </View>
                                            <View style={modalStyles.optionInfo}>
                                                <Text style={modalStyles.optionName}>{item.nombre_lote}</Text>
                                                {item.ubicacion_manual && (
                                                    <Text style={modalStyles.optionSubtext}>{item.ubicacion_manual}</Text>
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
                                <TouchableOpacity style={modalStyles.doneButton} onPress={() => setMostrarSelectorLote(false)}>
                                    <Text style={modalStyles.doneButtonText}>
                                        Listo ({lotesSeleccionados.length} seleccionado{lotesSeleccionados.length > 1 ? 's' : ''})
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {Platform.OS === 'android' && mostrarSelectorFecha && (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setMostrarSelectorFecha(false);
                        if (date) {
                            const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            updateField('fecha_siembra', formatted);
                        }
                    }}
                />
            )}

            {Platform.OS === 'ios' && (
                <Modal visible={mostrarSelectorFecha} transparent={true} animationType="slide" onRequestClose={() => setMostrarSelectorFecha(false)}>
                    <View style={modalStyles.overlay}>
                        <View style={[modalStyles.content, { paddingBottom: insets.bottom + 16 }]}>
                            <View style={modalStyles.grabber} />
                            <View style={modalStyles.header}>
                                <Text style={modalStyles.title}>Fecha de Siembra</Text>
                                <TouchableOpacity onPress={() => setMostrarSelectorFecha(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    textColor="#FFFFFF"
                                    onChange={(event, date) => {
                                        if (date) setTempDate(date);
                                    }}
                                    style={{ width: '100%', height: 180 }}
                                />
                            </View>

                            <View style={modalStyles.footer}>
                                <TouchableOpacity 
                                    style={modalStyles.doneButton} 
                                    onPress={() => {
                                        const formatted = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;
                                        updateField('fecha_siembra', formatted);
                                        setMostrarSelectorFecha(false);
                                    }}
                                >
                                    <Text style={modalStyles.doneButtonText}>Confirmar Fecha</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            <SimpleOptionModal
                visible={mostrarSelectorTipoEnsayo}
                title="Tipo de Ensayo"
                options={TIPOS_ENSAAYO}
                selectedValue={formData.tipo_ensayo}
                onClose={() => setMostrarSelectorTipoEnsayo(false)}
                onSelect={(v) => { updateField('tipo_ensayo', v); setMostrarSelectorTipoEnsayo(false); }}
            />
            <SimpleOptionModal
                visible={mostrarSelectorTipoAcolchado}
                title="Tipo de Acolchado"
                options={TIPOS_ACOLCHADO}
                selectedValue={formData.tipo_acolchado}
                onClose={() => setMostrarSelectorTipoAcolchado(false)}
                onSelect={(v) => { updateField('tipo_acolchado', v); setMostrarSelectorTipoAcolchado(false); }}
            />
            <SimpleOptionModal
                visible={mostrarSelectorEstado}
                title="Estado del Proyecto"
                options={ESTADOS}
                selectedValue={formData.estado}
                onClose={() => setMostrarSelectorEstado(false)}
                onSelect={(v) => { updateField('estado', v); setMostrarSelectorEstado(false); }}
            />
            <ColaboradoresModal
                visible={mostrarColaboradoresModal}
                onClose={() => setMostrarColaboradoresModal(false)}
                proyectoId={null}
                onSelectMultiple={(colaboradores) => {
                    setColaboradoresSeleccionados(colaboradores);
                    updateField('colaboradores_ids', colaboradores.map(c => c.id));
                    setMostrarColaboradoresModal(false);
                }}
            />
            <SelectorCultivoVariedad
                visible={mostrarSelectorCultivoVariedad}
                onClose={() => setMostrarSelectorCultivoVariedad(false)}
                cultivo_seleccionado={cultivoSeleccionado}
                variedad_seleccionada={variedadSeleccionada}
                onSelect={({ cultivo_id, cultivo_nombre, variedad_id, variedad_nombre }) => {
                    setCultivoSeleccionado({ id: cultivo_id, nombre: cultivo_nombre });
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

const SummaryRow = ({ label, value, isDark, last }) => (
    <View style={[wiz.summaryRow, !last && wiz.summaryRowBorder, isDark && wiz.summaryRowBorderDark]}>
        <Text style={[wiz.summaryLabel, isDark && wiz.summaryLabelDark]}>{label}</Text>
        <Text style={[wiz.summaryValue, isDark && wiz.textWhite]} numberOfLines={1}>{value}</Text>
    </View>
);

const SimpleOptionModal = ({ visible, title, options, selectedValue, onClose, onSelect }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={modalStyles.overlay}>
            <View style={modalStyles.content}>
                <View style={modalStyles.grabber} />
                <View style={modalStyles.header}>
                    <Text style={modalStyles.title}>{title}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => {
                        const isSelected = selectedValue === item.value;
                        return (
                            <TouchableOpacity
                                style={[modalStyles.optionRow, isSelected && modalStyles.optionRowSelected]}
                                onPress={() => onSelect(item.value)}
                                activeOpacity={0.7}
                            >
                                <View style={[modalStyles.radioOuter, isSelected && modalStyles.radioOuterActive]}>
                                    {isSelected && <View style={modalStyles.radioInner} />}
                                </View>
                                <Text style={modalStyles.optionName}>{item.label}</Text>
                            </TouchableOpacity>
                        );
                    }}
                    ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
                />
            </View>
        </View>
    </Modal>
);

const wiz = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    containerDark: { backgroundColor: '#000000' },
    statusBarScrim: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
    textWhite: { color: '#FFFFFF' },

    header: { zIndex: 2 },
    headerDark: {},
    statusBarScrimDark: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
    backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(52,199,89,0.12)', alignItems: 'center', justifyContent: 'center' },
    backButtonDark: { backgroundColor: 'rgba(52,199,89,0.18)' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
    headerStepLabel: { fontSize: 12, color: '#8E8E93', marginTop: 2, textAlign: 'center' },
    headerStepLabelDark: { color: '#8E8E93' },

    stepperWrap: { paddingHorizontal: 18 },
    stepperRow: { flexDirection: 'row', alignItems: 'flex-start' },
    stepItem: { alignItems: 'center', width: 56 },
    stepCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#D1D1D6', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
    stepCircleDark: { borderColor: '#3A3A3C', backgroundColor: '#1C1C1E' },
    stepCircleFilled: { backgroundColor: '#1C1C1E', borderColor: '#1C1C1E' },
    stepNumber: { fontSize: 13, fontWeight: '700', color: '#AEAEB2' },
    stepNumberDark: { color: '#636366' },
    stepNumberActive: { color: '#FFFFFF' },
    stepLabel: { fontSize: 11, color: '#AEAEB2', marginTop: 6, fontWeight: '500' },
    stepLabelDark: { color: '#636366' },
    stepLabelActive: { color: '#1C1C1E', fontWeight: '700' },
    stepConnector: { flex: 1, height: 2, backgroundColor: '#D1D1D6', marginTop: 14, marginHorizontal: -4 },
    stepConnectorDark: { backgroundColor: '#3A3A3C' },
    stepConnectorDone: { backgroundColor: '#1C1C1E' },

    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 20 },

    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
    cardDark: { backgroundColor: '#1C1C1E' },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardIconCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(52,199,89,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardIconCircleDark: { backgroundColor: 'rgba(52,199,89,0.18)' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
    cardSubtitle: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    cardSubtitleDark: { color: '#8E8E93' },

    selectorLoteBox: {
        borderWidth: 2,
        borderColor: 'rgba(52, 199, 89, 0.4)',
        borderStyle: 'dashed',
        borderRadius: 16,
        paddingVertical: 22,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(52, 199, 89, 0.04)',
        gap: 10,
        marginBottom: 8,
    },
    selectorLoteBoxDark: {
        backgroundColor: 'rgba(52, 199, 89, 0.07)',
        borderColor: 'rgba(52, 199, 89, 0.35)',
    },
    selectorLoteBoxActive: {
        marginTop: 6,
        paddingVertical: 16,
    },
    selectorIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(52, 199, 89, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    selectorIconCircleDark: {
        backgroundColor: 'rgba(52, 199, 89, 0.22)',
    },
    selectorMainText: {
        fontSize: 16,
        fontWeight: '700',
        color: ACCENT,
    },
    selectorSubText: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    selectedLotesList: {
        gap: 10,
        marginBottom: 12,
    },
    selectedLoteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    selectedLoteCardDark: {
        backgroundColor: '#2C2C2E',
        borderColor: '#3A3A3C',
    },
    loteIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: 'rgba(52,199,89,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loteIconBoxDark: {
        backgroundColor: 'rgba(52,199,89,0.2)',
    },
    selectedLoteTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    selectedLoteSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 1,
    },
    selectedLoteSubtitleDark: {
        color: '#8E8E93',
    },

    inputBlock: { marginBottom: 14 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#3C3C43', marginBottom: 6 },
    fieldLabelDark: { color: '#AEAEB2' },
    textInput: { borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#F9F9FB', color: '#1C1C1E' },
    textInputDark: { borderColor: '#3A3A3C', backgroundColor: '#2C2C2E', color: '#FFFFFF' },
    textArea: { minHeight: 90, paddingTop: 12 },

    selectorField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, backgroundColor: '#F9F9FB' },
    selectorValueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    selectorValueText: { fontSize: 15, color: '#1C1C1E', flexShrink: 1 },
    selectorPlaceholder: { color: '#A0A0A5' },

    hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, justifyContent: 'center' },
    hintText: { fontSize: 12, color: '#8E8E93' },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    summaryRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F3' },
    summaryRowBorderDark: { borderBottomColor: '#2C2C2E' },
    summaryLabel: { fontSize: 13, color: '#8E8E93' },
    summaryLabelDark: { color: '#8E8E93' },
    summaryValue: { fontSize: 13, fontWeight: '600', color: '#1C1C1E', maxWidth: '60%', textAlign: 'right' },

    floatingFooterWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: 'transparent',
    },
    pillButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    pillBackButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillBackButtonDark: { backgroundColor: '#2C2C2E' },
    pillBackButtonLight: { backgroundColor: '#FFFFFF' },
    pillNextButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: ACCENT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    pillNextButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    footerBtnDisabled: { opacity: 0.6 },
});

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    content: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
    grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#3A3A3C', alignSelf: 'center', marginTop: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#3A3A3C' },
    title: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
    emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#8E8E93', marginTop: 12 },
    emptySubtext: { fontSize: 13, color: '#636366', textAlign: 'center', marginTop: 4 },
    optionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
    optionRowSelected: { backgroundColor: 'rgba(52, 199, 89, 0.08)' },
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#636366', alignItems: 'center', justifyContent: 'center' },
    radioOuterActive: { borderColor: ACCENT },
    radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: ACCENT },
    optionInfo: { flex: 1 },
    optionName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
    optionSubtext: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    separator: { height: 1, backgroundColor: '#2C2C2E', marginLeft: 56 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#3A3A3C' },
    doneButton: { backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    doneButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});