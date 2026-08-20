import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListaProyectosUI } from '../../components/proyectos/ui';
import { useListaProyectos } from '../../components/proyectos/hooks';
import { useTheme } from '../../services/theme';

export default function ProyectosTabScreen() {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const {
        proyectos,
        isLoading,
        isRefreshing,
        filtroActivo,
        setFiltroActivo,
        recargar,
    } = useListaProyectos();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
            <ListaProyectosUI
                proyectos={proyectos}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
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
