import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
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
  eliminarCalculoHistorial,
  obtenerHistorialCalculos,
} from "../../services/calculadoraHistorialService";
import { useTheme } from "../../services/theme";
import { useAuth } from '../../services/auth';

const RUTA_CALCULADORA =
  "/(tabs)/calculadora";

const formatearNumero = (
  valor,
  decimales = 2,
) => {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "0";
  }

  return numero.toLocaleString(
    "es-EC",
    {
      maximumFractionDigits:
        decimales,
      minimumFractionDigits: 0,
    },
  );
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Fecha no disponible";
  }

  const fechaObjeto =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaObjeto.getTime(),
    )
  ) {
    return "Fecha no disponible";
  }

  return fechaObjeto.toLocaleString(
    "es-EC",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};

function Metrica({
  label,
  valor,
  colors,
}) {
  return (
    <View style={styles.metrica}>
      <Text
        style={[
          styles.metricaLabel,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.metricaValor,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

function Separador({ colors }) {
  return (
    <View
      style={[
        styles.separador,
        {
          backgroundColor:
            colors.dividerColor,
        },
      ]}
    />
  );
}

function TarjetaHistorial({
  calculo,
  onVerResultado,
  onEliminar,
  colors,
}) {
  const resultado =
    calculo?.resultado ?? {};

  const areaM2 =
    resultado.areaM2 ?? 0;

  const areaHa =
    resultado.areaHa ?? 0;

  const totalSacos =
    resultado.totalSacosParcela ??
    0;

  const costoTotal =
    resultado.totalCostoParcela ??
    0;

  const fecha =
    calculo?.fechaActualizacion ||
    calculo?.fechaCreacion;

  return (
    <View
      style={[
        styles.tarjeta,
        {
          backgroundColor:
            colors.cardBg,
          borderColor:
            colors.dividerColor,
        },
      ]}
    >
      <View
        style={styles.tarjetaHeader}
      >
        <View
          style={[
            styles.tarjetaIcono,
            {
              backgroundColor:
                colors
                  .iconBadgeMacro,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="calculator-variant-outline"
            size={22}
            color={
              colors.macroBorder
            }
          />
        </View>

        <View
          style={styles.tarjetaTitulos}
        >
          <Text
            style={[
              styles.tarjetaTitulo,
              {
                color:
                  colors.textPrimary,
              },
            ]}
            numberOfLines={2}
          >
            {calculo?.titulo ||
              "Cálculo sin título"}
          </Text>

          <View
            style={styles.fechaFila}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={13}
              color={
                colors.textSecondary
              }
            />

            <Text
              style={[
                styles.fechaTexto,
                {
                  color:
                    colors
                      .textSecondary,
                },
              ]}
            >
              {formatearFecha(fecha)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.metricas,
          {
            backgroundColor:
              colors.subCardBg,
          },
        ]}
      >
        <Metrica
          label="Área"
          valor={`${formatearNumero(
            areaM2,
            2,
          )} m²`}
          colors={colors}
        />

        <Separador
          colors={colors}
        />

        <Metrica
          label="Hectáreas"
          valor={`${formatearNumero(
            areaHa,
            4,
          )} ha`}
          colors={colors}
        />

        <Separador
          colors={colors}
        />

        <Metrica
          label="Sacos"
          valor={formatearNumero(
            totalSacos,
            2,
          )}
          colors={colors}
        />
      </View>

      <View
        style={styles.costoFila}
      >
        <Text
          style={[
            styles.costoLabel,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Costo total de la parcela
        </Text>

        <Text
          style={[
            styles.costoValor,
            {
              color: colors.gold,
            },
          ]}
        >
          $
          {formatearNumero(
            costoTotal,
            2,
          )}
        </Text>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={[
            styles.botonResultado,
            {
              backgroundColor:
                colors.macroBorder,
            },
          ]}
          onPress={() =>
            onVerResultado(calculo)
          }
          activeOpacity={0.82}
        >
          <MaterialCommunityIcons
            name="eye-outline"
            size={19}
            color="#ffffff"
          />

          <Text
            style={
              styles.botonResultadoTexto
            }
          >
            Ver resultado
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botonEliminar,
            {
              backgroundColor:
                colors.dangerSoft,
              borderColor:
                colors.danger,
            },
          ]}
          onPress={() =>
            onEliminar(calculo)
          }
          activeOpacity={0.82}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color={colors.danger}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EstadoVacio({
  cargando,
  colors,
  onNuevoCalculo,
}) {
  if (cargando) {
    return (
      <View style={styles.estado}>
        <ActivityIndicator
          size="large"
          color={
            colors.macroBorder
          }
        />

        <Text
          style={[
            styles.estadoTexto,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Cargando historial...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.estado}>
      <View
        style={[
          styles.estadoIcono,
          {
            backgroundColor:
              colors.macroTint,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="history"
          size={42}
          color={
            colors.macroBorder
          }
        />
      </View>

      <Text
        style={[
          styles.estadoTitulo,
          {
            color:
              colors.textPrimary,
          },
        ]}
      >
        Todavía no hay cálculos
      </Text>

      <Text
        style={[
          styles.estadoTexto,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        Realiza un cálculo y guárdalo
        con un título para verlo aquí.
      </Text>

      <TouchableOpacity
        style={[
          styles.botonNuevo,
          {
            backgroundColor:
              colors.macroBorder,
          },
        ]}
        onPress={onNuevoCalculo}
        activeOpacity={0.82}
      >
        <MaterialCommunityIcons
          name="calculator-variant-outline"
          size={19}
          color="#ffffff"
        />

        <Text
          style={
            styles.botonNuevoTexto
          }
        >
          Realizar cálculo
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HistorialCalculadoraScreen() {
  const router = useRouter();
  const insets =
    useSafeAreaInsets();

  const { isDark } = useTheme();

  const {
    usuario,
    esInvitado,
    dispositivoId,
  } = useAuth();

  const colors =
    getCalcColors(isDark);

  const [
    historial,
    setHistorial,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

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

  const volverCalculadora =
    useCallback(() => {
      router.replace(
        RUTA_CALCULADORA,
      );
    }, [router]);

  const cargarHistorial =
    useCallback(async () => {
      if (!propietarioId) {
        setHistorial([]);

        setMensajeError(
          "No se pudo identificar al usuario o dispositivo.",
        );

        setCargando(false);
        return;
      }

      setCargando(true);
      setMensajeError("");

      try {
        const registros =
          await obtenerHistorialCalculos(
            propietarioId,
          );

        setHistorial(
          Array.isArray(registros)
            ? [...registros]
            : [],
        );
      } catch (error) {
        console.error(
          "[HistorialCalculadora] Error:",
          error,
        );

        setHistorial([]);

        setMensajeError(
          "No se pudo cargar el historial.",
        );
      } finally {
        setCargando(false);
      }
    }, [propietarioId]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();

      return () => {
        setMensajeError("");
      };
    }, [cargarHistorial]),
  );

  const verResultado =
    useCallback(
      (calculo) => {
        if (!calculo?.id) {
          setMensajeError(
            "No se pudo identificar el cálculo seleccionado.",
          );
          return;
        }

        router.push({
          pathname:
            "/calculadora/detalle-historial",
          params: {
            calculoId:
              String(calculo.id),
          },
        });
      },
      [router],
    );

  const eliminarCalculo =
    useCallback(
      (calculo) => {
        if (!calculo?.id) {
          setMensajeError(
            "No se pudo identificar el cálculo.",
          );
          return;
        }

        const titulo =
          calculo.titulo ||
          "Cálculo sin título";

        Alert.alert(
          "Eliminar cálculo",
          `¿Desea eliminar "${titulo}" del historial?`,
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Eliminar",
              style: "destructive",

              onPress: async () => {
                try {
                  const respuesta =
                    await eliminarCalculoHistorial(
                      propietarioId,
                      calculo.id,
                    );

                  if (
                    !respuesta?.success
                  ) {
                    setMensajeError(
                      respuesta
                        ?.message ||
                        "No se pudo eliminar el cálculo.",
                    );

                    return;
                  }

                  setHistorial(
                    (
                      historialActual,
                    ) =>
                      historialActual.filter(
                        (item) =>
                          String(
                            item.id,
                          ) !==
                          String(
                            calculo.id,
                          ),
                      ),
                  );

                  setMensajeError("");
                } catch (error) {
                  console.error(
                    "[HistorialCalculadora] Error eliminando:",
                    error,
                  );

                  setMensajeError(
                    "No se pudo eliminar el cálculo.",
                  );
                }
              },
            },
          ],
        );
      },
      [propietarioId],
    );

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor:
            colors.bg,
        },
      ]}
    >
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
          onPress={
            volverCalculadora
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color="#ffffff"
          />
        </TouchableOpacity>

        <View
          style={styles.headerTextos}
        >
          <Text
            style={styles.headerTitulo}
          >
            Historial de cálculos
          </Text>

          <Text
            style={
              styles.headerSubtitulo
            }
          >
            {historial.length}{" "}
            {historial.length === 1
              ? "resultado guardado"
              : "resultados guardados"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actualizar}
          onPress={cargarHistorial}
          disabled={cargando}
          activeOpacity={0.8}
        >
          {cargando ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <MaterialCommunityIcons
              name="refresh"
              size={21}
              color="#ffffff"
            />
          )}
        </TouchableOpacity>
      </View>

      {!!mensajeError && (
        <View
          style={[
            styles.error,
            {
              backgroundColor:
                colors.dangerSoft,
              borderColor:
                colors.danger,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={colors.danger}
          />

          <Text
            style={[
              styles.errorTexto,
              {
                color:
                  colors.danger,
              },
            ]}
          >
            {mensajeError}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setMensajeError("")
            }
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        style={[
          styles.listaBase,
          {
            backgroundColor:
              colors.bg,
          },
        ]}
        data={historial}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <TarjetaHistorial
            calculo={item}
            onVerResultado={
              verResultado
            }
            onEliminar={
              eliminarCalculo
            }
            colors={colors}
          />
        )}
        contentContainerStyle={[
          styles.lista,
          {
            paddingBottom:
              Platform.OS === "web"
                ? 30
                : 105 +
                  insets.bottom,
          },
          historial.length === 0 &&
            styles.listaVacia,
        ]}
        ListEmptyComponent={
          <EstadoVacio
            cargando={cargando}
            colors={colors}
            onNuevoCalculo={
              volverCalculadora
            }
          />
        }
        refreshing={cargando}
        onRefresh={cargarHistorial}
        showsVerticalScrollIndicator={
          false
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    opacity: 1,
  },

  listaBase: {
    flex: 1,
    opacity: 1,
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

  actualizar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.12)",
  },

  lista: {
    padding: 14,
  },

  listaVacia: {
    flexGrow: 1,
  },

  tarjeta: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 13,
  },

  tarjetaHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  tarjetaIcono: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  tarjetaTitulos: {
    flex: 1,
  },

  tarjetaTitulo: {
    fontSize: 16,
    fontWeight: "900",
  },

  fechaFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  fechaTexto: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  metricas: {
    flexDirection: "row",
    borderRadius: 13,
    paddingVertical: 11,
    marginTop: 13,
  },

  metrica: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },

  metricaLabel: {
    fontSize: 9,
    fontWeight: "700",
  },

  metricaValor: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
  },

  separador: {
    width: 1,
  },

  costoFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginTop: 13,
  },

  costoLabel: {
    fontSize: 11,
    fontWeight: "700",
  },

  costoValor: {
    fontSize: 17,
    fontWeight: "900",
  },

  acciones: {
    flexDirection: "row",
    marginTop: 13,
  },

  botonResultado: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  botonResultadoTexto: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },

  botonEliminar: {
    width: 46,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
  },

  estado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  estadoIcono: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  estadoTitulo: {
    fontSize: 19,
    fontWeight: "900",
    marginTop: 16,
  },

  estadoTexto: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },

  botonNuevo: {
    minHeight: 46,
    borderRadius: 13,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },

  botonNuevoTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },

  error: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    marginHorizontal: 14,
    marginTop: 12,
  },

  errorTexto: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 7,
    marginRight: 7,
  },
});