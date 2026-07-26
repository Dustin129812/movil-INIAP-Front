import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DynamicIslandNotification } from '../../components/ui';
import { useAuth } from '../../hooks';
import { servicioNotificaciones } from '../../services/notificaciones';

const Wrapper = Platform.OS === 'web' ? View : TouchableOpacity;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'bienvenida' | 'error' | 'success' | 'despedida'; mensaje: string }>({ tipo: 'bienvenida', mensaje: '' });
  const { login, cargando } = useAuth();

  useEffect(() => {
    servicioNotificaciones.configurar();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    const resultado = await login(email.trim(), password);

    if (resultado.success) {
      setNotificacion({ tipo: 'bienvenida', mensaje: '' });
      setMostrarNotificacion(true);
      setTimeout(() => setMostrarNotificacion(false), 3000);
    } else {
      const mensajeError = resultado.message || 'Credenciales incorrectas';
      setNotificacion({ tipo: 'error', mensaje: mensajeError });
      setMostrarNotificacion(true);
      setTimeout(() => setMostrarNotificacion(false), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Wrapper
          style={styles.touchable}
          {...(Platform.OS !== 'web' && { activeOpacity: 1, onPress: Keyboard.dismiss })}
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
                <TextInput
                  style={styles.input}
                  placeholder="tucorreo@ejemplo.com"
                  placeholderTextColor="#AEAEB2"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!cargando}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor="#AEAEB2"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!mostrarPassword}
                    editable={!cargando}
                  />
                  <TouchableOpacity
                    style={styles.togglePassword}
                    onPress={() => setMostrarPassword(!mostrarPassword)}
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
                style={[styles.button, cargando && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={cargando}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </Wrapper>
      </KeyboardAvoidingView>

      <DynamicIslandNotification
        tipo={notificacion.tipo}
        mensaje={notificacion.mensaje}
        visible={mostrarNotificacion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardView: {
    flex: 1,
  },
  touchable: {
    flex: 1,
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: '#000',
  },
  togglePassword: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  togglePasswordText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#AEAEB2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  linkText: {
    color: '#34C759',
    fontSize: 15,
    fontWeight: '500',
  },
});