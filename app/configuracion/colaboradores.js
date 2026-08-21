// ============================================
// COLABORADORES - Gestion de Colaboradores de Proyectos
// ============================================
// Navegacion: app/configuracion/colaboradores.js
// Funcionalidad: Lista proyectos y gestiona colaboradores via modal

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../services/theme';
import { proyectosLocalService } from '../../services/proyectos';
import ColaboradoresModal from '../../components/proyectos/ui/ColaboradoresModal';

// --- ESTILOS ---
// Origen: app/styles/colaboradoresStyles.js
import { colaboradoresStyles as styles } from '../../src/styles/colaboradoresStyles';

// ============================================
// HELPERS
// ============================================

/**
 * Determina si un proyecto está sincronizado con el backend.
 * Un proyecto está sincronizado cuando:
 * - sync_status === 'synced' O
 * - Tiene un id numérico de servidor (no solo uuid_movil local)
 */
const estaSincronizado = (proyecto) => {
  if (!proyecto) return false;
  // Si tiene sync_status explícitamente en synced, está sincronizado
  if (proyecto.sync_status === 'synced') return true;
  // Si tiene id numérico (del servidor) y no tiene uuid_movil local, está sincronizado
  // Pero si tiene uuid_movil significa que fue creado en el móvil
  // Un proyecto creado en el móvil que fue sync tendría tanto uuid_movil como un id de servidor
  // El indicador más confiable es si tiene sync_status distinto de draft/pending
  if (proyecto.sync_status === 'draft' || proyecto.sync_status === 'pending') return false;
  // Si llegó hasta aquí y tiene id numérico, está sincronizado
  if (typeof proyecto.id === 'number' && !proyecto.uuid_movil) return true;
  // Si tiene uuid_movil y sync_status no es pending/draft, está sincronizado
  return false;
};

/**
 * Versión más simple: está sincronizado si NO es draft ni pending
 */
const proyectoSincronizado = (proyecto) => {
  if (!proyecto) return false;
  const status = proyecto.sync_status || '';
  return status !== 'draft' && status !== 'pending';
};

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
      // Usar proyectosLocalService (misma fuente que pantalla principal)
      const data = await proyectosLocalService.obtenerProyectos();
      setProyectos(Array.isArray(data) ? data : []);
    } catch (err) {
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
    // Verificar si el proyecto está sincronizado
    if (!proyectoSincronizado(proyecto)) {
      Alert.alert(
        'Proyecto no sincronizado',
        'Este proyecto aún no se ha sincronizado con el servidor. Sincroniza primero para poder agregar colaboradores.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }
    setProyectoSeleccionado(proyecto);
    setModalVisible(true);
  };

  // --- RENDER ---
  const sincronizados = proyectos.filter(p => proyectoSincronizado(p));
  const noSincronizados = proyectos.filter(p => !proyectoSincronizado(p));

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

        {/* Leyenda de estados */}
        {(noSincronizados.length > 0) && (
          <View style={[styles.card, isDark && styles.cardDark, { marginBottom: 12, paddingVertical: 12 }]}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
              <Text style={[styles.legendText, isDark && styles.legendTextDark]}>
                {noSincronizados.length} proyecto{noSincronizados.length > 1 ? 's' : ''} pendiente{sincronizados.length !== 1 ? 's' : ''} de sincronizar
              </Text>
            </View>
            <Text style={[styles.legendSubtext, isDark && styles.legendSubtextDark]}>
              Sincroniza primero para poder gestionar colaboradores
            </Text>
          </View>
        )}

        {/* Lista de proyectos sincronizados */}
        {sincronizados.length > 0 && (
          <>
            <Text style={[styles.groupTitle, isDark && styles.groupTitleDark]}>
              Proyectos Disponibles
            </Text>
            <View style={[styles.card, isDark && styles.cardDark]}>
              {sincronizados.map((proy, index) => (
                <View key={proy.uuid_movil || proy.id || `sync-${index}`}>
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
                  {index < sincronizados.length - 1 && (
                    <View style={[styles.divider, isDark && styles.dividerDark]} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Lista de proyectos NO sincronizados (deshabilitados) */}
        {noSincronizados.length > 0 && (
          <>
            <Text style={[styles.groupTitle, isDark && styles.groupTitleDark, { marginTop: sincronizados.length > 0 ? 20 : 0 }]}>
              Pendiente de Sincronizar
            </Text>
            <View style={[styles.card, isDark && styles.cardDark, styles.cardDisabled]}>
              {noSincronizados.map((proy, index) => (
                <View key={proy.uuid_movil || proy.id || `nosync-${index}`}>
                  <TouchableOpacity
                    style={[styles.row, styles.rowDisabled]}
                    onPress={() => abrirGestion(proy)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.rowIconWrap, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                        <MaterialCommunityIcons name="flask-outline" size={16} color="#FF9500" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.rowNombre, styles.rowNombreDisabled, isDark && styles.textWhite]}
                          numberOfLines={1}
                        >
                          {proy.titulo || 'Sin título'}
                        </Text>
                        <View style={styles.pendingBadge}>
                          <MaterialCommunityIcons name="cloud-upload-outline" size={10} color="#FF9500" />
                          <Text style={styles.pendingBadgeText}>Pendiente</Text>
                        </View>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="lock-outline" size={18} color="#8E8E93" />
                  </TouchableOpacity>
                  {index < noSincronizados.length - 1 && (
                    <View style={[styles.divider, isDark && styles.dividerDark]} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Empty state */}
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
        ) : null}
      </ScrollView>

      {/* Modal de gestion de colaboradores */}
      <ColaboradoresModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        proyectoId={proyectoSeleccionado?.uuid_movil || proyectoSeleccionado?.id}
      />
    </View>
  );
}
