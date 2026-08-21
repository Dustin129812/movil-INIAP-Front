import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Animated,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useDeviceInfo } from '../../../services/device';

const { width } = Dimensions.get('window');

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
  
  // Estados para animaciones
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Valores Animados
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleViewMode = () => {
    // Animación de salida
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isGuestMode ? -15 : 15,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsGuestMode(!isGuestMode);
      slideAnim.setValue(isGuestMode ? 15 : -15);
      
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleInvitado = async () => {
    if (!deviceInfo.uuid) {
      Alert.alert('Error', 'No se pudo obtener información del dispositivo');
      return;
    }
    setCargandoInvitado(true);
    try {
      await handleLoginInvitado(
        deviceInfo.uuid,
        deviceInfo.modelo,
        deviceInfo.sistemaOperativo,
        deviceInfo.hardware
      );
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
      {/* Fondo Superior con curva pronunciada */}
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
        {/* Botón Flotante con cambio de flechas */}
        <TouchableOpacity 
          style={styles.floatingButton} 
          activeOpacity={0.8}
          onPress={toggleViewMode}
          disabled={isAnyLoading}
        >
          <Feather 
            name={isGuestMode ? "arrow-left" : "arrow-right"} 
            size={28} 
            color={COLORS.azulOscuroTitulo} 
          />
        </TouchableOpacity>

        {/* Contenedor Animado para Formulario / Invitado */}
        <Animated.View style={[
          styles.formContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {!isGuestMode ? (
            // ================== VISTA DE LOGIN CON CREDENCIALES ==================
            <>
              <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
              <Text style={styles.welcomeText}>Inicia sesión para continuar</Text>

              {/* Input Email */}
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

              {/* Input Contraseña */}
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused, { marginBottom: 30 }]}>
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
                <TouchableOpacity
                  onPress={() => setMostrarPassword(!mostrarPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={mostrarPassword ? 'unlock' : 'lock'}
                    size={20}
                    color={passwordFocused ? COLORS.verdeBosquePrimario : COLORS.grisSombra}
                  />
                </TouchableOpacity>
              </View>

              {/* Botón LOGIN */}
              <TouchableOpacity
                style={[styles.button, isAnyLoading && styles.buttonDisabled]}
                onPress={handleLoginSubmit}
                disabled={isAnyLoading}
                activeOpacity={0.85}
              >
                {isLoading || isSubmitting ? (
                  <ActivityIndicator color={COLORS.blancoPuro} />
                ) : (
                  <Text style={styles.buttonText}>INGRESAR</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // ================== VISTA DE INVITADO ==================
            <View style={styles.guestContainer}>
              <View style={styles.guestIconWrapper}>
                <Feather name="compass" size={60} color={COLORS.verdeBosquePrimario} />
              </View>
              <Text style={styles.title}>Modo Explorador</Text>
              <Text style={styles.welcomeText}>
                Descubre las funcionalidades principales de la aplicación sin necesidad de crear una cuenta.
              </Text>

              <TouchableOpacity
                style={[styles.guestButton, isAnyLoading && styles.buttonDisabled]}
                onPress={handleInvitado}
                disabled={isAnyLoading}
                activeOpacity={0.85}
              >
                {cargandoInvitado || isLoadingDevice ? (
                  <ActivityIndicator color={COLORS.blancoPuro} />
                ) : (
                  <>
                    <Feather name="user-check" size={20} color={COLORS.blancoPuro} style={{ marginRight: 10 }} />
                    <Text style={styles.buttonText}>INGRESAR COMO INVITADO</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Logo INIAP inferior para ambas vistas */}
          <View style={styles.footerContainer}>
             <Image
                source={require('../../../assets/images/INIAP.png')}
                style={styles.iniapLogo}
                resizeMode="contain"
             />
             <Text style={styles.derechosTexto}>© 2025 Todos los derechos reservados</Text>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blancoPuro,
  },
  imageWrapper: {
    height: '42%',
    width: '100%',
    // Redondeo pronunciado para simular la semiesfera de la imagen
    borderBottomLeftRadius: 180, 
    borderBottomRightRadius: 180,
    overflow: 'hidden',
    backgroundColor: COLORS.verdeOscuroProfundo,
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
    paddingTop: 40,
  },
  topLogo: {
    width: 140,
    height: 140,
    borderRadius: 30, 
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: COLORS.blancoPuro,
    paddingHorizontal: 24,
    marginTop: -20,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.blancoPuro,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, 
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.verdeOscuroProfundo,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 15,
    color: COLORS.grisMedioTexto,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blancoPuro,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grisBorde,
    marginBottom: 16,
    height: 58,
  },
  inputWrapperFocused: {
    borderColor: COLORS.verdeBosquePrimario,
    backgroundColor: COLORS.grisClaroFondo,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 20,
    fontSize: 16,
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
    paddingVertical: 18,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  /* ESTILOS VISTA INVITADO */
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  guestIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.verdeSuaveFondo,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestButton: {
    backgroundColor: COLORS.verdeBosquePrimario,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },

  /* FOOTER INIAP */
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  iniapLogo: {
    width: 70,
    height: 40,
  },
  derechosTexto: {
    fontSize: 12,
    color: COLORS.grisSombra,
    marginTop: 8,
  }
});