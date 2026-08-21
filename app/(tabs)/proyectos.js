import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { ListaProyectosUI } from '../../components/proyectos/ui';
import { useListaProyectos } from '../../components/proyectos/hooks';
import { getAppTheme, useTheme } from '../../services/theme';

export default function ProyectosTabScreen() {
    const { isDark } = useTheme();
    const {
        proyectos,
        isLoading,
        filtroActivo,
        setFiltroActivo,
        recargar,
    } = useListaProyectos();

    return (
        <View style={[styles.container, { backgroundColor: getAppTheme(isDark).background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
            <ListaProyectosUI
                proyectos={proyectos}
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
