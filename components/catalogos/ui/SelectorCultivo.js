import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";

import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useTheme } from "../../../services/ThemeContext";

function SelectorCultivo({
    cultivos = [],
    seleccionado = null,
    cargando = false,
    onSeleccionar,
}) {
    const { isDark } = useTheme();

    const colors = {
        card: isDark ? "#171D1B" : "#FFFFFF",
        border: isDark ? "#303936" : "#DDE8E4",
        text: isDark ? "#F8FAF9" : "#18231F",
        secondary: isDark ? "#AAB7B2" : "#687771",
        primary: "#159A70",
        empty: isDark ? "#121715" : "#F8FAF9",
    };

    if (cargando && cultivos.length === 0) {
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
                    Cargando cultivos...
                </Text>
            </View>
        );
    }

    if (cultivos.length === 0) {
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
                    name="sprout-outline"
                    size={32}
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
                        { color: colors.secondary },
                    ]}
                >
                    Sincroniza los catálogos para consultar
                    la información agrícola.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
        >
            {cultivos.map((cultivo) => {
                const activo =
                    seleccionado?.id === cultivo.id;

                return (
                    <TouchableOpacity
                        key={String(cultivo.id)}
                        style={[
                            styles.card,
                            {
                                backgroundColor: activo
                                    ? colors.primary
                                    : colors.card,

                                borderColor: activo
                                    ? colors.primary
                                    : colors.border,
                            },
                        ]}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityState={{
                            selected: activo,
                        }}
                        accessibilityLabel={
                            `Seleccionar cultivo ${cultivo.nombre}`
                        }
                        onPress={() =>
                            onSeleccionar?.(cultivo)
                        }
                    >
                        <View
                            style={[
                                styles.icon,
                                {
                                    backgroundColor: activo
                                        ? "rgba(255,255,255,0.18)"
                                        : isDark
                                            ? "#143C31"
                                            : "#DDF5EB",
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="sprout"
                                size={25}
                                color={
                                    activo
                                        ? "#FFFFFF"
                                        : colors.primary
                                }
                            />
                        </View>

                        <Text
                            numberOfLines={1}
                            style={[
                                styles.name,
                                {
                                    color: activo
                                        ? "#FFFFFF"
                                        : colors.text,
                                },
                            ]}
                        >
                            {cultivo.nombre}
                        </Text>

                        {!!cultivo.nombre_cientifico && (
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.scientificName,
                                    {
                                        color: activo
                                            ? "rgba(255,255,255,0.76)"
                                            : colors.secondary,
                                    },
                                ]}
                            >
                                {cultivo.nombre_cientifico}
                            </Text>
                        )}

                        {activo && (
                            <View style={styles.selected}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={17}
                                    color="#FFFFFF"
                                />

                                <Text
                                    style={
                                        styles.selectedText
                                    }
                                >
                                    Seleccionado
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

export default memo(SelectorCultivo);

const styles = StyleSheet.create({
    list: {
        gap: 11,
        paddingHorizontal: 1,
        paddingBottom: 4,
    },
    card: {
        width: 154,
        minHeight: 145,
        padding: 14,
        borderWidth: 1,
        borderRadius: 18,
    },
    icon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        marginTop: 12,
        fontSize: 15,
        fontWeight: "900",
    },
    scientificName: {
        marginTop: 4,
        fontSize: 10,
        fontStyle: "italic",
    },
    selected: {
        marginTop: 11,
        flexDirection: "row",
        alignItems: "center",
    },
    selectedText: {
        marginLeft: 5,
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "800",
    },
    loading: {
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 9,
        fontSize: 12,
        fontWeight: "600",
    },
    empty: {
        padding: 24,
        borderWidth: 1,
        borderRadius: 18,
        alignItems: "center",
    },
    emptyTitle: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: "900",
    },
    emptyDescription: {
        marginTop: 6,
        maxWidth: 280,
        textAlign: "center",
        fontSize: 12,
        lineHeight: 18,
    },
});