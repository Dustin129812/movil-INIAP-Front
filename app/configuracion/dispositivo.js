import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useDeviceInfo } from '../../services/useDeviceInfo';
import { useAuth } from '../../services';
import { useTheme } from '../../services/ThemeContext';

export default function DispositivoInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { deviceInfo } = useDeviceInfo();
  const { nombreDispositivo, modelo, sistemaOperativo, versionSistema, hardware } = deviceInfo;
  const { dispositivoId } = useAuth();

  const copiar = async (valor, etiqueta) => {
    if (!valor) return;
    await Clipboard.setStringAsync(String(valor));
    if (Platform.OS === 'web') {
      window.alert(`${etiqueta} copiado`);
    } else {
      Alert.alert('Copiado', `${etiqueta} copiado al portapapeles`);
    }
  };

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

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Header con botón de volver, estilo Apple Account */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textWhite]}>Dispositivo</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: icono del dispositivo + nombre, igual al patrón del avatar de Apple */}
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

        {/* Grupo: información general */}
        <Text style={[styles.groupTitle, isDark && styles.groupTitleDark]}>General</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <InfoRow label="Dispositivo" value={nombreDispositivo} />
          <InfoRow label="Modelo" value={modelo} />
          <InfoRow label="Sistema" value={`${sistemaOperativo || '-'} ${versionSistema || ''}`.trim()} isLast />
        </View>

        {/* Grupo: identificadores (UUID) */}
        <Text style={[styles.groupTitle, isDark && styles.groupTitleDark]}>Identificadores</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <InfoRow label="Hardware" value={hardware} monospace copyable />
          <InfoRow label="UUID / ID Dispositivo" value={dispositivoId} monospace copyable isLast />
        </View>

        <Text style={[styles.footnote, isDark && styles.footnoteDark]}>
          Este identificador es único para tu dispositivo y se usa para vincular tu sesión de forma segura.
        </Text>
      </ScrollView>
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

  hero: { alignItems: 'center', marginTop: 12, marginBottom: 28 },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
    marginBottom: 14,
  },
  avatarRingDark: { backgroundColor: 'rgba(52, 199, 89, 0.15)' },
  heroName: { fontSize: 22, fontWeight: '700', color: '#000000', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 2 },

  groupTitle: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  groupTitleDark: { color: '#98989F' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardDark: { backgroundColor: '#1E1E24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  rowDark: { borderBottomColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 14, color: '#000000', fontWeight: '500' },
  rowValueWrap: { flexDirection: 'row', alignItems: 'center', maxWidth: '60%' },
  rowValue: { fontSize: 14, color: '#8E8E93', textAlign: 'right' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },

  footnote: { fontSize: 12, color: '#8E8E93', paddingHorizontal: 4, lineHeight: 17 },
  footnoteDark: { color: '#6E6E73' },
});
