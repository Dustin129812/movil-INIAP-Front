import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Image, StyleSheet, View } from "react-native";

const IMAGENES = [
    require("../../../assets/images/maiz.jpg"),
    require("../../../assets/images/maiz2.jpg"),
    require("../../../assets/images/maiz3.jpg"),
    require("../../../assets/images/maiz4.jpg"),
    require("../../../assets/images/maiz5.jpg"),
    require("../../../assets/images/maiz6.jpg"),
    require("../../../assets/images/maiz7.jpg"),
];

function obtenerIndice(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Math.abs(numero) % IMAGENES.length;
}

function ImagenAgricola({
    id = 0,
    tipo = "cultivo",
    variant = "thumb",
    style,
}) {
    const source = IMAGENES[obtenerIndice(id)];
    const esHero = variant === "hero";
    const esPlant = variant === "plant";

    return (
        <View
            style={[
                styles.base,
                esHero && styles.hero,
                esPlant && styles.plant,
                !esHero && !esPlant && styles.thumb,
                style,
            ]}
        >
            <Image
                source={source}
                resizeMode={esPlant ? "contain" : "cover"}
                style={styles.image}
            />
            <View style={styles.tint} />
            {esPlant ? null : (
                <View style={styles.iconBadge}>
                    <MaterialCommunityIcons
                        name={
                            tipo === "plaga"
                                ? "bug-outline"
                                : tipo === "enfermedad"
                                    ? "virus-outline"
                                    : "sprout-outline"
                        }
                        size={13}
                        color="#FFFFFF"
                    />
                </View>
            )}
        </View>
    );
}

export default memo(ImagenAgricola);

const styles = StyleSheet.create({
    base: {
        backgroundColor: "#DDEDDD",
        overflow: "hidden",
    },
    thumb: {
        borderRadius: 14,
        height: 66,
        width: 66,
    },
    hero: {
        borderBottomLeftRadius: 28,
        borderTopRightRadius: 15,
        height: 146,
        width: 138,
    },
    plant: {
        backgroundColor: "transparent",
        height: 124,
        width: 104,
    },
    image: {
        height: "100%",
        width: "100%",
    },
    tint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(8,127,91,0.08)",
    },
    iconBadge: {
        alignItems: "center",
        backgroundColor: "rgba(8,127,91,0.88)",
        borderRadius: 10,
        bottom: 6,
        height: 21,
        justifyContent: "center",
        position: "absolute",
        right: 6,
        width: 21,
    },
});
