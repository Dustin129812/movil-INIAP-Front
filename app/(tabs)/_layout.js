import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, TextInput } from 'react-native';
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
  FadeIn,
  FadeOut,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/services/ThemeContext';
import { SearchProvider, useSearch } from '@/components/lotes/context/SearchContext';

const ACTIVE_COLOR = '#10B981'; 
const TAB_WIDTH = 92; 
const CONTAINER_PADDING = 5;
const SEARCH_BTN_SIZE = 60;
const SEARCH_GAP = 10;
const FAB_SIZE = 52; 

function CleanLiquidGlassTabBar({ state, navigation }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLotesActive = pathname.toLowerCase().includes('lote');
  const { isDark } = useTheme();
  const { searchText, setSearchText } = useSearch();

  // Estado local independiente para saber si el input de búsqueda está abierto o cerrado manualmente
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const searchExpandProgress = useSharedValue(0);

  const activeIndex = useSharedValue(state.index);
  const prevIndex = useSharedValue(state.index);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  const blurTint = isDark ? 'dark' : 'light';
  const iconActiveColor = ACTIVE_COLOR;
  const iconInactiveColor = isDark ? '#8E8E93' : '#687076';
  
  const activeBubbleBg = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.5)';
  const glassBgColor = isDark ? 'rgba(22, 22, 28, 0.5)' : 'rgba(255, 255, 255, 0.65)';
  const glassBorderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)';

  // Si el usuario navega a otra pestaña, cerramos el buscador automáticamente
  useEffect(() => {
    setIsSearchOpen(false);
  }, [state.index]);

  useEffect(() => {
    searchExpandProgress.value = withTiming(isSearchOpen ? 1 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [isSearchOpen]);

  useEffect(() => {
    const direction = state.index - prevIndex.value;
    prevIndex.value = state.index;

    scaleX.value = withTiming(1.1 + (Math.abs(direction) * 0.04), { duration: 80 }, () => {
      scaleX.value = withSpring(1, { damping: 18, stiffness: 300 });
    });
    
    scaleY.value = withTiming(0.9, { duration: 80 }, () => {
      scaleY.value = withSpring(1, { damping: 18, stiffness: 300 });
    });

    activeIndex.value = withSpring(state.index, {
      damping: 20,
      stiffness: 250,
      mass: 0.3,
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

  const animatedMainPillStyle = useAnimatedStyle(() => {
    const normalWidth = (TAB_WIDTH * 3) + (CONTAINER_PADDING * 2);
    const soloHomeWidth = TAB_WIDTH + (CONTAINER_PADDING * 2);
    
    const currentWidth = interpolate(
      searchExpandProgress.value,
      [0, 1],
      [normalWidth, soloHomeWidth]
    );

    return {
      width: currentWidth,
    };
  });

  const animatedSearchContainerStyle = useAnimatedStyle(() => {
    const normalWidth = SEARCH_BTN_SIZE;
    const expandedWidth = screenWidth - 44 - (TAB_WIDTH + CONTAINER_PADDING * 2) - SEARCH_GAP;
    
    const currentWidth = interpolate(
      searchExpandProgress.value,
      [0, 1],
      [normalWidth, expandedWidth]
    );

    return {
      width: currentWidth,
    };
  });

  const normalTotalRowWidth = ((TAB_WIDTH * 3) + (CONTAINER_PADDING * 2)) + SEARCH_GAP + SEARCH_BTN_SIZE;
  const startLeft = (screenWidth - normalTotalRowWidth) / 2;

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      
      {isLotesActive && !isSearchOpen && (
        <Animated.View 
          entering={FadeInUp.springify().damping(16).stiffness(200)} 
          exiting={FadeOutDown.duration(150)}
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

      <View style={[styles.navContainerRow, { left: startLeft }]}>
        
        {/* BARRA PRINCIPAL */}
        <Animated.View style={[styles.mainPillContainer, animatedMainPillStyle]}>
          <BlurView intensity={100} tint={blurTint} style={[styles.glassContainer, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>

            {!isSearchOpen && (
              <Animated.View style={[styles.activeBlobBubble, animatedIndicatorStyle, { backgroundColor: activeBubbleBg }]}>
                <View style={[styles.blobInnerGlow, { borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.85)' }]} />
              </Animated.View>
            )}

            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const routeNameLower = route.name.toLowerCase();
              
              // Si la búsqueda está abierta, ocultamos las pestañas secundarias para dejar solo Home
              if (isSearchOpen && index !== 0) {
                return null;
              }

              const onPress = () => {
                if (isSearchOpen) {
                  setIsSearchOpen(false);
                  router.push('/');
                  return;
                }
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              let iconName = 'home';
              let iconLibrary = 'ionicons';
              let labelText = route.name;

              if (routeNameLower === 'index' || routeNameLower === 'home') {
                labelText = 'Home';
                iconName = isFocused ? 'home' : 'home-outline';
              } else if (routeNameLower.includes('lote') || routeNameLower === 'new') {
                labelText = 'Lotes';
                iconName = isFocused ? 'view-grid' : 'view-grid-outline';
                iconLibrary = 'material';
              } else if (routeNameLower.includes('calculadora')) {
                labelText = 'Calcular';
                iconName = isFocused ? 'calculator-variant' : 'calculator-variant-outline';
                iconLibrary = 'material';
              } else {
                labelText = 'Ajustes';
                iconName = isFocused ? 'settings' : 'settings-outline';
              }

              const iconColor = (isFocused && !isSearchOpen) ? iconActiveColor : iconInactiveColor;
              const textColor = (isFocused && !isSearchOpen) ? iconActiveColor : iconInactiveColor;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={onPress}
                  activeOpacity={0.7}
                  style={styles.tabItem}
                >
                  {iconLibrary === 'material' ? (
                    <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
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
        </Animated.View>

        {/* BOTÓN / INPUT DE BÚSQUEDA */}
        <Animated.View 
          style={[styles.searchBtnWrapper, animatedSearchContainerStyle, { marginLeft: SEARCH_GAP }]}
        >
          <BlurView intensity={100} tint={blurTint} style={[styles.searchGlass, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsSearchOpen(true);
                if (!isLotesActive) {
                  navigation.navigate('lotes');
                }
              }}
              style={styles.searchInnerRow}
            >
              <Ionicons 
                name={isSearchOpen ? "search" : "search-outline"} 
                size={22} 
                color={isSearchOpen ? ACTIVE_COLOR : (isDark ? '#FFFFFF' : '#1C1C1E')} 
              />

              {isSearchOpen && (
                <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInputStyle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}
                    placeholder="Buscar..."
                    placeholderTextColor={isDark ? '#8E8E93' : '#687076'}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSearchText('');
                      setIsSearchOpen(false);
                      router.push('/');
                    }}
                    style={styles.closeIconBtn}
                  >
                    <Ionicons name="close-circle" size={18} color={isDark ? '#8E8E93' : '#687076'} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

      </View>

    </View>
  );
}

export default function TabLayout() {
  return (
    <SearchProvider>
      <Tabs
        tabBar={(props) => <CleanLiquidGlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarSceneStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="lotes" />
        <Tabs.Screen name="calculadora" />
      </Tabs>
    </SearchProvider>
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
    overflow: 'hidden',
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
    bottom: 70,
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
    height: SEARCH_BTN_SIZE,
    borderRadius: SEARCH_BTN_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  searchGlass: {
    flex: 1,
    borderRadius: SEARCH_BTN_SIZE / 2,
    borderWidth: 1.2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  searchInnerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  textInputStyle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  closeIconBtn: {
    padding: 4,
  },
});
