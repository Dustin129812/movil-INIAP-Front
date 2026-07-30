import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, useColorScheme } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  Extrapolation,
  FadeIn,
  FadeOut,
  Layout
} from 'react-native-reanimated';

const ACTIVE_COLOR = '#9333EA';
const TAB_WIDTH = 72;
const CONTAINER_PADDING = 6;

function LiquidGlassTabBar({ state, descriptors, navigation }) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const isLotesActive = pathname.includes('Lotes') || pathname.includes('lotes');

  const currentTint = isDark ? 'dark' : 'light';
  const containerBg = isDark ? 'rgba(20, 20, 22, 0.75)' : 'rgba(255, 255, 255, 0.85)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.08)';
  const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.45)';
  const pillBg = isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.12)';
  const pillBorder = isDark ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.25)';
  const fabIconColor = isDark ? '#FFFFFF' : '#1E1E24';

  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 22,
      stiffness: 160,
      mass: 0.5,
    });
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      activeIndex.value,
      [0, 1, 2],
      [0, TAB_WIDTH, TAB_WIDTH * 2],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      {/* Contenedor central absoluto con compensación dinámica para equilibrar el FAB */}
      <View style={[styles.contentRow, isLotesActive && styles.contentRowOffset]} pointerEvents="box-none">
        
        {/* Barra de Navegación Principal */}
        <Animated.View layout={Layout.springify()} style={[styles.outerGlowContainer, isDark ? styles.shadowDark : styles.shadowLight]}>
          <BlurView 
            intensity={Platform.OS === 'ios' ? 50 : 80} 
            tint={currentTint} 
            style={[styles.glassContainer, { backgroundColor: containerBg, borderColor }]}
          >
            <View style={[styles.specularHighlight, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.8)' }]} />

            <Animated.View 
              style={[
                styles.activePillGlow, 
                { backgroundColor: pillBg, borderColor: pillBorder }, 
                animatedIndicatorStyle
              ]} 
            />

            {state.routes.map((route, index) => {
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              let iconElement = null;
              let labelText = '';
              const routeNameLower = route.name.toLowerCase();

              if (routeNameLower === 'index' || routeNameLower === 'home') {
                labelText = 'Home';
                iconElement = (
                  <Ionicons 
                    name={isFocused ? 'home' : 'home-outline'} 
                    size={20} 
                    color={isFocused ? ACTIVE_COLOR : inactiveColor} 
                  />
                );
              } else if (routeNameLower.includes('lote')) {
                labelText = 'Lotes';
                iconElement = (
                  <MaterialCommunityIcons 
                    name={isFocused ? 'map-marker-radius' : 'map-marker-radius-outline'} 
                    size={21} 
                    color={isFocused ? ACTIVE_COLOR : inactiveColor} 
                  />
                );
              } else if (routeNameLower.includes('explore') || routeNameLower.includes('explorar')) {
                labelText = 'Explore';
                iconElement = (
                  <Ionicons 
                    name={isFocused ? 'compass' : 'compass-outline'} 
                    size={20} 
                    color={isFocused ? ACTIVE_COLOR : inactiveColor} 
                  />
                );
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={onPress}
                  activeOpacity={0.7}
                  style={styles.tabItem}
                >
                  <Animated.View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                    {iconElement}
                  </Animated.View>
                  <Text style={[
                    styles.tabLabel,
                    { color: inactiveColor },
                    isFocused && styles.tabLabelActive
                  ]}>
                    {labelText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </Animated.View>

        {/* Botón flotante "+" animado */}
        {isLotesActive && (
          <Animated.View 
            entering={FadeIn.duration(350).springify()} 
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
            style={styles.fabWrapper}
          >
            <TouchableOpacity 
              style={[styles.floatingActionButton, isDark ? styles.shadowDark : styles.shadowLight]} 
              activeOpacity={0.8}
              onPress={() => router.push('/lotes/nuevo')}
            >
              <BlurView intensity={50} tint={currentTint} style={[styles.fabBlur, { backgroundColor: containerBg, borderColor }]}>
                <View style={[styles.specularHighlightFab, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.8)' }]} />
                <Ionicons name="add" size={24} color={fabIconColor} />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        )}

      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
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
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  contentRowOffset: {
    // Desplaza ligeramente a la izquierda la barra para que el conjunto (Barra + Botón FAB) quede verdaderamente centrado en pantalla
    transform: [{ translateX: -32 }],
  },
  shadowDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  shadowLight: {
    shadowColor: '#888888',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  outerGlowContainer: {
    borderRadius: 36,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    paddingHorizontal: CONTAINER_PADDING,
    paddingVertical: CONTAINER_PADDING,
    borderWidth: 1.2,
    overflow: 'hidden',
    position: 'relative',
  },
  specularHighlight: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    height: 1,
  },
  tabItem: {
    width: TAB_WIDTH,
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    gap: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  tabLabelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '700',
  },
  activePillGlow: {
    position: 'absolute',
    top: CONTAINER_PADDING,
    bottom: CONTAINER_PADDING,
    left: CONTAINER_PADDING,
    width: TAB_WIDTH,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 1,
  },
  fabWrapper: {
    marginLeft: 12,
  },
  floatingActionButton: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  fabBlur: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
  },
  specularHighlightFab: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
  },
});