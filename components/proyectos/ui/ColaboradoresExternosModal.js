import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buscarColaboradoresExternosLocales } from '../../../db';
import { colaboradoresExternosService } from '../../../services/colaboradoresExternos/colaboradoresExternosService';

const ACCENT = '#34C759';
const CI_REGEX = /^\d{10}$/;

const obtenerTokenAutenticado = async () => {
  try {
    const usuarioRaw = await AsyncStorage.getItem('datos_usuario');
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    if (usuario?.esInvitado) {
      return null;
    }

    return (
      await AsyncStorage.getItem('token_acceso') ||
      await AsyncStorage.getItem('token') ||
      await AsyncStorage.getItem('access_token') ||
      await AsyncStorage.getItem('userToken')
    );
  } catch (_error) {
    return null;
  }
};

const getInitials = (nombre) => {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
};

const AVATAR_GRADIENTS = [
  ['#34C759', '#1F8B3B'],
  ['#0A84FF', '#0059C9'],
  ['#FF9500', '#C96E00'],
  ['#AF52DE', '#7C2FA6'],
  ['#FF375F', '#C41F42'],
];

const gradientPara = (texto) => {
  const codigo = (texto || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[codigo % AVATAR_GRADIENTS.length];
};

const normalizarColaborador = (item, origen = 'draft') => ({
  id: item?.id ?? item?.local_id ?? item?.server_id ?? `temporal-${item?.ci || Date.now()}`,
  local_id: item?.local_id ?? (origen === 'local' ? item?.id : null),
  server_id: item?.server_id ?? (origen === 'server' ? item?.id : null),
  ci: String(item?.ci || '').trim(),
  nombre_completo: String(item?.nombre_completo || item?.nombre || '').trim(),
  participacion: String(item?.participacion || '').trim(),
  origen,
});

const existeCi = (lista, ci) => (
  lista.some((item) => String(item.ci || '').trim() === String(ci || '').trim())
);

const GlassIconButton = ({ icon, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <BlurView intensity={50} tint="dark" style={styles.glassButton}>
      <View style={styles.glassButtonOverlay} pointerEvents="none" />
      <MaterialCommunityIcons name={icon} size={18} color="#FFFFFF" />
    </BlurView>
  </TouchableOpacity>
);

const ColaboradorCard = ({ colaborador, onRemove }) => (
  <BlurView intensity={35} tint="dark" style={styles.colaboradorCard}>
    <View style={styles.cardOverlay} pointerEvents="none" />
    <LinearGradient colors={gradientPara(colaborador.nombre_completo)} style={styles.avatar}>
      <Text style={styles.avatarInitials}>{getInitials(colaborador.nombre_completo)}</Text>
    </LinearGradient>
    <View style={styles.colaboradorInfo}>
      <Text style={styles.colaboradorNombre} numberOfLines={1}>{colaborador.nombre_completo}</Text>
      <Text style={styles.colaboradorMeta} numberOfLines={1}>CI: {colaborador.ci}</Text>
      <Text style={styles.colaboradorParticipacion} numberOfLines={2}>
        Participación: {colaborador.participacion}
      </Text>
    </View>
    <TouchableOpacity
      style={styles.eliminarBtn}
      onPress={() => onRemove(colaborador.ci)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.eliminarBtnBg}>
        <MaterialCommunityIcons name="close" size={14} color="#FF453A" />
      </View>
    </TouchableOpacity>
  </BlurView>
);

const ResultadoItem = ({ colaborador, seleccionado, activo, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    disabled={seleccionado}
    onPress={() => !seleccionado && onPress(colaborador)}
  >
    <BlurView
      intensity={35}
      tint="dark"
      style={[
        styles.colaboradorCard,
        seleccionado && styles.resultadoDisabled,
        activo && styles.resultadoActivo,
      ]}
    >
      <View style={styles.cardOverlay} pointerEvents="none" />
      <LinearGradient colors={gradientPara(colaborador.nombre_completo)} style={styles.avatar}>
        <Text style={styles.avatarInitials}>{getInitials(colaborador.nombre_completo)}</Text>
      </LinearGradient>
      <View style={styles.colaboradorInfo}>
        <Text style={styles.colaboradorNombre} numberOfLines={1}>{colaborador.nombre_completo}</Text>
        <Text style={styles.colaboradorMeta} numberOfLines={1}>CI: {colaborador.ci}</Text>
      </View>
      {seleccionado ? (
        <View style={styles.etiquetaAgregado}>
          <Text style={styles.etiquetaAgregadoText}>Ya agregado</Text>
        </View>
      ) : activo ? (
        <View style={styles.checkSeleccionado}>
          <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" />
        </View>
      ) : (
        <View style={styles.addCircle}>
          <MaterialCommunityIcons name="plus" size={16} color={ACCENT} />
        </View>
      )}
    </BlurView>
  </TouchableOpacity>
);

export default function ColaboradoresExternosModal({
  visible,
  onClose,
  seleccionados = [],
  onSelectSingle,
  onSelectMultiple,
}) {
  const insets = useSafeAreaInsets();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [seleccionTemporal, setSeleccionTemporal] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [usaBackend, setUsaBackend] = useState(false);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [colaboradorActivo, setColaboradorActivo] = useState(null);
  const [ciNuevo, setCiNuevo] = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [participacion, setParticipacion] = useState('');

  const resultadosNormalizados = useMemo(() => (
    resultadosBusqueda
      .map((item) => normalizarColaborador(item, usaBackend ? 'server' : 'local'))
      .filter((item) => item.ci && item.nombre_completo)
  ), [resultadosBusqueda, usaBackend]);

  const limpiarFormulario = useCallback(() => {
    setModoRegistro(false);
    setColaboradorActivo(null);
    setCiNuevo('');
    setNombreNuevo('');
    setParticipacion('');
  }, []);

  const buscarColaboradores = useCallback(async (texto = '') => {
    setBuscando(true);
    try {
      const token = await obtenerTokenAutenticado();
      setUsaBackend(Boolean(token));

      if (token) {
        const resultados = await colaboradoresExternosService.buscarColaboradoresExternos(texto);
        setResultadosBusqueda(Array.isArray(resultados) ? resultados : []);
        return;
      }

      const resultadosLocales = await buscarColaboradoresExternosLocales(texto);
      setResultadosBusqueda(Array.isArray(resultadosLocales) ? resultadosLocales : []);
    } catch (_error) {
      setResultadosBusqueda([]);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    setSeleccionTemporal((seleccionados || []).map((item) => normalizarColaborador(item, item?.origen || 'draft')));
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    limpiarFormulario();
    buscarColaboradores('');
  }, [visible, seleccionados, limpiarFormulario, buscarColaboradores]);

  const handleBuscar = useCallback((texto) => {
    setTerminoBusqueda(texto);
    setColaboradorActivo(null);
    setModoRegistro(false);
    buscarColaboradores(texto);
  }, [buscarColaboradores]);

  const abrirRegistro = useCallback(() => {
    const termino = terminoBusqueda.trim();
    setColaboradorActivo(null);
    setModoRegistro(true);
    setCiNuevo(/^\d+$/.test(termino) ? termino.slice(0, 10) : '');
    setNombreNuevo(/^\d+$/.test(termino) ? '' : termino.slice(0, 255));
    setParticipacion('');
  }, [terminoBusqueda]);

  const seleccionarExistente = useCallback((colaborador) => {
    setModoRegistro(false);
    setColaboradorActivo(colaborador);
    setCiNuevo('');
    setNombreNuevo('');
    setParticipacion('');
  }, []);

  const quitarSeleccion = useCallback((ci) => {
    setSeleccionTemporal((prev) => prev.filter((item) => item.ci !== ci));
  }, []);

  const agregarSeleccion = useCallback(() => {
    const participacionLimpia = participacion.trim();

    if (!participacionLimpia) {
      Alert.alert('Falta información', 'Ingresa la participación en el proyecto.');
      return;
    }

    let nuevoColaborador;

    if (modoRegistro) {
      const ci = ciNuevo.trim();
      const nombre = nombreNuevo.trim();

      if (!CI_REGEX.test(ci)) {
        Alert.alert('Cédula inválida', 'La cédula debe tener exactamente 10 números.');
        return;
      }

      if (!nombre) {
        Alert.alert('Falta información', 'Ingresa el nombre completo.');
        return;
      }

      nuevoColaborador = normalizarColaborador({
        id: `temporal-${ci}`,
        ci,
        nombre_completo: nombre,
        participacion: participacionLimpia,
      });
    } else if (colaboradorActivo) {
      nuevoColaborador = {
        ...colaboradorActivo,
        participacion: participacionLimpia,
      };
    } else {
      Alert.alert('Falta información', 'Selecciona o registra un colaborador externo.');
      return;
    }

    if (existeCi(seleccionTemporal, nuevoColaborador.ci)) {
      Alert.alert('Colaborador duplicado', 'Esta cédula ya fue agregada al proyecto.');
      return;
    }

    if (onSelectSingle) {
      onSelectSingle(nuevoColaborador);
      onClose();
      return;
    }

    setSeleccionTemporal((prev) => [...prev, nuevoColaborador]);
    limpiarFormulario();
  }, [
    ciNuevo,
    nombreNuevo,
    participacion,
    modoRegistro,
    colaboradorActivo,
    seleccionTemporal,
    onClose,
    onSelectSingle,
    limpiarFormulario,
  ]);

  const confirmarSeleccion = useCallback(() => {
    if (onSelectMultiple) {
      onSelectMultiple(seleccionTemporal);
    }
    onClose();
  }, [onClose, onSelectMultiple, seleccionTemporal]);

  const cerrar = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const activoId = colaboradorActivo?.server_id || colaboradorActivo?.local_id || colaboradorActivo?.id;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={cerrar}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <View style={styles.headerRow}>
            <GlassIconButton icon="close" onPress={cerrar} />
            <Text style={styles.headerTitle} numberOfLines={1}>Colaboradores externos</Text>
            <View style={{ width: 34 }} />
          </View>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: Math.max(insets.top, 16) + 68, paddingBottom: insets.bottom + 112 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Seleccionados ({seleccionTemporal.length})</Text>
            {seleccionTemporal.length === 0 ? (
              <BlurView intensity={30} tint="dark" style={styles.emptyBox}>
                <View style={styles.cardOverlay} pointerEvents="none" />
                <MaterialCommunityIcons name="account-multiple-plus-outline" size={34} color="#8E8E93" />
                <Text style={styles.emptyText}>Agrega personal externo al proyecto</Text>
              </BlurView>
            ) : (
              seleccionTemporal.map((item) => (
                <ColaboradorCard
                  key={`${item.ci}-${item.server_id || item.local_id || item.id}`}
                  colaborador={item}
                  onRemove={quitarSeleccion}
                />
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Buscar o registrar</Text>
            <BlurView intensity={40} tint="dark" style={styles.searchBox}>
              <View style={styles.cardOverlay} pointerEvents="none" />
              <MaterialCommunityIcons name="magnify" size={18} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por CI o nombre..."
                placeholderTextColor="#8E8E93"
                value={terminoBusqueda}
                onChangeText={handleBuscar}
              />
              {buscando ? (
                <ActivityIndicator size="small" color={ACCENT} />
              ) : terminoBusqueda.length > 0 ? (
                <TouchableOpacity onPress={() => handleBuscar('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#8E8E93" />
                </TouchableOpacity>
              ) : null}
            </BlurView>

            <TouchableOpacity style={styles.secondaryButton} onPress={abrirRegistro} activeOpacity={0.8}>
              <MaterialCommunityIcons name="account-plus-outline" size={18} color={ACCENT} />
              <Text style={styles.secondaryButtonText}>Registrar nuevo colaborador externo</Text>
            </TouchableOpacity>

            {resultadosNormalizados.length > 0 ? (
              <FlatList
                data={resultadosNormalizados}
                keyExtractor={(item) => `${item.ci}-${item.server_id || item.local_id || item.id}`}
                renderItem={({ item }) => {
                  const yaSeleccionado = existeCi(seleccionTemporal, item.ci);
                  const itemId = item.server_id || item.local_id || item.id;
                  const activo = activoId && String(activoId) === String(itemId);

                  return (
                    <ResultadoItem
                      colaborador={item}
                      seleccionado={yaSeleccionado}
                      activo={activo}
                      onPress={seleccionarExistente}
                    />
                  );
                }}
                scrollEnabled={false}
              />
            ) : !buscando ? (
              <View style={styles.emptySearch}>
                <MaterialCommunityIcons name="account-search-outline" size={32} color="#8E8E93" />
                <Text style={styles.emptySearchText}>No se encontraron colaboradores externos</Text>
              </View>
            ) : null}

            {(modoRegistro || colaboradorActivo) && (
              <BlurView intensity={35} tint="dark" style={styles.formCard}>
                <View style={styles.cardOverlay} pointerEvents="none" />
                <Text style={styles.formTitle}>
                  {modoRegistro ? 'Nuevo colaborador externo' : 'Participación del colaborador'}
                </Text>

                {!modoRegistro && colaboradorActivo ? (
                  <View style={styles.selectedInfo}>
                    <Text style={styles.selectedName}>{colaboradorActivo.nombre_completo}</Text>
                    <Text style={styles.colaboradorMeta}>CI: {colaboradorActivo.ci}</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.inputLabel}>Cédula (10 dígitos)</Text>
                    <TextInput
                      style={styles.input}
                      value={ciNuevo}
                      onChangeText={(texto) => setCiNuevo(texto.replace(/\D/g, '').slice(0, 10))}
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="1712345675"
                      placeholderTextColor="#8E8E93"
                    />

                    <Text style={styles.inputLabel}>Nombre completo</Text>
                    <TextInput
                      style={styles.input}
                      value={nombreNuevo}
                      onChangeText={setNombreNuevo}
                      maxLength={255}
                      placeholder="Ingrese nombres y apellidos completos"
                      placeholderTextColor="#8E8E93"
                    />
                  </>
                )}

                <Text style={styles.inputLabel}>Participación en el proyecto</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={participacion}
                  onChangeText={setParticipacion}
                  maxLength={255}
                  multiline
                  textAlignVertical="top"
                  placeholder="Investigador, asesor, apoyo en campo..."
                  placeholderTextColor="#8E8E93"
                />

                <TouchableOpacity style={styles.primaryInlineButton} onPress={agregarSeleccion} activeOpacity={0.85}>
                  <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryInlineButtonText}>Agregar a la selección</Text>
                </TouchableOpacity>
              </BlurView>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={cerrar} activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneButton} onPress={confirmarSeleccion} activeOpacity={0.85}>
            <Text style={styles.doneButtonText}>Listo ({seleccionTemporal.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.88)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  glassButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  glassButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  colaboradorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  colaboradorInfo: {
    flex: 1,
  },
  colaboradorNombre: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  colaboradorMeta: {
    color: '#98989F',
    fontSize: 12.5,
    marginTop: 2,
  },
  colaboradorParticipacion: {
    color: '#D1D1D6',
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
  },
  eliminarBtn: {
    padding: 2,
  },
  eliminarBtnBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,69,58,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultadoDisabled: {
    opacity: 0.45,
  },
  resultadoActivo: {
    borderColor: 'rgba(52,199,89,0.65)',
  },
  etiquetaAgregado: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  etiquetaAgregadoText: {
    color: '#8E8E93',
    fontSize: 11.5,
    fontWeight: '600',
  },
  addCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(52,199,89,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSeleccionado: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    minHeight: 118,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    marginBottom: 8,
    padding: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    height: '100%',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(52,199,89,0.45)',
    paddingVertical: 12,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptySearchText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 14,
    marginTop: 8,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  selectedInfo: {
    backgroundColor: 'rgba(52,199,89,0.12)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  selectedName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  inputLabel: {
    color: '#AEAEB2',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  textArea: {
    minHeight: 84,
    paddingTop: 11,
  },
  primaryInlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 14,
  },
  primaryInlineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  doneButton: {
    flex: 1.4,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
