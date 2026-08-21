// ============================================
// TAB LAYOUT - Liquid Glass Navigation
// ============================================
// Navegacion principal con tab bar personalizado estilo Liquid Glass
// Estructura: Tabs + Custom TabBar con glass morphism

import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, TextInput, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../services/theme';
import { SearchProvider, useSearch } from '../../components/lotes/context/SearchContext';

// --- TEMA DEL TAB BAR ---
// Origen: services/theme/tabBarTheme.js
import {
  TAB_BAR_COLORS,
  TAB_BAR_DIMENSIONS,
  TAB_BAR_SPRING_CONFIG,
  getTabBarColors,
} from '../../services/theme';

// --- ESTILOS ---
// Origen: app/styles/tabBarStyles.jsH
import { tabBarStyles } from '../../src/styles/tabBarStyles';

// Desestructuracion para uso directo
const {
  TAB_WIDTH,
  CONTAINER_PADDING,
  SEARCH_BTN_SIZE,
  SEARCH_GAP,
  FAB_SIZE,
  SIDE_MARGIN,
  ICON_SIZE,
  TOTAL_TABS,
} = TAB_BAR_DIMENSIONS;

const { APPLE_SPRING, BUBBLE_SPRING, SCALE_SPRING, DRAG_SPRING } = TAB_BAR_SPRING_CONFIG;

// ============================================
// TAB BAR PERSONALIZADO - Liquid Glass
// ============================================

