import { StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListaProyectos } from '../../components/proyectos/hooks';
import { ListaProyectosUI } from '../../components/proyectos/ui';
import { useTheme } from '../../services/theme';

export default function ProyectosTabScreen() {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const {
        proyectos,
        isLoading,
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
