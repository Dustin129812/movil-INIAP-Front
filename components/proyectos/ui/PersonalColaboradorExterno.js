import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColaboradoresExternos } from '../../../services/colaboradoresExternos';
import { editarProyectoStyles as baseStyles } from '../../../src/styles/editarProyectoStyles';

const CI_REGEX = /^\d{10}$/;

const normalizarColaboradorExterno = (item) => {
  const catalogo = item?.colaborador_externo || item?.colaboradorExterno || item?.colaborador || {};

  return {
    id: item?.colaborador_externo_id ?? item?.colaboradorExternoId ?? catalogo?.id ?? item?.id ?? item?.uuid,
    nombre_completo: item?.nombre_completo || catalogo?.nombre_completo || item?.nombre || catalogo?.nombre || 'Sin nombre',
    ci: item?.ci || catalogo?.ci || item?.cedula || catalogo?.cedula || 'Sin CI',
    participacion: item?.participacion || item?.pivot?.participacion || catalogo?.participacion || '',
  };
};

const extraerColaboradorCreado = (data) => (
  data?.colaborador_externo || data?.colaboradorExterno || data?.colaborador || data
);

const PersonalColaboradorExterno = ({ proyectoId, syncStatus = null, disabled = false, isDark = false }) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [ci, setCi] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [participacion, setParticipacion] = useState('');
  const [colaboradorEliminandoId, setColaboradorEliminandoId] = useState(null);

  const {
    colaboradoresExternos,
    isLoading,
    isSearching,
    isSaving,
    isDeleting,
    error,
    cargarColaboradoresExternos,
    buscarColaboradoresExternos,
    registrarColaboradorExterno,
    asociarColaboradorExterno,
    eliminarColaboradorExterno,
  } = useColaboradoresExternos(proyectoId, syncStatus);

  const puedeGestionar = Boolean(proyectoId) && !disabled;

  const colaboradoresNormalizados = useMemo(() => (
    colaboradoresExternos
      .map(normalizarColaboradorExterno)
      .filter((item) => item.id !== undefined && item.id !== null)
  ), [colaboradoresExternos]);

  const resultadosNormalizados = useMemo(() => (
    resultadosBusqueda
      .map(normalizarColaboradorExterno)
      .filter((item) => item.id !== undefined && item.id !== null)
  ), [resultadosBusqueda]);

  const colaboradorActivo = colaboradorSeleccionado
    ? normalizarColaboradorExterno(colaboradorSeleccionado)
    : null;
  const tieneOrigenColaborador = Boolean(colaboradorActivo) || modoRegistro;

  const estaAsociado = useCallback((colaboradorId) => (
    colaboradoresNormalizados.some((item) => String(item.id) === String(colaboradorId))
  ), [colaboradoresNormalizados]);

  const limpiarFormulario = useCallback(() => {
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    setColaboradorSeleccionado(null);
    setModoRegistro(false);
    setCi('');
    setNombreCompleto('');
    setParticipacion('');
  }, []);

  const cerrarModal = useCallback(() => {
    setModalVisible(false);
    limpiarFormulario();
  }, [limpiarFormulario]);

  useEffect(() => {
    if (puedeGestionar) {
      cargarColaboradoresExternos();
    }
  }, [puedeGestionar, cargarColaboradoresExternos]);

  useEffect(() => {
    if (!modalVisible) return undefined;

    const termino = terminoBusqueda.trim();
    if (termino.length < 2) {
      setResultadosBusqueda([]);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      const resultados = await buscarColaboradoresExternos(termino);
      setResultadosBusqueda(Array.isArray(resultados) ? resultados : []);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [buscarColaboradoresExternos, modalVisible, terminoBusqueda]);

  const abrirRegistro = () => {
    const termino = terminoBusqueda.trim();
    setColaboradorSeleccionado(null);
    setModoRegistro(true);
    setCi(/^\d+$/.test(termino) ? termino.slice(0, 10) : '');
    setNombreCompleto(/^\d+$/.test(termino) ? '' : termino.slice(0, 255));
  };

  const seleccionarColaborador = (item) => {
    setColaboradorSeleccionado(item);
    setModoRegistro(false);
    setCi('');
    setNombreCompleto('');
  };

  const validarRegistro = () => {
    if (!CI_REGEX.test(ci.trim())) {
      Alert.alert('Error', 'La cédula / CI debe tener exactamente 10 dígitos.');
      return false;
    }

    if (!nombreCompleto.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido.');
      return false;
    }

    return true;
  };

  const guardarAsociacion = async () => {
    if (!tieneOrigenColaborador) {
      Alert.alert('Error', 'Selecciona un colaborador existente o registra uno nuevo.');
      return;
    }

    if (!participacion.trim()) {
      Alert.alert('Error', 'La participación es requerida.');
      return;
    }

    let colaboradorId = colaboradorActivo?.id;

    if (!colaboradorId) {
      if (!validarRegistro()) return;

      const resultadoRegistro = await registrarColaboradorExterno({
        ci: ci.trim(),
        nombre_completo: nombreCompleto.trim(),
      });

      if (!resultadoRegistro.success) {
        Alert.alert('Error', resultadoRegistro.message || 'No se pudo registrar el colaborador externo.');
        return;
      }

      const colaboradorCreado = normalizarColaboradorExterno(extraerColaboradorCreado(resultadoRegistro.data));
      colaboradorId = colaboradorCreado.id;
    }

    if (!colaboradorId) {
      Alert.alert('Error', 'No se pudo identificar al colaborador externo.');
      return;
    }

    if (estaAsociado(colaboradorId)) {
      Alert.alert('Aviso', 'Este colaborador externo ya está asociado al proyecto.');
      return;
    }

    const resultado = await asociarColaboradorExterno(colaboradorId, participacion.trim());

    if (resultado.success) {
      if (resultado.pendingSync) {
        Alert.alert(
          'Sincronizacion pendiente',
          resultado.message || 'El proyecto esta pendiente de sincronizacion.'
        );
      }
      cerrarModal();
      return;
    }

    Alert.alert('Error', resultado.message || 'No se pudo asociar el colaborador externo.');
  };

  const confirmarEliminar = (colaborador) => {
    if (isDeleting) return;

    Alert.alert(
      'Eliminar asociación',
      `¿Quitar a ${colaborador.nombre_completo} de este proyecto?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (isDeleting) return;

            setColaboradorEliminandoId(colaborador.id);
            try {
              const resultado = await eliminarColaboradorExterno(colaborador.id);
              if (!resultado?.success) {
                Alert.alert('Error', resultado?.message || 'No se pudo eliminar la asociación.');
              }
              if (resultado?.success && resultado.pendingSync) {
                Alert.alert(
                  'Sincronizacion pendiente',
                  resultado.message || 'El proyecto esta pendiente de sincronizacion.'
                );
              }
            } finally {
              setColaboradorEliminandoId(null);
            }
          },
        },
      ],
    );
  };

  const renderContenido = () => {
    if (!puedeGestionar) {
      return (
        <View style={localStyles.emptyState}>
          <MaterialCommunityIcons name="account-clock-outline" size={28} color="#8E8E93" />
          <Text style={[localStyles.emptyText, isDark && localStyles.emptyTextDark]}>
            Guarda el proyecto primero para asociar personal colaborador externo.
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={localStyles.loadingRow}>
          <ActivityIndicator color="#34C759" />
          <Text style={[localStyles.mutedText, isDark && localStyles.mutedTextDark]}>
            Cargando personal externo...
          </Text>
        </View>
      );
    }

    return (
      <>
        {colaboradoresNormalizados.length === 0 ? (
          <View style={localStyles.emptyState}>
            <MaterialCommunityIcons name="account-plus-outline" size={28} color="#34C759" />
            <Text style={[localStyles.emptyText, isDark && localStyles.emptyTextDark]}>
              No hay personal externo asociado.
            </Text>
          </View>
        ) : (
          <View style={localStyles.listContainer}>
            {colaboradoresNormalizados.map((colaborador) => {
              const eliminandoEste = isDeleting && String(colaboradorEliminandoId) === String(colaborador.id);

              return (
                <View key={`${colaborador.id}-${colaborador.ci}`} style={[localStyles.externalItem, isDark && localStyles.externalItemDark]}>
                  <View style={localStyles.externalIcon}>
                    <MaterialCommunityIcons name="account-outline" size={18} color="#34C759" />
                  </View>
                  <View style={localStyles.externalInfo}>
                    <Text style={[localStyles.externalName, isDark && localStyles.externalNameDark]} numberOfLines={1}>
                      {colaborador.nombre_completo}
                    </Text>
                    <Text style={[localStyles.externalCi, isDark && localStyles.externalCiDark]} numberOfLines={1}>
                      CI: {colaborador.ci}
                    </Text>
                    {!!colaborador.participacion && (
                      <Text style={[localStyles.participacionText, isDark && localStyles.participacionTextDark]}>
                        Participación: {colaborador.participacion}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[localStyles.deleteButton, isDeleting && localStyles.deleteButtonDisabled]}
                    onPress={() => confirmarEliminar(colaborador)}
                    disabled={isDeleting}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {eliminandoEste ? (
                      <ActivityIndicator size="small" color="#FF3B30" />
                    ) : (
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color={isDeleting ? '#8E8E93' : '#FF3B30'} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {!!error && (
          <Text style={localStyles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[baseStyles.dateInput, isDark && baseStyles.dateInputDark, localStyles.addButton]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.75}
        >
          <View style={baseStyles.colaboradorRow}>
            <MaterialCommunityIcons name="account-plus" size={20} color="#34C759" />
            <Text style={[baseStyles.dateText, isDark && baseStyles.dateTextDark, localStyles.addButtonText]}>
              Agregar personal externo
            </Text>
          </View>
          <MaterialCommunityIcons name="plus" size={20} color="#34C759" />
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={baseStyles.section}>
      <Text style={[baseStyles.sectionTitle, isDark && baseStyles.sectionTitleDark]}>
        Personal colaborador externo ({colaboradoresNormalizados.length})
      </Text>
      <View style={[baseStyles.card, isDark && baseStyles.cardDark]}>
        {renderContenido()}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModal}
      >
        <KeyboardAvoidingView
          style={localStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={cerrarModal} />
          <View style={[localStyles.modalContent, isDark && localStyles.modalContentDark, { paddingBottom: insets.bottom + 16 }]}>
            <View style={localStyles.dragHandleWrap}>
              <View style={localStyles.dragHandle} />
            </View>
            <View style={localStyles.modalHeader}>
              <Text style={[localStyles.modalTitle, isDark && localStyles.modalTitleDark]}>
                Personal externo
              </Text>
              <TouchableOpacity onPress={cerrarModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={localStyles.inputGroup}>
                <Text style={baseStyles.inputLabel}>Buscar por CI o nombre</Text>
                <View style={[localStyles.searchBox, isDark && localStyles.searchBoxDark]}>
                  <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" />
                  <TextInput
                    style={[localStyles.searchInput, isDark && localStyles.searchInputDark]}
                    value={terminoBusqueda}
                    onChangeText={(texto) => {
                      setTerminoBusqueda(texto);
                      setColaboradorSeleccionado(null);
                    }}
                    placeholder="Buscar colaborador externo"
                    placeholderTextColor="#8E8E93"
                    autoCapitalize="words"
                  />
                  {isSearching && <ActivityIndicator size="small" color="#34C759" />}
                </View>
              </View>

              {resultadosNormalizados.length > 0 && (
                <View style={localStyles.resultsContainer}>
                  {resultadosNormalizados.map((item) => {
                    const seleccionado = colaboradorActivo && String(colaboradorActivo.id) === String(item.id);
                    const yaAgregado = estaAsociado(item.id);

                    return (
                      <TouchableOpacity
                        key={`${item.id}-${item.ci}`}
                        style={[
                          localStyles.resultItem,
                          isDark && localStyles.resultItemDark,
                          yaAgregado && localStyles.resultItemDisabled,
                          seleccionado && localStyles.resultItemSelected,
                        ]}
                        onPress={() => !yaAgregado && seleccionarColaborador(item)}
                        disabled={yaAgregado}
                        activeOpacity={0.75}
                      >
                        <View style={localStyles.resultIcon}>
                          <MaterialCommunityIcons name="account-outline" size={18} color="#34C759" />
                        </View>
                        <View style={localStyles.resultInfo}>
                          <Text style={[localStyles.resultName, isDark && localStyles.resultNameDark]} numberOfLines={1}>
                            {item.nombre_completo}
                          </Text>
                          <Text style={[localStyles.resultCi, isDark && localStyles.resultCiDark]} numberOfLines={1}>
                            CI: {item.ci}
                          </Text>
                        </View>
                        {yaAgregado ? (
                          <View style={[localStyles.addedBadge, isDark && localStyles.addedBadgeDark]}>
                            <Text style={[localStyles.addedBadgeText, isDark && localStyles.addedBadgeTextDark]}>
                              Ya agregado
                            </Text>
                          </View>
                        ) : seleccionado ? (
                          <MaterialCommunityIcons name="check-circle" size={20} color="#34C759" />
                        ) : (
                          <View style={localStyles.addCircle}>
                            <MaterialCommunityIcons name="plus" size={16} color="#34C759" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {terminoBusqueda.trim().length >= 2 && !isSearching && !modoRegistro && !colaboradorActivo && (
                <TouchableOpacity
                  style={[localStyles.registerPrompt, isDark && localStyles.registerPromptDark]}
                  onPress={abrirRegistro}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons name="account-plus-outline" size={20} color="#34C759" />
                  <Text style={[localStyles.registerPromptText, isDark && localStyles.registerPromptTextDark]}>
                    Registrar nuevo colaborador externo
                  </Text>
                </TouchableOpacity>
              )}

              {colaboradorActivo && (
                <View style={[localStyles.selectedBox, isDark && localStyles.selectedBoxDark]}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#34C759" />
                  <View style={localStyles.selectedInfo}>
                    <Text style={[localStyles.selectedTitle, isDark && localStyles.selectedTitleDark]}>
                      {colaboradorActivo.nombre_completo}
                    </Text>
                    <Text style={[localStyles.selectedSubtitle, isDark && localStyles.selectedSubtitleDark]}>
                      CI: {colaboradorActivo.ci}
                    </Text>
                  </View>
                </View>
              )}

              {modoRegistro && (
                <View style={localStyles.registerForm}>
                  <View style={localStyles.inputGroup}>
                    <Text style={baseStyles.inputLabel}>Cédula / CI</Text>
                    <TextInput
                      style={[baseStyles.input, isDark && baseStyles.inputDark]}
                      value={ci}
                      onChangeText={(texto) => setCi(texto.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10 dígitos"
                      placeholderTextColor="#8E8E93"
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                  </View>
                  <View style={localStyles.inputGroup}>
                    <Text style={baseStyles.inputLabel}>Nombre completo</Text>
                    <TextInput
                      style={[baseStyles.input, isDark && baseStyles.inputDark]}
                      value={nombreCompleto}
                      onChangeText={setNombreCompleto}
                      placeholder="Nombre y apellido"
                      placeholderTextColor="#8E8E93"
                      autoCapitalize="words"
                      maxLength={255}
                    />
                  </View>
                </View>
              )}

              <View style={localStyles.inputGroup}>
                <Text style={baseStyles.inputLabel}>Participación</Text>
                <TextInput
                  style={[baseStyles.input, baseStyles.inputMultiline, isDark && baseStyles.inputDark]}
                  value={participacion}
                  onChangeText={setParticipacion}
                  placeholder="Detalle la participación en el proyecto"
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={255}
                />
              </View>

              <TouchableOpacity
                style={[localStyles.primaryButton, (isSaving || !tieneOrigenColaborador) && localStyles.primaryButtonDisabled]}
                onPress={guardarAsociacion}
                disabled={isSaving || !tieneOrigenColaborador}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" />
                    <Text style={localStyles.primaryButtonText}>
                      {colaboradorActivo ? 'Asociar al proyecto' : 'Registrar y asociar'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  mutedText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  mutedTextDark: {
    color: '#A1A1AA',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  emptyText: {
    color: '#636366',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyTextDark: {
    color: '#D1D5DB',
  },
  listContainer: {
    gap: 10,
    marginBottom: 14,
  },
  externalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.16)',
    borderRadius: 14,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
    padding: 12,
    gap: 10,
  },
  externalItemDark: {
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderColor: 'rgba(52, 199, 89, 0.25)',
  },
  externalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  externalInfo: {
    flex: 1,
    gap: 3,
  },
  externalName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  externalNameDark: {
    color: '#FFFFFF',
  },
  externalCi: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  externalCiDark: {
    color: '#A1A1AA',
  },
  participacionText: {
    color: '#374151',
    fontSize: 13,
    lineHeight: 18,
  },
  participacionTextDark: {
    color: '#E5E7EB',
  },
  deleteButton: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  addButton: {
    marginTop: 2,
  },
  addButtonText: {
    marginLeft: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    maxHeight: '88%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalContentDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  dragHandleWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(142, 142, 147, 0.35)',
  },
  modalTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  modalTitleDark: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchBoxDark: {
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#2C2C2E',
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    paddingVertical: 12,
  },
  searchInputDark: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  resultItemDark: {
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#2C2C2E',
  },
  resultItemSelected: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
  },
  resultItemDisabled: {
    opacity: 0.6,
  },
  resultIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  resultNameDark: {
    color: '#FFFFFF',
  },
  resultCi: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  resultCiDark: {
    color: '#A1A1AA',
  },
  addCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.14)',
  },
  addedBadge: {
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addedBadgeDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  addedBadgeText: {
    color: '#6B7280',
    fontSize: 11.5,
    fontWeight: '700',
  },
  addedBadgeTextDark: {
    color: '#A1A1AA',
  },
  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.22)',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    padding: 14,
    marginBottom: 16,
  },
  registerPromptDark: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  registerPromptText: {
    flex: 1,
    color: '#0B6B35',
    fontSize: 14,
    fontWeight: '700',
  },
  registerPromptTextDark: {
    color: '#7CE49B',
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 199, 89, 0.09)',
    padding: 12,
    marginBottom: 16,
  },
  selectedBoxDark: {
    backgroundColor: 'rgba(52, 199, 89, 0.14)',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedTitle: {
    color: '#0B6B35',
    fontSize: 15,
    fontWeight: '700',
  },
  selectedTitleDark: {
    color: '#7CE49B',
  },
  selectedSubtitle: {
    color: '#4B5563',
    fontSize: 13,
    marginTop: 2,
  },
  selectedSubtitleDark: {
    color: '#D1D5DB',
  },
  registerForm: {
    marginBottom: 2,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#0B6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PersonalColaboradorExterno;
