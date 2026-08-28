import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
    Image,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import ImagenAgricola from "./ImagenAgricola";

const INIAP_LOGO = require("../../../assets/images/INIAP.png");

const SECCION_META = {
    informacion: {
        icon: "information-outline",
        color: "#2BA56A",
        bg: "#EDF7E9",
    },
    enfermedades: {
        icon: "leaf-circle-outline",
        color: "#E95050",
        bg: "#FFF0EF",
    },
    plagas: {
        icon: "bug-outline",
        color: "#F18A22",
        bg: "#FFF4E7",
    },
    recomendaciones: {
        icon: "clipboard-check-outline",
        color: "#2379C9",
        bg: "#EAF3FF",
    },
};

const RIESGO_META = {
    alto: {
        bg: "#FFE4E2",
        color: "#C73631",
    },
    medio: {
        bg: "#FFF1CE",
        color: "#B76A00",
    },
    bajo: {
        bg: "#DEF3E2",
        color: "#237641",
    },
};

function tieneTexto(valor) {
    return String(valor || "").trim().length > 0;
}

function texto(valor) {
    return String(valor || "").trim();
}

function obtenerMetaSeccion(clave) {
    return (
        SECCION_META[clave] || {
            icon: "file-document-outline",
            color: "#2BA56A",
            bg: "#EEF3EA",
        }
    );
}

function obtenerMetaRiesgo(riesgo) {
    const clave = texto(riesgo).toLowerCase();

    return RIESGO_META[clave] || {
        bg: "#EEF3EA",
        color: "#365246",
    };
}

function Campo({ campo }) {
    if (!tieneTexto(campo?.etiqueta) || !tieneTexto(campo?.valor)) {
        return null;
    }

    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>
                {String(campo.etiqueta).toUpperCase()}
            </Text>
            <Text style={styles.fieldText}>{campo.valor}</Text>
        </View>
    );
}

function Indicadores({ indicadores = [] }) {
    if (!indicadores.length) {
        return null;
    }

    return (
        <View style={styles.indicators}>
            <Text style={styles.indicatorsTitle}>INDICADORES CLAVE</Text>
            {indicadores.map((indicador, index) => (
                <View
                    key={`${indicador}-${index}`}
                    style={styles.indicatorRow}
                >
                    <MaterialCommunityIcons
                        name="check"
                        size={13}
                        color="#2BA56A"
                    />
                    <Text style={styles.indicatorText}>
                        {indicador}
                    </Text>
                </View>
            ))}
        </View>
    );
}

function RiesgoBadge({ riesgo }) {
    if (!tieneTexto(riesgo)) {
        return null;
    }

    const meta = obtenerMetaRiesgo(riesgo);

    return (
        <View
            style={[
                styles.riskBadge,
                { backgroundColor: meta.bg },
            ]}
        >
            <Text style={[styles.riskText, { color: meta.color }]}>
                {String(riesgo).toUpperCase()}
            </Text>
        </View>
    );
}

function ItemSanitario({ item }) {
    const campos = Array.isArray(item.campos)
        ? item.campos.filter((campo) => campo.id !== "riesgo")
        : [];

    return (
        <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
                <View style={styles.itemTitleBlock}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.titulo}
                    </Text>
                    {!!item.subtitulo && (
                        <Text
                            style={styles.itemSub}
                            numberOfLines={1}
                        >
                            {item.subtitulo}
                        </Text>
                    )}
                </View>
                <RiesgoBadge riesgo={item.nivel_riesgo} />
            </View>
            {campos.length ? (
                campos.map((campo) => (
                    <Campo key={String(campo.id)} campo={campo} />
                ))
            ) : (
                <Text style={styles.emptyText}>
                    Sin detalle registrado para este item.
                </Text>
            )}
        </View>
    );
}

function ItemRecomendacion({ item }) {
    return (
        <View style={[styles.itemCard, styles.recommendationCard]}>
            {!!item.tipo && (
                <Text style={styles.recommendationType}>
                    {String(item.tipo).toUpperCase()}
                </Text>
            )}
            <Text style={styles.itemTitle}>{item.titulo}</Text>
            {!!item.descripcion && (
                <Text style={styles.recommendationText}>
                    {item.descripcion}
                </Text>
            )}
            {!!item.instrucciones && (
                <Text style={styles.recommendationText}>
                    {item.instrucciones}
                </Text>
            )}
        </View>
    );
}

function ItemInformacion({ item }) {
    const campos = Array.isArray(item.campos) ? item.campos : [];

    return (
        <View style={styles.infoBlock}>
            {campos.map((campo) => (
                <Campo key={String(campo.id)} campo={campo} />
            ))}
            <Indicadores indicadores={item.indicadores || []} />
        </View>
    );
}

function ItemGenerico({ item, clave }) {
    if (clave === "informacion") {
        return <ItemInformacion item={item} />;
    }

    if (clave === "recomendaciones") {
        return <ItemRecomendacion item={item} />;
    }

    return <ItemSanitario item={item} />;
}

