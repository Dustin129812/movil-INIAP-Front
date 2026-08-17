import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getCalcColors } from "../colors";

export function GuardarCalculo({
  titulo,
  setTitulo,
  onGuardar,
  guardando = false,
  mensaje = "",
  tipoMensaje = "",
  deshabilitado = false,
  isDark,
}) {
  const colors = getCalcColors(isDark);

  const colorMensaje =
    tipoMensaje === "success"
      ? colors.ok
      : colors.danger;

  const fondoMensaje =
    tipoMensaje === "success"
      ? colors.okSoft
      : colors.dangerSoft;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.dividerColor,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.icono,
            {
              backgroundColor: colors.iconBadgeMacro,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="content-save-outline"
            size={22}
            color={colors.macroBorder}
          />
        </View>

        <View style={styles.headerTextos}>
          <Text
            style={[
              styles.titulo,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Guardar cálculo
          </Text>

          <Text
            style={[
              styles.subtitulo,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Asigne un nombre para identificar este resultado
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Título del cálculo
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="format-title"
          size={19}
          color={colors.textSecondary}
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.inputText,
            },
          ]}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej. Parcela de papa - lote norte"
          placeholderTextColor={colors.inputPlaceholder}
          maxLength={80}
          editable={!guardando}
          returnKeyType="done"
        />

        {!!titulo && !guardando && (
          <TouchableOpacity
            onPress={() => setTitulo("")}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={19}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[
          styles.contador,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {titulo.length}/80 caracteres
      </Text>

      {!!mensaje && (
        <View
          style={[
            styles.mensaje,
            {
              backgroundColor: fondoMensaje,
              borderColor: colorMensaje,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              tipoMensaje === "success"
                ? "check-circle-outline"
                : "alert-circle-outline"
            }
            size={18}
            color={colorMensaje}
          />

          <Text
            style={[
              styles.mensajeTexto,
              {
                color: colorMensaje,
              },
            ]}
          >
            {mensaje}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.boton,
          {
            backgroundColor: colors.macroBorder,
          },
          (deshabilitado || guardando) &&
            styles.botonDeshabilitado,
        ]}
        onPress={onGuardar}
        disabled={deshabilitado || guardando}
        activeOpacity={0.82}
      >
        {guardando ? (
          <ActivityIndicator
            size="small"
            color="#ffffff"
          />
        ) : (
          <MaterialCommunityIcons
            name="content-save-check-outline"
            size={20}
            color="#ffffff"
          />
        )}

        <Text style={styles.botonTexto}>
          {guardando
            ? "Guardando..."
            : "Guardar en historial"}
        </Text>
      </TouchableOpacity>

      {deshabilitado && (
        <Text
          style={[
            styles.ayuda,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Primero debe completar y ejecutar el cálculo.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  icono: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  headerTextos: {
    flex: 1,
  },

  titulo: {
    fontSize: 17,
    fontWeight: "900",
  },

  subtitulo: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 50,
    borderWidth: 1.5,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 9,
    fontSize: 14,
    fontWeight: "700",
  },

  contador: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 5,
    marginBottom: 11,
  },

  mensaje: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  mensajeTexto: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginLeft: 8,
  },

  boton: {
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  botonDeshabilitado: {
    opacity: 0.45,
  },

  botonTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },

  ayuda: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 8,
  },
});