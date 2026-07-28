import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

const ToastContext = createContext(undefined);

const ICONOS = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i',
};

const COLORES = {
  success: '#34C759',
  error: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const progress = useRef(new Animated.Value(1)).current;

  const showToast = useCallback((options) => {
    setToast({ ...options, type: options.type || 'info' });
    translateY.setValue(-100);
    progress.setValue(0);
    Animated.spring(translateY, {
      toValue: 0,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
    Animated.timing(progress, {
      toValue: 1,
      duration: options.duration || 3000,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    if (toast) {
      const duration = toast.duration || 3000;
      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );

  const color = COLORES[toast.type || 'info'];
  const icono = ICONOS[toast.type || 'info'];

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        style={[
          styles.container,
          Platform.OS === 'ios' && styles.containerIOS,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.toast}>
          <View style={[styles.glow, { backgroundColor: color }]} />

          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}25` }]}>
              <Text style={[styles.icon, { color }]}>{icono}</Text>
            </View>

            <View style={styles.textContent}>
              <Text style={styles.title}>{toast.title}</Text>
              {toast.message && (
                <Text style={styles.message}>{toast.message}</Text>
              )}
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progress, { backgroundColor: color, width: progressWidth }]} />
          </View>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  containerIOS: {
    paddingTop: 50,
  },
  toast: {
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 25,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  textContent: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    marginTop: 2,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progress: {
    height: '100%',
  },
});