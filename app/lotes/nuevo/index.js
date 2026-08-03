import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';
import CroquisMapaUI from '../../../components/lotes/ui/CroquisMapaUI';

export default function NuevoLoteScreen() {
  const { isDark } = useTheme();
  const backgroundColor = isDark ? '#121212' : '#F2F2F7';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <CroquisMapaUI />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
