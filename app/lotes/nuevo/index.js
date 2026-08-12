import React from 'react';
import { StyleSheet, View, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../services/ThemeContext';
import CroquisMapaUI from '../../../components/lotes/ui/CroquisMapaUI';

export default function NuevoLoteScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const backgroundColor = isDark ? '#121212' : '#000000';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
