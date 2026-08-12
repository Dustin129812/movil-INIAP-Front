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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { proyectosStyles } from '@/components/proyectos/ui';
import proyectosLocalService from '@/services/proyectosLocalService';
import localLotesService from '@/services/localLotesService';

const TIPOS_ENSAAYO = [
    { value: 'investigacion', label: 'Investigación' },
    { value: 'validacion', label: 'Validación' },
    { value: 'produccion_semillas', label: 'Producción de Semillas' },
    { value: 'multiplicacion_semillas', label: 'Multiplicación de Semillas' },
    { value: 'refrescamiento', label: 'Refrescamiento' },
];

const TIPOS_ACOLCHADO = [
    { value: 'con_acolchado', label: 'Con Acolchado' },
    { value: 'parcialmente_acolchado', label: 'Parcialmente Acolchado' },
    { value: 'sin_acolchado', label: 'Sin Acolchado' },
];

export default function NuevoProyectoScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isSaving, setIsSaving] = useState(false);
    const [lotes, setLotes] = useState([]);
    const [mostrarSelectorLote, setMostrarSelectorLote] = useState(false);
    const [loteSeleccionado, setLoteSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        variedad: '',
        fecha_siembra: '',
        tipo_ensayo: '',
        tipo_acolchado: '',
        financiamiento: '',
        colaborador_nombre: '',
        colaborador_celular: '',
        lote_id: null,
    });

    useEffect(() => {
        cargarLotes();
    }, []);

    const cargarLotes = async () => {
        try {
            await localLotesService.inicializarBaseDatosLocal();
            const lotesData = await localLotesService.obtenerLotes();
            setLotes(lotesData || []);
        } catch (error) {
            console.error('Error cargando lotes:', error);
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

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Nuevo Proyecto</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={proyectosStyles.card}>
                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Lote *</Text>
                        <TouchableOpacity
                            style={proyectosStyles.input}
                            onPress={() => setMostrarSelectorLote(true)}
                        >
                            <Text style={loteSeleccionado ? styles.inputText : styles.inputPlaceholder}>
                                {loteSeleccionado?.nombre_lote || 'Selecciona un lote'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Título del Proyecto *</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="Ej: Ensayo de Maíz INIAP-2026"
                            placeholderTextColor="#636366"
                            value={formData.titulo}
                            onChangeText={(v) => updateField('titulo', v)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Descripción</Text>
                        <TextInput
                            style={[proyectosStyles.input, proyectosStyles.inputMultiline]}
                            placeholder="Describe el objetivo del proyecto..."
                            placeholderTextColor="#636366"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={formData.descripcion}
                            onChangeText={(v) => updateField('descripcion', v)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Variedad</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="Ej: INIAP-123, Shelli"
                            placeholderTextColor="#636366"
                            value={formData.variedad}
                            onChangeText={(v) => updateField('variedad', v)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Fecha de Siembra</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#636366"
                            value={formData.fecha_siembra}
                            onChangeText={(v) => updateField('fecha_siembra', v)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Tipo de Ensayo</Text>
                        <View style={styles.optionsGrid}>
                            {TIPOS_ENSAAYO.map((op) => (
                                <TouchableOpacity
                                    key={op.value}
                                    style={[
                                        styles.optionButton,
                                        formData.tipo_ensayo === op.value && styles.optionButtonActive,
                                    ]}
                                    onPress={() => updateField('tipo_ensayo', op.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            formData.tipo_ensayo === op.value && styles.optionButtonTextActive,
                                        ]}
                                    >
                                        {op.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Tipo de Acolchado</Text>
                        <View style={styles.optionsGrid}>
                            {TIPOS_ACOLCHADO.map((op) => (
                                <TouchableOpacity
                                    key={op.value}
                                    style={[
                                        styles.optionButton,
                                        formData.tipo_acolchado === op.value && styles.optionButtonActive,
                                    ]}
                                    onPress={() => updateField('tipo_acolchado', op.value)}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            formData.tipo_acolchado === op.value && styles.optionButtonTextActive,
                                        ]}
                                    >
                                        {op.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Financiamiento</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="Ej: INIAP, MAG, Propio"
                            placeholderTextColor="#636366"
                            value={formData.financiamiento}
                            onChangeText={(v) => updateField('financiamiento', v)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Nombre del Colaborador</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor="#636366"
                            value={formData.colaborador_nombre}
                            onChangeText={(v) => updateField('colaborador_nombre', v)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Celular del Colaborador</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="Ej: 0991234567"
                            placeholderTextColor="#636366"
                            keyboardType="phone-pad"
                            value={formData.colaborador_celular}
                            onChangeText={(v) => updateField('colaborador_celular', v)}
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[proyectosStyles.button, { backgroundColor: '#0A84FF' }]}
                        onPress={handleGuardar}
                        disabled={isSaving}
                    >
                        <Text style={proyectosStyles.buttonText}>
                            {isSaving ? 'Guardando...' : 'Crear Proyecto'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={mostrarSelectorLote}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMostrarSelectorLote(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar Lote</Text>
                            <TouchableOpacity onPress={() => setMostrarSelectorLote(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        {lotes.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="map-marker-off" size={48} color="#636366" />
                                <Text style={styles.emptyText}>No hay lotes disponibles</Text>
                                <Text style={styles.emptySubtext}>Crea un lote primero para poder asignar proyectos</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={lotes}
                                keyExtractor={(item) => item.uuid_movil || item.id?.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.loteItem,
                                            loteSeleccionado?.id === item.id && styles.loteItemSelected,
                                        ]}
                                        onPress={() => seleccionarLote(item)}
                                    >
                                        <MaterialCommunityIcons
                                            name="map-marker-radius"
                                            size={22}
                                            color={loteSeleccionado?.id === item.id ? '#0A84FF' : '#34C759'}
                                        />
                                        <View style={styles.loteInfo}>
                                            <Text style={styles.loteName}>{item.nombre_lote}</Text>
                                            {item.ubicacion_manual && (
                                                <Text style={styles.loteLocation}>{item.ubicacion_manual}</Text>
                                            )}
                                        </View>
                                        {loteSeleccionado?.id === item.id && (
                                            <MaterialCommunityIcons name="check-circle" size={22} color="#0A84FF" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    optionButtonActive: {
        backgroundColor: 'rgba(10, 132, 255, 0.3)',
        borderColor: '#0A84FF',
    },
    optionButtonText: {
        fontSize: 14,
        color: '#8E8E93',
    },
    optionButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    inputText: {
        color: '#FFFFFF',
        fontSize: 16,
        flex: 1,
    },
    inputPlaceholder: {
        color: '#636366',
        fontSize: 16,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3A3A3C',
    },
    modalTitle: {
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
        backgroundColor: 'rgba(10, 132, 255, 0.1)',
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
