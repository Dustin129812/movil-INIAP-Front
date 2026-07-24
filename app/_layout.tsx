import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../src/hooks';
import { LoginScreen, RegisterScreen } from '../src/screens';
import { ToastProvider } from '../src/components/ui';

function AuthNavigator() {
  const [isLogin, setIsLogin] = useState(true);
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
      {isLogin ? <LoginScreen /> : <RegisterScreen />}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
        </Text>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleLink}>
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthNavigator />
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
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
