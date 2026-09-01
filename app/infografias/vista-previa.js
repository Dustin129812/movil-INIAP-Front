import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import { useInfografias } from "../../components/infografias/hooks/useInfografias";
import {
    OpcionesDescarga,
    TarjetaInfografia,
} from "../../components/infografias/ui";
import {
    guardarArchivoLocal,
} from "../../services/pdfService";
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

function formatearFecha(fecha) {
    const pad = (valor) => String(valor).padStart(2, "0");
    const dia = pad(fecha.getDate());
    const mes = pad(fecha.getMonth() + 1);
    const anio = fecha.getFullYear();
    const hora = pad(fecha.getHours());
    const minuto = pad(fecha.getMinutes());

    return `${dia}/${mes}/${anio} - ${hora}:${minuto}`;
}

export default function VistaPreviaInfografiaScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const viewShotRef = useRef(null);
    const cargaKeyRef = useRef("");
    const generadoEnRef = useRef(new Date());
    const { isDark } = useTheme();
    const colors = isDark ? COLORES.dark : COLORES.light;

    const cultivoId = normalizarParametro(params.cultivoId);
    const etapaId = normalizarParametro(params.etapaId);
    const {
        cultivoSeleccionado,
        etapaSeleccionada,
        documento,
        infografias,
        titulo,
        cargando,
        generando,
        generandoPdf,
        resultadoGeneracion,
        error,
        generarVistaPrevia,
        generarPdfDocumento,
    } = useInfografias({
        cultivoIdInicial: cultivoId,
        etapaIdInicial: etapaId,
    });

    const [generandoImagen, setGenerandoImagen] = useState(false);

    const fechaGenerada = useMemo(
        () => formatearFecha(generadoEnRef.current),
        []
    );

    useEffect(() => {
        const cargaKey = [
            cultivoId,
            etapaId,
        ].join("|");

        if (cargaKeyRef.current === cargaKey) {
            return;
        }

        cargaKeyRef.current = cargaKey;

        generarVistaPrevia({
            cultivoId,
            etapaId,
        });
    }, [
        cultivoId,
        etapaId,
        generarVistaPrevia,
    ]);

    async function capturarImagen() {
        if (!viewShotRef.current?.capture) {
            throw new Error("No fue posible capturar la infografia.");
        }

        return await viewShotRef.current.capture();
    }

    async function guardarImagen() {
        try {
            setGenerandoImagen(true);

            const uri = await capturarImagen();

            await guardarArchivoLocal({
                uri,
                dialogTitle: "Guardar o compartir infografia AgroDecide",
                mimeType: "image/png",
                uti: "public.png",
            });
        } catch (errorImagen) {
            Alert.alert(
                "No se pudo guardar la imagen",
                errorImagen?.message ||
                    "Ocurrio un problema al generar la imagen."
            );
        } finally {
            setGenerandoImagen(false);
        }
    }

    async function obtenerPdfActual() {
        if (resultadoGeneracion?.uri) {
            return resultadoGeneracion;
        }

        return await generarPdfDocumento(documento);
    }

    async function guardarPdf() {
        try {
            const resultado = await obtenerPdfActual();

            if (!resultado?.uri) {
                throw new Error("El archivo PDF no fue generado.");
            }

            await guardarArchivoLocal({
                uri: resultado.uri,
                dialogTitle: "Guardar o compartir PDF AgroDecide",
                mimeType: "application/pdf",
                uti: "com.adobe.pdf",
            });
        } catch (errorPdf) {
            Alert.alert(
                "No se pudo guardar el PDF",
                errorPdf?.message ||
                    "Ocurrio un problema al guardar el PDF."
            );
        }
    }

    const total = infografias.length ? 1 : 0;

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.safeArea, { backgroundColor: colors.background }]}
        >
            {cargando || generando ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text
                        style={[
                            styles.loadingText,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Preparando vista previa...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <View
                        style={[
                            styles.errorBox,
                            {
                                backgroundColor: colors.errorBackground,
                                borderColor: colors.error,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={34}
                            color={colors.error}
                        />
                        <Text
                            style={[
                                styles.errorTitle,
                                { color: colors.error },
                            ]}
                        >
                            {error}
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.86}
                            onPress={() => router.back()}
                            style={[
                                styles.errorButton,
                                { backgroundColor: colors.primary },
                            ]}
                        >
                            <Text style={styles.errorButtonText}>
                                Volver
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    <View
                        style={[
                            styles.previewHeader,
                            { backgroundColor: colors.primaryDark },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.76}
                            style={styles.backButton}
                        >
                            <MaterialCommunityIcons
                                name="chevron-left"
                                size={25}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        <View style={styles.previewTitleBlock}>
                            <Text
                                style={styles.previewTitle}
                                numberOfLines={1}
                            >
                                Vista previa de la infografia
                            </Text>
                            <Text
                                style={styles.previewSubtitle}
                                numberOfLines={1}
                            >
                                {cultivoSeleccionado?.nombre || "Cultivo"} ·{" "}
                                {etapaSeleccionada?.nombre || "Etapa"}
                            </Text>
                            <Text style={styles.previewDate}>
                                Generado: {fechaGenerada}
                            </Text>
                        </View>
                    </View>

                    <ViewShot
                        ref={viewShotRef}
                        options={{
                            format: "png",
                            quality: 1,
                            result: "tmpfile",
                        }}
                        style={styles.captureArea}
                    >
                        <TarjetaInfografia
                            documento={documento}
                            indice={0}
                            total={total || 1}
                        />
                    </ViewShot>

                    <View style={styles.previewFooterRow}>
                        <TouchableOpacity
                            activeOpacity={0.86}
                            onPress={() => router.back()}
                            style={[
                                styles.editButton,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="pencil-outline"
                                size={17}
                                color={colors.text}
                            />
                            <Text
                                style={[
                                    styles.editButtonText,
                                    { color: colors.text },
                                ]}
                            >
                                Editar opciones
                            </Text>
                        </TouchableOpacity>

                        <View
                            style={[
                                styles.pageIndicator,
                                { backgroundColor: colors.primarySoft },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.pageIndicatorText,
                                    { color: colors.primary },
                                ]}
                            >
                                1 / {total || 1}
                            </Text>
                        </View>
                    </View>

                    {resultadoGeneracion?.uri ? (
                        <View
                            style={[
                                styles.pdfCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.pdfIcon,
                                    {
                                        backgroundColor:
                                            colors.primarySoft,
                                    },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="file-pdf-box"
                                    size={27}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={styles.pdfText}>
                                <Text
                                    style={[
                                        styles.pdfTitle,
                                        { color: colors.text },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {titulo || "Infografia del cultivo"}
                                </Text>
                                <Text
                                    style={[
                                        styles.pdfSub,
                                        { color: colors.secondaryText },
                                    ]}
                                    numberOfLines={1}
                                >
                                    PDF listo para guardar
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    <OpcionesDescarga
                        colors={colors}
                        disabled={!documento?.secciones?.length}
                        generandoImagen={generandoImagen}
                        generandoPdf={generandoPdf}
                        onGuardarImagen={guardarImagen}
                        onGuardarPdf={guardarPdf}
                    />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    center: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: 24,
    },
    loadingText: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 10,
    },
    errorBox: {
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        padding: 22,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: "900",
        lineHeight: 20,
        marginTop: 10,
        textAlign: "center",
    },
    errorButton: {
        borderRadius: 8,
        marginTop: 14,
        paddingHorizontal: 18,
        paddingVertical: 11,
    },
    errorButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "900",
    },
    content: {
        alignItems: "center",
        padding: 12,
        paddingBottom: 112,
    },
    previewHeader: {
        alignItems: "center",
        alignSelf: "stretch",
        borderRadius: 0,
        flexDirection: "row",
        marginHorizontal: -12,
        marginTop: -12,
        minHeight: 76,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    backButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        marginRight: 8,
        width: 44,
    },
    previewTitleBlock: {
        flex: 1,
    },
    previewTitle: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
    },
    previewSubtitle: {
        color: "rgba(255,255,255,0.82)",
        fontSize: 11,
        fontWeight: "800",
        marginTop: 3,
    },
    previewDate: {
        color: "rgba(255,255,255,0.74)",
        fontSize: 10,
        fontWeight: "700",
        marginTop: 3,
    },
    captureArea: {
        alignItems: "center",
        backgroundColor: "transparent",
        marginTop: 12,
    },
    previewFooterRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        marginVertical: 12,
        width: "100%",
    },
    editButton: {
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        flex: 1,
        flexDirection: "row",
        gap: 7,
        justifyContent: "center",
        minHeight: 44,
        paddingHorizontal: 12,
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: "900",
    },
    pageIndicator: {
        alignItems: "center",
        borderRadius: 999,
        height: 36,
        justifyContent: "center",
        minWidth: 68,
        paddingHorizontal: 12,
    },
    pageIndicatorText: {
        fontSize: 12,
        fontWeight: "900",
    },
    pdfCard: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        marginBottom: 12,
        padding: 12,
        width: "100%",
    },
    pdfIcon: {
        alignItems: "center",
        borderRadius: 10,
        height: 46,
        justifyContent: "center",
        marginRight: 12,
        width: 46,
    },
    pdfText: {
        flex: 1,
        minWidth: 0,
    },
    pdfTitle: {
        fontSize: 13,
        fontWeight: "900",
    },
    pdfSub: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 4,
    },
});
