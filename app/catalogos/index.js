import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import useCatalogosRelacionados from "../../components/catalogos/hooks/useCatalogosRelacionados";
import {
  DetalleRecomendaciones,
  EstadoSincronizacion,
  ListaProblemas,
  SelectorCultivo,
} from "../../components/catalogos/ui";
import { useTheme } from "../../services/ThemeContext";

const COLORES = {
  light: {
    background: "#F4F7F5",
    card: "#FFFFFF",
    primary: "#087F5B",
    primaryDark: "#056044",
    text: "#18201D",
    secondaryText: "#69736F",
    border: "#DDE5E1",
    errorBackground: "#FFF1F1",
    error: "#D14343",
  },
  dark: {
    background: "#101513",
    card: "#1A211E",
    primary: "#36C995",
    primaryDark: "#087F5B",
    text: "#F4F7F5",
    secondaryText: "#AAB5B0",
    border: "#303A36",
    errorBackground: "#351C1C",
    error: "#FF7070",
  },
};

export default function CatalogosScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = isDark ? COLORES.dark : COLORES.light;

  const {
    cultivos,
    enfermedades,
    plagas,
    recomendaciones,
    cultivoSeleccionado,
    problemaSeleccionado,
    tipoProblema,
    cargando,
    sincronizando,
    error,
    ultimaSincronizacion,
    seleccionarCultivo,
    cambiarTipoProblema,
    seleccionarProblema,
    actualizarCatalogos,
  } = useCatalogosRelacionados();

  const problemas =
    tipoProblema === "enfermedad" ? enfermedades : plagas;

  if (cargando) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          styles.centrado,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={[styles.cargandoTexto, { color: colors.secondaryText }]}>
          Cargando catálogos...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primaryDark, "#0B6B50"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.75}
          style={styles.headerButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerEyebrow}>
            INIAP · ASISTENCIA AGRÍCOLA
          </Text>

          <Text style={styles.headerTitle}>
            Consulta de catálogos
          </Text>

          <Text style={styles.headerSubtitle}>
            Cultivos, problemas y recomendaciones
          </Text>
        </View>

        <TouchableOpacity
          onPress={actualizarCatalogos}
          disabled={sincronizando}
          activeOpacity={0.75}
          style={styles.headerButton}
        >
          {sincronizando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons
              name="sync"
              size={24}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={sincronizando}
            onRefresh={actualizarCatalogos}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
      >
        <EstadoSincronizacion
          ultimaSincronizacion={ultimaSincronizacion}
          sincronizando={sincronizando}
          error={error}
          onSincronizar={actualizarCatalogos}
          isDark={isDark}
        />

        {error ? (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: colors.errorBackground,
                borderColor: colors.error,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={21}
              color={colors.error}
            />

            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: `${colors.primary}1A` },
              ]}
            >
              <MaterialCommunityIcons
                name="sprout-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.sectionTitleContainer}>
              <Text
                style={[styles.sectionTitle, { color: colors.text }]}
              >
                Seleccione un cultivo
              </Text>

              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.secondaryText },
                ]}
              >
                Elija el cultivo que desea consultar.
              </Text>
            </View>
          </View>

          <SelectorCultivo
            cultivos={cultivos}
            seleccionado={cultivoSeleccionado}
            onSeleccionar={seleccionarCultivo}
            isDark={isDark}
          />
        </View>

        {cultivoSeleccionado ? (
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: `${colors.primary}1A` },
                ]}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <View style={styles.sectionTitleContainer}>
                <Text
                  style={[styles.sectionTitle, { color: colors.text }]}
                >
                  Problemas relacionados
                </Text>

                <Text
                  style={[
                    styles.sectionDescription,
                    { color: colors.secondaryText },
                  ]}
                >
                  Consulta enfermedades o plagas del cultivo.
                </Text>
              </View>
            </View>

            <ListaProblemas
              tipo={tipoProblema}
              problemas={problemas}
              seleccionado={problemaSeleccionado}
              onCambiarTipo={cambiarTipoProblema}
              onSeleccionar={seleccionarProblema}
              isDark={isDark}
            />
          </View>
        ) : null}

        {cultivoSeleccionado && problemaSeleccionado ? (
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: `${colors.primary}1A` },
                ]}
              >
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={23}
                  color={colors.primary}
                />
              </View>

              <View style={styles.sectionTitleContainer}>
                <Text
                  style={[styles.sectionTitle, { color: colors.text }]}
                >
                  Recomendaciones
                </Text>

                <Text
                  style={[
                    styles.sectionDescription,
                    { color: colors.secondaryText },
                  ]}
                >
                  Información relacionada con el problema seleccionado.
                </Text>
              </View>
            </View>

            <DetalleRecomendaciones
              problema={problemaSeleccionado}
              tipoProblema={tipoProblema}
              recomendaciones={recomendaciones}
              isDark={isDark}
            />
          </View>
        ) : null}

        {!cultivos.length && !error ? (
          <View
            style={[
              styles.emptyContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: `${colors.primary}1A` },
              ]}
            >
              <MaterialCommunityIcons
                name="database-off-outline"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No existen catálogos locales
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                { color: colors.secondaryText },
              ]}
            >
              Sincroniza la información para descargar los catálogos en el
              dispositivo.
            </Text>

            <TouchableOpacity
              onPress={actualizarCatalogos}
              disabled={sincronizando}
              activeOpacity={0.8}
              style={[
                styles.syncButton,
                { backgroundColor: colors.primary },
              ]}
            >
              {sincronizando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="cloud-download-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text style={styles.syncButtonText}>
                    Sincronizar catálogos
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centrado: {
    alignItems: "center",
    justifyContent: "center",
  },
  cargandoTexto: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 13,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerEyebrow: {
    color: "#6EE7B7",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    marginTop: 2,
  },
  content: {
    padding: 14,
    paddingBottom: 120,
  },
  errorContainer: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginLeft: 8,
  },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 15,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 14,
  },
  sectionIcon: {
    alignItems: "center",
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  sectionTitleContainer: {
    flex: 1,
    marginLeft: 11,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  sectionDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  emptyIcon: {
    alignItems: "center",
    borderRadius: 22,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 15,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: "center",
  },
  syncButton: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    minHeight: 49,
    paddingHorizontal: 20,
  },
  syncButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },
});