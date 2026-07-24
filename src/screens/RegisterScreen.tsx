import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { useAuth } from '../hooks';
import { DynamicIslandNotification } from '../components/ui';
import { servicioNotificaciones } from '../services/notificaciones';

export function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'bienvenida' | 'error' | 'success' | 'despedida'; mensaje: string }>({ tipo: 'success', mensaje: '' });
  const { registrar, cargando } = useAuth();

  useEffect(() => {
    servicioNotificaciones.configurar();
  }, []);

  const validar = (): boolean => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'El correo es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Correo inválido');
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validar()) return;

    const resultado = await registrar(nombre.trim(), email.trim(), password);

    if (resultado.success) {
      setNotificacion({ tipo: 'success', mensaje: 'Cuenta creada con éxito' });
      setMostrarNotificacion(true);
      setTimeout(() => setMostrarNotificacion(false), 3000);
    } else {
      const mensajeError = resultado.message || 'Error al registrar';
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.touchable}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.logo}>INIAP</Text>
                <Text style={styles.subtitle}>Gestión Agrícola</Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.title}>Crear Cuenta</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre completo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre"
                    placeholderTextColor="#AEAEB2"
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!cargando}
                  />
                </View>

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
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#AEAEB2"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!cargando}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repite la contraseña"
                    placeholderTextColor="#AEAEB2"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!cargando}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, cargando && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={cargando}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  touchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
});
