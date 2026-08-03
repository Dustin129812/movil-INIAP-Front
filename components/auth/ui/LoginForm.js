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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useDeviceInfo } from '../../../services/useDeviceInfo';

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleLogin,
    handleLoginInvitado,
  } = useAuth();

  const { deviceInfo, isLoading: isLoadingDevice } = useDeviceInfo();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargandoInvitado, setCargandoInvitado] = useState(false);

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

  const isAnyLoading = isLoading || isLoadingDevice || cargandoInvitado;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>INIAP</Text>
          <Text style={styles.subtitle}>Gestión Agrícola</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Iniciar Sesión</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="tucorreo@ejemplo.com"
                placeholderTextColor="#AEAEB2"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isAnyLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#AEAEB2"
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
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isAnyLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isAnyLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón Invitado - entra automáticamente */}
          <TouchableOpacity
            style={[styles.invitadoButton, isAnyLoading && styles.buttonDisabled]}
            onPress={handleInvitado}
            disabled={isAnyLoading}
            activeOpacity={0.8}
          >
            {cargandoInvitado || isLoadingDevice ? (
              <ActivityIndicator color="#34C759" />
            ) : (
              <>
                <Feather name="user" size={20} color="#34C759" style={styles.invitadoIcon} />
                <Text style={styles.invitadoButtonText}>Ingresar como Invitado</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 44,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C3C43',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 17,
    color: '#000',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#AEAEB2',
    borderColor: '#AEAEB2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#8E8E93',
  },
  invitadoButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#34C759',
  },
  invitadoIcon: {
    marginRight: 8,
  },
  invitadoButtonText: {
    color: '#34C759',
    fontSize: 17,
    fontWeight: '600',
  },
});
