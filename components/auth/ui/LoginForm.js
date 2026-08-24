import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDeviceInfo } from '../../../services/device';
import { useAuth } from '../hooks/useAuth';

// Calculamos las dimensiones para hacer el diseño responsivo
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // Detecta si es un teléfono pequeño

// PALETA DE COLORES
const COLORS = {
  verdeOscuroProfundo: '#012A20',
  verdeBosquePrimario: '#0B5D3F',
  verdeEsmeraldaMedio: '#1FA968',
  verdeNeonBright: '#4EDB8E',
  verdeMentaPastel: '#D6FCE6',
  verdeSuaveFondo: '#E4FCEB',
  verdeMentaBorde: '#7FE0A8',
  blancoPuro: '#FFFFFF',
  grisClaroFondo: '#F9FAFB',
  grisBorde: '#E5E7EB',
  grisSombra: '#9CA3AF',
  grisMedioTexto: '#6B7280',
  grisOscuroTexto: '#374151',
  azulOscuroTitulo: '#111827',
};

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleLogin,
    handleLoginInvitado,
    loginConMerge,
    esInvitado,
    dispositivoId,
  } = useAuth();

  const { deviceInfo, isLoading: isLoadingDevice } = useDeviceInfo();
  
  // Estados de UI
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargandoInvitado, setCargandoInvitado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Estados para animaciones
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Valores Animados para el efecto "Scroll"
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isGuestModeRef = useRef(isGuestMode);
  
  useEffect(() => {
    isGuestModeRef.current = isGuestMode;
  }, [isGuestMode]);

  // Detector de Teclado
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleModeChange = (goToGuest) => {
    if (goToGuest === isGuestModeRef.current) return;

    Keyboard.dismiss(); 

    const exitTranslateY = goToGuest ? -100 : 100; 
    const enterTranslateY = goToGuest ? 100 : -100;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: exitTranslateY, duration: 200, useNativeDriver: true })
    ]).start(() => {
      setIsGuestMode(goToGuest);
      slideAnim.setValue(enterTranslateY);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true })
      ]).start();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 30 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentlyGuest = isGuestModeRef.current;
        if (gestureState.dy < -40 && !currentlyGuest) {
          handleModeChange(true);
        } else if (gestureState.dy > 40 && currentlyGuest) {
          handleModeChange(false);
        }
      }
    })
  ).current;

  const handleInvitado = async () => {
    if (!deviceInfo.uuid) {
      Alert.alert('Error', 'No se pudo obtener información del dispositivo');
      return;
    }
    setCargandoInvitado(true);
    try {
      await handleLoginInvitado(deviceInfo.uuid, deviceInfo.modelo, deviceInfo.sistemaOperativo, deviceInfo.hardware);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al iniciar como invitado');
    } finally {
      setCargandoInvitado(false);
    }
  };

  const handleLoginSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }
    setIsSubmitting(true);
    try {
      let resultado;
      if (esInvitado && dispositivoId) {
        resultado = await loginConMerge(email.trim(), password, dispositivoId);
        if (resultado.success) {
          const { datosReasignados } = resultado;
          if (datosReasignados > 0) {
            Alert.alert('Bienvenido', `Sesión iniciada. Se fusionaron ${datosReasignados} registros del usuario invitado.`);
          } else {
            Alert.alert('Bienvenido', 'Sesión iniciada correctamente');
          }
        } else {
          Alert.alert('Error', resultado.message || 'Credenciales incorrectas');
        }
      } else {
        resultado = await handleLogin(email.trim(), password);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnyLoading = isLoading || isLoadingDevice || cargandoInvitado || isSubmitting;

  return (
    <View style={styles.container}>
      {/* Fondo Superior Dinámico */}
      <View style={styles.imageWrapper}>
        <ImageBackground
          source={require('../../../assets/images/background.jpeg')}
          style={styles.headerBackground}
          imageStyle={styles.imageStyle}
        >
          <View style={styles.headerOverlay}>
            <Image
              source={require('../../../assets/images/Logo.jpg')}
              style={styles.topLogo}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>
      </View>

      <KeyboardAvoidingView
        style={styles.bottomSheet}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          {...panResponder.panHandlers}
          style={[
            styles.formContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {!isGuestMode ? (
            // ================== VISTA DE LOGIN ==================
            <View style={styles.viewContent}>
              <View style={styles.topSpacer} />
              <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
              <Text style={styles.welcomeText}>Inicia sesión para continuar</Text>

              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor={COLORS.grisSombra}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isAnyLoading}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
                <Feather name="mail" size={20} color={emailFocused ? COLORS.verdeBosquePrimario : COLORS.grisSombra} style={styles.inputIcon} />
              </View>

              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused, styles.passwordMargin]}>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor={COLORS.grisSombra}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPassword}
                  editable={!isAnyLoading}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} style={styles.eyeButton} activeOpacity={0.7}>
                  <Feather name={mostrarPassword ? 'unlock' : 'lock'} size={20} color={passwordFocused ? COLORS.verdeBosquePrimario : COLORS.grisSombra} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.button, isAnyLoading && styles.buttonDisabled]} onPress={handleLoginSubmit} disabled={isAnyLoading} activeOpacity={0.85}>
                {isLoading || isSubmitting ? (
                  <ActivityIndicator color={COLORS.blancoPuro} />
                ) : (
                  <Text style={styles.buttonText}>INGRESAR</Text>
                )}
              </TouchableOpacity>

              <View style={styles.flexibleSpacer} />

              {!isKeyboardVisible && (
                <View style={styles.swipeIndicator}>
                  <Feather name="chevron-up" size={isSmallScreen ? 20 : 24} color={COLORS.grisSombra} />
                  <Text style={styles.swipeText}>Deslice hacia arriba para ingresar sin cuenta</Text>
                </View>
              )}
            </View>
          ) : (
            // ================== VISTA DE EXPLORADOR (Invitado) ==================
            <View style={styles.viewContent}>
              <View style={[styles.swipeIndicator, { paddingTop: isSmallScreen ? 5 : 15 }]}>
                <Feather name="chevron-down" size={isSmallScreen ? 20 : 24} color={COLORS.grisSombra} />
                <Text style={styles.swipeText}>Deslice hacia abajo para usar correo</Text>
              </View>

              <View style={styles.guestCenterContainer}>
                <View style={styles.guestIconWrapper}>
                  <Feather name="compass" size={isSmallScreen ? 40 : 50} color={COLORS.verdeBosquePrimario} />
                </View>
                {/* AQUI ESTABA EL ERROR: Faltaba el < de cierre */}
                <Text style={styles.title}>Investigador</Text>

                <TouchableOpacity style={[styles.guestButton, isAnyLoading && styles.buttonDisabled]} onPress={handleInvitado} disabled={isAnyLoading} activeOpacity={0.85}>
                  {cargandoInvitado || isLoadingDevice ? (
                    <ActivityIndicator color={COLORS.blancoPuro} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>CONTINUAR COMO INVITADO</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* FOOTER ESTÁTICO FIJO FUERA DEL SCROLL/KEYBOARD */}
      {!isKeyboardVisible && (
        <View style={styles.footerContainer}>
           <Image source={require('../../../assets/images/INIAP.png')} style={styles.iniapLogo} resizeMode="contain" />
           <Text style={styles.derechosTexto}>© 2025 Todos los derechos reservados</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blancoPuro,
  },
  imageWrapper: {
    height: isSmallScreen ? '35%' : '42%', 
    width: '100%',
    borderBottomLeftRadius: 180, 
    borderBottomRightRadius: 180,
    overflow: 'hidden',
    backgroundColor: COLORS.verdeOscuroProfundo,
    zIndex: 2, 
  },
  headerBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    opacity: 0.85, 
  },
  headerOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: isSmallScreen ? 20 : 40,
  },
  topLogo: {
    width: isSmallScreen ? 100 : 140, 
    height: isSmallScreen ? 100 : 140,
    borderRadius: 30, 
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: COLORS.blancoPuro,
    paddingHorizontal: isSmallScreen ? 16 : 24,
    marginTop: isSmallScreen ? -15 : -25,
    zIndex: 1,
  },
  formContainer: {
    flex: 1,
    paddingTop: isSmallScreen ? 20 : 35, 
  },
  viewContent: {
    flex: 1,
  },
  topSpacer: {
    height: isSmallScreen ? 0 : 10,
  },
  title: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '700',
    color: COLORS.verdeOscuroProfundo,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: isSmallScreen ? 13 : 15,
    color: COLORS.grisMedioTexto,
    textAlign: 'center',
    marginBottom: isSmallScreen ? 20 : 30,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    lineHeight: isSmallScreen ? 18 : 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blancoPuro,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grisBorde,
    height: isSmallScreen ? 50 : 58, 
    marginBottom: isSmallScreen ? 12 : 16,
  },
  passwordMargin: {
    marginBottom: isSmallScreen ? 20 : 30,
  },
  inputWrapperFocused: {
    borderColor: COLORS.verdeBosquePrimario,
    backgroundColor: COLORS.grisClaroFondo,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 20,
    fontSize: isSmallScreen ? 14 : 16,
    color: COLORS.azulOscuroTitulo,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  inputIcon: {
    paddingRight: 16,
    paddingLeft: 10,
  },
  eyeButton: {
    height: '100%',
    paddingRight: 16,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: COLORS.verdeBosquePrimario,
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 14 : 18, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.verdeBosquePrimario,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grisSombra,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.blancoPuro,
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  flexibleSpacer: {
    flex: 1, 
    minHeight: isSmallScreen ? 10 : 20 
  },
  swipeIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    // Le di padding inferior extra para que el footer fijo no lo cubra
    paddingBottom: isSmallScreen ? 60 : 70, 
  },
  swipeText: {
    fontSize: isSmallScreen ? 13 : 15,
    color: COLORS.grisSombra,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  guestCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Aumentamos padding inferior para que el botón no quede oculto detrás del footer
    paddingBottom: 70, 
  },
  guestIconWrapper: {
    width: isSmallScreen ? 60 : 75,
    height: isSmallScreen ? 60 : 75,
    borderRadius: 50,
    backgroundColor: COLORS.verdeSuaveFondo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 15 : 20,
  },
  guestButton: {
    backgroundColor: COLORS.verdeBosquePrimario,
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 14 : 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallScreen ? 40 : 50,
    width: '100%',
  },
  
  /* ESTILOS DEL FOOTER FIJO */
  footerContainer: {
    position: 'absolute', // ESTO LO FIJA A LA PANTALLA
    bottom: isSmallScreen ? 15 : 25, // Separación inferior
    left: 0, // Lo centra horizontalmente 
    right: 0, // Lo centra horizontalmente
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Asegura que esté siempre por encima del fondo
  },
  iniapLogo: {
    width: isSmallScreen ? 60 : 70,
    height: isSmallScreen ? 30 : 40,
    marginBottom: -5,
  },
  derechosTexto: {
    fontSize: isSmallScreen ? 10 : 12,
    color: COLORS.grisSombra,
    marginTop: 0,
  }
});