import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { COLORS } from "../colors";
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

function DatoDetalle({ label, value, destacado }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, destacado && styles.detailValueGold]}>
        {value}
      </Text>
    </View>
  );
}

function FormulaTexto({ children }) {
  return (
    <View style={styles.formulaRow}>
      <MaterialCommunityIcons
        name="function-variant"
        size={16}
        color={COLORS.primaryDark}
      />
      <Text style={styles.formulaText}>{children}</Text>
    </View>
  );
}

export function DetalleCalculo({ detalles }) {
  const [mostrarFormulas, setMostrarFormulas] = useState(false);
  const { width } = useWindowDimensions();
  const columnas = obtenerColumnas(width);
  const cardWidth = columnas === 1 ? "100%" : `${100 / columnas - 2}%`;

  if (!detalles?.length) return null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={18}
            color={COLORS.primaryDark}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.cardTitle}>Detalle por fertilizante</Text>
          <Text style={styles.cardSubtitle}>
            Solo se muestran fertilizantes con sacos por hectárea mayores que cero
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.formulasButton}
        onPress={() => setMostrarFormulas((prev) => !prev)}
        activeOpacity={0.82}
      >
        <MaterialCommunityIcons
          name={mostrarFormulas ? "chevron-up" : "chevron-down"}
          size={18}
          color={COLORS.primaryDark}
        />
        <Text style={styles.formulasButtonText}>Ver detalle de fórmulas</Text>
      </TouchableOpacity>

      {mostrarFormulas && (
        <View style={styles.formulasBox}>
          <FormulaTexto>Kg/ha = sacos/ha × 50</FormulaTexto>
          <FormulaTexto>
            Sacos parcela = sacos/ha × área ÷ 10 000
          </FormulaTexto>
          <FormulaTexto>
            Kg parcela = kg/ha × área ÷ 10 000
          </FormulaTexto>
          <FormulaTexto>
            Ingrediente activo = kg/ha × porcentaje ÷ 100
          </FormulaTexto>
          <FormulaTexto>
            Costo parcela = costo/ha × área ÷ 10 000
          </FormulaTexto>
        </View>
      )}

      <View style={styles.grid}>
        {detalles.map((detalle) => (
          <View key={detalle.id} style={[styles.detalleCard, { width: cardWidth }]}>
            <View style={styles.detalleHeader}>
              <Text style={styles.detalleTitle}>{detalle.nombre}</Text>
              <Text style={styles.detalleSubtitle}>
                {formatearNumero(detalle.sacosPorHectarea, 2)} sacos/ha
              </Text>
            </View>

            <View style={styles.detalleGrid}>
              <DatoDetalle
                label="Kg/ha"
                value={`${formatearNumero(detalle.kgPorHectarea, 2)} kg`}
              />
              <DatoDetalle
                label="Precio por saco"
                value={`$${formatearNumero(detalle.precioSaco, 2)}`}
              />
              <DatoDetalle
                label="Costo/ha"
                value={`$${formatearNumero(detalle.costoPorHectarea, 2)}`}
                destacado
              />
              <DatoDetalle
                label="Sacos parcela"
                value={formatearNumero(detalle.sacosParcela, 4)}
              />
              <DatoDetalle
                label="Kg parcela"
                value={`${formatearNumero(detalle.kgParcela, 2)} kg`}
              />
              <DatoDetalle
                label="Costo parcela"
                value={`$${formatearNumero(detalle.costoParcela, 2)}`}
                destacado
              />
            </View>

            <Text style={styles.aportesTitle}>Aporte de nutrientes</Text>
            <View style={styles.aportesGrid}>
              {NUTRIENTES.map((nutriente) => (
                <View key={nutriente.key} style={styles.aportePill}>
                  <Text style={styles.aporteLabel}>{nutriente.simbolo}</Text>
                  <Text style={styles.aporteValue}>
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
    fontWeight: "900",
    color: COLORS.textDark,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  formulasButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  formulasButtonText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },
  formulasBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formulaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  formulaText: {
    flex: 1,
    color: COLORS.textDark,
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
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detalleHeader: {
    marginBottom: 10,
  },
  detalleTitle: {
    color: COLORS.textDark,
    fontWeight: "900",
    fontSize: 15,
  },
  detalleSubtitle: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  detailValue: {
    color: COLORS.textDark,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  detailValueGold: {
    color: COLORS.goldDark,
  },
  aportesTitle: {
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  aporteLabel: {
    color: COLORS.primaryDark,
    fontWeight: "900",
    fontSize: 11,
  },
  aporteValue: {
    color: COLORS.textDark,
    fontWeight: "900",
    fontSize: 11,
    marginLeft: 6,
  },
});
