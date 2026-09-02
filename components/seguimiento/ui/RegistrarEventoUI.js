import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../services/theme';
import { createSeguimientoStyles } from './seguimientoStyles';

export default function RegistrarEventoUI({
    form,
    setField,
    isValid,
    onGuardar,
    loading,
    catalogoEnfermedades = [],
    catalogoPlagas = [],
    catalogoRecomendaciones = [],
    TIPOS_EVENTO = [],
    SEVERIDADES = [],
    etapaNombre,
}) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const { styles, colors } = createSeguimientoStyles(isDark);

    return (
        <View style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Registrar Evento</Text>
                        {etapaNombre ? (
                            <Text style={styles.headerSubtitle}>Etapa: {etapaNombre}</Text>
                        ) : null}
                    </View>
                </View>

                {/* Tipo de evento */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tipo de evento</Text>
                    <View style={styles.chipRow}>
                        {TIPOS_EVENTO.map((tipo) => (
                            <TouchableOpacity
                                key={tipo.key}
                                style={[
                                    styles.chip,
                                    form.tipo_evento === tipo.key && styles.chipActive,
                                ]}
                                onPress={() => setField('tipo_evento', tipo.key)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <MaterialCommunityIcons
                                        name={tipo.icon}
                                        size={16}
                                        color={form.tipo_evento === tipo.key ? tipo.color : colors.textTertiary}
                                    />
                                    <Text style={[
                                        styles.chipText,
                                        form.tipo_evento === tipo.key && { color: tipo.color, fontWeight: '600' },
                                    ]}>
                                        {tipo.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Título */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Título / Evento *</Text>
                    <TextInput
                        style={styles.input}
                        value={form.titulo}
                        onChangeText={(v) => setField('titulo', v)}
                        placeholder="Ej: Floración observada, riego aplicado, etc."
                        placeholderTextColor={colors.textTertiary}
                    />
                </View>

                {/* Descripción */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Descripción / Observaciones</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={form.descripcion}
                        onChangeText={(v) => setField('descripcion', v)}
                        placeholder="Detalles adicionales, dosis aplicadas o estado del cultivo..."
                        placeholderTextColor={colors.textTertiary}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Selector de enfermedad (si aplica) */}
                {form.tipo_evento === 'incidencia_enfermedad' && catalogoEnfermedades.length > 0 ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Enfermedad Detectada</Text>
                        <View style={styles.chipRow}>
                            {catalogoEnfermedades.map((enf) => (
                                <TouchableOpacity
                                    key={enf.id}
                                    style={[
                                        styles.chip,
                                        form.enfermedad_id === enf.id && styles.chipActive,
                                    ]}
                                    onPress={() => setField('enfermedad_id', enf.id)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        form.enfermedad_id === enf.id && styles.chipTextActive,
                                    ]}>
                                        {enf.nombre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Selector de plaga (si aplica) */}
                {form.tipo_evento === 'incidencia_plaga' && catalogoPlagas.length > 0 ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Plaga Detectada</Text>
                        <View style={styles.chipRow}>
                            {catalogoPlagas.map((plaga) => (
                                <TouchableOpacity
                                    key={plaga.id}
                                    style={[
                                        styles.chip,
                                        form.plaga_id === plaga.id && styles.chipActive,
                                    ]}
                                    onPress={() => setField('plaga_id', plaga.id)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        form.plaga_id === plaga.id && styles.chipTextActive,
                                    ]}>
                                        {plaga.nombre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Severidad */}
                {(form.tipo_evento === 'incidencia_enfermedad' || form.tipo_evento === 'incidencia_plaga') ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Nivel de Severidad</Text>
                        <View style={styles.chipRow}>
                            {SEVERIDADES.map((sev) => (
                                <TouchableOpacity
                                    key={sev.key}
                                    style={[
                                        styles.chip,
                                        form.severidad === sev.key && {
                                            borderColor: sev.color,
                                            backgroundColor: `${sev.color}15`,
                                        },
                                    ]}
                                    onPress={() => setField('severidad', sev.key)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        form.severidad === sev.key && { color: sev.color, fontWeight: '600' },
                                    ]}>
                                        {sev.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Selector de recomendación (si tipo es tratamiento_aplicado) */}
                {form.tipo_evento === 'tratamiento_aplicado' && catalogoRecomendaciones.length > 0 ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Recomendación Aplicada</Text>
                        <View style={styles.chipRow}>
                            {catalogoRecomendaciones.map((rec) => (
                                <TouchableOpacity
                                    key={rec.id}
                                    style={[
                                        styles.chip,
                                        form.recomendacion_id === rec.id && {
                                            borderColor: '#30D158',
                                            backgroundColor: 'rgba(48, 209, 88, 0.1)',
                                        },
                                    ]}
                                    onPress={() => setField('recomendacion_id', form.recomendacion_id === rec.id ? null : rec.id)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        form.recomendacion_id === rec.id && { color: '#30D158', fontWeight: '600' },
                                    ]}>
                                        {rec.titulo}
                                    </Text>
                                    {rec.tipo ? (
                                        <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
                                            {rec.tipo}
                                        </Text>
                                    ) : null}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Botón guardar */}
                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        (!isValid || loading) && styles.primaryButtonDisabled,
                        { marginHorizontal: 0, marginTop: 12 },
                    ]}
                    onPress={onGuardar}
                    disabled={!isValid || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Guardar Evento</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
