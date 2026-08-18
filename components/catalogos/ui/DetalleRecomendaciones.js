import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useTheme } from "../../../services/ThemeContext";

const TIPOS = {
    manejo: {
        label: "Manejo",
        icon: "clipboard-check-outline",
        color: "#2474C6",
        background: "#E7F1FC",
    },
    prevencion: {
        label: "Prevención",
        icon: "shield-check-outline",
        color: "#159A70",
        background: "#DDF5EB",
    },
    control_biologico: {
        label: "Control biológico",
        icon: "leaf-circle-outline",
        color: "#4C8C2B",
        background: "#EAF5E3",
    },
    control_quimico: {
        label: "Control químico",
        icon: "flask-outline",
        color: "#C56B14",
        background: "#FFF0DE",
    },
    control_cultural: {
        label: "Control cultural",
        icon: "shovel",
        color: "#8A5BC2",
        background: "#F0E8FA",
    },
};

function obtenerTipo(tipo) {
    return TIPOS[tipo] || {
        label: tipo || "Recomendación",
        icon: "lightbulb-on-outline",
        color: "#159A70",
        background: "#DDF5EB",
    };
}

function DetalleRecomendaciones({
    problema = null,
    tipoProblema = "enfermedad",
    recomendaciones = [],
    cargando = false,
}) {
    const { isDark } = useTheme();

    const colors = {
        card: isDark ? "#171D1B" : "#FFFFFF",
        input: isDark ? "#222927" : "#F2F6F4",
        border: isDark ? "#303936" : "#DDE8E4",
        text: isDark ? "#F8FAF9" : "#18231F",
        secondary: isDark ? "#AAB7B2" : "#687771",
        primary: "#159A70",
        primarySoft: isDark ? "#143C31" : "#DDF5EB",
        empty: isDark ? "#121715" : "#F8FAF9",
    };

    if (!problema) {
        return (
            <View
                style={[
                    styles.empty,
                    {
                        backgroundColor: colors.empty,
                        borderColor: colors.border,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name="gesture-tap"
                    size={32}
                    color={colors.primary}
                />

                <Text
                    style={[
                        styles.emptyTitle,
                        { color: colors.text },
                    ]}
                >
                    Selecciona un problema
                </Text>

                <Text
                    style={[
                        styles.emptyDescription,
                        { color: colors.secondary },
                    ]}
                >
                    Elige una enfermedad o plaga para
                    consultar las recomendaciones asociadas.
                </Text>
            </View>
        );
    }

    if (cargando && recomendaciones.length === 0) {
        return (
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
                    Consultando recomendaciones...
                </Text>
            </View>
        );
    }

    return (
        <View>
            <View
                style={[
                    styles.problemSummary,
                    {
                        backgroundColor:
                            colors.primarySoft,
                        borderColor: colors.primary,
                    },
                ]}
            >
                <View
                    style={[
                        styles.problemIcon,
                        {
                            backgroundColor:
                                colors.primary,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={
                            tipoProblema === "enfermedad"
                                ? "virus-outline"
                                : "bug-outline"
                        }
                        size={25}
                        color="#FFFFFF"
                    />
                </View>

                <View style={styles.problemInformation}>
                    <Text
                        style={[
                            styles.problemLabel,
                            { color: colors.primary },
                        ]}
                    >
                        {tipoProblema === "enfermedad"
                            ? "ENFERMEDAD SELECCIONADA"
                            : "PLAGA SELECCIONADA"}
                    </Text>

                    <Text
                        style={[
                            styles.problemName,
                            { color: colors.text },
                        ]}
                    >
                        {problema.nombre}
                    </Text>

                    {!!problema.descripcion && (
                        <Text
                            numberOfLines={3}
                            style={[
                                styles.problemDescription,
                                {
                                    color:
                                        colors.secondary,
                                },
                            ]}
                        >
                            {problema.descripcion}
                        </Text>
                    )}
                </View>
            </View>

            {recomendaciones.length === 0 ? (
                <View
                    style={[
                        styles.empty,
                        {
                            backgroundColor: colors.empty,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="lightbulb-off-outline"
                        size={32}
                        color={colors.primary}
                    />

                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: colors.text },
                        ]}
                    >
                        Sin recomendaciones
                    </Text>

                    <Text
                        style={[
                            styles.emptyDescription,
                            { color: colors.secondary },
                        ]}
                    >
                        Todavía no existen recomendaciones
                        asociadas con este registro.
                    </Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {recomendaciones.map(
                        (recomendacion, index) => {
                            const tipo = obtenerTipo(
                                recomendacion.tipo
                            );

                            const tipoBackground =
                                isDark
                                    ? colors.input
                                    : tipo.background;

                            return (
                                <View
                                    key={String(
                                        recomendacion.id
                                    )}
                                    style={[
                                        styles.card,
                                        {
                                            backgroundColor:
                                                colors.card,
                                            borderColor:
                                                colors.border,
                                        },
                                    ]}
                                >
                                    <View
                                        style={styles.cardHeader}
                                    >
                                        <View
                                            style={[
                                                styles.number,
                                                {
                                                    backgroundColor:
                                                        colors.primary,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={
                                                    styles.numberText
                                                }
                                            >
                                                {index + 1}
                                            </Text>
                                        </View>

                                        <Text
                                            style={[
                                                styles.title,
                                                {
                                                    color:
                                                        colors.text,
                                                },
                                            ]}
                                        >
                                            {
                                                recomendacion.titulo
                                            }
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.typeBadge,
                                            {
                                                backgroundColor:
                                                    tipoBackground,
                                            },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name={tipo.icon}
                                            size={16}
                                            color={tipo.color}
                                        />

                                        <Text
                                            style={[
                                                styles.typeText,
                                                {
                                                    color:
                                                        tipo.color,
                                                },
                                            ]}
                                        >
                                            {tipo.label}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.description,
                                            {
                                                color:
                                                    colors.secondary,
                                            },
                                        ]}
                                    >
                                        {
                                            recomendacion.descripcion
                                        }
                                    </Text>

                                    {!!recomendacion.instrucciones && (
                                        <View
                                            style={[
                                                styles.instructions,
                                                {
                                                    backgroundColor:
                                                        colors.input,
                                                },
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name="format-list-checks"
                                                size={19}
                                                color={
                                                    colors.primary
                                                }
                                            />

                                            <View
                                                style={
                                                    styles.instructionsContent
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.instructionsLabel,
                                                        {
                                                            color:
                                                                colors.primary,
                                                        },
                                                    ]}
                                                >
                                                    Instrucciones
                                                </Text>

                                                <Text
                                                    style={[
                                                        styles.instructionsText,
                                                        {
                                                            color:
                                                                colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {
                                                        recomendacion.instrucciones
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        }
                    )}
                </View>
            )}
        </View>
    );
}

export default memo(DetalleRecomendaciones);

const styles = StyleSheet.create({
    problemSummary: {
        padding: 14,
        borderWidth: 1,
        borderRadius: 17,
        flexDirection: "row",
        marginBottom: 13,
    },
    problemIcon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    problemInformation: {
        flex: 1,
        marginLeft: 12,
    },
    problemLabel: {
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 0.7,
    },
    problemName: {
        marginTop: 3,
        fontSize: 16,
        fontWeight: "900",
    },
    problemDescription: {
        marginTop: 5,
        fontSize: 11,
        lineHeight: 16,
    },
    list: {
        gap: 11,
    },
    card: {
        padding: 16,
        borderWidth: 1,
        borderRadius: 18,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    number: {
        width: 29,
        height: 29,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    numberText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "900",
    },
    title: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: "900",
    },
    typeBadge: {
        alignSelf: "flex-start",
        marginTop: 12,
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 9,
        flexDirection: "row",
        alignItems: "center",
    },
    typeText: {
        marginLeft: 5,
        fontSize: 10,
        fontWeight: "900",
    },
    description: {
        marginTop: 12,
        fontSize: 12,
        lineHeight: 19,
    },
    instructions: {
        marginTop: 13,
        padding: 12,
        borderRadius: 13,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    instructionsContent: {
        flex: 1,
        marginLeft: 9,
    },
    instructionsLabel: {
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    instructionsText: {
        marginTop: 4,
        fontSize: 11,
        lineHeight: 17,
    },
    loading: {
        minHeight: 150,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 9,
        fontSize: 12,
        fontWeight: "600",
    },
    empty: {
        minHeight: 160,
        padding: 24,
        borderWidth: 1,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyTitle: {
        marginTop: 9,
        fontSize: 15,
        fontWeight: "900",
    },
    emptyDescription: {
        marginTop: 6,
        maxWidth: 290,
        textAlign: "center",
        fontSize: 11,
        lineHeight: 17,
    },
});