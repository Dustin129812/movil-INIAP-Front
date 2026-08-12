import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { COLORS_CALC, getCalcColors } from "../colors";
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

const obtenerColorEstado = (estado, colors) => {
  if (estado === "Completo") return colors.ok;
  if (estado === "Exceso") return colors.danger;
  return colors.warn;
};

export function NivelNutrientes({
  nivelRecomendado,
  cambiarNivelRecomendado,
  resultadoCalculo,
  isDark,
}) {
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const cardWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;
  const colors = getCalcColors(isDark);

  return (
    <View style={[styles.card, {
      backgroundColor: colors.cardBg,
      borderColor: colors.dividerColor,
    }]}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.iconBadge, { backgroundColor: colors.iconBadgeMacro }]}>
          <MaterialCommunityIcons
            name="flask-outline"
            size={18}
            color={COLORS_CALC.ACTIVE_COLOR}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Nivel recomendado y obtenido</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
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
          const colorEstado = obtenerColorEstado(estado, colors);
          const progreso =
            recomendado > 0 ? Math.min((obtenido / recomendado) * 100, 100) : 0;

          const boxTint = nutriente.tipo === "macro" ? colors.macroTint : colors.secTint;
          const boxBorder = nutriente.tipo === "macro" ? colors.macroBorder : colors.secBorder;

          return (
            <View
              key={nutriente.key}
              style={[
                styles.nutrienteBox,
                {
                  width: cardWidth,
                  backgroundColor: boxTint,
                  borderColor: boxBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.nutrienteAccent,
                  { backgroundColor: boxBorder },
                ]}
              />
              <View style={styles.nutrienteHeader}>
                <View>
                  <Text style={[styles.nutrienteSimbolo, { color: colors.textPrimary }]}>{nutriente.simbolo}</Text>
                  <Text style={[styles.nutrienteNombre, { color: colors.textSecondary }]}>{nutriente.nombre}</Text>
                </View>
                <Text style={[styles.estadoTag, { color: colorEstado }]}>
                  {estado}
                </Text>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progreso}%`, backgroundColor: colorEstado },
                  ]}
                />
              </View>

              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Obtenido</Text>
                <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{formatearNumero(obtenido)}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Diferencia</Text>
                <Text style={[styles.metricValue, { color: colorEstado }]}>
                  {formatearNumero(diferencia)}
                </Text>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nivel recomendado (meta)</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }]}
                keyboardType="decimal-pad"
                value={nivelRecomendado[nutriente.key]}
                onChangeText={(valor) =>
                  cambiarNivelRecomendado(nutriente.key, valor)
                }
                placeholder="0"
                placeholderTextColor={colors.inputPlaceholder}
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
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
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
  },
  cardSubtitle: {
    fontSize: 12,
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
    borderWidth: 1,
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
    fontWeight: "900",
    fontSize: 18,
  },
  nutrienteNombre: {
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
    fontSize: 11,
    fontWeight: "700",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "900",
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: "center",
    fontWeight: "800",
  },
});
