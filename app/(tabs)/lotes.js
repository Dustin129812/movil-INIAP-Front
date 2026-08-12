import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../services/ThemeContext';
import LotesDashboardUI from '../../components/lotes/ui/LotesDashboardUI';

export default function LotesScreen() {
  const { isDark } = useTheme();
  const backgroundColor = isDark ? '#000000' : '#F2F2F7';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LotesDashboardUI />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
