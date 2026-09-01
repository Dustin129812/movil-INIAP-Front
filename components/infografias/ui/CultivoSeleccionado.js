import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import ImagenAgricola from "./ImagenAgricola";

function CultivoSeleccionado({
    cultivos = [],
    seleccionado = null,
    cargando = false,
    busqueda = "",
    colors,
    onCambiarBusqueda,
    onSeleccionar,
}) {
    if (cargando && cultivos.length === 0) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
                <Text
                    style={[
                        styles.loadingText,
                        { color: colors.secondaryText },
                    ]}
                >
                    Cargando cultivos...
                </Text>
            </View>
        );
    }

    return (
        <View>
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
                    placeholder="Buscar cultivo..."
                    placeholderTextColor={colors.secondaryText}
                    style={[styles.input, { color: colors.text }]}
                />
                {busqueda ? (
                    <TouchableOpacity
                        activeOpacity={0.78}
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

            {!cultivos.length ? (
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
                        name="database-off-outline"
                        size={30}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: colors.text },
                        ]}
                    >
                        No hay cultivos disponibles
                    </Text>
                    <Text
                        style={[
                            styles.emptyDescription,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Sincroniza los catalogos para generar infografias.
                    </Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {cultivos.map((cultivo) => {
                        const activo =
                            Number(seleccionado?.id) ===
                            Number(cultivo.id);

                        return (
                            <TouchableOpacity
                                key={String(cultivo.id)}
                                activeOpacity={0.86}
                                onPress={() => onSeleccionar?.(cultivo)}
                                style={[
                                    styles.card,
                                    {
                                        backgroundColor: activo
                                            ? colors.primarySoft
                                            : colors.card,
                                        borderColor: activo
                                            ? colors.primary
                                            : colors.border,
                                    },
                                ]}
                            >
                                <ImagenAgricola
                                    id={cultivo.id}
                                    tipo="cultivo"
                                    variant="thumb"
                                    style={styles.thumb}
                                />

                                <View style={styles.info}>
                                    <Text
                                        style={[
                                            styles.name,
                                            { color: colors.text },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {cultivo.nombre}
                                    </Text>
                                    {!!cultivo.nombre_cientifico && (
                                        <Text
                                            style={[
                                                styles.scientific,
                                                {
                                                    color: colors.secondaryText,
                                                },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {cultivo.nombre_cientifico}
                                        </Text>
                                    )}
                                </View>

                                <MaterialCommunityIcons
                                    name={
                                        activo
                                            ? "check-circle"
                                            : "chevron-right"
                                    }
                                    size={23}
                                    color={
                                        activo
                                            ? colors.primary
                                            : colors.secondaryText
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

export default memo(CultivoSeleccionado);

const styles = StyleSheet.create({
    search: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        minHeight: 48,
        paddingHorizontal: 13,
    },
    input: {
        flex: 1,
        fontSize: 13,
        fontWeight: "700",
        paddingVertical: 8,
    },
    list: {
        gap: 9,
        marginTop: 10,
    },
    card: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        minHeight: 72,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    thumb: {
        borderRadius: 9,
        height: 52,
        marginRight: 11,
        width: 52,
    },
    info: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        fontSize: 14,
        fontWeight: "900",
    },
    scientific: {
        fontSize: 11,
        fontStyle: "italic",
        fontWeight: "700",
        marginTop: 3,
    },
    loading: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 122,
    },
    loadingText: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 8,
    },
    empty: {
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 12,
        padding: 18,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "900",
        marginTop: 8,
    },
    emptyDescription: {
        fontSize: 12,
        lineHeight: 17,
        marginTop: 4,
        textAlign: "center",
    },
});
