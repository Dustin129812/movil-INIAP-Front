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
  FadeInUp,
  FadeOutDown,
  FadeInRight
} from 'react-native-reanimated';
import { useTheme } from '@/services/ThemeContext';

const ACTIVE_COLOR = '#10B981'; 
const TABS_COUNT = 3;
const TAB_WIDTH = 92; 
const CONTAINER_PADDING = 5;
const PILL_WIDTH = (TAB_WIDTH * TABS_COUNT) + (CONTAINER_PADDING * 2);
const SEARCH_BTN_SIZE = 60;
const SEARCH_GAP = 10;
const FAB_SIZE = 52; 

function CleanLiquidGlassTabBar({ state, navigation }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLotesActive = pathname.toLowerCase().includes('lote');
  const isSearchActive = pathname.toLowerCase().includes('explore') || pathname.toLowerCase().includes('search');
  const { isDark } = useTheme();

  const activeIndex = useSharedValue(state.index);
  const prevIndex = useSharedValue(state.index);

  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  const blurTint = isDark ? 'dark' : 'light';
  const iconActiveColor = ACTIVE_COLOR;
  const iconInactiveColor = isDark ? '#8E8E93' : '#687076';
  
  // Efecto Liquid Glass refinado
  const activeBubbleBg = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.5)';
  const glassBgColor = isDark ? 'rgba(22, 22, 28, 0.5)' : 'rgba(255, 255, 255, 0.65)';
  const glassBorderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)';

  useEffect(() => {
    const direction = state.index - prevIndex.value;
    prevIndex.value = state.index;

    scaleX.value = withTiming(1.2 + (Math.abs(direction) * 0.06), { duration: 80 }, () => {
      scaleX.value = withSpring(1, { damping: 14, stiffness: 240 });
    });
    
    scaleY.value = withTiming(0.8, { duration: 80 }, () => {
      scaleY.value = withSpring(1, { damping: 14, stiffness: 240 });
    });

    activeIndex.value = withSpring(state.index, {
      damping: 14,
      stiffness: 200,
      mass: 0.4,
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

  const screenWidth = Dimensions.get('window').width;
  
  // Ancho total del conjunto (Barra principal + Espacio + Botón de Búsqueda separado) para mantenerlo perfectamente centrado
  const totalRowWidth = PILL_WIDTH + SEARCH_GAP + SEARCH_BTN_SIZE;
  const startLeft = (screenWidth - totalRowWidth) / 2;

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      
      {/* BOTÓN FLOTANTE EN FORMA DE GOTA / BURBUJA EMERGENTE (Arriba al centro de Lotes) */}
      {isLotesActive && (
        <Animated.View 
          entering={FadeInUp.springify().damping(14.5).stiffness(190)} 
          exiting={FadeOutDown.duration(120)}
          style={[styles.fabWrapper, { left: (screenWidth / 2) - (FAB_SIZE / 2) }]}
        >
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => router.push('/lotes/nuevo')}
            style={styles.fabTouchable}
          >
            <BlurView intensity={100} tint={blurTint} style={[styles.fabGlass, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>
              <Ionicons name="add" size={26} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* CONTENEDOR EN FILA PARA LA BARRA Y EL BOTÓN DE BÚSQUEDA SEPARADO */}
      <View style={[styles.navContainerRow, { left: startLeft }]}>
        
        {/* BARRA PRINCIPAL CENTRADA */}
        <View style={[styles.mainPillContainer, { width: PILL_WIDTH }]}>
          <BlurView intensity={100} tint={blurTint} style={[styles.glassContainer, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>

            {/* BURBUJA ACTIVA */}
            <Animated.View style={[styles.activeBlobBubble, animatedIndicatorStyle, { backgroundColor: activeBubbleBg }]}>
              <View style={[styles.blobInnerGlow, { borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.85)' }]} />
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
                    <MaterialCommunityIcons name={isFocused ? 'view-grid' : 'view-grid-outline'} size={24} color={iconColor} />
                  ) : (
                    <Ionicons name={iconName} size={24} color={iconColor} />
                  )}
                  <Text style={[styles.tabLabel, { color: textColor }]}>
                    {labelText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </View>

        {/* BOTÓN DE BÚSQUEDA SEPARADO A LA DERECHA (Con animación de aparición fluida) */}
        <Animated.View 
          entering={FadeInRight.springify().damping(15).stiffness(180)}
          style={[styles.searchBtnWrapper, { marginLeft: SEARCH_GAP }]}
        >
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => router.push('/Explore')}
            style={styles.searchTouchable}
          >
            <BlurView intensity={100} tint={blurTint} style={[styles.searchGlass, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>
              <Ionicons 
                name={isSearchActive ? "search" : "search-outline"} 
                size={24} 
                color={isSearchActive ? ACTIVE_COLOR : (isDark ? '#FFFFFF' : '#1C1C1E')} 
              />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

      </View>

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
    bottom: 22,
    width: '100%',
    height: 60,
    zIndex: 999,
  },
  navContainerRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainPillContainer: {
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  glassContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    padding: CONTAINER_PADDING,
    borderWidth: 1.2,
    overflow: 'hidden',
  },
  activeBlobBubble: {
    position: 'absolute',
    top: CONTAINER_PADDING,
    bottom: CONTAINER_PADDING,
    left: CONTAINER_PADDING,
    width: TAB_WIDTH,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  blobInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
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
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 70, // Emerge en forma de gota animada justo arriba al centro de la barra
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
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
    borderWidth: 1.2,
    overflow: 'hidden',
  },
  searchBtnWrapper: {
    width: SEARCH_BTN_SIZE,
    height: SEARCH_BTN_SIZE,
    borderRadius: SEARCH_BTN_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  searchTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: SEARCH_BTN_SIZE / 2,
  },
  searchGlass: {
    flex: 1,
    borderRadius: SEARCH_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    overflow: 'hidden',
  },
});