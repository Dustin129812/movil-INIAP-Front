import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../services/ThemeContext';
import CroquisMapaUI from '../../components/lotes/ui/CroquisMapaUI';

export default function LoteDetalleScreen() {
  const { isDark } = useTheme();
  const { edit } = useLocalSearchParams();
  const backgroundColor = isDark ? '#121212' : '#F2F2F7';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CroquisMapaUI editLoteId={edit ? parseInt(edit) : null} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
