import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  withDelay,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useOnboarding } from './OnboardingContext';
import { getTooltipContent } from './onboardingService';

export function ContextualTooltip(props) {
  const {
    tooltipId,
    title,
    description,
    children,
    iconName,
    accentColor,
    position = 'top',
    width = 260,
    autoShow = true,
    delay = 350,
  } = props;

  // Si la pantalla no pasa title/description/iconName/accentColor a mano,
  // se usa el contenido centralizado en onboardingService.js (TOOLTIP_CONTENT)
  // para ese tooltipId. Así cada componente de la app explica qué hace sin
  // depender de que cada pantalla repita el texto correcto.
  const defaults = tooltipId ? getTooltipContent(tooltipId) : null;
  const resolvedTitle = title ?? defaults?.title;
  const resolvedDescription = description ?? defaults?.description;
  const resolvedIconName = iconName ?? defaults?.iconName ?? 'information-circle-outline';
  const resolvedAccentColor = accentColor ?? defaults?.accentColor ?? '#0b6b45';

  const { isDark } = useTheme();
  const { shouldShowTooltip, dismissTooltip } = useOnboarding();
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    if (!autoShow || !tooltipId) return;
    (async () => {
      const ok = await shouldShowTooltip(tooltipId);
      if (ok && mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current) setVisible(true);
        }, delay);
      }
    })();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tooltipId, autoShow]);

  const handleDismiss = async () => {
    setVisible(false);
    if (tooltipId) await dismissTooltip(tooltipId);
  };

  const translateAnim = useSharedValue(position === 'top' ? -8 : 8);
  const opacityAnim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacityAnim.value = withDelay(0, withTiming(1, { duration: 220 }));
      translateAnim.value = withTiming(0, { duration: 300 });
    } else {
      opacityAnim.value = withTiming(0, { duration: 160 });
    }
  }, [visible, translateAnim, opacityAnim]);

  const animatedWrap = useAnimatedStyle(() => ({
    opacity: opacityAnim.value,
    transform: [{ translateY: translateAnim.value }],
  }));

  const renderTail = (pos) => {
    const tailColor = isDark ? '#1C1C1E' : '#FFFFFF';
    if (pos === 'top') {
      return (
        <View
          style={[
            styles.tail,
            styles.tailBottom,
            { borderTopColor: tailColor },
          ]}
        />
      );
    }
    return (
      <View
        style={[
          styles.tail,
          styles.tailTop,
          { borderBottomColor: tailColor },
        ]}
      />
    );
  };

  return (
    <View style={{ position: 'relative' }} collapsable={false}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              width,
              [position === 'top' ? 'marginBottom' : 'marginTop']: 10,
              [position === 'top' ? 'bottom' : 'top']: position === 'top' ? '100%' : '100%',
            },
            animatedWrap,
          ]}
          pointerEvents="auto"
        >
          <BlurView
            intensity={isDark ? 60 : 50}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.blurWrap,
              {
                backgroundColor: isDark ? 'rgba(28,28,30,0.9)' : 'rgba(255,255,255,0.95)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']
                  : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.6)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            <View style={styles.row}>
              <View
                style={[
                  styles.icon,
                  { backgroundColor: hexToRgba(resolvedAccentColor, 0.14) },
                ]}
              >
                <MaterialCommunityIcons name={resolvedIconName} size={18} color={resolvedAccentColor} />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                {!!resolvedTitle && (
                  <Text style={[styles.title, { color: isDark ? '#fff' : '#111' }]}>
                    {resolvedTitle}
                  </Text>
                )}
                {!!resolvedDescription && (
                  <Text style={[styles.desc, { color: isDark ? 'rgba(255,255,255,0.75)' : '#52525B' }]}>
                    {resolvedDescription}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                activeOpacity={0.65}
                onPress={handleDismiss}
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
              >
                <Ionicons name="close" size={16} color={isDark ? 'rgba(255,255,255,0.6)' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.gotItBtn,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : hexToRgba(resolvedAccentColor, 0.1),
                },
              ]}
              activeOpacity={0.7}
              onPress={handleDismiss}
            >
              <Text style={[styles.gotItText, { color: resolvedAccentColor }]}>Entendido</Text>
              <Ionicons name="checkmark-circle" size={16} color={resolvedAccentColor} />
            </TouchableOpacity>
          </BlurView>
          {renderTail(position)}
        </Animated.View>
      )}
    </View>
  );
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

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    left: 0,
    alignSelf: 'flex-start',
    zIndex: 999,
  },
  blurWrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tail: {
    position: 'absolute',
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailBottom: {
    bottom: -7,
    borderTopWidth: 8,
  },
  tailTop: {
    top: -7,
    borderBottomWidth: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
  },
  closeBtn: {
    padding: 2,
  },
  gotItBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  gotItText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
});