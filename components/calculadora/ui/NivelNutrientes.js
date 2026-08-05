import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { COLORS } from "../colors";
import { convertirTextoANumero } from "../hooks/useCalculadora";
import { NUTRIENTES } from "../nutrientes";

const formatearNumero = (valor, decimales = 2) => {
  if (!Number.isFinite(valor)) return "0";
  return valor.toLocaleString("es-EC", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales,
  });
};

const obtenerColumnas = (ancho) => {
  if (ancho < 360) return 1;
  if (ancho < 720) return 2;
  if (ancho < 980) return 3;
  return 4;
};

const obtenerColorEstado = (estado) => {
  if (estado === "Completo") return COLORS.ok;
  if (estado === "Exceso") return COLORS.danger;
  return COLORS.warn;
};

export function NivelNutrientes({
  nivelRecomendado,
  cambiarNivelRecomendado,
  resultadoCalculo,
}) {
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const cardWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons
            name="flask-outline"
            size={18}
            color={COLORS.primaryDark}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.cardTitle}>Nivel recomendado y obtenido</Text>
          <Text style={styles.cardSubtitle}>
            kg de ingrediente activo por hectárea
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {NUTRIENTES.map((nutriente) => {
          const datos = resultadoCalculo?.diferenciaNutrientes?.[nutriente.key];
          const recomendadoLeido = convertirTextoANumero(
            nivelRecomendado[nutriente.key],
          );
          const recomendado =
            datos?.recomendado ??
            (recomendadoLeido.valido ? recomendadoLeido.numero : 0);
          const obtenido = datos?.obtenido ?? 0;
          const diferencia = datos?.diferencia ?? recomendado - obtenido;
          const estado = datos?.estado ?? (diferencia === 0 ? "Completo" : "Faltante");
          const colorEstado = obtenerColorEstado(estado);
          const progreso =
            recomendado > 0 ? Math.min((obtenido / recomendado) * 100, 100) : 0;

          return (
            <View
              key={nutriente.key}
              style={[
                styles.nutrienteBox,
                {
                  width: cardWidth,
                  backgroundColor:
                    nutriente.tipo === "macro" ? COLORS.macroTint : COLORS.secTint,
                },
              ]}
            >
              <View
                style={[
                  styles.nutrienteAccent,
                  {
                    backgroundColor:
                      nutriente.tipo === "macro"
                        ? COLORS.macroBorder
                        : COLORS.secBorder,
                  },
                ]}
              />
              <View style={styles.nutrienteHeader}>
                <View>
                  <Text style={styles.nutrienteSimbolo}>{nutriente.simbolo}</Text>
                  <Text style={styles.nutrienteNombre}>{nutriente.nombre}</Text>
                </View>
                <Text style={[styles.estadoTag, { color: colorEstado }]}>
                  {estado}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progreso}%`, backgroundColor: colorEstado },
                  ]}
                />
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Obtenido</Text>
                <Text style={styles.metricValue}>{formatearNumero(obtenido)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Diferencia</Text>
                <Text style={[styles.metricValue, { color: colorEstado }]}>
                  {formatearNumero(diferencia)}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Nivel recomendado (meta)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={nivelRecomendado[nutriente.key]}
                onChangeText={(valor) =>
                  cambiarNivelRecomendado(nutriente.key, valor)
                }
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.macroTint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutrienteBox: {
    minWidth: 144,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  nutrienteAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  nutrienteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
  },
  nutrienteSimbolo: {
    color: COLORS.textDark,
    fontWeight: "900",
    fontSize: 18,
  },
  nutrienteNombre: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1,
  },
  estadoTag: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.07)",
    marginTop: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  metricValue: {
    color: COLORS.textDark,
    fontSize: 12,
    fontWeight: "900",
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: "center",
    color: COLORS.textDark,
    fontWeight: "800",
  },
});
