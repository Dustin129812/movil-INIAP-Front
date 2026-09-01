import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { getCalcColors } from "../../components/calculadora/colors";
import {
  DetalleCalculo,
  ResultadosCalculo,
} from "../../components/calculadora/ui";
import { useAuth } from '../../services/auth';
import { obtenerCalculoPorId } from "../../services/calculadoraHistorialService";
import { useTheme } from "../../services/theme";

const formatearFecha = (fecha) => {
  if (!fecha) return "Fecha no disponible";

  const fechaObjeto = new Date(fecha);

  if (Number.isNaN(fechaObjeto.getTime())) {
    return "Fecha no disponible";
  }

  return fechaObjeto.toLocaleString(
    "es-EC",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};

function Encabezado({
  colors,
  onVolver,
}) {
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor:
            colors.dimGradientEnd,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.back}
        onPress={onVolver}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={30}
          color="#ffffff"
        />
      </TouchableOpacity>

      <View style={styles.headerTextos}>
        <Text
          style={styles.headerTitulo}
          numberOfLines={1}
        >
          Resultado guardado
        </Text>

        <Text style={styles.headerSubtitulo}>
          Historial de fertilización
        </Text>
      </View>
    </View>
  );
}

function PantallaCargando({ colors }) {
  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <View style={styles.cargando}>
        <ActivityIndicator
          size="large"
          color={colors.macroBorder}
        />

        <Text
          style={[
            styles.cargandoTexto,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Cargando resultado...
        </Text>
      </View>
    </SafeAreaView>
  );
}

function PantallaError({
  mensaje,
  colors,
  onVolver,
}) {
  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <Encabezado
        colors={colors}
        onVolver={onVolver}
      />

      <View style={styles.estadoError}>
        <View
          style={[
            styles.errorIcono,
            {
              backgroundColor:
                colors.dangerSoft,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={38}
            color={colors.danger}
          />
        </View>

        <Text
          style={[
            styles.errorTitulo,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          No se pudo mostrar el cálculo
        </Text>

        <Text
          style={[
            styles.errorTexto,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {mensaje}
        </Text>

        <TouchableOpacity
          style={[
            styles.volverBtn,
            {
              backgroundColor:
                colors.macroBorder,
            },
          ]}
          onPress={onVolver}
          activeOpacity={0.82}
        >
          <Text style={styles.volverTexto}>
            Volver al historial
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function DetalleHistorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { calculoId } =
    useLocalSearchParams();

  const { isDark } = useTheme();

  const {
    usuario,
    esInvitado,
    dispositivoId,
  } = useAuth();

  const colors = getCalcColors(isDark);

  const [calculo, setCalculo] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [
    mensajeError,
    setMensajeError,
  ] = useState("");

  const propietarioId = esInvitado
    ? dispositivoId
      ? `device:${dispositivoId}`
      : null
    : usuario?.ID
      ? `user:${usuario.ID}`
      : null;

  const cargarDetalle =
    useCallback(async () => {
      if (!calculoId) {
        setCalculo(null);
        setMensajeError(
          "No se recibió el identificador del cálculo.",
        );
        setCargando(false);
        return;
      }

      if (!propietarioId) {
        setCalculo(null);
        setMensajeError(
          "No se pudo identificar al usuario o dispositivo.",
        );
        setCargando(false);
        return;
      }

      setCargando(true);
      setMensajeError("");

      try {
        const calculoGuardado =
          await obtenerCalculoPorId(
            propietarioId,
            String(calculoId),
          );

        if (!calculoGuardado) {
          setCalculo(null);
          setMensajeError(
            "El cálculo no existe o fue eliminado.",
          );
          return;
        }

        setCalculo({
          ...calculoGuardado,
        });
      } catch (error) {
        console.error(
          "[DetalleHistorial] Error cargando resultado:",
          error,
        );

        setCalculo(null);
        setMensajeError(
          "No se pudo cargar el resultado.",
        );
      } finally {
        setCargando(false);
      }
    }, [
      calculoId,
      propietarioId,
    ]);

  useFocusEffect(
    useCallback(() => {
      cargarDetalle();

      return () => {
        setMensajeError("");
      };
    }, [cargarDetalle]),
  );

  const volverAlHistorial = () => {
    router.back();
  };

  const editarCalculo = () => {
    if (!calculo?.id) return;

    router.push({
      pathname: "/calculadora/calculadora",
      params: {
        calculoId: String(calculo.id),
        modo: "editar",
        paso: 1,
      },
    });
  };

  if (cargando) {
    return (
      <PantallaCargando
        colors={colors}
      />
    );
  }

  if (mensajeError || !calculo) {
    return (
      <PantallaError
        mensaje={
          mensajeError ||
          "No se encontró el cálculo solicitado."
        }
        colors={colors}
        onVolver={volverAlHistorial}
      />
    );
  }

  const fechaMostrada =
    calculo.fechaActualizacion ||
    calculo.fechaCreacion;

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <Encabezado
        colors={colors}
        onVolver={volverAlHistorial}
      />

      <ScrollView
        style={[
          styles.scroll,
          {
            backgroundColor: colors.bg,
          },
        ]}
        contentContainerStyle={[
          styles.contenido,
          {
            paddingBottom:
              Platform.OS === "web"
                ? 110
                : 190 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={[
            styles.informacion,
            {
              backgroundColor:
                colors.cardBg,
              borderColor:
                colors.dividerColor,
            },
          ]}
        >
          <View
            style={[
              styles.iconoTitulo,
              {
                backgroundColor:
                  colors.iconBadgeMacro,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="file-document-check-outline"
              size={24}
              color={colors.macroBorder}
            />
          </View>

          <View style={styles.titulos}>
            <Text
              style={[
                styles.titulo,
                {
                  color:
                    colors.textPrimary,
                },
              ]}
              numberOfLines={2}
            >
              {calculo.titulo ||
                "Cálculo sin título"}
            </Text>

            <View style={styles.fechaFila}>
              <MaterialCommunityIcons
                name="calendar-clock-outline"
                size={15}
                color={
                  colors.textSecondary
                }
              />

              <Text
                style={[
                  styles.fecha,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {formatearFecha(
                  fechaMostrada,
                )}
              </Text>
            </View>
          </View>
        </View>

        <ResultadosCalculo
          resultadoCalculo={
            calculo.resultado
          }
          isDark={isDark}
        />

        <DetalleCalculo
          detalles={
            calculo.resultado
              ?.detallePorFertilizante
          }
          isDark={isDark}
        />

        <View
          style={[
            styles.aviso,
            {
              backgroundColor:
                colors.macroTint,
              borderColor:
                colors.macroBorder,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.macroBorder}
          />

          <Text
            style={[
              styles.avisoTexto,
              {
                color:
                  colors.macroBorder,
              },
            ]}
          >
            Este resultado corresponde a
            los datos guardados en el
            historial. Utilice “Editar
            cálculo” solamente si necesita
            modificar la información y
            generar un resultado actualizado.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            bottom:
              Platform.OS === "web"
                ? 0
                : 92 + insets.bottom,
            backgroundColor:
              colors.cardBg,
            borderColor:
              colors.dividerColor,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.historialBtn,
            {
              borderColor:
                colors.inputBorder,
            },
          ]}
          onPress={volverAlHistorial}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="history"
            size={20}
            color={colors.textPrimary}
          />

          <Text
            style={[
              styles.historialTexto,
              {
                color:
                  colors.textPrimary,
              },
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.editarBtn,
            {
              backgroundColor:
                colors.macroBorder,
            },
          ]}
          onPress={editarCalculo}
          activeOpacity={0.82}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color="#ffffff"
          />

          <Text style={styles.editarTexto}>
            Editar cálculo
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    opacity: 1,
  },

  scroll: {
    flex: 1,
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextos: {
    flex: 1,
    marginLeft: 3,
  },

  headerTitulo: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
  },

  headerSubtitulo: {
    color:
      "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  contenido: {
    padding: 14,
  },

  informacion: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  iconoTitulo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  titulos: {
    flex: 1,
  },

  titulo: {
    fontSize: 18,
    fontWeight: "900",
  },

  fechaFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  fecha: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 5,
  },

  aviso: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  avisoTexto: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },

  historialBtn: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  historialTexto: {
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 6,
  },

  editarBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  editarTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cargandoTexto: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },

  estadoError: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  errorIcono: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitulo: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 15,
  },

  errorTexto: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },

  volverBtn: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },

  volverTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
});