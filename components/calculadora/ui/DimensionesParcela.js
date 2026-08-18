import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getCalcColors } from "../colors";

const formato = (valor, decimales = 2) => Number(valor || 0).toLocaleString("es-EC", { maximumFractionDigits: decimales, minimumFractionDigits: 0, });

function Campo({ label, value, onChangeText, colors, placeholder = "0" }) {
  return <View style={styles.campo}>
    <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
      keyboardType="decimal-pad" value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.inputPlaceholder} />
  </View>;
}

export function DimensionesParcela({ modoArea, setModoArea, areaMetrosCuadrados, setAreaMetrosCuadrados, largoMetros, setLargoMetros, anchoMetros, setAnchoMetros, distanciaEntreSurcos, setDistanciaEntreSurcos, distanciaEntrePlantas, setDistanciaEntrePlantas, areaPreview, isDark }) {
  const colors = getCalcColors(isDark);
  return <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.dividerColor }]}>
    <View style={styles.encabezado}>
      <View style={[styles.icono, { backgroundColor: colors.iconBadgeMacro }]}><MaterialCommunityIcons name="map-marker-path" size={21} color={colors.macroBorder} /></View>
      <View style={styles.titulos}><Text style={[styles.titulo, { color: colors.textPrimary }]}>Datos de la parcela</Text><Text style={[styles.subtitulo, { color: colors.textSecondary }]}>Elija cómo desea ingresar el área</Text></View>
    </View>
    <View style={[styles.segmentado, { backgroundColor: colors.inputBg }]}>
      {[{ id: "area", texto: "Ingresar m²", icono: "texture-box" }, { id: "dimensiones", texto: "Largo × ancho", icono: "ruler-square" }].map((opcion) => {
        const activo = modoArea === opcion.id;
        return <TouchableOpacity key={opcion.id} style={[styles.opcion, activo && { backgroundColor: colors.macroBorder }]} onPress={() => setModoArea(opcion.id)} activeOpacity={0.8}>
          <MaterialCommunityIcons name={opcion.icono} size={17} color={activo ? "#fff" : colors.textSecondary} />
          <Text style={[styles.opcionTexto, { color: activo ? "#fff" : colors.textSecondary }]}>{opcion.texto}</Text>
        </TouchableOpacity>;
      })}
    </View>
    {modoArea === "area" ? <Campo label="Área total de la parcela (m²)" value={areaMetrosCuadrados} onChangeText={setAreaMetrosCuadrados} colors={colors} placeholder="Ej. 3300" /> :
      <View style={styles.fila}><View style={styles.mitad}><Campo label="Largo (m)" value={largoMetros} onChangeText={setLargoMetros} colors={colors} /></View><View style={styles.mitad}><Campo label="Ancho (m)" value={anchoMetros} onChangeText={setAnchoMetros} colors={colors} /></View></View>}
    <Text style={[styles.seccionLabel, { color: colors.textPrimary }]}>Distribución del cultivo</Text>
    <View style={styles.fila}><View style={styles.mitad}><Campo label="Entre surcos (m)" value={distanciaEntreSurcos} onChangeText={setDistanciaEntreSurcos} colors={colors} /></View><View style={styles.mitad}><Campo label="Entre plantas (m)" value={distanciaEntrePlantas} onChangeText={setDistanciaEntrePlantas} colors={colors} /></View></View>
    <View style={[styles.resumen, { backgroundColor: colors.macroTint }]}><MaterialCommunityIcons name="vector-square" size={20} color={colors.macroBorder} /><View style={styles.resumenTexto}><Text style={[styles.resumenLabel, { color: colors.textSecondary }]}>Área calculada</Text><Text style={[styles.resumenValor, { color: colors.macroBorder }]}>{formato(areaPreview.areaM2)} m²  ·  {formato(areaPreview.areaHa, 4)} ha</Text></View></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, borderWidth: 1 }, encabezado: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  icono: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 11 }, titulos: { flex: 1 }, titulo: { fontSize: 18, fontWeight: "900" }, subtitulo: { fontSize: 12, marginTop: 2 },
  segmentado: { flexDirection: "row", padding: 4, borderRadius: 13, marginBottom: 16 }, opcion: { flex: 1, minHeight: 42, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }, opcionTexto: { fontSize: 12, fontWeight: "800", marginLeft: 6 },
  fila: { flexDirection: "row", justifyContent: "space-between" }, mitad: { width: "48.5%" }, campo: { marginBottom: 13 }, label: { fontSize: 11, fontWeight: "700", marginBottom: 6 }, input: { minHeight: 48, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, fontSize: 16, fontWeight: "800" },
  seccionLabel: { fontSize: 13, fontWeight: "900", marginTop: 2, marginBottom: 10 }, resumen: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 12 }, resumenTexto: { marginLeft: 10 }, resumenLabel: { fontSize: 10, fontWeight: "700" }, resumenValor: { fontSize: 14, fontWeight: "900", marginTop: 2 },
});
