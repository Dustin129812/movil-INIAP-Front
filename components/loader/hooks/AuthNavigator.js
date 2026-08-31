import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../../../services/auth';
import { useTheme } from '../../../services/theme';
import LoginForm from '../../auth/ui/LoginForm';
import AnimatedSplashScreen from '../ui/AnimatedSplashScreen';

function AuthNavigator() {
    const { autenticado, cargando, cargandoLogin, setVideoEnded } = useAuth();
    const { isDark } = useTheme();
    const bg = isDark ? '#000000' : '#F2F2F7';

    if (cargando || cargandoLogin) {
        return (
            <AnimatedSplashScreen
                onFinish={() => setVideoEnded(true)}
            />
        );
    }

    if (autenticado) {
        return (
            <Stack screenOptions={{ headerShown: false, headerBackTitle: '', contentStyle: { backgroundColor: bg } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="lotes/[id]" />
                <Stack.Screen name="lotes/nuevo/index" />
                <Stack.Screen name="proyectos/nuevo/index" />
                <Stack.Screen name="proyectos/[id]/index" />
                <Stack.Screen name="proyectos/[id]/seguimiento/index" />
                <Stack.Screen name="proyectos/[id]/seguimiento/etapa" />
                <Stack.Screen name="proyectos/[id]/seguimiento/evento" />
                <Stack.Screen name="configuracion/dispositivo" />
                <Stack.Screen name="configuracion/colaboradores" />
            </Stack>
        );
    }

    return (
        <View style={styles.container}>
            <LoginForm />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
});

export default AuthNavigator;
