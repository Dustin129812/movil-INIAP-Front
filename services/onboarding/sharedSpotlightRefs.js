import { useRef } from 'react';

const SHARED_SPOTLIGHT_REFS = { current: {} };

export function useSharedSpotlightRefs() {
  return SHARED_SPOTLIGHT_REFS;
}

export const sharedSpotlightRefs = SHARED_SPOTLIGHT_REFS;

export function setSharedSpotlightRef(key, ref) {
  SHARED_SPOTLIGHT_REFS.current[key] = ref;
}

export function getSharedSpotlightRef(key) {
  return SHARED_SPOTLIGHT_REFS.current[key];
}
