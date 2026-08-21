import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS_CALC, getCalcColors } from "../colors";
import { FERTILIZANTES, PESO_SACO_KG } from "../fertilizantes";
import { NUTRIENTES } from "../nutrientes";

function TextoComposicion({ composicion, textSecondary }) {
  return (
    <Text style={[styles.composicionText, { color: textSecondary }]}>
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
  isDark,
}) {
  const colors = getCalcColors(isDark);
  const seleccionados = Object.values(sacosPorHectarea).filter((valor) => Number(String(valor).replace(",", ".")) > 0).length;

  return (
    <View style={[styles.card, {
      backgroundColor: colors.cardBg,
      borderColor: colors.dividerColor,
    }]}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.iconBadge, {
          backgroundColor: colors.iconBadgeMacro,
        }]}>
          <MaterialCommunityIcons
            name="sack-outline"
            size={18}
            color={COLORS_CALC.ACTIVE_COLOR}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Cantidad de fertilizantes</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Ingrese los sacos de {PESO_SACO_KG} kg por hectárea
          </Text>
        </View>
        <View style={[styles.contador, { backgroundColor: colors.macroTint }]}><Text style={[styles.contadorTexto, { color: colors.macroBorder }]}>{seleccionados} elegidos</Text></View>
      </View>

      <TouchableOpacity
        style={[styles.limpiarBtn, { backgroundColor: colors.macroTint }]}
        onPress={limpiarCantidades}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="broom"
          size={16}
          color={colors.macroBorder}
        />
        <Text style={[styles.limpiarBtnText, { color: colors.macroBorder }]}>Limpiar cantidades</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid} snapToInterval={264} decelerationRate="fast">
        {FERTILIZANTES.map((fertilizante) => (
          <View
            key={fertilizante.id}
            style={[styles.fertCard, {
              width: 252,
              backgroundColor: colors.subCardBg,
              borderColor: colors.dividerColor,
            }]}
          >
            <View style={styles.fertHeader}>
              <View style={[styles.fertIcon, { backgroundColor: colors.iconBadgeMacro }]}>
                <MaterialCommunityIcons
                  name="leaf-circle-outline"
                  size={20}
                  color={COLORS_CALC.ACTIVE_COLOR}
                />
              </View>
              <View style={styles.fertTitleWrap}>
                <Text style={[styles.fertName, { color: colors.textPrimary }]} numberOfLines={2}>
                  {fertilizante.nombre}
                </Text>
                <TextoComposicion composicion={fertilizante.composicion} textSecondary={colors.textSecondary} />
              </View>
            </View>

            <View style={styles.fertFooter}>
              <View style={[styles.pricePill, { backgroundColor: colors.goldSoft }]}>
                <Text style={[styles.pricePillText, { color: colors.goldDark }]}>
                  Precio registrado: ${fertilizante.precioSaco}
                </Text>
              </View>
              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Sacos por hectárea</Text>
                <TextInput
                  style={[styles.inputFert, {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.inputText,
                  }]}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={sacosPorHectarea[fertilizante.nombre]}
                  onChangeText={(valor) =>
                    cambiarSacosPorHectarea(fertilizante.nombre, valor)
                  }
                  placeholderTextColor={colors.inputPlaceholder}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 12,
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
  limpiarBtn: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  limpiarBtnText: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
  grid: {
    flexDirection: "row",
    paddingRight: 4,
  },
  fertCard: {
    minWidth: 230,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    marginRight: 12,
  },
  fertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fertIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fertTitleWrap: {
    flex: 1,
  },
  fertName: {
    fontSize: 13,
    fontWeight: "900",
  },
  composicionText: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    lineHeight: 14,
  },
  fertFooter: {
    marginTop: 12,
  },
  pricePill: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  pricePillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    flex: 1,
    paddingRight: 10,
  },
  inputFert: {
    borderWidth: 1.5,
    width: 82,
    minHeight: 42,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "900",
  },
  contador: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6 },
  contadorTexto: { fontSize: 10, fontWeight: "900" },
});
