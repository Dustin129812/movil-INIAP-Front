import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Dimensions,
  findNodeHandle,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Mask, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

function measureNode(nodeHandle) {
  return new Promise((resolve, reject) => {
    if (!nodeHandle) {
      reject(new Error('Invalid node'));
      return;
    }
    UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
      if (x === undefined && width === 0 && height === 0) {
        reject(new Error('Measurement failed'));
        return;
      }
      resolve({ x, y, width, height });
    });
  });
}

export const FeatureSpotlight = forwardRef(function FeatureSpotlight(props, ref) {
  const {
    title,
    description,
    children,
    targetRef,
    anchor = 'auto',
    accentColor = '#0b6b45',
    spotlightShape = 'rounded',
    spotlightPadding = 14,
    onDismiss,
    showClose = true,
    buttons,
    pulse = true,
    nextLabel,
    prevLabel,
    onNext,
    onPrev,
    currentStep,
    totalSteps,
    isVisible,
    onSkip,
    skipLabel = 'Saltar',
    dismissOnBackdrop = false,
  } = props;

  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [target, setTarget] = useState(null);
  const [rendered, setRendered] = useState(false);
  const wrapRef = useRef(null);
  const progress = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    show: async () => {
      try {
        const resolvedRef = targetRef || wrapRef;
        const handle = findNodeHandle(resolvedRef.current || resolvedRef);
        const m = await measureNode(handle);
        setTarget(m);
        setRendered(true);
        if (Platform.OS === 'web') {
          Keyboard.dismiss && Keyboard.dismiss();
        }
      } catch (e) {
        setTarget({ x: W / 2 - 60, y: H / 2 - 60, width: 120, height: 120, centered: true });
        setRendered(true);
      }
    },
    hide: () => {
      setRendered(false);
      setTarget(null);
    },
    getHandle: () => wrapRef.current,
  }));

  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => {
        ref?.current?.show?.();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isVisible, ref]);

  useEffect(() => {
    if (rendered) {
      progress.value = withTiming(1, { duration: 350 });
    } else {
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [rendered, progress]);

  const { cx, cy, r, rx, ry, overlayOpacity } = useMemo(() => {
    if (!target) {
      return { cx: W / 2, cy: H / 2, r: 60, rx: 60, ry: 60, overlayOpacity: 0 };
    }
    const pad = spotlightPadding;
    const cx = target.x + target.width / 2;
    const cy = target.y + target.height / 2;
    const r = Math.max(target.width, target.height) / 2 + pad;
    const rx = target.width / 2 + pad;
    const ry = target.height / 2 + pad;
    return { cx, cy, r, rx, ry, overlayOpacity: rendered ? 1 : 0 };
  }, [target, rendered, spotlightPadding]);

  const resolvedAnchor = useMemo(() => {
    if (anchor !== 'auto') return anchor;
    if (!target) return 'bottom';
    const spaceBelow = H - (target.y + target.height);
    const spaceAbove = target.y;
    return spaceBelow >= 240 ? 'bottom' : 'top';
  }, [anchor, target]);

  // Espacio mínimo garantizado entre el borde del "cutout" (halo resaltado)
  // y la tarjeta del mensaje, para que jamás se dibujen encimados.
  const CARD_GAP = 18;
  const CARD_MIN_HEIGHT = 200;

  const contentOffset = useMemo(() => {
    if (!target) return { top: undefined, bottom: undefined };
    const padTop = 28 + (insets.top || 0);
    const padBottom = 40 + (insets.bottom || 0);
    const spotlightBottom = cy + ry; // borde inferior real del halo
    const spotlightTop = cy - ry;    // borde superior real del halo

    if (resolvedAnchor === 'bottom') {
      const proposedTop = spotlightBottom + CARD_GAP;
      const maxTop = H - CARD_MIN_HEIGHT - padBottom;
      return { top: Math.max(padTop, Math.min(proposedTop, maxTop)) };
    }

    const proposedBottom = H - spotlightTop + CARD_GAP;
    const maxBottom = H - padTop - CARD_MIN_HEIGHT;
    return { bottom: Math.max(padBottom, Math.min(proposedBottom, maxBottom)) };
  }, [target, resolvedAnchor, cy, ry, insets]);

  if (!children) {
    return (
      <View ref={wrapRef} collapsable={false}>
        {rendered && (
          <OverlayContent
            isDark={isDark}
            accentColor={accentColor}
            title={title}
            description={description}
            cx={cx}
            cy={cy}
            r={r}
            rx={rx}
            ry={ry}
            spotlightShape={spotlightShape}
            overlayOpacity={overlayOpacity}
            contentOffset={contentOffset}
            resolvedAnchor={resolvedAnchor}
            target={target}
            onDismiss={onDismiss}
            showClose={showClose}
            buttons={buttons}
            nextLabel={nextLabel}
            prevLabel={prevLabel}
            onNext={onNext}
            onPrev={onPrev}
            currentStep={currentStep}
            totalSteps={totalSteps}
            pulse={pulse}
            onSkip={onSkip}
            skipLabel={skipLabel}
            dismissOnBackdrop={dismissOnBackdrop}
          />
        )}
      </View>
    );
  }

  return (
    <View ref={wrapRef} collapsable={false}>
      {children}
      {rendered && (
        <OverlayContent
          isDark={isDark}
          accentColor={accentColor}
          title={title}
          description={description}
          cx={cx}
          cy={cy}
          r={r}
          rx={rx}
          ry={ry}
          spotlightShape={spotlightShape}
          overlayOpacity={overlayOpacity}
          contentOffset={contentOffset}
          resolvedAnchor={resolvedAnchor}
          target={target}
          onDismiss={onDismiss}
          showClose={showClose}
          buttons={buttons}
          nextLabel={nextLabel}
          prevLabel={prevLabel}
          onNext={onNext}
          onPrev={onPrev}
          currentStep={currentStep}
          totalSteps={totalSteps}
          pulse={pulse}
          onSkip={onSkip}
          skipLabel={skipLabel}
          dismissOnBackdrop={dismissOnBackdrop}
        />
      )}
    </View>
  );
});

