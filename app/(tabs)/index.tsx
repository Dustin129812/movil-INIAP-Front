import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useAuth } from '../../src/hooks';
import { useDeviceInfo } from '../../src/hooks/useDeviceInfo';
import { DynamicIslandNotification } from '../../src/components/ui';

export default function HomeScreen() {
  const { usuario, dispositivoId, cerrarSesion } = useAuth();
  const { nombreDispositivo, modelo, sistemaOperativo, versionSistema } = useDeviceInfo();
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'bienvenida' | 'error' | 'success' | 'despedida'; mensaje: string }>({ tipo: 'despedida', mensaje: '' });

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            setNotificacion({ tipo: 'despedida', mensaje: '' });
            setMostrarNotificacion(true);
            setTimeout(() => {
              setMostrarNotificacion(false);
              cerrarSesion();
            }, 2500);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>INIAP</Text>
          <Text style={styles.subtitle}>Gestión Agrícola</Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeLabel}>Bienvenido</Text>
          <Text style={styles.welcomeName}>{usuario?.NOMBRE || 'Usuario'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Correo</Text>
              <Text style={styles.rowValue}>{usuario?.CORREO || '-'}</Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.rowLabel}>ID</Text>
              <Text style={styles.rowValue}>#{usuario?.ID || '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispositivo</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Dispositivo</Text>
              <Text style={styles.rowValue}>{nombreDispositivo}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Modelo</Text>
              <Text style={styles.rowValue}>{modelo || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Sistema</Text>
              <Text style={styles.rowValue}>{sistemaOperativo} {versionSistema}</Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.rowLabel}>ID Dispositivo</Text>
              <Text style={[styles.rowValue, styles.deviceId]} numberOfLines={1}>
                {dispositivoId ? `${dispositivoId.slice(0, 8)}...` : '-'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleCerrarSesion}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>INIAP v1.0.0</Text>
      </ScrollView>

      <DynamicIslandNotification
        tipo={notificacion.tipo}
        mensaje={notificacion.mensaje}
        visible={mostrarNotificacion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  welcomeCard: {
    backgroundColor: '#34C759',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 16,
    color: '#000',
  },
  rowValue: {
    fontSize: 16,
    color: '#8E8E93',
    maxWidth: '50%',
    textAlign: 'right',
  },
  deviceId: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#C7C7CC',
    fontSize: 13,
    marginTop: 24,
  },
});
