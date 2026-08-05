import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { COLORS } from "../colors";
import { FERTILIZANTES, PESO_SACO_KG } from "../fertilizantes";
import { NUTRIENTES } from "../nutrientes";

const obtenerColumnas = (ancho) => {
  if (ancho < 540) return 1;
  if (ancho < 980) return 2;
  return 3;
};

function TextoComposicion({ composicion }) {
  return (
    <Text style={styles.composicionText}>
      {NUTRIENTES.map(
        (nutriente) => `${nutriente.simbolo} ${composicion[nutriente.key]}`,
      ).join(" · ")}
    </Text>
  );
}

export function ListaFertilizantes({
  sacosPorHectarea,
  cambiarSacosPorHectarea,
  limpiarCantidades,
}) {
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const cardWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons
            name="sack-outline"
            size={18}
            color={COLORS.primaryDark}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.cardTitle}>Cantidad de fertilizantes</Text>
          <Text style={styles.cardSubtitle}>
            Ingrese los sacos de {PESO_SACO_KG} kg por hectárea
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.limpiarBtn}
        onPress={limpiarCantidades}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="broom"
          size={16}
          color={COLORS.primaryDark}
        />
        <Text style={styles.limpiarBtnText}>Limpiar cantidades</Text>
      </TouchableOpacity>

      <View style={styles.grid}>
        {FERTILIZANTES.map((fertilizante) => (
          <View
            key={fertilizante.id}
            style={[styles.fertCard, { width: cardWidth }]}
          >
            <View style={styles.fertHeader}>
              <View style={styles.fertIcon}>
                <MaterialCommunityIcons
                  name="leaf-circle-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.fertTitleWrap}>
                <Text style={styles.fertName} numberOfLines={2}>
                  {fertilizante.nombre}
                </Text>
                <TextoComposicion composicion={fertilizante.composicion} />
              </View>
            </View>

            <View style={styles.fertFooter}>
              <View style={styles.pricePill}>
                <Text style={styles.pricePillText}>
                  Precio registrado: ${fertilizante.precioSaco}
                </Text>
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Sacos por hectárea</Text>
                <TextInput
                  style={styles.inputFert}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={sacosPorHectarea[fertilizante.nombre]}
                  onChangeText={(valor) =>
                    cambiarSacosPorHectarea(fertilizante.nombre, valor)
                  }
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
          </View>
        ))}
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
    marginBottom: 12,
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
  limpiarBtn: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  limpiarBtnText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  fertCard: {
    minWidth: 230,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  fertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fertIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fertTitleWrap: {
    flex: 1,
  },
  fertName: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: "900",
  },
  composicionText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    lineHeight: 14,
  },
  fertFooter: {
    marginTop: 12,
  },
  pricePill: {
    backgroundColor: COLORS.goldSoft,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  pricePillText: {
    fontSize: 11,
    color: COLORS.goldDark,
    fontWeight: "800",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    flex: 1,
    paddingRight: 10,
  },
  inputFert: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    width: 82,
    minHeight: 42,
    borderRadius: 10,
    textAlign: "center",
    backgroundColor: COLORS.white,
    fontWeight: "900",
    color: COLORS.textDark,
  },
});
