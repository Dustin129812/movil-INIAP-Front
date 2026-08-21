// ============================================
// NUEVO LOTE - Pantalla de Creacion de Lote
// ============================================
// Navegacion: app/lotes/nuevo/index.js
// Funcionalidad: Permite crear un nuevo lote con croquis y mapa

import React from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAppTheme, useTheme } from '../../../services/theme';
import CroquisMapaUI from '../../../components/lotes/ui/CroquisMapaUI';

// --- ESTILOS ---
// Origen: app/styles/nuevoLoteStyles.js
import { nuevoLoteStyles as styles } from '../../../src/styles/nuevoLoteStyles';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function NuevoLoteScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const backgroundColor = getAppTheme(isDark).background;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Back Button Flotante */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <CroquisMapaUI />
    </View>
  );
}
