import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useTheme } from '@/services/ThemeContext';

const { width } = Dimensions.get('window');
const ACTIVE_COLOR = '#10B981'; // Color verde de referencia
const TABS_COUNT = 3;
const TAB_WIDTH = 76;
const CONTAINER_PADDING = 5;
const PILL_WIDTH = (TAB_WIDTH * TABS_COUNT) + (CONTAINER_PADDING * 2);
const PILL_HALF = PILL_WIDTH / 2;
const FAB_GAP = 12; 
const FAB_SIZE = 56; 

function CleanLiquidGlassTabBar({ state, navigation }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLotesActive = pathname.includes('Lotes') || pathname.includes('lotes');
  const { isDark } = useTheme();

  const activeIndex = useSharedValue(state.index);
  const prevIndex = useSharedValue(state.index);

  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  const blurTint = isDark ? 'dark' : 'light';
  const iconActiveColor = ACTIVE_COLOR;
  const iconInactiveColor = isDark ? '#8E8E93' : '#687076';
  
  // Estilo Apple Liquid Glass: Altísima transparencia base, reflejo de luz sutil en la burbuja
  const activeBubbleBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)';
  const glassBgColor = isDark ? 'rgba(20, 20, 22, 0.15)' : 'rgba(255, 255, 255, 0.12)';
  const glassBorderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.35)';

  useEffect(() => {
    const direction = state.index - prevIndex.value;
    prevIndex.value = state.index;

    scaleX.value = withTiming(1.18 + (Math.abs(direction) * 0.06), { duration: 90 }, () => {
      scaleX.value = withSpring(1, { damping: 14, stiffness: 220 });
    });
    
    scaleY.value = withTiming(0.85, { duration: 90 }, () => {
      scaleY.value = withSpring(1, { damping: 14, stiffness: 220 });
    });

    activeIndex.value = withSpring(state.index, {
      damping: 14,
      stiffness: 180,
      mass: 0.5,
    });
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: activeIndex.value * TAB_WIDTH },
        { scaleX: scaleX.value },
        { scaleY: scaleY.value },
      ],
    };
  });

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      
      {/* BARRA PRINCIPAL */}
      <View style={styles.mainPillContainer}>
        <BlurView intensity={60} tint={blurTint} style={[styles.glassContainer, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>

          {/* BURBUJA ACTIVA */}
          <Animated.View style={[styles.activeBlobBubble, animatedIndicatorStyle, { backgroundColor: activeBubbleBg }]}>
            <View style={[styles.blobInnerGlow, { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.5)' }]} />
          </Animated.View>

          {/* ICONOS Y TEXTOS */}
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            let iconName = 'home';
            let labelText = route.name;
            const routeNameLower = route.name.toLowerCase();

            if (routeNameLower === 'index' || routeNameLower === 'home') {
              labelText = 'Home';
              iconName = isFocused ? 'home' : 'home-outline';
            } else if (routeNameLower.includes('lote') || routeNameLower === 'new') {
              labelText = 'Lotes';
              iconName = isFocused ? 'grid' : 'grid-outline';
            } else {
              labelText = 'Ajustes';
              iconName = isFocused ? 'settings' : 'settings-outline';
            }

            const iconColor = isFocused ? iconActiveColor : iconInactiveColor;
            const textColor = isFocused ? iconActiveColor : iconInactiveColor;

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                activeOpacity={0.7}
                style={styles.tabItem}
              >
                {routeNameLower.includes('lote') ? (
                  <MaterialCommunityIcons name={isFocused ? 'view-grid' : 'view-grid-outline'} size={21} color={iconColor} />
                ) : (
                  <Ionicons name={iconName} size={21} color={iconColor} />
                )}
                <Text style={[styles.tabLabel, { color: textColor }]}>
                  {labelText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>

      {/* BOTÓN FLOTANTE (+) */}
      {isLotesActive && (
        <Animated.View 
          entering={FadeIn.springify().damping(16).stiffness(150)} 
          exiting={FadeOut.duration(120)}
          style={styles.fabWrapper}
        >
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={() => router.push('/lotes/nuevo')}
            style={styles.fabTouchable}
          >
            <BlurView intensity={60} tint={blurTint} style={[styles.fabGlass, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>
              <Ionicons name="add" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      )}

    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CleanLiquidGlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="Lotes" />
      <Tabs.Screen name="Explore" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    zIndex: 999,
  },
  mainPillContainer: {
    width: PILL_WIDTH,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'absolute',
    left: (width / 2) - PILL_HALF,
  },
  glassContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    padding: CONTAINER_PADDING,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activeBlobBubble: {
    position: 'absolute',
    top: CONTAINER_PADDING,
    bottom: CONTAINER_PADDING,
    left: CONTAINER_PADDING,
    width: TAB_WIDTH,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 1,
  },
  blobInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
  },
  tabItem: {
    width: TAB_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  fabWrapper: {
    position: 'absolute',
    left: (width / 2) + PILL_HALF + FAB_GAP,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: FAB_SIZE / 2,
  },
  fabGlass: {
    flex: 1,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
});