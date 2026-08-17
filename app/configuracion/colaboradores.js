// ============================================
// COLABORADORES - Gestion de Colaboradores de Proyectos
// ============================================
// Navegacion: app/configuracion/colaboradores.js
// Funcionalidad: Lista proyectos y gestiona colaboradores via modal

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../services/theme';
import { proyectosService } from '../../services/proyectos';
import ColaboradoresModal from '../../components/proyectos/ui/ColaboradoresModal';

// --- ESTILOS ---
// Origen: app/styles/colaboradoresStyles.js
import { colaboradoresStyles as styles } from '../../src/styles/colaboradoresStyles';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ColaboradoresProyectosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  // --- ESTADO LOCAL ---
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- EFECTOS ---
  const cargarProyectos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await proyectosService.obtenerProyectos();
      setProyectos(Array.isArray(data) ? data : []);
    } catch (err) {
      // console removed
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

  // --- HANDLERS ---
  const abrirGestion = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setModalVisible(true);
  };

  // --- RENDER ---
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Header con boton de volver */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={26}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textWhite]}>
          Colaboradores
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero, mismo patron que "Invite Family" de Apple */}
        <View style={styles.hero}>
          <View style={styles.iconStack}>
            <MaterialCommunityIcons name="account-group" size={44} color="#0A84FF" />
            <View style={styles.plusBadge}>
              <MaterialCommunityIcons name="plus" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.heroTitle, isDark && styles.textWhite]}>
            Colaboradores de Proyectos
          </Text>
          <Text style={styles.heroSubtitle}>
            Elige un proyecto para ver, agregar o quitar colaboradores.
          </Text>
        </View>

        {/* Lista de proyectos */}
        <Text style={[styles.groupTitle, isDark && styles.groupTitleDark]}>
          Proyectos
        </Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#34C759"
              style={{ paddingVertical: 24 }}
            />
          ) : proyectos.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={32}
                color="#8E8E93"
              />
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
                      <Text
                        style={[styles.rowNombre, isDark && styles.textWhite]}
                        numberOfLines={1}
                      >
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

      {/* Modal de gestion de colaboradores */}
      <ColaboradoresModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        proyectoId={proyectoSeleccionado?.id || proyectoSeleccionado?.uuid_movil}
      />
    </View>
  );
}
