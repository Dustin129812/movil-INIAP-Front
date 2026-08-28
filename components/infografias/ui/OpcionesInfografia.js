import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORES_SECCION = {
    informacion: "#2BA56A",
    enfermedades: "#E95050",
    plagas: "#F18A22",
    recomendaciones: "#2379C9",
};

function obtenerConteo(clave, resumenEtapa = {}) {
    if (clave === "enfermedades") {
        return resumenEtapa.enfermedades || 0;
    }

    if (clave === "plagas") {
        return resumenEtapa.plagas || 0;
    }

    if (clave === "recomendaciones") {
        return resumenEtapa.recomendaciones || 0;
    }

    return null;
}

function OpcionesInfografia({
    secciones = [],
    seccionesSeleccionadas = [],
    todasSeleccionadas = false,
    resumenEtapa = {},
    colors,
    onAlternarSeccion,
    onSeleccionarTodo,
    onLimpiar,
}) {
    const completoPorDefecto = seccionesSeleccionadas.length === 0;
    const estadoCompleto =
        completoPorDefecto || todasSeleccionadas;
    const etiquetaTodo = completoPorDefecto
        ? "Completa"
        : todasSeleccionadas
          ? "Limpiar"
          : "Seleccionar todo";
    const accionTodo = completoPorDefecto
        ? onSeleccionarTodo
        : todasSeleccionadas
          ? onLimpiar
          : onSeleccionarTodo;

    return (
        <View>
            <View style={styles.headerRow}>
                <Text style={[styles.question, { color: colors.text }]}>
                    Informacion incluida
                </Text>

                <TouchableOpacity
                    activeOpacity={0.84}
                    onPress={accionTodo}
                    style={[
                        styles.selectAll,
                        { backgroundColor: colors.primarySoft },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={
                            estadoCompleto
                                ? "checkbox-marked"
                                : "checkbox-blank-outline"
                        }
                        size={17}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.selectAllText,
                            { color: colors.primary },
                        ]}
                    >
                        {etiquetaTodo}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.options}>
                {secciones.map((opcion) => {
                    const activo =
                        completoPorDefecto ||
                        seccionesSeleccionadas.includes(opcion.clave);
                    const color =
                        COLORES_SECCION[opcion.clave] || colors.primary;
                    const conteo = obtenerConteo(
                        opcion.clave,
                        resumenEtapa
                    );

                    return (
                        <TouchableOpacity
                            key={opcion.clave}
                            activeOpacity={0.86}
                            onPress={() =>
                                onAlternarSeccion?.(opcion.clave)
                            }
                            style={[
                                styles.option,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: activo
                                        ? color
                                        : colors.border,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.optionIcon,
                                    { backgroundColor: `${color}22` },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={opcion.icono}
                                    size={22}
                                    color={color}
                                />
                            </View>

                            <View style={styles.optionText}>
                                <Text
                                    style={[
                                        styles.optionTitle,
                                        { color: colors.text },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {opcion.titulo}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionSubtitle,
                                        { color: colors.secondaryText },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {opcion.descripcion}
                                </Text>
                            </View>

                            {conteo != null ? (
                                <View
                                    style={[
                                        styles.countBadge,
                                        { backgroundColor: `${color}18` },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.countText,
                                            { color },
                                        ]}
                                    >
                                        {conteo}
                                    </Text>
                                </View>
                            ) : null}

                            <MaterialCommunityIcons
                                name={
                                    activo
                                        ? "check-circle"
                                        : "circle-outline"
                                }
                                size={22}
                                color={
                                    activo
                                        ? color
                                        : colors.secondaryText
                                }
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>

            {completoPorDefecto ? (
                <View
                    style={[
                        styles.note,
                        { backgroundColor: colors.primarySoft },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="information"
                        size={17}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.noteText,
                            { color: colors.text },
                        ]}
                    >
                        Sin secciones marcadas se genera la infografia completa.
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

export default memo(OpcionesInfografia);

const styles = StyleSheet.create({
    headerRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        justifyContent: "space-between",
    },
    question: {
        flex: 1,
        fontSize: 15,
        fontWeight: "900",
    },
    selectAll: {
        alignItems: "center",
        borderRadius: 999,
        flexDirection: "row",
        gap: 5,
        minHeight: 34,
        paddingHorizontal: 10,
    },
    selectAllText: {
        fontSize: 11,
        fontWeight: "900",
    },
    options: {
        gap: 10,
        marginTop: 12,
    },
    option: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        minHeight: 70,
        paddingHorizontal: 10,
        paddingVertical: 9,
    },
    optionIcon: {
        alignItems: "center",
        borderRadius: 10,
        height: 42,
        justifyContent: "center",
        marginRight: 11,
        width: 42,
    },
    optionText: {
        flex: 1,
        minWidth: 0,
    },
    optionTitle: {
        fontSize: 13,
        fontWeight: "900",
        lineHeight: 17,
    },
    optionSubtitle: {
        fontSize: 11,
        fontWeight: "700",
        lineHeight: 15,
        marginTop: 3,
    },
    countBadge: {
        alignItems: "center",
        borderRadius: 999,
        height: 28,
        justifyContent: "center",
        marginHorizontal: 8,
        minWidth: 28,
        paddingHorizontal: 7,
    },
    countText: {
        fontSize: 11,
        fontWeight: "900",
    },
    note: {
        alignItems: "center",
        borderRadius: 10,
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
        padding: 11,
    },
    noteText: {
        flex: 1,
        fontSize: 11,
        fontWeight: "800",
        lineHeight: 15,
    },
});
