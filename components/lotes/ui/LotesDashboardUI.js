import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    ImageBackground,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Keyboard,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedReaction,
    withTiming,
    withSpring,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSearch } from '../context/SearchContext';
import { useTheme } from '../../../services/theme';
import { lotesService } from '../../../services/lotes';

import {
    ESTILOS_STATUS,
    ESTADO_OPCIONES,
    getColores,
} from './lotesDashboardColors';

import {
    useCardAnimations,
    useSkeletonAnimations,
} from './lotesDashboardAnimations';

import VerticesMap from './VerticesMap';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TABS = ['TODOS', 'ACTIVOS', 'PENDIENTES'];

const CAMPOS_EDITABLES = [
    { key: 'nombre_lote', label: 'Nombre del lote', icon: 'tag-outline', autoCapitalize: 'sentences' },
    { key: 'provincia', label: 'Provincia', icon: 'map-marker-radius', autoCapitalize: 'words' },
    { key: 'canton', label: 'Cantón', icon: 'map-marker-multiple', autoCapitalize: 'words' },
    { key: 'estacion', label: 'Estación', icon: 'broadcast', autoCapitalize: 'words' },
    { key: 'cultivo', label: 'Cultivo', icon: 'seed', autoCapitalize: 'words' },
];

// ============================================
// COMPONENTE: Bottom Sheet Base (estilo Apple)
// Backdrop con blur + tarjeta que sube desde abajo con spring.
// Lo reutilizan el selector de estado y el modal de edición.
// ============================================
function AppleBottomSheet({ visible, onClose, isDark, children, maxHeight }) {
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(500);
    const backdropOpacity = useSharedValue(0);
    const keyboardHeight = useSharedValue(0);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                keyboardHeight.value = e.endCoordinates.height;
            }
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                keyboardHeight.value = 0;
            }
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

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
        transform: [
            { translateY: translateY.value - keyboardHeight.value * 0.5 }
        ],
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
                            backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
                            paddingBottom: insets.bottom + 14,
                            maxHeight: maxHeight || '80%',
                        },
                    ]}
                >
                    <View style={styles.sheetHandle} />
                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
}

