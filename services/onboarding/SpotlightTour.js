import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import { FeatureSpotlight } from './FeatureSpotlight';
import { getTooltipContent } from './onboardingService';

const TOURS_SEEN_KEY = '@iniap_spotlight_tours_seen_v1';

async function isTourSeen(tourKey) {
  try {
    const raw = await AsyncStorage.getItem(TOURS_SEEN_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return !!map[tourKey];
  } catch {
    return false;
  }
}

async function markTourSeen(tourKey) {
  try {
    const raw = await AsyncStorage.getItem(TOURS_SEEN_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[tourKey] = true;
    await AsyncStorage.setItem(TOURS_SEEN_KEY, JSON.stringify(map));
  } catch {
    // silent
  }
}

export async function resetAllSpotlightTours() {
  try {
    await AsyncStorage.removeItem(TOURS_SEEN_KEY);
  } catch {
    // silent
  }
}

const SpotlightTourContext = createContext(undefined);

export function SpotlightTourProvider({ children }) {
  const [seenTours, setSeenTours] = useState({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(TOURS_SEEN_KEY);
        if (alive) setSeenTours(raw ? JSON.parse(raw) : {});
      } catch {
        // ignore
      } finally {
        if (alive) setInitialized(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const hasSeenTour = useCallback(
    (tourKey) => !!seenTours[tourKey],
    [seenTours]
  );

  const markSeen = useCallback(async (tourKey) => {
    setSeenTours((prev) => ({ ...prev, [tourKey]: true }));
    await markTourSeen(tourKey);
  }, []);

  const resetAll = useCallback(async () => {
    setSeenTours({});
    await resetAllSpotlightTours();
  }, []);

  const value = useMemo(
    () => ({ initialized, hasSeenTour, markSeen, resetAll }),
    [initialized, hasSeenTour, markSeen, resetAll]
  );

  return (
    <SpotlightTourContext.Provider value={value}>
      {children}
    </SpotlightTourContext.Provider>
  );
}

export function useSpotlightTour() {
  const ctx = useContext(SpotlightTourContext);
  if (!ctx) {
    return {
      initialized: true,
      hasSeenTour: () => false,
      markSeen: async () => {},
      resetAll: async () => {},
    };
  }
  return ctx;
}

export const SpotlightTarget = forwardRef(function SpotlightTarget(props, ref) {
  const { children, style, ...rest } = props;
  return (
    <View ref={ref} collapsable={false} style={style} {...rest}>
      {children}
    </View>
  );
});

function registerRef(spotlightRefs, key, ref) {
  if (spotlightRefs && spotlightRefs.current) {
    spotlightRefs.current[key] = ref;
  }
}

export const SpotlightTour = forwardRef(function SpotlightTour(props, ref) {
  const {
    tourKey,
    steps = [],
    autoStart = true,
    startDelay = 700,
    nextLabel = 'Siguiente',
    prevLabel = 'Atrás',
    skipLabel = 'Saltar tour',
    onComplete,
    onSkip,
    enabled = true,
    spotlightRefs,
  } = props;

  const { initialized, hasSeenTour, markSeen } = useSpotlightTour();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showing, setShowing] = useState(false);
  const localStepRefs = useRef({});
  const resolvedRefs = spotlightRefs || localStepRefs;
  const internalSpotlightRefs = useRef({});

  const totalSteps = steps.length;
  const currentStep = currentIndex >= 0 ? steps[currentIndex] : null;

  useImperativeHandle(ref, () => ({
    start: () => {
      setCurrentIndex(0);
      setShowing(true);
    },
    goTo: (idx) => {
      if (idx >= 0 && idx < totalSteps) {
        setCurrentIndex(idx);
        if (!showing) setShowing(true);
      }
    },
    stop: () => {
      setShowing(false);
      setCurrentIndex(-1);
    },
  }));

  const markTourDone = useCallback(async () => {
    Object.values(internalSpotlightRefs.current).forEach((r) => r?.current?.hide?.());
    setShowing(false);
    setCurrentIndex(-1);
    if (tourKey) {
      await markSeen(tourKey);
    }
    onComplete && onComplete();
  }, [tourKey, markSeen, onComplete]);

  const handleSkip = useCallback(async () => {
    Object.values(internalSpotlightRefs.current).forEach((r) => r?.current?.hide?.());
    setShowing(false);
    setCurrentIndex(-1);
    if (tourKey) {
      await markSeen(tourKey);
    }
    onSkip && onSkip();
  }, [tourKey, markSeen, onSkip]);

  const showStep = useCallback(
    (idx) => {
      if (idx < 0 || idx >= totalSteps) return;
      setCurrentIndex(idx);
      const step = steps[idx];
      const componentRef = internalSpotlightRefs.current[step?.key];
      setTimeout(() => {
        componentRef?.current?.show?.();
      }, 80);
    },
    [steps, totalSteps]
  );

  const handleNext = useCallback(() => {
    const step = steps[currentIndex];
    const componentRef = internalSpotlightRefs.current[step?.key];
    componentRef?.current?.hide?.();
    const next = currentIndex + 1;
    if (next >= totalSteps) {
      markTourDone();
      return;
    }
    setTimeout(() => showStep(next), 60);
  }, [steps, currentIndex, totalSteps, markTourDone, showStep]);

  const handlePrev = useCallback(() => {
    const step = steps[currentIndex];
    const componentRef = internalSpotlightRefs.current[step?.key];
    componentRef?.current?.hide?.();
    const prev = currentIndex - 1;
    if (prev >= 0) {
      setTimeout(() => showStep(prev), 60);
    }
  }, [steps, currentIndex, showStep]);

  useEffect(() => {
    if (!enabled) return;
    if (!initialized) return;
    if (tourKey && hasSeenTour(tourKey)) return;
    if (!autoStart) return;
    if (showing) return;
    if (currentIndex >= 0) return;

    const t = setTimeout(() => {
      setCurrentIndex(0);
      setShowing(true);
    }, startDelay);

    return () => clearTimeout(t);
  }, [initialized, tourKey, hasSeenTour, autoStart, startDelay, showing, currentIndex, enabled]);

  useEffect(() => {
    if (showing && currentIndex >= 0 && currentIndex < totalSteps) {
      const step = steps[currentIndex];
      const componentRef = internalSpotlightRefs.current[step?.key];
      const t = setTimeout(() => {
        componentRef?.current?.show?.();
      }, 260);
      return () => clearTimeout(t);
    }
  }, [showing, currentIndex, steps, totalSteps]);

  return (
    <>
      {props.children}
      {steps.map((s, i) => {
        const targetRef = resolvedRefs.current?.[s.key] || resolvedRefs?.[s.key];
        const isActive = showing && currentIndex === i;
        if (!internalSpotlightRefs.current[s.key]) {
          internalSpotlightRefs.current[s.key] = React.createRef();
        }
        // Si el paso no trae title/description/accentColor propios, se usa
        // el contenido centralizado en onboardingService.js (TOOLTIP_CONTENT)
        // según la key del paso, para que el texto de qué hace cada
        // componente esté siempre revisado y en un solo lugar.
        const stepDefaults = getTooltipContent(s.key);
        const stepTitle = s.title ?? stepDefaults?.title;
        const stepDescription = s.description ?? stepDefaults?.description;
        const stepAccentColor = s.accentColor ?? stepDefaults?.accentColor ?? '#0b6b45';

        return (
          <FeatureSpotlight
            key={s.key}
            ref={internalSpotlightRefs.current[s.key]}
            targetRef={targetRef}
            title={stepTitle}
            description={stepDescription}
            accentColor={stepAccentColor}
            spotlightShape={s.spotlightShape || 'rounded'}
            spotlightPadding={s.spotlightPadding || 14}
            currentStep={i}
            totalSteps={totalSteps}
            nextLabel={nextLabel}
            prevLabel={prevLabel}
            skipLabel={skipLabel}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={totalSteps > 1 && i < totalSteps - 1 ? handleSkip : undefined}
            onDismiss={isActive && i === totalSteps - 1 ? markTourDone : undefined}
            dismissOnBackdrop={false}
            showClose={false}
          />
        );
      })}
    </>
  );
});