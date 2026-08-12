import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../services/ThemeContext';
import { proyectosService } from '../../services/proyectosService';
import ColaboradoresModal from '../../components/proyectos/ui/ColaboradoresModal';

export default function ColaboradoresProyectosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const cargarProyectos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await proyectosService.obtenerProyectos();
      setProyectos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando proyectos:', err);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarProyectos();
    }, [cargarProyectos])
  );

  const abrirGestion = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Header con botón de volver */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textWhite]}>Colaboradores</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero, mismo patrón que "Invite Family" de Apple */}
        <View style={styles.hero}>
          <View style={styles.iconStack}>
            <MaterialCommunityIcons name="account-group" size={44} color="#0A84FF" />
            <View style={styles.plusBadge}>
              <MaterialCommunityIcons name="plus" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.heroTitle, isDark && styles.textWhite]}>Colaboradores de Proyectos</Text>
          <Text style={styles.heroSubtitle}>
            Elige un proyecto para ver, agregar o quitar colaboradores.
          </Text>
        </View>

        <Text style={[styles.groupTitle, isDark && styles.groupTitleDark]}>Proyectos</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {loading ? (
            <ActivityIndicator size="small" color="#34C759" style={{ paddingVertical: 24 }} />
          ) : proyectos.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="account-group-outline" size={32} color="#8E8E93" />
              <Text style={styles.emptyText}>No hay proyectos disponibles</Text>
            </View>
          ) : (
            proyectos.map((proy, index) => (
              <View key={proy.uuid_movil || proy.id || index}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => abrirGestion(proy)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.rowIconWrap, isDark && styles.rowIconWrapDark]}>
                      <MaterialCommunityIcons name="flask-outline" size={16} color="#0A84FF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowNombre, isDark && styles.textWhite]} numberOfLines={1}>
                        {proy.titulo || 'Sin título'}
                      </Text>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {proy.variedad || 'Sin variedad'}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#8E8E93" />
                </TouchableOpacity>
                {index < proyectos.length - 1 && (
                  <View style={[styles.divider, isDark && styles.dividerDark]} />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ColaboradoresModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        proyectoId={proyectoSeleccionado?.id || proyectoSeleccionado?.uuid_movil}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  containerDark: { backgroundColor: '#121212' },
  textWhite: { color: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000000' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  hero: { alignItems: 'center', marginTop: 12, marginBottom: 28, paddingHorizontal: 20 },
  iconStack: { position: 'relative', marginBottom: 16 },
  plusBadge: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#000000', textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 19 },

  groupTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  groupTitleDark: { color: '#98989F' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardDark: { backgroundColor: '#1E1E24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(10, 132, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  rowIconWrapDark: { backgroundColor: 'rgba(10, 132, 255, 0.15)' },
  rowNombre: { fontSize: 14, fontWeight: '600', color: '#000000' },
  rowSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#F2F2F7' },
  dividerDark: { backgroundColor: '#2C2C2E' },

  empty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },
});
