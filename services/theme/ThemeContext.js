import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  isSystemTheme: true,
  toggleTheme: () => {},
  setTheme: (theme) => {},
  setSystemTheme: (value) => {},
});

const THEME_STORAGE_KEY = '@iniap_theme_preference';
const SYSTEM_THEME_KEY = '@iniap_use_system_theme';

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  useEffect(() => {
    loadThemePreferences();
  }, []);

  useEffect(() => {
    // Cuando cambia el tema del sistema y estamos en modo automático, actualizar
    if (isSystemTheme && systemColorScheme) {
      setThemeState(systemColorScheme);
    }
  }, [systemColorScheme, isSystemTheme]);

  const loadThemePreferences = async () => {
    try {
      const [savedTheme, savedUseSystem] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(SYSTEM_THEME_KEY),
      ]);

      // Cargar preferencia de tema automático del sistema
      const useSystem = savedUseSystem !== null ? savedUseSystem === 'true' : true;
      setIsSystemTheme(useSystem);

      if (savedTheme) {
        setThemeState(savedTheme);
      } else if (useSystem && systemColorScheme) {
        // Si no hay tema guardado y está activo el modo sistema, usar el del sistema
        setThemeState(systemColorScheme);
      }
    } catch (error) {
      // console removed
    }
  };

  const setTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
      // Si el usuario elige manualmente un tema, desactivar modo automático
      setIsSystemTheme(false);
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, 'false');
    } catch (error) {
      // console removed
    }
  };

  const setSystemTheme = async (value) => {
    try {
      setIsSystemTheme(value);
      await AsyncStorage.setItem(SYSTEM_THEME_KEY, value.toString());
      if (value && systemColorScheme) {
        setThemeState(systemColorScheme);
      }
    } catch (error) {
      // console removed
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        isSystemTheme,
        toggleTheme,
        setTheme,
        setSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
