import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { COLORS_CALC, getCalcColors } from "../colors";

const formatearNumero = (valor, decimales = 2) => {
  if (!Number.isFinite(valor)) return "0";
  return valor.toLocaleString("es-EC", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: 0,
  });
};

const formatearDinero = (valor) => `$${formatearNumero(valor, 2)}`;

const obtenerColumnas = (ancho) => {
  if (ancho < 520) return 1;
  if (ancho < 920) return 2;
  return 3;
};

function Metrica({ icono, label, value, destacado, colors }) {
  return (
    <View style={[styles.metricBox, destacado && { backgroundColor: colors.goldSoft, borderColor: colors.gold }]}>
      <MaterialCommunityIcons
        name={icono}
        size={20}
        color={destacado ? colors.gold : colors.macroBorder}
      />
      <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Seccion({ titulo, children, color, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{titulo}</Text>
      <View style={styles.metricsGrid}>{children}</View>
    </View>
  );
}

export function ResultadosCalculo({ resultadoCalculo, isDark }) {
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const itemWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;
  const colors = getCalcColors(isDark);

  if (!resultadoCalculo) return null;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[colors.heroGradientStart, colors.heroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCosto}
      >
        <Text style={styles.heroLabel}>Costo total para la parcela</Text>
        <Text style={styles.heroValue}>
          {formatearDinero(resultadoCalculo.totalCostoParcela)}
        </Text>
        <Text style={styles.heroSub}>
          Costo por hectárea:{" "}
          {formatearDinero(resultadoCalculo.totalCostoPorHectarea)}
        </Text>
      </LinearGradient>

      <View style={[styles.card, {
        backgroundColor: colors.cardBg,
        borderColor: colors.dividerColor,
      }]}>
        <Seccion titulo="Resultado por hectárea" color={colors.macroBorder} colors={colors}>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="sack"
              label="Total de sacos por hectárea"
              value={formatearNumero(resultadoCalculo.totalSacosPorHectarea, 2)}
              colors={colors}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="weight-kilogram"
              label="Total de kilogramos por hectárea"
              value={`${formatearNumero(resultadoCalculo.totalKgPorHectarea, 2)} kg`}
              colors={colors}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="cash-multiple"
              label="Costo total por hectárea"
              value={formatearDinero(resultadoCalculo.totalCostoPorHectarea)}
              destacado
              colors={colors}
            />
          </View>
        </Seccion>

        <Seccion titulo="Resultado para la parcela" color={colors.gold} colors={colors}>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="texture-box"
              label="Área en metros cuadrados"
              value={`${formatearNumero(resultadoCalculo.areaM2, 2)} m²`}
              colors={colors}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="map-outline"
              label="Hectáreas"
              value={`${formatearNumero(resultadoCalculo.areaHa, 4)} ha`}
              colors={colors}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="sack-percent"
              label="Total de sacos para la parcela"
              value={formatearNumero(resultadoCalculo.totalSacosParcela, 4)}
              colors={colors}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="weight"
              label="Total de kilogramos para la parcela"
              value={`${formatearNumero(resultadoCalculo.totalKgParcela, 2)} kg`}
              colors={colors}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="currency-usd"
              label="Costo total para la parcela"
              value={formatearDinero(resultadoCalculo.totalCostoParcela)}
              destacado
              colors={colors}
            />
          </View>
        </Seccion>

        <Seccion titulo="Distribución en el terreno" color={colors.macroBorder} colors={colors}>
          {resultadoCalculo.numeroSurcos != null ? <>
            <View style={{ width: itemWidth }}><Metrica icono="drag-vertical-variant" label="Número estimado de surcos" value={formatearNumero(resultadoCalculo.numeroSurcos, 2)} colors={colors} /></View>
            <View style={{ width: itemWidth }}><Metrica icono="sprout-outline" label="Sitios por surco" value={formatearNumero(resultadoCalculo.sitiosPorSurco, 2)} colors={colors} /></View>
            <View style={{ width: itemWidth }}><Metrica icono="beaker-outline" label="Kilogramos de mezcla por surco" value={`${formatearNumero(resultadoCalculo.kgMezclaPorSurco, 2)} kg`} colors={colors} /></View>
          </> : <View style={{ width: itemWidth }}><Metrica icono="sprout-outline" label="Total estimado de sitios de plantación" value={formatearNumero(resultadoCalculo.totalSitiosEstimados, 0)} colors={colors} /></View>}
        </Seccion>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  heroCosto: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },
  heroValue: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 36,
    marginTop: 4,
    textAlign: "center",
  },
  heroSub: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricBox: {
    minHeight: 104,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "700",
    lineHeight: 15,
  },
});
