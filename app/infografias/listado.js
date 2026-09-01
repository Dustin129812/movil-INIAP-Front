import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useInfografias } from "../../components/infografias/hooks/useInfografias";
import {
    FiltrosInfografia,
    ListaContenido,
} from "../../components/infografias/ui";
import { TIPOS_INFOGRAFIA } from "../../services/infografiasService";
import { useTheme } from "../../services/theme/ThemeContext";

const COLORES = {
    light: {
        background: "#F7FAF5",
        card: "#FFFFFF",
        input: "#F3F6F1",
        primary: "#2BA56A",
        primaryDark: "#087F5B",
        primarySoft: "#E4F4E1",
        text: "#26342E",
        secondaryText: "#7B867F",
        border: "#E2E9DF",
        empty: "#F8FAF9",
        disabled: "#AAB7B2",
        errorBackground: "#FFF1F1",
        error: "#D14343",
    },
    dark: {
        background: "#101513",
        card: "#1A211E",
        input: "#222927",
        primary: "#36C995",
        primaryDark: "#087F5B",
        primarySoft: "#143C31",
        text: "#F4F7F5",
        secondaryText: "#AAB5B0",
        border: "#303A36",
        empty: "#121715",
        disabled: "#3A4540",
        errorBackground: "#351C1C",
        error: "#FF7070",
    },
};

function normalizarParametro(valor, respaldo = "") {
    if (Array.isArray(valor)) {
        return valor[0] || respaldo;
    }

    return valor || respaldo;
}

export default function ListadoInfografiasScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { isDark } = useTheme();
    const colors = isDark ? COLORES.dark : COLORES.light;

    const cultivoId = normalizarParametro(params.cultivoId);
    const tipo = normalizarParametro(
        params.tipo,
        TIPOS_INFOGRAFIA.ENFERMEDADES
    );
    const formato = normalizarParametro(params.formato, "infografia");

    const {
        cultivoSeleccionado,
        formatoSalida,
        elementosFiltrados,
        idsSeleccionados,
        totalSeleccionados,
        todosSeleccionados,
        busqueda,
        cargando,
        error,
        setBusqueda,
        setFormatoSalida,
        alternarSeleccion,
        seleccionarTodos,
        limpiarSeleccion,
    } = useInfografias({
        cultivoIdInicial: cultivoId,
        tipoInicial: tipo,
    });

    useEffect(() => {
        setFormatoSalida(formato);
    }, [formato, setFormatoSalida]);

    const esEnfermedades = tipo === TIPOS_INFOGRAFIA.ENFERMEDADES;
    const titulo = esEnfermedades ? "Enfermedades" : "Plagas";

    const header = useMemo(
        () => (
            <View>
                <View
                    style={[
                        styles.topRow,
                        { backgroundColor: colors.primaryDark },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.76}
                        style={[
                            styles.topButton,
                            {
                                backgroundColor: "rgba(255,255,255,0.16)",
                                borderColor: "rgba(255,255,255,0.28)",
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={25}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                    <View style={styles.titleBlock}>
                        <Text
                            style={styles.screenTitle}
                        >
                            {titulo}
                        </Text>
                        <Text
                            style={[
                                styles.screenSubtitle,
                                { color: "rgba(255,255,255,0.82)" },
                            ]}
                            numberOfLines={1}
                        >
                            {cultivoSeleccionado?.nombre ||
                                "Cultivo seleccionado"}
                        </Text>
                    </View>
                </View>

                <FiltrosInfografia
                    busqueda={busqueda}
                    total={elementosFiltrados.length}
                    seleccionados={totalSeleccionados}
                    todosSeleccionados={todosSeleccionados}
                    tipo={tipo}
                    colors={colors}
                    onCambiarBusqueda={setBusqueda}
                    onSeleccionarTodos={seleccionarTodos}
                    onLimpiarSeleccion={limpiarSeleccion}
                />

                {error ? (
                    <View
                        style={[
                            styles.errorContainer,
                            {
                                backgroundColor: colors.errorBackground,
                                borderColor: colors.error,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={20}
                            color={colors.error}
                        />
                        <Text
                            style={[
                                styles.errorText,
                                { color: colors.error },
                            ]}
                        >
                            {error}
                        </Text>
                    </View>
                ) : null}
            </View>
        ),
        [
            busqueda,
            colors,
            cultivoSeleccionado?.nombre,
            elementosFiltrados.length,
            error,
            limpiarSeleccion,
            router,
            seleccionarTodos,
            setBusqueda,
            tipo,
            titulo,
            todosSeleccionados,
            totalSeleccionados,
        ]
    );

    function continuar() {
        if (!totalSeleccionados) {
            return;
        }

        router.push({
            pathname: "/infografias/vista-previa",
            params: {
                cultivoId,
                tipo,
                formato: formatoSalida,
                ids: idsSeleccionados.join(","),
            },
        });
    }

    const footer = (
        <TouchableOpacity
            activeOpacity={0.88}
            disabled={!totalSeleccionados || cargando}
            onPress={continuar}
            style={[
                styles.primaryButton,
                {
                    backgroundColor:
                        totalSeleccionados && !cargando
                            ? colors.primary
                            : colors.disabled,
                },
            ]}
        >
            {cargando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
                <MaterialCommunityIcons
                    name="eye-outline"
                    size={20}
                    color="#FFFFFF"
                />
            )}
            <Text style={styles.primaryButtonText}>
                Vista previa ({totalSeleccionados})
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.safeArea, { backgroundColor: colors.background }]}
        >
            <ListaContenido
                data={elementosFiltrados}
                idsSeleccionados={idsSeleccionados}
                cargando={cargando}
                tipo={tipo}
                colors={colors}
                ListHeaderComponent={header}
                ListFooterComponent={footer}
                onAlternar={alternarSeleccion}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    topRow: {
        alignItems: "center",
        borderRadius: 18,
        flexDirection: "row",
        marginBottom: 12,
        padding: 10,
    },
    topButton: {
        alignItems: "center",
        borderRadius: 13,
        borderWidth: 1,
        height: 42,
        justifyContent: "center",
        marginRight: 10,
        width: 42,
    },
    titleBlock: {
        flex: 1,
    },
    screenTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
    },
    screenSubtitle: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 2,
    },
    errorContainer: {
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        marginTop: 10,
        padding: 11,
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 18,
        marginLeft: 8,
    },
    primaryButton: {
        alignItems: "center",
        borderRadius: 12,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        marginTop: 16,
        minHeight: 50,
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "900",
    },
});
