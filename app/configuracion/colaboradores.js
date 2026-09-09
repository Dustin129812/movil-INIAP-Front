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
import { buscarColaboradoresExternosLocales, registrarColaboradorExternoLocal, marcarColaboradorExternoComoSincronizado, marcarTodosProyectosComoSincronizados } from '../../db';
import { colaboradoresExternosService } from '../../services/colaboradoresExternos/colaboradoresExternosService';
import ColaboradoresModal from '../../components/proyectos/ui/ColaboradoresModal';
import ColaboradoresExternosModal from '../../components/proyectos/ui/ColaboradoresExternosModal';

import { StyleSheet } from 'react-native';

// ============================================
// HELPERS
// ============================================

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

  // External collaborators state
  const [externos, setExternos] = useState([]);
  const [loadingExternos, setLoadingExternos] = useState(false);
  const [modalExternoVisible, setModalExternoVisible] = useState(false);

  // --- EFECTOS ---
  const cargarProyectos = useCallback(async () => {
    setLoading(true);
    try {
      await marcarTodosProyectosComoSincronizados();
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

  // --- CARGAR EXTERNOS ---
  const cargarExternos = useCallback(async () => {
    setLoadingExternos(true);
    try {
      const locales = await buscarColaboradoresExternosLocales('');
      const sincronizados = Array.isArray(locales)
        ? locales.filter(c => c.sync_status === 'synced')
        : [];
      setExternos(sincronizados);
    } catch (_err) {
      setExternos([]);
    } finally {
      setLoadingExternos(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarExternos();
    }, [cargarExternos])
  );

  // --- HANDLERS ---
  const abrirGestion = (proyecto) => {
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

  // Colors
  const bg = isDark ? '#0D0D0F' : '#F2F2F7';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const textPrimary = isDark ? '#FFFFFF' : '#000000';
  const textSecondary = isDark ? '#98989F' : '#8E8E93';
  const textTertiary = isDark ? '#636366' : '#AEAEB2';
  const accentBlue = '#0A84FF';
  const accentGreen = '#34C759';
  const accentOrange = '#FF9500';
  const divider = isDark ? '#2C2C2E' : '#E5E5EA';
  const iconBgBlue = 'rgba(10,132,255,0.12)';
  const iconBgGreen = 'rgba(52,199,89,0.12)';
  const iconBgOrange = 'rgba(255,149,0,0.12)';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
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
        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          Colaboradores
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===================== */}
        {/* SECCION: PERSONAL EXTERNO */}
        {/* ===================== */}
        <View style={[styles.sectionHeader]}>
          <View style={[styles.sectionIconBox, { backgroundColor: iconBgGreen }]}>
            <MaterialCommunityIcons name="account-hard-hat-outline" size={18} color={accentGreen} />
          </View>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Personal Externo</Text>
          <View style={[styles.sectionBadge, { backgroundColor: iconBgGreen }]}>
            <Text style={[styles.sectionBadgeText, { color: accentGreen }]}>{externos.length}</Text>
          </View>
        </View>

        <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
          Personal que participa en proyectos de investigación
        </Text>

        {/* Card: Agregar externo */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={() => setModalExternoVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.cardRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: iconBgGreen }]}>
              <MaterialCommunityIcons name="account-plus" size={18} color={accentGreen} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: textPrimary }]}>
                Agregar personal externo
              </Text>
              <Text style={[styles.cardSubtitle, { color: textSecondary }]}>
                Registrar nuevo collaborator o buscar existente
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={textTertiary} />
          </View>
        </TouchableOpacity>

        {/* Lista de externos */}
        {externos.length > 0 && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 8 }]}>
            {loadingExternos ? (
              <ActivityIndicator size="small" color={accentGreen} style={{ paddingVertical: 16 }} />
            ) : (
              externos.map((ext, index) => (
                <View key={ext.id || ext.ci}>
                  <View style={styles.cardRow}>
                    <View style={[styles.cardIconWrap, { backgroundColor: iconBgGreen }]}>
                      <MaterialCommunityIcons name="account" size={18} color={accentGreen} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={1}>
                        {ext.nombre_completo || ext.nombre || 'Sin nombre'}
                      </Text>
                      <Text style={[styles.cardSubtitle, { color: textSecondary }]}>
                        C.I: {ext.ci}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="cloud-check" size={16} color={accentGreen} />
                  </View>
                  {index < externos.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: divider }]} />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Empty externos */}
        {!loadingExternos && externos.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <MaterialCommunityIcons name="account-off-outline" size={32} color={textTertiary} />
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Sin personal externo registrado
            </Text>
          </View>
        )}

        {/* ===================== */}
        {/* SECCION: PROYECTOS */}
        {/* ===================== */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <View style={[styles.sectionIconBox, { backgroundColor: iconBgBlue }]}>
            <MaterialCommunityIcons name="flask-outline" size={18} color={accentBlue} />
          </View>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Proyectos</Text>
          <View style={[styles.sectionBadge, { backgroundColor: iconBgBlue }]}>
            <Text style={[styles.sectionBadgeText, { color: accentBlue }]}>{sincronizados.length}</Text>
          </View>
        </View>

        <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
          Selecciona un proyecto para gestionar sus colaboradores
        </Text>

        {/* Leyenda de estados */}
        {noSincronizados.length > 0 && (
          <View style={[styles.alertBanner, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={16} color={accentOrange} />
            <Text style={[styles.alertText, { color: accentOrange }]}>
              {noSincronizados.length} proyecto{noSincronizados.length > 1 ? 's' : ''} pendiente{noSincronizados.length > 1 ? 's' : ''} de sincronizar
            </Text>
          </View>
        )}

        {/* Lista de proyectos sincronizados */}
        {loading ? (
          <ActivityIndicator size="small" color={accentBlue} style={{ paddingVertical: 24 }} />
        ) : sincronizados.length > 0 ? (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 8 }]}>
            {sincronizados.map((proy, index) => (
              <View key={proy.uuid_movil || proy.id}>
                <TouchableOpacity
                  style={styles.cardRow}
                  onPress={() => abrirGestion(proy)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIconWrap, { backgroundColor: iconBgBlue }]}>
                    <MaterialCommunityIcons name="flask" size={18} color={accentBlue} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={1}>
                      {proy.titulo || 'Sin título'}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: textSecondary }]} numberOfLines={1}>
                      {proy.variedad || 'Sin variedad'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={textTertiary} />
                </TouchableOpacity>
                {index < sincronizados.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: divider }]} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <MaterialCommunityIcons name="flask-empty-outline" size={32} color={textTertiary} />
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              No hay proyectos disponibles
            </Text>
          </View>
        )}

        {/* Proyectos no sincronizados */}
        {noSincronizados.length > 0 && (
          <>
            <Text style={[styles.lockedSectionTitle, { color: textSecondary }]}>
              Bloqueados — sincroniza primero
            </Text>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, opacity: 0.6 }]}>
              {noSincronizados.map((proy, index) => (
                <View key={proy.uuid_movil || proy.id}>
                  <View style={[styles.cardRow, { opacity: 0.7 }]}>
                    <View style={[styles.cardIconWrap, { backgroundColor: iconBgOrange }]}>
                      <MaterialCommunityIcons name="flask" size={18} color={accentOrange} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: textSecondary }]} numberOfLines={1}>
                        {proy.titulo || 'Sin título'}
                      </Text>
                      <View style={styles.pendingRow}>
                        <MaterialCommunityIcons name="cloud-upload-outline" size={12} color={accentOrange} />
                        <Text style={[styles.pendingText, { color: accentOrange }]}>Pendiente</Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="lock-outline" size={18} color={textTertiary} />
                  </View>
                  {index < noSincronizados.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: divider }]} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modales */}
      <ColaboradoresModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        proyectoId={proyectoSeleccionado?.uuid_movil || proyectoSeleccionado?.id}
      />

      <ColaboradoresExternosModal
        visible={modalExternoVisible}
        onClose={() => {
          setModalExternoVisible(false);
          cargarExternos();
        }}
        onSelectMultiple={async (seleccionTemporal) => {
          for (const ext of seleccionTemporal) {
            try {
              const colabLocal = await registrarColaboradorExternoLocal({
                ci: ext.ci,
                nombre_completo: ext.nombre_completo,
                server_id: ext.server_id || null,
              });

              if (colabLocal && colabLocal.id) {
                try {
                  const resultado = await colaboradoresExternosService.registrarColaboradorExterno({
                    ci: ext.ci,
                    nombre_completo: ext.nombre_completo,
                  });

                  if (resultado.success && resultado.data) {
                    const serverId = resultado.data?.id || resultado.data?.server_id || resultado.data?.colaborador_externo?.id;
                    if (serverId) {
                      await marcarColaboradorExternoComoSincronizado(colabLocal.id, serverId);
                    }
                  }
                } catch (err) {
                  console.log('Error sync externo:', err);
                }
              }
            } catch (err) {
              console.log('Error guardar externo:', err);
            }
          }
          setModalExternoVisible(false);
          cargarExternos();
        }}
        seleccionados={[]}
      />
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // --- SECCIONES ---
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    marginLeft: 38,
  },

  // --- CARDS ---
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },

  // --- ALERT BANNER ---
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // --- EMPTY STATE ---
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // --- LOCKED SECTION ---
  lockedSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // --- PENDING ---
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
