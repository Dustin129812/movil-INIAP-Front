import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ToastProvider } from '../components/ui';
import { AuthProvider, useAuth } from '../services';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../services/ThemeContext';
import LoginForm from '../components/auth/ui/LoginForm';

function AuthNavigator() {
  const { autenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logoLoading}>INIAP</Text>
        <ActivityIndicator size="large" color="#34C759" style={styles.spinner} />
      </View>
    );
  }

  if (autenticado) {
    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    );
  }

  return (
    <View style={styles.authContainer}>
      <LoginForm />
    </View>
  );
}

export default function RootLayout() {
  const { isDark } = useTheme();


  return (
    <CustomThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthNavigator />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </AuthProvider>
      </ToastProvider>
    </CustomThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  logoLoading: {
    fontSize: 40,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: 2,
  },
  spinner: {
    marginTop: 24,
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F2F2F7',
  },
  toggleText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  toggleLink: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
});