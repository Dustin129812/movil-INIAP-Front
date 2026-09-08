import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,

  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useOnboarding } from './OnboardingContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'welcome',
    eyebrow: 'Bienvenido a AgroDecide',
    title: 'Gestión agrícola\nen tu bolsillo',
    description:
      'Administra tus lotes, proyectos experimentales y seguimientos de cultivo con una app creada para técnicos e investigadores del agro ecuatoriano.',
    accent: ['#0b6b45', '#10B981'],
    icon: 'sprout',
    iconBg: ['#D1FAE5', '#A7F3D0'],
    mockup: 'lotes',
  },
  {
    key: 'lotes',
    eyebrow: 'Tus terrenos',
    title: 'Mapea tus lotes\ncon precisión',
    description:
      'Dibuja croquis en el mapa, define vértices y registra provincia, cantón y estación. Cada lote queda geo-referenciado y listo para proyectos.',
    accent: ['#1D4ED8', '#60A5FA'],
    icon: 'map-marker-multiple',
    iconBg: ['#DBEAFE', '#BFDBFE'],
    mockup: 'mapa',
  },
  {
    key: 'proyectos',
    eyebrow: 'Investigación',
    title: 'Proyectos\nAgroDecide',
    description:
      'Crea proyectos experimentales, asocia lotes y colaboradores. Registra variedades, fechas de siembra, diseños y estados en tiempo real.',
    accent: ['#7C3AED', '#A78BFA'],
    icon: 'flask-outline',
    iconBg: ['#EDE9FE', '#DDD6FE'],
    mockup: 'proyectos',
  },
  {
    key: 'seguimiento',
    eyebrow: 'Seguimiento',
    title: 'Etapas, eventos\ny resultados',
    description:
      'Línea de tiempo por etapa fenológica. Registra visitas, eventos de plagas/enfermedades, recomendaciones y consulta la matriz biométrica. Toda la data se sincroniza con el servidor.',
    accent: ['#B45309', '#F59E0B'],
    icon: 'timeline-clock-outline',
    iconBg: ['#FEF3C7', '#FDE68A'],
    mockup: 'timeline',
  },
  {
    key: 'resultados',
    eyebrow: 'Resultados',
    title: 'Decide con datos\nreales',
    description:
      'Consultas por catálogos, calculadora de fertilizantes, infografías y reportes sincronizados. Tus proyectos evolucionan con información respaldada por INIAP.',
    accent: ['#047857', '#34D399'],
    icon: 'chart-timeline-variant',
    iconBg: ['#D1FAE5', '#6EE7B7'],
    mockup: 'resultados',
  },
];

