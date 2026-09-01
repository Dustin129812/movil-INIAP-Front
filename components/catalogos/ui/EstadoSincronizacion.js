import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useTheme } from "../../../services/theme/ThemeContext";

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin actualización";
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
        return "Fecha no disponible";
    }

    return valor.toLocaleString();
}

function EstadoSincronizacion({
    estado = null,
    sincronizando = false,
    onSincronizar,
    isDark = false,
}) {
    const { isDark: themeIsDark } = useTheme();
    const dark = isDark || themeIsDark;

    const colors = {
        card: dark ? "#1E1E24" : "#FFFFFF",
        text: dark ? "#FFFFFF" : "#000000",
        secondary: dark ? "#98989F" : "#69736F",
        primary: "#34C759",
        primarySoft: dark ? "rgba(52,199,89,0.15)" : "rgba(52,199,89,0.1)",
        warning: "#FF9500",
        warningSoft: dark ? "rgba(255,149,0,0.15)" : "rgba(255,149,0,0.1)",
        danger: "#FF453A",
        dangerSoft: dark ? "rgba(255,69,58,0.15)" : "rgba(255,69,58,0.1)",
    };

    const configuracion = useMemo(() => {
        switch (estado?.estado) {
            case "sincronizado":
                return {
                    label: "Información actualizada",
                    icon: "cloud-check-outline",
                    color: colors.primary,
                    background: colors.primarySoft,
                };

            case "error":
                return {
                    label: "Error de sincronización",
                    icon: "cloud-alert-outline",
                    color: colors.danger,
                    background: colors.dangerSoft,
                };

            default:
                return {
                    label: "Actualización pendiente",
                    icon: "cloud-clock-outline",
                    color: colors.warning,
                    background: colors.warningSoft,
                };
        }
    }, [
        estado?.estado,
        colors.primary,
        colors.primarySoft,
        colors.warning,
        colors.warningSoft,
        colors.danger,
        colors.dangerSoft,
    ]);

    const fecha = formatearFecha(
        estado?.ultima_sincronizacion
    );

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.card,
                },
            ]}
        >
            <View
                style={[
                    styles.icon,
                    {
                        backgroundColor:
                            configuracion.background,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name={configuracion.icon}
                    size={25}
                    color={configuracion.color}
                />
            </View>

            <View style={styles.information}>
                <Text
                    style={[
                        styles.status,
                        {
                            color:
                                configuracion.color,
                        },
                    ]}
                >
                    {configuracion.label}
                </Text>

                <Text
                    style={[
                        styles.date,
                        { color: colors.secondary },
                    ]}
                >
                    {fecha}
                </Text>

                {estado?.estado === "error" &&
                    !!estado?.ultimo_error && (
                        <Text
                            numberOfLines={2}
                            style={[
                                styles.error,
                                {
                                    color: colors.danger,
                                },
                            ]}
                        >
                            {estado.ultimo_error}
                        </Text>
                    )}
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor:
                            colors.primarySoft,
                    },
                ]}
                disabled={sincronizando}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel="Actualizar catálogos"
                onPress={onSincronizar}
            >
                {sincronizando ? (
                    <ActivityIndicator
                        size="small"
                        color={colors.primary}
                    />
                ) : (
                    <MaterialCommunityIcons
                        name="sync"
                        size={23}
                        color={colors.primary}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
}

export default memo(EstadoSincronizacion);

const styles = StyleSheet.create({
    container: {
        minHeight: 72,
        padding: 14,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    information: {
        flex: 1,
        marginHorizontal: 11,
    },
    status: {
        fontSize: 12,
        fontWeight: "900",
    },
    date: {
        marginTop: 4,
        fontSize: 10,
        fontWeight: "600",
    },
    error: {
        marginTop: 5,
        fontSize: 10,
        lineHeight: 14,
        fontWeight: "700",
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
});