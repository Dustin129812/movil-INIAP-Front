import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../services/auth';
import { ThemeProvider, useTheme } from '../services/theme';
import { NotificationProvider } from '../components/notifications/context/NotificationContext';
import AuthNavigator from '../components/loader/hooks/AuthNavigator';

function RootLayoutContent() {
    const { isDark } = useTheme();

    return (
        <>
            <AuthNavigator />
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <RootLayoutContent />
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