function LoteMockup() {
  return (
    <View style={mockupStyles.frame}>
      <View style={mockupStyles.screen}>
        <View style={mockupStyles.mapBg}>
          <View style={mockupStyles.polygon} />
          <View style={mockupStyles.pin1} />
          <View style={mockupStyles.pin2} />
          <View style={mockupStyles.pin3} />
          <View style={mockupStyles.legend}>
            <Text style={mockupStyles.legendText}>Lote "San Pedro"</Text>
            <Text style={mockupStyles.legendSub}>0.84 Ha · 5 vértices</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ProyectosMockup() {
  return (
    <View style={mockupStyles.frame}>
      <View style={mockupStyles.screen}>
        <View style={mockupStyles.projectCard}>
          <View style={mockupStyles.projectBadge}>
            <Text style={mockupStyles.projectBadgeText}>Activo</Text>
          </View>
          <Text style={mockupStyles.projectTitle}>Maíz INIAP-503</Text>
          <Text style={mockupStyles.projectMeta}>Variedad: Criollo · 2 lotes</Text>
          <View style={mockupStyles.projectProgress}>
            <View style={mockupStyles.projectProgressFill} />
          </View>
          <Text style={mockupStyles.projectProgressText}>62% completado</Text>
        </View>
        <View style={[mockupStyles.projectCard, mockupStyles.projectCard2]}>
          <Text style={mockupStyles.projectTitle}>Frijol Rojo INIAP-411</Text>
          <Text style={mockupStyles.projectMeta}>Siembra: 2026-08-10</Text>
        </View>
      </View>
    </View>
  );
}

function TimelineMockup() {
  return (
    <View style={mockupStyles.frame}>
      <View style={mockupStyles.screen}>
        <View style={mockupStyles.timelineLine} />
        <View style={mockupStyles.timelineItem}>
          <View style={[mockupStyles.timelineDot, { backgroundColor: '#10B981' }]} />
          <View style={mockupStyles.timelineCard}>
            <Text style={mockupStyles.timelineTitle}>Germinación</Text>
            <Text style={mockupStyles.timelineSub}>Eventos: 3 · Completado</Text>
          </View>
        </View>
        <View style={mockupStyles.timelineItem}>
          <View style={[mockupStyles.timelineDot, { backgroundColor: '#F59E0B' }]} />
          <View style={mockupStyles.timelineCard}>
            <Text style={mockupStyles.timelineTitle}>Desarrollo vegetativo</Text>
            <Text style={mockupStyles.timelineSub}>En progreso</Text>
          </View>
        </View>
        <View style={mockupStyles.timelineItem}>
          <View style={[mockupStyles.timelineDot, { backgroundColor: '#9CA3AF' }]} />
          <View style={[mockupStyles.timelineCard, { opacity: 0.6 }]}>
            <Text style={mockupStyles.timelineTitle}>Floración</Text>
            <Text style={mockupStyles.timelineSub}>Próxima</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ResultadosMockup() {
  return (
    <View style={mockupStyles.frame}>
      <View style={mockupStyles.screen}>
        <View style={mockupStyles.resultBar}>
          <Text style={mockupStyles.resultLabel}>Rendimiento</Text>
          <Text style={mockupStyles.resultValue}>8.2 t/Ha</Text>
          <View style={mockupStyles.resultBarFillGreen}>
            <View style={mockupStyles.resultBarGreenInner} />
          </View>
        </View>
        <View style={mockupStyles.resultBar}>
          <Text style={mockupStyles.resultLabel}>Planta/m²</Text>
          <Text style={mockupStyles.resultValue}>72.4k</Text>
          <View style={mockupStyles.resultBarFillAmber}>
            <View style={mockupStyles.resultBarAmberInner} />
          </View>
        </View>
        <View style={mockupStyles.resultBadgeRow}>
          <View style={mockupStyles.resultBadge1}>
            <MaterialCommunityIcons name="check-circle-outline" size={14} color="#059669" />
            <Text style={mockupStyles.resultBadge1Text}>Sincronizado</Text>
          </View>
          <View style={mockupStyles.resultBadge2}>
            <Text style={mockupStyles.resultBadge2Text}>PDF</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MapaMockup() {
  return (
    <View style={mockupStyles.frame}>
      <View style={mockupStyles.screen}>
        <View style={mockupStyles.mapGrid}>
          {Array.from({ length: 6 }).map((_, r) => (
            <View key={r} style={{ flexDirection: 'row' }}>
              {Array.from({ length: 8 }).map((__, c) => (
                <View
                  key={c}
                  style={[
                    mockupStyles.gridCell,
                    {
                      backgroundColor:
                        (r + c) % 5 === 0
                          ? '#C7E6C1'
                          : (r + c) % 3 === 0
                            ? '#D4E5AF'
                            : '#E2EAC0',
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={mockupStyles.crosshairH} />
        <View style={mockupStyles.crosshairV} />
        <View style={mockupStyles.fabMap}>
          <Ionicons name="add" size={22} color="#FFF" />
        </View>
      </View>
    </View>
  );
}

function Mockup({ type }) {
  switch (type) {
    case 'lotes':
      return <LoteMockup />;
    case 'proyectos':
      return <ProyectosMockup />;
    case 'timeline':
      return <TimelineMockup />;
    case 'resultados':
      return <ResultadosMockup />;
    case 'mapa':
      return <MapaMockup />;
    default:
      return <LoteMockup />;
  }
}

const DEFAULT_SLIDE_ACCENT = ['#0b6b45', '#10B981'];
const DEFAULT_SLIDE_ICON_BG = ['#D1FAE5', '#A7F3D0'];

function Slide({ slide, index, scrollX }) {
  const { isDark } = useTheme();
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translate = interpolate(scrollX.value, inputRange, [SCREEN_WIDTH * 0.18, 0, -SCREEN_WIDTH * 0.18]);
    const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateX: translate }, { scale }],
    };
  });

  if (!slide) return null;
  const iconBg = slide.iconBg && slide.iconBg.length ? slide.iconBg : DEFAULT_SLIDE_ICON_BG;
  const accent = slide.accent && slide.accent.length ? slide.accent : DEFAULT_SLIDE_ACCENT;

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]} pointerEvents="none">
      <Animated.View style={[styles.slideInner, animatedStyle]}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : iconBg[0] },
          ]}
        >
          <LinearGradient
            colors={iconBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons name={slide.icon || 'sprout'} size={36} color={accent[0]} />
          </LinearGradient>
        </View>

        <Text style={[styles.eyebrow, { color: accent[0] }]}>
          {(slide.eyebrow || '').toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#111' }]}>
          {slide.title}
        </Text>
        <Text style={[styles.description, { color: isDark ? 'rgba(255,255,255,0.72)' : '#3F3F46' }]}>
          {slide.description}
        </Text>

        <View style={styles.mockupContainer}>
          <Mockup type={slide.mockup} />
        </View>
      </Animated.View>
    </View>
  );
}

function Pagination({ scrollX, currentIndex }) {
  const { isDark } = useTheme();
  return (
    <View style={styles.paginationWrap}>
      {SLIDES.map((_, i) => {
        const animated = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
          const width = interpolate(scrollX.value, inputRange, [8, 26, 8], Extrapolation.CLAMP);
          const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
          return { width, opacity };
        });
        const isActive = i === currentIndex;
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: isActive
                  ? isDark
                    ? '#10B981'
                    : '#0b6b45'
                  : isDark
                    ? 'rgba(255,255,255,0.28)'
                    : 'rgba(0,0,0,0.16)',
              },
              animated,
            ]}
          />
        );
      })}
    </View>
  );
}

