import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useDeviceInfo } from '../../services/device';

const ICONOS = {
  bienvenida: '+',
  success: '✓',
  error: '!',
  despedida: '-',
};

const COLORES = {
  bienvenida: '#34C759',
  success: '#34C759',
  error: '#FF453A',
  despedida: '#8E8E93',
};

export function DynamicIslandNotification({ tipo, mensaje, visible }) {
  const { esIOS } = useDeviceInfo();
  const [show, setShow] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let translateAnimation;
    let progressAnimation;

    if (visible) {
      setShow(true);
      translateAnimation = Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      });
      translateAnimation.start();
      progress.setValue(0);
      progressAnimation = Animated.timing(progress, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: false,
      });
      progressAnimation.start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShow(false));
    }

    return () => {
      if (translateAnimation) translateAnimation.stop();
      if (progressAnimation) progressAnimation.stop();
    };
  }, [visible]);

  if (!show) return null;

  const colorAcento = COLORES[tipo] || COLORES.success;
  const icono = ICONOS[tipo] || '✓';

  const titulo = {
    bienvenida: 'Bienvenido',
    success: mensaje?.includes('creada') ? 'Cuenta creada' : 'Listo',
    error: 'Algo salio mal',
    despedida: 'Hasta pronto',
  }[tipo] || 'Notificacion';

  const subTitulo = {
    bienvenida: 'Sesion iniciada correctamente',
    success: mensaje || 'Operacion completada',
    error: mensaje || 'Intenta de nuevo',
    despedida: 'Sesion cerrada',
  }[tipo] || '';

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        esIOS && styles.containerIOS,
        { transform: [{ translateY }] },
      ]}
    >
      <View style={styles.notification}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colorAcento, width: progressWidth }]} />

        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${colorAcento}20` }]}>
            <Text style={[styles.icon, { color: colorAcento }]}>{icono}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{titulo}</Text>
            <Text style={styles.subtitle}>{subTitulo}</Text>
          </View>

          <View style={[styles.accentDot, { backgroundColor: colorAcento }]} />
        </View>

        <View style={[styles.bottomLine, { backgroundColor: colorAcento }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
  },
  containerIOS: {
    paddingTop: 50,
  },
  notification: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  progressFill: {
    height: 3,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  bottomLine: {
    height: 3,
    width: '100%',
  },
});