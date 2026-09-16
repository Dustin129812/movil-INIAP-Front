import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../services/auth';
import { ThemeProvider, useTheme } from '../services/theme';
import { NotificationProvider } from '../components/notifications/context/NotificationContext';
import {
  OnboardingProvider,
  OnboardingWalkthrough,
  useOnboarding,
} from '../services/onboarding';
import AuthNavigator from '../components/loader/hooks/AuthNavigator';

function RootLayoutContent() {
    const { isDark } = useTheme();
    const { walkthroughVisible } = useOnboarding();

    return (
        <>
            <AuthNavigator />
            {walkthroughVisible && <OnboardingWalkthrough />}
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <OnboardingProvider>
                        <NotificationProvider>
                            <AuthProvider>
                                <RootLayoutContent />
                            </AuthProvider>
                        </NotificationProvider>
                    </OnboardingProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}