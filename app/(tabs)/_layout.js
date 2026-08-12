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
import { useTheme } from '@/services/ThemeContext';
import { SearchProvider, useSearch } from '@/components/lotes/context/SearchContext';

const ACTIVE_COLOR = '#10B981';
const TAB_WIDTH = 64;
const CONTAINER_PADDING = 6;
const SEARCH_BTN_SIZE = 52;
const SEARCH_GAP = 12;
const FAB_SIZE = 52;
const SIDE_MARGIN = 20;
const ICON_SIZE = 24;
const TOTAL_TABS = 4;
const APPLE_SPRING = { damping: 24, stiffness: 280, mass: 0.8 };
const BUBBLE_SPRING = { damping: 16, stiffness: 180, mass: 0.7 };

function CleanLiquidGlassTabBar({ state, navigation }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isLotesActive = pathname.toLowerCase().includes('lote');
  const isProyectosActive = pathname.toLowerCase().includes('proyecto');
  const { isDark } = useTheme();
  const { searchText, setSearchText } = useSearch();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  const isTabBarVisible = !(
    pathname.includes('/lotes/nuevo') ||
    pathname.match(/^\/lotes\/[^\/]+$/) ||
    pathname.includes('/proyectos/nuevo') ||
    pathname.match(/^\/proyectos\/[^\/]+\/visita$/) ||
    pathname.match(/^\/proyectos\/[^\/]+\/matriz$/)
  );

  const searchExpandProgress = useSharedValue(0);
  const activeIndex = useSharedValue(state.index);
  const bubbleX = useSharedValue(state.index * TAB_WIDTH);
  const isDragging = useSharedValue(false);
  const isLongPressing = useSharedValue(false);
  const bubbleScaleX = useSharedValue(1);
  const bubbleScaleY = useSharedValue(1);
  const blurTint = isDark ? 'dark' : 'light';
  const iconActiveColor = ACTIVE_COLOR;
  const iconInactiveColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)';
  const labelColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
  const glassBgColor = isDark ? 'rgba(30, 30, 32, 0.25)' : 'rgba(255, 255, 255, 0.32)';
  const glassBorderColor = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.35)';
  const activeBubbleTint = isDark ? 'dark' : 'light';
  const activeBubbleOverlay = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.30)';
  const activeBubbleBorder = isDark ? 'transparent' : 'rgba(255, 255, 255, 0.4)';
  const activeBubbleBorderWidth = isDark ? 0 : 0.5;
  const glassIntensity = 65;
  const bubbleIntensity = 85;
  useEffect(() => {
    bubbleX.value = withSpring(state.index * TAB_WIDTH, BUBBLE_SPRING);
    activeIndex.value = state.index;
  }, [state.index]);
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
  const longPressGesture = Gesture.LongPress()
    .minDuration(180)
    .onStart(() => {
      isLongPressing.value = true;
      isDragging.value = true;
      bubbleScaleX.value = withSpring(1.18, { damping: 12, stiffness: 200 });
      bubbleScaleY.value = withSpring(0.88, { damping: 12, stiffness: 200 });
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
      bubbleScaleX.value = withSpring(1, { damping: 14, stiffness: 180 });
      bubbleScaleY.value = withSpring(1, { damping: 14, stiffness: 180 });
      isDragging.value = false;
      isLongPressing.value = false;
      runOnJS(navigateToTab)(targetIndex);
    })
    .onFinalize(() => {
      if (isDragging.value) {
        bubbleScaleX.value = withSpring(1, { damping: 14, stiffness: 180 });
        bubbleScaleY.value = withSpring(1, { damping: 14, stiffness: 180 });
        isDragging.value = false;
        isLongPressing.value = false;
      }
    });

  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

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

  const closingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(cerrando ? 0 : 1, { duration: 150 }),
  }));

  const showFullWidthSearch = isSearchOpen || cerrando;

  const pendingSearchOpenRef = useRef(false);

  useEffect(() => {
    if (pendingSearchOpenRef.current) {
      pendingSearchOpenRef.current = false;
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [state.index]);

  useEffect(() => {
    searchExpandProgress.value = withSpring(isSearchOpen ? 1 : 0, APPLE_SPRING);
  }, [isSearchOpen]);

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

  const baseBottomOffset = Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 25;
  const tabBarBottom = keyboardHeight > 0 ? keyboardHeight + 16 : baseBottomOffset;

  if (!isTabBarVisible) return null;

  return (
    <View style={styles.outerContainer}>
      {showFullWidthSearch && (
        <Animated.View
          entering={FadeInUp.springify().damping(24).stiffness(280)}
          style={[styles.fullWidthSearchContainer, { bottom: keyboardHeight + 16 }]}
        >
          <Animated.View style={closingAnimatedStyle}>
            <BlurView intensity={glassIntensity} tint={blurTint} experimentalBlurMethod="dimezisBlurView" style={[styles.fullWidthSearchGlass, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>
              <View style={styles.fullWidthSearchInner}>
                <View style={styles.searchIconWrapper}>
                  <Ionicons name="search" size={20} color={iconActiveColor} />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.fullWidthSearchInput, { color: '#FFFFFF' }]}
                    placeholder="Buscar lote..."
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                    selectionColor={ACTIVE_COLOR}
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
                  style={styles.closeIconBtn}
                >
                  <Ionicons name="close-circle" size={22} color={iconInactiveColor} />
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        </Animated.View>
      )}

      <Animated.View style={[
        styles.tabBarWrapper,
        {
          bottom: tabBarBottom,
          paddingHorizontal: SIDE_MARGIN,
        }
      ]}>
        {(isLotesActive || pathname.toLowerCase().includes('proyecto')) && !isSearchOpen && !showFullWidthSearch && (
          <Animated.View
            entering={FadeInUp.springify().damping(18).stiffness(220)}
            exiting={FadeOutDown.springify().damping(18).stiffness(220)}
            style={styles.fabContainer}
          >
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(isLotesActive ? '/lotes/nuevo' : '/proyectos/nuevo')} style={styles.fabTouchable}>
              <BlurView intensity={glassIntensity + 10} tint={blurTint} experimentalBlurMethod="dimezisBlurView" style={[styles.fabGlass, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>
                <Text style={styles.fabIconWhite}>+</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        )}

        {!showFullWidthSearch && (
          <View style={styles.navContent}>
            <Animated.View style={[styles.mainPillContainer, animatedMainPillStyle]}>
              <BlurView intensity={glassIntensity} tint={blurTint} experimentalBlurMethod="dimezisBlurView" style={[styles.glassContainer, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>

                {!isSearchOpen && (
                  <GestureDetector gesture={composedGesture}>
                    <Animated.View style={[styles.activeBlobShadowWrapper, animatedIndicatorStyle, isDark ? null : styles.activeBlobShadowLight]}>
                      <View style={styles.activeBlobBubble}>
                        <BlurView
                          intensity={bubbleIntensity}
                          tint={activeBubbleTint}
                          experimentalBlurMethod="dimezisBlurView"
                          style={[
                            styles.activeBlobBlur,
                            { backgroundColor: activeBubbleOverlay, borderColor: activeBubbleBorder, borderWidth: activeBubbleBorderWidth },
                          ]}
                        />
                      </View>
                    </Animated.View>
                  </GestureDetector>
                )}

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

                  const iconColor = (isFocused && !isSearchOpen) ? iconActiveColor : iconInactiveColor;
                  const textColor = labelColor;

                  return (
                    <TouchableOpacity key={index} onPress={onPress} activeOpacity={0.6} style={styles.tabItem}>
                      <Animated.View
                        style={[
                          { alignItems: 'center', justifyContent: 'center' },
                          { transform: [{ scale: isFocused ? 1.05 : 1 }] }
                        ]}
                      >
                        <Ionicons
                          name={iconName}
                          size={ICON_SIZE}
                          color={iconColor}
                          style={{ marginBottom: 2 }}
                        />
                        <Text style={[styles.tabLabel, { color: textColor }]}>
                          {labelText}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </BlurView>
            </Animated.View>

            <Animated.View style={[styles.searchBtnWrapper, animatedSearchContainerStyle, { marginLeft: SEARCH_GAP }]}>
              <BlurView intensity={glassIntensity} tint={blurTint} experimentalBlurMethod="dimezisBlurView" style={[styles.searchGlass, { backgroundColor: glassBgColor, borderColor: glassBorderColor }]}>
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
                  style={styles.searchInnerRow}
                >
                  <View style={styles.searchBtnIconWrapper}>
                    <Ionicons
                      name={isSearchOpen ? "search" : "search-outline"}
                      size={22}
                      color={isSearchOpen ? iconActiveColor : iconInactiveColor}
                    />
                  </View>

                  {(isSearchOpen || cerrando) && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      style={styles.inputWrapper}
                    >
                      <Animated.View style={closingAnimatedStyle}>
                        <TextInput
                          style={[styles.textInputStyle, { color: '#FFFFFF' }]}
                          placeholder="Buscar lote..."
                          placeholderTextColor="rgba(255,255,255,0.7)"
                          value={searchText}
                          onChangeText={setSearchText}
                          autoFocus
                          selectionColor={ACTIVE_COLOR}
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
                          style={styles.closeIconBtn}
                        >
                          <Ionicons name="close-circle" size={20} color={iconInactiveColor} />
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
          <Tabs.Screen name="explore" />
        </Tabs>
      </SearchProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  tabBarWrapper: {
    position: 'absolute',
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPillContainer: {
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  glassContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 32,
    padding: CONTAINER_PADDING,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  activeBlobShadowWrapper: {
    position: 'absolute',
    top: CONTAINER_PADDING,
    bottom: CONTAINER_PADDING,
    left: CONTAINER_PADDING,
    width: TAB_WIDTH,
    borderRadius: 28,
  },
  activeBlobShadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  activeBlobBubble: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  activeBlobBlur: {
    flex: 1,
    borderRadius: 28,
  },
  tabItem: {
    width: TAB_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 76,
    alignSelf: 'center',
    width: FAB_SIZE,
    height: FAB_SIZE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
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
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  fabIconWhite: {
    fontSize: 30,
    fontWeight: '300',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  searchBtnWrapper: {
    height: SEARCH_BTN_SIZE,
    borderRadius: SEARCH_BTN_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  searchGlass: {
    width: '100%',
    height: '100%',
    borderRadius: SEARCH_BTN_SIZE / 2,
    borderWidth: 0.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInnerRow: {
    width: '100%',
    height: SEARCH_BTN_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  textInputStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 0,
  },
  closeIconBtn: {
    padding: 6,
  },
  searchBtnIconWrapper: {
    width: SEARCH_BTN_SIZE,
    height: SEARCH_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconWrapper: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthSearchContainer: {
    position: 'absolute',
    alignSelf: 'center',
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  fullWidthSearchGlass: {
    borderRadius: 24,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  fullWidthSearchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
  inputContainer: {
    flex: 1,
  },
  fullWidthSearchInput: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 0,
  },
});
