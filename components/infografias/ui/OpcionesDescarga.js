import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function BotonAccion({
    icon,
    label,
    colors,
    variant = "outline",
    disabled,
    loading,
    onPress,
}) {
    const filled = variant === "filled";

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            disabled={disabled || loading}
            onPress={onPress}
            style={[
                styles.button,
                {
                    backgroundColor: filled
                        ? colors.primary
                        : colors.card,
                    borderColor: filled
                        ? colors.primary
                        : colors.border,
                    opacity: disabled ? 0.58 : 1,
                },
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={filled ? "#FFFFFF" : colors.primary}
                />
            ) : (
                <MaterialCommunityIcons
                    name={icon}
                    size={18}
                    color={filled ? "#FFFFFF" : colors.primary}
                />
            )}
            <Text
                style={[
                    styles.buttonText,
                    {
                        color: filled ? "#FFFFFF" : colors.primary,
                    },
                ]}
                numberOfLines={2}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function OpcionesDescarga({
    colors,
    generandoImagen = false,
    generandoPdf = false,
    disabled = false,
    onGuardarImagen,
    onVerPdf,
    onGuardarPdf,
}) {
    return (
        <View style={styles.grid}>
            <BotonAccion
                icon="image-arrow-down-outline"
                label="Descargar imagen"
                colors={colors}
                disabled={disabled}
                loading={generandoImagen}
                onPress={onGuardarImagen}
            />
            <BotonAccion
                icon="file-eye-outline"
                label="Ver PDF"
                colors={colors}
                disabled={disabled}
                loading={generandoPdf}
                onPress={onVerPdf}
            />
            <BotonAccion
                icon="file-download-outline"
                label="Guardar PDF"
                colors={colors}
                disabled={disabled}
                loading={generandoPdf}
                variant="filled"
                onPress={onGuardarPdf}
            />
        </View>
    );
}

export default memo(OpcionesDescarga);

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        gap: 7,
        width: "100%",
    },
    button: {
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        flex: 1,
        gap: 4,
        justifyContent: "center",
        minHeight: 56,
        paddingHorizontal: 5,
        paddingVertical: 8,
    },
    buttonText: {
        flexShrink: 1,
        fontSize: 10,
        fontWeight: "900",
        lineHeight: 13,
        textAlign: "center",
    },
});
