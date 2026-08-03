import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth as useAuthService } from '../../../services';

export const useAuth = () => {
  const { login, loginInvitado, usuario, cargando, cerrarSesion, dispositivoId } = useAuthService();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const resultado = await login(email.trim(), password);
      if (resultado.success) {
        Alert.alert('Bienvenido', `Sesión iniciada correctamente`);
      } else {
        Alert.alert('Error', resultado.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login]);

  const handleLoginInvitado = useCallback(async (uuid, modelo, sistemaOperativo, hardware) => {
    setIsLoading(true);
    try {
      const resultado = await loginInvitado(uuid, modelo, sistemaOperativo, hardware);
      if (resultado.success) {
        // Sesión iniciada correctamente
      } else {
        Alert.alert('Error', resultado.message || 'No se pudo iniciar como invitado');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  }, [loginInvitado]);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await cerrarSesion();
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cerrarSesion]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading: isLoading || cargando,
    usuario,
    dispositivoId,
    handleLogin,
    handleLoginInvitado,
    handleLogout,
  };
};
