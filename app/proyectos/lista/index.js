import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/services/ThemeContext';
import { ListaProyectosUI } from '@/components/proyectos/ui';
import { useListaProyectos } from '@/components/proyectos/hooks';

export default function ProyectosListaScreen() {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const {
        proyectosFiltrados,
        isLoading,
        filtroActivo,
        setFiltroActivo,
        recargar,
    } = useListaProyectos();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7', paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#000000' : '#F2F2F7'} />
            <ListaProyectosUI
                proyectos={proyectosFiltrados}
                isLoading={isLoading}
                filtroActivo={filtroActivo}
                onFiltroChange={setFiltroActivo}
                onRefresh={recargar}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
