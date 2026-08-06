import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { COLORS } from "../../components/calculadora/colors";
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
          colors={[COLORS.primary, COLORS.primaryDark]}
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
        deshabilitado && styles.actionDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={deshabilitado}
    >
      <MaterialCommunityIcons name={icono} size={19} color={COLORS.primaryDark} />
      <Text style={styles.actionSecondaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CalculadoraScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
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
            />

            <ListaFertilizantes
              sacosPorHectarea={sacosPorHectarea}
              cambiarSacosPorHectarea={cambiarSacosPorHectarea}
              limpiarCantidades={limpiarCantidades}
            />

            <View style={styles.actionsCard}>
              <BotonAccion
                label="Calcular"
                icono="calculator-variant-outline"
                onPress={ejecutarCalculo}
                tipo="primario"
              />
              <BotonAccion
                label="Limpiar"
                icono="broom"
                onPress={confirmarLimpieza}
              />
              <BotonAccion
                label="Restaurar ejemplo del Excel"
                icono="restore"
                onPress={restaurarEjemplo}
              />
              <BotonAccion
                label={mostrarDetalle ? "Ocultar detalle" : "Ver detalle"}
                icono={mostrarDetalle ? "eye-off-outline" : "eye-outline"}
                onPress={() => setMostrarDetalle((prev) => !prev)}
                deshabilitado={!resultadoCalculo}
              />
            </View>

            {!!mensajeError && (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={COLORS.danger}
                />
                <Text style={styles.errorText}>{mensajeError}</Text>
              </View>
            )}

            <ResultadosCalculo resultadoCalculo={resultadoCalculo} />

            {resultadoCalculo && mostrarDetalle && (
              <DetalleCalculo
                detalles={resultadoCalculo.detallePorFertilizante}
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
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
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
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.primarySoft,
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
    color: COLORS.primaryDark,
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
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f3b2a9",
  },
  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
  },
});
