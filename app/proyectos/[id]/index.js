import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/services/ThemeContext';
import { ProyectoDetalleUI } from '@/components/proyectos/ui';
import { useProyectoDetalle } from '@/components/proyectos/hooks';

export default function ProyectoDetalleScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const {
        proyectoData,
        visitas,
        isLoading,
    } = useProyectoDetalle(id);

    return (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <View style={{ paddingTop: insets.top }}>
                <ProyectoDetalleUI
                    proyecto={proyectoData}
                    visitas={visitas}
                    isLoading={isLoading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
