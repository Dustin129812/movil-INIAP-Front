import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";

import { COLORS } from "../colors";

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

function CampoDimension({ label, value, onChangeText }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.labelLight}>{label}</Text>
      <TextInput
        style={styles.inputParcela}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={COLORS.textMuted}
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
}) {
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const itemWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.card}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconBadgeOnDark}>
          <MaterialCommunityIcons name="ruler-square" size={18} color="#fff" />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.cardTitleLight}>Dimensiones de la parcela</Text>
          <Text style={styles.cardSubtitleLight}>Área = largo × ancho</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Largo de la parcela (m)"
            value={largoMetros}
            onChangeText={setLargoMetros}
          />
        </View>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Ancho de la parcela (m)"
            value={anchoMetros}
            onChangeText={setAnchoMetros}
          />
        </View>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Distancia entre surcos (m)"
            value={distanciaEntreSurcos}
            onChangeText={setDistanciaEntreSurcos}
          />
        </View>
        <View style={{ width: itemWidth }}>
          <CampoDimension
            label="Distancia entre plantas (m)"
            value={distanciaEntrePlantas}
            onChangeText={setDistanciaEntrePlantas}
          />
        </View>
      </View>

      <View style={styles.areaPreviewPill}>
        <MaterialCommunityIcons
          name="texture-box"
          size={16}
          color={COLORS.primaryDark}
        />
        <Text style={styles.areaPreviewText}>
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
    backgroundColor: "rgba(255,255,255,0.18)",
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
    color: COLORS.white,
  },
  cardSubtitleLight: {
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
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
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  inputParcela: {
    backgroundColor: COLORS.white,
    minHeight: 44,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "800",
    color: COLORS.textDark,
    paddingHorizontal: 10,
  },
  areaPreviewPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  areaPreviewText: {
    color: COLORS.primaryDark,
    fontWeight: "800",
    fontSize: 12,
    marginLeft: 6,
  },
});
