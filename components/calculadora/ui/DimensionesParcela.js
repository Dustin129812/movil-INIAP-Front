import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { COLORS_CALC, getCalcColors } from "../colors";

const formatearNumero = (valor, decimales = 2) => {
  if (!Number.isFinite(valor)) return "0";
  return valor.toLocaleString("es-EC", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales,
  });
};

const obtenerColumnas = (ancho) => {
  if (ancho < 420) return 1;
  if (ancho < 900) return 2;
  return 4;
};

function CampoDimension({ label, value, onChangeText, colors }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.labelLight, { color: colors.dimTextSub }]}>{label}</Text>
      <TextInput
        style={[styles.inputParcela, {
          backgroundColor: colors.dimInputBg,
          color: colors.dimInputText,
        }]}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={colors.inputPlaceholder}
      />
    </View>
  );
}

export function DimensionesParcela({
  largoMetros,
  setLargoMetros,
  anchoMetros,
  setAnchoMetros,
  distanciaEntreSurcos,
  setDistanciaEntreSurcos,
  distanciaEntrePlantas,
  setDistanciaEntrePlantas,
  areaPreview,
  isDark,
}) {
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const itemWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;
  const colors = getCalcColors(isDark);

  return (
    <LinearGradient
      colors={[colors.dimGradientStart, colors.dimGradientEnd]}
      style={styles.card}
    >
      <View style={styles.cardHeaderRow}>
        <View style={[styles.iconBadgeOnDark, { backgroundColor: colors.dimIconBadge }]}>
          <MaterialCommunityIcons name="ruler-square" size={18} color={colors.dimText} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.cardTitleLight, { color: colors.dimText }]}>Dimensiones de la parcela</Text>
          <Text style={[styles.cardSubtitleLight, { color: colors.dimTextSub }]}>Área = largo × ancho</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Largo de la parcela (m)"
            value={largoMetros}
            onChangeText={setLargoMetros}
            colors={colors}
          />
        </View>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Ancho de la parcela (m)"
            value={anchoMetros}
            onChangeText={setAnchoMetros}
            colors={colors}
          />
        </View>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Distancia entre surcos (m)"
            value={distanciaEntreSurcos}
            onChangeText={setDistanciaEntreSurcos}
            colors={colors}
          />
        </View>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Distancia entre plantas (m)"
            value={distanciaEntrePlantas}
            onChangeText={setDistanciaEntrePlantas}
            colors={colors}
          />
        </View>
      </View>

      <View style={[styles.areaPreviewPill, { backgroundColor: colors.dimAreaPillBg }]}>
        <MaterialCommunityIcons
          name="texture-box"
          size={16}
          color={colors.dimAreaPillText}
        />
        <Text style={[styles.areaPreviewText, { color: colors.dimAreaPillText }]}>
          Área: {formatearNumero(areaPreview.areaM2, 2)} m² ·{" "}
          {formatearNumero(areaPreview.areaHa, 4)} ha
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBadgeOnDark: {
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
  cardTitleLight: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardSubtitleLight: {
    fontSize: 12,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 12,
  },
  labelLight: {
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  inputParcela: {
    minHeight: 44,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "800",
    paddingHorizontal: 10,
  },
  areaPreviewPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  areaPreviewText: {
    fontWeight: "800",
    fontSize: 12,
    marginLeft: 6,
  },
});