function CleanLiquidGlassTabBar({ state, navigation }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isLotesActive = pathname.toLowerCase().includes('lote');
  const isProyectosActive = pathname.toLowerCase().includes('proyecto');
  const { isDark } = useTheme();
  const { searchText, setSearchText } = useSearch();

  // --- ESTADO LOCAL ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  // --- VISIBILIDAD SEGUN RUTA ---
  const isTabBarVisible = !(
    pathname.includes('/lotes/nuevo') ||
    pathname.match(/^\/lotes\/[^\/]+$/) ||
    pathname.includes('/proyectos/nuevo') ||
    pathname.match(/^\/proyectos\/[^\/]+\/visita$/) ||
    pathname.match(/^\/proyectos\/[^\/]+\/matriz$/)
  );

  // --- COLORES DINAMICOS SEGUN TEMA ---
  const colors = getTabBarColors(isDark);

  // --- ANIMACIONES (shared values) ---
  const searchExpandProgress = useSharedValue(0);
  const activeIndex = useSharedValue(state.index);
  const bubbleX = useSharedValue(state.index * TAB_WIDTH);
  const isDragging = useSharedValue(false);
  const isLongPressing = useSharedValue(false);
  const bubbleScaleX = useSharedValue(1);
  const bubbleScaleY = useSharedValue(1);

  // --- EFECTOS ---
  useEffect(() => {
    bubbleX.value = withSpring(state.index * TAB_WIDTH, BUBBLE_SPRING);
    activeIndex.value = state.index;
  }, [state.index]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e) => setKeyboardHeight(e.endCoordinates.height);
    const onKeyboardHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    searchExpandProgress.value = withSpring(isSearchOpen ? 1 : 0, APPLE_SPRING);
  }, [isSearchOpen]);

  // --- HELPERS ---
  const navigateToTab = (index) => {
    const route = state.routes[index];
    if (route) {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    }
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // --- GESTURES ---
  const longPressGesture = Gesture.LongPress()
    .minDuration(180)
    .onStart(() => {
      isLongPressing.value = true;
      isDragging.value = true;
      bubbleScaleX.value = withSpring(1.18, DRAG_SPRING);
      bubbleScaleY.value = withSpring(0.88, DRAG_SPRING);
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isDragging.value) return;
      const minX = CONTAINER_PADDING;
      const maxX = CONTAINER_PADDING + (TOTAL_TABS - 1) * TAB_WIDTH;
      bubbleX.value = clamp(e.absoluteX - 40 - SIDE_MARGIN, minX, maxX);
    })
    .onEnd(() => {
      if (!isDragging.value) return;
      const rawIndex = Math.round((bubbleX.value - CONTAINER_PADDING) / TAB_WIDTH);
      const targetIndex = clamp(rawIndex, 0, TOTAL_TABS - 1);
      bubbleX.value = withSpring(targetIndex * TAB_WIDTH, BUBBLE_SPRING);
      bubbleScaleX.value = withSpring(1, SCALE_SPRING);
      bubbleScaleY.value = withSpring(1, SCALE_SPRING);
      isDragging.value = false;
      isLongPressing.value = false;
      runOnJS(navigateToTab)(targetIndex);
    })
    .onFinalize(() => {
      if (isDragging.value) {
        bubbleScaleX.value = withSpring(1, SCALE_SPRING);
        bubbleScaleY.value = withSpring(1, SCALE_SPRING);
        isDragging.value = false;
        isLongPressing.value = false;
      }
    });

  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  // --- PENDING SEARCH REF ---
  const pendingSearchOpenRef = useRef(false);

  useEffect(() => {
    if (pendingSearchOpenRef.current) {
      pendingSearchOpenRef.current = false;
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [state.index]);

  // --- ANIMATED STYLES ---
  const closingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(cerrando ? 0 : 1, { duration: 150 }),
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: bubbleX.value },
        { scaleX: bubbleScaleX.value },
        { scaleY: bubbleScaleY.value },
      ],
    };
  });

  const animatedMainPillStyle = useAnimatedStyle(() => {
    const normalWidth = (TAB_WIDTH * TOTAL_TABS) + (CONTAINER_PADDING * 2);
    const soloHomeWidth = TAB_WIDTH + (CONTAINER_PADDING * 2);

    return {
      width: interpolate(searchExpandProgress.value, [0, 1], [normalWidth, soloHomeWidth]),
    };
  });

  const animatedSearchContainerStyle = useAnimatedStyle(() => {
    const normalWidth = SEARCH_BTN_SIZE;
    const expandedWidth = screenWidth - 44 - (TAB_WIDTH + CONTAINER_PADDING * 2) - SEARCH_GAP - (SIDE_MARGIN * 2);

    return {
      width: interpolate(searchExpandProgress.value, [0, 1], [normalWidth, expandedWidth]),
    };
  });

  // --- RENDER ---
  const showFullWidthSearch = isSearchOpen || cerrando;
  const baseBottomOffset = Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 25;
  const tabBarBottom = keyboardHeight > 0 ? keyboardHeight + 16 : baseBottomOffset;

  if (!isTabBarVisible) return null;

  return (
    <View style={tabBarStyles.outerContainer}>

      {/* --- SEARCH EXPANDIDO (full width) --- */}
      {showFullWidthSearch && (
        <Animated.View
          entering={FadeInUp.springify().damping(24).stiffness(280)}
          style={[tabBarStyles.fullWidthSearchContainer, { bottom: keyboardHeight + 16 }]}
        >
          <Animated.View style={closingAnimatedStyle}>
            <BlurView
              intensity={TAB_BAR_DIMENSIONS.GLASS_INTENSITY}
              tint={colors.blurTint}
              experimentalBlurMethod="dimezisBlurView"
              style={[tabBarStyles.fullWidthSearchGlass, { backgroundColor: colors.glassBgColor, borderColor: colors.glassBorderColor }]}
            >
              <View style={tabBarStyles.fullWidthSearchInner}>
                <View style={tabBarStyles.searchIconWrapper}>
                  <Ionicons name="search" size={20} color={colors.iconActiveColor} />
                </View>
                <View style={tabBarStyles.inputContainer}>
                  <TextInput
                    style={[tabBarStyles.fullWidthSearchInput, { color: TAB_BAR_COLORS.INPUT_TEXT_COLOR }]}
                    placeholder="Buscar lote..."
                    placeholderTextColor={isDark ? TAB_BAR_COLORS.INPUT_PLACEHOLDER_DARK : TAB_BAR_COLORS.INPUT_PLACEHOLDER_LIGHT}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                    selectionColor={TAB_BAR_COLORS.ACTIVE_COLOR}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSearchText('');
                    Keyboard.dismiss();
                    setCerrando(true);
                    setTimeout(() => {
                      setIsSearchOpen(false);
                      setCerrando(false);
                    }, 200);
                  }}
                  style={tabBarStyles.closeIconBtn}
                >
                  <Ionicons name="close-circle" size={22} color={colors.iconInactiveColor} />
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </Animated.View>
      )}

      {/* --- TAB BAR WRAPPER --- */}
      <Animated.View style={[tabBarStyles.tabBarWrapper, { bottom: tabBarBottom, paddingHorizontal: SIDE_MARGIN }]}>

        {/* --- FAB (Create New) --- */}
        {(isLotesActive || pathname.toLowerCase().includes('proyecto')) && !isSearchOpen && !showFullWidthSearch && (
          <Animated.View
            entering={FadeInUp.springify().damping(18).stiffness(220)}
            exiting={FadeOutDown.springify().damping(18).stiffness(220)}
            style={tabBarStyles.fabContainer}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(isLotesActive ? '/lotes/nuevo' : '/proyectos/nuevo')}
              style={tabBarStyles.fabTouchable}
            >
              <BlurView
                intensity={TAB_BAR_DIMENSIONS.GLASS_INTENSITY + 10}
                tint={colors.blurTint}
                experimentalBlurMethod="dimezisBlurView"
                style={[tabBarStyles.fabGlass, { backgroundColor: colors.glassBgColor, borderColor: colors.glassBorderColor }]}
              >
                <Text style={[tabBarStyles.fabIcon, { color: isDark ? TAB_BAR_COLORS.FAB_ICON_COLOR_DARK : TAB_BAR_COLORS.FAB_ICON_COLOR_LIGHT }]}>+</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* --- NAV CONTENT (Pill + Search) --- */}
        {!showFullWidthSearch && (
          <View style={tabBarStyles.navContent}>

            {/* --- MAIN PILL (Glass Tabs) --- */}
            <Animated.View style={[tabBarStyles.mainPillContainer, animatedMainPillStyle]}>
              <BlurView
                intensity={TAB_BAR_DIMENSIONS.GLASS_INTENSITY}
                tint={colors.blurTint}
                experimentalBlurMethod="dimezisBlurView"
                style={[tabBarStyles.glassContainer, { backgroundColor: colors.glassBgColor, borderColor: colors.glassBorderColor }]}
              >

                {/* --- BUBBLE INDICATOR --- */}
                {!isSearchOpen && (
                  <GestureDetector gesture={composedGesture}>
                    <Animated.View
                      style={[
                        tabBarStyles.activeBlobShadowWrapper,
                        animatedIndicatorStyle,
                        isDark ? null : tabBarStyles.activeBlobShadowLight,
                      ]}
                    >
                      <View style={tabBarStyles.activeBlobBubble}>
                        <BlurView
                          intensity={TAB_BAR_DIMENSIONS.BUBBLE_INTENSITY}
                          tint={colors.activeBubbleTint}
                          experimentalBlurMethod="dimezisBlurView"
                          style={[
                            tabBarStyles.activeBlobBlur,
                            {
                              backgroundColor: colors.activeBubbleOverlay,
                              borderColor: colors.activeBubbleBorder,
                              borderWidth: colors.activeBubbleBorderWidth,
                            },
                          ]}
                        />
                      </View>
                    </Animated.View>
                  </GestureDetector>
                )}

                {/* --- TAB ITEMS --- */}
                {state.routes.map((route, index) => {
                  const isFocused = state.index === index;
                  const routeNameLower = route.name.toLowerCase();

                  if (isSearchOpen && index !== 0) return null;

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
                  let labelText = route.name;

                  if (routeNameLower === 'index' || routeNameLower === 'home') {
                    labelText = 'Home';
                    iconName = isFocused ? 'home' : 'home-outline';
                  } else if (routeNameLower.includes('lote') || routeNameLower === 'new') {
                    labelText = 'Lotes';
                    iconName = isFocused ? 'map' : 'map-outline';
                  } else if (routeNameLower.includes('proyecto')) {
                    labelText = 'Proyectos';
                    iconName = isFocused ? 'folder' : 'folder-outline';
                  } else if (routeNameLower.includes('explore')) {
                    labelText = 'Ajustes';
                    iconName = isFocused ? 'settings' : 'settings-outline';
                  }

                  const iconColor = (isFocused && !isSearchOpen) ? colors.iconActiveColor : colors.iconInactiveColor;
                  const textColor = colors.labelColor;

                  return (
                    <TouchableOpacity key={index} onPress={onPress} activeOpacity={0.6} style={tabBarStyles.tabItem}>
                      <Animated.View
                        style={[
                          { alignItems: 'center', justifyContent: 'center' },
                          { transform: [{ scale: isFocused ? 1.05 : 1 }] },
                        ]}
                      >
                        <Ionicons
                          name={iconName}
                          size={ICON_SIZE}
                          color={iconColor}
                          style={{ marginBottom: 2 }}
                        />
                        <Text style={[tabBarStyles.tabLabel, { color: textColor }]}>
                          {labelText}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </BlurView>
            </Animated.View>

            {/* --- SEARCH BUTTON --- */}
            <Animated.View style={[tabBarStyles.searchBtnWrapper, animatedSearchContainerStyle, { marginLeft: SEARCH_GAP }]}>
              <BlurView
                intensity={TAB_BAR_DIMENSIONS.GLASS_INTENSITY}
                tint={colors.blurTint}
                experimentalBlurMethod="dimezisBlurView"
                style={[tabBarStyles.searchGlass, { backgroundColor: colors.glassBgColor, borderColor: colors.glassBorderColor }]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (isLotesActive || isProyectosActive) {
                      setIsSearchOpen(true);
                    } else {
                      pendingSearchOpenRef.current = true;
                      navigation.navigate('lotes');
                    }
                  }}
                  style={tabBarStyles.searchInnerRow}
                >
                  <View style={tabBarStyles.searchBtnIconWrapper}>
                    <Ionicons
                      name={isSearchOpen ? "search" : "search-outline"}
                      size={22}
                      color={isSearchOpen ? colors.iconActiveColor : colors.iconInactiveColor}
                    />
                  </View>

                  {/* --- SEARCH INPUT (inline expand) --- */}
                  {(isSearchOpen || cerrando) && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      style={tabBarStyles.inputWrapper}
                    >
                      <Animated.View style={closingAnimatedStyle}>
                        <TextInput
                          style={[tabBarStyles.textInputStyle, { color: TAB_BAR_COLORS.INPUT_TEXT_COLOR }]}
                          placeholder="Buscar lote..."
                          placeholderTextColor={isDark ? TAB_BAR_COLORS.INPUT_PLACEHOLDER_DARK : TAB_BAR_COLORS.INPUT_PLACEHOLDER_LIGHT}
                          value={searchText}
                          onChangeText={setSearchText}
                          autoFocus
                          selectionColor={TAB_BAR_COLORS.ACTIVE_COLOR}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            setSearchText('');
                            setCerrando(true);
                            setTimeout(() => {
                              setIsSearchOpen(false);
                              setCerrando(false);
                              router.push('/');
                            }, 200);
                          }}
                          style={tabBarStyles.closeIconBtn}
                        >
                          <Ionicons name="close-circle" size={20} color={colors.iconInactiveColor} />
                        </TouchableOpacity>
                      </Animated.View>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================
// LAYOUT PRINCIPAL
// ============================================

export default function TabLayout() {
  return (
    <SafeAreaProvider>
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
          <Tabs.Screen name="proyectos" />
          <Tabs.Screen name="catalogo" />
          <Tabs.Screen name="explore" />
        </Tabs>
      </SearchProvider>
    </SafeAreaProvider>
  );
}
