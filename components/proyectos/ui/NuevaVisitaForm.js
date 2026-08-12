import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { proyectosStyles } from './proyectosStyles';

export default function NuevaVisitaForm({
    formData,
    updateField,
    guardarVisita,
    limpiarFormulario,
    isSaving,
    error,
}) {
    const handleGuardar = async () => {
        const resultado = await guardarVisita();
        if (resultado.success) {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView
            style={proyectosStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Nueva Visita</Text>
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={20} color="#FF453A" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={proyectosStyles.card}>
                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Técnico Responsable *</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="Nombre del técnico"
                            placeholderTextColor="#636366"
                            value={formData.tecnico_nombre}
                            onChangeText={(value) => updateField('tecnico_nombre', value)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Fecha de Visita *</Text>
                        <TextInput
                            style={proyectosStyles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#636366"
                            value={formData.fecha_visita}
                            onChangeText={(value) => updateField('fecha_visita', value)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Observaciones</Text>
                        <TextInput
                            style={[proyectosStyles.input, proyectosStyles.inputMultiline]}
                            placeholder="Observaciones del estado del cultivo, condiciones climáticas, plagas..."
                            placeholderTextColor="#636366"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={formData.observaciones}
                            onChangeText={(value) => updateField('observaciones', value)}
                        />
                    </View>

                    <View style={proyectosStyles.inputContainer}>
                        <Text style={proyectosStyles.inputLabel}>Recomendaciones</Text>
                        <TextInput
                            style={[proyectosStyles.input, proyectosStyles.inputMultiline]}
                            placeholder="Recomendaciones para el técnico o productor..."
                            placeholderTextColor="#636366"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={formData.recomendaciones}
                            onChangeText={(value) => updateField('recomendaciones', value)}
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[proyectosStyles.button, { backgroundColor: '#0A84FF' }]}
                        onPress={handleGuardar}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Text style={proyectosStyles.buttonText}>Guardando...</Text>
                        ) : (
                            <Text style={proyectosStyles.buttonText}>Guardar Visita</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[proyectosStyles.button, proyectosStyles.buttonSecondary]}
                        onPress={limpiarFormulario}
                        disabled={isSaving}
                    >
                        <Text style={[proyectosStyles.buttonText, proyectosStyles.buttonSecondaryText]}>
                            Limpiar Formulario
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
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
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
        marginHorizontal: 16,
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    errorText: {
        color: '#FF453A',
        fontSize: 14,
        flex: 1,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
});