export default function OnboardingWalkthrough() {
  const { isDark } = useTheme();
  const { walkthroughVisible, completeWalkthrough, skipWalkthrough, initializing } = useOnboarding();
  const insets = useSafeAreaInsets();
  const scrollX = useSharedValue(0);
  const flatRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      const idx = Math.round(e.contentOffset.x / SCREEN_WIDTH);
      runOnJS(setCurrentIndex)(idx);
    },
  });

  const goToIndex = (idx) => {
    if (!flatRef.current) return;
    flatRef.current.scrollToOffset({ offset: idx * SCREEN_WIDTH, animated: true });
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goToIndex(currentIndex + 1);
    } else {
      completeWalkthrough();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    }
  };

  if (!walkthroughVisible || initializing) return null;

  const isLast = currentIndex === SLIDES.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: isDark ? '#000' : '#F2F2F7' },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Se eliminaron bgDecorTop y bgDecorBottom */}

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={[styles.brandLogo, { backgroundColor: isDark ? 'rgba(16,185,129,0.14)' : '#E8F5EC' }]}>
              <Image
                source={require('../../assets/images/INIAP.png')}
                style={styles.brandLogoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.brandName, { color: isDark ? '#fff' : '#111' }]}>AgroDecide</Text>
          </View>
          <TouchableOpacity
            style={[styles.skipBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
            onPress={skipWalkthrough}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: isDark ? 'rgba(255,255,255,0.75)' : '#3F3F46' }]}>
              Saltar
            </Text>
            <Ionicons name="arrow-forward" size={14} color={isDark ? 'rgba(255,255,255,0.55)' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => <Slide slide={item} index={index} scrollX={scrollX} />}
        style={{ flex: 1 }}
      />

      <View style={[styles.bottomWrap, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pagination scrollX={scrollX} currentIndex={currentIndex} />

        <View style={styles.actions}>
          {!isFirst && (
            <TouchableOpacity style={styles.backBtn} onPress={handlePrev} activeOpacity={0.75}>
              <Ionicons name="chevron-back" size={22} color={isDark ? '#fff' : '#111'} />
              <Text style={[styles.backText, { color: isDark ? '#fff' : '#111' }]}>Atrás</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              {
                backgroundColor: isLast
                  ? 'transparent'
                  : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : '#111',
                borderWidth: isLast ? 0 : 0,
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isLast ? ['#0b6b45', '#10B981'] : ['#111827', '#111827']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <BlurView
                intensity={isDark ? 35 : 0}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={[styles.ctaText, { color: isLast ? '#fff' : '#fff' }]}>
                {isLast ? 'Comenzar' : 'Siguiente'}
              </Text>
              {isLast ? (
                <Ionicons name="sparkles" size={18} color="#FDE68A" style={{ marginLeft: 8 }} />
              ) : (
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const mockupStyles = StyleSheet.create({
  frame: {
    width: 260,
    height: 220,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  screen: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 12,
    position: 'relative',
  },
  mapBg: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#EAF7E1',
    position: 'relative',
    overflow: 'hidden',
  },
  polygon: {
    position: 'absolute',
    width: 140,
    height: 100,
    top: 30,
    left: 45,
    backgroundColor: 'rgba(11, 107, 69, 0.22)',
    borderWidth: 2,
    borderColor: '#0b6b45',
    transform: [{ skewX: '-10deg' }, { rotate: '-6deg' }],
    borderRadius: 8,
  },
  pin1: {
    position: 'absolute',
    top: 20,
    left: 50,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  pin2: {
    position: 'absolute',
    top: 90,
    left: 50,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  pin3: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 8,
  },
  legendText: { fontSize: 12, fontWeight: '700', color: '#0b6b45' },
  legendSub: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  projectCard: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    position: 'relative',
  },
  projectCard2: { marginTop: 10 },
  projectBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  projectBadgeText: { fontSize: 10, color: '#059669', fontWeight: '700' },
  projectTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  projectMeta: { fontSize: 11, color: '#6B7280', marginTop: 3 },
  projectProgress: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
    overflow: 'hidden',
  },
  projectProgressFill: {
    width: '62%',
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 999,
  },
  projectProgressText: {
    fontSize: 10,
    color: '#059669',
    marginTop: 4,
    fontWeight: '700',
  },
  timelineLine: {
    position: 'absolute',
    left: 16,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingLeft: 6,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
  },
  timelineTitle: { fontSize: 12, fontWeight: '800', color: '#111' },
  timelineSub: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  resultBar: {
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    marginTop: 2,
  },
  resultBarFillGreen: {
    height: 8,
    width: '100%',
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    marginTop: 8,
    overflow: 'hidden',
  },
  resultBarGreenInner: { width: '86%', height: '100%', backgroundColor: '#10B981', borderRadius: 999 },
  resultBarFillAmber: {
    height: 8,
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    marginTop: 8,
    overflow: 'hidden',
  },
  resultBarAmberInner: { width: '64%', height: '100%', backgroundColor: '#F59E0B', borderRadius: 999 },
  resultBadgeRow: { flexDirection: 'row', marginTop: 10 },
  resultBadge1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  resultBadge1Text: { fontSize: 10, fontWeight: '700', color: '#059669', marginLeft: 4 },
  resultBadge2: {
    marginLeft: 8,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  resultBadge2Text: { color: '#fff', fontSize: 10, fontWeight: '800' },
  mapGrid: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  gridCell: {
    width: 28,
    height: 28,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  crosshairH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(11, 107, 69, 0.6)',
  },
  crosshairV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(11, 107, 69, 0.6)',
  },
  fabMap: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0b6b45',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    overflow: 'hidden',
  },
  safe: { flex: 0 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogoImg: { width: 28, height: 28 },
  brandName: {
    marginLeft: 10,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  skipText: { fontSize: 13, fontWeight: '600', marginRight: 4 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  slideInner: {
    width: SCREEN_WIDTH - 48,
    alignItems: 'center',
    alignSelf: 'center',
  },
  iconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
    paddingHorizontal: 20,
  },
  description: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  mockupContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
  },
  bottomWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  paginationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginBottom: 18,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  backText: { marginLeft: 4, fontWeight: '600' },
  ctaBtn: {
    borderRadius: 999,
    overflow: 'hidden',
    minWidth: 160,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});