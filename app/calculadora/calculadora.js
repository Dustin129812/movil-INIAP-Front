import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { getCalcColors } from "../../components/calculadora/colors";
import { useCalculadora } from "../../components/calculadora/hooks/useCalculadora";
import {
  DetalleCalculo,
  DimensionesParcela,
  GuardarCalculo,
  ListaFertilizantes,
  NivelNutrientes,
  ResultadosCalculo,
} from "../../components/calculadora/ui";
import { useAuth } from '../../services/auth';
import {
  guardarCalculoHistorial,
  obtenerCalculoPorId,
} from "../../services/calculadoraHistorialService";
import { useTheme } from "../../services/theme";

const PASOS = [
  {
    titulo: "Parcela",
    icono: "map-outline",
  },
  {
    titulo: "Nutrientes",
    icono: "flask-outline",
  },
  {
    titulo: "Fertilizantes",
    icono: "sack-outline",
  },
  {
    titulo: "Resultados",
    icono: "chart-box-outline",
  },
];

function NavegacionPasos({
  paso,
  setPaso,
  colors,
}) {
  return (
    <View
      style={[
        styles.pasos,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.dividerColor,
        },
      ]}
    >
      {PASOS.map((item, index) => {
        const activo = index === paso;
        const completo = index < paso;

        const fondo = activo
          ? colors.macroBorder
          : completo
            ? colors.macroTint
            : colors.inputBg;

        return (
          <TouchableOpacity
            key={item.titulo}
            style={styles.paso}
            onPress={() => setPaso(index)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.pasoIcono,
                {
                  backgroundColor: fondo,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  completo
                    ? "check"
                    : item.icono
                }
                size={18}
                color={
                  activo
                    ? "#ffffff"
                    : colors.macroBorder
                }
              />
            </View>

            <Text
              numberOfLines={1}
              style={[
                styles.pasoTexto,
                {
                  color: activo
                    ? colors.textPrimary
                    : colors.textSecondary,
                },
              ]}
            >
              {item.titulo}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function CalculadoraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const {
    calculoId,
    modo,
    paso: pasoParam,
  } = useLocalSearchParams();

  const { isDark } = useTheme();

  const {
    usuario,
    esInvitado,
    dispositivoId,
  } = useAuth();

  const colors = getCalcColors(isDark);
  const calculadora = useCalculadora();

  const [paso, setPaso] = useState(0);

  const [
    mostrarDetalle,
    setMostrarDetalle,
  ] = useState(false);

  const [
    tituloCalculo,
    setTituloCalculo,
  ] = useState("");

  const [
    guardandoCalculo,
    setGuardandoCalculo,
  ] = useState(false);

  const [
    mensajeGuardado,
    setMensajeGuardado,
  ] = useState("");

  const [
    tipoMensajeGuardado,
    setTipoMensajeGuardado,
  ] = useState("");

  const [
    calculoEditandoId,
    setCalculoEditandoId,
  ] = useState(null);

  const estaMontado = useRef(true);

  useEffect(() => {
    estaMontado.current = true;
    return () => {
      estaMontado.current = false;
    };
  }, []);

  const propietarioId = esInvitado
    ? dispositivoId
      ? `device:${dispositivoId}`
      : null
    : usuario?.ID
      ? `user:${usuario.ID}`
      : null;

  const estaEditando =
    !!calculoEditandoId;

  useEffect(() => {
    let componenteActivo = true;

    const cargarCalculoParaEditar =
      async () => {
        if (
          modo !== "editar" ||
          !calculoId ||
          !propietarioId
        ) {
          return;
        }

        try {
          const calculoGuardado =
            await obtenerCalculoPorId(
              propietarioId,
              String(calculoId),
            );

          if (
            !componenteActivo ||
            !calculoGuardado
          ) {
            return;
          }

          const respuesta =
            calculadora
              .cargarCalculoGuardado(
                calculoGuardado,
              );

          if (!respuesta.success) {
            setTipoMensajeGuardado(
              "error",
            );

            setMensajeGuardado(
              respuesta.message ||
                "No se pudo cargar el cálculo.",
            );

            return;
          }

          setCalculoEditandoId(
            String(calculoGuardado.id),
          );

          setTituloCalculo(
            calculoGuardado.titulo || "",
          );

          const pasoInicial =
            pasoParam !== undefined
              ? Math.max(0, parseInt(pasoParam, 10) - 1)
              : 0;

          setPaso(pasoInicial);
          setMostrarDetalle(false);

          setTipoMensajeGuardado(
            "success",
          );

          setMensajeGuardado(
            "Cálculo cargado. Puedes editar los valores y recalcular.",
          );
        } catch (error) {
          console.error(
            "[Calculadora] Error cargando cálculo:",
            error,
          );

          if (componenteActivo) {
            setTipoMensajeGuardado(
              "error",
            );

            setMensajeGuardado(
              "No se pudo cargar el cálculo para editar.",
            );
          }
        }
      };

    cargarCalculoParaEditar();

    return () => {
      componenteActivo = false;
    };
  }, [
    modo,
    calculoId,
    propietarioId,
    pasoParam,
  ]);

  const limpiarMensajes = () => {
    setMensajeGuardado("");
    setTipoMensajeGuardado("");
  };

  const ejecutarCalculo = () => {
    limpiarMensajes();

    const respuesta =
      calculadora.calcular();

    if (respuesta.ok) {
      setPaso(3);
      setMostrarDetalle(false);
    }
  };

  const limpiar = () => {
    calculadora.limpiarFormulario();

    setPaso(0);
    setMostrarDetalle(false);
    setTituloCalculo("");
    setCalculoEditandoId(null);
    limpiarMensajes();

    router.setParams({
      calculoId: "",
      modo: "",
      paso: "",
    });
  };

  const cambiarTitulo = (valor) => {
    setTituloCalculo(valor);

    if (mensajeGuardado) {
      limpiarMensajes();
    }
  };

  const guardarEnHistorial =
    async () => {
      const tituloLimpio =
        tituloCalculo.trim();

      if (!tituloLimpio) {
        setTipoMensajeGuardado(
          "error",
        );

        setMensajeGuardado(
          "Ingrese un título para guardar el cálculo.",
        );

        return;
      }

      if (
        !calculadora.resultadoCalculo
      ) {
        setTipoMensajeGuardado(
          "error",
        );

        setMensajeGuardado(
          "Primero debe realizar el cálculo.",
        );

        return;
      }

      if (!propietarioId) {
        setTipoMensajeGuardado(
          "error",
        );

        setMensajeGuardado(
          "No se pudo identificar al usuario o dispositivo.",
        );

        return;
      }

      setGuardandoCalculo(true);
      limpiarMensajes();

      try {
        const respuesta =
          await guardarCalculoHistorial({
            propietarioId,

            calculoId: estaEditando
              ? calculoEditandoId
              : null,

            titulo: tituloLimpio,

            datosEntrada:
              calculadora.datosEntrada,

            resultado:
              calculadora
                .resultadoCalculo,
          });

        if (!estaMontado.current) return;

        if (!respuesta.success) {
          setTipoMensajeGuardado(
            "error",
          );

          setMensajeGuardado(
            respuesta.message ||
              "No se pudo guardar el cálculo.",
          );

          return;
        }

        setTipoMensajeGuardado(
          "success",
        );

        setMensajeGuardado(
          respuesta.actualizado
            ? "El cálculo se actualizó correctamente."
            : "El cálculo se guardó correctamente.",
        );

      } catch (error) {
        console.error(
          "[Calculadora] Error guardando historial:",
          error,
        );

        if (estaMontado.current) {
          setTipoMensajeGuardado(
            "error",
          );

          setMensajeGuardado(
            "Ocurrió un error al guardar el cálculo.",
          );
        }
      } finally {
        if (estaMontado.current) {
          setGuardandoCalculo(false);
        }
      }
    };

  const abrirHistorial = () => {
    router.push(
      "/calculadora/historial",
    );
  };

  const retrocederSeguro = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safe,
        {
          backgroundColor:
            colors.dimGradientEnd,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={[
          styles.container,
          {
            backgroundColor: colors.bg,
          },
        ]}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <LinearGradient
          colors={[
            colors.dimGradientStart,
            colors.dimGradientEnd,
          ]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.back}
            onPress={retrocederSeguro}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={30}
              color="#ffffff"
            />
          </TouchableOpacity>

          <View style={styles.headerTexto}>
            <Text style={styles.eyebrow}>
              INIAP · GESTIÓN AGRÍCOLA
            </Text>

            <Text style={styles.headerTitulo}>
              Calculadora de fertilización
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerAccion}
            onPress={abrirHistorial}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="history"
              size={22}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerAccion}
            onPress={limpiar}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="broom"
              size={21}
              color="#ffffff"
            />
          </TouchableOpacity>
        </LinearGradient>

        <View
          style={[
            styles.shell,
            {
              maxWidth:
                width >= 900
                  ? 980
                  : 720,
            },
          ]}
        >
          <NavegacionPasos
            paso={paso}
            setPaso={(nuevoPaso) => {
              setPaso(nuevoPaso);
              limpiarMensajes();
            }}
            colors={colors}
          />

          <ScrollView
            style={[
              styles.scroll,
              {
                backgroundColor:
                  colors.bg,
              },
            ]}
            contentContainerStyle={
              styles.contenido
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >
            {/* Pestaña 1: Parcela */}
            {paso === 0 && (
              <DimensionesParcela
                {...calculadora}
                isDark={isDark}
              />
            )}

            {/* Pestaña 2: Nutrientes */}
            {paso === 1 && (
              <NivelNutrientes
                nivelRecomendado={
                  calculadora.nivelRecomendado
                }
                cambiarNivelRecomendado={
                  calculadora.cambiarNivelRecomendado
                }
                requerimientoEditable={
                  calculadora.requerimientos
                }
                cambiarNutriente={
                  calculadora.cambiarNutrienteManual ||
                  calculadora.cambiarRequerimiento
                }
                resultadoCalculo={
                  calculadora.resultadoCalculo
                }
                isDark={isDark}
              />
            )}

            {/* Pestaña 3: Fertilizantes */}
            {paso === 2 && (
              <ListaFertilizantes
                sacosPorHectarea={
                  calculadora.sacosPorHectarea
                }
                cambiarSacosPorHectarea={
                  calculadora.cambiarSacosPorHectarea
                }
                limpiarCantidades={
                  calculadora.limpiarCantidades
                }
                isDark={isDark}
              />
            )}

            {/* Pestaña 4: Resultados */}
            {paso === 3 && (
              <>
                {!calculadora.resultadoCalculo && (
                  <View
                    style={[
                      styles.vacio,
                      {
                        backgroundColor:
                          colors.cardBg,
                        borderColor:
                          colors.dividerColor,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="calculator-variant-outline"
                      size={38}
                      color={
                        colors.macroBorder
                      }
                    />

                    <Text
                      style={[
                        styles.vacioTitulo,
                        {
                          color:
                            colors.textPrimary,
                        },
                      ]}
                    >
                      Todo listo para calcular
                    </Text>

                    <Text
                      style={[
                        styles.vacioTexto,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      Revisa los pasos
                      anteriores y genera la
                      recomendación para tu
                      parcela.
                    </Text>
                  </View>
                )}

                <ResultadosCalculo
                  resultadoCalculo={
                    calculadora
                      .resultadoCalculo
                  }
                  isDark={isDark}
                />

                <GuardarCalculo
                  titulo={tituloCalculo}
                  setTitulo={
                    cambiarTitulo
                  }
                  onGuardar={
                    guardarEnHistorial
                  }
                  guardando={
                    guardandoCalculo
                  }
                  mensaje={
                    mensajeGuardado
                  }
                  tipoMensaje={
                    tipoMensajeGuardado
                  }
                  deshabilitado={
                    !calculadora
                      .resultadoCalculo
                  }
                  isDark={isDark}
                />

                {calculadora
                  .resultadoCalculo && (
                  <TouchableOpacity
                    style={[
                      styles.detalleBtn,
                      {
                        backgroundColor:
                          colors.cardBg,
                        borderColor:
                          colors.dividerColor,
                      },
                    ]}
                    onPress={() =>
                      setMostrarDetalle(
                        (valor) =>
                          !valor,
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={
                        mostrarDetalle
                          ? "chevron-up"
                          : "clipboard-text-outline"
                      }
                      size={20}
                      color={
                        colors.macroBorder
                      }
                    />

                    <Text
                      style={[
                        styles.detalleTexto,
                        {
                          color:
                            colors.textPrimary,
                        },
                      ]}
                    >
                      {mostrarDetalle
                        ? "Ocultar detalle"
                        : "Ver detalle por fertilizante"}
                    </Text>
                  </TouchableOpacity>
                )}

                {mostrarDetalle &&
                  calculadora
                    .resultadoCalculo && (
                    <DetalleCalculo
                      detalles={
                        calculadora
                          .resultadoCalculo
                          ?.detallePorFertilizante
                      }
                      isDark={isDark}
                    />
                  )}
              </>
            )}

            {!!calculadora
              .mensajeError && (
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
                  {
                    calculadora
                      .mensajeError
                  }
                </Text>
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor:
                  colors.cardBg,
                borderColor:
                  colors.dividerColor,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            {paso > 0 && (
              <TouchableOpacity
                style={[
                  styles.secundario,
                  {
                    borderColor:
                      colors.inputBorder,
                  },
                ]}
                onPress={() => {
                  setPaso(
                    (pasoActual) =>
                      pasoActual - 1,
                  );

                  limpiarMensajes();
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={21}
                  color={
                    colors.textPrimary
                  }
                />

                <Text
                  style={[
                    styles.secundarioTexto,
                    {
                      color:
                        colors.textPrimary,
                    },
                  ]}
                >
                  Anterior
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.primario,
                {
                  backgroundColor:
                    colors.macroBorder,
                },
              ]}
              onPress={
                paso < 2
                  ? () => {
                      setPaso(
                        (pasoActual) =>
                          pasoActual + 1,
                      );

                      limpiarMensajes();
                    }
                  : ejecutarCalculo
              }
              activeOpacity={0.82}
            >
              <Text
                style={styles.primarioTexto}
              >
                {paso < 2
                  ? "Continuar"
                  : paso === 2
                    ? "Calcular"
                    : "Recalcular"}
              </Text>

              <MaterialCommunityIcons
                name={
                  paso < 2
                    ? "chevron-right"
                    : "calculator-variant-outline"
                }
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    opacity: 1,
  },

  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTexto: {
    flex: 1,
  },

  eyebrow: {
    color: "#4ade80",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  headerTitulo: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },

  headerAccion: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
    backgroundColor:
      "rgba(255,255,255,0.12)",
  },

  shell: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },

  pasos: {
    flexDirection: "row",
    margin: 12,
    marginBottom: 0,
    padding: 8,
    borderWidth: 1,
    borderRadius: 18,
  },

  paso: {
    flex: 1,
    alignItems: "center",
  },

  pasoIcono: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  pasoTexto: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 4,
    maxWidth: "100%",
  },

  contenido: {
    padding: 12,
    paddingBottom: 24,
  },

  footer: {
    borderTopWidth: 1,
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },

  primario: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  primarioTexto: {
    color: "#ffffff",
    fontWeight: "900",
    marginRight: 5,
  },

  secundario: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secundarioTexto: {
    fontWeight: "800",
  },

  vacio: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    padding: 28,
    marginBottom: 14,
  },

  vacioTitulo: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },

  vacioTexto: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  error: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 13,
    padding: 11,
    marginTop: 12,
  },

  errorTexto: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 7,
  },

  detalleBtn: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  detalleTexto: {
    fontWeight: "900",
    marginLeft: 7,
  },
});