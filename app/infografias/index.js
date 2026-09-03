import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";

import { useInfografias } from "../../components/infografias/hooks/useInfografias";
import {
    CultivoSeleccionado,
    ImagenAgricola,
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

const PASOS = [
    "Cultivo",
    "Etapa",
    "Resumen",
    "Vista previa",
];

function PasoProgreso({ pasoActivo, colors }) {
    return (
        <View style={styles.steps}>
            {PASOS.map((paso, indice) => {
                const activo = indice === pasoActivo;
                const completo = indice < pasoActivo;
                const marcado = activo || completo;

                return (
                    <View key={paso} style={styles.stepItem}>
                        <View style={styles.stepLineWrap}>
                            {indice > 0 ? (
                                <View
                                    style={[
                                        styles.stepLine,
                                        {
                                            backgroundColor: completo
                                                ? colors.primary
                                                : colors.border,
                                        },
                                    ]}
                                />
                            ) : null}
                            <View
                                style={[
                                    styles.stepCircle,
                                    {
                                        backgroundColor: marcado
                                            ? colors.primaryDark
                                            : colors.input,
                                        borderColor: marcado
                                            ? colors.primaryDark
                                            : colors.border,
                                    },
                                ]}
                            >
                                {completo ? (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={15}
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text
                                        style={[
                                            styles.stepNumber,
                                            {
                                                color: marcado
                                                    ? "#FFFFFF"
                                                    : colors.secondaryText,
                                            },
                                        ]}
                                    >
                                        {indice + 1}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <Text
                            style={[
                                styles.stepLabel,
                                {
                                    color: marcado
                                        ? colors.primaryDark
                                        : colors.secondaryText,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {paso}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

function EtapasSelector({
    etapas = [],
    etapaSeleccionada = null,
    busqueda,
    cargando,
    colors,
    onCambiarBusqueda,
    onSeleccionar,
}) {
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
                    placeholder="Buscar etapa..."
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

            {cargando ? (
                <View style={styles.loadingInline}>
                    <ActivityIndicator color={colors.primary} />
                    <Text
                        style={[
                            styles.loadingText,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Cargando etapas...
                    </Text>
                </View>
            ) : !etapas.length ? (
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
                        name="timeline-alert-outline"
                        size={31}
                        color={colors.primary}
                    />
                    <Text
                        style={[
                            styles.emptyTitle,
                            { color: colors.text },
                        ]}
                    >
                        Sin etapas sincronizadas
                    </Text>
                    <Text
                        style={[
                            styles.emptyDescription,
                            { color: colors.secondaryText },
                        ]}
                    >
                        El cultivo no tiene etapas locales disponibles.
                    </Text>
                </View>
            ) : (
                <View style={styles.stageList}>
                    {etapas.map((etapa) => {
                        const activo =
                            Number(etapaSeleccionada?.id) ===
                            Number(etapa.id);

                        return (
                            <TouchableOpacity
                                key={String(etapa.id)}
                                activeOpacity={0.86}
                                onPress={() => onSeleccionar?.(etapa)}
                                style={[
                                    styles.stageCard,
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
                                <View
                                    style={[
                                        styles.stageNumber,
                                        {
                                            backgroundColor: activo
                                                ? colors.primary
                                                : colors.input,
                                            borderColor: activo
                                                ? colors.primary
                                                : colors.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.stageNumberText,
                                            {
                                                color: activo
                                                    ? "#FFFFFF"
                                                    : colors.secondaryText,
                                            },
                                        ]}
                                    >
                                        {etapa.orden || "-"}
                                    </Text>
                                </View>

                                <View style={styles.stageInfo}>
                                    <Text
                                        style={[
                                            styles.stageTitle,
                                            { color: colors.text },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {etapa.nombre}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.stageMeta,
                                            {
                                                color: colors.secondaryText,
                                            },
                                        ]}
                                    >
                                        {etapa.duracion_dias_estimada
                                            ? `Duracion estimada: ${etapa.duracion_dias_estimada} dias`
                                            : "Duracion no registrada"}
                                    </Text>
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
                    })}
                </View>
            )}
        </View>
    );
}

function ResumenGeneracion({
    cultivo,
    etapa,
    resumenEtapa,
    colors,
}) {
    const seccionesIncluidas = [
        {
            clave: "informacion",
            titulo: "Informacion de la etapa",
            icono: "information-outline",
            conteo: 1,
        },
        resumenEtapa.enfermedades > 0
            ? {
                  clave: "enfermedades",
                  titulo: "Enfermedades y nivel de riesgo",
                  icono: "leaf-circle-outline",
                  conteo: resumenEtapa.enfermedades,
              }
            : null,
        resumenEtapa.plagas > 0
            ? {
                  clave: "plagas",
                  titulo: "Plagas y nivel de riesgo",
                  icono: "bug-outline",
                  conteo: resumenEtapa.plagas,
              }
            : null,
        resumenEtapa.recomendaciones > 0
            ? {
                  clave: "recomendaciones",
                  titulo: "Recomendaciones",
                  icono: "clipboard-check-outline",
                  conteo: resumenEtapa.recomendaciones,
              }
            : null,
    ].filter(Boolean);

    return (
        <View style={styles.summaryList}>
            <View
                style={[
                    styles.summaryCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View
                    style={[
                        styles.summaryIcon,
                        { backgroundColor: colors.primarySoft },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="sprout"
                        size={21}
                        color={colors.primary}
                    />
                </View>
                <View style={styles.summaryText}>
                    <Text
                        style={[
                            styles.summaryLabel,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Cultivo seleccionado
                    </Text>
                    <Text
                        style={[
                            styles.summaryTitle,
                            { color: colors.text },
                        ]}
                        numberOfLines={1}
                    >
                        {cultivo?.nombre || "Sin cultivo"}
                    </Text>
                    {!!cultivo?.nombre_cientifico && (
                        <Text
                            style={[
                                styles.summarySub,
                                { color: colors.secondaryText },
                            ]}
                            numberOfLines={1}
                        >
                            {cultivo.nombre_cientifico}
                        </Text>
                    )}
                </View>
                <ImagenAgricola
                    id={cultivo?.id}
                    tipo="cultivo"
                    variant="thumb"
                    style={styles.summaryImage}
                />
            </View>

            <View
                style={[
                    styles.summaryCard,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View
                    style={[
                        styles.summaryIcon,
                        { backgroundColor: colors.primarySoft },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="calendar-range"
                        size={21}
                        color={colors.primary}
                    />
                </View>
                <View style={styles.summaryText}>
                    <Text
                        style={[
                            styles.summaryLabel,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Etapa seleccionada
                    </Text>
                    <Text
                        style={[
                            styles.summaryTitle,
                            { color: colors.text },
                        ]}
                    >
                        {etapa?.nombre || "Sin etapa"}
                    </Text>
                    <Text
                        style={[
                            styles.summarySub,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Etapa {etapa?.orden || "-"} de ciclo
                        {etapa?.duracion_dias_estimada
                            ? ` · ${etapa.duracion_dias_estimada} dias`
                            : ""}
                    </Text>
                </View>
            </View>

            <View
                style={[
                    styles.summaryCard,
                    styles.summaryCardColumn,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.summaryHeader}>
                    <View
                        style={[
                            styles.summaryIcon,
                            { backgroundColor: colors.primarySoft },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="format-list-checks"
                            size={21}
                            color={colors.primary}
                        />
                    </View>
                    <View style={styles.summaryText}>
                        <Text
                            style={[
                                styles.summaryLabel,
                                { color: colors.secondaryText },
                            ]}
                        >
                            Informacion automatica
                        </Text>
                        <Text
                            style={[
                                styles.summaryTitle,
                                { color: colors.text },
                            ]}
                        >
                            Infografia completa
                        </Text>
                    </View>
                </View>

                <View style={styles.summaryChecks}>
                    {seccionesIncluidas.map((seccion) => (
                        <View
                            key={seccion.clave}
                            style={styles.checkRow}
                        >
                            <MaterialCommunityIcons
                                name={seccion.icono}
                                size={16}
                                color={colors.primary}
                            />
                            <Text
                                style={[
                                    styles.checkText,
                                    { color: colors.text },
                                ]}
                            >
                                {seccion.titulo}
                            </Text>
                            <View
                                style={[
                                    styles.autoBadge,
                                    {
                                        backgroundColor:
                                            colors.primarySoft,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.autoBadgeText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    {seccion.conteo}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View
                    style={[
                        styles.countRow,
                        { borderColor: colors.border },
                    ]}
                >
                    <Text
                        style={[
                            styles.countMeta,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Enfermedades: {resumenEtapa.enfermedades || 0}
                    </Text>
                    <Text
                        style={[
                            styles.countMeta,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Plagas: {resumenEtapa.plagas || 0}
                    </Text>
                    <Text
                        style={[
                            styles.countMeta,
                            { color: colors.secondaryText },
                        ]}
                    >
                        Recomendaciones:{" "}
                        {resumenEtapa.recomendaciones || 0}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default function InfografiasScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const colors = isDark ? COLORES.dark : COLORES.light;
    const [paso, setPaso] = useState(0);
    const [generandoImagen, setGenerandoImagen] = useState(false);
    const viewShotRef = useRef(null);

    const {
        cultivosFiltrados,
        etapasFiltradas,
        cultivoSeleccionado,
        etapaSeleccionada,
        busquedaCultivo,
        busquedaEtapa,
        documento,
        resumenEtapa,
        cargando,
        cargandoEtapas,
        generando,
        generandoPdf,
        resultadoGeneracion,
        error,
        setBusquedaCultivo,
        setBusquedaEtapa,
        setError,
        seleccionarCultivo,
        seleccionarEtapa,
        generarVistaPrevia,
        generarPdfDocumento,
    } = useInfografias();

    const tituloPaso = useMemo(() => {
        if (paso === 0) {
            return "Selecciona el cultivo";
        }

        if (paso === 1) {
            return "Selecciona la etapa fenologica";
        }

        return "Resumen de generacion";
    }, [paso]);

    const descripcionPaso = useMemo(() => {
        if (paso === 0) {
            return "Elige el cultivo para generar la infografia.";
        }

        if (paso === 1) {
            return "Elige la etapa del ciclo del cultivo.";
        }

        return "La infografia se generara con toda la informacion disponible para esta etapa.";
    }, [paso]);

    const puedeContinuar =
        (paso === 0 && !!cultivoSeleccionado?.id) ||
        (paso === 1 && !!etapaSeleccionada?.id) ||
        paso === 2;
    const tieneVistaPrevia = !!documento?.secciones?.length;
    const totalVistaPrevia = tieneVistaPrevia ? 1 : 0;
    const pasoVisual = paso === 2 && (generando || tieneVistaPrevia) ? 3 : paso;

    function volver() {
        if (paso > 0) {
            setPaso((actual) => Math.max(actual - 1, 0));
            setError("");

            return;
        }

        router.back();
    }

    async function continuar() {
        if (paso === 0) {
            if (!cultivoSeleccionado?.id) {
                setError("Selecciona un cultivo para continuar.");

                return;
            }

            setError("");
            setPaso(1);

            return;
        }

        if (paso === 1) {
            if (!etapaSeleccionada?.id) {
                setError(
                    "Selecciona una etapa fenologica para continuar."
                );

                return;
            }

            setError("");
            setPaso(2);

            return;
        }

        await generarVistaPrevia();
    }

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

    return (
        <SafeAreaView
            edges={["top"]}
            style={[styles.safeArea, { backgroundColor: colors.background }]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.content}
            >
                <View
                    style={[
                        styles.topRow,
                        { backgroundColor: colors.primaryDark },
                    ]}
                >
                    <TouchableOpacity
                        onPress={volver}
                        activeOpacity={0.76}
                        style={styles.topButton}
                    >
                        <MaterialCommunityIcons
                            name="chevron-left"
                            size={25}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>
                        Generador de infografias
                    </Text>
                    <View style={styles.helpButton}>
                        <MaterialCommunityIcons
                            name="help"
                            size={17}
                            color="#FFFFFF"
                        />
                    </View>
                </View>

                <PasoProgreso pasoActivo={pasoVisual} colors={colors} />

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
                            size={21}
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

                <View style={styles.titleBlock}>
                    <Text
                        style={[styles.sectionTitle, { color: colors.text }]}
                    >
                        {tituloPaso}
                    </Text>
                    <Text
                        style={[
                            styles.sectionSubtitle,
                            { color: colors.secondaryText },
                        ]}
                    >
                        {descripcionPaso}
                    </Text>
                </View>

                {paso === 0 ? (
                    <CultivoSeleccionado
                        cultivos={cultivosFiltrados}
                        seleccionado={cultivoSeleccionado}
                        cargando={cargando}
                        busqueda={busquedaCultivo}
                        colors={colors}
                        onCambiarBusqueda={setBusquedaCultivo}
                        onSeleccionar={seleccionarCultivo}
                    />
                ) : null}

                {paso === 1 ? (
                    <EtapasSelector
                        etapas={etapasFiltradas}
                        etapaSeleccionada={etapaSeleccionada}
                        busqueda={busquedaEtapa}
                        cargando={cargandoEtapas}
                        colors={colors}
                        onCambiarBusqueda={setBusquedaEtapa}
                        onSeleccionar={seleccionarEtapa}
                    />
                ) : null}

                {paso === 2 ? (
                    <View>
                        <ResumenGeneracion
                            cultivo={cultivoSeleccionado}
                            etapa={etapaSeleccionada}
                            resumenEtapa={resumenEtapa}
                            colors={colors}
                        />
                    </View>
                ) : null}

                <View style={styles.footerActions}>
                    {paso > 0 ? (
                        <TouchableOpacity
                            activeOpacity={0.86}
                            onPress={volver}
                            style={[
                                styles.secondaryButton,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.secondaryButtonText,
                                    { color: colors.text },
                                ]}
                            >
                                Atras
                            </Text>
                        </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                        activeOpacity={0.88}
                        disabled={!puedeContinuar || generando}
                        onPress={continuar}
                        style={[
                            styles.primaryButton,
                            {
                                backgroundColor:
                                    puedeContinuar && !generando
                                        ? colors.primary
                                        : colors.disabled,
                            },
                        ]}
                    >
                        {generando ? (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                {paso === 2
                                    ? tieneVistaPrevia
                                        ? "Actualizar vista previa"
                                        : "Vista previa"
                                    : "Continuar"}
                            </Text>
                        )}
                        {!generando ? (
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color="#FFFFFF"
                            />
                        ) : null}
                    </TouchableOpacity>
                </View>

                {paso === 2 && tieneVistaPrevia ? (
                    <View style={styles.previewSection}>
                        <View style={styles.inlinePreviewHeader}>
                            <View
                                style={[
                                    styles.inlinePreviewIcon,
                                    { backgroundColor: colors.primarySoft },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="eye-outline"
                                    size={21}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={styles.inlinePreviewText}>
                                <Text
                                    style={[
                                        styles.inlinePreviewTitle,
                                        { color: colors.text },
                                    ]}
                                >
                                    Vista previa
                                </Text>
                                <Text
                                    style={[
                                        styles.inlinePreviewSubtitle,
                                        { color: colors.secondaryText },
                                    ]}
                                >
                                    Revisa la infografia antes de descargar imagen o PDF.
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
                                total={totalVistaPrevia || 1}
                            />
                        </ViewShot>

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
                                        {documento?.titulo ||
                                            "Infografia del cultivo"}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.pdfSub,
                                            {
                                                color:
                                                    colors.secondaryText,
                                            },
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
                            disabled={!tieneVistaPrevia}
                            generandoImagen={generandoImagen}
                            generandoPdf={generandoPdf}
                            onGuardarImagen={guardarImagen}
                            onGuardarPdf={guardarPdf}
                        />
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        padding: 12,
        paddingBottom: 112,
    },
    topRow: {
        alignItems: "center",
        borderRadius: 0,
        flexDirection: "row",
        marginHorizontal: -12,
        marginTop: -12,
        minHeight: 76,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    topButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    helpButton: {
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.28)",
        borderRadius: 999,
        height: 26,
        justifyContent: "center",
        width: 26,
    },
    screenTitle: {
        color: "#FFFFFF",
        flex: 1,
        fontSize: 15,
        fontWeight: "900",
        textAlign: "center",
    },
    steps: {
        flexDirection: "row",
        marginBottom: 21,
        marginTop: 18,
    },
    stepItem: {
        alignItems: "center",
        flex: 1,
    },
    stepLineWrap: {
        alignItems: "center",
        height: 31,
        justifyContent: "center",
        width: "100%",
    },
    stepLine: {
        height: 2,
        left: "-50%",
        position: "absolute",
        right: "50%",
        top: 15,
    },
    stepCircle: {
        alignItems: "center",
        borderRadius: 999,
        borderWidth: 1,
        height: 31,
        justifyContent: "center",
        width: 31,
    },
    stepNumber: {
        fontSize: 12,
        fontWeight: "900",
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: "800",
        marginTop: 4,
        maxWidth: 72,
        textAlign: "center",
    },
    titleBlock: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "900",
    },
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 18,
        marginTop: 5,
    },
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
    loadingInline: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: 132,
    },
    loadingText: {
        fontSize: 12,
        fontWeight: "800",
        marginTop: 8,
    },
    stageList: {
        gap: 10,
        marginTop: 10,
    },
    stageCard: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        minHeight: 78,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    stageNumber: {
        alignItems: "center",
        borderRadius: 999,
        borderWidth: 1,
        height: 36,
        justifyContent: "center",
        marginRight: 12,
        width: 36,
    },
    stageNumberText: {
        fontSize: 13,
        fontWeight: "900",
    },
    stageInfo: {
        flex: 1,
        minWidth: 0,
    },
    stageTitle: {
        fontSize: 13,
        fontWeight: "900",
        lineHeight: 18,
    },
    stageMeta: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 4,
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
    summaryList: {
        gap: 10,
    },
    summaryCard: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        minHeight: 88,
        padding: 12,
    },
    summaryCardColumn: {
        alignItems: "stretch",
        flexDirection: "column",
    },
    summaryHeader: {
        alignItems: "center",
        flexDirection: "row",
    },
    summaryIcon: {
        alignItems: "center",
        borderRadius: 10,
        height: 42,
        justifyContent: "center",
        marginRight: 12,
        width: 42,
    },
    summaryText: {
        flex: 1,
        minWidth: 0,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: "800",
    },
    summaryTitle: {
        fontSize: 15,
        fontWeight: "900",
        lineHeight: 20,
        marginTop: 5,
    },
    summarySub: {
        fontSize: 11,
        fontStyle: "italic",
        fontWeight: "700",
        marginTop: 2,
    },
    summaryImage: {
        borderRadius: 9,
        height: 58,
        width: 58,
    },
    summaryChecks: {
        gap: 6,
        marginTop: 12,
    },
    checkRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 7,
    },
    checkText: {
        flex: 1,
        fontSize: 11,
        fontWeight: "800",
        lineHeight: 15,
    },
    autoBadge: {
        alignItems: "center",
        borderRadius: 999,
        height: 24,
        justifyContent: "center",
        minWidth: 24,
        paddingHorizontal: 7,
    },
    autoBadgeText: {
        fontSize: 10,
        fontWeight: "900",
    },
    countRow: {
        borderTopWidth: 1,
        gap: 5,
        marginTop: 12,
        paddingTop: 10,
    },
    countMeta: {
        fontSize: 10,
        fontWeight: "800",
    },
    optionsBox: {
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 12,
        padding: 12,
    },
    errorContainer: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        marginBottom: 12,
        padding: 11,
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 18,
        marginLeft: 8,
    },
    footerActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
    previewSection: {
        marginTop: 18,
    },
    inlinePreviewHeader: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 12,
    },
    inlinePreviewIcon: {
        alignItems: "center",
        borderRadius: 10,
        height: 42,
        justifyContent: "center",
        marginRight: 12,
        width: 42,
    },
    inlinePreviewText: {
        flex: 1,
        minWidth: 0,
    },
    inlinePreviewTitle: {
        fontSize: 16,
        fontWeight: "900",
    },
    inlinePreviewSubtitle: {
        fontSize: 11,
        fontWeight: "700",
        lineHeight: 16,
        marginTop: 4,
    },
    captureArea: {
        alignItems: "center",
        backgroundColor: "transparent",
    },
    pdfCard: {
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        marginBottom: 12,
        marginTop: 12,
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
    secondaryButton: {
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: "center",
        minHeight: 52,
        paddingHorizontal: 18,
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: "900",
    },
    primaryButton: {
        alignItems: "center",
        borderRadius: 8,
        flex: 1,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        minHeight: 52,
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "900",
    },
});
