import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  isWalkthroughCompleted as checkWalkthrough,
  markWalkthroughCompleted as saveWalkthroughDone,
  resetAllOnboarding,
  resetWalkthrough,
} from './onboardingService';

const OnboardingContext = createContext(undefined);

export function OnboardingProvider({ children }) {
  const [walkthroughCompleted, setWalkthroughCompleted] = useState(false);
  const [walkthroughVisible, setWalkthroughVisible] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const done = await checkWalkthrough();
        setWalkthroughCompleted(done);
        setWalkthroughVisible(!done);
      } catch {
        setWalkthroughCompleted(false);
        setWalkthroughVisible(true);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const completeWalkthrough = useCallback(async () => {
    setWalkthroughVisible(false);
    setWalkthroughCompleted(true);
    await saveWalkthroughDone();
  }, []);

  const skipWalkthrough = useCallback(async () => {
    setWalkthroughVisible(false);
    setWalkthroughCompleted(true);
    await saveWalkthroughDone();
  }, []);

  const reopenWalkthrough = useCallback(() => {
    setWalkthroughVisible(true);
  }, []);

  const resetAll = useCallback(async () => {
    await resetAllOnboarding();
    setWalkthroughCompleted(false);
    setWalkthroughVisible(true);
  }, []);

  const restartWalkthrough = useCallback(async () => {
    await resetWalkthrough();
    setWalkthroughCompleted(false);
    setWalkthroughVisible(true);
  }, []);

  const value = useMemo(
    () => ({
      initializing,
      walkthroughCompleted,
      walkthroughVisible,
      setWalkthroughVisible,
      completeWalkthrough,
      skipWalkthrough,
      reopenWalkthrough,
      resetAll,
      restartWalkthrough,
    }),
    [
      initializing,
      walkthroughCompleted,
      walkthroughVisible,
      completeWalkthrough,
      skipWalkthrough,
      reopenWalkthrough,
      resetAll,
      restartWalkthrough,
    ]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding debe usarse dentro de OnboardingProvider');
  }
  return ctx;
}