function OverlayContent(props) {
  const {
    isDark,
    accentColor,
    title,
    description,
    cx,
    cy,
    r,
    rx,
    ry,
    spotlightShape,
    overlayOpacity,
    contentOffset,
    resolvedAnchor,
    onDismiss,
    showClose,
    buttons,
    nextLabel,
    prevLabel,
    onNext,
    onPrev,
    currentStep,
    totalSteps,
    pulse,
    onSkip,
    skipLabel,
    dismissOnBackdrop,
  } = props;

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.55);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!pulse) {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      return;
    }

    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 950, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 950, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Limpieza: cancela la animación al desmontar u ocultar,
    // evitando que el worklet siga corriendo indefinidamente.
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
    };
  }, [pulse, pulseScale, pulseOpacity]);

  const pulseAnimated = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(overlayOpacity, { duration: 280 }),
  }));

  const tooltipX = Math.min(Math.max(cx - 155, 16), W - 310 - 16);
  // Posición horizontal de la flecha DENTRO de la tarjeta (0..310),
  // siempre apuntando hacia el centro real del elemento resaltado (cx),
  // incluso cuando la tarjeta tuvo que desplazarse por estar cerca del borde.
  const tailLeft = Math.min(Math.max(cx - tooltipX - 9, 20), 310 - 20 - 18);

  const handleBackdrop = () => {
    if (dismissOnBackdrop && onDismiss) onDismiss();
  };

  const hasNav = typeof currentStep === 'number' && typeof totalSteps === 'number' && totalSteps > 1;
  const isLastStep = hasNav && currentStep === totalSteps - 1;
  const isFirstStep = hasNav && currentStep === 0;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => dismissOnBackdrop && onDismiss && onDismiss()}
    >
    <Animated.View
      pointerEvents="auto"
      style={[StyleSheet.absoluteFill, { zIndex: 9998 }, overlayStyle]}
    >
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {/* Capa base: cristal esmerilado (liquid glass) cubriendo TODA la pantalla */}
        <BlurView
          intensity={isDark ? 48 : 42}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? 'rgba(10,10,14,0.62)' : 'rgba(60,64,72,0.32)' },
          ]}
        />

        <Svg width={W} height={H} pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Halo con degradado radial: el centro del target queda 100% visible
                y se atenúa suavemente hacia el borde, en vez de un corte duro. */}
            <RadialGradient id="softEdge" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#000" stopOpacity="1" />
              <Stop offset="72%" stopColor="#000" stopOpacity="1" />
              <Stop offset="100%" stopColor="#000" stopOpacity="0" />
            </RadialGradient>
            <Mask id="cutMask">
              <Rect width={W} height={H} fill="#fff" />
              {spotlightShape === 'circle' ? (
                <Circle cx={cx} cy={cy} r={r * 1.35} fill="url(#softEdge)" />
              ) : (
                <Rect
                  x={cx - rx * 1.18}
                  y={cy - ry * 1.32}
                  width={rx * 2.36}
                  height={ry * 2.64}
                  rx={Math.min(rx, ry) * 0.5}
                  ry={Math.min(rx, ry) * 0.5}
                  fill="url(#softEdge)"
                />
              )}
            </Mask>
          </Defs>
          <Rect
            width={W}
            height={H}
            fill={isDark ? 'rgba(6,8,10,0.78)' : 'rgba(24,28,36,0.6)'}
            mask="url(#cutMask)"
          />
        </Svg>

        {pulse && spotlightShape === 'circle' && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: cx - r,
                top: cy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                borderWidth: 2.5,
                borderColor: accentColor,
              },
              pulseAnimated,
            ]}
          />
        )}
        {pulse && spotlightShape === 'rounded' && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: cx - rx,
                top: cy - ry,
                width: rx * 2,
                height: ry * 2,
                borderRadius: Math.min(rx, ry) * 0.4,
                borderWidth: 2.5,
                borderColor: accentColor,
              },
              pulseAnimated,
            ]}
          />
        )}
      </View>

      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={handleBackdrop}
      />

      {onSkip && hasNav && !isLastStep && (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            // Math.max con un piso fijo (24) evita que el botón quede pegado
            // al notch/status bar en dispositivos donde insets.top llega en 0
            // (p. ej. algunos Android antes de que se resuelvan los insets
            // reales), y el +22 le da aire adicional aun cuando el inset sí
            // es correcto.
            paddingTop: Math.max(insets.top, 24) + 22,
            paddingHorizontal: 20,
            alignItems: 'flex-end',
            zIndex: 1,
          }}
        >
          <TouchableOpacity
            onPress={onSkip}
            activeOpacity={0.75}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 0 }}
          >
            <BlurView
              intensity={isDark ? 40 : 55}
              tint={isDark ? 'dark' : 'light'}
              style={styles.skipGlass}
            >
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)' },
                ]}
              />
              <Text style={[styles.skipText, { color: isDark ? '#fff' : '#111' }]}>
                {skipLabel}
              </Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      )}

      <View
        pointerEvents="box-none"
        style={[
          {
            position: 'absolute',
            width: 310,
            left: tooltipX,
            top: contentOffset.top !== undefined ? contentOffset.top : undefined,
            bottom: contentOffset.bottom !== undefined ? contentOffset.bottom : undefined,
          },
        ]}
      >
        <Animated.View
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(180)}
        >
          {resolvedAnchor === 'bottom' && (
            <View
              pointerEvents="none"
              style={[
                styles.tail,
                styles.tailUp,
                { left: tailLeft, borderBottomColor: isDark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.95)' },
              ]}
            />
          )}
          <BlurView
            intensity={isDark ? 55 : 70}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.tooltipGlassWrap,
              {
                borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.55)',
              },
            ]}
          >
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: isDark ? 'rgba(28,28,30,0.65)' : 'rgba(255,255,255,0.65)' },
              ]}
            />
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)']
                  : ['rgba(255,255,255,1)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.15)']
              }
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <View
              style={[
                styles.tooltipGlassBorder,
                { borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)' },
              ]}
            />
            <View
              style={[
                styles.tooltipSpecular,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.95)' },
              ]}
            />

            <View style={styles.tooltipInner}>
              {showClose && (
                <TouchableOpacity
                  style={styles.tooltipClose}
                  activeOpacity={0.7}
                  onPress={() => onDismiss && onDismiss()}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={isDark ? 'rgba(255,255,255,0.7)' : '#8E8E93'} />
                </TouchableOpacity>
              )}

              <View style={styles.tooltipIconRow}>
                <View
                  style={[
                    styles.tooltipIcon,
                    { backgroundColor: hexToRgba(accentColor, 0.14) },
                  ]}
                >
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={accentColor} />
                </View>
                {hasNav && (
                  <View style={styles.tooltipSteps}>
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.tooltipStepDot,
                          {
                            width: i === currentStep ? 18 : 6,
                            backgroundColor:
                              i === currentStep
                                ? accentColor
                                : isDark
                                ? 'rgba(255,255,255,0.18)'
                                : 'rgba(0,0,0,0.14)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>

              <Text style={[styles.tooltipTitle, { color: isDark ? '#fff' : '#111' }]}>
                {title}
              </Text>
              <Text style={[styles.tooltipDesc, { color: isDark ? 'rgba(255,255,255,0.78)' : '#4B5563' }]}>
                {description}
              </Text>

              <View style={styles.tooltipActions}>
                {!isFirstStep && typeof prevLabel === 'string' && onPrev && (
                  <TouchableOpacity
                    style={[
                      styles.tooltipBtnGhost,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                    ]}
                    onPress={onPrev}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="chevron-back" size={16} color={isDark ? '#fff' : '#111'} />
                    <Text style={[styles.tooltipBtnGhostText, { color: isDark ? '#fff' : '#111' }]}>
                      {prevLabel}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                {typeof nextLabel === 'string' && onNext && (
                  <TouchableOpacity
                    style={[styles.tooltipBtnPrimary, { backgroundColor: accentColor }]}
                    onPress={onNext}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.tooltipBtnPrimaryText}>
                      {isLastStep && onDismiss ? 'Finalizar' : nextLabel}
                    </Text>
                    <Ionicons
                      name={isLastStep ? 'checkmark' : 'chevron-forward'}
                      size={16}
                      color="#fff"
                    />
                  </TouchableOpacity>
                )}
                {!nextLabel && !buttons && (
                  <TouchableOpacity
                    style={[styles.tooltipBtnPrimary, { backgroundColor: accentColor }]}
                    onPress={() => onDismiss && onDismiss()}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.tooltipBtnPrimaryText}>Entendido</Text>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>

              {buttons && <View style={styles.customButtons}>{buttons}</View>}
            </View>
          </BlurView>
          {resolvedAnchor === 'top' && (
            <View
              pointerEvents="none"
              style={[
                styles.tail,
                styles.tailDown,
                { left: tailLeft, borderTopColor: isDark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.95)' },
              ]}
            />
          )}
        </Animated.View>
      </View>
    </Animated.View>
    </Modal>
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
  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    zIndex: 3,
  },
  tailUp: {
    top: -8,
    borderBottomWidth: 9,
  },
  tailDown: {
    bottom: -8,
    borderTopWidth: 9,
  },
  tooltipGlassWrap: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  tooltipGlassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
  },
  tooltipSpecular: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    borderRadius: 1,
    opacity: 0.7,
  },
  tooltipInner: {
    padding: 18,
  },
  tooltipClose: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tooltipIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tooltipIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipSteps: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  tooltipStepDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  tooltipTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.15,
    marginBottom: 6,
  },
  tooltipDesc: {
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  tooltipActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  tooltipBtnGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tooltipBtnGhostText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
  },
  tooltipBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 4,
  },
  tooltipBtnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  customButtons: { marginTop: 10 },
  skipGlass: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  skipText: {
    fontWeight: '700',
    fontSize: 13,
  },
});