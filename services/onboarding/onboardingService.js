import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEYS = {
  WALKTHROUGH_COMPLETED: '@iniap_onboarding_walkthrough_done',
};

export async function isWalkthroughCompleted() {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEYS.WALKTHROUGH_COMPLETED);
    return value === 'true';
  } catch (e) {
    return false;
  }
}

export async function markWalkthroughCompleted() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEYS.WALKTHROUGH_COMPLETED, 'true');
  } catch (e) {
    // silent
  }
}

export async function resetWalkthrough() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEYS.WALKTHROUGH_COMPLETED);
  } catch (e) {
    // silent
  }
}

export async function resetAllOnboarding() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEYS.WALKTHROUGH_COMPLETED);
  } catch (e) {
    // silent
  }
}