import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../services/theme";
import { COLORS_CALC, getCalcColors } from "../../components/calculadora/colors";
import { useCalculadora } from "../../components/calculadora/hooks/useCalculadora";
import {
  DetalleCalculo,
  DimensionesParcela,
  ListaFertilizantes,
  NivelNutrientes,
  ResultadosCalculo,
} from "../../components/calculadora/ui";

function BotonAccion({
  label,
  icono,
  onPress,
  tipo = "secundario",
  deshabilitado = false,
  colors,
}) {
  const esPrimario = tipo === "primario";

  if (esPrimario) {
    return (
      <TouchableOpacity
        style={styles.actionButtonWrap}
        onPress={onPress}
        activeOpacity={0.86}
        disabled={deshabilitado}
      >
        <LinearGradient
          colors={[colors.dimGradientStart, colors.dimGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.actionButton, deshabilitado && styles.actionDisabled]}
        >
          <MaterialCommunityIcons name={icono} size={20} color="#fff" />
          <Text style={styles.actionPrimaryText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        styles.actionButtonSecondary,
        { backgroundColor: colors.macroTint },
        deshabilitado && styles.actionDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={deshabilitado}
    >
      <MaterialCommunityIcons name={icono} size={19} color={colors.macroBorder} />
      <Text style={[styles.actionSecondaryText, { color: colors.macroBorder }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CalculadoraScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const { isDark } = useTheme();
  const colors = getCalcColors(isDark);

  const calculadora = useCalculadora();
  const {
    largoMetros,
    setLargoMetros,
    anchoMetros,
    setAnchoMetros,
    distanciaEntreSurcos,
    setDistanciaEntreSurcos,
    distanciaEntrePlantas,
    setDistanciaEntrePlantas,
    sacosPorHectarea,
    cambiarSacosPorHectarea,
    nivelRecomendado,
    cambiarNivelRecomendado,
    areaPreview,
    resultadoCalculo,
    mensajeError,
    hayDatosEscritos,
    calcular,
    limpiarFormulario,
    limpiarCantidades,
    restaurarEjemploExcel,
  } = calculadora;

  const contentMaxWidth = width >= 900 ? 1080 : 760;

  const ejecutarCalculo = () => {
    const respuesta = calcular();

    if (!respuesta.ok) {
      Alert.alert("Revise los datos", respuesta.mensaje);
      return;
    }

    setMostrarDetalle(false);
  };

  const confirmarLimpieza = () => {
    if (!hayDatosEscritos) {
      limpiarFormulario();
      setMostrarDetalle(false);
      return;
    }

    Alert.alert(
      "Limpiar calculadora",
      "Se borrarán dimensiones, cantidades, niveles recomendados y resultados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: () => {
            limpiarFormulario();
            setMostrarDetalle(false);
          },
        },
      ],
    );
  };

  const restaurarEjemplo = () => {
    restaurarEjemploExcel();
    setMostrarDetalle(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.dimGradientEnd }]}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={[colors.dimGradientStart, colors.dimGradientEnd]}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerEyebrow}>INIAP · GESTIÓN AGRÍCOLA</Text>
            <Text style={styles.headerTitle}>Calculadora de Fertilizantes</Text>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.contentShell, { maxWidth: contentMaxWidth }]}>
            <NivelNutrientes
              nivelRecomendado={nivelRecomendado}
              cambiarNivelRecomendado={cambiarNivelRecomendado}
              resultadoCalculo={resultadoCalculo}
              isDark={isDark}
            />

            <DimensionesParcela
              largoMetros={largoMetros}
              setLargoMetros={setLargoMetros}
              anchoMetros={anchoMetros}
              setAnchoMetros={setAnchoMetros}
              distanciaEntreSurcos={distanciaEntreSurcos}
              setDistanciaEntreSurcos={setDistanciaEntreSurcos}
              distanciaEntrePlantas={distanciaEntrePlantas}
              setDistanciaEntrePlantas={setDistanciaEntrePlantas}
              areaPreview={areaPreview}
              isDark={isDark}
            />

            <ListaFertilizantes
              sacosPorHectarea={sacosPorHectarea}
              cambiarSacosPorHectarea={cambiarSacosPorHectarea}
              limpiarCantidades={limpiarCantidades}
              isDark={isDark}
            />

            <View style={[styles.actionsCard, {
              backgroundColor: colors.cardBg,
              borderColor: colors.dividerColor,
            }]}>
              <BotonAccion
                label="Calcular"
                icono="calculator-variant-outline"
                onPress={ejecutarCalculo}
                tipo="primario"
                colors={colors}
              />
              <BotonAccion
                label="Limpiar"
                icono="broom"
                onPress={confirmarLimpieza}
                colors={colors}
              />
              <BotonAccion
                label="Restaurar ejemplo del Excel"
                icono="restore"
                onPress={restaurarEjemplo}
                colors={colors}
              />
              <BotonAccion
                label={mostrarDetalle ? "Ocultar detalle" : "Ver detalle"}
                icono={mostrarDetalle ? "eye-off-outline" : "eye-outline"}
                onPress={() => setMostrarDetalle((prev) => !prev)}
                deshabilitado={!resultadoCalculo}
                colors={colors}
              />
            </View>

            {!!mensajeError && (
              <View style={[styles.errorBox, {
                backgroundColor: colors.dangerSoft,
                borderColor: colors.danger,
              }]}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={[styles.errorText, { color: colors.danger }]}>{mensajeError}</Text>
              </View>
            )}

            <ResultadosCalculo resultadoCalculo={resultadoCalculo} isDark={isDark} />

            {resultadoCalculo && mostrarDetalle && (
              <DetalleCalculo
                detalles={resultadoCalculo.detallePorFertilizante}
                isDark={isDark}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 12 : 36,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 8,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4ade80",
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  contentShell: {
    width: "100%",
    alignSelf: "center",
  },
  actionsCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButtonWrap: {
    width: "100%",
    marginBottom: 10,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonSecondary: {
    width: "100%",
    marginBottom: 10,
  },
  actionPrimaryText: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 0.5,
    fontSize: 14,
    marginLeft: 8,
  },
  actionSecondaryText: {
    fontWeight: "900",
    fontSize: 13,
    marginLeft: 8,
    textAlign: "center",
  },
  actionDisabled: {
    opacity: 0.5,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
  },
});
