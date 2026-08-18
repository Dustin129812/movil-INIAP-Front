import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useMemo } from "react";

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useTheme } from "../../../services/ThemeContext";

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
}) {
    const { isDark } = useTheme();

    const colors = {
        card: isDark ? "#171D1B" : "#FFFFFF",
        border: isDark ? "#303936" : "#DDE8E4",
        text: isDark ? "#F8FAF9" : "#18231F",
        secondary: isDark ? "#AAB7B2" : "#687771",
        primary: "#159A70",
        primarySoft: isDark ? "#143C31" : "#DDF5EB",
        warning: "#D98516",
        warningSoft: isDark ? "#49331A" : "#FFF0DC",
        danger: "#D94A4A",
        dangerSoft: isDark ? "#482020" : "#FDE7E7",
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
                    borderColor: colors.border,
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
        minHeight: 82,
        padding: 13,
        borderWidth: 1,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
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