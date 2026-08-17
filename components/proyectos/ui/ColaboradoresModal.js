import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  PanResponder,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useColaboradores } from '../../../services/colaboradores';
import { useLocalNotifications } from '../../notifications/hooks/useLocalNotifications';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dimensiones del botón flotante y del panel al que se transforma
const FAB_WIDTH = 224;
const FAB_HEIGHT = 54;
const SHEET_MARGIN_H = 10;
const SHEET_WIDTH = SCREEN_WIDTH - SHEET_MARGIN_H * 2;
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.76, 640);
const SHEET_RADIUS = 30;

// Botón circular "cristal" reutilizable (cerrar, limpiar, etc.)
const GlassIconButton = ({ icon, color = '#FFFFFF', onPress, size = 34, iconSize = 17 }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <BlurView
      intensity={50}
      tint="dark"
      style={[styles.glassButton, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <View style={styles.glassButtonOverlay} pointerEvents="none" />
      <MaterialCommunityIcons name={icon} size={iconSize} color={color} />
    </BlurView>
  </TouchableOpacity>
);

const getInitials = (nombre) => {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
};

const AVATAR_GRADIENTS = [
  ['#0A84FF', '#0059C9'],
  ['#34C759', '#1F8B3B'],
  ['#FF9500', '#C96E00'],
  ['#AF52DE', '#7C2FA6'],
  ['#FF375F', '#C41F42'],
];
const gradientPara = (texto) => {
  const codigo = (texto || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[codigo % AVATAR_GRADIENTS.length];
};

const UsuarioItem = ({ usuario, onEliminar, mostrarEliminar }) => (
  <BlurView intensity={35} tint="dark" style={styles.usuarioItem}>
    <View style={styles.cardOverlay} pointerEvents="none" />
    <LinearGradient colors={gradientPara(usuario.nombre)} style={styles.avatar}>
      <Text style={styles.avatarInitials}>{getInitials(usuario.nombre)}</Text>
    </LinearGradient>
    <View style={styles.usuarioInfo}>
      <Text style={styles.usuarioNombre} numberOfLines={1}>{usuario.nombre}</Text>
      <Text style={styles.usuarioEmail} numberOfLines={1}>{usuario.correo}</Text>
    </View>
    {mostrarEliminar && (
      <TouchableOpacity
        style={styles.eliminarBtn}
        onPress={() => onEliminar(usuario.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.eliminarBtnBg}>
          <MaterialCommunityIcons name="close" size={14} color="#FF453A" />
        </View>
      </TouchableOpacity>
    )}
  </BlurView>
);

const UsuarioSeleccionable = ({ usuario, onSeleccionar, yaEsColaborador, seleccionado }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => !yaEsColaborador && onSeleccionar(usuario)}
    disabled={yaEsColaborador}
  >
    <BlurView
      intensity={35}
      tint="dark"
      style={[
        styles.usuarioItem,
        yaEsColaborador && styles.usuarioItemDisabled,
        seleccionado && styles.usuarioItemSeleccionado,
      ]}
    >
      <View style={styles.cardOverlay} pointerEvents="none" />
      <LinearGradient colors={gradientPara(usuario.nombre)} style={styles.avatar}>
        <Text style={styles.avatarInitials}>{getInitials(usuario.nombre)}</Text>
      </LinearGradient>
      <View style={styles.usuarioInfo}>
        <Text style={styles.usuarioNombre} numberOfLines={1}>{usuario.nombre}</Text>
        <Text style={styles.usuarioEmail} numberOfLines={1}>{usuario.correo}</Text>
      </View>
      {yaEsColaborador ? (
        <View style={styles.etiquetaColaborador}>
          <Text style={styles.textoColaborador}>Ya agregado</Text>
        </View>
      ) : seleccionado ? (
        <View style={styles.checkSeleccionado}>
          <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" />
        </View>
      ) : (
        <View style={styles.addCircle}>
          <MaterialCommunityIcons name="plus" size={16} color="#0A84FF" />
        </View>
      )}
    </BlurView>
  </TouchableOpacity>
);

export default function ColaboradoresModal({ visible, onClose, proyectoId }) {
  const insets = useSafeAreaInsets();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [panelMontado, setPanelMontado] = useState(false);

  const {
    colaboradores,
    isLoading,
    cargarColaboradores,
    agregarColaboradores,
    eliminarColaborador,
    buscarUsuarios,
  } = useColaboradores(proyectoId);

  // Notificaciones
  const { notifyColaboradorAgregado } = useLocalNotifications();

  // --- Animación "genio": el panel nace del botón flotante y se expande ---
  const progreso = useSharedValue(0);
  const contenidoOpacidad = useSharedValue(0);
  const arrastreY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cargarColaboradores();
      setTerminoBusqueda('');
      setResultadosBusqueda([]);
      setSeleccionados([]);
      setPanelMontado(false);
      progreso.value = 0;
      contenidoOpacidad.value = 0;
      arrastreY.value = 0;
    }
  }, [visible, cargarColaboradores]);

  const finalizarCierre = useCallback(() => {
    setPanelMontado(false);
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    setSeleccionados([]);
    arrastreY.value = 0;
  }, [arrastreY]);

  const abrirPanel = useCallback(() => {
    setPanelMontado(true);
    arrastreY.value = 0;
    progreso.value = withTiming(1, { duration: 460, easing: Easing.out(Easing.exp) });
    contenidoOpacidad.value = withDelay(180, withTiming(1, { duration: 240 }));
  }, [progreso, contenidoOpacidad, arrastreY]);

  const cerrarPanel = useCallback(() => {
    Keyboard.dismiss();
    contenidoOpacidad.value = withTiming(0, { duration: 120 });
    arrastreY.value = withTiming(0, { duration: 260 });
    progreso.value = withDelay(
      70,
      withTiming(0, { duration: 340, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(finalizarCierre)();
      })
    );
  }, [progreso, contenidoOpacidad, arrastreY, finalizarCierre]);

  // Gesto de arrastre en la línea horizontal: sube/baja a gusto y suelta para cerrar
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderMove: (_, gestureState) => {
        arrastreY.value = Math.max(0, gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 110 || gestureState.vy > 0.9) {
          cerrarPanel();
        } else {
          arrastreY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
        }
      },
      onPanResponderTerminate: () => {
        arrastreY.value = withTiming(0, { duration: 220 });
      },
    })
  ).current;

  const handleBuscar = useCallback(async (texto) => {
    setTerminoBusqueda(texto);
    if (texto.length < 2) {
      setResultadosBusqueda([]);
      return;
    }

    setBuscando(true);
    try {
      const resultados = await buscarUsuarios(texto);
      setResultadosBusqueda(resultados);
    } finally {
      setBuscando(false);
    }
  }, [buscarUsuarios]);

  const handleSeleccionarUsuario = useCallback((usuario) => {
    setSeleccionados((prev) => {
      const yaExiste = prev.find((u) => u.id === usuario.id);
      if (yaExiste) {
        return prev.filter((u) => u.id !== usuario.id);
      }
      return [...prev, usuario];
    });
  }, []);

  const handleAgregarSeleccionados = useCallback(async () => {
    if (!seleccionados.length) return;

    const userIds = seleccionados.map((u) => u.id);
    const resultado = await agregarColaboradores(userIds);

    if (resultado.success) {
      // Notificar a cada colaborador agregado
      seleccionados.forEach(colab => {
        notifyColaboradorAgregado(colab.nombre || 'Colaborador');
      });
      cerrarPanel();
    } else {
      Alert.alert('Error', resultado.message || 'No se pudieron agregar los colaboradores');
    }
  }, [seleccionados, agregarColaboradores, cerrarPanel, notifyColaboradorAgregado]);

  const handleEliminar = useCallback(async (userId) => {
    Alert.alert(
      'Eliminar Colaborador',
      '¿Estás seguro de que deseas eliminar a este colaborador del proyecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await eliminarColaborador(userId);
          },
        },
      ]
    );
  }, [eliminarColaborador]);

  const renderColaborador = useCallback(({ item }) => (
    <UsuarioItem
      usuario={item}
      onEliminar={handleEliminar}
      mostrarEliminar={true}
    />
  ), [handleEliminar]);

  const renderResultadoBusqueda = useCallback(({ item }) => {
    const yaEsColaborador = colaboradores.some((c) => c.id === item.id);
    const yaSeleccionado = seleccionados.some((s) => s.id === item.id);
    return (
      <UsuarioSeleccionable
        usuario={item}
        onSeleccionar={handleSeleccionarUsuario}
        yaEsColaborador={yaEsColaborador}
        seleccionado={yaSeleccionado}
      />
    );
  }, [colaboradores, seleccionados, handleSeleccionarUsuario]);

  const headerTopPadding = Math.max(insets.top, 16);
  const bottomOffset = insets.bottom + 20;

  // Estilo animado del panel: nace del tamaño y posición del botón flotante,
  // se expande hasta cubrir la mayor parte de la pantalla ("efecto genio"),
  // y responde al arrastre vertical de la línea (drag handle).
  const panelStyle = useAnimatedStyle(() => {
    const scaleX = FAB_WIDTH / SHEET_WIDTH + (1 - FAB_WIDTH / SHEET_WIDTH) * progreso.value;
    const scaleY = FAB_HEIGHT / SHEET_HEIGHT + (1 - FAB_HEIGHT / SHEET_HEIGHT) * progreso.value;
    const translateY = (SHEET_HEIGHT * (1 - scaleY)) / 2 + arrastreY.value;
    const borderRadius = FAB_HEIGHT / 2 + (SHEET_RADIUS - FAB_HEIGHT / 2) * progreso.value;
    const opacidadArrastre = 1 - Math.min(Math.max(arrastreY.value, 0) / (SHEET_HEIGHT * 0.7), 0.55);

    return {
      borderRadius,
      opacity: opacidadArrastre,
      transform: [{ translateY }, { scaleX }, { scaleY }],
    };
  });

  const contenidoStyle = useAnimatedStyle(() => ({
    opacity: contenidoOpacidad.value,
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const base = progreso.value * 0.6;
    const atenuacion = Math.min(Math.max(arrastreY.value, 0) / (SHEET_HEIGHT * 0.7), 1);
    return { opacity: base * (1 - atenuacion) };
  });

  const fabStyle = useAnimatedStyle(() => ({
    opacity: 1 - progreso.value,
    transform: [{ scale: 1 - progreso.value * 0.08 }],
  }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header simple, sin fondo — solo el título flotando */}
        <View style={[styles.header, { paddingTop: headerTopPadding }]}>
          <View style={styles.headerRow}>
            <GlassIconButton icon="close" onPress={onClose} />
            <Text style={styles.headerTitle} numberOfLines={1}>Colaboradores</Text>
            <View style={{ width: 34 }} />
          </View>
        </View>

        {/* Lista principal de colaboradores */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0A84FF" style={{ marginTop: 120 }} />
        ) : colaboradores.length === 0 ? (
          <View style={styles.emptyState}>
            <BlurView intensity={30} tint="dark" style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="account-group-outline" size={40} color="#8E8E93" />
            </BlurView>
            <Text style={styles.emptyText}>No hay colaboradores</Text>
            <Text style={styles.emptySubtext}>Agrega personas a este proyecto</Text>
          </View>
        ) : (
          <FlatList
            data={colaboradores}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderColaborador}
            contentContainerStyle={[
              styles.listContent,
              { paddingTop: headerTopPadding + 68, paddingBottom: bottomOffset + FAB_HEIGHT + 24 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Botón flotante inferior centrado: origen del efecto "genio" */}
        <Animated.View style={[styles.fabWrap, { bottom: bottomOffset }, fabStyle]} pointerEvents={panelMontado ? 'none' : 'auto'}>
          <TouchableOpacity onPress={abrirPanel} activeOpacity={0.85}>
            <BlurView intensity={55} tint="dark" style={styles.fab}>
              <View style={styles.fabOverlay} pointerEvents="none" />
              <MaterialCommunityIcons name="account-plus" size={19} color="#0A84FF" />
              <Text style={styles.fabText}>Agregar colaborador</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* Fondo oscurecido detrás del panel */}
        {panelMontado && (
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={cerrarPanel} />
          </Animated.View>
        )}

        {/* Panel de búsqueda: crece desde el botón flotante */}
        {panelMontado && (
          <Animated.View
            style={[
              styles.panel,
              { bottom: bottomOffset, width: SHEET_WIDTH, height: SHEET_HEIGHT, left: SHEET_MARGIN_H },
              panelStyle,
            ]}
          >
            <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.panelOverlay} pointerEvents="none" />

            <Animated.View style={[styles.panelContent, contenidoStyle]}>
              <View style={styles.dragHandleWrap} {...panResponder.panHandlers}>
                <View style={styles.dragHandle} />
              </View>

              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                  <BlurView intensity={40} tint="dark" style={styles.buscadorContainer}>
                    <View style={styles.cardOverlay} pointerEvents="none" />
                    <MaterialCommunityIcons name="magnify" size={18} color="#8E8E93" style={styles.buscadorIcon} />
                    <TextInput
                      style={styles.buscadorInput}
                      placeholder="Buscar por nombre o email..."
                      placeholderTextColor="#8E8E93"
                      value={terminoBusqueda}
                      onChangeText={handleBuscar}
                      autoFocus
                    />
                    {terminoBusqueda.length > 0 && (
                      <TouchableOpacity onPress={() => { setTerminoBusqueda(''); setResultadosBusqueda([]); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <MaterialCommunityIcons name="close-circle" size={18} color="#8E8E93" />
                      </TouchableOpacity>
                    )}
                  </BlurView>

                  <View style={{ flex: 1 }}>
                    {buscando ? (
                      <ActivityIndicator size="large" color="#0A84FF" style={{ marginTop: 60 }} />
                    ) : resultadosBusqueda.length === 0 && terminoBusqueda.length >= 2 ? (
                      <View style={styles.emptyStatePanel}>
                        <MaterialCommunityIcons name="account-search-outline" size={36} color="#8E8E93" />
                        <Text style={styles.emptyText}>No se encontraron usuarios</Text>
                      </View>
                    ) : resultadosBusqueda.length > 0 ? (
                      <FlatList
                        data={resultadosBusqueda}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderResultadoBusqueda}
                        contentContainerStyle={{ paddingTop: 14, paddingBottom: seleccionados.length > 0 ? 84 : 24 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                      />
                    ) : (
                      <View style={styles.emptyStatePanel}>
                        <MaterialCommunityIcons name="account-search-outline" size={36} color="#8E8E93" />
                        <Text style={styles.emptyText}>Busca usuarios para agregar</Text>
                        <Text style={styles.emptySubtext}>Ingresa al menos 2 caracteres</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableWithoutFeedback>

              {seleccionados.length > 0 && (
                <TouchableOpacity onPress={handleAgregarSeleccionados} activeOpacity={0.85} style={styles.confirmarBtnWrap}>
                  <View style={styles.confirmarBtn}>
                    <Text style={styles.confirmarBtnText}>Agregar ({seleccionados.length})</Text>
                  </View>
                </TouchableOpacity>
              )}
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  /* Header sin fondo, solo el título flotando */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },

  glassButton: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  glassButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* Botón flotante inferior */
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: FAB_HEIGHT,
    width: FAB_WIDTH,
    borderRadius: FAB_HEIGHT / 2,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  fabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Fondo oscurecido detrás del panel */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 25,
  },

  /* Panel que "nace" del botón flotante */
  panel: {
    position: 'absolute',
    zIndex: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 20,
  },
  panelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,22,24,0.4)',
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  dragHandleWrap: {
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  buscadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 4,
  },
  buscadorIcon: {
    marginRight: 8,
  },
  buscadorInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#FFFFFF',
  },

  confirmarBtnWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  confirmarBtn: {
    backgroundColor: '#0A84FF',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  confirmarBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Tarjetas de la lista */
  listContent: {
    paddingHorizontal: 16,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  usuarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  usuarioItemDisabled: {
    opacity: 0.45,
  },
  usuarioItemSeleccionado: {
    borderColor: 'rgba(10,132,255,0.55)',
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
  usuarioInfo: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  usuarioEmail: {
    fontSize: 12.5,
    color: '#98989F',
    marginTop: 2,
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
  etiquetaColaborador: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  textoColaborador: {
    fontSize: 11.5,
    color: '#8E8E93',
    fontWeight: '500',
  },
  addCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(10,132,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSeleccionado: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStatePanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 13.5,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
});