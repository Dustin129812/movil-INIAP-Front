import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useDeviceInfo } from '../../../services/device';

// PALETA DE COLORES PERSONALIZADA
const COLORS = {
  verdeOscuroProfundo: '#012A20',
  verdeBosquePrimario: '#0B5D3F',
  verdeEsmeraldaMedio: '#1FA968',
  verdeNeonBright: '#4EDB8E',
  verdeMentaPastel: '#D6FCE6',
  verdeSuaveFondo: '#E4FCEB',
  verdeMentaBorde: '#7FE0A8',

  naranjaAmbar: '#B45309',
  naranjaCremaFondo: '#FFF7ED',
  naranjaClaroBorde: '#FED7AA',

  blancoPuro: '#FFFFFF',
  blancoHumo: '#F8FAFC',
  grisClaroFondo: '#F1F5F9',
  grisBorde: '#E2E8F0',
  grisSombra: '#94A3B8',

  grisMedioTexto: '#64748B',
  grisOscuroTexto: '#475569',
  azulOscuroTitulo: '#1E293B',
  azulNochePrincipal: '#0F172A',
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
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargandoInvitado, setCargandoInvitado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Login con merge: si hay sesión invitado activa, reasigna sus datos al usuario
  const handleLoginSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      let resultado;

      // Si hay sesión de invitado activa, usar loginConMerge para reasignar datos
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
        // Login normal sin merge
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Cabecera Superior con la Ilustración/Ícono Agrícola */}
        <View style={styles.topSection}>
          <View style={styles.leafBadge}>
            <FontAwesome5 name="seedling" size={32} color={COLORS.verdeNeonBright} />
          </View>
          <Text style={styles.logo}>AGRODECIDE</Text>
          <Text style={styles.subtitle}>SISTEMA DE GESTIÓN AGRÍCOLA</Text>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.cardForm}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.welcomeText}>Ingresa tus credenciales para continuar</Text>

          {/* Campo Correo */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={20} color={COLORS.verdeBosquePrimario} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="tucorreo@ejemplo.com"
                placeholderTextColor={COLORS.grisSombra}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isAnyLoading}
              />
            </View>
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color={COLORS.verdeBosquePrimario} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.grisSombra}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
                editable={!isAnyLoading}
              />
              <TouchableOpacity
                onPress={() => setMostrarPassword(!mostrarPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                <Feather
                  name={mostrarPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.grisMedioTexto}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Principal Login */}
          <TouchableOpacity
            style={[styles.button, isAnyLoading && styles.buttonDisabled]}
            onPress={handleLoginSubmit}
            disabled={isAnyLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.blancoPuro} />
            ) : (
              <>
                <Text style={styles.buttonText}>Acceder al Sistema</Text>
                <Feather name="arrow-right" size={20} color={COLORS.blancoPuro} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón Invitado */}
          <TouchableOpacity
            style={[styles.invitadoButton, isAnyLoading && styles.buttonDisabled]}
            onPress={handleInvitado}
            disabled={isAnyLoading}
            activeOpacity={0.85}
          >
            {cargandoInvitado || isLoadingDevice ? (
              <ActivityIndicator color={COLORS.verdeBosquePrimario} />
            ) : (
              <>
                <Feather name="user-check" size={20} color={COLORS.verdeBosquePrimario} style={styles.invitadoIcon} />
                <Text style={styles.invitadoButtonText}>Ingresar como Invitado</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.verdeOscuroProfundo,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  leafBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: COLORS.verdeMentaBorde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.blancoPuro,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.verdeNeonBright,
    marginTop: 4,
    letterSpacing: 1.5,
  },
  cardForm: {
    backgroundColor: COLORS.blancoPuro,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: 16,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.azulNochePrincipal,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.grisMedioTexto,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.grisOscuroTexto,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grisClaroFondo,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grisBorde,
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: COLORS.azulNochePrincipal,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: COLORS.verdeBosquePrimario,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grisSombra,
    borderColor: COLORS.grisSombra,
  },
  buttonText: {
    color: COLORS.blancoPuro,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grisBorde,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.grisSombra,
  },
  invitadoButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.verdeSuaveFondo,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.verdeMentaBorde,
  },
  invitadoIcon: {
    marginRight: 8,
  },
  invitadoButtonText: {
    color: COLORS.verdeBosquePrimario,
    fontSize: 16,
    fontWeight: '700',
  },
});