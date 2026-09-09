import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useRouter } from 'expo-router';

const { width: W } = Dimensions.get('window');

export function EmptyStateGuide({
  type = 'lotes',
  accent = '#0b6b45',
  onPrimary,
  primaryLabel,
  primaryRoute,
  secondaryLabel,
  onSecondary,
  secondaryRoute,
  hide = false,
}) {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (hide) return null;

  const data = getEmptyStateData(type);
  const primary = primaryLabel || data.primaryLabel;
  const secondary = secondaryLabel || data.secondaryLabel;
  const icon = data.icon;
  const title = data.title;
  const description = data.description;
  const bullets = data.bullets || [];

  const handlePrimary = () => {
    if (onPrimary) return onPrimary();
    if (primaryRoute) router.push(primaryRoute);
  };
  const handleSecondary = () => {
    if (onSecondary) return onSecondary();
    if (secondaryRoute) router.push(secondaryRoute);
  };

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(22).stiffness(220)}
      style={[
        styles.wrapper,
        { backgroundColor: isDark ? 'transparent' : 'transparent' },
      ]}
    >
      <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)' }]}>
        <BlurView
          intensity={isDark ? 55 : 65}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={
            isDark
              ? ['rgba(16,185,129,0.08)', 'rgba(16,185,129,0)']
              : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.3)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.cardBorder, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

        <Animated.View entering={FadeIn.delay(60)} style={styles.iconWrap}>
          <View style={[styles.iconRing, { backgroundColor: hexToRgba(accent, 0.1) }]} />
          <View style={[styles.iconDisk, { backgroundColor: hexToRgba(accent, 0.18) }]}>
            <MaterialCommunityIcons name={icon} size={30} color={accent} />
          </View>
          <View style={[styles.sparkleA, { backgroundColor: accent }]} />
          <View style={[styles.sparkleB, { backgroundColor: accent }]} />
        </Animated.View>

        <Text style={[styles.title, { color: isDark ? '#fff' : '#111' }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: isDark ? 'rgba(255,255,255,0.72)' : '#52525B' }]}>
          {description}
        </Text>

        {bullets.length > 0 && (
          <View style={styles.bullets}>
            {bullets.map((b, i) => (
              <Animated.View
                key={i}
                entering={FadeInUp.delay(120 + i * 60)}
                style={styles.bulletRow}
              >
                <View style={[styles.bulletCheck, { backgroundColor: hexToRgba(accent, 0.14) }]}>
                  <Ionicons name="checkmark" size={12} color={accent} />
                </View>
                <Text style={[styles.bulletText, { color: isDark ? 'rgba(255,255,255,0.78)' : '#3F3F46' }]}>
                  {b}
                </Text>
              </Animated.View>
            ))}
          </View>
        )}

        <View style={styles.ctaRow}>
          <TouchableOpacity
            onPress={handlePrimary}
            activeOpacity={0.85}
            style={styles.ctaPrimary}
          >
            <LinearGradient
              colors={[accent, lightenColor(accent, 10)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.ctaPrimaryText}>{primary}</Text>
          </TouchableOpacity>
          {(secondary || onSecondary || secondaryRoute) && (
            <TouchableOpacity
              onPress={handleSecondary}
              activeOpacity={0.7}
              style={[
                styles.ctaSecondary,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}
            >
              <Text style={[styles.ctaSecondaryText, { color: isDark ? '#fff' : '#111' }]}>
                {secondary}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function getEmptyStateData(type) {
  switch (type) {
    case 'lotes':
      return {
        icon: 'map-marker-plus-outline',
        title: 'Aún no tienes lotes registrados',
        description:
          'Empieza creando tu primer lote con su croquis georreferenciado para asociarlo a tus proyectos y seguimientos.',
        primaryLabel: 'Crear mi primer lote',
        secondaryLabel: '¿Cómo funciona?',
        bullets: [
          'Dibuja vértices en el mapa o ingresa la ubicación manualmente',
          'Define provincia, cantón y estación meteorológica',
          'Asócialo a un proyecto y registra visitas técnicas',
        ],
      };
    case 'proyectos':
      return {
        icon: 'flask-outline',
        title: 'Crea tu primer proyecto',
        description:
          'Los proyectos AgroDecide te permiten organizar ensayos, lotes, colaboradores y seguimiento por etapas fenológicas.',
        primaryLabel: 'Nuevo proyecto',
        secondaryLabel: 'Ver catálogos',
        bullets: [
          'Selecciona el cultivo y variedad desde los catálogos INIAP',
          'Asigna lotes, colaboradores internos y externos',
          'Registra visitas y eventos para generar resultados',
        ],
      };
    case 'seguimiento':
      return {
        icon: 'timeline-clock-outline',
        title: 'Comienza el seguimiento por etapas',
        description:
          'Activa el seguimiento para este proyecto y registra eventos, plagas, enfermedades y recomendaciones en cada etapa.',
        primaryLabel: 'Iniciar seguimiento',
        secondaryLabel: 'Matriz biométrica',
        bullets: [
          'Línea de tiempo automática según el cultivo seleccionado',
          'Marca inicio/fin de etapa y registra observaciones',
          'Vincula recomendaciones de los catálogos INIAP',
        ],
      };
    case 'calculadora-historial':
      return {
        icon: 'calculator-variant-outline',
        title: 'Sin cálculos guardados',
        description:
          'Realiza tu primer cálculo de fertilizantes y guárdalo para volver a consultarlo o compartirlo en PDF.',
        primaryLabel: 'Abrir calculadora',
        secondaryLabel: null,
        bullets: [
          'Ingresa las dimensiones de tu parcela y nivel de nutrientes',
          'Selecciona el fertilizante adecuado del catálogo',
          'Guarda y exporta los resultados en cualquier momento',
        ],
      };
    default:
      return {
        icon: 'sprout',
        title: 'Comienza aquí',
        description: 'Registra tu primer dato para empezar a ver resultados.',
        primaryLabel: 'Empezar',
        bullets: [],
      };
  }
}

function hexToRgba(hex, alpha = 1) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenColor(hex, percent) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(h, 16);
  const r = Math.min(255, (num >> 16) + percent * 2.55);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent * 2.55);
  const b = Math.min(255, (num & 0x0000ff) + percent * 2.55);
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: W - 40,
    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 26,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  iconRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  iconDisk: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleA: {
    position: 'absolute',
    top: 4,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
    transform: [{ rotate: '45deg' }],
  },
  sparkleB: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.35,
    transform: [{ rotate: '15deg' }],
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.1,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  bullets: {
    alignSelf: 'stretch',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  bulletCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
  ctaRow: {
    marginTop: 18,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
    overflow: 'hidden',
    gap: 8,
  },
  ctaPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  ctaSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaSecondaryText: {
    fontWeight: '700',
    fontSize: 13,
  },
});
