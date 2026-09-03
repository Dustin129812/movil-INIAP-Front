import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import TarjetaInfografia from "./TarjetaInfografia";

function VistaPreviaInfografia({
    infografia,
    indice = 0,
    total = 0,
    colors,
    onAnterior,
    onSiguiente,
}) {
    if (!infografia) {
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
                    name="image-off-outline"
                    size={36}
                    color={colors.primary}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    Sin vista previa
                </Text>
            </View>
        );
    }

    const puedeAnterior = indice > 0;
    const puedeSiguiente = indice < total - 1;

    return (
        <View style={styles.container}>
            <TarjetaInfografia
                seccion={infografia}
                tipo={infografia.tipo}
                cultivo={infografia.cultivo}
                elemento={infografia.elemento}
                recomendaciones={infografia.recomendaciones}
                indice={indice}
                total={total}
            />

            <View style={styles.controls}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!puedeAnterior}
                    onPress={onAnterior}
                    style={[
                        styles.navButton,
                        {
                            backgroundColor: puedeAnterior
                                ? colors.primary
                                : colors.disabled,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="chevron-left"
                        size={24}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>

                <View
                    style={[
                        styles.counterPill,
                        { backgroundColor: colors.card },
                    ]}
                >
                    <Text
                        style={[
                            styles.counterText,
                            { color: colors.text },
                        ]}
                    >
                        {indice + 1}/{total}
                    </Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!puedeSiguiente}
                    onPress={onSiguiente}
                    style={[
                        styles.navButton,
                        {
                            backgroundColor: puedeSiguiente
                                ? colors.primary
                                : colors.disabled,
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default memo(VistaPreviaInfografia);

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: 16,
    },
    controls: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        justifyContent: "center",
    },
    navButton: {
        alignItems: "center",
        borderRadius: 16,
        height: 48,
        justifyContent: "center",
        width: 48,
    },
    counterPill: {
        alignItems: "center",
        borderRadius: 999,
        minHeight: 40,
        justifyContent: "center",
        paddingHorizontal: 18,
    },
    counterText: {
        fontSize: 13,
        fontWeight: "900",
    },
    empty: {
        alignItems: "center",
        borderRadius: 18,
        borderWidth: 1,
        padding: 28,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: "900",
        marginTop: 9,
    },
});
