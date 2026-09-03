import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

function FiltrosInfografia({
    busqueda,
    total = 0,
    seleccionados = 0,
    todosSeleccionados = false,
    tipo = "enfermedades",
    colors,
    onCambiarBusqueda,
    onSeleccionarTodos,
    onLimpiarSeleccion,
}) {
    const placeholder =
        tipo === "plagas" ? "Buscar plaga" : "Buscar enfermedad";

    return (
        <View style={styles.container}>
            <View style={styles.searchRow}>
                <View
                    style={[
                        styles.search,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <TextInput
                        value={busqueda}
                        onChangeText={onCambiarBusqueda}
                        placeholder={placeholder}
                        placeholderTextColor={colors.secondaryText}
                        style={[styles.input, { color: colors.text }]}
                    />
                    {busqueda ? (
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() => onCambiarBusqueda?.("")}
                        >
                            <MaterialCommunityIcons
                                name="close-circle"
                                size={20}
                                color={colors.secondaryText}
                            />
                        </TouchableOpacity>
                    ) : (
                        <MaterialCommunityIcons
                            name="magnify"
                            size={20}
                            color={colors.secondaryText}
                        />
                    )}
                </View>

                <TouchableOpacity
                    activeOpacity={0.82}
                    style={[
                        styles.filterButton,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="filter-variant"
                        size={20}
                        color={colors.secondaryText}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
                <Text
                    style={[
                        styles.counter,
                        { color: colors.secondaryText },
                    ]}
                >
                    {total} resultado{total === 1 ? "" : "s"} ·{" "}
                    {seleccionados} seleccionado
                    {seleccionados === 1 ? "" : "s"}
                </Text>

                <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={
                        todosSeleccionados
                            ? onLimpiarSeleccion
                            : onSeleccionarTodos
                    }
                    style={[
                        styles.action,
                        {
                            backgroundColor: colors.primarySoft,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={
                            todosSeleccionados
                                ? "checkbox-blank-outline"
                                : "checkbox-multiple-marked-outline"
                        }
                        size={17}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.actionText,
                            { color: colors.primary },
                        ]}
                    >
                        {todosSeleccionados ? "Limpiar" : "Todo"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default memo(FiltrosInfografia);

const styles = StyleSheet.create({
    container: {
        gap: 9,
        marginBottom: 2,
    },
    searchRow: {
        flexDirection: "row",
        gap: 8,
    },
    search: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flex: 1,
        flexDirection: "row",
        minHeight: 44,
        paddingHorizontal: 13,
    },
    input: {
        flex: 1,
        fontSize: 13,
        fontWeight: "700",
        paddingVertical: 8,
    },
    filterButton: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    metaRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    counter: {
        flex: 1,
        fontSize: 11,
        fontWeight: "800",
    },
    action: {
        alignItems: "center",
        borderRadius: 10,
        flexDirection: "row",
        gap: 5,
        minHeight: 33,
        paddingHorizontal: 10,
    },
    actionText: {
        fontSize: 11,
        fontWeight: "900",
    },
});