// ============================================
// COMPONENTE: Selector de Estado (bottom sheet estilo iOS action sheet)
// ============================================
function StatusPickerModal({ visible, currentStatus, onSelect, onClose, isDark }) {
    const colores = getColores(isDark);

    return (
        <AppleBottomSheet visible={visible} onClose={onClose} isDark={isDark} maxHeight="70%">
            <Text style={[styles.sheetTitle, { color: colores.textPrimary }]}>Cambiar estado</Text>
            <Text style={[styles.sheetSubtitle, { color: colores.textSecondary }]}>
                Selecciona el nuevo estado para este lote
            </Text>

            <View style={[styles.sheetOptionsGroup, { backgroundColor: colores.statusPickerCard }]}>
                {ESTADO_OPCIONES.map((op, i) => {
                    const active = currentStatus === op.value;
                    return (
                        <TouchableOpacity
                            key={op.value}
                            onPress={() => onSelect(op.value)}
                            activeOpacity={0.6}
                            style={[
                                styles.sheetOptionRow,
                                i !== ESTADO_OPCIONES.length - 1 && {
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    borderBottomColor: colores.statusPickerBorder,
                                },
                            ]}
                        >
                            <View style={[styles.sheetOptionIconWrap, { backgroundColor: `${op.color}22` }]}>
                                <View style={[styles.statusDot, { backgroundColor: op.color, marginRight: 0 }]} />
                            </View>
                            <Text
                                style={[
                                    styles.sheetOptionText,
                                    { color: colores.textPrimary },
                                    active && { fontWeight: '700' },
                                ]}
                            >
                                {op.label}
                            </Text>
                            {active && <MaterialCommunityIcons name="check" size={20} color={op.color} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[styles.sheetCancelBtn, { backgroundColor: colores.statusPickerCard }]}
                onPress={onClose}
                activeOpacity={0.6}
            >
                <Text style={[styles.sheetCancelText, { color: '#FF3B30' }]}>Cancelar</Text>
            </TouchableOpacity>
        </AppleBottomSheet>
    );
}

// ============================================
// COMPONENTE: Selector de Opciones genérico (para provincia, canton, estacion, cultivo)
// ============================================
function OptionPickerModal({ visible, title, options, currentValue, onSelect, onClose, isDark }) {
    const colores = getColores(isDark);

    return (
        <AppleBottomSheet visible={visible} onClose={onClose} isDark={isDark} maxHeight="70%">
            <Text style={[styles.sheetTitle, { color: colores.textPrimary }]}>{title}</Text>
            <Text style={[styles.sheetSubtitle, { color: colores.textSecondary }]}>
                Selecciona una opción
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
                <View style={[styles.sheetOptionsGroup, { backgroundColor: colores.statusPickerCard }]}>
                    {options.map((option, i) => {
                        const active = currentValue === option.value || currentValue === option.nombre;
                        return (
                            <TouchableOpacity
                                key={option.value || option.id || i}
                                onPress={() => onSelect(option.value || option.nombre)}
                                activeOpacity={0.6}
                                style={[
                                    styles.sheetOptionRow,
                                    i !== options.length - 1 && {
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                        borderBottomColor: colores.statusPickerBorder,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.sheetOptionText,
                                        { color: colores.textPrimary },
                                        active && { fontWeight: '700' },
                                    ]}
                                >
                                    {option.label || option.nombre || option.value}
                                </Text>
                                {active && <MaterialCommunityIcons name="check" size={20} color="#34C759" />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.sheetCancelBtn, { backgroundColor: colores.statusPickerCard }]}
                onPress={onClose}
                activeOpacity={0.6}
            >
                <Text style={[styles.sheetCancelText, { color: '#FF3B30' }]}>Cancelar</Text>
            </TouchableOpacity>
        </AppleBottomSheet>
    );
}

// ============================================
// COMPONENTE: Editar Lote (bottom sheet con formulario)
// Solo nombre_lote es editable directamente; el resto son selectores de opciones.
// ============================================
function EditLoteModal({ visible, lote, onClose, onSave, isDark, saving }) {
    const colores = getColores(isDark);
    const [form, setForm] = useState({
        nombre_lote: '',
        provincia: '',
        canton: '',
        estacion: '',
        cultivo: '',
    });

    // Catalog data for pickers
    const [catalogos, setCatalogos] = useState({ provincias: [], cantones: [], estaciones: [], cultivos: [] });
    const [loadingCatalogos, setLoadingCatalogos] = useState(false);

    // Picker state
    const [pickerField, setPickerField] = useState(null); // 'provincia' | 'canton' | 'estacion' | 'cultivo' | null
    const [pickerOptions, setPickerOptions] = useState([]);

    // Load catalogos when modal opens
    useEffect(() => {
        if (visible) {
            cargarCatalogos();
        }
    }, [visible]);

    // Update form when lote changes
    useEffect(() => {
        if (visible && lote) {
            setForm({
                nombre_lote: lote.nombre_lote || '',
                provincia: lote.provincia || '',
                canton: lote.canton || '',
                estacion: lote.estacion || '',
                cultivo: lote.proyectos?.[0]?.cultivo || lote.cultivo || '',
            });
        }
    }, [visible, lote]);

    const cargarCatalogos = async () => {
        setLoadingCatalogos(true);
        try {
            const data = await lotesService.obtenerCatalogos();
            setCatalogos({
                provincias: data.provincias || [],
                cantones: data.cantones || [],
                estaciones: data.estaciones || [],
                cultivos: data.cultivos || [],
            });
        } catch (error) {
            // console removed
        } finally {
            setLoadingCatalogos(false);
        }
    };

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = () => {
        Keyboard.dismiss();
        onSave(form);
    };

    const openPicker = (field) => {
        let options = [];
        let currentValue = form[field];

        switch (field) {
            case 'provincia':
                options = catalogos.provincias.map(p => ({ nombre: p.nombre || p.name, value: p.nombre || p.name }));
                break;
            case 'canton':
                options = catalogos.cantones.map(c => ({ nombre: c.nombre || c.name, value: c.nombre || c.name }));
                break;
            case 'estacion':
                options = catalogos.estaciones.map(e => ({ nombre: e.nombre || e.name, value: e.nombre || e.name }));
                break;
            case 'cultivo':
                options = catalogos.cultivos.map(c => ({ nombre: c.nombre || c.name, value: c.nombre || c.name }));
                break;
            default:
                return;
        }

        setPickerOptions(options);
        setPickerField(field);
    };

    const handlePickerSelect = (value) => {
        updateField(pickerField, value);
        setPickerField(null);
    };

    const getPickerTitle = () => {
        switch (pickerField) {
            case 'provincia': return 'Seleccionar Provincia';
            case 'canton': return 'Seleccionar Cantón';
            case 'estacion': return 'Seleccionar Estación';
            case 'cultivo': return 'Seleccionar Cultivo';
            default: return 'Seleccionar';
        }
    };

    // Campos que son editables como texto vs selectores
    const CAMPOS_TEXTO = ['nombre_lote'];
    const CAMPOS_SELECTOR = ['provincia', 'canton', 'estacion', 'cultivo'];

    return (
        <AppleBottomSheet visible={visible} onClose={onClose} isDark={isDark} maxHeight="85%">
            <View style={styles.editHeaderRow}>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={[styles.editHeaderAction, { color: colores.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { color: colores.textPrimary, marginTop: 0 }]}>
                    Editar lote
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#34C759" />
                    ) : (
                        <Text style={[styles.editHeaderAction, { color: '#34C759', fontWeight: '700' }]}>
                            Guardar
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ marginTop: 10 }}>
                <View style={[styles.editFieldsGroup, { backgroundColor: colores.statusPickerCard }]}>
                    {/* Campo nombre_lote - editable como texto */}
                    <View style={[styles.editFieldRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colores.statusPickerBorder }]}>
                        <MaterialCommunityIcons name="tag-outline" size={18} color={colores.textSecondary} style={{ width: 26 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.editFieldLabel, { color: colores.textSecondary }]}>Nombre del lote</Text>
                            <TextInput
                                value={form.nombre_lote}
                                onChangeText={(t) => updateField('nombre_lote', t)}
                                placeholder="Nombre del lote"
                                placeholderTextColor={colores.textSecondary}
                                autoCapitalize="sentences"
                                style={[styles.editFieldInput, { color: colores.textPrimary }]}
                            />
                        </View>
                    </View>

                    {/* Campos selectors - solo muestran valor, al tocar abren picker */}
                    {CAMPOS_SELECTOR.map((field) => {
                        const fieldConfig = CAMPOS_EDITABLES.find(f => f.key === field);
                        const iconName = fieldConfig?.icon || 'circle';
                        const label = fieldConfig?.label || field;
                        return (
                            <TouchableOpacity
                                key={field}
                                onPress={() => openPicker(field)}
                                activeOpacity={0.7}
                                style={[styles.editFieldRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colores.statusPickerBorder }]}
                            >
                                <MaterialCommunityIcons name={iconName} size={18} color={colores.textSecondary} style={{ width: 26 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.editFieldLabel, { color: colores.textSecondary }]}>{label}</Text>
                                    <View style={styles.selectorValueRow}>
                                        <Text style={[styles.selectorValue, { color: form[field] ? colores.textPrimary : colores.textSecondary }]}>
                                            {form[field] || 'Seleccionar...'}
                                        </Text>
                                        <MaterialCommunityIcons name="chevron-down" size={18} color={colores.textSecondary} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Picker modal para campos de selección */}
            <OptionPickerModal
                visible={pickerField !== null}
                title={getPickerTitle()}
                options={pickerOptions}
                currentValue={pickerField ? form[pickerField] : ''}
                onSelect={handlePickerSelect}
                onClose={() => setPickerField(null)}
                isDark={isDark}
            />
        </AppleBottomSheet>
    );
}

// ============================================
// COMPONENTE: Tarjeta Animada de Lote
// ============================================
function AnimatedCard({ item, index, getStatusConfig, isDark, onEdit, onStatusChange, onDelete }) {
    const colores = getColores(isDark);
    const statusConfig = getStatusConfig(item.estado_verificacion);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Parsear vertices desde el campo correcto del backend
    // Backend AgroDecide devuelve:
    //   - geometria: objeto ya decodificado { type: "Polygon", coordinates: [[[lng,lat],...]] }
    //   - geometria_geojson: string GeoJSON original (backup)
    let vertices = null;
    const geoObj = item.geometria || item.geometria_geojson || item.vertices || null;
    if (geoObj) {
        if (typeof geoObj === 'string') {
            try {
                const parsed = JSON.parse(geoObj);
                vertices = parsed?.coordinates?.[0] || null;
            } catch {
                vertices = null;
            }
        } else if (typeof geoObj === 'object' && geoObj.coordinates) {
            // geometria ya decodificado: { type: "Polygon", coordinates: [...] }
            vertices = geoObj.coordinates?.[0] || null;
        } else if (Array.isArray(geoObj) && geoObj.length > 0) {
            // Array directo de coordenadas [[lng,lat], [lng,lat], ...]
            vertices = geoObj;
        }
    }

    const verticesCount = vertices
        ? (Array.isArray(vertices) ? vertices.length : 0)
        : (item.vertices_count || 0);
    const hasVertices = verticesCount > 0;

    const getFirstVertex = () => {
        if (!vertices || !Array.isArray(vertices) || vertices.length === 0) return null;
        const first = vertices[0];
        return Array.isArray(first) ? { lng: first[0], lat: first[1] } : first;
    };

    const getLastVertex = () => {
        if (!vertices || !Array.isArray(vertices) || vertices.length < 2) return null;
        const last = vertices[vertices.length - 1];
        return Array.isArray(last) ? { lng: last[0], lat: last[1] } : last;
    };

    const firstVertex = getFirstVertex();
    const lastVertex = getLastVertex();
    const cultivo = item.proyectos?.[0]?.cultivo || item.cultivo || null;

    const formatCoord = (val) => {
        if (val == null) return '-';
        return val.toFixed(6);
    };

    const { animateIn, handlePressIn, handlePressOut, containerAnimatedStyle } = useCardAnimations(index);
    const defaultImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop';

    // ---- Captura del croquis de vértices como imagen ----
    // TODO: reactivar cuando definamos storage para imágenes (S3/Cloudinary/servidor propio)
    // Temporalmente deshabilitado - se muestra VerticesMap directamente en vez de capturar
    // const [capturedUri, setCapturedUri] = useState(item.imagen_croquis_url || null);
    // const viewShotRef = useRef(null);
    // const captureAttempted = useRef(false);
    // const needsCapture = hasVertices && !capturedUri && !captureAttempted.current;
    // useEffect(() => {
    //     if (!needsCapture) return;
    //     captureAttempted.current = true;
    //     const timer = setTimeout(async () => {
    //         try {
    //             const uri = await viewShotRef.current?.capture?.();
    //             if (uri) {
    //                 setCapturedUri(uri);
    //                 if (typeof lotesService.guardarCapturaLote === 'function') {
    //                     lotesService.guardarCapturaLote(item.id, uri).catch(() => {});
    //                 }
    //             }
    //         } catch (e) { }
    //     }, 350);
    //     return () => clearTimeout(timer);
    // }, [needsCapture]);

    const backgroundImageSource = { uri: item.imagen_url || defaultImage };

    useEffect(() => {
        animateIn();
    }, []);

    return (
        <Animated.View style={containerAnimatedStyle}>
            <TouchableOpacity
                activeOpacity={0.95}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onEdit}
                onLongPress={() => setShowDeleteModal(true)}
                delayLongPress={500}
                style={[styles.figmaCardContainer, { backgroundColor: colores.cardBg }]}
            >
                {/* Si tiene vértices, mostrar VerticesMap directamente como fondo */}
                {hasVertices ? (
                    <View style={[styles.figmaImageSection, { backgroundColor: '#1a2a1a' }]}>
                        <VerticesMap vertices={vertices} color={statusConfig.color} style={styles.verticesMapFill} />
                        <View style={styles.imageOverlay} />
                        <View style={styles.figmaTopRow}>
                            <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); onStatusChange(item); }}
                                activeOpacity={0.8}
                            >
                                <BlurView intensity={60} tint="light" style={styles.figmaPopularBadge}>
                                    <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                                    <Text style={styles.figmaPopularText}>{statusConfig.text}</Text>
                                </BlurView>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.figmaImageBottomRow}>
                            <View style={styles.figmaTitleArea}>
                                <Text style={styles.figmaCardTitle} numberOfLines={1}>
                                    {item.nombre_lote || 'Lote sin nombre'}
                                </Text>
                                <View style={styles.figmaLocationWrapper}>
                                    <MaterialCommunityIcons name="map-marker" size={13} color="#FFFFFF" />
                                    <Text style={styles.figmaLocationText} numberOfLines={1}>
                                        {item.ubicacion_manual || item.estacion || item.canton || item.provincia || 'Ubicación no definida'}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.figmaStartRouteBtn}
                                onPress={(e) => { e.stopPropagation(); onEdit(); }}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.figmaStartRouteText}>Editar</Text>
                                <MaterialCommunityIcons name="arrow-right" size={14} color="#111111" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <ImageBackground
                        source={backgroundImageSource}
                        style={styles.figmaImageSection}
                        imageStyle={styles.figmaImageStyle}
                    >
                        <View style={styles.imageOverlay} />
                        <View style={styles.figmaTopRow}>
                            <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); onStatusChange(item); }}
                                activeOpacity={0.8}
                            >
                                <BlurView intensity={60} tint="light" style={styles.figmaPopularBadge}>
                                    <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                                    <Text style={styles.figmaPopularText}>{statusConfig.text}</Text>
                                </BlurView>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.figmaImageBottomRow}>
                            <View style={styles.figmaTitleArea}>
                                <Text style={styles.figmaCardTitle} numberOfLines={1}>
                                    {item.nombre_lote || 'Lote sin nombre'}
                                </Text>
                                <View style={styles.figmaLocationWrapper}>
                                    <MaterialCommunityIcons name="map-marker" size={13} color="#FFFFFF" />
                                    <Text style={styles.figmaLocationText} numberOfLines={1}>
                                        {item.ubicacion_manual || item.estacion || item.canton || item.provincia || 'Ubicación no definida'}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.figmaStartRouteBtn}
                                onPress={(e) => { e.stopPropagation(); onEdit(); }}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.figmaStartRouteText}>Editar</Text>
                                <MaterialCommunityIcons name="arrow-right" size={14} color="#111111" />
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                )}

                <View style={styles.infoBottomSection}>
                    <View style={styles.infoRowGrid}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="map-marker-radius" size={14} color={colores.textSecondary} />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Provincia</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.provincia || '-'}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="map-marker-multiple" size={14} color={colores.textSecondary} />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Cantón</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.canton || '-'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRowGrid}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="water" size={14} color="#0A84FF" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Riego</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.tipo_riego?.replace(/_/g, ' ') || '-'}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="seed" size={14} color="#34C759" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Cultivo</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {cultivo || '-'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRowGrid}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="vector-polygon" size={14} color="#FF9500" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Vértices</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]}>
                                {verticesCount}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="map-marker" size={14} color="#8E8E93" />
                            <Text style={[styles.infoItemLabel, { color: colores.textSecondary }]}>Ubicación</Text>
                            <Text style={[styles.infoItemValue, { color: colores.textPrimary }]} numberOfLines={1}>
                                {item.ubicacion_manual || item.canton || item.provincia || '-'}
                            </Text>
                        </View>
                    </View>

                    {verticesCount > 0 && firstVertex && (
                        <View style={[styles.coordsRow, { backgroundColor: colores.subCardBg }]}>
                            <View style={styles.coordItem}>
                                <Text style={[styles.coordLabel, { color: colores.textSecondary }]}>Inicio</Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lng: {formatCoord(firstVertex.lng)}
                                </Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lat: {formatCoord(firstVertex.lat)}
                                </Text>
                            </View>
                            <View style={styles.coordDivider} />
                            <View style={styles.coordItem}>
                                <Text style={[styles.coordLabel, { color: colores.textSecondary }]}>Fin</Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lng: {formatCoord(lastVertex?.lng)}
                                </Text>
                                <Text style={[styles.coordValue, { color: colores.textPrimary }]}>
                                    Lat: {formatCoord(lastVertex?.lat)}
                                </Text>
                            </View>
                            <View style={[styles.miniMapContainer, { backgroundColor: colores.cardBg }]}>
                                <VerticesMap vertices={vertices} color={statusConfig.color} />
                            </View>
                        </View>
                    )}

                    {verticesCount === 0 && (
                        <View style={[styles.noVerticesPlaceholder, { backgroundColor: colores.subCardBg }]}>
                            <MaterialCommunityIcons name="vector-polyline" size={24} color={colores.textSecondary} />
                            <Text style={[styles.noVerticesText, { color: colores.textSecondary }]}>
                                Sin vértices capturados
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Modal de confirmación para eliminar */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <Pressable style={styles.deleteModalOverlay} onPress={() => setShowDeleteModal(false)}>
                    <Pressable style={[styles.deleteModalContainer, { backgroundColor: isDark ? 'rgba(30,30,32,0.95)' : 'rgba(255,255,255,0.95)' }]} onPress={(e) => e.stopPropagation()}>
                        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(30,30,32,0.7)' : 'rgba(255,255,255,0.7)' }]} />

                        <View style={styles.deleteModalContent}>
                            <View style={[styles.deleteIconCircle, { backgroundColor: 'rgba(255,59,48,0.15)' }]}>
                                <MaterialCommunityIcons name="trash-can-outline" size={32} color="#FF3B30" />
                            </View>

                            <Text style={[styles.deleteModalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                ¿Eliminar lote?
                            </Text>

                            <Text style={[styles.deleteModalSubtitle, { color: '#FF3B30', fontWeight: '600' }]}>
                                Esta acci&#243;n eliminar&#225; &quot;{item.nombre_lote}&quot; de forma permanente.
                            </Text>

                            <View style={styles.deleteModalButtons}>
                                <TouchableOpacity
                                    style={[styles.deleteModalCancelBtn, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                                    onPress={() => setShowDeleteModal(false)}
                                >
                                    <Text style={[styles.deleteModalCancelText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.deleteModalDeleteBtn, { backgroundColor: '#FF3B30' }]}
                                    onPress={() => {
                                        setShowDeleteModal(false);
                                        onDelete(item);
                                    }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.deleteModalDeleteText}>Eliminar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </Animated.View>
    );
}

// ============================================
// COMPONENTE: Tarjeta Skeleton Exacta de Lote (para loading state)
// ============================================
function SkeletonCard({ isDark }) {
    const colores = getColores(isDark);
    const { startPulse, animatedStyle } = useSkeletonAnimations();

    useEffect(() => {
        startPulse();
    }, []);

    return (
        <Animated.View style={[styles.figmaCardContainer, animatedStyle, { backgroundColor: colores.skeletonBg }]}>
            {/* Bloque grande superior simulando la imagen de la tarjeta */}
            <View style={[styles.figmaImageSection, { backgroundColor: colores.skeletonBadgeBg, height: 210, marginBottom: 12 }]} />
            
            {/* Bloques de líneas simulando los textos (estilo YouTube) */}
            <View style={{ gap: 8 }}>
                <View style={[styles.skeletonLine, { backgroundColor: colores.skeletonBadgeBg, width: '85%', height: 18, borderRadius: 6 }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colores.skeletonBadgeBg, width: '60%', height: 14, borderRadius: 6 }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colores.skeletonBadgeBg, width: '40%', height: 12, borderRadius: 6, marginTop: 4 }]} />
            </View>
        </Animated.View>
    );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function LotesDashboardUI() {
    const insets = useSafeAreaInsets();
    const { isLoading, error, recargar, lotesFiltrados, filtroEstado, setFiltroEstado, searchText, listaLotes } = useSearch();
    const { isDark } = useTheme();

    const colores = getColores(isDark);

    const [statusPickerVisible, setStatusPickerVisible] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Edición inline (nombre, provincia, cantón, estación, cultivo)
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [loteEditar, setLoteEditar] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const horizontalScrollRef = useRef(null);
    const scrollY = useSharedValue(0);

    // --- Header estilo Apple (mismo patrón que Home) ---
    const TOP_REVEAL_THRESHOLD = 12;
    const HIDE_DURATION = 160;
    const REVEAL_DURATION = 260;
    const STAGGER = 70;

    const titleOpacity = useSharedValue(1);
    const titleTranslateY = useSharedValue(0);
    const counterOpacity = useSharedValue(1);
    const counterTranslateY = useSharedValue(0);
    const tabsOpacity = useSharedValue(1);
    const tabsTranslateY = useSharedValue(0);

    useAnimatedReaction(
        () => scrollY.value <= TOP_REVEAL_THRESHOLD,
        (isAtTop, wasAtTop) => {
            if (isAtTop === wasAtTop) return;

            if (isAtTop) {
                counterOpacity.value = withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                counterTranslateY.value = withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                tabsOpacity.value = withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                tabsTranslateY.value = withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) });
                titleOpacity.value = withDelay(STAGGER, withTiming(1, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) }));
                titleTranslateY.value = withDelay(STAGGER, withTiming(0, { duration: REVEAL_DURATION, easing: Easing.out(Easing.cubic) }));
            } else {
                titleOpacity.value = withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
                titleTranslateY.value = withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) });
                counterOpacity.value = withDelay(STAGGER, withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
                counterTranslateY.value = withDelay(STAGGER, withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
                tabsOpacity.value = withDelay(STAGGER, withTiming(0, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
                tabsTranslateY.value = withDelay(STAGGER, withTiming(-6, { duration: HIDE_DURATION, easing: Easing.in(Easing.cubic) }));
            }
        },
        [TOP_REVEAL_THRESHOLD]
    );

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }));

    const counterAnimatedStyle = useAnimatedStyle(() => ({
        opacity: counterOpacity.value,
        transform: [{ translateY: counterTranslateY.value }],
    }));

    const tabsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: tabsOpacity.value,
        transform: [{ translateY: tabsTranslateY.value }],
    }));

    const TITLE_ROW_HEIGHT = 40;
    const TITLE_ROW_MARGIN_TOP = 6;
    const TABS_ROW_HEIGHT = 40;
    const TABS_ROW_MARGIN_TOP = 14;
    const HEADER_BOTTOM_GAP = 10;
    const pinnedTabsHeight = insets.top + TITLE_ROW_MARGIN_TOP + TITLE_ROW_HEIGHT + TABS_ROW_MARGIN_TOP + TABS_ROW_HEIGHT + HEADER_BOTTOM_GAP;

    const handleScroll = (event) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
    };

    const revealHeaderForTabChange = () => {
        scrollY.value = 0;
    };

    const getStatusConfig = (syncStatus) => {
        return ESTILOS_STATUS[syncStatus] || ESTILOS_STATUS.borrador;
    };

    // ---- Edición inline ----
    const handleOpenEdit = (lote) => {
        setLoteEditar(lote);
        setEditModalVisible(true);
    };

    const handleSaveEdit = async (form) => {
        if (!loteEditar) return;
        setIsSavingEdit(true);
        try {
            // TODO: confirmar el nombre real de este método en tu lotesService.
            // Debe aceptar (id, { nombre_lote, provincia, canton, estacion, cultivo })
            const result = await lotesService.actualizarLote(loteEditar.id, form);
            if (result && result.data) {
                setEditModalVisible(false);
                recargar();
            } else {
                Alert.alert('Error', result?.message || 'No se pudieron guardar los cambios');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudieron guardar los cambios');
        } finally {
            setIsSavingEdit(false);
            setLoteEditar(null);
        }
    };

    const handleStatusChange = (lote) => {
        setLoteSeleccionado(lote);
        setStatusPickerVisible(true);
    };

    const handleDelete = async (lote) => {
        // Verificar que tenemos el UUID del lote
        if (!lote || (!lote.uuid_movil && !lote.id)) {
            Alert.alert('Error', 'No se encontró el ID del lote');
            return;
        }

        const uuid = lote.uuid_movil || lote.id;

        // Llamar al API del backend para eliminar (soft delete en backend)
        try {
            const result = await lotesService.eliminarLote(uuid);
            if (result && result.success) {
                recargar();
            } else {
                Alert.alert('Error', result?.message || 'No se pudo eliminar el lote');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar el lote');
        }
    };

    const handleSelectStatus = async (nuevoEstado) => {
        if (!loteSeleccionado) return;
        setStatusPickerVisible(false);
        setIsUpdatingStatus(true);

        try {
            const result = await lotesService.cambiarEstadoLote(loteSeleccionado.id, nuevoEstado);
            if (result && result.data) {
                Alert.alert('Éxito', 'Estado actualizado correctamente');
                recargar();
            } else {
                Alert.alert('Error', result?.message || 'No se pudo actualizar el estado');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo actualizar el estado');
        } finally {
            setIsUpdatingStatus(false);
            setLoteSeleccionado(null);
        }
    };

    const handleTabPress = (tabName, index) => {
        setFiltroEstado(tabName);
        revealHeaderForTabChange();
        if (horizontalScrollRef.current) {
            horizontalScrollRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: false });
        }
    };

    const handleScrollEnd = (e) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        if (TABS[index] && TABS[index] !== filtroEstado) {
            setFiltroEstado(TABS[index]);
        }
        revealHeaderForTabChange();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await recargar();
        setRefreshing(false);
    };

    const renderEmptyState = (currentTab) => {
        const hasSearch = searchText && searchText.trim().length > 0;
        const hasFilter = currentTab !== 'TODOS';
        const isFiltered = hasSearch || hasFilter;

        let title = 'Sin Lotes Encontrados';
        let message = 'Tus registros aparecerán aquí una vez comiences a sincronizar o trazar lotes.';

        if (isFiltered) {
            if (hasSearch && hasFilter) {
                title = 'Sin resultados';
                message = `No se encontraron lotes para "${searchText}" con filtro ${currentTab}`;
            } else if (hasSearch) {
                title = 'Sin resultados';
                message = `No se encontraron lotes para "${searchText}"`;
            } else {
                title = 'Sin lotes';
                message = `No hay lotes ${currentTab === 'ACTIVOS' ? 'activos' : 'pendientes'}`;
            }
        }

        return (
            <View style={styles.emptyState}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colores.emptyIconBg }]}>
                    <MaterialCommunityIcons
                        name={isFiltered ? "magnify-close" : "map-search-outline"}
                        size={44}
                        color={colores.textSecondary}
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colores.textPrimary }]}>{title}</Text>
                <Text style={[styles.emptyText, { color: colores.textSecondary }]}>{message}</Text>
            </View>
        );
    };

    const renderLoadingSkeletons = () => (
        <View style={styles.skeletonListContainer}>
            <SkeletonCard isDark={isDark} />
            <SkeletonCard isDark={isDark} />
        </View>
    );

    const renderError = () => (
        <View style={styles.centered}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#FF3B30" />
            <Text style={[styles.errorText, { color: colores.textSecondary }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={recargar} activeOpacity={0.8}>
                <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colores.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

            <StatusPickerModal
                visible={statusPickerVisible}
                currentStatus={loteSeleccionado?.estado_verificacion}
                onSelect={handleSelectStatus}
                onClose={() => setStatusPickerVisible(false)}
                isDark={isDark}
            />

            <EditLoteModal
                visible={editModalVisible}
                lote={loteEditar}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveEdit}
                isDark={isDark}
                saving={isSavingEdit}
            />

            <LinearGradient
                pointerEvents="none"
                colors={
                    isDark
                        ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']
                        : ['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0)']
                }
                style={[styles.statusBarScrim, { height: insets.top + 40 }]}
            />

            <View style={[styles.header, { paddingTop: insets.top + TITLE_ROW_MARGIN_TOP }]}>
                <View style={styles.headerTopRow}>
                    <Animated.Text style={[styles.headerHomeTitle, { color: colores.textPrimary }, titleAnimatedStyle]}>
                        Lotes
                    </Animated.Text>

                    <Animated.View style={counterAnimatedStyle}>
                        <BlurView intensity={isDark ? 55 : 80} tint={isDark ? 'dark' : 'light'} style={styles.counterGlassPill}>
                            <View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    { backgroundColor: isDark ? 'rgba(30,30,32,0.35)' : 'rgba(255,255,255,0.45)' },
                                ]}
                            />
                            <LinearGradient
                                colors={
                                    isDark
                                        ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)']
                                        : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']
                                }
                                start={{ x: 0.15, y: 0 }}
                                end={{ x: 0.85, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <View
                                style={[
                                    styles.counterGlassSpecular,
                                    { backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)' },
                                ]}
                            />
                            <View
                                style={[
                                    styles.counterGlassBorder,
                                    { borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)' },
                                ]}
                            />
                            <MaterialCommunityIcons name="vector-square" size={16} color="#34C759" style={{ marginRight: 6 }} />
                            <Text style={[styles.counterGlassNumber, { color: colores.textPrimary }]}>{lotesFiltrados.length}</Text>
                        </BlurView>
                    </Animated.View>
                </View>
            </View>

            <View style={[styles.pinnedTabsWrap, { paddingTop: insets.top + TITLE_ROW_MARGIN_TOP + TITLE_ROW_HEIGHT + TABS_ROW_MARGIN_TOP }]}>
                <Animated.View style={tabsAnimatedStyle}>
                    <BlurView intensity={isDark ? 45 : 65} tint={isDark ? 'dark' : 'light'} style={styles.tabsGlassContainer}>
                        <View
                            style={[
                                StyleSheet.absoluteFillObject,
                            { backgroundColor: isDark ? 'rgba(20,20,22,0.30)' : 'rgba(255,255,255,0.35)' },
                        ]}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
                        {TABS.map((tab, index) => {
                            const active = filtroEstado === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    activeOpacity={0.7}
                                    onPress={() => handleTabPress(tab, index)}
                                    style={styles.filterTabTouchable}
                                >
                                    {active ? (
                                        <BlurView intensity={isDark ? 60 : 85} tint={isDark ? 'dark' : 'light'} style={styles.filterTabActiveGlass}>
                                            <View
                                                style={[
                                                    StyleSheet.absoluteFillObject,
                                                    { backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.65)' },
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.counterGlassBorder,
                                                    { borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)' },
                                                ]}
                                            />
                                            <Text style={[styles.filterTabText, { color: colores.textPrimary, fontWeight: '800' }]}>
                                                {tab}
                                            </Text>
                                        </BlurView>
                                    ) : (
                                        <View style={styles.filterTabInactive}>
                                            <Text style={[styles.filterTabText, { color: colores.textSecondary }]}>{tab}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                    </BlurView>
                </Animated.View>
            </View>

            <View style={styles.contentWrapper}>
                {error ? (
                    renderError()
                ) : (
                    <ScrollView
                        ref={horizontalScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScrollBeginDrag={revealHeaderForTabChange}
                        onMomentumScrollEnd={handleScrollEnd}
                        scrollEventThrottle={16}
                        style={{ flex: 1 }}
                        contentInsetAdjustmentBehavior="never"
                        automaticallyAdjustContentInsets={false}
                    >
                        {TABS.map((tab) => (
                            <View key={tab} style={{ width: SCREEN_WIDTH, flex: 1 }}>
                                {isLoading && listaLotes.length === 0 ? (
                                    <View style={{ paddingTop: pinnedTabsHeight }}>
                                        {renderLoadingSkeletons()}
                                    </View>
                                ) : (
                                    <FlatList
                                        data={lotesFiltrados}
                                        keyExtractor={(item, index) => item.uuid_movil || item.id?.toString() || `lote-${index}-${item.nombre_lote}`}
                                        renderItem={({ item, index }) => (
                                            <AnimatedCard
                                                item={item}
                                                index={index}
                                                getStatusConfig={getStatusConfig}
                                                isDark={isDark}
                                                onEdit={() => handleOpenEdit(item)}
                                                onStatusChange={handleStatusChange}
                                                onDelete={handleDelete}
                                            />
                                        )}
                                        ListEmptyComponent={() => (refreshing ? renderLoadingSkeletons() : renderEmptyState(tab))}
                                        contentContainerStyle={[styles.listContainer, { paddingTop: pinnedTabsHeight }]}
                                        showsVerticalScrollIndicator={false}
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        onScroll={handleScroll}
                                        scrollEventThrottle={16}
                                        removeClippedSubviews={Platform.OS === 'android'}
                                        maxToRenderPerBatch={10}
                                        windowSize={5}
                                        contentInsetAdjustmentBehavior="never"
                                        automaticallyAdjustContentInsets={false}
                                        automaticallyAdjustsScrollIndicatorInsets={false}
                                    />
                                )}
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {isUpdatingStatus && (
                <View style={styles.updatingOverlay}>
                    <ActivityIndicator size="large" color="#34C759" />
                </View>
            )}
        </View>
    );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { marginTop: 12, fontWeight: '500', fontSize: 15, textAlign: 'center' },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#34C759',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    retryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },

    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 16,
    },
    statusBarScrim: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
    },
    contentWrapper: {
        flex: 1,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerHomeTitle: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -0.8,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    counterGlassPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 6,
    },
    counterGlassSpecular: {
        position: 'absolute',
        top: 0,
        left: 8,
        right: 8,
        height: 1,
        borderRadius: 1,
        opacity: 0.6,
    },
    counterGlassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 22,
        borderWidth: 1,
    },
    counterGlassNumber: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.4,
    },

    pinnedTabsWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 18,
        paddingHorizontal: 16,
    },
    tabsGlassContainer: {
        borderRadius: 22,
        overflow: 'hidden',
        paddingVertical: 6,
        paddingHorizontal: 6,
    },
    filterTabsScroll: { flexDirection: 'row', gap: 8 },
    filterTabTouchable: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    filterTabActiveGlass: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    filterTabInactive: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterTabText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

    listContainer: { paddingHorizontal: 16, paddingBottom: 120, width: SCREEN_WIDTH },

    skeletonListContainer: { paddingHorizontal: 16, width: SCREEN_WIDTH },
    skeletonLine: {},

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 30, width: SCREEN_WIDTH },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 },
    emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '400' },

    // ---- Bottom sheet base (estado + edición) ----
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
    },
    sheetHandle: {
        width: 36,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(120,120,128,0.35)',
        alignSelf: 'center',
        marginBottom: 12,
    },
    sheetTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 2, letterSpacing: -0.4 },
    sheetSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 18 },
    sheetOptionsGroup: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
    sheetOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        gap: 12,
    },
    sheetOptionIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetOptionText: { flex: 1, fontSize: 17, fontWeight: '500' },
    sheetCancelBtn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
    sheetCancelText: { fontSize: 17, fontWeight: '700' },

    // ---- Modal de edición de lote ----
    editHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginTop: 4,
    },
    editHeaderAction: { fontSize: 16, fontWeight: '500' },
    editFieldsGroup: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
    editFieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        gap: 10,
    },
    editFieldLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    editFieldInput: { fontSize: 16, fontWeight: '500', paddingVertical: 2 },
    selectorValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    selectorValue: { fontSize: 16, fontWeight: '500' },

    updatingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ---- Captura invisible del croquis de vértices ----
    hiddenCaptureWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 320,
        height: 240,
        opacity: 0,
        zIndex: -1,
    },
    hiddenCaptureInner: {
        width: 320,
        height: 240,
    },

    figmaCardContainer: {
        marginBottom: 24,
        borderRadius: 36,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 6,
    },
    figmaImageSection: {
        height: 240,
        borderRadius: 28,
        padding: 16,
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    figmaImageStyle: { borderRadius: 28 },
    verticesMapFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 28,
    },
    figmaTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
    },
    figmaPopularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    figmaPopularText: { color: '#111111', fontSize: 13, fontWeight: '700' },
    figmaImageBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 2,
    },
    figmaTitleArea: { flex: 1, marginRight: 10 },
    figmaCardTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginBottom: 4 },
    figmaLocationWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    figmaLocationText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13, fontWeight: '500' },
    figmaStartRouteBtn: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    figmaStartRouteText: { color: '#111111', fontSize: 13, fontWeight: '700' },

    infoBottomSection: {
        paddingTop: 12,
        gap: 8,
    },
    infoRowGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    infoItemLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    infoItemValue: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'right',
    },

    coordsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        gap: 8,
    },
    coordItem: {
        flex: 1,
    },
    coordLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 2,
    },
    coordValue: {
        fontSize: 10,
        fontWeight: '500',
    },
    coordDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(128,128,128,0.2)',
    },
    miniMapContainer: {
        width: 70,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    noVerticesPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    noVerticesText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },

    // ============================================
    // DELETE MODAL STYLES
    // ============================================
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    deleteModalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    deleteModalContent: {
        padding: 28,
        alignItems: 'center',
    },
    deleteIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    deleteModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
        textAlign: 'center',
    },
    deleteModalSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    deleteModalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteModalCancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteModalDeleteBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteModalDeleteText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});