function SeccionInfografia({ seccion }) {
    const meta = obtenerMetaSeccion(seccion.clave);
    const items = Array.isArray(seccion.items) ? seccion.items : [];

    return (
        <View style={[styles.section, { backgroundColor: meta.bg }]}>
            <View style={styles.sectionHeader}>
                <View
                    style={[
                        styles.sectionIcon,
                        { backgroundColor: "#FFFFFF" },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={meta.icon}
                        size={18}
                        color={meta.color}
                    />
                </View>
                <Text
                    style={[styles.sectionTitle, { color: meta.color }]}
                    numberOfLines={2}
                >
                    {seccion.titulo}
                </Text>
                <View
                    style={[
                        styles.sectionCount,
                        { backgroundColor: `${meta.color}18` },
                    ]}
                >
                    <Text
                        style={[
                            styles.sectionCountText,
                            { color: meta.color },
                        ]}
                    >
                        {items.length}
                    </Text>
                </View>
            </View>

            {items.length ? (
                items.map((item) => (
                    <ItemGenerico
                        key={String(item.id)}
                        item={item}
                        clave={seccion.clave}
                    />
                ))
            ) : (
                <Text style={styles.emptyText}>
                    {seccion.emptyText ||
                        "No existe informacion registrada para esta seccion."}
                </Text>
            )}
        </View>
    );
}

function TarjetaInfografia({
    documento = null,
    seccion = null,
    cultivo = null,
    indice = 0,
    total = 1,
}) {
    const { width } = useWindowDimensions();
    const documentoActual = documento || {
        cultivo: cultivo || seccion?.cultivo || null,
        etapa: seccion?.etapa || null,
        titulo: seccion?.titulo || "Infografia",
        secciones: seccion ? [seccion] : [],
    };
    const cultivoActual = documentoActual.cultivo || {};
    const etapaActual = documentoActual.etapa || {};
    const secciones = Array.isArray(documentoActual.secciones)
        ? documentoActual.secciones
        : [];
    const cardWidth = Math.min(Math.max(width - 28, 304), 430);

    return (
        <View
            collapsable={false}
            style={[styles.card, { width: cardWidth }]}
        >
            <View style={styles.documentHeader}>
                <View style={styles.cropBlock}>
                    <Text style={styles.brand}>AgroDecide</Text>
                    {!!cultivoActual?.nombre && (
                        <Text style={styles.cropName}>
                            {String(cultivoActual.nombre).toUpperCase()}
                        </Text>
                    )}
                    {!!cultivoActual?.nombre_cientifico && (
                        <Text style={styles.cropScientific}>
                            {cultivoActual.nombre_cientifico}
                        </Text>
                    )}
                </View>
                <ImagenAgricola
                    id={cultivoActual.id}
                    tipo="cultivo"
                    variant="plant"
                    style={styles.cropImage}
                />
            </View>

            <View style={styles.stageHero}>
                <View style={styles.stageText}>
                    <Text style={styles.stageLabel}>
                        ETAPA FENOLOGICA
                    </Text>
                    <Text style={styles.stageTitle}>
                        {etapaActual?.nombre || documentoActual.titulo}
                    </Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaPill}>
                            <Text style={styles.metaText}>
                                Etapa {etapaActual?.orden || "-"}
                            </Text>
                        </View>
                        {etapaActual?.duracion_dias_estimada ? (
                            <View style={styles.metaPill}>
                                <Text style={styles.metaText}>
                                    {etapaActual.duracion_dias_estimada} dias
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View style={styles.pageBadge}>
                    <Text style={styles.pageBadgeText}>
                        {indice + 1}/{total}
                    </Text>
                </View>
            </View>

            {secciones.length ? (
                secciones.map((item) => (
                    <SeccionInfografia
                        key={String(item.id || item.clave)}
                        seccion={item}
                    />
                ))
            ) : (
                <Text style={styles.emptyText}>
                    No existe informacion para la infografia.
                </Text>
            )}

            <View style={styles.footer}>
                <Image
                    source={INIAP_LOGO}
                    resizeMode="contain"
                    style={styles.logo}
                />
                <View style={styles.footerCopy}>
                    <Text style={styles.footerTitle}>INIAP</Text>
                    <Text style={styles.footerText}>
                        Instituto Nacional de Investigaciones Agropecuarias
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default memo(TarjetaInfografia);

const styles = StyleSheet.create({
    card: {
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderColor: "#DDE8E4",
        borderRadius: 6,
        borderWidth: 1,
        padding: 13,
        shadowColor: "#000000",
        shadowOffset: { height: 5, width: 0 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
        elevation: 4,
    },
    documentHeader: {
        flexDirection: "row",
        minHeight: 98,
    },
    cropBlock: {
        flex: 1,
        minWidth: 0,
        paddingRight: 12,
    },
    brand: {
        color: "#0A6B43",
        fontSize: 13,
        fontWeight: "900",
        marginBottom: 8,
    },
    cropName: {
        color: "#0F5D3D",
        fontSize: 24,
        fontWeight: "900",
        lineHeight: 28,
    },
    cropScientific: {
        color: "#40564B",
        fontSize: 10,
        fontStyle: "italic",
        fontWeight: "800",
        marginTop: 3,
    },
    cropImage: {
        alignSelf: "flex-start",
        marginRight: -4,
        marginTop: -2,
    },
    stageHero: {
        alignItems: "flex-start",
        backgroundColor: "#F0F7ED",
        borderRadius: 6,
        flexDirection: "row",
        marginTop: 6,
        padding: 12,
    },
    stageText: {
        flex: 1,
        minWidth: 0,
    },
    stageLabel: {
        color: "#2BA56A",
        fontSize: 9,
        fontWeight: "900",
    },
    stageTitle: {
        color: "#1D3128",
        fontSize: 18,
        fontWeight: "900",
        lineHeight: 22,
        marginTop: 4,
    },
    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 9,
    },
    metaPill: {
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    metaText: {
        color: "#1F6C43",
        fontSize: 9,
        fontWeight: "900",
    },
    pageBadge: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        height: 28,
        justifyContent: "center",
        minWidth: 44,
        paddingHorizontal: 9,
    },
    pageBadgeText: {
        color: "#2BA56A",
        fontSize: 11,
        fontWeight: "900",
    },
    section: {
        borderRadius: 6,
        marginTop: 10,
        padding: 10,
    },
    sectionHeader: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    sectionIcon: {
        alignItems: "center",
        borderRadius: 8,
        height: 31,
        justifyContent: "center",
        width: 31,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 11,
        fontWeight: "900",
        lineHeight: 15,
        textTransform: "uppercase",
    },
    sectionCount: {
        alignItems: "center",
        borderRadius: 999,
        height: 24,
        justifyContent: "center",
        minWidth: 24,
        paddingHorizontal: 7,
    },
    sectionCountText: {
        fontSize: 10,
        fontWeight: "900",
    },
    infoBlock: {
        backgroundColor: "#FFFFFF",
        borderRadius: 6,
        padding: 9,
    },
    itemCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 6,
        marginTop: 7,
        padding: 9,
    },
    itemHeader: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 8,
    },
    itemTitleBlock: {
        flex: 1,
        minWidth: 0,
    },
    itemTitle: {
        color: "#26342E",
        fontSize: 11,
        fontWeight: "900",
        lineHeight: 15,
    },
    itemSub: {
        color: "#5D6D64",
        fontSize: 9,
        fontStyle: "italic",
        fontWeight: "700",
        marginTop: 2,
    },
    riskBadge: {
        borderRadius: 999,
        paddingHorizontal: 7,
        paddingVertical: 4,
    },
    riskText: {
        fontSize: 8,
        fontWeight: "900",
    },
    field: {
        marginTop: 7,
    },
    fieldLabel: {
        alignSelf: "flex-start",
        backgroundColor: "#73BF44",
        borderRadius: 4,
        color: "#FFFFFF",
        fontSize: 8,
        fontWeight: "900",
        overflow: "hidden",
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    fieldText: {
        color: "#26342E",
        fontSize: 10,
        fontWeight: "700",
        lineHeight: 14,
        marginTop: 5,
    },
    indicators: {
        marginTop: 8,
    },
    indicatorsTitle: {
        color: "#1F6C43",
        fontSize: 9,
        fontWeight: "900",
        marginBottom: 5,
    },
    indicatorRow: {
        alignItems: "flex-start",
        flexDirection: "row",
        gap: 5,
        marginTop: 3,
    },
    indicatorText: {
        color: "#26342E",
        flex: 1,
        fontSize: 10,
        fontWeight: "700",
        lineHeight: 14,
    },
    recommendationCard: {
        borderLeftColor: "#2379C9",
        borderLeftWidth: 3,
    },
    recommendationType: {
        color: "#2379C9",
        fontSize: 8,
        fontWeight: "900",
        marginBottom: 4,
    },
    recommendationText: {
        color: "#4F5F56",
        fontSize: 10,
        fontWeight: "700",
        lineHeight: 14,
        marginTop: 5,
    },
    emptyText: {
        color: "#4F5F56",
        fontSize: 10,
        fontWeight: "700",
        lineHeight: 15,
        marginTop: 6,
    },
    footer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 13,
        minHeight: 42,
    },
    logo: {
        height: 32,
        width: 68,
    },
    footerCopy: {
        flex: 1,
        marginLeft: 6,
    },
    footerTitle: {
        color: "#2BA56A",
        fontSize: 12,
        fontWeight: "900",
    },
    footerText: {
        color: "#7B867F",
        fontSize: 8,
        fontWeight: "700",
    },
});
