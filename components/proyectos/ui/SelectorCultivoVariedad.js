import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../services/theme';
import {
    obtenerCultivosActivos,
} from '../../../services/catalogosConsultaService';

const SelectorCultivoVariedad = ({
    visible,
    onClose,
    onSelect,
    cultivo_seleccionado,
    variedad_seleccionada,
}) => {
    const { isDark } = useTheme();
    const [cultivos, setCultivos] = useState([]);
    const [isLoadingCultivos, setIsLoadingCultivos] = useState(false);
    const [step, setStep] = useState('cultivo'); // 'cultivo' | 'variedad'
    const [variedadTexto, setVariedadTexto] = useState(variedad_seleccionada?.nombre || '');

    const bg = isDark ? '#1C1C1E' : '#FFFFFF';
    const textPrimary = isDark ? '#FFFFFF' : '#000000';
    const textSecondary = isDark ? '#8E8E93' : '#6E6E73';
    const borderColor = isDark ? '#3A3A3C' : '#E5E5EA';
    const selectedBg = isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.1)';
    const inputBg = isDark ? '#2C2C2E' : '#F2F2F7';

    useEffect(() => {
        if (visible) {
            cargarCultivos();
            setVariedadTexto(variedad_seleccionada?.nombre || '');
        }
    }, [visible, variedad_seleccionada]);

    const cargarCultivos = async () => {
        setIsLoadingCultivos(true);
        try {
            const data = await obtenerCultivosActivos();
            setCultivos(data || []);
        } catch (error) {
            console.warn('[SelectorCultivoVariedad] Error cargando cultivos:', error);
        } finally {
            setIsLoadingCultivos(false);
        }
    };

    const handleCultivoSelect = (cultivo) => {
        onSelect({
            cultivo_id: cultivo.id,
            cultivo_nombre: cultivo.nombre,
            variedad_id: null,
            variedad_nombre: variedadTexto || '',
        });
        setStep('variedad');
    };

    const handleVariedadChange = (text) => {
        setVariedadTexto(text);
        // No llamar a onSelect en cada keystroke, solo al confirmar con "Aceptar"
    };

    const handleDone = () => {
        onSelect({
            cultivo_id: cultivo_seleccionado?.id,
            cultivo_nombre: cultivo_seleccionado?.nombre,
            variedad_id: null,
            variedad_nombre: variedadTexto,
        });
        onClose();
    };

    const handleBack = () => {
        setStep('cultivo');
    };

    const handleClose = () => {
        setStep('cultivo');
        setVariedadTexto('');
        onClose();
    };

    const renderCultivoItem = ({ item }) => {
        const isSelected = cultivo_seleccionado?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.item, isSelected && { backgroundColor: selectedBg }]}
                onPress={() => handleCultivoSelect(item)}
                activeOpacity={0.7}
            >
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: textPrimary }]}>{item.nombre}</Text>
                    {item.nombre_cientifico && (
                        <Text style={[styles.itemSubtitle, { color: textSecondary }]}>
                            {item.nombre_cientifico}
                        </Text>
                    )}
                </View>
                {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={22} color="#34C759" />
                )}
            </TouchableOpacity>
        );
    };

    const renderEmptyCultivos = () => (
        <View style={styles.emptyState}>
            <MaterialCommunityIcons name="leaf-off" size={48} color={textSecondary} />
            <Text style={[styles.emptyText, { color: textSecondary }]}>No hay cultivos disponibles</Text>
            <Text style={[styles.emptySubtext, { color: textSecondary }]}>
                Sincroniza los catálogos primero
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={[styles.content, { backgroundColor: bg }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: borderColor }]}>
                        {step === 'variedad' && (
                            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                                <MaterialCommunityIcons name="chevron-left" size={24} color="#34C759" />
                            </TouchableOpacity>
                        )}
                        <Text style={[styles.title, { color: textPrimary }]}>
                            {step === 'cultivo' ? 'Seleccionar Cultivo' : 'Escribir Variedad'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} color={textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Cultivo selector */}
                    {step === 'cultivo' && (
                        <>
                            {isLoadingCultivos ? (
                                <ActivityIndicator size="large" color="#34C759" style={styles.loader} />
                            ) : (
                                <FlatList
                                    data={cultivos}
                                    keyExtractor={(item) => item.id?.toString()}
                                    renderItem={renderCultivoItem}
                                    ListEmptyComponent={renderEmptyCultivos}
                                    ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: borderColor }]} />}
                                    contentContainerStyle={cultivos.length === 0 ? styles.emptyList : undefined}
                                />
                            )}
                        </>
                    )}

                    {/* Variedad texto libre */}
                    {step === 'variedad' && (
                        <View style={styles.variedadContainer}>
                            <View style={[styles.selectedCultivoBanner, { backgroundColor: selectedBg }]}>
                                <MaterialCommunityIcons name="leaf" size={16} color="#34C759" />
                                <Text style={[styles.selectedCultivoText, { color: textPrimary }]}>
                                    {cultivo_seleccionado?.nombre || 'Cultivo seleccionado'}
                                </Text>
                            </View>

                            <View style={styles.inputSection}>
                                <Text style={[styles.inputLabel, { color: textSecondary }]}>
                                    Escribe el nombre de la variedad
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: inputBg,
                                            color: textPrimary,
                                            borderColor: borderColor
                                        }
                                    ]}
                                    placeholder="Ej: híbrida, criolla, local..."
                                    placeholderTextColor={textSecondary}
                                    value={variedadTexto}
                                    onChangeText={handleVariedadChange}
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.doneButton, { backgroundColor: '#34C759' }]}
                                onPress={handleDone}
                            >
                                <Text style={styles.doneButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        minHeight: '50%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 4,
        marginRight: 8,
    },
    closeBtn: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    separator: {
        height: 1,
        marginLeft: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
    },
    loader: {
        marginTop: 48,
    },
    selectedCultivoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    selectedCultivoText: {
        fontSize: 14,
        fontWeight: '600',
    },
    variedadContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    inputSection: {
        marginTop: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    doneButton: {
        marginTop: 24,
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

export default SelectorCultivoVariedad;
