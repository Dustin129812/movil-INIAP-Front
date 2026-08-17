// ============================================
// DISPOSITIVO - Informacion del Dispositivo
// ============================================
// Navegacion: app/configuracion/dispositivo.js
// Funcionalidad: Muestra informacion del dispositivo y UUID

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useDeviceInfo } from '../../services/device';
import { useAuth } from '../../services/auth';
import { useTheme } from '../../services/theme';

// --- ESTILOS ---
// Origen: app/styles/dispositivoStyles.js
import { dispositivoStyles as styles } from '../../src/styles/dispositivoStyles';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function DispositivoInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { deviceInfo } = useDeviceInfo();
  const { nombreDispositivo, modelo, sistemaOperativo, versionSistema, hardware } = deviceInfo;
  const { dispositivoId } = useAuth();

  // --- HANDLERS ---
  const copiar = async (valor, etiqueta) => {
    if (!valor) return;
    await Clipboard.setStringAsync(String(valor));
    if (Platform.OS === 'web') {
      window.alert(`${etiqueta} copiado`);
    } else {
      Alert.alert('Copiado', `${etiqueta} copiado al portapapeles`);
    }
  };

  // --- COMPONENTE INTERNO: FILA DE INFO ---
  const InfoRow = ({ label, value, monospace, copyable, isLast }) => (
    <TouchableOpacity
      activeOpacity={copyable ? 0.6 : 1}
      disabled={!copyable}
      onPress={() => copyable && copiar(value, label)}
      style={[styles.row, isDark && styles.rowDark, isLast && styles.lastRow]}
    >
      <Text style={[styles.rowLabel, isDark && styles.textWhite]}>{label}</Text>
      <View style={styles.rowValueWrap}>
        <Text
          style={[styles.rowValue, monospace && styles.mono]}
          numberOfLines={1}
        >
          {value || '-'}
        </Text>
        {copyable && (
          <MaterialCommunityIcons
            name="content-copy"
            size={14}
            color="#8E8E93"
            style={{ marginLeft: 6 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

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
          Dispositivo
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: icono del dispositivo + nombre */}
        <View style={styles.hero}>
          <View style={[styles.avatarRing, isDark && styles.avatarRingDark]}>
            <MaterialCommunityIcons name="cellphone" size={40} color="#34C759" />
          </View>
          <Text style={[styles.heroName, isDark && styles.textWhite]} numberOfLines={1}>
            {nombreDispositivo || 'Mi dispositivo'}
          </Text>
          <Text style={styles.heroSubtitle} numberOfLines={1}>
            {modelo || '-'}
          </Text>
        </View>

        {/* Grupo: informacion general */}
        <Text style={[styles.groupTitle, isDark && styles.groupTitleDark]}>
          General
        </Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <InfoRow label="Dispositivo" value={nombreDispositivo} />
          <InfoRow label="Modelo" value={modelo} />
          <InfoRow
            label="Sistema"
            value={`${sistemaOperativo || '-'} ${versionSistema || ''}`.trim()}
            isLast
          />
        </View>

        {/* Grupo: identificadores (UUID) */}
        <Text style={[styles.groupTitle, isDark && styles.groupTitleDark]}>
          Identificadores
        </Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <InfoRow label="Hardware" value={hardware} monospace copyable />
          <InfoRow
            label="UUID / ID Dispositivo"
            value={dispositivoId}
            monospace
            copyable
            isLast
          />
        </View>

        <Text style={[styles.footnote, isDark && styles.footnoteDark]}>
          Este identificador es único para tu dispositivo y se usa para vincular tu
          sesión de forma segura.
        </Text>
      </ScrollView>
    </View>
  );
}
