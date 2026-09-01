import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useAnimatedReaction,
  withTiming,
  Easing,
} from "react-native-reanimated";

import useCatalogosRelacionados from "../../components/catalogos/hooks/useCatalogosRelacionados";
import {
  DetalleRecomendaciones,
  EstadoSincronizacion,
  ListaProblemas,
  SelectorCultivo,
} from "../../components/catalogos/ui";
import { useTheme } from "../../services/theme/ThemeContext";

const HEADER_ANIMATION = {
  TOP_REVEAL_THRESHOLD: 12,
  HIDE_DURATION: 160,
  REVEAL_DURATION: 260,
  HEADER_ROW_HEIGHT: 42,
  HEADER_ROW_MARGIN_TOP: 2,
  HEADER_BOTTOM_GAP: 12,
};

export default function CatalogosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

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
    estadoSincronizacion,
    seleccionarCultivo,
    cambiarTipoProblema,
    seleccionarProblema,
    actualizarCatalogos,
  } = useCatalogosRelacionados();

  const problemas =
    tipoProblema === "enfermedad" ? enfermedades : plagas;

  // Animación del header
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const titleOpacity = useSharedValue(1);
  const titleTranslateY = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value <= HEADER_ANIMATION.TOP_REVEAL_THRESHOLD,
    (isAtTop, wasAtTop) => {
      if (isAtTop === wasAtTop) return;
      if (isAtTop) {
        titleOpacity.value = withTiming(1, {
          duration: HEADER_ANIMATION.REVEAL_DURATION,
          easing: Easing.out(Easing.cubic),
        });
        titleTranslateY.value = withTiming(0, {
          duration: HEADER_ANIMATION.REVEAL_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        titleOpacity.value = withTiming(0, {
          duration: HEADER_ANIMATION.HIDE_DURATION,
          easing: Easing.in(Easing.cubic),
        });
        titleTranslateY.value = withTiming(-6, {
          duration: HEADER_ANIMATION.HIDE_DURATION,
          easing: Easing.in(Easing.cubic),
        });
      }
    },
    [HEADER_ANIMATION.TOP_REVEAL_THRESHOLD]
  );

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const scrollTopPadding =
    insets.top +
    HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP +
    HEADER_ANIMATION.HEADER_ROW_HEIGHT +
    HEADER_ANIMATION.HEADER_BOTTOM_GAP;

  // Colores del tema
  const colors = {
    background: isDark ? '#000000' : '#F2F2F7',
    card: isDark ? '#1E1E24' : '#FFFFFF',
    cardDark: isDark ? '#1E1E24' : '#FFFFFF',
    primary: '#34C759',
    primaryDark: '#056044',
    text: isDark ? '#FFFFFF' : '#000000',
    secondaryText: isDark ? '#98989F' : '#69736F',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'transparent',
    sectionTitle: isDark ? '#98989F' : '#8E8E93',
  };

  if (cargando) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Cargando catálogos...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Scrim de legibilidad para el status bar */}
      <LinearGradient
        pointerEvents="none"
        colors={
          isDark
            ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0)']
            : ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']
        }
        style={[styles.statusBarScrim, { height: insets.top + 40 }]}
      />

      {/* Header con título animado */}
      <View style={[styles.header, { paddingTop: insets.top + HEADER_ANIMATION.HEADER_ROW_MARGIN_TOP }]}>
        <Animated.View style={[styles.headerTopRow, titleAnimatedStyle]}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Catálogos
          </Text>
          <TouchableOpacity
            onPress={actualizarCatalogos}
            disabled={sincronizando}
            activeOpacity={0.7}
            style={styles.syncButton}
          >
            {sincronizando ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name="sync" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Contenido scrolleable */}
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingTop: scrollTopPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
        {/* Estado de sincronización */}
        <View style={styles.syncStatusContainer}>
          <EstadoSincronizacion
            estado={estadoSincronizacion}
            sincronizando={sincronizando}
            onSincronizar={actualizarCatalogos}
            isDark={isDark}
          />
        </View>

        {/* Error */}
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: isDark ? '#2C1C1C' : '#FFF1F1' }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF453A" />
            <Text style={[styles.errorText, { color: '#FF453A' }]}>{error}</Text>
          </View>
        ) : null}

        {/* Empty state - sin catálogos */}
        {!cultivos.length && !error && !cargando ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? '#1E1E24' : '#F2F2F7' }]}>
              <MaterialCommunityIcons name="database-off-outline" size={44} color={colors.secondaryText} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Sin catálogos
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.secondaryText }]}>
              Los catálogos se sincronizan automáticamente al iniciar la app.
            </Text>
            <TouchableOpacity
              onPress={actualizarCatalogos}
              disabled={sincronizando}
              style={[styles.emptySyncButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              {sincronizando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="cloud-download-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.emptySyncButtonText}>Sincronizar ahora</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Sección: Cultivos */}
        {cultivos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.1)' }]}>
                <MaterialCommunityIcons name="sprout" size={20} color={colors.primary} />
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Cultivos
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
                  Selecciona un cultivo para consultar sus problemas
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
        )}

        {/* Sección: Problemas */}
        {cultivoSeleccionado && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: isDark ? 'rgba(255,149,0,0.15)' : 'rgba(255,149,0,0.1)' }]}>
                <MaterialCommunityIcons name="bug" size={20} color="#FF9500" />
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Problemas
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
                  Enfermedades y plagas del cultivo
                </Text>
              </View>
            </View>
            <ListaProblemas
              tipo={tipoProblema}
              problemas={problemas}
              totalEnfermedades={enfermedades.length}
              totalPlagas={plagas.length}
              seleccionado={problemaSeleccionado}
              onCambiarTipo={cambiarTipoProblema}
              onSeleccionar={seleccionarProblema}
              isDark={isDark}
            />
          </View>
        )}

        {/* Sección: Recomendaciones */}
        {cultivoSeleccionado && problemaSeleccionado && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: isDark ? 'rgba(10,132,255,0.15)' : 'rgba(10,132,255,0.1)' }]}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={20} color="#0A84FF" />
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Recomendaciones
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
                  Manejo y control del problema
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
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },

  // Header
  statusBarScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  // Sync status
  syncStatusContainer: {
    marginBottom: 16,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptySyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  emptySyncButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
