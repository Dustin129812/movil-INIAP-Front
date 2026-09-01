import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useTheme } from "../../../services/theme/ThemeContext";

function ListaProblemas({
    tipo = "enfermedad",
    problemas = [],
    totalEnfermedades = 0,
    totalPlagas = 0,
    seleccionado = null,
    cargando = false,
    onCambiarTipo,
    onSeleccionar,
}) {
    const { isDark } = useTheme();

    const colors = {
        card: isDark ? "#1E1E24" : "#FFFFFF",
        input: isDark ? "#2C2C2E" : "#F2F2F7",
        text: isDark ? "#FFFFFF" : "#000000",
        secondary: isDark ? "#98989F" : "#69736F",
        primary: "#34C759",
        primarySoft: isDark ? "rgba(52,199,89,0.15)" : "rgba(52,199,89,0.1)",
        empty: isDark ? "#1E1E24" : "#F8FAF9",
    };

    const esEnfermedad = tipo === "enfermedad";

    return (
        <View>
            <View
                style={[
                    styles.segment,
                    {
                        backgroundColor: colors.input,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.segmentButton,
                        esEnfermedad && {
                            backgroundColor:
                                colors.primary,
                        },
                    ]}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{
                        selected: esEnfermedad,
                    }}
                    onPress={() =>
                        onCambiarTipo?.("enfermedad")
                    }
                >
                    <MaterialCommunityIcons
                        name="virus-outline"
                        size={19}
                        color={
                            esEnfermedad
                                ? "#FFFFFF"
                                : colors.secondary
                        }
                    />

                    <Text
                        style={[
                            styles.segmentText,
                            {
                                color: esEnfermedad
                                    ? "#FFFFFF"
                                    : colors.secondary,
                            },
                        ]}
                    >
                        Enfermedades
                    </Text>

                    <View
                        style={[
                            styles.counter,
                            {
                                backgroundColor:
                                    esEnfermedad
                                        ? "rgba(255,255,255,0.20)"
                                        : colors.card,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.counterText,
                                {
                                    color: esEnfermedad
                                        ? "#FFFFFF"
                                        : colors.secondary,
                                },
                            ]}
                        >
                            {totalEnfermedades}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.segmentButton,
                        !esEnfermedad && {
                            backgroundColor:
                                colors.primary,
                        },
                    ]}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{
                        selected: !esEnfermedad,
                    }}
                    onPress={() =>
                        onCambiarTipo?.("plaga")
                    }
                >
                    <MaterialCommunityIcons
                        name="bug-outline"
                        size={19}
                        color={
                            !esEnfermedad
                                ? "#FFFFFF"
                                : colors.secondary
                        }
                    />

                    <Text
                        style={[
                            styles.segmentText,
                            {
                                color: !esEnfermedad
                                    ? "#FFFFFF"
                                    : colors.secondary,
                            },
                        ]}
                    >
                        Plagas
                    </Text>

                    <View
                        style={[
                            styles.counter,
                            {
                                backgroundColor:
                                    !esEnfermedad
                                        ? "rgba(255,255,255,0.20)"
                                        : colors.card,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.counterText,
                                {
                                    color: !esEnfermedad
                                        ? "#FFFFFF"
                                        : colors.secondary,
                                },
                            ]}
                        >
                            {totalPlagas}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {cargando && problemas.length === 0 ? (
                <View style={styles.loading}>
                    <ActivityIndicator
                        color={colors.primary}
                    />

                    <Text
                        style={[
                            styles.loadingText,
                            { color: colors.secondary },
                        ]}
                    >
                        Consultando relaciones...
                    </Text>
                </View>
            ) : problemas.length === 0 ? (
                <View
                    style={[
                        styles.empty,
                        {
                            backgroundColor: colors.card,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={
                            esEnfermedad
                                ? "virus-off-outline"
                                : "bug-outline"
                        }
                        size={31}
                        color={colors.primary}
                    />

                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: colors.text },
                        ]}
                    >
                        Sin{" "}
                        {esEnfermedad
                            ? "enfermedades"
                            : "plagas"}{" "}
                        relacionadas
                    </Text>

                    <Text
                        style={[
                            styles.emptyDescription,
                            { color: colors.secondary },
                        ]}
                    >
                        No existen registros asociados con
                        el cultivo seleccionado.
                    </Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {problemas.map((problema) => {
                        const activo =
                            seleccionado?.id ===
                            problema.id;

                        const detalle = esEnfermedad
                            ? problema.sintomas
                            : problema.danos;

                        return (
                            <TouchableOpacity
                                key={String(problema.id)}
                                style={[
                                    styles.card,
                                    {
                                        backgroundColor:
                                            activo
                                                ? colors.primarySoft
                                                : colors.card,
                                    },
                                ]}
                                activeOpacity={0.82}
                                accessibilityRole="button"
                                accessibilityState={{
                                    selected: activo,
                                }}
                                onPress={() =>
                                    onSeleccionar?.(
                                        problema
                                    )
                                }
                            >
                                <View
                                    style={[
                                        styles.icon,
                                        {
                                            backgroundColor:
                                                activo
                                                    ? colors.primary
                                                    : colors.primarySoft,
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            esEnfermedad
                                                ? "virus-outline"
                                                : "bug-outline"
                                        }
                                        size={23}
                                        color={
                                            activo
                                                ? "#FFFFFF"
                                                : colors.primary
                                        }
                                    />
                                </View>

                                <View
                                    style={styles.information}
                                >
                                    <Text
                                        style={[
                                            styles.name,
                                            {
                                                color:
                                                    colors.text,
                                            },
                                        ]}
                                    >
                                        {problema.nombre}
                                    </Text>

                                    {!!problema.nombre_cientifico && (
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.scientificName,
                                                {
                                                    color:
                                                        colors.secondary,
                                                },
                                            ]}
                                        >
                                            {
                                                problema.nombre_cientifico
                                            }
                                        </Text>
                                    )}

                                    {!!detalle && (
                                        <Text
                                            numberOfLines={2}
                                            style={[
                                                styles.detail,
                                                {
                                                    color:
                                                        colors.secondary,
                                                },
                                            ]}
                                        >
                                            {detalle}
                                        </Text>
                                    )}
                                </View>

                                <MaterialCommunityIcons
                                    name={
                                        activo
                                            ? "check-circle"
                                            : "chevron-right"
                                    }
                                    size={22}
                                    color={
                                        activo
                                            ? colors.primary
                                            : colors.secondary
                                    }
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

export default memo(ListaProblemas);

const styles = StyleSheet.create({
    segment: {
        padding: 4,
        borderRadius: 15,
        flexDirection: "row",
        marginBottom: 13,
    },
    segmentButton: {
        flex: 1,
        minHeight: 46,
        paddingHorizontal: 8,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    segmentText: {
        marginHorizontal: 6,
        fontSize: 11,
        fontWeight: "800",
    },
    counter: {
        minWidth: 23,
        height: 23,
        paddingHorizontal: 5,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    counterText: {
        fontSize: 10,
        fontWeight: "900",
    },
    list: {
        gap: 9,
    },
    card: {
        minHeight: 78,
        padding: 12,
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
        width: 44,
        height: 44,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
    },
    information: {
        flex: 1,
        marginHorizontal: 11,
    },
    name: {
        fontSize: 14,
        fontWeight: "900",
    },
    scientificName: {
        marginTop: 2,
        fontSize: 10,
        fontStyle: "italic",
    },
    detail: {
        marginTop: 5,
        fontSize: 11,
        lineHeight: 15,
    },
    loading: {
        minHeight: 130,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 9,
        fontSize: 12,
        fontWeight: "600",
    },
    empty: {
        minHeight: 150,
        padding: 22,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyTitle: {
        marginTop: 9,
        fontSize: 14,
        fontWeight: "900",
    },
    emptyDescription: {
        marginTop: 5,
        maxWidth: 280,
        textAlign: "center",
        fontSize: 11,
        lineHeight: 17,
    },
});