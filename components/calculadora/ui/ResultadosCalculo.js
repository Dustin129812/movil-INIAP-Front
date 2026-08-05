import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { COLORS } from "../colors";

const formatearNumero = (valor, decimales = 2) => {
  if (!Number.isFinite(valor)) return "0";
  return valor.toLocaleString("es-EC", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales,
  });
};

const formatearDinero = (valor) => `$${formatearNumero(valor, 2)}`;

const obtenerColumnas = (ancho) => {
  if (ancho < 520) return 1;
  if (ancho < 920) return 2;
  return 3;
};

function Metrica({ icono, label, value, destacado }) {
  return (
    <View style={[styles.metricBox, destacado && styles.metricBoxGold]}>
      <MaterialCommunityIcons
        name={icono}
        size={20}
        color={destacado ? COLORS.goldDark : COLORS.primaryDark}
      />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Seccion({ titulo, children, color = COLORS.primaryDark }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{titulo}</Text>
      <View style={styles.metricsGrid}>{children}</View>
    </View>
  );
}

export function ResultadosCalculo({ resultadoCalculo }) {
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const itemWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;

  if (!resultadoCalculo) return null;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[COLORS.gold, COLORS.goldDark]}
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

      <View style={styles.card}>
        <Seccion titulo="Resultado por hectárea">
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="sack"
              label="Total de sacos por hectárea"
              value={formatearNumero(resultadoCalculo.totalSacosPorHectarea, 2)}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="weight-kilogram"
              label="Total de kilogramos por hectárea"
              value={`${formatearNumero(resultadoCalculo.totalKgPorHectarea, 2)} kg`}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="cash-multiple"
              label="Costo total por hectárea"
              value={formatearDinero(resultadoCalculo.totalCostoPorHectarea)}
              destacado
            />
          </View>
        </Seccion>

        <Seccion titulo="Resultado para la parcela" color={COLORS.goldDark}>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="texture-box"
              label="Área en metros cuadrados"
              value={`${formatearNumero(resultadoCalculo.areaM2, 2)} m²`}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="map-outline"
              label="Área en hectáreas"
              value={`${formatearNumero(resultadoCalculo.areaHa, 4)} ha`}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="sack-percent"
              label="Total de sacos para la parcela"
              value={formatearNumero(resultadoCalculo.totalSacosParcela, 4)}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="weight"
              label="Total de kilogramos para la parcela"
              value={`${formatearNumero(resultadoCalculo.totalKgParcela, 2)} kg`}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="currency-usd"
              label="Costo total para la parcela"
              value={formatearDinero(resultadoCalculo.totalCostoParcela)}
              destacado
            />
          </View>
        </Seccion>

        <Seccion titulo="Distribución en el terreno">
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="drag-vertical-variant"
              label="Número de surcos"
              value={formatearNumero(resultadoCalculo.numeroSurcos, 2)}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="sprout-outline"
              label="Sitios por surco"
              value={formatearNumero(resultadoCalculo.sitiosPorSurco, 2)}
            />
          </View>
          <View style={{ width: itemWidth }}>
            <Metrica
              icono="beaker-outline"
              label="Kilogramos de mezcla por surco"
              value={`${formatearNumero(resultadoCalculo.kgMezclaPorSurco, 2)} kg`}
            />
          </View>
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
    color: COLORS.white,
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
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.primarySoft,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricBoxGold: {
    backgroundColor: COLORS.goldSoft,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textDark,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "700",
    lineHeight: 15,
  },
});
