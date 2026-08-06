import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    withSpring,
    interpolate,
    Easing,
} from 'react-native-reanimated';

// ============================================
// CONFIGURACIÓN DE ANIMACIONES
// ============================================

export const ANIM_CONFIG = {
    // Card entrance
    cardSpring: { damping: 14, stiffness: 100 },
    cardTiming: { duration: 350 },

    // Card press
    cardPressSpring: { damping: 20, stiffness: 400 },

    // Skeleton pulse
    skeletonTiming: { duration: 700 },

    // Search bar
    getSearchTiming: () => ({ duration: 300, easing: Easing.inOut(Easing.quad) }),

    // Search interpolation
    searchTitleTranslate: [-30, 0],
    searchTitleOpacity: [1, 0],
    searchBarTranslate: [10, 0],
    searchBarMaxHeight: [0, 50],
};

// ============================================
// HOOK: Animación de tarjeta
// ============================================
export const useCardAnimations = (index) => {
    const cardScale = useSharedValue(1);
    const translateY = useSharedValue(30);
    const opacity = useSharedValue(0);

    const animateIn = () => {
        const delay = index * 50;
        translateY.value = withDelay(delay, withSpring(0, ANIM_CONFIG.cardSpring));
        opacity.value = withDelay(delay, withTiming(1, ANIM_CONFIG.cardTiming));
    };

    const handlePressIn = () => {
        cardScale.value = withSpring(0.97, ANIM_CONFIG.cardPressSpring);
    };

    const handlePressOut = () => {
        cardScale.value = withSpring(1, ANIM_CONFIG.cardPressSpring);
    };

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: cardScale.value },
        ],
        opacity: opacity.value,
    }));

    return {
        animateIn,
        handlePressIn,
        handlePressOut,
        containerAnimatedStyle,
    };
};

// ============================================
// HOOK: Animación de Skeleton
// ============================================
export const useSkeletonAnimations = () => {
    const opacity = useSharedValue(0.3);

    const startPulse = () => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 700 }),
                withTiming(0.2, { duration: 700 })
            ),
            -1,
            true
        );
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return {
        startPulse,
        animatedStyle,
    };
};

// ============================================
// HOOK: Animación de búsqueda
// ============================================
export const useSearchAnimations = () => {
    const searchProgress = useSharedValue(0);

    const toggleSearch = (isOpen) => {
        searchProgress.value = withTiming(isOpen ? 1 : 0, ANIM_CONFIG.getSearchTiming());
    };

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(searchProgress.value, [0, 1], ANIM_CONFIG.searchTitleTranslate) }],
        opacity: interpolate(searchProgress.value, [0, 1], ANIM_CONFIG.searchTitleOpacity),
    }));

    const searchBarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(searchProgress.value, [0, 1], ANIM_CONFIG.searchBarTranslate) }],
        opacity: searchProgress.value,
        maxHeight: interpolate(searchProgress.value, [0, 1], ANIM_CONFIG.searchBarMaxHeight),
    }));

    return {
        searchProgress,
        toggleSearch,
        titleAnimatedStyle,
        searchBarAnimatedStyle,
    };
};
