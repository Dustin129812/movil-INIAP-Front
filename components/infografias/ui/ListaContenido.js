import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import ImagenAgricola from "./ImagenAgricola";

function ListaContenido({
    data = [],
    idsSeleccionados = [],
    cargando = false,
    tipo = "enfermedades",
    colors,
    ListHeaderComponent,
    ListFooterComponent,
    onAlternar,
}) {
    const esEnfermedad = tipo === "enfermedades";
    const tipoImagen = esEnfermedad ? "enfermedad" : "plaga";

    function renderItem({ item }) {
        const activo = idsSeleccionados.includes(Number(item.id));
        const totalRecomendaciones = Number(
            item.total_recomendaciones || 0
        );

        return (
            <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => onAlternar?.(item.id)}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: activo
                            ? colors.primary
                            : colors.border,
                    },
                ]}
            >
                <ImagenAgricola
                    id={item.id}
                    tipo={tipoImagen}
                    variant="thumb"
                    style={styles.thumb}
                />

                <View style={styles.info}>
                    <Text
                        style={[styles.name, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {item.nombre}
                    </Text>
                    {!!item.nombre_cientifico && (
                        <Text
                            style={[
                                styles.scientific,
                                { color: colors.secondaryText },
                            ]}
                            numberOfLines={1}
                        >
                            {item.nombre_cientifico}
                        </Text>
                    )}
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: colors.primarySoft },
                        ]}
                    >
                        <Text
                            style={[
                                styles.badgeText,
                                { color: colors.primary },
                            ]}
                        >
                            {totalRecomendaciones > 0
                                ? `${totalRecomendaciones} recomendación${
                                      totalRecomendaciones === 1 ? "" : "es"
                                  }`
                                : "Sin recomendaciones"}
                        </Text>
                    </View>
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
                            : colors.secondaryText
                    }
                />
            </TouchableOpacity>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            ListEmptyComponent={
                <View
                    style={[
                        styles.empty,
                        {
                            backgroundColor: colors.empty,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {cargando ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <MaterialCommunityIcons
                            name={
                                esEnfermedad
                                    ? "leaf-off"
                                    : "bug-outline"
                            }
                            size={32}
                            color={colors.primary}
                        />
                    )}
                    <Text
                        style={[styles.emptyTitle, { color: colors.text }]}
                    >
                        {cargando
                            ? "Cargando registros..."
                            : "Sin registros disponibles"}
                    </Text>
                    {!cargando && (
                        <Text
                            style={[
                                styles.emptyText,
                                { color: colors.secondaryText },
                            ]}
                        >
                            No hay información local para mostrar.
                        </Text>
                    )}
                </View>
            }
            contentContainerStyle={styles.content}
        />
    );
}

export default memo(ListaContenido);

const styles = StyleSheet.create({
    content: {
        padding: 12,
        paddingBottom: 112,
    },
    card: {
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        marginTop: 9,
        minHeight: 84,
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    thumb: {
        marginRight: 11,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 13,
        fontWeight: "900",
        lineHeight: 18,
    },
    scientific: {
        fontSize: 10,
        fontWeight: "700",
        marginTop: 1,
    },
    badge: {
        alignSelf: "flex-start",
        borderRadius: 6,
        marginTop: 7,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: "900",
    },
    empty: {
        alignItems: "center",
        borderRadius: 14,
        borderWidth: 1,
        marginTop: 14,
        padding: 24,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "900",
        marginTop: 9,
    },
    emptyText: {
        fontSize: 12,
        lineHeight: 17,
        marginTop: 4,
        textAlign: "center",
    },
});
