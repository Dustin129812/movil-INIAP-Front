import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { COLORS_CALC, getCalcColors } from "../colors";
import { NUTRIENTES } from "../nutrientes";

const formatearNumero = (valor, decimales = 2) => {
  if (!Number.isFinite(valor)) return "0";
  return valor.toLocaleString("es-EC", {
    maximumFractionDigits: decimales,
    minimumFractionDigits: decimales,
  });
};

const obtenerColumnas = (ancho) => {
  if (ancho < 720) return 1;
  if (ancho < 1100) return 2;
  return 3;
};

function DatoDetalle({ label, value, destacado, colors }) {
  return (
    <View style={[styles.detailItem, {
      backgroundColor: colors.cardBg,
      borderColor: colors.dividerColor,
    }]}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, destacado && { color: colors.gold }]}>
        {value}
      </Text>
    </View>
  );
}

function FormulaTexto({ children, colors }) {
  return (
    <View style={styles.formulaRow}>
      <MaterialCommunityIcons
        name="function-variant"
        size={16}
        color={colors.macroBorder}
      />
      <Text style={[styles.formulaText, { color: colors.textPrimary }]}>{children}</Text>
    </View>
  );
}

export function DetalleCalculo({ detalles, isDark }) {
  const [mostrarFormulas, setMostrarFormulas] = useState(false);
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const cardWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;
  const colors = getCalcColors(isDark);

  if (!detalles?.length) return null;

  return (
    <View style={[styles.card, {
      backgroundColor: colors.cardBg,
      borderColor: colors.dividerColor,
    }]}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.iconBadge, { backgroundColor: colors.iconBadgeMacro }]}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={18}
            color={COLORS_CALC.ACTIVE_COLOR}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Detalle por fertilizante</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Solo se muestran fertilizantes con sacos por hectárea mayores que cero
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.formulasButton, { backgroundColor: colors.macroTint }]}
        onPress={() => setMostrarFormulas((prev) => !prev)}
        activeOpacity={0.82}
      >
        <MaterialCommunityIcons
          name={mostrarFormulas ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.macroBorder}
        />
        <Text style={[styles.formulasButtonText, { color: colors.macroBorder }]}>Ver detalle de fórmulas</Text>
      </TouchableOpacity>

      {mostrarFormulas && (
        <View style={[styles.formulasBox, {
          backgroundColor: colors.subCardBg,
          borderColor: colors.dividerColor,
        }]}>
          <FormulaTexto colors={colors}>Kg/ha = sacos/ha × 50</FormulaTexto>
          <FormulaTexto colors={colors}>
            Sacos parcela = sacos/ha × área ÷ 10 000
          </FormulaTexto>
          <FormulaTexto colors={colors}>
            Kg parcela = kg/ha × área ÷ 10 000
          </FormulaTexto>
          <FormulaTexto colors={colors}>
            Ingrediente activo = kg/ha × porcentaje ÷ 100
          </FormulaTexto>
          <FormulaTexto colors={colors}>
            Costo parcela = costo/ha × área ÷ 10 000
          </FormulaTexto>
        </View>
      )}

      <View style={styles.grid}>
        {detalles.map((detalle) => (
          <View key={detalle.id} style={[styles.detalleCard, {
            width: cardWidth,
            backgroundColor: colors.subCardBg,
            borderColor: colors.dividerColor,
          }]}>
            <View style={styles.detalleHeader}>
              <Text style={[styles.detalleTitle, { color: colors.textPrimary }]}>{detalle.nombre}</Text>
              <Text style={[styles.detalleSubtitle, { color: COLORS_CALC.ACTIVE_COLOR }]}>
                {formatearNumero(detalle.sacosPorHectarea, 2)} sacos/ha
              </Text>
            </View>

            <View style={styles.detalleGrid}>
              <DatoDetalle
                label="Kg/ha"
                value={`${formatearNumero(detalle.kgPorHectarea, 2)} kg`}
                colors={colors}
              />
              <DatoDetalle
                label="Precio por saco"
                value={`$${formatearNumero(detalle.precioSaco, 2)}`}
                colors={colors}
              />
              <DatoDetalle
                label="Costo/ha"
                value={`$${formatearNumero(detalle.costoPorHectarea, 2)}`}
                destacado
                colors={colors}
              />
              <DatoDetalle
                label="Sacos parcela"
                value={formatearNumero(detalle.sacosParcela, 4)}
                colors={colors}
              />
              <DatoDetalle
                label="Kg parcela"
                value={`${formatearNumero(detalle.kgParcela, 2)} kg`}
                colors={colors}
              />
              <DatoDetalle
                label="Costo parcela"
                value={`$${formatearNumero(detalle.costoParcela, 2)}`}
                destacado
                colors={colors}
              />
            </View>

            <Text style={[styles.aportesTitle, { color: colors.textSecondary }]}>Aporte de nutrientes</Text>
            <View style={styles.aportesGrid}>
              {NUTRIENTES.map((nutriente) => (
                <View key={nutriente.key} style={[styles.aportePill, { backgroundColor: colors.macroTint }]}>
                  <Text style={[styles.aporteLabel, { color: colors.macroBorder }]}>{nutriente.simbolo}</Text>
                  <Text style={[styles.aporteValue, { color: colors.textPrimary }]}>
                    {formatearNumero(detalle.aportes[nutriente.key], 2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
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
    fontWeight: "900",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  formulasButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  formulasButtonText: {
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  formulasBox: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  formulaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  formulaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginLeft: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detalleCard: {
    minWidth: 260,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  detalleHeader: {
    marginBottom: 10,
  },
  detalleTitle: {
    fontWeight: "900",
    fontSize: 15,
  },
  detalleSubtitle: {
    fontWeight: "800",
    fontSize: 12,
    marginTop: 2,
  },
  detalleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: "48%",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "800",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  aportesTitle: {
    fontWeight: "900",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  aportesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  aportePill: {
    minWidth: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  aporteLabel: {
    fontWeight: "900",
    fontSize: 11,
  },
  aporteValue: {
    fontWeight: "900",
    fontSize: 11,
    marginLeft: 6,
  },
});
